import {
  AssetType as AssetTypeRelation,
  CustomField as CustomFieldRelation,
} from "@prisma/client";

export type AssetType = AssetTypeRelation & {
  children: AssetType[];
  fields: CustomFieldRelation[];
};
