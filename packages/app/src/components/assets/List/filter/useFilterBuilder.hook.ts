import { useMemo } from "react";
import { type FacetFilter } from "./facetFilter";

export const useFilterBuilder = (
  filter: FacetFilter[],
  assetTypes: string[]
) => {
  const expression = useMemo(() => {
    const parts = filter.map((facetFilter) =>
      facetFilter.conditions
        .map((condition) => `"${condition.key}" = "${condition.value}"`)
        .join(" OR ")
    );
    if (assetTypes.length > 0) {
      parts.push(
        assetTypes.map((type) => `"assetTypeName" = "${type}"`).join(" OR ")
      );
    }

    return parts.join(" AND ");
  }, [filter, assetTypes]);
  return expression;
};
