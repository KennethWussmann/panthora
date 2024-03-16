import {
  Heading,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { type UserMe } from "@/server/lib/user/user";

export const UserSettingsAccountConnectionsTable = ({
  user,
}: {
  user: UserMe;
}) => {
  return (
    <>
      <Heading size={"md"}>Account Connections</Heading>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Provider</Th>
            </Tr>
          </Thead>
          <Tbody>
            {user.accounts.map((account, index) => (
              <Tr key={index}>
                <Td textTransform={"capitalize"}>{account.provider}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
};
