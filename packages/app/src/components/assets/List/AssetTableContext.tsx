import { createContext, useContext, useState } from "react";
import { type FacetFilter } from "./filter/facetFilter";
import { type AssetTypeField } from "~/server/lib/asset-types/assetType";
import { useFilterBuilder } from "./filter/useFilterBuilder.hook";

type AssetTableContextValue = ReturnType<typeof useAssetTableContextValue>;

const AssetTableContext = createContext<AssetTableContextValue | null>(null);

export const AssetTableProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const contextValue = useAssetTableContextValue();

  return (
    <AssetTableContext.Provider value={contextValue}>
      {children}
    </AssetTableContext.Provider>
  );
};

export const useAssetTable = () => {
  const contextValue = useContext(AssetTableContext);

  if (contextValue === null) {
    throw new Error("useAssetTable must be used within AssetTableProvider");
  }

  return contextValue;
};

const useAssetTableContextValue = () => {
  const [filters, setFilters] = useState<FacetFilter[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const filterExpression = useFilterBuilder(filters, selectedTypes);

  return {
    filters,
    filterExpression,
    clearFilters: () => setFilters([]),
    updateFilter: (filter: FacetFilter) => {
      setFilters((prev) => {
        const newState = prev.filter(
          ({ field }) => field.id !== filter.field.id
        );
        if (filter.conditions.length > 0) {
          newState.push(filter);
        }
        return newState;
      });
    },
    selectedTypes,
    setSelectedTypes,
  };
};

export const useAssetTableFilter = (field: AssetTypeField) => {
  const { filters } = useAssetTable();

  return (
    filters.find((filter) => filter.field.id === field.id) ?? {
      field,
      conditions: [],
    }
  );
};
