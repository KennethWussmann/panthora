import { UserRole, type PrismaClient } from "@prisma/client";
import { type Logger } from "winston";
import { type TeamService } from "../team/teamService";
import { type UserRegisterRequest } from "./userRegisterRequest";
import { sanitizeEmail, validateEmail } from "../utils/emailUtils";
import { hashPassword, verifyPassword } from "../utils/passwordUtils";
import { type RateLimitService } from "../rate-limit/rateLimitService";
import { type UserMe, type User } from "./user";
import { type UserListRequest } from "./userListRequest";
import { type UserChangePasswordRequest } from "./userChangePasswordRequest";
import { env } from "~/env.mjs";

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
      orderBy: { createdAt: "desc" },
      take: listRequest.limit,
      skip: listRequest.offset,
    });
  };

  public changePassword = async (
    userId: string,
    input: UserChangePasswordRequest
  ) => {
    const { oldPassword, newPassword } = input;
    if (newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }
    if (newPassword.length > 255) {
      throw new Error("Password must be at most 255 characters long");
    }
    const user = await this.prisma.user.findUnique({
      select: {
        id: true,
        password: true,
      },
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.password) {
      if (!oldPassword || oldPassword.length === 0) {
        throw new Error("Old password is required");
      }
      if (!(await verifyPassword(user.password, oldPassword))) {
        throw new Error("Old password is incorrect");
      }
    } else if (oldPassword) {
      throw new Error("Old password is not required");
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: await hashPassword(newPassword),
      },
    });

    this.logger.info("Changed user password", {
      id: user.id,
    });
  };

  public register = async (
    remoteAddress: string,
    request: UserRegisterRequest
  ): Promise<User> => {
    const isDemoMode = env.DEMO_MODE;
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
        role:
          totalUserCount === 0 && !isDemoMode ? UserRole.ADMIN : UserRole.USER,
      },
    });
    this.logger.info("New user registered", {
      id: user.id,
      email: request.email,
      role: user.role,
    });
    return user;
  };

  public getMe = async (userId: string): Promise<UserMe> => {
    const user = await this.prisma.user.findUnique({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        password: true,
        accounts: {
          select: {
            provider: true,
            type: true,
          },
        },
      },
      where: { id: userId },
    });
    if (!user) {
      throw new Error("User not found");
    }
    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      hasPassword: !!password,
    };
  };
}
