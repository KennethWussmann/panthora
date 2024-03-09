import { z } from "zod";
import { listRequest } from "../commonSchema/listRequest";

export const assetTypeListRequest = listRequest.extend({
  parentId: z.string().optional(),
});

export type AssetTypeListRequest = z.infer<typeof assetTypeListRequest>;
