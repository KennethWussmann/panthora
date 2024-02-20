import { type PrismaClient } from "@prisma/client";
import { type Logger } from "winston";
import { type TeamService } from "./team/teamService";

export class StatsService {
  constructor(
    private readonly logger: Logger,
    private readonly prisma: PrismaClient,
    private readonly teamService: TeamService
  ) {}

  public getStats = async (userId: string, teamId: string) => {
    await this.teamService.requireTeamMembership(userId, teamId);
    const team = await this.prisma.team.findUnique({
      where: {
        id: teamId,
      },
      include: {
        assets: true,
        assetTypes: true,
        tags: true,
      },
    });

    if (!team) {
      this.logger.error("Team not found", { teamId, userId });
      throw new Error("Team not found");
    }

    return {
      assets: team.assets.length,
      assetTypes: team.assetTypes.length,
      tags: team.tags.length,
    };
  };
}
