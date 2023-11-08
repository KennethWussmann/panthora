import {
  type AssetType as AssetTypeRelation,
  type CustomField as CustomFieldRelation,
} from "@prisma/client";

export type AssetType = AssetTypeRelation & {
  children: AssetType[];
  fields: CustomFieldRelation[];
};
