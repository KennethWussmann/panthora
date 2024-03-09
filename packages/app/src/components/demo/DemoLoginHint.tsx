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

export const DemoLoginHint = () => {
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
            This is a demo instance.{" "}
            <b>All data will be reset every 24 hours.</b>
          </Text>
          <Text>
            Register a new account with any email and password or login with a
            3rd party provider. <b>No email verification is required.</b>
          </Text>
        </Stack>
      </Flex>
    </Box>
  );
};
