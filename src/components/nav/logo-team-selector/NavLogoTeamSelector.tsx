import { Flex, Text } from "@chakra-ui/react";
import { LogoButton } from "./LogoButton";
import { NavTeamSelector } from "./NavTeamSelector";

export const NavLogoTeamSelector = () => {
  return (
    <Flex justify={"space-between"} alignItems={"center"} gap={2} w={"full"}>
      <LogoButton />
      <Text mr={2} color={"gray.600"} fontWeight={"bold"}>
        /
      </Text>
      <NavTeamSelector />
    </Flex>
  );
};
