import { type OAuthConfig, type OAuthProvider } from "next-auth/providers";
import { z } from "zod";

export const GenericOAuthProvider: OAuthProvider = (
  options: Partial<OAuthConfig<unknown>> &
    Pick<
      OAuthConfig<unknown>,
      "accessTokenUrl" | "profileUrl" | "clientId" | "clientSecret"
    >
) => {
  return {
    id: "generic-oauth",
    name: "SSO",
    type: "oauth",
    version: "2.0",
    scope: "email",
    params: { grant_type: "authorization_code" },
    allowDangerousEmailAccountLinking: false,
    checks: ["pkce", "state"],
    profile: (profile) => {
      return z
        .object({
          id: z.string(),
          email: z.string(),
        })
        .parse(profile);
    },
    ...options,
  };
};
