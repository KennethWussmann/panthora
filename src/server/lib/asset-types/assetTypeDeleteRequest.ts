import { z } from "zod";

export const assetTypeDeleteRequest = z.object({
  teamId: z.string(),
  id: z.number().optional(),
});

export type AssetTypeDeleteRequest = z.infer<typeof assetTypeDeleteRequest>;
