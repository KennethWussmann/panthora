import { z } from "zod";

const customFieldValue = z.object({
  fieldId: z.number(),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
});

export const assetCreateEditRequest = z.object({
  teamId: z.string(),
  assetTypeId: z.number(),
  customFieldValues: z.array(customFieldValue),
});

export type AssetCreateEditCustomFieldValue = z.infer<typeof customFieldValue>;

export type AssetCreateEditRequest = z.infer<typeof assetCreateEditRequest>;
