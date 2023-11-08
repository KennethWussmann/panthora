import {
  type Asset as AssetRelation,
  type CustomField as CustomFieldRelation,
  type FieldValue as FieldValueRelation,
} from "@prisma/client";

export type AssetWithFields = AssetRelation & {
  assetType: {
    fields: CustomFieldRelation[];
  };
  fieldValues: (FieldValueRelation & {
    customField: CustomFieldRelation;
  })[];
};
