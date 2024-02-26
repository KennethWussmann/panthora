import { Box, Flex, Stack, Text, useColorModeValue } from "@chakra-ui/react";
import { NavItems } from "./NavItems";
import { NavSearchBar } from "./search/NavSearchBar";
import { NavLogout } from "./NavLogout";
import Link from "next/link";
import { NavLogoTeamSelector } from "./logo-team-selector/NavLogoTeamSelector";

export const NavSidebar = () => {
  return (
    <Flex maxW="auto" p={4} bg={useColorModeValue("gray.100", "gray.900")}>
      <Stack justify="space-between">
        <Stack spacing={6} shouldWrapChildren>
          <NavLogoTeamSelector />
          <NavSearchBar />
          <Stack>
            <NavItems />
          </Stack>
        </Stack>
        <Box>
          <Text fontSize="sm" color="gray.500">
            <Link href="https://github.com/KennethWussmann/panthora">
              Version {process.env.NEXT_PUBLIC_VERSION ?? "unknown"}
            </Link>
          </Text>
          <NavLogout />
        </Box>
      </Stack>
    </Flex>
  );
};
