import { Flex, Hide, Show, Text } from "@chakra-ui/react";
import { LogoButton } from "./LogoButton";
import { NavTeamSelector } from "./NavTeamSelector";

export const NavLogoTeamSelector = () => {
  return (
    <Flex justify={"space-between"} alignItems={"center"} gap={2} w={"full"}>
      <Hide breakpoint="(max-width: 500px)">
        <LogoButton />
      </Hide>
      <Show breakpoint="(max-width: 500px)">
        <LogoButton showIcon />
      </Show>
      <Text mr={2} color={"gray.600"} fontWeight={"bold"}>
        /
      </Text>
      <NavTeamSelector w={["full", "full", "180px"]} />
    </Flex>
  );
};
