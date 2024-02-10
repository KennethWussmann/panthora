import { z } from "zod";

export const teamCreateEditRequest = z.object({
  teamId: z.string().nullable().default(null),
  name: z.string().min(1).max(255),
});

export type TeamCreateEditRequest = z.infer<typeof teamCreateEditRequest>;
