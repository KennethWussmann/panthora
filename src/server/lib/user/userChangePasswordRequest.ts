import { z } from "zod";

export const userChangePasswordRequest = z.object({
  oldPassword: z.string().nullable().default(null),
  newPassword: z.string(),
});

export type UserChangePasswordRequest = z.infer<
  typeof userChangePasswordRequest
>;
