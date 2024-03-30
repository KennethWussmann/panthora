import { Stack } from "@chakra-ui/react";
import { UserTable } from "./UserTable";
import { TeamTable } from "./TeamTable";

export const AdministrationView = () => {
  return (
    <Stack gap={4}>
      <UserTable />
      <TeamTable />
    </Stack>
  );
};
