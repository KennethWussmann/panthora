import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Flex,
  Progress,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import type { Team } from "@prisma/client";
import { useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { api } from "~/utils/api";

export const SearchSettingsForm = ({ team }: { team: Team }) => {
  const {
    mutateAsync: rebuildIndexes,
    isLoading: isLoadingRebuildIndexes,
    isError,
    isSuccess,
  } = api.search.rebuildIndexes.useMutation();
  const {
    data: tasks,
    isLoading: isLoadingTasks,
    error: tasksError,
    isError: isErrorTasks,
    refetch: refetchTasks,
  } = api.search.tasks.useQuery({ teamId: team.id });

  useEffect(() => {
    if (tasksError) {
      return;
    }
    setInterval(() => void refetchTasks(), 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box p={4} borderWidth={1} rounded={4}>
      <Stack gap={2}>
        {isError && (
          <Alert status="error">
            <AlertIcon />
            <AlertDescription>Failed to rebuild indexes</AlertDescription>
          </Alert>
        )}
        {isSuccess && (
          <Alert status="success">
            <AlertIcon />
            <AlertDescription>
              Started to rebuild indexes. This may take a while until all
              searching capabilities are working correctly again.
            </AlertDescription>
          </Alert>
        )}
        <Text>
          In case you experience issues with searching, you can rebuild the
          search indexes here. This may take a while until all searching
          capabilities are working correctly again. It is intended to be used as
          a last resort, if you experience issues with searching.
        </Text>

        {isLoadingTasks && <Progress size="xs" isIndeterminate />}
        {isErrorTasks && (
          <Alert status="error">
            <AlertIcon />
            <AlertDescription>
              Failed to load recent search index tasks: {tasksError?.message}
            </AlertDescription>
          </Alert>
        )}
        {!isLoadingTasks && tasks && tasks.length > 0 && (
          <Table variant="simple" size={"sm"}>
            <Thead>
              <Tr>
                <Th>Task ID</Th>
                <Th>Index</Th>
                <Th>Type</Th>
                <Th>Status</Th>
                <Th>Details</Th>
              </Tr>
            </Thead>
            <Tbody>
              {tasks.map((task) => (
                <Tr key={task.uid}>
                  <Td>{task.uid}</Td>
                  <Td>{task.indexUid}</Td>
                  <Td>{task.type}</Td>
                  <Td>{task.status}</Td>
                  <Td>{task.error?.message}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
        <Flex justifyContent="flex-end">
          <Button
            leftIcon={<FiSearch />}
            variant={"outline"}
            isLoading={isLoadingRebuildIndexes}
            onClick={() => void rebuildIndexes({ teamId: team.id })}
          >
            Rebuild Search Indexes
          </Button>
        </Flex>
      </Stack>
    </Box>
  );
};
