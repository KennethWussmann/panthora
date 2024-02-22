import { Box, Heading, Stack } from "@chakra-ui/react";
import { UserSettingsDetailsTable } from "./UserSettingsDetailsTable";
import { type UserMe } from "~/server/lib/user/user";
import { UserSettingsAccountConnectionsTable } from "./UserSettingsAccountConnectionsTable";

export const UserSettingsView = ({ user }: { user: UserMe }) => {
  return (
    <Box p={4} borderWidth={1} rounded={4}>
      <Stack gap={6}>
        <Heading size={"md"}>User</Heading>
        <UserSettingsDetailsTable />
        <UserSettingsAccountConnectionsTable user={user} />
      </Stack>
    </Box>
  );
};
