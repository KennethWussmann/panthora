import { type Team, UserTeamMembershipRole } from "@prisma/client";
import { TeamSettingsForm } from "./TeamSettingsForm";
import { Box, Divider, Flex, Heading, Stack, HStack } from "@chakra-ui/react";
import { TeamCreateButton } from "./TeamCreateButton";
import { TeamMemberTable } from "./TeamMemberTable";
import { api } from "~/utils/api";
import { TeamDeleteButton } from "./TeamDeleteButton";
import { TeamLeaveButton } from "./TeamLeaveButton";

export const TeamSettingsView = ({
  team,
  refetch,
}: {
  team: Team;
  refetch: VoidFunction;
}) => {
  const { data: membership } = api.team.membership.useQuery(team.id);

  const isAdmin =
    membership?.role === UserTeamMembershipRole.ADMIN ||
    membership?.role === UserTeamMembershipRole.OWNER;
  return (
    <Box p={4} borderWidth={1} rounded={4}>
      <Stack gap={2}>
        <Flex justifyContent={"space-between"}>
          <Heading size={"md"}>Team</Heading>
          <HStack gap={2}>
            <TeamLeaveButton
              team={team}
              isDisabled={
                membership
                  ? membership.role === UserTeamMembershipRole.OWNER
                  : true
              }
            />
            {membership?.role === UserTeamMembershipRole.OWNER && (
              <TeamDeleteButton team={team} />
            )}
            <TeamCreateButton />
          </HStack>
        </Flex>
        {isAdmin && <TeamSettingsForm team={team} refetch={refetch} />}
        {membership && isAdmin && (
          <>
            <Divider />
            <TeamMemberTable team={team} membership={membership} />
          </>
        )}
      </Stack>
    </Box>
  );
};
