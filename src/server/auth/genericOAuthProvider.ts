import { type OAuthConfig, type Provider } from "next-auth/providers";
import { z } from "zod";
import { env } from "~/env.mjs";

type GenericOAuthProviderOptions = Pick<
  OAuthConfig<unknown>,
  "clientId" | "clientSecret" | "authorization" | "token"
>;

const createProfileSchema = () => {
  let schema = z.object({});

  if (process.env.GENERIC_OAUTH_PROFILE_ID_KEY) {
    schema = schema.extend({
      [process.env.GENERIC_OAUTH_PROFILE_ID_KEY]: z.string(),
    });
  }
  if (process.env.GENERIC_OAUTH_PROFILE_NAME_KEY) {
    schema = schema.extend({
      [process.env.GENERIC_OAUTH_PROFILE_NAME_KEY]: z.string().optional(),
    });
  }
  if (process.env.GENERIC_OAUTH_PROFILE_EMAIL_KEY) {
    schema = schema.extend({
      [process.env.GENERIC_OAUTH_PROFILE_EMAIL_KEY]: z
        .string()
        .email()
        .optional(),
    });
  }
  if (process.env.GENERIC_OAUTH_PROFILE_IMAGE_KEY) {
    schema = schema.extend({
      [process.env.GENERIC_OAUTH_PROFILE_IMAGE_KEY]: z
        .string()
        .url()
        .optional(),
    });
  }

  return schema;
};

export const GenericOAuthProvider: (
  options: OAuthConfig<GenericOAuthProviderProfile>
) => Provider = <T>(options: GenericOAuthProviderOptions) => ({
  id: "kakao",
  name: "Kakao",
  type: "oauth",
  authorization: "https://kauth.kakao.com/oauth/authorize",
  token: "https://kauth.kakao.com/oauth/token",
  userinfo: "https://kapi.kakao.com/v2/user/me",
  profile(profile) {
    return {
      id: profile[env.GENERIC_OAUTH_PROFILE_ID_KEY ?? "id"],
      name: profile[env.GENERIC_OAUTH_PROFILE_NAME_KEY ?? "name"],
      email: profile[env.GENERIC_OAUTH_PROFILE_EMAIL_KEY ?? "email"],
      image: profile[env.GENERIC_OAUTH_PROFILE_IMAGE_KEY ?? "picture"],
    };
  },
  ...options,
});
