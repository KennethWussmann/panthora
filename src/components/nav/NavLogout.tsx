import { Flex, HStack, IconButton, Text, Tooltip } from "@chakra-ui/react";
import { signOut, useSession } from "next-auth/react";
import { FiLogOut } from "react-icons/fi";

export const NavLogout = () => {
  const { data: session } = useSession();

  if (!session) {
    return;
  }

  return (
    <Flex justifyContent={"space-between"} alignItems={"center"}>
      <Text textStyle="sm" fontWeight="medium">
        {session.user.email}
      </Text>
      <Tooltip label="Log out">
        <IconButton
          variant={"ghost"}
          colorScheme="red"
          icon={<FiLogOut />}
          aria-label="Logout"
          onClick={() => void signOut()}
        />
      </Tooltip>
    </Flex>
  );
};
