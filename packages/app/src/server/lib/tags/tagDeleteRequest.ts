import { z } from "zod";

export const tagDeleteRequest = z.object({
  teamId: z.string(),
  id: z.string().optional(),
});

export type TagDeleteRequest = z.infer<typeof tagDeleteRequest>;
