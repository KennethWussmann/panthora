import { HStack, Select, Text, Tooltip } from "@chakra-ui/react";
import { api } from "~/utils/api";

export const NavTeamSelector = () => {
  const { data: defaultTeam } = api.user.defaultTeam.useQuery();
  if (!defaultTeam) {
    return null;
  }
  return (
    <HStack justifyContent={"space-between"} w={"full"}>
      <Text color={"gray.400"} fontWeight={"bold"}>
        /
      </Text>
      <Tooltip label="Switching teams is not possible yet">
        <Select variant={"outline"} isDisabled width={"180px"}>
          <option value={defaultTeam.id}>{defaultTeam.name}</option>
        </Select>
      </Tooltip>
    </HStack>
  );
};
