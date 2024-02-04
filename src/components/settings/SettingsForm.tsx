import { Heading, Stack } from "@chakra-ui/react";
import { SearchSettingsForm } from "./SearchSettings/SearchSettingsForm";
import { TeamSettingsForm } from "./TeamSettingsForm";
import { api } from "~/utils/api";
import { LabelTemplatesSettingsForm } from "./LabelTemplateSettings/LabelTemplateSettingsForm";

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
      <LabelTemplatesSettingsForm team={defaultTeam} />
      <SearchSettingsForm team={defaultTeam} />
    </Stack>
  );
};
