import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Flex,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { Team } from "@prisma/client";
import { FiSearch } from "react-icons/fi";
import { api } from "~/utils/api";
import { SearchTaskTable } from "./SearchTaskTable";
import { useErrorHandlingMutation } from "~/lib/useErrorHandling";

export const SearchSettingsForm = ({ team }: { team: Team }) => {
  const {
    mutateAsync: rebuildIndexes,
    isLoading: isLoadingRebuildIndexes,
    isError,
    isSuccess,
  } = useErrorHandlingMutation(api.search.rebuildIndexes);

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
        <SearchTaskTable team={team} />
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
