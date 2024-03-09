import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { assetTypeCreateEditRequest } from "@/server/lib/asset-types/assetTypeCreateEditRequest";
import { assetTypeDeleteRequest } from "@/server/lib/asset-types/assetTypeDeleteRequest";
import { assetTypeListRequest } from "@/server/lib/asset-types/assetTypeListRequest";

export const assetTypeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(assetTypeCreateEditRequest)
    .mutation(async ({ ctx, input }) => {
      return ctx.applicationContext.assetTypeService.createAssetType(
        ctx.session.user.id,
        input
      );
    }),
  update: protectedProcedure
    .input(assetTypeCreateEditRequest)
    .mutation(async ({ ctx, input }) => {
      return ctx.applicationContext.assetTypeService.updateAssetType(
        ctx.session.user.id,
        input
      );
    }),
  delete: protectedProcedure
    .input(assetTypeDeleteRequest)
    .mutation(async ({ ctx, input }) => {
      return ctx.applicationContext.assetTypeService.deleteAssetType(
        ctx.session.user.id,
        input
      );
    }),
  get: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return ctx.applicationContext.assetTypeService.getById(
      ctx.session.user.id,
      input
    );
  }),
  getWithFields: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return ctx.applicationContext.assetTypeService.getByIdWithFieldsAndChildrenByUser(
        ctx.session.user.id,
        input
      );
    }),
  list: protectedProcedure
    .input(assetTypeListRequest)
    .query(async ({ ctx, input }) => {
      return ctx.applicationContext.assetTypeService.getAssetTypes(
        ctx.session.user.id,
        input
      );
    }),
});
