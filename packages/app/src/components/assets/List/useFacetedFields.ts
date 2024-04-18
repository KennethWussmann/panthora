import { usePrevious } from "@chakra-ui/react";
import { FieldType } from "@prisma/client";
import { useEffect, useMemo } from "react";
import { type AssetType } from "~/server/lib/asset-types/assetType";
import { type AssetSearchResponse } from "~/server/lib/assets/assetSearchRequest";
import { useAssetTable } from "./AssetTableContext";

const supportedFieldTypes: FieldType[] = [
  FieldType.STRING,
  FieldType.TAG,
  FieldType.BOOLEAN,
];

export const useFacetedFields = ({
  assetsResponse,
  assetTypes,
}: {
  assetsResponse?: AssetSearchResponse;
  assetTypes: AssetType[];
}) => {
  const { selectedTypes, setSelectedTypes } = useAssetTable();
  const assetTypeNames = Object.keys(
    assetsResponse?.facetDistribution?.assetTypeName ?? {}
  );
  const previousAssetTypeNames = usePrevious(assetTypeNames);
  const facetedFields = useMemo(
    () =>
      assetTypes
        .filter(
          (type) =>
            selectedTypes.includes(type.name) || selectedTypes.length === 0
        )
        .flatMap((type) => type.fields)
        .filter((field) => supportedFieldTypes.includes(field.fieldType))
        .map((field) => ({
          field,
          distribution: assetsResponse?.facetDistribution?.[field.slug],
          stats: assetsResponse?.facetStats?.[field.slug],
        }))
        .filter(
          ({ distribution }) =>
            !!distribution && Object.keys(distribution).length > 0
        ),
    [assetTypes, selectedTypes, assetsResponse]
  );

  useEffect(() => {
    if (previousAssetTypeNames?.length === 0 && assetTypeNames?.length > 0) {
      setSelectedTypes(assetTypeNames);
    }
  }, [assetTypeNames, previousAssetTypeNames, setSelectedTypes]);

  return {
    facetedFields,
    selectedTypes,
    setSelectedTypes,
  };
};
