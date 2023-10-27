import { Stack } from "@chakra-ui/react";
import { AssetTypeBreadcrumbs } from "../AssetTypeBreadcrumbs";
import { CreateAssetTypeExplanation } from "./CreateAssetTypeExplanation";

export const AssetTypeCreationForm = () => {
  return (
    <Stack gap={2}>
      <AssetTypeBreadcrumbs create />
      <CreateAssetTypeExplanation />
    </Stack>
  );
};
