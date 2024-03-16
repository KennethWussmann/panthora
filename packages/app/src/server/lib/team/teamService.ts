import {
  type PrismaClient,
  type Team,
  type UserTeamMembership,
  UserTeamMembershipRole,
} from "@prisma/client";
import { type Logger } from "winston";
import { type TeamCreateEditRequest } from "./teamCreateEditRequest";
import { type TeamAddMemberRequest } from "./teamAddMemberRequest";
import { type Member } from "./member";
import { type TeamRemoveMemberRequest } from "./teamRemoveMemberRequest";
import { type TeamListRequest } from "./teamListRequest";
import { sanitizeEmail } from "../utils/emailUtils";
import { add } from "date-fns";
import { type TeamInvite } from "./teamInvite";

export class TeamService {
  constructor(
    private readonly logger: Logger,
    private readonly prisma: PrismaClient
  ) {}

  /**
   * Administrative feature
   * @param listRequest
   * @returns
   */
  public getAllTeams = async (
    listRequest: TeamListRequest = {}
  ): Promise<Team[]> => {
    return await this.prisma.team.findMany({
      orderBy: { createdAt: "desc" },
      take: listRequest.limit,
      skip: listRequest.offset,
    });
  };

  updateTeam = async (userId: string, updateRequest: TeamCreateEditRequest) => {
    if (!updateRequest.teamId) {
      this.logger.error("Update request did not have a team id", {
        updateRequest,
        userId,
      });
      throw new Error("Team id required");
    }

    await this.requireTeamMembershipAdmin(userId, updateRequest.teamId);

    this.logger.info("Updating team", { userId, updateRequest });
    await this.prisma.team.update({
      where: {
        id: updateRequest.teamId,
      },
      data: {
        name: updateRequest.name,
      },
    });
    this.logger.info("Updated team", {
      userId,
      teamId: updateRequest.teamId,
    });
  };

  public getById = async (teamId: string) =>
    this.prisma.team.findUnique({
      where: {
        id: teamId,
      },
    });

  public getUserTeam = async (userId: string, teamId: string) => {
    await this.requireTeamMembership(userId, teamId);
    return await this.prisma.team.findUnique({
      where: {
        id: teamId,
      },
    });
  };

  isTeamMember = async (userId: string, teamId: string): Promise<boolean> => {
    return (
      (await this.prisma.team.count({
        where: {
          id: teamId,
          teamMemberships: {
            some: {
              userId,
            },
          },
        },
      })) > 0
    );
  };

  private hasTeamMembershipRole = async (
    userId: string,
    teamId: string,
    role: UserTeamMembershipRole
  ): Promise<boolean> => {
    return (
      (await this.prisma.team.count({
        where: {
          id: teamId,
          teamMemberships: {
            some: {
              userId,
              role,
            },
          },
        },
      })) > 0
    );
  };

  private getTeamMembership = (
    userId: string,
    teamId: string
  ): Promise<UserTeamMembership | null> =>
    this.prisma.userTeamMembership.findFirst({
      where: {
        teamId,
        userId,
      },
    });

  public getUserMembership = async (
    userId: string,
    teamId: string
  ): Promise<UserTeamMembership> => {
    await this.requireTeamMembership(userId, teamId);
    const membership = await this.prisma.userTeamMembership.findFirst({
      where: {
        teamId,
        userId,
      },
    });
    if (!membership) {
      throw new Error("Team membership not found");
    }
    return membership;
  };

  getMembers = async (userId: string, teamId: string): Promise<Member[]> => {
    await this.requireTeamMembershipAdmin(userId, teamId);
    const users = await this.prisma.userTeamMembership.findMany({
      where: {
        teamId,
      },
      include: {
        user: true,
      },
      orderBy: {
        user: {
          email: "asc",
        },
      },
    });

    return users.map((u) => ({
      id: u.userId,
      email: u.user.email!,
      role: u.role,
    }));
  };

  requireTeamMembershipRole = async (
    userId: string,
    teamId: string,
    role: UserTeamMembershipRole
  ) => {
    if (!(await this.hasTeamMembershipRole(userId, teamId, role))) {
      this.logger.error(
        "User is not a member of required team or does not have required role",
        {
          userId,
          teamId,
          role,
        }
      );
      throw new Error("Team not found");
    }
  };

  requireTeamMembershipAdmin = async (userId: string, teamId: string) => {
    const membership = await this.getTeamMembership(userId, teamId);

    if (!membership) {
      this.logger.error("User is not a member of required team nor admin", {
        userId,
        teamId,
      });
      throw new Error("Team not found");
    }

    if (
      membership.role !== UserTeamMembershipRole.ADMIN &&
      membership.role !== UserTeamMembershipRole.OWNER
    ) {
      this.logger.error("User is not an admin of required team", {
        userId,
        teamId,
      });
      throw new Error("Team not found");
    }
  };

