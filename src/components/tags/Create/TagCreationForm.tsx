import { Stack, VStack } from "@chakra-ui/react";
import { TagsBreadcrumbs } from "../TagsBreadcrumbs";
import { CreateTagExplanation } from "./CreateTagExplanation";

export const TagCreationForm = () => {
  return (
    <Stack gap={2}>
      <TagsBreadcrumbs create />
      <CreateTagExplanation />
    </Stack>
  );
};
