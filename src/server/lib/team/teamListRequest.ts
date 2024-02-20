import { z } from "zod";

export const teamListRequest = z.object({
  limit: z.number().optional(),
  offset: z.number().optional(),
});
export type TeamListRequest = z.infer<typeof teamListRequest>;
