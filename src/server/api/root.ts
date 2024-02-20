import { createTRPCRouter } from "~/server/api/trpc";
import { tagRouter } from "./routers/tag";
import { assetRouter } from "./routers/asset";
import { assetTypeRouter } from "./routers/assetType";
import { teamRouter } from "./routers/team";
import { searchRouter } from "./routers/search";
import { labelTemplateRouter } from "./routers/labelTemplate";
import { statsRouter } from "./routers/stats";
import { userRouter } from "./routers/user";
import { serverRouter } from "./routers/server";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  tag: tagRouter,
  asset: assetRouter,
  assetType: assetTypeRouter,
  team: teamRouter,
  search: searchRouter,
  labelTemplate: labelTemplateRouter,
  stats: statsRouter,
  user: userRouter,
  server: serverRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
