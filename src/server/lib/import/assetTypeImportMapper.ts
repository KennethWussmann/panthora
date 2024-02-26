import { FieldType } from "@prisma/client";
import {
  type AssetTypeCreateEditRequest,
  type CustomFieldCreateEditRequest,
} from "../asset-types/assetTypeCreateEditRequest";
import { type ImportAssetType, type ImportField } from "./importSchema";

const mapField = (field: ImportField): CustomFieldCreateEditRequest => {
  const base = {
    id: "",
    name: field.name,
    inputRequired: field.inputRequired ?? false,
    showInTable: field.showInTable ?? false,
  };

  switch (field.type) {
    case FieldType.NUMBER:
    case FieldType.STRING:
    case FieldType.CURRENCY:
    case FieldType.TAG:
      return {
        ...base,
        type: field.type,
        inputMin: field.inputMin ?? null,
        inputMax: field.inputMax ?? null,
        currency: "currency" in field ? field.currency ?? null : null,
        parentTagId: "parentTagId" in field ? field.parentTagId : "",
      };
    case FieldType.BOOLEAN:
    case FieldType.DATE:
    case FieldType.TIME:
    case FieldType.DATETIME:
      return { ...base, type: field.type };
    default:
      throw new Error(`Unsupported field type`);
  }
};

export const mapAssetTypeImport = (
  value: ImportAssetType,
  parentId?: string
): Pick<AssetTypeCreateEditRequest, "name" | "fields" | "parentId"> => {
  return {
    name: value.name,
    parentId: parentId ?? null,
    fields: value.fields.map(mapField),
  };
};
