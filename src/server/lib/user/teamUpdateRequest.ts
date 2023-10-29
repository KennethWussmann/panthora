import { z } from "zod";

export const teamUpdateRequest = z.object({
  teamId: z.string(),
  name: z.string().min(1).max(255),
});

export type TeamUpdateRequest = z.infer<typeof teamUpdateRequest>;
