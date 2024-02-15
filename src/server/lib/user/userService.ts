import { type PrismaClient } from "@prisma/client";
import { type Logger } from "winston";
import { type TeamService } from "./teamService";
import { type UserRegisterRequest } from "./userRegisterRequest";
import { sanitizeEmail, validateEmail } from "../utils/emailUtils";
import { hashPassword } from "../utils/passwordUtils";
import { type RateLimitService } from "./rateLimitService";

export class UserService {
  constructor(
    private readonly logger: Logger,
    private readonly prisma: PrismaClient,
    private readonly teamService: TeamService,
    private readonly rateLimitService: RateLimitService
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

  public register = async (
    remoteAddress: string,
    request: UserRegisterRequest
  ) => {
    const { email, password } = request;
    const sanitizedEmail = sanitizeEmail(email);
    const exists = await this.prisma.user.count({
      where: { email: sanitizedEmail },
    });

    const isBlocked = await this.rateLimitService.isBlockedBySome(
      ["register_failed", "register_success"],
      remoteAddress
    );

    if (isBlocked) {
      this.logger.error("Failed to register account: Rate limit exceeded", {
        remoteAddress,
        email,
      });
      throw new Error("Something went wrong");
    }

    if (exists > 0) {
      await this.rateLimitService.consume("register_failed", remoteAddress);
      throw new Error("User already exists");
    }
    if (!validateEmail(sanitizedEmail)) {
      await this.rateLimitService.consume("register_failed", remoteAddress);
      throw new Error("Invalid email address");
    }
    if (password.length < 8) {
      await this.rateLimitService.consume("register_failed", remoteAddress);
      throw new Error("Password must be at least 8 characters long");
    }
    if (password.length > 255) {
      await this.rateLimitService.consume("register_failed", remoteAddress);
      throw new Error("Password must be at most 255 characters long");
    }
    this.logger.info("Registering new user", { email: request.email });
    await this.rateLimitService.consume("register_success", remoteAddress);
    const user = await this.prisma.user.create({
      data: {
        email: sanitizedEmail,
        password: await hashPassword(password),
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
