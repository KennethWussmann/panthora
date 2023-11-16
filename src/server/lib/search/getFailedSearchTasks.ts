import { z } from "zod";

export const getFailedSearchIndexTasks = z.object({
  teamId: z.string(),
});

export type GetFailedSearchIndexTasks = z.infer<
  typeof getFailedSearchIndexTasks
>;
