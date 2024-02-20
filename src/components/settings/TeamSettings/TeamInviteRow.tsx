import { Tag, Td, Tr } from "@chakra-ui/react";
import { type TeamInvite } from "~/server/lib/team/teamInvite";
import { roleLabels } from "./roleLabels";
import { DeleteIconButton } from "~/components/common/DeleteIconButton";
import { api } from "~/utils/api";
import { useErrorHandlingMutation } from "~/lib/useErrorHandling";
import { formatDistanceToNow } from "date-fns";

export const TeamInviteRow = ({
  invite,
  refetch,
}: {
  invite: TeamInvite;
  refetch: VoidFunction;
}) => {
  const removeInvite = useErrorHandlingMutation(api.team.removePendingInvite);
  const onRemove = async () => {
    await removeInvite.mutateAsync(invite.id);
    refetch();
  };
  return (
    <Tr>
      <Td>{invite.invitedEmail}</Td>
      <Td>{invite.invitedByEmail}</Td>
      <Td>
        <Tag>{roleLabels[invite.role]}</Tag>
      </Td>
      <Td>{formatDistanceToNow(invite.expires, { addSuffix: true })}</Td>

      <Td textAlign="right">
        <DeleteIconButton itemName={invite.invitedEmail} onConfirm={onRemove} />
      </Td>
    </Tr>
  );
};
