import { createTRPCRouter } from "~/server/api/trpc";
import { tagRouter } from "./routers/tag";
import { assetRouter } from "./routers/asset";
import { assetTypeRouter } from "./routers/assetType";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  tag: tagRouter,
  asset: assetRouter,
  assetType: assetTypeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
