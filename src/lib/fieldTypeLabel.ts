import { FieldType } from "@prisma/client";

export const fieldTypeLabel: Record<FieldType, string> = {
  [FieldType.BOOLEAN]: "Boolean",
  [FieldType.CURRENCY]: "Currency",
  [FieldType.DATE]: "Date",
  [FieldType.TIME]: "Time",
  [FieldType.DATETIME]: "Date & Time",
  [FieldType.NUMBER]: "Number",
  [FieldType.STRING]: "String",
  [FieldType.TAG]: "Tag",
};
