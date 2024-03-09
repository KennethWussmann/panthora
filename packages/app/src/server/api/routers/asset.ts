import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { assetCreateEditRequest } from "@/server/lib/assets/assetCreateEditRequest";
import { assetDeleteRequest } from "@/server/lib/assets/assetDeleteRequest";
import { assetListRequest } from "@/server/lib/assets/assetListRequest";

export const assetRouter = createTRPCRouter({
  create: protectedProcedure
    .input(assetCreateEditRequest)
    .mutation(async ({ ctx, input }) => {
      return ctx.applicationContext.assetService.createAsset(
        ctx.session.user.id,
        input
      );
    }),
  update: protectedProcedure
    .input(assetCreateEditRequest)
    .mutation(({ ctx, input }) => {
      return ctx.applicationContext.assetService.updateAsset(
        ctx.session.user.id,
        input
      );
    }),
  delete: protectedProcedure
    .input(assetDeleteRequest)
    .mutation(({ ctx, input }) => {
      return ctx.applicationContext.assetService.deleteAsset(
        ctx.session.user.id,
        input
      );
    }),
  list: protectedProcedure
    .input(assetListRequest)
    .query(async ({ ctx, input }) => {
      return ctx.applicationContext.assetService.getAssets(
        ctx.session.user.id,
        input
      );
    }),
  get: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return ctx.applicationContext.assetService.getById(
      ctx.session.user.id,
      input
    );
  }),
});
