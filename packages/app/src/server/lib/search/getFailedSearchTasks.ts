import { z } from "zod";

export const getFailedSearchIndexTasks = z.object({
  teamId: z.string(),
});

export type GetFailedSearchIndexTasks = z.infer<
  typeof getFailedSearchIndexTasks
>;

type SearchTaskType =
  | "documentAdditionOrUpdate"
  | "documentDeletion"
  | "dumpCreation"
  | "indexCreation"
  | "indexDeletion"
  | "indexSwap"
  | "indexUpdate"
  | "settingsUpdate"
  | "snapshotCreation"
  | "taskCancelation"
  | "taskDeletion";

type SearchTaskStatus =
  | "succeeded"
  | "processing"
  | "failed"
  | "enqueued"
  | "canceled";

export type SearchTask = {
  enqueuedAt: Date;
  indexUid: string | undefined;
  type: SearchTaskType;
  status: SearchTaskStatus;
  errorMessage: string | undefined;
};
