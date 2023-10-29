import { PrismaClient } from "@prisma/client";
import { TeamUpdateRequest } from "./teamUpdateRequest";

export class UserService {
  constructor(private readonly prisma: PrismaClient) {}

  public initialize = async (userId: string) => {
    const existingTeams = await this.getTeams(userId);
    if (existingTeams.length === 0) {
      // create a default team
      // we dont want full blown team support yet, but having one team with every user in it makes it easier to implement later.
      const team = await this.prisma.team.create({
        data: {
          name: "My Team",
        },
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

    console.log("Updated Team");
  };
}
