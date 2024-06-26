import { Box, HStack, Heading, Stack } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";

export const CreateTagExplanation = () => {
  return (
    <Box p={4} borderWidth={1} rounded={4}>
      <Stack gap={2}>
        <HStack>
          <FiPlus />
          <Heading size={"md"}>Create Tag</Heading>
        </HStack>
        <p>
          Tags allow you to organise your assets. You can assign tags to assets,
          create custom fields for tags and search by them. They are the basis
          for a good inventory and allow you to structure your storage in a way
          that makes sense to you.
        </p>
      </Stack>
    </Box>
  );
};
