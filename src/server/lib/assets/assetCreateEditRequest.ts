import { z } from "zod";

const customFieldValue = z.object({
  fieldId: z.string(),
  stringValue: z.string().nullable().default(null),
  decimalValue: z.number().nullable().default(null),
  numberValue: z.number().nullable().default(null),
  dateTimeValue: z.coerce.date().nullable().default(null),
  booleanValue: z.boolean().nullable().default(null),
  tagsValue: z.array(z.string()).nullable().default(null),
});

export const assetCreateEditRequest = z.object({
  id: z.string().optional(),
  teamId: z.string(),
  assetTypeId: z.string(),
  customFieldValues: z.array(customFieldValue),
});

export type AssetCreateEditCustomFieldValue = z.infer<typeof customFieldValue>;

export type AssetCreateEditRequest = z.infer<typeof assetCreateEditRequest>;