  removeTeamMember = async (userId: string, input: TeamRemoveMemberRequest) => {
    this.logger.info("Removing team member", { userId, input });

    await this.requireTeamMembershipAdmin(userId, input.teamId);
    const userToRemove = await this.prisma.user.findUnique({
      where: {
        email: input.email,
      },
    });

    if (!userToRemove) {
      this.logger.error("User not found", { userId, input });
      throw new Error("User not found");
    }
    await this.requireTeamMembership(userToRemove.id, input.teamId);

    const ownMembership = await this.getTeamMembership(userId, input.teamId);
    const membership = await this.getTeamMembership(
      userToRemove.id,
      input.teamId
    );

    if (!membership) {
      this.logger.error("User is not a member of the team", {
        userId,
        input,
      });
      throw new Error("User not found");
    }

    if (membership.role === UserTeamMembershipRole.OWNER) {
      this.logger.error("Team ownership cannot be transferred", {
        userId,
        input,
      });
      throw new Error("Owners cannot be removed");
    }

    if (
      membership.role === UserTeamMembershipRole.ADMIN &&
      ownMembership?.role !== UserTeamMembershipRole.OWNER
    ) {
      this.logger.error("Admin tried to remove another admin", {
        userId,
        input,
      });
      throw new Error("Insufficient permission");
    }

    if (userToRemove.id === userId) {
      this.logger.error("User cannot remove themselves from the team", {
        userId,
        input,
      });
      throw new Error("You cannot remove yourself from the team");
    }

    await this.prisma.userTeamMembership.delete({
      where: {
        userId_teamId: {
          teamId: input.teamId,
          userId: userToRemove.id,
        },
      },
    });
    this.logger.info("Removed team member", { userId, input });
  };

  private createTeamInvite = async (
    userId: string,
    input: TeamAddMemberRequest
  ) => {
    this.logger.info("Inviting team member", { userId, input });

    await this.requireTeamMembershipAdmin(userId, input.teamId);

    await this.prisma.teamInvite.create({
      data: {
        email: sanitizeEmail(input.email),
        teamId: input.teamId,
        role: input.role,
        fromUserId: userId,
        expires: add(new Date(), { hours: 48 }),
      },
    });
  };

