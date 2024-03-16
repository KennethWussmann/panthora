import { Box, HStack, Heading, Stack } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";

export const CreateAssetTypeExplanation = () => {
  return (
    <Box p={4} borderWidth={1} rounded={4}>
      <Stack gap={2}>
        <HStack>
          <FiPlus />
          <Heading size={"md"}>Create Asset Type</Heading>
        </HStack>
        <p>
          Asset types are the templates that define the structure of your
          assets. You can create as many asset types as you need, and each asset
          type can have as many custom fields as you need.
        </p>
        <p>
          Asset types can extend other asset types, which means that they will
          inherit all of the custom fields of the asset type they extend. This
          is useful for creating asset types that are very similar to each
          other, but have a few differences.
        </p>
      </Stack>
    </Box>
  );
};
