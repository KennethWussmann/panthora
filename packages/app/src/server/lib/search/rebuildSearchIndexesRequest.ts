import { z } from "zod";

export const rebuildSearchIndexesRequest = z.object({
  teamId: z.string(),
});

export type RebuildSearchIndexesRequest = z.infer<
  typeof rebuildSearchIndexesRequest
>;
