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
import { DeleteIconButton } from "~/components/common/DeleteIconButton";
import { type UserMe } from "~/server/lib/user/user";

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
              <Th textAlign={"right"}>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {user.accounts.map((account, index) => (
              <Tr key={index}>
                <Td textTransform={"capitalize"}>{account.provider}</Td>
                <Td textAlign={"right"}>
                  <DeleteIconButton
                    itemName={account.provider}
                    onConfirm={() => {
                      //
                    }}
                    isDisabled={true}
                    tooltipText={"Not implemented yet"}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
};
