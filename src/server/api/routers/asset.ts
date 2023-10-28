import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { assetCreateRequest } from "~/server/lib/assets/assetCreateRequest";
import { assetListRequest } from "~/server/lib/assets/assetListRequest";

export const assetRouter = createTRPCRouter({
  create: protectedProcedure
    .input(assetCreateRequest)
    .mutation(async ({ ctx, input }) => {
      return ctx.applicationContext.assetService.createAsset(input);
    }),
  list: protectedProcedure
    .input(assetListRequest)
    .mutation(async ({ ctx, input }) => {
      return ctx.applicationContext.assetService.getAssets(input);
    }),
});
