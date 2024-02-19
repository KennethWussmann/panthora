import { UserRole, type PrismaClient } from "@prisma/client";
import { type Logger } from "winston";
import { type TeamService } from "./teamService";
import { type UserRegisterRequest } from "./userRegisterRequest";
import { sanitizeEmail, validateEmail } from "../utils/emailUtils";
import { hashPassword } from "../utils/passwordUtils";
import { type RateLimitService } from "./rateLimitService";
import { type User } from "./user";
import { type UserListRequest } from "./userListRequest";

export class UserService {
  constructor(
    private readonly logger: Logger,
    private readonly prisma: PrismaClient,
    private readonly teamService: TeamService,
    private readonly rateLimitService: RateLimitService
  ) {}

  /**
   * Administrative feature
   * @param listRequest
   * @returns
   */
  public getAllUsers = async (
    listRequest: UserListRequest
  ): Promise<User[]> => {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { email: "asc" },
      take: listRequest.limit,
      skip: listRequest.offset,
    });
  };

  public register = async (
    remoteAddress: string,
    request: UserRegisterRequest
  ): Promise<User> => {
    const { email, password } = request;
    const sanitizedEmail = sanitizeEmail(email);
    const exists = await this.prisma.user.count({
      where: { email: sanitizedEmail },
    });
    const totalUserCount = await this.prisma.user.count();

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
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      data: {
        email: sanitizedEmail,
        password: await hashPassword(password),
        role: totalUserCount === 0 ? UserRole.ADMIN : UserRole.USER,
      },
    });
    this.logger.info("New user registered", {
      id: user.id,
      email: request.email,
      role: user.role,
    });
    return user;
  };

  public getMe = async (userId: string): Promise<User> => {
    const user = await this.prisma.user.findUnique({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      where: { id: userId },
    });
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  };
}
