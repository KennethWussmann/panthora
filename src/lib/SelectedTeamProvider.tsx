import { usePrevious, useToast } from "@chakra-ui/react";
import { type Team } from "@prisma/client";
import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type SetStateAction,
  type Dispatch,
  useEffect,
} from "react";
import { api } from "~/utils/api";

type SelectedTeamContextType = {
  team: Team | undefined;
  setTeam: Dispatch<SetStateAction<Team | undefined>>;
  refetch: () => Promise<void>;
  teams: Team[] | undefined;
  isLoading: boolean;
};

const SelectedTeamContext = createContext<SelectedTeamContextType | undefined>(
  undefined
);

export const useTeam = (): SelectedTeamContextType => {
  const context = useContext(SelectedTeamContext);
  if (!context) {
    throw new Error("useTeam must be used within a SelectedTeamProvider");
  }
  return context;
};

type SelectedTeamProviderProps = {
  children: ReactNode;
};

export const SelectedTeamProvider: React.FC<SelectedTeamProviderProps> = ({
  children,
}) => {
  const [team, setTeam] = useState<Team | undefined>();
  const previousTeam = usePrevious(team);
  const {
    data: teamData,
    refetch,
    isLoading: isLoadingTeam,
  } = api.team.get.useQuery(team?.id ?? "", {
    enabled: team !== undefined,
  });
  const {
    data: teams,
    refetch: refetchTeams,
    isLoading: isLoadingTeams,
  } = api.team.list.useQuery();

  const toast = useToast();

  useEffect(() => {
    if (teamData && team && teamData.id === team.id) {
      setTeam(teamData);
    }
    if (teams && (!team || !teams.map((t) => t.id).includes(team.id))) {
      setTeam(teams[0]);
    }
  }, [teamData, team, setTeam, teams]);

  useEffect(() => {
    if (
      team &&
      team.id !== previousTeam?.id &&
      !isLoadingTeams &&
      teams &&
      teams.length > 1
    ) {
      toast({
        title: "Team updated",
        description: `You are now viewing the ${team.name} team`,
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    }
  }, [team, previousTeam, toast, teams, isLoadingTeams]);

  return (
    <SelectedTeamContext.Provider
      value={{
        team,
        setTeam,
        refetch: async () => {
          await Promise.all([refetch(), refetchTeams()]);
        },
        teams,
        isLoading: isLoadingTeam || isLoadingTeams,
      }}
    >
      {children}
    </SelectedTeamContext.Provider>
  );
};
