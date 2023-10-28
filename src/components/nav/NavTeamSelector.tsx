import { Box, Flex, HStack, Select, Text } from "@chakra-ui/react";
import { FiChevronRight } from "react-icons/fi";
import { api } from "~/utils/api";

export const NavTeamSelector = () => {
  const { data: defaultTeam } = api.user.defaultTeam.useQuery();
  if (!defaultTeam) {
    return null;
  }
  return (
    <HStack justifyContent={"space-between"} w={"full"}>
      <Text>/</Text>
      <Select variant={"outline"}>
        <option value={defaultTeam.id}>{defaultTeam.name}</option>
      </Select>
    </HStack>
  );
};
