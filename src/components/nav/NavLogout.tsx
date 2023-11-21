import { Flex, IconButton, Text, Tooltip } from "@chakra-ui/react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FiLogOut } from "react-icons/fi";

export const NavLogout = () => {
  const { data: session } = useSession();
  const { push } = useRouter();

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
          onClick={async () => {
            await signOut({ redirect: false });
            void push("/auth/signin?logout=true");
          }}
        />
      </Tooltip>
    </Flex>
  );
};
