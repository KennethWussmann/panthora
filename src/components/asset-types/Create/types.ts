import {
  AssetTypeCreateRequest,
  CustomFieldCreateRequest,
} from "~/server/lib/asset-types/assetTypeCreateRequest";

export type TemporaryCustomField = CustomFieldCreateRequest & {
  id: string;
};

export type AssetTypeCreateRequestWithTemporaryFields =
  AssetTypeCreateRequest & { fields: TemporaryCustomField[] };
