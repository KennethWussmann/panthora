import { Heading, Stack } from "@chakra-ui/react";
import { SearchSettingsForm } from "./SearchSettingsForm";
import { TeamSettingsForm } from "./TeamSettingsForm";
import { api } from "~/utils/api";

export const SettingsForm = () => {
  const {
    data: defaultTeam,
    isLoading: isLoadingDefaultTeam,
    refetch,
  } = api.user.defaultTeam.useQuery();

  if (isLoadingDefaultTeam || !defaultTeam) {
    return null;
  }
  return (
    <Stack gap={4}>
      <Heading size={"lg"}>Settings</Heading>
      <TeamSettingsForm team={defaultTeam} refetch={refetch} />
      <SearchSettingsForm team={defaultTeam} />
    </Stack>
  );
};
