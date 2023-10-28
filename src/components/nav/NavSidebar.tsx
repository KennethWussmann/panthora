import { Divider, Flex, Stack, useColorModeValue } from "@chakra-ui/react";
import { NavItems } from "./NavItems";
import { Logo } from "./Logo";
import { NavSearchBar } from "./NavSearchBar";
import { NavLogout } from "./NavLogout";

export const NavSidebar = () => {
  return (
    <Flex
      maxW="auto"
      py={{ base: "6", sm: "8" }}
      px={{ base: "4", sm: "6" }}
      bg={useColorModeValue("gray.100", "gray.900")}
    >
      <Stack justify="space-between" spacing="1">
        <Stack spacing={{ base: "5", sm: "6" }} shouldWrapChildren>
          <Logo w={"100%"} />
          <NavSearchBar />
          <Divider />
          <Stack spacing="1">
            <NavItems />
          </Stack>
        </Stack>
        <NavLogout />
      </Stack>
    </Flex>
  );
};
