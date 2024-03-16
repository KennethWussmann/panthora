import { Stack } from "@chakra-ui/react";
import { SearchSettingsForm } from "./SearchSettings/SearchSettingsForm";
import { LabelTemplatesSettingsView } from "./LabelTemplateSettings/LabelTemplateSettingsView";
import { TeamSettingsView } from "./TeamSettings/TeamSettingsView";
import { type Team } from "@prisma/client";

export const SettingsView = ({
  team,
  refetch,
}: {
  team: Team;
  refetch: VoidFunction;
}) => {
  return (
    <Stack gap={4}>
      <TeamSettingsView team={team} refetch={refetch} />
      <LabelTemplatesSettingsView team={team} />
      <SearchSettingsForm team={team} />
    </Stack>
  );
};
