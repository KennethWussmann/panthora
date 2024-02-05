import {
  type PrismaClient,
  type Team,
  type UserTeamMembership,
  UserTeamMembershipRole,
} from "@prisma/client";
import { type Logger } from "winston";
import { type TeamCreateEditRequest } from "./teamCreateEditRequest";
import { type TeamAddMemberRequest } from "./teamAddMemberRequest";

export class TeamService {
  constructor(
    private readonly logger: Logger,
    private readonly prisma: PrismaClient
  ) {}

  updateTeam = async (userId: string, updateRequest: TeamCreateEditRequest) => {
    if (!updateRequest.teamId) {
      this.logger.error("Update request did not have a team id", {
        updateRequest,
        userId,
      });
      throw new Error("Team id required");
    }

    this.logger.info("Updating team", { userId, updateRequest });

    await this.requireTeamMembership(userId, updateRequest.teamId);
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

  createTeam = async (
    userId: string,
    createRequest: TeamCreateEditRequest
  ): Promise<Team> => {
    this.logger.info("Creating team", { userId, createRequest });

    const team = await this.prisma.team.create({
      data: {
        name: createRequest.name,
      },
    });
    this.logger.info("Created team", {
      userId,
      teamId: team.id,
    });

    await this.prisma.userTeamMembership.create({
      data: {
        userId,
        teamId: team.id,
        role: UserTeamMembershipRole.OWNER,
      },
    });
    this.logger.info("Added user as Owner to new team", {
      userId,
      teamId: team.id,
    });

    await this.initializeTeam(team);

    return team;
  };

  /**
   * Create default entities for a new team
   * @param team
   */
  private initializeTeam = async (team: Team) => {
    const template = await this.prisma.labelTemplate.create({
      data: {
        teamId: team.id,
        default: true,
        name: "Default",
      },
    });
    this.logger.info("Created default label template for new team", {
      teamId: team.id,
      labelTemplateId: template.id,
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

  // private getTeamMemberships = async (
  //   userId: string,
  //   teamId: string
  // ): Promise<UserTeamMembership[]> => {
  //   await this.requireTeamMembershipAdmin(userId, teamId);
  //   return await this.prisma.userTeamMembership.findMany({
  //     where: {
  //       teamId,
  //     },
  //   });
  // };

  getMembers = async (userId: string, teamId: string) => {
    await this.requireTeamMembershipAdmin(userId, teamId);
    const users = await this.prisma.userTeamMembership.findMany({
      where: {
        teamId,
      },
      include: {
        user: true,
      },
    });

    return users.map((u) => ({
      email: u.user.email,
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

    const currentMembership = await this.getTeamMembership(
      input.memberId,
      input.teamId
    );

    if (currentMembership && currentMembership.role === input.role) {
      this.logger.error("User is already a member of the team", {
        userId,
        input,
      });
      throw new Error("User is already member of team with that role");
    }

    if (currentMembership) {
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
    } else {
      await this.prisma.userTeamMembership.create({
        data: {
          userId: input.memberId,
          teamId: input.teamId,
          role: input.role,
        },
      });
      this.logger.info("Added team member", { userId, input });
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

  public getTeams = async (userId: string) => {
    return this.prisma.team.findMany({
      where: {
        teamMemberships: {
          some: {
            userId,
          },
        },
      },
    });
  };

  public getAllTeams = async () => this.prisma.team.findMany();
}
