import {
  Alert,
  AlertDescription,
  AlertIcon,
  Progress,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import type { Team } from "@prisma/client";
import { useEffect } from "react";
import { api } from "~/utils/api";

export const SearchTaskTable = ({ team }: { team: Team }) => {
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
      {!isLoadingTasks && tasks && tasks.length > 0 && (
        <Table variant="simple" size={"sm"}>
          <Thead>
            <Tr>
              <Th>Enqueued at</Th>
              <Th>Index</Th>
              <Th>Type</Th>
              <Th>Status</Th>
              <Th>Details</Th>
            </Tr>
          </Thead>
          <Tbody>
            {tasks.map((task) => (
              <Tr key={task.uid}>
                <Td>{String(task.enqueuedAt)}</Td>
                <Td>{task.indexUid}</Td>
                <Td>{task.type}</Td>
                <Td>{task.status}</Td>
                <Td>{task.error?.message}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </>
  );
};
