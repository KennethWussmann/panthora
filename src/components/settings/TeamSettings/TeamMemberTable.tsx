import { Progress, Table, Tbody, Th, Thead, Tr } from "@chakra-ui/react";
import { Team, UserTeamMembership } from "@prisma/client";
import { api } from "~/utils/api";
import { TeamMemberRow } from "./TeamMemberRow";

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
  return (
    <>
      {isLoadingMembers && <Progress size="xs" isIndeterminate />}
      {!isLoadingMembers && (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>E-Mail</Th>
              <Th>Role</Th>
              <Th>Actions</Th>
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
      )}
    </>
  );
};
