import {
  type Asset as AssetRelation,
  type CustomField as CustomFieldRelation,
  type FieldValue as FieldValueRelation,
  type Team as TeamRelation,
} from "@prisma/client";
import { type AssetType } from "../asset-types/assetType";

export type AssetWithFields = AssetRelation & {
  assetType: AssetType;
  fieldValues: (FieldValueRelation & {
    customField: CustomFieldRelation;
  })[];
  team: TeamRelation | null;
};
