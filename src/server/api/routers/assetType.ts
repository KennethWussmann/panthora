import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { assetTypeCreateRequest } from "~/server/lib/asset-types/assetTypeCreateRequest";
import { assetTypeDeleteRequest } from "~/server/lib/asset-types/assetTypeDeleteRequest";
import { assetTypeListRequest } from "~/server/lib/asset-types/assetTypeListRequest";

export const assetTypeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(assetTypeCreateRequest)
    .mutation(async ({ ctx, input }) => {
      return ctx.applicationContext.assetTypeService.createAssetType(
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
  list: protectedProcedure
    .input(assetTypeListRequest)
    .query(async ({ ctx, input }) => {
      return ctx.applicationContext.assetTypeService.getAssetTypes(
        ctx.session.user.id,
        input
      );
    }),
});
