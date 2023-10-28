import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
} from "@chakra-ui/react";
import { TagsBreadcrumbs } from "../TagsBreadcrumbs";
import { CreateTagExplanation } from "./CreateTagExplanation";
import { FiSave } from "react-icons/fi";
import { api } from "~/utils/api";
import React, { useState } from "react";
import { Tag } from "~/server/lib/tags/tag";

const renderNestedTags = (tags: Tag[], level = 0) => {
  return tags.map((tag) => (
    <React.Fragment key={tag.id}>
      <option value={tag.id}>
        {String.fromCharCode(160).repeat(level * 4)}
        {tag.name}
      </option>
      {tag.children && renderNestedTags(tag.children, level + 1)}
    </React.Fragment>
  ));
};

export const TagCreationForm = () => {
  const { data: defaultTeam, isLoading: isLoadingDefaultTeam } =
    api.user.defaultTeam.useQuery();

  const { data: tags, refetch: refetchTags } = api.tag.list.useQuery(
    { teamId: defaultTeam?.id ?? "" },
    { enabled: !!defaultTeam }
  );
  const {
    mutateAsync: createTag,
    isError,
    isLoading: isLoadingCreation,
    isSuccess: tagCreated,
  } = api.tag.create.useMutation();

  const [name, setName] = useState("");
  const [parentTag, setParentTag] = useState<number>();

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
    void refetchTags();
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
            <Select
              placeholder="None"
              value={parentTag}
              onChange={(e) => setParentTag(parseInt(e.target.value, 10))}
            >
              {tags && renderNestedTags(tags)}
            </Select>
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
