import { Box, HStack, Heading, Stack, VStack } from "@chakra-ui/react";
import { FiFolder } from "react-icons/fi";

export const AssetTypeExplanation = () => {
  return (
    <Box p={4} borderWidth={1} rounded={4}>
      <Stack gap={2}>
        <HStack>
          <FiFolder />
          <Heading size={"md"}>Asset Types</Heading>
        </HStack>
        <p>
          With Asset Types you can create a template for your assets and define
          custom fields for them. You can then create assets based on these
          templates.
        </p>
      </Stack>
    </Box>
  );
};
