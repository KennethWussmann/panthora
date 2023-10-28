import { z } from "zod";
import { listRequest } from "../commonSchema/listRequest";

export const assetTypeListRequest = listRequest;

export type AssetTypeListRequest = z.infer<typeof assetTypeListRequest>;
