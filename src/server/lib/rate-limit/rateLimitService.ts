import { type Pool } from "pg";
import {
  type IRateLimiterPostgresOptions,
  RateLimiterPostgres,
  type ICallbackReady,
  RateLimiterRes,
} from "rate-limiter-flexible";
import { type Logger } from "winston";
import { sha512 } from "../utils/sha512";
import { env } from "~/env.mjs";

const rateLimitTypes = [
  "request",
  "register_failed",
  "register_success",
  "login_failed_by_ip",
  "login_failed_by_ip_user",
] as const;
export type RateLimitType = (typeof rateLimitTypes)[number];

type RateLimitKeyType = "ip" | "ip_user" | "user";

const rateLimitKeyTypes: Record<RateLimitType, RateLimitKeyType> = {
  request: "ip",
  register_failed: "ip",
  register_success: "ip",
  login_failed_by_ip: "ip",
  login_failed_by_ip_user: "ip_user",
};

const rateLimitBlockDurations: Record<
  RateLimitType,
  Required<Pick<IRateLimiterPostgresOptions, "points" | "duration">> &
    Pick<IRateLimiterPostgresOptions, "blockDuration">
> = {
  login_failed_by_ip: {
    points: 100,
    duration: 60 * 60 * 24,
    blockDuration: 60 * 60 * 24, // Block for 1 day, if 100 wrong attempts per day
  },
  login_failed_by_ip_user: {
    points: 10,
    duration: 60 * 60 * 24 * 90, // Store number for 90 days since first fail
    blockDuration: 60 * 60, // Block for 1 hour
  },
  register_success: {
    points: 5,
    duration: 60 * 60 * 24,
    blockDuration: 60 * 60 * 24, // Block for 1 day, if 5 accounts registered per day
  },
  register_failed: {
    points: 100,
    duration: 60 * 60 * 24,
    blockDuration: 60 * 60 * 24, // Block for 1 day, if 100 wrong attempts per day
  },
  request: {
    points: 500,
    duration: 60,
  },
};

export class RateLimitService {
  private rateLimiter: Record<RateLimitType, RateLimiterPostgres>;

  constructor(private readonly logger: Logger, readonly pool: Pool) {
    const options: IRateLimiterPostgresOptions = {
      storeClient: pool,
      storeType: "pool",
      tableName: "RateLimit",
      tableCreated: true,
    };
    const onReady: (type: RateLimitType) => ICallbackReady =
      (type) => (error: Error | undefined) => {
        if (error) {
          logger.error(`RateLimiter ${type} failed to initialize`, error);
        }
      };

    this.rateLimiter = Object.fromEntries(
      rateLimitTypes.map((type) => [
        type,
        new RateLimiterPostgres(
          {
            ...options,
            ...rateLimitBlockDurations[type],
            keyPrefix: type,
          },
          onReady(type)
        ),
      ])
    ) as Record<RateLimitType, RateLimiterPostgres>;
  }

  private getKey = (
    type: RateLimitType,
    remoteAddress: string,
    userId?: string
  ): string => {
    const keyType = rateLimitKeyTypes[type];
    switch (keyType) {
      case "ip":
        return sha512(remoteAddress);
      case "ip_user":
        return `${userId}/${sha512(remoteAddress)}`;
      case "user":
        if (!userId) {
          this.logger.error("User id is required for user rate limit", {
            type,
            remoteAddress,
            userId,
          });
          throw new Error("Rate limit exceeded");
        }
        return userId;
      default:
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _: never = keyType;
    }
    throw new Error("Rate limit exceeded");
  };

  consume = async (
    type: RateLimitType,
    remoteAddress: string,
    userId?: string
  ) => {
    if (env.DISABLE_RATE_LIMIT) {
      return;
    }
    try {
      await this.rateLimiter[type].consume(
        this.getKey(type, remoteAddress, userId),
        1
      );
    } catch (e) {
      if (e instanceof RateLimiterRes) {
        this.logger.info(`Rate limit ${type} exceeded`, {
          error: e,
          remoteAddress,
          type,
        });
      } else if (
        e instanceof Error &&
        "code" in e &&
        e.code === "ECONNREFUSED"
      ) {
        this.logger.error(
          "Failed to connect rate-limit service with database!",
          {
            error: e,
            type,
          }
        );
      } else {
        this.logger.error(`Unexpected error during rate-limit check`, {
          error: e,
          remoteAddress,
          type,
        });
      }

      throw new Error(`Rate limit ${type} exceeded`);
    }
  };

  delete = async (
    type: RateLimitType,
    remoteAddress: string,
    userId?: string
  ) => {
    if (env.DISABLE_RATE_LIMIT) {
      return;
    }
    return await this.rateLimiter[type].delete(
      this.getKey(type, remoteAddress, userId)
    );
  };

  get = async (type: RateLimitType, remoteAddress: string, userId?: string) => {
    if (env.DISABLE_RATE_LIMIT) {
      return;
    }
    return await this.rateLimiter[type].get(
      this.getKey(type, remoteAddress, userId)
    );
  };

  isBlocked = async (
    type: RateLimitType,
    remoteAddress: string,
    userId?: string
  ): Promise<boolean> => {
    if (env.DISABLE_RATE_LIMIT) {
      return false;
    }
    const res = await this.get(type, remoteAddress, userId);
    const limit = rateLimitBlockDurations[type].points;
    return !!res && res.consumedPoints >= limit;
  };

  isBlockedBySome = async (
    types: RateLimitType[],
    remoteAddress: string,
    userId?: string
  ): Promise<boolean> => {
    if (env.DISABLE_RATE_LIMIT) {
      return false;
    }
    const results = await Promise.all(
      types.map((type) => this.isBlocked(type, remoteAddress, userId))
    );
    return results.some((result) => result);
  };
}
