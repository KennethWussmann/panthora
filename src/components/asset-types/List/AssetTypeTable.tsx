import React from "react";
import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Button,
  Stack,
  Flex,
} from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { useRouter } from "next/router";
import { AssetTypeExplanation } from "./AssetTypeExplanation";
import { AssetTypeRow, EmptyAssetTypeRow } from "./AssetTypeRow";
import { api } from "~/utils/api";
import { type AssetType } from "~/server/lib/asset-types/assetType";
import { useTeam } from "~/lib/SelectedTeamProvider";

const renderNestedAssetTypes = (
  assetTypes: AssetType[],
  refetchAssetTypes: VoidFunction,
  level = 0
) => {
  return assetTypes.map((assetType) => (
    <React.Fragment key={assetType.id}>
      <AssetTypeRow
        assetType={assetType}
        level={level}
        refetchAssetTypes={refetchAssetTypes}
      />
      {assetType.children &&
        renderNestedAssetTypes(
          assetType.children,
          refetchAssetTypes,
          level + 1
        )}
    </React.Fragment>
  ));
};

export const AssetTypeTable: React.FC = () => {
  const { push } = useRouter();
  const { team } = useTeam();
  const assetTypeQuery = api.assetType.list.useQuery(
    { teamId: team?.id ?? "" },
    { enabled: !!team }
  );

  return (
    <Stack gap={6}>
      <AssetTypeExplanation />
      <Flex justify="end">
        <Button
          leftIcon={<FiPlus />}
          colorScheme="green"
          onClick={() => push("/asset-types/create")}
        >
          Create
        </Button>
      </Flex>
      {!assetTypeQuery.isLoading && (
        <Table variant="simple" size={"sm"}>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th textAlign="right">Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {assetTypeQuery?.data?.length === 0 && <EmptyAssetTypeRow />}
            {assetTypeQuery?.data &&
              renderNestedAssetTypes(
                assetTypeQuery.data,
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                assetTypeQuery.refetch
              )}
          </Tbody>
        </Table>
      )}
    </Stack>
  );
};
