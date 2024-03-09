import {
  Flex,
  Heading,
  Progress,
  Table,
  TableContainer,
  Tbody,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import {
  type Team,
  type UserTeamMembership,
  UserTeamMembershipRole,
} from "@prisma/client";
import { api } from "@/utils/api";
import { TeamMemberRow } from "./TeamMemberRow";
import { TeamMemberInviteButton } from "./TeamMemberInviteButton";
import { TeamInviteRow } from "./TeamInviteRow";

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
  return (
    <>
      {(isLoadingMembers || isLoadingInvites) && (
        <Progress size="xs" isIndeterminate />
      )}
      {!isLoadingMembers && (
        <>
          <Heading size={"sm"} mt={4}>
            Members
          </Heading>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>E-Mail</Th>
                  <Th>Role</Th>
                  <Th textAlign="right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {members?.map((member) => (
                  <TeamMemberRow
                    key={member.id}
                    member={member}
                    ownMembership={membership}
                    refetchMembers={refetchMembers}
                  />
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </>
      )}
      {!isLoadingInvites && invites && invites.length > 0 && (
        <>
          <Heading size={"sm"} mt={4}>
            Pending Invites
          </Heading>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>E-Mail</Th>
                  <Th>Invited by</Th>
                  <Th>Role</Th>
                  <Th>Expires</Th>
                  <Th textAlign="right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {invites?.map((invite) => (
                  <TeamInviteRow
                    key={invite.id}
                    invite={invite}
                    refetch={refetchInvites}
                  />
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </>
      )}

      {membership.role === UserTeamMembershipRole.OWNER && (
        <Flex justifyContent={"end"}>
          <TeamMemberInviteButton team={team} refetch={refetchInvites} />
        </Flex>
      )}
    </>
  );
};
