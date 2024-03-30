import { Tag } from "@chakra-ui/react";
import { LabelComponents, type Team } from "@prisma/client";
import { type LabelTemplate } from "@/server/lib/label-templates/labelTemplate";
import { api } from "@/utils/api";
import { LabelTemplateActionsCell } from "./LabelTemplateRow";
import { createColumnHelper } from "@tanstack/react-table";
import { type ReactNode, useMemo } from "react";
import { DataTable } from "~/components/common/DataTable/DataTable";

const componentLabels: Record<LabelComponents, string> = {
  [LabelComponents.QR_CODE]: "QR-Code",
  [LabelComponents.ASSET_ID]: "Asset ID",
  [LabelComponents.ASSET_VALUES]: "Asset Values",
};

const columnHelper = createColumnHelper<LabelTemplate>();

export const LabelTemplateTable = ({
  team,
  tableActions,
}: {
  team: Team;
  tableActions: ReactNode;
}) => {
  const {
    data: templates,
    isLoading: isLoadingTemplates,
    refetch: refetchTemplates,
  } = api.labelTemplate.list.useQuery({ teamId: team.id });
  const columns = useMemo(
    () => [
      columnHelper.accessor("createdAt", {
        id: "createdAt",
        header: "Created at",
        cell: (cell) => cell.getValue().toISOString(),
      }),
      columnHelper.accessor("name", {
        id: "name",
        header: "Name",
        cell: (cell) => (
          <>
            {cell.getValue()}
            {cell.row.original.default && <Tag ml={2}>Default</Tag>}
          </>
        ),
      }),
      columnHelper.display({
        id: "dimensions",
        header: "Dimensions",
        cell: (cell) => (
          <>
            {cell.row.original.width} mm x {cell.row.original.height} mm
          </>
        ),
      }),
      columnHelper.accessor("components", {
        id: "components",
        header: "Components",
        cell: (cell) =>
          cell.getValue().map((component) => (
            <Tag mr={2} key={component}>
              {componentLabels[component]}
            </Tag>
          )),
      }),
      columnHelper.display({
        header: "Actions",
        meta: { isNumeric: true },
        cell: (cell) => (
          <LabelTemplateActionsCell
            labelTemplate={cell.row.original}
            onDelete={refetchTemplates}
          />
        ),
      }),
    ],
    [refetchTemplates]
  );

  return (
    <DataTable
      columns={columns}
      data={templates ?? []}
      isLoading={isLoadingTemplates}
      tableActions={tableActions}
    />
  );
};
