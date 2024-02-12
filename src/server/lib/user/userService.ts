import { type PrismaClient } from "@prisma/client";
import { type Logger } from "winston";
import { type TeamService } from "./teamService";
import { type UserRegisterRequest } from "./userRegisterRequest";
import bcrypt from "bcrypt";

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

  public register = async (request: UserRegisterRequest) => {
    const { email, password } = request;
    const sanitizedEmail = email.toLowerCase().trim();
    const exists = await this.prisma.user.count({
      where: { email: sanitizedEmail },
    });
    if (exists > 0) {
      throw new Error("User already exists");
    }
    this.logger.info("Registering new user", { email: request.email });
    const user = await this.prisma.user.create({
      data: {
        email: sanitizedEmail,
        password: await bcrypt.hash(password, 12),
      },
    });
    await this.initialize(user.id);
    this.logger.info("New user registered", {
      id: user.id,
      email: request.email,
    });
    return { id: user.id, email };
  };
}
