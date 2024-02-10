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
  const { data: teamData, refetch } = api.team.get.useQuery(team?.id ?? "", {
    enabled: !!team,
  });

  useEffect(() => {
    if (teamData && team && teamData.id === team.id) {
      setTeam(teamData);
    }
  }, [teamData, team, setTeam]);

  return (
    <SelectedTeamContext.Provider
      value={{
        team,
        setTeam,
        refetch: async () => {
          await refetch();
        },
      }}
    >
      {children}
    </SelectedTeamContext.Provider>
  );
};
