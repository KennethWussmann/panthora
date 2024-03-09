import { Box, HStack, Heading, Stack } from "@chakra-ui/react";
import { FiBox } from "react-icons/fi";

export const AssetExplanation = () => {
  return (
    <Box p={4} borderWidth={1} rounded={4}>
      <Stack gap={2}>
        <HStack>
          <FiBox />
          <Heading size={"md"}>Assets</Heading>
        </HStack>
        <p>
          Assets are the things you want to keep track of. They can be anything
          and can have any number of custom fields. You can assign tags to them
          and search by them. To get started with creating assets you first need
          to create an asset type. They are the basis for your assets and define
          which fields assets have.
        </p>
      </Stack>
    </Box>
  );
};
