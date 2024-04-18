import { type AssetTypeField } from "~/server/lib/asset-types/assetType";

export type FilterKeyValue = {
  key: string;
  value: string;
};

export type FacetFilter = {
  field: AssetTypeField;
  conditions: FilterKeyValue[];
};
