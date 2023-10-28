import { z } from "zod";

export const listRequest = z.object({
  teamId: z.string(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});
