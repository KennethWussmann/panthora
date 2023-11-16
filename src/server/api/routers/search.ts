import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { rebuildSearchIndexesRequest } from "~/server/lib/search/rebuildSearchIndexesRequest";

export const searchRouter = createTRPCRouter({
  rebuildIndexes: protectedProcedure
    .input(rebuildSearchIndexesRequest)
    .mutation(async ({ ctx, input: { teamId } }) => {
      try {
        return await ctx.applicationContext.searchService.rebuildIndexesByUser(
          ctx.session.user.id,
          teamId
        );
      } catch {
        return undefined;
      }
    }),
});
