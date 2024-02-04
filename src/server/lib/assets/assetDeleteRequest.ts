import { z } from "zod";

export const assetDeleteRequest = z.object({
  teamId: z.string(),
  id: z.string().optional(),
});

export type AssetDeleteRequest = z.infer<typeof assetDeleteRequest>;
