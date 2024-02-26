import { z } from "zod";
import { FieldType } from "@prisma/client";

const baseCustomFieldCreateEditRequest = {
  id: z.string(),
  name: z.string(),
  inputRequired: z.boolean(),
  showInTable: z.boolean(),
};
const minMaxField = {
  inputMin: z.number().optional(),
  inputMax: z.number().optional(),
};

const numberField = z.object({
  type: z.literal(FieldType.NUMBER),
  ...minMaxField,
  ...baseCustomFieldCreateEditRequest,
});
const stringField = z.object({
  type: z.literal(FieldType.STRING),
  ...minMaxField,
  ...baseCustomFieldCreateEditRequest,
});
const booleanField = z.object({
  type: z.literal(FieldType.BOOLEAN),
  ...baseCustomFieldCreateEditRequest,
});
const dateField = z.object({
  type: z.literal(FieldType.DATE),
  ...baseCustomFieldCreateEditRequest,
});
const timeField = z.object({
  type: z.literal(FieldType.TIME),
  ...baseCustomFieldCreateEditRequest,
});
const datetimeField = z.object({
  type: z.literal(FieldType.DATETIME),
  ...baseCustomFieldCreateEditRequest,
});
const currencyField = z.object({
  type: z.literal(FieldType.CURRENCY),
  currency: z.string().optional(),
  ...minMaxField,
  ...baseCustomFieldCreateEditRequest,
});
const tagField = z.object({
  type: z.literal(FieldType.TAG),
  parentTagId: z.string(),
  ...minMaxField,
  ...baseCustomFieldCreateEditRequest,
});

const field = z.discriminatedUnion("type", [
  numberField,
  stringField,
  booleanField,
  dateField,
  timeField,
  datetimeField,
  currencyField,
  tagField,
]);

const tagBase = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(250),
});
type Tag = z.infer<typeof tagBase> & {
  children: Tag[];
};
const tag: z.ZodType<Tag> = tagBase.extend({
  children: z.lazy(() => z.array(tag)),
});

const assetTypeBase = z.object({
  name: z.string().min(1).max(250),
  fields: z.array(field),
});
type AssetType = z.infer<typeof assetTypeBase> & {
  children: AssetType[];
};
const assetType: z.ZodType<AssetType> = assetTypeBase.extend({
  children: z.lazy(() => z.array(assetType)),
});

export const importSchema = z.object({
  name: z.string().min(1).max(250),
  version: z.string().min(1).max(10),
  description: z.string().min(0).max(1000).optional(),
  author: z.string().min(1).max(250).optional(),
  tags: z.array(tag).optional(),
  assetTypes: z.array(assetType).optional(),
});

export const importSchemaVersion = "0.2.0";

export type ImportSchema = z.infer<typeof importSchema>;
export type ImportAssetType = z.infer<typeof assetType>;
export type ImportField = z.infer<typeof field>;
export type ImportTag = z.infer<typeof tag>;
