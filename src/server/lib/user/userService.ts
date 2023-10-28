import { PrismaClient } from "@prisma/client";

export class UserService {
  constructor(
    private readonly prisma: PrismaClient,
  ) {}

  public initialize = async (userId: string) => {
    const existingTeams = await this.getTeams(userId);
    if (existingTeams.length === 0) {
      // create a default team
      // we dont want full blown team support yet, but having a team for every user makes it easier to implement later.
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
}
