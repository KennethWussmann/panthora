import { Heading, Stack } from "@chakra-ui/react";
import { SearchSettingsForm } from "./SearchSettings/SearchSettingsForm";
import { TeamSettingsForm } from "./TeamSettingsForm";
import { LabelTemplatesSettingsView } from "./LabelTemplateSettings/LabelTemplateSettingsView";
import { useTeam } from "~/lib/SelectedTeamProvider";

export const SettingsForm = () => {
  const { team, refetch } = useTeam();

  if (!team) {
    return null;
  }
  return (
    <Stack gap={4}>
      <Heading size={"lg"}>Settings</Heading>
      <TeamSettingsForm team={team} refetch={refetch} />
      <LabelTemplatesSettingsView team={team} />
      <SearchSettingsForm team={team} />
    </Stack>
  );
};
