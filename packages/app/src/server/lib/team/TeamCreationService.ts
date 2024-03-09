import {
  type PrismaClient,
  UserTeamMembershipRole,
  type Team,
} from "@prisma/client";
import { type Logger } from "winston";
import { type SearchService } from "../search/searchService";
import { type TeamCreateEditRequest } from "./teamCreateEditRequest";
import { env } from "@/env.mjs";
import { readFile } from "fs/promises";
import { type ImportService } from "../import/importService";

/**
 * Service for creating teams.
 * Mainly to resolve circular dependencies.
 */
export class TeamCreationService {
  constructor(
    private readonly logger: Logger,
    private readonly prisma: PrismaClient,
    private readonly searchService: SearchService,
    private readonly importService: ImportService
  ) {}

  /**
   * Create default entities for a new team
   * @param team
   */
  private initializeTeam = async (userId: string, team: Team) => {
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
    await this.importDemoContent(userId, team);
  };

  private importDemoContent = async (userId: string, team: Team) => {
    if (!env.DEMO_MODE || !env.DEMO_TEAM_BOOTSTRAP_FILE) {
      return;
    }
    const data = await readFile(env.DEMO_TEAM_BOOTSTRAP_FILE, "utf-8");

    try {
      await this.importService.importJSON(userId, {
        teamId: team.id,
        data,
      });

      this.logger.info("Imported demo content", {
        teamId: team.id,
        demoContent: env.DEMO_TEAM_BOOTSTRAP_FILE,
      });
    } catch (e: unknown) {
      console.error(e);
      this.logger.error("Error importing demo content", {
        teamId: team.id,
        demoContent: env.DEMO_TEAM_BOOTSTRAP_FILE,
        error: e,
      });
    }
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

    await this.initializeTeam(userId, team);
    await this.searchService.initializeIndexes([team.id]);

    return team;
  };
}
