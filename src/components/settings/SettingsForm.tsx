import { Stack } from "@chakra-ui/react";
import { SearchSettingsForm } from "./SearchSettings/SearchSettingsForm";
import { LabelTemplatesSettingsView } from "./LabelTemplateSettings/LabelTemplateSettingsView";
import { useTeam } from "~/lib/SelectedTeamProvider";
import { TeamSettingsView } from "./TeamSettings/TeamSettingsView";

export const SettingsForm = () => {
  const { team, refetch } = useTeam();

  if (!team) {
    return null;
  }
  return (
    <Stack gap={4}>
      <TeamSettingsView team={team} refetch={refetch} />
      <LabelTemplatesSettingsView team={team} />
      <SearchSettingsForm team={team} />
    </Stack>
  );
};
