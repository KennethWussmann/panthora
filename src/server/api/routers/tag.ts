import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { tagCreateRequest } from "~/server/lib/tags/tagCreateRequest";
import { tagListRequest } from "~/server/lib/tags/tagListRequest";

export const tagRouter = createTRPCRouter({
  create: protectedProcedure
    .input(tagCreateRequest)
    .mutation(async ({ ctx, input }) => {
      return ctx.applicationContext.tagService.createTag(input);
    }),
  list: protectedProcedure
    .input(tagListRequest)
    .mutation(async ({ ctx, input }) => {
      return ctx.applicationContext.tagService.getTags(input);
    }),
});
