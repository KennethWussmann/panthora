import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { assetTypeCreateRequest } from "~/server/lib/asset-types/assetTypeCreateRequest";
import { assetTypeListRequest } from "~/server/lib/asset-types/assetTypeListRequest";

export const assetTypeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(assetTypeCreateRequest)
    .mutation(async ({ ctx, input }) => {
      return ctx.applicationContext.assetTypeService.createAssetType(input);
    }),
  list: protectedProcedure
    .input(assetTypeListRequest)
    .mutation(async ({ ctx, input }) => {
      return ctx.applicationContext.assetTypeService.getAssetTypes(input);
    }),
});
