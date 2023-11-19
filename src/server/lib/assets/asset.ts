import {
  type Asset as AssetRelation,
  type CustomField as CustomFieldRelation,
  type FieldValue as FieldValueRelation,
  type Team as TeamRelation,
} from "@prisma/client";
import { AssetType } from "../asset-types/assetType";

export type AssetWithFields = AssetRelation & {
  assetType: AssetType | null;
  fieldValues: (FieldValueRelation & {
    customField: CustomFieldRelation;
  })[];
  team: TeamRelation | null;
};
