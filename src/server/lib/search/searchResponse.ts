import { z } from "zod";
import { assetDocumentSchema } from "./assetSearchService";
import { assetTypeSearchDocument } from "./assetTypeSearchService";
import { tagSearchDocument } from "./tagSearchService";

const assetSearchResult = z.object({
  index: z.literal("assets"),
  results: z.array(assetDocumentSchema),
});

const assetTypeSearchResult = z.object({
  index: z.literal("assetTypes"),
  results: z.array(assetTypeSearchDocument),
});

const tagsSearchResult = z.object({
  index: z.literal("tags"),
  results: z.array(tagSearchDocument),
});

const searchResult = z.discriminatedUnion("index", [
  assetSearchResult,
  assetTypeSearchResult,
  tagsSearchResult,
]);

export const searchResponse = z.object({
  results: z.array(searchResult),
});

export type SearchResult = z.infer<typeof searchResult>;
export type SearchResponse = z.infer<typeof searchResponse>;