  private removeExpiredTeamInvites = async () => {
    await this.prisma.teamInvite.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    });
  };

  getTeamInvitesOfTeam = async (
    userId: string,
    teamId: string
  ): Promise<TeamInvite[]> => {
    await this.requireTeamMembershipAdmin(userId, teamId);

    const invites = await this.prisma.teamInvite.findMany({
      where: {
        teamId,
        expires: {
          gte: new Date(),
        },
      },
      include: {
        from: true,
        team: true,
      },
    });

    await this.removeExpiredTeamInvites();

    return invites.map((i) => ({
      id: i.id,
      teamName: i.team.name,
      expires: i.expires,
      role: i.role,
      invitedByEmail: i.from?.email ?? "",
      invitedEmail: i.email,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    }));
  };

  removeTeamInvite = async (userId: string, inviteId: string) => {
    this.logger.info("Removing team invite", { userId, inviteId });

    const invite = await this.prisma.teamInvite.findUnique({
      where: {
        id: inviteId,
      },
    });

    if (!invite) {
      this.logger.error("Invite not found", { userId, inviteId });
      throw new Error("Invite not found");
    }

    await this.requireTeamMembershipAdmin(userId, invite.teamId);

    if (
      invite.role === UserTeamMembershipRole.ADMIN ||
      invite.role === UserTeamMembershipRole.OWNER
    ) {
      // Only owners can remove invites for admins and owners
      await this.requireTeamMembershipRole(
        userId,
        invite.teamId,
        UserTeamMembershipRole.OWNER
      );
    }

    await this.prisma.teamInvite.delete({
      where: {
        id: inviteId,
      },
    });

    this.logger.info("Removed team invite", { userId, inviteId });
  };

  getTeamInvites = async (userId: string): Promise<TeamInvite[]> => {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user?.email) {
      this.logger.error("User not found", { userId });
      throw new Error("User not found");
    }

    const invites = await this.prisma.teamInvite.findMany({
      where: {
        email: sanitizeEmail(user.email),
        expires: {
          gte: new Date(),
        },
      },
      include: {
        team: true,
        from: true,
      },
    });

    await this.removeExpiredTeamInvites();

    return invites.map((i) => ({
      id: i.id,
      teamName: i.team.name,
      expires: i.expires,
      role: i.role,
      invitedByEmail: i.from?.email ?? "",
      invitedEmail: i.email,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
    }));
  };

  acceptTeamInvite = async (userId: string, inviteId: string) => {
    this.logger.info("Accepting team invite", { userId, inviteId });

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user?.email) {
      this.logger.error("User not found", { userId });
      throw new Error("User not found");
    }

    const invite = await this.prisma.teamInvite.findUnique({
      where: {
        id: inviteId,
        email: sanitizeEmail(user.email),
        expires: {
          gte: new Date(),
        },
      },
    });

    if (!invite) {
      this.logger.error("Invite not found", { userId, inviteId });
      throw new Error("Invite not found");
    }

    const currentMembership = await this.prisma.userTeamMembership.findFirst({
      where: {
        teamId: invite.teamId,
        userId,
      },
    });

    if (currentMembership) {
      await this.prisma.teamInvite.delete({
        where: {
          id: inviteId,
        },
      });
      this.logger.error("User is already a member of the team", {
        userId,
        inviteId,
      });
      throw new Error("User is already a member of the team");
    }

    await this.prisma.$transaction([
      this.prisma.userTeamMembership.create({
        data: {
          teamId: invite.teamId,
          userId,
          role: invite.role,
        },
      }),
      this.prisma.teamInvite.delete({
        where: {
          id: inviteId,
        },
      }),
    ]);

    this.logger.info("Accepted team invite", { userId, inviteId });
  };

  declineTeamInvite = async (userId: string, inviteId: string) => {
    this.logger.info("Declining team invite", { userId, inviteId });

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user?.email) {
      this.logger.error("User not found", { userId });
      throw new Error("User not found");
    }

    const invite = await this.prisma.teamInvite.findUnique({
      where: {
        id: inviteId,
        email: sanitizeEmail(user.email),
      },
    });

    if (!invite) {
      this.logger.info("Invite to decline did not exist", { userId, inviteId });
      return;
    }

    await this.prisma.teamInvite.delete({
      where: {
        id: inviteId,
      },
    });

    this.logger.info("Declined team invite", { userId, inviteId });
  };

  leaveTeam = async (userId: string, teamId: string) => {
    this.logger.info("Leaving team", { userId, teamId });

    await this.requireTeamMembership(userId, teamId);

    const membership = await this.getTeamMembership(userId, teamId);

    if (!membership) {
      this.logger.error("User is not a member of the team", { userId, teamId });
      throw new Error("Team not found");
    }

    if (membership.role === UserTeamMembershipRole.OWNER) {
      this.logger.error("Owner cannot leave team", { userId, teamId });
      throw new Error("Owner cannot leave team");
    }

    await this.prisma.userTeamMembership.delete({
      where: {
        userId_teamId: {
          teamId,
          userId,
        },
      },
    });

    this.logger.info("User left team", { userId, teamId });
  };

  addTeamMember = async (userId: string, input: TeamAddMemberRequest) => {
    this.logger.info("Adding team member", { userId, input });

    await this.requireTeamMembershipAdmin(userId, input.teamId);

    if (input.role === UserTeamMembershipRole.OWNER) {
      this.logger.error("Team ownership cannot be transferred", {
        userId,
        input,
      });
      throw new Error("Team ownership cannot be transferred");
    }

    if (input.role === UserTeamMembershipRole.ADMIN) {
      // Only owners can add/promote admins
      await this.requireTeamMembershipRole(
        userId,
        input.teamId,
        UserTeamMembershipRole.OWNER
      );
    }

    const userToAdd = await this.prisma.user.findUnique({
      where: {
        email: input.email,
      },
    });

    const currentMembership = userToAdd
      ? await this.getTeamMembership(userToAdd.id, input.teamId)
      : undefined;

    if (currentMembership) {
      if (currentMembership.role === input.role) {
        this.logger.error("User is already a member of the team", {
          userId,
          input,
        });
        throw new Error("User is already member of team with that role");
      }

      if (
        currentMembership.role === UserTeamMembershipRole.ADMIN &&
        input.role === UserTeamMembershipRole.MEMBER
      ) {
        // Only owners can demote admins
        await this.requireTeamMembershipRole(
          userId,
          input.teamId,
          UserTeamMembershipRole.OWNER
        );
      }

      if (currentMembership.role === UserTeamMembershipRole.OWNER) {
        // Only owners can demote admins
        this.logger.error("User tried to modify owner role", {
          userId,
          input,
        });
        throw new Error("Owners cannot be modified");
      }
      await this.prisma.userTeamMembership.update({
        where: {
          userId_teamId: {
            teamId: currentMembership.teamId,
            userId: currentMembership.userId,
          },
        },
        data: {
          role: input.role,
        },
      });
      this.logger.info("Updated membership role", { userId, input });
      return { roleUpdated: true, inviteSent: false };
    } else {
      await this.createTeamInvite(userId, input);
      this.logger.info("Created team invite", { userId, input });
      return { roleUpdated: false, inviteSent: true };
    }
  };

  public requireTeamMembership = async (userId: string, teamId: string) => {
    if (!(await this.isTeamMember(userId, teamId))) {
      this.logger.error("User is not a member of required team", {
        userId,
        teamId,
      });
      throw new Error("Team not found");
    }
  };

  public getTeams = async (userId: string, role?: UserTeamMembershipRole) => {
    return this.prisma.team.findMany({
      where: {
        teamMemberships: {
          some: {
            userId,
            role,
          },
        },
      },
    });
  };
}
