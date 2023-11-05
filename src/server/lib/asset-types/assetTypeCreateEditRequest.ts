import { FieldType } from "@prisma/client";
import { z } from "zod";

const baseCustomFieldCreateEditRequest = {
  id: z.string(),
  name: z.string(),
  inputRequired: z.boolean(),
};
const minMaxCustomFieldCreateRequest = {
  inputMin: z.number().nullable().default(null),
  inputMax: z.number().nullable().default(null),
};

const numberCustomFieldCreateRequest = z.object({
  type: z.literal(FieldType.NUMBER),
  ...minMaxCustomFieldCreateRequest,
  ...baseCustomFieldCreateEditRequest,
});
const stringCustomFieldCreateRequest = z.object({
  type: z.literal(FieldType.STRING),
  ...minMaxCustomFieldCreateRequest,
  ...baseCustomFieldCreateEditRequest,
});
const booleanCustomFieldCreateRequest = z.object({
  type: z.literal(FieldType.BOOLEAN),
  ...baseCustomFieldCreateEditRequest,
});
const dateCustomFieldCreateRequest = z.object({
  type: z.literal(FieldType.DATE),
  ...baseCustomFieldCreateEditRequest,
});
const timeCustomFieldCreateRequest = z.object({
  type: z.literal(FieldType.TIME),
  ...baseCustomFieldCreateEditRequest,
});
const datetimeCustomFieldCreateRequest = z.object({
  type: z.literal(FieldType.DATETIME),
  ...baseCustomFieldCreateEditRequest,
});
const currencyCustomFieldCreateRequest = z.object({
  type: z.literal(FieldType.CURRENCY),
  currency: z.string().nullable().default(null),
  ...minMaxCustomFieldCreateRequest,
  ...baseCustomFieldCreateEditRequest,
});
const tagCustomFieldCreateRequest = z.object({
  type: z.literal(FieldType.TAG),
  parentTagId: z.string(),
  ...minMaxCustomFieldCreateRequest,
  ...baseCustomFieldCreateEditRequest,
});

const customFieldCreateEditRequest = z.discriminatedUnion("type", [
  numberCustomFieldCreateRequest,
  stringCustomFieldCreateRequest,
  booleanCustomFieldCreateRequest,
  dateCustomFieldCreateRequest,
  timeCustomFieldCreateRequest,
  datetimeCustomFieldCreateRequest,
  currencyCustomFieldCreateRequest,
  tagCustomFieldCreateRequest,
]);
export const assetTypeCreateEditRequest = z.object({
  id: z.string().nullable().default(null),
  teamId: z.string(),
  name: z.string(),
  parentId: z.string().nullable().default(null),
  fields: z.array(customFieldCreateEditRequest),
});

export type AssetTypeCreateEditRequest = z.infer<
  typeof assetTypeCreateEditRequest
>;
export type CustomFieldCreateEditRequest = z.infer<
  typeof customFieldCreateEditRequest
>;
