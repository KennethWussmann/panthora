import {
  type Asset as AssetRelation,
  type CustomField as CustomFieldRelation,
  type FieldValue as FieldValueRelation,
  type Team as TeamRelation,
  type Tag as TagRelation,
} from "@prisma/client";
import { type AssetType } from "../asset-types/assetType";

export type AssetWithFields = AssetRelation & {
  assetType: AssetType;
  fieldValues: (FieldValueRelation & {
    customField: CustomFieldRelation;
  } & { tags: TagRelation[] })[];
  team: TeamRelation | null;
};
