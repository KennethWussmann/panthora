import { PrismaClient } from "@prisma/client";
import { TeamUpdateRequest } from "./teamUpdateRequest";
import { Logger } from "winston";

export class UserService {
  constructor(
    private readonly logger: Logger,
    private readonly prisma: PrismaClient
  ) {}

  public initialize = async (userId: string) => {
    const existingTeams = await this.getTeams(userId);
    this.logger.debug(
      `Found ${existingTeams.length} teams for user ${userId}`,
      { existingTeams }
    );
    if (existingTeams.length === 0) {
      // create a default team
      // we dont want full blown team support yet, but having one team with every user in it makes it easier to implement later.
      this.logger.info("Creating initial team");
      const team = await this.prisma.team.create({
        data: {
          name: "My Team",
        },
      });
      this.logger.info("Assigning user to initial team", {
        teamId: team.id,
        userId,
      });
      await this.prisma.userTeamMembership.create({
        data: {
          userId,
          teamId: team.id,
        },
      });
    } else if (
      existingTeams.length === 1 &&
      existingTeams[0]?.teamMemberships?.some(
        (membership) => membership.userId === userId
      ) === false
    ) {
      this.logger.info("Assigning user to existing team", {
        teamId: existingTeams[0].id,
        userId,
      });
      // add the user to the one existing team
      await this.prisma.userTeamMembership.create({
        data: {
          userId,
          teamId: existingTeams[0]!.id,
        },
      });
    }
  };

  public getTeams = async (_userId: string) => {
    // Currently we only support multiple users that are all automatically in the same team.
    // We can add full team support later, by allowing users to invite other users to their team.
    return this.prisma.team.findMany({
      include: {
        teamMemberships: true,
      },
    });
  };

  public getDefaultTeam = async (userId: string) => {
    const team = await this.prisma.team.findFirst({
      where: {
        teamMemberships: {
          some: {
            userId,
          },
        },
      },
    });

    if (!team) {
      throw new Error("No default team found");
    }

    return team;
  };

  public isTeamMember = async (
    userId: string,
    teamId: string
  ): Promise<boolean> => {
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

  public requireTeamMembership = async (userId: string, teamId: string) => {
    if (!(await this.isTeamMember(userId, teamId))) {
      this.logger.error("User is not a member of required team", {
        userId,
        teamId,
      });
      throw new Error("Team not found");
    }
  };

  public updateTeam = async (userId: string, input: TeamUpdateRequest) => {
    await this.requireTeamMembership(userId, input.teamId);

    await this.prisma.team.update({
      where: {
        id: input.teamId,
      },
      data: {
        name: input.name,
      },
    });
    this.logger.info("Updated team", {
      userId,
      teamId: input.teamId,
    });
  };
}
