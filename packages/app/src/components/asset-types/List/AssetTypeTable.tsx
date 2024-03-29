import React, { useMemo } from "react";
import { Button, Stack } from "@chakra-ui/react";
import { FiFolder, FiPlus } from "react-icons/fi";
import { useRouter } from "next/router";
import { AssetTypeExplanation } from "./AssetTypeExplanation";
import { AssetTypeActionsCell, AssetTypeCell } from "./AssetTypeRow";
import { api } from "@/utils/api";
import { type AssetType } from "@/server/lib/asset-types/assetType";
import { useTeam } from "@/lib/SelectedTeamProvider";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "~/components/common/DataTable";

type FlattenedAssetType = AssetType & { level: number };

const flattenAssetTypes = (
  assetTypes: AssetType[],
  level = 0
): FlattenedAssetType[] => {
  return assetTypes.reduce<FlattenedAssetType[]>((acc, assetType) => {
    acc.push({ ...assetType, level });
    if (assetType.children) {
      acc.push(...flattenAssetTypes(assetType.children, level + 1));
    }
    return acc;
  }, []);
};

const columnHelper = createColumnHelper<FlattenedAssetType>();

export const AssetTypeTable: React.FC = () => {
  const { push } = useRouter();
  const { team } = useTeam();
  const assetTypeQuery = api.assetType.list.useQuery(
    { teamId: team?.id ?? "" },
    { enabled: !!team }
  );
  const assetTypes = useMemo(
    () => (assetTypeQuery.data ? flattenAssetTypes(assetTypeQuery.data) : []),
    [assetTypeQuery.data]
  );
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        id: "name",
        header: "Name",
        cell: (cell) => (
          <AssetTypeCell
            assetType={cell.row.original}
            level={cell.row.original.level}
          />
        ),
      }),
      columnHelper.display({
        header: "Actions",
        meta: { isNumeric: true },
        cell: (cell) => (
          <AssetTypeActionsCell
            assetType={cell.row.original}
            onDelete={assetTypeQuery.refetch}
          />
        ),
      }),
    ],
    [assetTypeQuery.refetch]
  );

  return (
    <Stack gap={6}>
      <AssetTypeExplanation />
      {!assetTypeQuery.isLoading && (
        <DataTable
          columns={columns}
          data={assetTypes}
          variant={"simple"}
          size={"sm"}
          emptyList={{
            icon: FiFolder,
            label: "No asset types found",
            createHref: "/asset-types/create",
          }}
          tableActions={
            <Button
              leftIcon={<FiPlus />}
              colorScheme="green"
              onClick={() => push("/asset-types/create")}
            >
              Create
            </Button>
          }
        />
      )}
    </Stack>
  );
};
