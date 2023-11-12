import {
  type Asset as AssetRelation,
  type CustomField as CustomFieldRelation,
  type FieldValue as FieldValueRelation,
  type Team as TeamRelation,
  type AssetType as AssetTypeRelation,
} from "@prisma/client";

export type AssetWithFields = AssetRelation & {
  assetType: AssetTypeRelation | null;
  fieldValues: (FieldValueRelation & {
    customField: CustomFieldRelation;
  })[];
  team: TeamRelation | null;
};
