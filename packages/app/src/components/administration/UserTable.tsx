import { Box, Heading, Stack, Tag } from "@chakra-ui/react";
import { api } from "@/utils/api";
import { useUser } from "@/lib/UserProvider";
import { type User } from "@/server/lib/user/user";
import { createColumnHelper } from "@tanstack/react-table";
import { UserRole } from "@prisma/client";
import { DataTable } from "../common/DataTable/DataTable";
import { useMemo } from "react";

const userRoleLabel: Record<UserRole, string> = {
  [UserRole.ADMIN]: "Admin",
  [UserRole.USER]: "User",
};

const columnHelper = createColumnHelper<User>();

export const UserTable = () => {
  const { user: me } = useUser();
  const { data: users, isLoading } = api.user.listAll.useQuery({});
  const columns = useMemo(
    () => [
      columnHelper.accessor("createdAt", {
        id: "createdAt",
        header: "Created at",
        cell: (cell) => cell.getValue().toISOString(),
      }),
      columnHelper.accessor("email", {
        id: "email",
        header: "E-Mail",
        cell: (cell) => (
          <>
            {cell.getValue()}{" "}
            {me?.id === cell.row.original.id && <Tag>You</Tag>}
          </>
        ),
      }),
      columnHelper.accessor("role", {
        id: "role",
        header: "Role",
        cell: (cell) => userRoleLabel[cell.getValue()],
      }),
    ],
    [me]
  );

  return (
    <Box p={4} borderWidth={1} rounded={4}>
      <Stack gap={2}>
        <Heading size={"md"} mb={2}>
          Users
        </Heading>
        <DataTable columns={columns} data={users ?? []} isLoading={isLoading} />
      </Stack>
    </Box>
  );
};
