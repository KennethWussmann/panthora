import { type PrismaClient } from "@prisma/client";
import { type Logger } from "winston";
import { type TeamService } from "./teamService";

export class UserService {
  constructor(
    private readonly logger: Logger,
    private readonly prisma: PrismaClient,
    private readonly teamService: TeamService
  ) {}

  public initialize = async (userId: string) => {
    const existingTeams = await this.teamService.getTeams(userId);
    this.logger.debug(
      `Found ${existingTeams.length} teams for user ${userId}`,
      { existingTeams }
    );
    if (existingTeams.length === 0) {
      // create a default team
      // we dont want full blown team support yet, but having one team with every user in it makes it easier to implement later.
      this.logger.info("Creating initial team for new user", { userId });
      await this.teamService.createTeam(userId, {
        name: "My Team",
        teamId: null,
      });
    }
  };
}
