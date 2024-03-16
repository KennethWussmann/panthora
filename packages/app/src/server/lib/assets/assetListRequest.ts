
import { type z } from "zod";
import { listRequest } from "../commonSchema/listRequest";

export const assetListRequest = listRequest;

export type AssetListRequest = z.infer<typeof assetListRequest>;
