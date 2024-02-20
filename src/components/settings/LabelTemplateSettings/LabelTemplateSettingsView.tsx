import { Box, Button, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import type { Team } from "@prisma/client";
import { LabelTemplateTable } from "./LabelTemplateTable";
import { FiPlus } from "react-icons/fi";
import { useRouter } from "next/router";

export const LabelTemplatesSettingsView = ({ team }: { team: Team }) => {
  const { push } = useRouter();
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

        <Flex justify="end">
          <Button
            leftIcon={<FiPlus />}
            colorScheme="green"
            onClick={() => push("/settings/team/label-templates/create")}
          >
            Create
          </Button>
        </Flex>
        <LabelTemplateTable team={team} />
      </Stack>
    </Box>
  );
};
