import { FieldType } from "@prisma/client";
import { z } from "zod";

const baseCustomFieldCreateRequest = {
  name: z.string(),
  required: z.boolean(),
};
const minMaxCustomFieldCreateRequest = {
  min: z.number().optional(),
  max: z.number().optional(),
};

const numberCustomFieldCreateRequest = z.object({
  type: z.literal(FieldType.NUMBER),
  ...minMaxCustomFieldCreateRequest,
  ...baseCustomFieldCreateRequest,
});
const stringCustomFieldCreateRequest = z.object({
  type: z.literal(FieldType.STRING),
  ...minMaxCustomFieldCreateRequest,
  ...baseCustomFieldCreateRequest,
});
const booleanCustomFieldCreateRequest = z.object({
  type: z.literal(FieldType.BOOLEAN),
  ...baseCustomFieldCreateRequest,
});
const dateCustomFieldCreateRequest = z.object({
  type: z.literal(FieldType.DATE),
  ...baseCustomFieldCreateRequest,
});
const timeCustomFieldCreateRequest = z.object({
  type: z.literal(FieldType.TIME),
  ...baseCustomFieldCreateRequest,
});
const datetimeCustomFieldCreateRequest = z.object({
  type: z.literal(FieldType.DATETIME),
  ...baseCustomFieldCreateRequest,
});
const currencyCustomFieldCreateRequest = z.object({
  type: z.literal(FieldType.CURRENCY),
  currency: z.string().optional(),
  ...minMaxCustomFieldCreateRequest,
  ...baseCustomFieldCreateRequest,
});
const tagCustomFieldCreateRequest = z.object({
  type: z.literal(FieldType.TAG),
  parentTagId: z.number(),
  ...minMaxCustomFieldCreateRequest,
  ...baseCustomFieldCreateRequest,
});

const customFieldCreateRequest = z.discriminatedUnion("type", [
  numberCustomFieldCreateRequest,
  stringCustomFieldCreateRequest,
  booleanCustomFieldCreateRequest,
  dateCustomFieldCreateRequest,
  timeCustomFieldCreateRequest,
  datetimeCustomFieldCreateRequest,
  currencyCustomFieldCreateRequest,
  tagCustomFieldCreateRequest,
]);
export const assetTypeCreateRequest = z.object({
  teamId: z.string(),
  name: z.string(),
  parentId: z.number().optional(),
  fields: z.array(customFieldCreateRequest),
});

export type AssetTypeCreateRequest = z.infer<typeof assetTypeCreateRequest>;
export type CustomFieldCreateRequest = z.infer<typeof customFieldCreateRequest>;
