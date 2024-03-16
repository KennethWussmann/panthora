import {
  Box,
  Flex,
  Icon,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiInfo } from "react-icons/fi";
import { useServerConfig } from "@/lib/useServerConfig";

export const DemoDataHint = () => {
  const { config } = useServerConfig();
  const bgColor = useColorModeValue("blue.50", "blue.900");
  if (!config?.demoMode) {
    return null;
  }
  return (
    <Box borderWidth={1} rounded={"md"} p={4} bgColor={bgColor}>
      <Flex gap={4}>
        <Icon as={FiInfo} h={"20px"} w={"20px"} />
        <Stack gap={4}>
          <Text>
            This is a demo instance. Therefore{" "}
            <b>we will create some demo data</b> in your new team for you to
            explore and play around with. Usually, you would start with an empty
            team.
          </Text>
        </Stack>
      </Flex>
    </Box>
  );
};
