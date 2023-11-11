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
  Alert,
  AlertIcon,
  AlertDescription,
} from "@chakra-ui/react";
import { FiPlus, FiPrinter } from "react-icons/fi";
import { AssetExplanation } from "./AssetExplanation";
import { useRouter } from "next/router";
import { AssetBreadcrumbs } from "../AssetBreadcrumbs";
import { AssetRow, EmptyAssetRow } from "./AssetRow";
import { api } from "~/utils/api";
import { Link } from "@chakra-ui/next-js";
import { uniqBy } from "lodash";

export const AssetTable: React.FC = () => {
  const { push } = useRouter();
  const { data: defaultTeam } = api.user.defaultTeam.useQuery();
  const { data: assets } = api.asset.list.useQuery(
    { teamId: defaultTeam?.id ?? "" },
    { enabled: !!defaultTeam }
  );
  const { data: assetTypes, isLoading: isLoadingAssetTypes } =
    api.assetType.list.useQuery(
      { teamId: defaultTeam?.id ?? "" },
      { enabled: !!defaultTeam }
    );

  const showAssetTypeMissingNotice = assetTypes?.length === 0;

  const uniqueFieldsToShow =
    uniqBy(
      assets
        ?.flatMap((asset) => asset.assetType.fields)
        ?.filter((field) => field.showInTable),
      (field) => field.id
    ) ?? [];

  return (
    <Stack gap={2}>
      <AssetBreadcrumbs />
      <AssetExplanation />
      {showAssetTypeMissingNotice && (
        <Alert status="info">
          <AlertIcon />
          <AlertDescription>
            You don&apos;t have any asset types yet.{" "}
            <Link href="/asset-types/create" textDecor={"underline"}>
              Create one first
            </Link>{" "}
            to be able to create assets.
          </AlertDescription>
        </Alert>
      )}

      <Flex justify="end" gap={2}>
        <Button
          leftIcon={<FiPrinter />}
          variant={"outline"}
          onClick={() => push("/assets/print")}
          isLoading={isLoadingAssetTypes}
          isDisabled={showAssetTypeMissingNotice}
        >
          Print
        </Button>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="green"
          onClick={() => push("/assets/create")}
          isLoading={isLoadingAssetTypes}
          isDisabled={showAssetTypeMissingNotice}
        >
          Create
        </Button>
      </Flex>
      <Table variant="simple" size={"sm"}>
        <Thead>
          <Tr>
            {uniqueFieldsToShow.map((field) => (
              <Th key={field.id}>{field.name}</Th>
            ))}
            <Th textAlign="right">Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {assets?.length === 0 && <EmptyAssetRow />}
          {assets?.map((asset) => (
            <AssetRow
              key={asset.id}
              asset={asset}
              uniqueFieldsToShow={uniqueFieldsToShow}
            />
          ))}
        </Tbody>
      </Table>
    </Stack>
  );
};
