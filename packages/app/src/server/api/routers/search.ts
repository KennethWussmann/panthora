import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { getFailedSearchIndexTasks } from "@/server/lib/search/getFailedSearchTasks";
import { rebuildSearchIndexesRequest } from "@/server/lib/search/rebuildSearchIndexesRequest";
import { searchRequest } from "@/server/lib/search/searchRequest";

export const searchRouter = createTRPCRouter({
  rebuildIndexes: protectedProcedure
    .input(rebuildSearchIndexesRequest)
    .mutation(async ({ ctx, input: { teamId } }) => {
      return await ctx.applicationContext.searchService.rebuildIndexesByUser(
        ctx.session.user.id,
        teamId
      );
    }),
  tasks: protectedProcedure
    .input(getFailedSearchIndexTasks)
    .query(async ({ ctx, input: { teamId } }) => {
      return ctx.applicationContext.searchService.getTasks(
        ctx.session.user.id,
        teamId
      );
    }),
  search: protectedProcedure
    .input(searchRequest)
    .query(async ({ ctx, input }) => {
      return ctx.applicationContext.searchService.search(
        ctx.session.user.id,
        input
      );
    }),
});
