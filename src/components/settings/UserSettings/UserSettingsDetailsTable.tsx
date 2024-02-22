import { Table, TableContainer, Tbody, Td, Text, Tr } from "@chakra-ui/react";
import { UserSettingsChangePasswordForm } from "./UserSettingsChangePasswordForm";
import { useLoginProviders } from "~/lib/useLoginProviders";
import { useUser } from "~/lib/UserProvider";

export const UserSettingsDetailsTable = () => {
  const { user, refetch } = useUser();
  const { isPasswordAuthEnabled } = useLoginProviders();
  if (!user) {
    return null;
  }
  return (
    <TableContainer>
      <Table>
        <Tbody>
          <Tr>
            <Td>
              <Text fontWeight={"bold"}>E-Mail</Text>
            </Td>
            <Td>{user.email}</Td>
          </Tr>
          <Tr>
            <Td>
              <Text fontWeight={"bold"}>Registered at</Text>
            </Td>
            <Td>{user.createdAt.toISOString()}</Td>
          </Tr>
          <Tr>
            <Td>
              <Text fontWeight={"bold"}>Updated at</Text>
            </Td>
            <Td>{user.updatedAt.toISOString()}</Td>
          </Tr>
          {isPasswordAuthEnabled && (
            <Tr>
              <Td>
                <Text fontWeight={"bold"}>Password</Text>
              </Td>
              <Td>
                <UserSettingsChangePasswordForm
                  user={user}
                  onPasswordChange={refetch}
                />
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </TableContainer>
  );
};
