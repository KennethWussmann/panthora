import { Flex, Stack, useColorModeValue } from "@chakra-ui/react";
import { NavItems } from "./NavItems";
import { Logo } from "./Logo";
import { NavSearchBar } from "./search/NavSearchBar";
import { NavLogout } from "./NavLogout";
import { NavTeamSelector } from "./NavTeamSelector";

export const NavSidebar = () => {
  return (
    <Flex
      maxW="auto"
      py={{ base: "6", sm: "8" }}
      px={{ base: "4", sm: "6" }}
      bg={useColorModeValue("gray.100", "gray.900")}
    >
      <Stack justify="space-between">
        <Stack spacing={{ base: "5", sm: "6" }} shouldWrapChildren>
          <Flex justify={"space-between"}>
            <Logo />
            <NavTeamSelector />
          </Flex>
          <NavSearchBar />
          <Stack>
            <NavItems />
          </Stack>
        </Stack>
        <NavLogout />
      </Stack>
    </Flex>
  );
};
