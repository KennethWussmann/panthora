import { Box, Flex, Icon, IconButton, Text, Tooltip } from "@chakra-ui/react";
import { UserRole } from "@prisma/client";
import { signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { FiLogOut, FiShield } from "react-icons/fi";
import { useUser } from "@/lib/UserProvider";

export const NavLogout = () => {
  const { user } = useUser();
  const { push } = useRouter();

  return (
    <Flex justifyContent={"space-between"} alignItems={"center"}>
      <Text textStyle="sm" fontWeight="medium">
        {user?.email}
      </Text>
      {user?.role === UserRole.ADMIN && (
        <Tooltip label="You are an Admin" placement="top">
          <Box mt={2}>
            <Icon as={FiShield} h={5} w={5} />
          </Box>
        </Tooltip>
      )}
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
