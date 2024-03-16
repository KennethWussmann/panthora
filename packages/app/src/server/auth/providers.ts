import { type Provider } from "next-auth/providers";
import { env } from "@/env.mjs";
import AuthentikProvider from "next-auth/providers/authentik";
import CognitoProvider from "next-auth/providers/cognito";
import DiscordProvider from "next-auth/providers/discord";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import Auth0Provider from "next-auth/providers/auth0";
import AzureADProvider from "next-auth/providers/azure-ad";
import GitLabProvider from "next-auth/providers/gitlab";
import KeycloakProvider from "next-auth/providers/keycloak";
import OktaProvider from "next-auth/providers/okta";
import OneLoginProvider from "next-auth/providers/onelogin";
import SlackProvider from "next-auth/providers/slack";
import TwitchProvider from "next-auth/providers/twitch";
import { CustomCredentialsProvider } from "./customCredentialsProvider";
import { GenericOAuthProvider } from "./genericOAuthProvider";

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
  env.PASSWORD_AUTH_ENABLED ? CustomCredentialsProvider() : null,
  initializeProvider(
    ["OAUTH_CLIENT_ID", "OAUTH_CLIENT_SECRET"],
    (validatedEnv) =>
      GenericOAuthProvider({
        clientId: validatedEnv.OAUTH_CLIENT_ID,
        clientSecret: validatedEnv.OAUTH_CLIENT_SECRET,
        issuer: env.OAUTH_ISSUER,
        accessTokenUrl: env.OAUTH_ACCESS_TOKEN_URL,
        profileUrl: env.OAUTH_PROFILE_URL,
        authorization: env.OAUTH_AUTHORIZATION_URL
          ? {
              url: env.OAUTH_AUTHORIZATION_URL,
              params: { response_type: "code" },
            }
          : undefined,
        httpOptions: {
          timeout: 30000,
        },
      })
  ),
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
        httpOptions: {
          timeout: 30000,
        },
      })
  ),
  initializeProvider(
    ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    (validatedEnv) =>
      GoogleProvider({
        clientId: validatedEnv.GOOGLE_CLIENT_ID,
        clientSecret: validatedEnv.GOOGLE_CLIENT_SECRET,
        httpOptions: {
          timeout: 30000,
        },
      })
  ),
  initializeProvider(
    ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"],
    (validatedEnv) =>
      GitHubProvider({
        clientId: validatedEnv.GITHUB_CLIENT_ID,
        clientSecret: validatedEnv.GITHUB_CLIENT_SECRET,
        httpOptions: {
          timeout: 30000,
        },
      })
  ),
  initializeProvider(
    ["AUTHENTIK_CLIENT_ID", "AUTHENTIK_CLIENT_SECRET", "AUTHENTIK_ISSUER"],
    (validatedEnv) =>
      AuthentikProvider({
        clientId: validatedEnv.AUTHENTIK_CLIENT_ID,
        clientSecret: validatedEnv.AUTHENTIK_CLIENT_SECRET,
        issuer: validatedEnv.AUTHENTIK_ISSUER,
      })
  ),
  initializeProvider(
    ["AUTH0_CLIENT_ID", "AUTH0_CLIENT_SECRET", "AUTH0_ISSUER"],
    (validatedEnv) =>
      Auth0Provider({
        clientId: validatedEnv.AUTH0_CLIENT_ID,
        clientSecret: validatedEnv.AUTH0_CLIENT_SECRET,
        issuer: validatedEnv.AUTH0_ISSUER,
      })
  ),
  initializeProvider(
    ["AZURE_AD_CLIENT_ID", "AZURE_AD_CLIENT_SECRET", "AZURE_AD_TENANT_ID"],
    (validatedEnv) =>
      AzureADProvider({
        clientId: validatedEnv.AZURE_AD_CLIENT_ID,
        clientSecret: validatedEnv.AZURE_AD_CLIENT_SECRET,
        tenantId: validatedEnv.AZURE_AD_TENANT_ID,
      })
  ),
  initializeProvider(
    ["GITLAB_CLIENT_ID", "GITLAB_CLIENT_SECRET"],
    (validatedEnv) =>
      GitLabProvider({
        clientId: validatedEnv.GITLAB_CLIENT_ID,
        clientSecret: validatedEnv.GITLAB_CLIENT_SECRET,
      })
  ),
  initializeProvider(
    ["KEYCLOAK_CLIENT_ID", "KEYCLOAK_CLIENT_SECRET", "KEYCLOAK_ISSUER"],
    (validatedEnv) =>
      KeycloakProvider({
        clientId: validatedEnv.KEYCLOAK_CLIENT_ID,
        clientSecret: validatedEnv.KEYCLOAK_CLIENT_SECRET,
        issuer: validatedEnv.KEYCLOAK_ISSUER,
      })
  ),
  initializeProvider(
    ["OKTA_CLIENT_ID", "OKTA_CLIENT_SECRET", "OKTA_ISSUER"],
    (validatedEnv) =>
      OktaProvider({
        clientId: validatedEnv.OKTA_CLIENT_ID,
        clientSecret: validatedEnv.OKTA_CLIENT_SECRET,
        issuer: validatedEnv.OKTA_ISSUER,
      })
  ),
  initializeProvider(
    ["ONELOGIN_CLIENT_ID", "ONELOGIN_CLIENT_SECRET", "ONELOGIN_ISSUER"],
    (validatedEnv) =>
      OneLoginProvider({
        clientId: validatedEnv.ONELOGIN_CLIENT_ID,
        clientSecret: validatedEnv.ONELOGIN_CLIENT_SECRET,
        issuer: validatedEnv.ONELOGIN_ISSUER,
      })
  ),
  initializeProvider(
    ["SLACK_CLIENT_ID", "SLACK_CLIENT_SECRET"],
    (validatedEnv) =>
      SlackProvider({
        clientId: validatedEnv.SLACK_CLIENT_ID,
        clientSecret: validatedEnv.SLACK_CLIENT_SECRET,
      })
  ),
  initializeProvider(
    ["TWITCH_CLIENT_ID", "TWITCH_CLIENT_SECRET"],
    (validatedEnv) =>
      TwitchProvider({
        clientId: validatedEnv.TWITCH_CLIENT_ID,
        clientSecret: validatedEnv.TWITCH_CLIENT_SECRET,
      })
  ),
].filter((provider): provider is Provider => provider !== null);
