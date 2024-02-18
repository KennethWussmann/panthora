import { FieldType } from "@prisma/client";
import { type AssetCreateEditCustomFieldValue } from "../assets/assetCreateEditRequest";
import { type AssetWithFields } from "../assets/asset";

export const getFieldValueApi = (
  fieldValue: AssetCreateEditCustomFieldValue,
  fieldType: FieldType
): string | number | boolean | string[] | Date | null => {
  switch (fieldType) {
    case FieldType.STRING:
      return fieldValue.stringValue;
    case FieldType.CURRENCY:
      return fieldValue.decimalValue;
    case FieldType.NUMBER:
      return fieldValue.numberValue;
    case FieldType.BOOLEAN:
      return fieldValue.booleanValue;
    case FieldType.DATE:
    case FieldType.TIME:
    case FieldType.DATETIME:
      return fieldValue.dateTimeValue;
    case FieldType.TAG:
      return fieldValue.tagsValue;
    default:
      const _: never = fieldType;
      return null;
  }
};

export const getFieldValueModel = (
  fieldValue: AssetWithFields["fieldValues"][0],
  tagsMode: "id" | "name" = "id"
): string | number | boolean | string[] | Date | null => {
  const { type } = fieldValue;
  switch (type) {
    case FieldType.STRING:
      return fieldValue.stringValue;
    case FieldType.CURRENCY:
      return fieldValue.decimalValue;
    case FieldType.NUMBER:
      return fieldValue.intValue;
    case FieldType.BOOLEAN:
      return fieldValue.booleanValue;
    case FieldType.DATE:
    case FieldType.TIME:
    case FieldType.DATETIME:
      return fieldValue.dateTimeValue;
    case FieldType.TAG:
      return (
        fieldValue.tagsValue?.map((tag) =>
          tagsMode === "id" ? tag.id : tag.name
        ) ?? null
      );
    default:
      return null;
  }
};
