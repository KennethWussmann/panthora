import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    VERSION: z.string().default("develop"),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      (str) => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include `https` so it cant be validated as a URL
      process.env.VERCEL ? z.string() : z.string().url()
    ),
    APP_BASE_URL: z.string().url(),
    MEILI_URL: z.string().url(),
    MEILI_MASTER_KEY: z.string(),
    DISABLE_RATE_LIMIT: z
      .string()
      .optional()
      .default("false")
      .transform((val) => val?.toLowerCase() === "true"),

    PASSWORD_AUTH_ENABLED: z
      .string()
      .optional()
      .default("false")
      .transform((val) => val?.toLowerCase() === "true"),

    OAUTH_CLIENT_ID: z.string().optional(),
    OAUTH_CLIENT_SECRET: z.string().optional(),
    OAUTH_ISSUER: z.string().optional(),
    OAUTH_ACCESS_TOKEN_URL: z.string().optional(),
    OAUTH_AUTHORIZATION_URL: z.string().optional(),
    OAUTH_PROFILE_URL: z.string().optional(),

    COGNITO_CLIENT_ID: z.string().optional(),
    COGNITO_CLIENT_SECRET: z.string().optional(),
    COGNITO_ISSUER: z.string().optional(),

    DISCORD_CLIENT_ID: z.string().optional(),
    DISCORD_CLIENT_SECRET: z.string().optional(),

    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),

    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(),

    AUTHENTIK_CLIENT_ID: z.string().optional(),
    AUTHENTIK_CLIENT_SECRET: z.string().optional(),
    AUTHENTIK_ISSUER: z.string().optional(),

    AUTH0_CLIENT_ID: z.string().optional(),
    AUTH0_CLIENT_SECRET: z.string().optional(),
    AUTH0_ISSUER: z.string().optional(),

    GITLAB_CLIENT_ID: z.string().optional(),
    GITLAB_CLIENT_SECRET: z.string().optional(),

    AZURE_AD_CLIENT_ID: z.string().optional(),
    AZURE_AD_CLIENT_SECRET: z.string().optional(),
    AZURE_AD_TENANT_ID: z.string().optional(),

    KEYCLOAK_CLIENT_ID: z.string().optional(),
    KEYCLOAK_CLIENT_SECRET: z.string().optional(),
    KEYCLOAK_ISSUER: z.string().optional(),

    OKTA_CLIENT_ID: z.string().optional(),
    OKTA_CLIENT_SECRET: z.string().optional(),
    OKTA_ISSUER: z.string().optional(),

    ONELOGIN_CLIENT_ID: z.string().optional(),
    ONELOGIN_CLIENT_SECRET: z.string().optional(),
    ONELOGIN_ISSUER: z.string().optional(),

    SLACK_CLIENT_ID: z.string().optional(),
    SLACK_CLIENT_SECRET: z.string().optional(),

    TWITCH_CLIENT_ID: z.string().optional(),
    TWITCH_CLIENT_SECRET: z.string().optional(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    VERSION: process.env.VERSION,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    APP_BASE_URL: process.env.APP_BASE_URL,
    MEILI_URL: process.env.MEILI_URL,
    MEILI_MASTER_KEY: process.env.MEILI_MASTER_KEY,
    DISABLE_RATE_LIMIT: process.env.DISABLE_RATE_LIMIT,

    OAUTH_CLIENT_ID: process.env.OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET: process.env.OAUTH_CLIENT_SECRET,
    OAUTH_ISSUER: process.env.OAUTH_ISSUER,
    OAUTH_ACCESS_TOKEN_URL: process.env.OAUTH_ACCESS_TOKEN_URL,
    OAUTH_AUTHORIZATION_URL: process.env.OAUTH_AUTHORIZATION_URL,
    OAUTH_PROFILE_URL: process.env.OAUTH_PROFILE_URL,

    COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID,
    COGNITO_CLIENT_SECRET: process.env.COGNITO_CLIENT_SECRET,
    COGNITO_ISSUER: process.env.COGNITO_ISSUER,

    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,

    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,

    AUTHENTIK_CLIENT_ID: process.env.AUTHENTIK_CLIENT_ID,
    AUTHENTIK_CLIENT_SECRET: process.env.AUTHENTIK_CLIENT_SECRET,
    AUTHENTIK_ISSUER: process.env.AUTHENTIK_ISSUER,

    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,
    AUTH0_ISSUER: process.env.AUTH0_ISSUER,

    GITLAB_CLIENT_ID: process.env.GITLAB_CLIENT_ID,
    GITLAB_CLIENT_SECRET: process.env.GITLAB_CLIENT_SECRET,

    AZURE_AD_CLIENT_ID: process.env.AZURE_AD_CLIENT_ID,
    AZURE_AD_CLIENT_SECRET: process.env.AZURE_AD_CLIENT_SECRET,
    AZURE_AD_TENANT_ID: process.env.AZURE_AD_TENANT_ID,

    KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID,
    KEYCLOAK_CLIENT_SECRET: process.env.KEYCLOAK_CLIENT_SECRET,
    KEYCLOAK_ISSUER: process.env.KEYCLOAK_ISSUER,

    OKTA_CLIENT_ID: process.env.OKTA_CLIENT_ID,
    OKTA_CLIENT_SECRET: process.env.OKTA_CLIENT_SECRET,
    OKTA_ISSUER: process.env.OKTA_ISSUER,

    ONELOGIN_CLIENT_ID: process.env.ONELOGIN_CLIENT_ID,
    ONELOGIN_CLIENT_SECRET: process.env.ONELOGIN_CLIENT_SECRET,
    ONELOGIN_ISSUER: process.env.ONELOGIN_ISSUER,

    SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID,
    SLACK_CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET,

    TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID,
    TWITCH_CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET,

    PASSWORD_AUTH_ENABLED: process.env.PASSWORD_AUTH_ENABLED,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
