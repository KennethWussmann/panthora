import {
  Asset as AssetRelation,
  CustomField as CustomFieldRelation,
  FieldValue as FieldValueRelation,
} from "@prisma/client";

export type AssetWithFields = AssetRelation & {
  assetType: {
    fields: CustomFieldRelation[];
  };
  fieldValues: (FieldValueRelation & {
    customField: CustomFieldRelation;
  })[];
};
