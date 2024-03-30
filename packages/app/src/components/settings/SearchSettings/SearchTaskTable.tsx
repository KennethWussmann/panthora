import { Alert, AlertDescription, AlertIcon, Progress } from "@chakra-ui/react";
import type { Team } from "@prisma/client";
import { type ReactNode, useEffect } from "react";
import { api } from "@/utils/api";
import { type SearchTask } from "~/server/lib/search/getFailedSearchTasks";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "~/components/common/DataTable/DataTable";

const columnHelper = createColumnHelper<SearchTask>();
const columns = [
  columnHelper.accessor("enqueuedAt", {
    id: "enqueuedAt",
    header: "Enqueued at",
    cell: (cell) => cell.getValue().toISOString(),
  }),
  columnHelper.accessor("indexUid", {
    id: "index",
    header: "Index",
    cell: (cell) => cell.getValue(),
  }),
  columnHelper.accessor("type", {
    id: "type",
    header: "Type",
    cell: (cell) => cell.getValue(),
  }),
  columnHelper.accessor("status", {
    id: "status",
    header: "Status",
    cell: (cell) => cell.getValue(),
  }),
  columnHelper.accessor("errorMessage", {
    id: "errorMessage",
    header: "Details",
    cell: (cell) => cell.getValue(),
  }),
];

export const SearchTaskTable = ({
  team,
  tableActions,
}: {
  team: Team;
  tableActions: ReactNode;
}) => {
  const {
    data: tasks,
    isLoading: isLoadingTasks,
    error: tasksError,
    isError: isErrorTasks,
    refetch: refetchTasks,
  } = api.search.tasks.useQuery({ teamId: team.id });

  useEffect(() => {
    if (isLoadingTasks) {
      return;
    }
    setInterval(() => void refetchTasks(), 5000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {isLoadingTasks && <Progress size="xs" isIndeterminate />}
      {isErrorTasks && (
        <Alert status="error">
          <AlertIcon />
          <AlertDescription>
            Failed to load recent search index tasks: {tasksError?.message}
          </AlertDescription>
        </Alert>
      )}
      <DataTable
        columns={columns}
        data={tasks ?? []}
        isLoading={isLoadingTasks}
        tableActions={tableActions}
      />
    </>
  );
};
