import { Heading, Tag } from "@chakra-ui/react";
import { type Team, type UserTeamMembership } from "@prisma/client";
import { api } from "@/utils/api";
import {
  TeamMemberActionsCell,
  TeamMemberRoleCell,
  canModifyMember,
} from "./TeamMemberRow";
import { TeamMemberInviteButton } from "./TeamMemberInviteButton";
import { createColumnHelper } from "@tanstack/react-table";
import { type Member } from "~/server/lib/team/member";
import { type TeamInvite } from "~/server/lib/team/teamInvite";
import { useMemo } from "react";
import { DataTable } from "~/components/common/DataTable/DataTable";
import { formatDistanceToNow } from "date-fns";
import { roleLabels } from "./roleLabels";
import { DeleteIconButton } from "~/components/common/DeleteIconButton";
import { useErrorHandlingMutation } from "~/lib/useErrorHandling";
import { FiUserPlus } from "react-icons/fi";

const memberColumnHelper = createColumnHelper<Member>();
const inviteColumnHelper = createColumnHelper<TeamInvite>();
export const TeamMemberTable = ({
  team,
  membership,
}: {
  team: Team;
  membership: UserTeamMembership;
}) => {
  const {
    data: members,
    isLoading: isLoadingMembers,
    refetch: refetchMembers,
  } = api.team.members.useQuery(team.id);
  const {
    data: invites,
    isLoading: isLoadingInvites,
    refetch: refetchInvites,
  } = api.team.pendingInvites.useQuery(team.id);
  const removeInvite = useErrorHandlingMutation(api.team.removePendingInvite);

  const memberColumns = useMemo(
    () => [
      memberColumnHelper.accessor("email", {
        id: "email",
        header: "E-Mail",
        cell: (cell) => cell.getValue(),
      }),
      memberColumnHelper.accessor("role", {
        id: "role",
        header: "Role",
        cell: (cell) => (
          <TeamMemberRoleCell
            ownMembership={membership}
            member={cell.row.original}
            onRoleChanged={refetchMembers}
          />
        ),
      }),
      memberColumnHelper.display({
        header: "Actions",
        meta: { isNumeric: true },
        cell: (cell) => {
          const member = cell.row.original;
          const canModify = canModifyMember(membership, member);
          return (
            <TeamMemberActionsCell
              member={member}
              canModify={canModify}
              onDelete={refetchMembers}
            />
          );
        },
      }),
    ],
    [refetchMembers, membership]
  );
  const inviteColumns = useMemo(
    () => [
      inviteColumnHelper.accessor("invitedEmail", {
        id: "invitedEmail",
        header: "E-Mail",
        cell: (cell) => cell.getValue(),
      }),
      inviteColumnHelper.accessor("invitedByEmail", {
        id: "invitedByEmail",
        header: "Invited by",
        cell: (cell) => cell.getValue(),
      }),
      inviteColumnHelper.accessor("role", {
        id: "role",
        header: "Role",
        cell: (cell) => <Tag>{roleLabels[cell.getValue()]}</Tag>,
      }),
      inviteColumnHelper.accessor("expires", {
        id: "expires",
        header: "Expires",
        cell: (cell) =>
          formatDistanceToNow(cell.getValue(), { addSuffix: true }),
      }),
      inviteColumnHelper.display({
        header: "Actions",
        meta: { isNumeric: true },
        cell: (cell) => (
          <DeleteIconButton
            itemName={cell.row.original.invitedEmail}
            onConfirm={async () => {
              await removeInvite.mutateAsync(cell.row.original.id);
              void refetchInvites();
            }}
          />
        ),
      }),
    ],
    [refetchInvites, removeInvite]
  );

  return (
    <>
      <Heading size={"sm"} mt={4} mb={2}>
        Members
      </Heading>
      <DataTable
        columns={memberColumns}
        data={members ?? []}
        isLoading={isLoadingMembers}
      />
      <Heading size={"sm"} mt={4} mb={2}>
        Pending Invites
      </Heading>
      <DataTable
        columns={inviteColumns}
        data={invites ?? []}
        isLoading={isLoadingInvites}
        tableActions={
          <TeamMemberInviteButton team={team} refetch={refetchInvites} />
        }
        emptyList={{
          icon: FiUserPlus,
          label: "Invite someone to join your team",
        }}
      />
    </>
  );
};
