import { Box, Flex, Stack, Text, useColorModeValue } from "@chakra-ui/react";
import { NavItems } from "./NavItems";
import { NavSearchBar } from "./search/NavSearchBar";
import { NavLogout } from "./NavLogout";
import { NavLogoTeamSelector } from "./logo-team-selector/NavLogoTeamSelector";
import { Link } from "@chakra-ui/next-js";

const repoUrl = "https://github.com/KennethWussmann/panthora";
const version = process.env.NEXT_PUBLIC_VERSION ?? "unknown";
const linkTarget = ((version: string) => {
  if (version.includes(".")) {
    return `${repoUrl}/releases/tag/${version}`;
  } else if (version.length === 8) {
    return `${repoUrl}/commit/${version}`;
  } else {
    return repoUrl;
  }
})(version);

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
            <Link href={linkTarget} target="_blank">
              Version: {version}
            </Link>
          </Text>
          <NavLogout />
        </Box>
      </Stack>
    </Flex>
  );
};
