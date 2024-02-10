import { FormControl, FormLabel, Select } from "@chakra-ui/react";
import React, { forwardRef } from "react";
import { useTeam } from "~/lib/SelectedTeamProvider";
import { type AssetType } from "~/server/lib/asset-types/assetType";
import { api } from "~/utils/api";

const renderNestedAssetTypes = (assetTypes: AssetType[], level = 0) => {
  return assetTypes.map((assetType) => (
    <React.Fragment key={assetType.id}>
      <option value={assetType.id}>
        {String.fromCharCode(160).repeat(level * 4)}
        {assetType.name} -{" "}
        {assetType.fields.length > 0 ? assetType.fields.length : "No"}{" "}
        {assetType.fields.length === 1 ? "field" : "fields"}
      </option>
      {assetType.children &&
        renderNestedAssetTypes(assetType.children, level + 1)}
    </React.Fragment>
  ));
};

// eslint-disable-next-line react/display-name, @typescript-eslint/no-explicit-any
export const AssetTypeSelector = forwardRef<HTMLSelectElement, any>(
  ({ label, ...selectProps }, ref) => {
    const { team } = useTeam();

    const { data: assetTypes, isLoading: isLoadingAssetTypes } =
      api.assetType.list.useQuery(
        { teamId: team?.id ?? "" },
        { enabled: !!team }
      );

    return (
      <FormControl>
        <FormLabel>{label}</FormLabel>
        <Select
          ref={ref}
          placeholder="None"
          {...selectProps}
          isDisabled={!team || isLoadingAssetTypes}
        >
          {assetTypes && renderNestedAssetTypes(assetTypes)}
        </Select>
      </FormControl>
    );
  }
);
