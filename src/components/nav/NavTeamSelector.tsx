import { Box, Flex, HStack, Select, Text, Tooltip } from "@chakra-ui/react";
import { FiChevronRight } from "react-icons/fi";
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
        <Select variant={"outline"} isDisabled minWidth={"100px"}>
          <option value={defaultTeam.id}>{defaultTeam.name}</option>
        </Select>
      </Tooltip>
    </HStack>
  );
};
