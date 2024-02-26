import { Select, Flex, type SelectProps } from "@chakra-ui/react";
import { useEffect } from "react";
import { useTeam } from "~/lib/SelectedTeamProvider";

export const NavTeamSelector = ({ w = "180px" }: Pick<SelectProps, "w">) => {
  const { team, setTeam, teams, isLoading } = useTeam();

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
    <Flex justifyContent={"space-between"} alignItems={"center"} w={w}>
      <Select
        variant={"outline"}
        w={"full"}
        onChange={(e) => setTeam(teams.find((t) => t.id === e.target.value))}
      >
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </Select>
    </Flex>
  );
};
