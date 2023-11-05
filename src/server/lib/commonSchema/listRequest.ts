import { z } from "zod";

export const listRequest = z.object({
  teamId: z.string(),
  parentsOnly: z.boolean().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});
