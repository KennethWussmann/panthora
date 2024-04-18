import { z } from "zod";
import { type AssetWithFields } from "./asset";
import { type FacetDistribution, type FacetStats } from "meilisearch";

export const assetSearchRequest = z.object({
  teamId: z.string(),
  limit: z.number().optional(),
  offset: z.number().optional(),
  filter: z.string().optional(),
});

export type AssetSearchRequest = z.infer<typeof assetSearchRequest>;
export type AssetSearchResponse = {
  assets: AssetWithFields[];
  facetDistribution?: FacetDistribution;
  facetStats?: FacetStats;
};
