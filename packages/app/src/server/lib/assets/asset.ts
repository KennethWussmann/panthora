import {
  type Asset as AssetRelation,
  type CustomField as CustomFieldRelation,
  type FieldValue as FieldValueRelation,
  type Team as TeamRelation,
  type Tag as TagRelation,
} from "@prisma/client";
import { type AssetType } from "../asset-types/assetType";

export type AssetFieldValue = Omit<FieldValueRelation, "decimalValue"> & {
  customField: CustomFieldRelation;
} & {
  decimalValue: number | null;
  tagsValue: TagRelation[];
};

export type AssetWithFields = AssetRelation & {
  assetType: AssetType;
  fieldValues: AssetFieldValue[];
  team: TeamRelation | null;
};
