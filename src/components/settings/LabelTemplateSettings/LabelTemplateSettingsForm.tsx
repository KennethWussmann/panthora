import { Box, Heading, Stack, Text } from "@chakra-ui/react";
import type { Team } from "@prisma/client";
import { LabelTemplateTable } from "./LabelTemplateTable";

export const LabelTemplatesSettingsForm = ({ team }: { team: Team }) => {
  return (
    <Box p={4} borderWidth={1} rounded={4}>
      <Stack gap={2}>
        <Heading size={"md"}>Label Templates</Heading>
        <Text>
          Label templates control the size, layout and content of labels that
          you can print for assets. You can create multiple labels for different
          sizes and use cases. When printing labels, you can select one of your
          label templates that suits your needs.
        </Text>
        <LabelTemplateTable team={team} />
      </Stack>
    </Box>
  );
};
