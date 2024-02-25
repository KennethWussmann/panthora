import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Heading,
  Progress,
  Stack,
  Text,
} from "@chakra-ui/react";
import { UserRole } from "@prisma/client";
import { useRouter } from "next/router";
import { FiCheck, FiRefreshCw, FiX } from "react-icons/fi";
import { type User } from "~/server/lib/user/user";
import { api } from "~/utils/api";

const OfflineIcon = () => {
  return (
    <Box rounded={"full"} borderWidth={1} p={4} bgColor={"red.400"}>
      <FiX size={24} />
    </Box>
  );
};
const OnlineIcon = () => {
  return (
    <Box rounded={"full"} borderWidth={1} p={4} bgColor={"green.400"}>
      <FiCheck size={24} />
    </Box>
  );
};

export const ServerHealthView = ({ user }: { user: User }) => {
  const { push } = useRouter();
  const {
    data: health,
    isLoading: isLoadingHealth,
    isRefetching: isRefetchingHealth,
    refetch,
  } = api.server.health.useQuery(undefined);
  return (
    <Container maxW="lg" py={{ base: "12", md: "24" }}>
      <Box p={8} borderWidth={1} rounded={4}>
        <Stack spacing="8">
          <Stack spacing={{ base: "2", md: "3" }} textAlign="center">
            <Heading size={"lg"}>Panthora</Heading>
          </Stack>

          {(isLoadingHealth || !health) && <Progress isIndeterminate />}

          {health && health.ok && (
            <Alert status="success">
              <AlertIcon />
              <AlertDescription>All systems are operational</AlertDescription>
            </Alert>
          )}
          {health && !health.ok && (
            <Alert status="error">
              <AlertIcon />
              <AlertDescription>
                Some systems are not operational. Please check the server logs
                to resolve the issue.
              </AlertDescription>
            </Alert>
          )}

          {health?.details && user.role === UserRole.ADMIN && (
            <>
              <Heading size="md">Server Health</Heading>
              <Flex alignItems={"center"} justifyContent={"start"} gap={6}>
                {health.details.database ? <OnlineIcon /> : <OfflineIcon />}
                <Box flexShrink="0">
                  <Heading size={"md"}>Database</Heading>
                  <Text>
                    {health.details.database
                      ? "The database is reachable and healthy"
                      : "The database is unreachable"}
                  </Text>
                </Box>
              </Flex>
              <Divider />
              <Flex alignItems={"center"} justifyContent={"start"} gap={6}>
                {health.details.meiliSearch ? <OnlineIcon /> : <OfflineIcon />}
                <Box flexShrink="0">
                  <Heading size={"md"}>MeiliSearch</Heading>
                  <Text>
                    {health.details.meiliSearch
                      ? "The search service is reachable and healthy"
                      : "MeiliSearch is unreachable"}
                  </Text>
                </Box>
              </Flex>
            </>
          )}
          {health && health.ok && (
            <Flex justifyContent={"end"}>
              <Button variant={"solid"} onClick={() => push("/dashboard")}>
                Close
              </Button>
            </Flex>
          )}
          {health && !health.ok && (
            <Flex justifyContent={"start"}>
              <Button
                variant={"solid"}
                leftIcon={<FiRefreshCw />}
                isLoading={isLoadingHealth || isRefetchingHealth}
                onClick={() => refetch()}
              >
                Refresh
              </Button>
            </Flex>
          )}
        </Stack>
      </Box>
    </Container>
  );
};
