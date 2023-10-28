import { z } from "zod";

const customFieldValue = z.object({
  fieldId: z.number(),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
});

export const assetCreateRequest = z.object({
  teamId: z.string(),
  assetTypeId: z.number(),
  customFieldValues: z.array(customFieldValue),
});

export type AssetCreateRequest = z.infer<typeof assetCreateRequest>;
