import { type PrismaClient, UserTeamMembershipRole } from "@prisma/client";
import { type TeamService } from "./teamService";
import { type Logger } from "winston";
import { type SearchService } from "../search/searchService";

/**
 * Service for deleting teams.
 * Mainly to resolve circular dependencies.
 */
export class TeamDeletionService {
  constructor(
    private readonly logger: Logger,
    private readonly prisma: PrismaClient,
    private readonly teamService: TeamService,
    private readonly searchService: SearchService
  ) {}

  deleteTeam = async (userId: string, teamId: string) => {
    await this.teamService.requireTeamMembershipRole(
      userId,
      teamId,
      UserTeamMembershipRole.OWNER
    );

    const ownedTeams = await this.teamService.getTeams(
      userId,
      UserTeamMembershipRole.OWNER
    );

    if (ownedTeams.length === 1) {
      this.logger.error("User cannot delete last team", { userId, teamId });
      throw new Error(
        "You cannot delete your last team. Create another one first and delete this one afterwards."
      );
    }

    this.logger.info("Deleting team", { userId, teamId });
    await this.prisma.team.delete({
      where: {
        id: teamId,
      },
      include: {
        teamMemberships: true,
        assets: true,
        customFields: {
          include: {
            fieldValue: true,
          },
        },
        assetTypes: true,
        tags: true,
        labelTemplates: true,
      },
    });
    void this.searchService.deleteIndexes(teamId);
    this.logger.info("Deleted team", { userId, teamId });
  };
}
