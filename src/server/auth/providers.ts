import { type Provider } from "next-auth/providers";
import { env } from "~/env.mjs";
import CognitoProvider from "next-auth/providers/cognito";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { CustomCredentialsProvider } from "./customCredentialsProvider";

type EnvConfig = typeof env;
type NonUndefinedEnv<T extends keyof EnvConfig> = {
  [P in T]: Exclude<EnvConfig[P], undefined>;
};

type ProviderInitializer<T extends keyof EnvConfig> = (
  validatedEnv: NonUndefinedEnv<T>
) => Provider;

const validateEnv = <T extends keyof EnvConfig>(
  requiredKeys: T[]
): NonUndefinedEnv<T> | null => {
  const isConfigured = requiredKeys.every((key) => env[key] !== undefined);
  if (!isConfigured) return null;

  return requiredKeys.reduce((acc, key) => {
    acc[key] = env[key] as NonUndefinedEnv<T>[T];
    return acc;
  }, {} as NonUndefinedEnv<T>);
};

const initializeProvider = <T extends keyof EnvConfig>(
  requiredKeys: T[],
  initializer: ProviderInitializer<T>
): Provider | null => {
  const validatedEnv = validateEnv(requiredKeys);
  if (!validatedEnv) return null;

  return initializer(validatedEnv);
};

export const providers: Provider[] = [
  initializeProvider(
    ["COGNITO_CLIENT_ID", "COGNITO_CLIENT_SECRET", "COGNITO_ISSUER"],
    (validatedEnv) =>
      CognitoProvider({
        clientId: validatedEnv.COGNITO_CLIENT_ID,
        clientSecret: validatedEnv.COGNITO_CLIENT_SECRET,
        issuer: validatedEnv.COGNITO_ISSUER,
        httpOptions: {
          timeout: 30000,
        },
      })
  ),
  initializeProvider(
    ["DISCORD_CLIENT_ID", "DISCORD_CLIENT_SECRET"],
    (validatedEnv) =>
      DiscordProvider({
        clientId: validatedEnv.DISCORD_CLIENT_ID,
        clientSecret: validatedEnv.DISCORD_CLIENT_SECRET,
      })
  ),
  initializeProvider(
    ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    (validatedEnv) =>
      GoogleProvider({
        clientId: validatedEnv.GOOGLE_CLIENT_ID,
        clientSecret: validatedEnv.GOOGLE_CLIENT_SECRET,
      })
  ),
  initializeProvider(
    ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"],
    (validatedEnv) =>
      GitHubProvider({
        clientId: validatedEnv.GITHUB_CLIENT_ID,
        clientSecret: validatedEnv.GITHUB_CLIENT_SECRET,
      })
  ),
  env.PASSWORD_AUTH_ENABLED ? CustomCredentialsProvider() : null,
].filter((provider): provider is Provider => provider !== null);
