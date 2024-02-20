import {
  type PrismaClient,
  UserTeamMembershipRole,
  type Team,
} from "@prisma/client";
import { type Logger } from "winston";
import { type SearchService } from "../search/searchService";
import { type TeamCreateEditRequest } from "./teamCreateEditRequest";

/**
 * Service for creating teams.
 * Mainly to resolve circular dependencies.
 */
export class TeamCreationService {
  constructor(
    private readonly logger: Logger,
    private readonly prisma: PrismaClient,
    private readonly searchService: SearchService
  ) {}

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
    await this.searchService.initializeIndexes([team.id]);

    return team;
  };
}
