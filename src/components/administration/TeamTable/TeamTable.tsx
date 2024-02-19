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
import { api } from "~/utils/api";
import { TeamRow } from "./TeamRow";

export const TeamTable = () => {
  const { data: teams, isLoading } = api.team.listAll.useQuery({});

  return (
    <Box p={4} borderWidth={1} rounded={4}>
      <Stack gap={2}>
        <Heading size={"md"}>Teams</Heading>
        {isLoading && <Progress size="xs" isIndeterminate />}
        {!isLoading && (
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Created at</Th>
                  <Th>Name</Th>
                </Tr>
              </Thead>
              <Tbody>
                {teams?.map((team) => (
                  <TeamRow key={team.id} team={team} />
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </Stack>
    </Box>
  );
};
