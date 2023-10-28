import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { tagCreateRequest } from "~/server/lib/tags/tagCreateRequest";
import { tagDeleteRequest } from "~/server/lib/tags/tagDeleteRequest";
import { tagListRequest } from "~/server/lib/tags/tagListRequest";

export const tagRouter = createTRPCRouter({
  create: protectedProcedure
    .input(tagCreateRequest)
    .mutation(async ({ ctx, input }) => {
      return ctx.applicationContext.tagService.createTag(input);
    }),
  delete: protectedProcedure
    .input(tagDeleteRequest)
    .mutation(async ({ ctx, input }) => {
      return ctx.applicationContext.tagService.deleteTag(input);
    }),
  list: protectedProcedure
    .input(tagListRequest)
    .query(async ({ ctx, input }) => {
      return ctx.applicationContext.tagService.getTags(input);
    }),
});
