import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Spacer,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FiCheck, FiTrash } from "react-icons/fi";
import { useTeam } from "~/lib/SelectedTeamProvider";
import { useErrorHandlingMutation } from "~/lib/useErrorHandling";
import { TeamInvite } from "~/server/lib/team/teamInvite";
import { api } from "~/utils/api";

const TeamInvite = ({
  invite,
  refetch,
}: {
  invite: TeamInvite;
  refetch: () => Promise<void>;
}) => {
  const acceptInvite = useErrorHandlingMutation(api.team.invite.accept);
  const declineInvite = useErrorHandlingMutation(api.team.invite.decline);

  const onAccept = async () => {
    await acceptInvite.mutateAsync(invite.id);
    await refetch();
  };

  const onDecline = async () => {
    await declineInvite.mutateAsync(invite.id);
    await refetch();
  };

  return (
    <Alert status="info" justifyContent={"space-between"}>
      <AlertIcon />
      <Stack
        spacing="4"
        justifyContent={"space-between"}
        direction={{ base: "column", md: "row" }}
        w={"full"}
      >
        <Box>
          <Text fontWeight="bold">Pending Invitation</Text>
          <Text>
            User <b>{invite.invitedByEmail}</b> invites you to their team{" "}
            <b>{invite.teamName}</b>.
          </Text>
        </Box>
        <Spacer />
        <Stack
          direction={{ base: "column", md: "row" }}
          spacing="2"
          align={{ base: "stretch", md: "center" }}
        >
          <Button
            variant="ghost"
            colorScheme={"red"}
            onClick={onDecline}
            leftIcon={<FiTrash />}
          >
            Decline
          </Button>
          <Button
            variant="solid"
            colorScheme={"green"}
            onClick={onAccept}
            leftIcon={<FiCheck />}
          >
            Accept
          </Button>
        </Stack>
      </Stack>
    </Alert>
  );
};

export const TeamInviteBanner = () => {
  const { refetch: refetchTeams } = useTeam();
  const { data: invites, refetch } = api.team.invite.list.useQuery(undefined, {
    refetchInterval: 1000 * 60 * 5,
  });

  if (!invites || invites.length === 0) {
    return null;
  }

  return (
    <VStack mb={4} gap={2}>
      {invites?.map((invite) => (
        <TeamInvite
          key={invite.id}
          invite={invite}
          refetch={async () => {
            await refetch();
            await refetchTeams();
          }}
        />
      ))}
    </VStack>
  );
};
