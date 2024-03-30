import { Box, Heading, Stack } from "@chakra-ui/react";
import { api } from "@/utils/api";
import { type Team } from "@prisma/client";
import { createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "~/components/common/DataTable/DataTable";

const columnHelper = createColumnHelper<Team>();
const columns = [
  columnHelper.accessor("createdAt", {
    id: "createdAt",
    header: "Created at",
    cell: (cell) => cell.getValue().toISOString(),
  }),
  columnHelper.accessor("name", {
    id: "name",
    header: "Name",
    cell: (cell) => cell.getValue(),
  }),
];

export const TeamTable = () => {
  const { data: teams, isLoading } = api.team.listAll.useQuery({});

  return (
    <Box p={4} borderWidth={1} rounded={4}>
      <Stack gap={2}>
        <Heading size={"md"} mb={2}>
          Teams
        </Heading>
        <DataTable columns={columns} data={teams ?? []} isLoading={isLoading} />
      </Stack>
    </Box>
  );
};
