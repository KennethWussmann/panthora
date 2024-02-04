import { Heading, Stack } from "@chakra-ui/react";
import { SearchSettingsForm } from "./SearchSettings/SearchSettingsForm";
import { TeamSettingsForm } from "./TeamSettingsForm";
import { api } from "~/utils/api";
import { LabelTemplatesSettingsView } from "./LabelTemplateSettings/LabelTemplateSettingsView";

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
      <LabelTemplatesSettingsView team={defaultTeam} />
      <SearchSettingsForm team={defaultTeam} />
    </Stack>
  );
};
