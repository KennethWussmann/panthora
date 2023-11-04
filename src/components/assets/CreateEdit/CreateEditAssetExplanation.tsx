import { Box, HStack, Heading, Stack, VStack } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";

export const CreateEditAssetExplanation = () => {
  return (
    <Box p={4} borderWidth={1} rounded={4}>
      <Stack gap={2}>
        <HStack>
          <FiPlus />
          <Heading size={"md"}>Create Asset</Heading>
        </HStack>
        <p>
          Assets are the things you want to keep track of. Select the asset type
          to decide which fields you have to fill out.
        </p>
      </Stack>
    </Box>
  );
};
