import { z } from "zod";

export const searchRequest = z.object({
  teamId: z.string(),
  query: z.string(),
});

export type SearchRequest = z.infer<typeof searchRequest>;
