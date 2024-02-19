import { z } from "zod";

export const userListRequest = z.object({
  limit: z.number().optional(),
  offset: z.number().optional(),
});

export type UserListRequest = z.infer<typeof userListRequest>;
