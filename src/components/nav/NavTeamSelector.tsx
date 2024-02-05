import { HStack, Select, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import { useTeam } from "~/lib/SelectedTeamProvider";
import { api } from "~/utils/api";

export const NavTeamSelector = () => {
  const { data: teams, isLoading } = api.team.list.useQuery();
  const { team, setTeam } = useTeam();

  useEffect(() => {
    if (isLoading || !teams) {
      return;
    }
    if (!team) {
      setTeam(teams[0]);
    }
  }, [isLoading, teams, team, setTeam]);

  if (!teams) {
    return null;
  }

  return (
    <HStack justifyContent={"space-between"} w={"full"}>
      <Text color={"gray.400"} fontWeight={"bold"}>
        /
      </Text>
      <Select
        variant={"outline"}
        width={"180px"}
        onChange={(e) => setTeam(teams.find((t) => t.id === e.target.value))}
      >
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </Select>
    </HStack>
  );
};
