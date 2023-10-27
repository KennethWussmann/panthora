import { Stack } from "@chakra-ui/react";
import { AssetBreadcrumbs } from "../AssetBreadcrumbs";
import { CreateAssetExplanation } from "./CreateAssetExplanation";

export const AssetCreationForm = () => {
  return (
    <Stack gap={2}>
      <AssetBreadcrumbs create />
      <CreateAssetExplanation />
    </Stack>
  );
};
