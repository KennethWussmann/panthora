import { z } from "zod";

const customFieldValue = z.object({
  fieldId: z.string(),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(z.string()),
  ]),
});

export const assetCreateEditRequest = z.object({
  id: z.string().optional(),
  teamId: z.string(),
  assetTypeId: z.string(),
  customFieldValues: z.array(customFieldValue),
});

export type AssetCreateEditCustomFieldValue = z.infer<typeof customFieldValue>;

export type AssetCreateEditRequest = z.infer<typeof assetCreateEditRequest>;
