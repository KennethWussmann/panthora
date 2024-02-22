import { api } from "~/utils/api";
import { useTeam } from "./SelectedTeamProvider";
import { UserTeamMembershipRole } from "@prisma/client";

export const useTeamMembershipRole = () => {
  const { team, refetch, isLoading: isLoadingTeam } = useTeam();
  const { data: membership, isLoading: isLoadingMembership } =
    api.team.membership.useQuery(team?.id ?? "", {
      enabled: !!team,
    });
  const isAdminOrOwner =
    membership?.role === UserTeamMembershipRole.ADMIN ||
    membership?.role === UserTeamMembershipRole.OWNER;

  if (team && !isLoadingTeam && !isLoadingMembership) {
    return {
      team,
      isLoading: false,
      role: membership?.role,
      refetch,
      isAdminOrOwner,
    };
  } else {
    return {
      team,
      isLoading: true,
      role: undefined,
      refetch,
      isAdminOrOwner,
    };
  }
};
