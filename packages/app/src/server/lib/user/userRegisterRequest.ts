import { z } from "zod";

export const userRegisterRequest = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type UserRegisterRequest = z.infer<typeof userRegisterRequest>;
