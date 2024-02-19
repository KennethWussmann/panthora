import type MeiliSearch from "meilisearch";

export const waitForTasks = async (
  meiliSearch: MeiliSearch,
  promises: Promise<{ taskUid: number }>[]
) => {
  await meiliSearch.waitForTasks(
    (await Promise.all(promises)).map((response) => response.taskUid),
    {
      timeOutMs: 1000,
    }
  );
};
