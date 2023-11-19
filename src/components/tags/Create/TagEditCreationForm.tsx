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
import React from "react";
import { TagSelector } from "~/components/common/TagSelector";
import { type Tag } from "~/server/lib/tags/tag";
import { Controller, useForm } from "react-hook-form";
import { type TagCreateEditRequest } from "~/server/lib/tags/tagCreateEditRequest";
import { FormFieldRequiredErrorMessage } from "~/components/common/FormFieldRequiredErrorMessage";

export const TagEditCreationForm = ({
  tag,
  refetch,
}: {
  tag?: Tag;
  refetch?: VoidFunction;
}) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<TagCreateEditRequest>({
    defaultValues: {
      id: tag?.id,
      name: tag?.name,
      parentId: tag?.parentId,
      teamId: tag?.teamId ?? undefined,
    },
  });
  const { data: defaultTeam, isLoading: isLoadingDefaultTeam } =
    api.user.defaultTeam.useQuery();

  const {
    mutateAsync: createTag,
    isError: isErrorCreation,
    isLoading: isLoadingCreation,
    isSuccess: tagCreated,
  } = api.tag.create.useMutation();
  const {
    mutateAsync: updateTag,
    isError: isErrorUpdate,
    isLoading: isLoadingUpdate,
    isSuccess: tagUpdated,
  } = api.tag.update.useMutation();

  const onSubmit = (data: TagCreateEditRequest) => {
    if (!defaultTeam) {
      throw new Error("No default team found");
    }

    if (tag) {
      void onUpdate(data);
    } else {
      void onCreate(data);
    }
  };

  const onCreate = async (data: TagCreateEditRequest) => {
    if (!defaultTeam) {
      throw new Error("No default team found");
    }
    await createTag({
      ...data,
      id: null,
      teamId: defaultTeam.id,
    });
    reset();
  };

  const onUpdate = async (data: TagCreateEditRequest) => {
    if (!defaultTeam) {
      throw new Error("No default team found");
    }
    await updateTag({
      ...data,
      teamId: defaultTeam.id,
    });
    refetch?.();
  };

  return (
    <Stack gap={2}>
      <TagsBreadcrumbs create={!tag} edit={tag?.id} />
      {!tag && <CreateTagExplanation />}
      {isErrorCreation && (
        <Alert status="error">
          <AlertIcon />
          <AlertDescription>
            Creating your tag was not successful
          </AlertDescription>
        </Alert>
      )}
      {isErrorUpdate && (
        <Alert status="error">
          <AlertIcon />
          <AlertDescription>
            Saving your changes to the tag was not successful
          </AlertDescription>
        </Alert>
      )}
      {tagCreated && (
        <Alert status="success">
          <AlertIcon />
          <AlertDescription>Tag was created successfully</AlertDescription>
        </Alert>
      )}
      {tagUpdated && (
        <Alert status="success">
          <AlertIcon />
          <AlertDescription>Tag was updated successfully</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={2}>
          <FormControl>
            <FormLabel>Parent Tag</FormLabel>
            <Controller
              name={"parentId"}
              control={control}
              render={({ field }) => (
                <TagSelector
                  value={field.value ?? undefined}
                  onChange={(tagId) => field.onChange(tagId)}
                  allowParentsOnly
                />
              )}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              autoFocus
              {...register("name", { required: true })}
            />
            {errors?.name && <FormFieldRequiredErrorMessage />}
          </FormControl>
          <Flex justifyContent="flex-end">
            <Button
              leftIcon={<FiSave />}
              colorScheme="green"
              type="submit"
              isDisabled={!isDirty}
              isLoading={
                isLoadingDefaultTeam || isLoadingUpdate || isLoadingCreation
              }
            >
              {tag ? "Save" : "Create"}
            </Button>
          </Flex>
        </Stack>
      </form>
    </Stack>
  );
};
