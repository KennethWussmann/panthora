import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Stack,
} from "@chakra-ui/react";
import { TagsBreadcrumbs } from "../TagsBreadcrumbs";
import { CreateTagExplanation } from "./CreateTagExplanation";
import { FiSave } from "react-icons/fi";
import { api } from "~/utils/api";
import React, { useState } from "react";
import { TagSelector } from "~/components/common/TagSelector";

export const TagCreationForm = () => {
  const { data: defaultTeam, isLoading: isLoadingDefaultTeam } =
    api.user.defaultTeam.useQuery();

  const {
    mutateAsync: createTag,
    isError,
    isLoading: isLoadingCreation,
    isSuccess: tagCreated,
  } = api.tag.create.useMutation();

  const [name, setName] = useState("");
  const [parentTag, setParentTag] = useState<string>();

  const handleTagCreation = async () => {
    if (!defaultTeam) {
      throw new Error("No default team found");
    }
    if (name.length === 0) {
      return;
    }
    await createTag({
      teamId: defaultTeam.id,
      name,
      parentId: parentTag,
    });
    setName("");
    setParentTag(undefined);
  };
  return (
    <Stack gap={2}>
      <TagsBreadcrumbs create />
      <CreateTagExplanation />
      {isError && (
        <Alert status="error">
          <AlertIcon />
          <AlertDescription>
            Creating your tag was not successful
          </AlertDescription>
        </Alert>
      )}
      {tagCreated && (
        <Alert status="success">
          <AlertIcon />
          <AlertDescription>Tag was created successfully</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleTagCreation}>
        <Stack gap={2}>
          <FormControl>
            <FormLabel>Parent Tag</FormLabel>
            <TagSelector value={parentTag} onChange={setParentTag} />
          </FormControl>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              isRequired
            />
          </FormControl>
          <Flex justifyContent="flex-end">
            <Button
              leftIcon={<FiSave />}
              colorScheme="green"
              onClick={handleTagCreation}
              isLoading={isLoadingDefaultTeam || isLoadingCreation}
            >
              Create
            </Button>
          </Flex>
        </Stack>
      </form>
    </Stack>
  );
};
