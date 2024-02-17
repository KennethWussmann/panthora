import { type AssetSearchDocument } from "./assetSearchService";
import { type AssetTypeSearchDocument } from "./assetTypeSearchService";
import { type TagSearchDocument } from "./tagSearchService";

export type SearchResults = {
  assets: (AssetSearchDocument & { index: "assets" })[];
  assetTypes: (AssetTypeSearchDocument & { index: "assetTypes" })[];
  tags: (TagSearchDocument & { index: "tags" })[];
};

export type SearchResult =
  | (AssetSearchDocument & { index: "assets" })
  | (AssetTypeSearchDocument & { index: "assetTypes" })
  | (TagSearchDocument & { index: "tags" });
