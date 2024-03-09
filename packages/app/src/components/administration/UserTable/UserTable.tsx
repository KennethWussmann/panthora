import {
  Box,
  Heading,
  Progress,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { api } from "@/utils/api";
import { UserRow } from "./UserRow";
import { useUser } from "@/lib/UserProvider";

export const UserTable = () => {
  const { user: me } = useUser();
  const { data: users, isLoading } = api.user.listAll.useQuery({});

  return (
    <Box p={4} borderWidth={1} rounded={4}>
      <Stack gap={2}>
        <Heading size={"md"}>Users</Heading>
        {isLoading && <Progress size="xs" isIndeterminate />}
        {!isLoading && (
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Created at</Th>
                  <Th>E-Mail</Th>
                  <Th>Role</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users?.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    isMe={me?.id === user.id}
                  />
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </Stack>
    </Box>
  );
};
