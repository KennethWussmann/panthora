import { z } from "zod";

export const assetTypeDeleteRequest = z.object({
  teamId: z.string(),
  id: z.string().optional(),
});

export type AssetTypeDeleteRequest = z.infer<typeof assetTypeDeleteRequest>;
