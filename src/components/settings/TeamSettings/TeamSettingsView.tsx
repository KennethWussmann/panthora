import { Team } from "@prisma/client";
import { TeamSettingsForm } from "./TeamSettingsForm";
import { Box, Flex, Heading, Stack } from "@chakra-ui/react";
import { TeamCreateButton } from "./TeamCreateButton";

export const TeamSettingsView = ({
  team,
  refetch,
}: {
  team: Team;
  refetch: VoidFunction;
}) => {
  return (
    <Box p={4} borderWidth={1} rounded={4}>
      <Stack gap={2}>
        <Flex justifyContent={"space-between"}>
          <Heading size={"md"}>Team</Heading>
          <TeamCreateButton />
        </Flex>
        <TeamSettingsForm team={team} refetch={refetch} />
      </Stack>
    </Box>
  );
};
