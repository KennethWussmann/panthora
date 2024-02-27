import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "../lib/utils/passwordUtils";
import { defaultApplicationContext } from "../lib/applicationContext";
import { sanitizeEmail } from "../lib/utils/emailUtils";
import { type User } from "../lib/user/user";

export const CustomCredentialsProvider = () =>
  CredentialsProvider({
    id: "password",
    credentials: {
      email: { label: "E-Mail", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials, req): Promise<User | null> {
      const { rateLimitService, userService } = defaultApplicationContext;

      if (!credentials) {
        return null;
      }

      const email = sanitizeEmail(credentials.email);

      const ip = (req.headers?.["x-forwarded-for"] ||
        req.headers?.["remote-addr"]) as string | undefined;

      if (!ip) {
        throw new Error("No IP address found in request");
      }

      const isBlocked = await rateLimitService.isBlockedBySome(
        ["login_failed_by_ip", "login_failed_by_ip_user"],
        ip,
        email
      );

      if (isBlocked) {
        return null;
      }

      try {
        const user = await userService.findUserByEmail(email);

        if (!user) {
          await rateLimitService.consume("login_failed_by_ip", ip);
          return null;
        }

        const isLoggedIn =
          user?.password &&
          credentials &&
          (await verifyPassword(user.password, credentials.password));

        if (!isLoggedIn) {
          await rateLimitService.consume("login_failed_by_ip", ip);
          if (user) {
            await rateLimitService.consume(
              "login_failed_by_ip_user",
              ip,
              email
            );
          }
        } else {
          await rateLimitService.delete("login_failed_by_ip_user", ip, email);
          return {
            id: user.id,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          };
        }
      } catch (error) {
        console.error(error);
      }
      return null;
    },
  });
