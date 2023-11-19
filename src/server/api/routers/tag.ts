import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { tagCreateEditRequest } from "~/server/lib/tags/tagCreateEditRequest";
import { tagDeleteRequest } from "~/server/lib/tags/tagDeleteRequest";
import { tagListRequest } from "~/server/lib/tags/tagListRequest";

export const tagRouter = createTRPCRouter({
  create: protectedProcedure
    .input(tagCreateEditRequest)
    .mutation(async ({ ctx, input }) => {
      return ctx.applicationContext.tagService.createTag(
        ctx.session.user.id,
        input
      );
    }),
  update: protectedProcedure
    .input(tagCreateEditRequest)
    .mutation(async ({ ctx, input }) => {
      return ctx.applicationContext.tagService.updateTag(
        ctx.session.user.id,
        input
      );
    }),
  get: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return ctx.applicationContext.tagService.getById(
      ctx.session.user.id,
      input
    );
  }),
  delete: protectedProcedure
    .input(tagDeleteRequest)
    .mutation(async ({ ctx, input }) => {
      return ctx.applicationContext.tagService.deleteTag(
        ctx.session.user.id,
        input
      );
    }),
  list: protectedProcedure
    .input(tagListRequest)
    .query(async ({ ctx, input }) => {
      return ctx.applicationContext.tagService.getTags(
        ctx.session.user.id,
        input
      );
    }),
});
