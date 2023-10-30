import {
  AssetTypeCreateEditRequest,
  CustomFieldCreateEditRequest,
} from "~/server/lib/asset-types/assetTypeCreateEditRequest";

export type TemporaryCustomField = CustomFieldCreateEditRequest;

export type AssetTypeCreateRequestWithTemporaryFields =
  AssetTypeCreateEditRequest & { fields: TemporaryCustomField[] };
