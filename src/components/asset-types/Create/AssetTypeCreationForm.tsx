import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Select,
  Stack,
} from "@chakra-ui/react";
import { FiSave } from "react-icons/fi";
import { api } from "~/utils/api";
import React, { useState } from "react";
import { CreateAssetTypeExplanation } from "./CreateAssetTypeExplanation";
import { AssetTypeBreadcrumbs } from "../AssetTypeBreadcrumbs";
import { AssetType } from "~/server/lib/asset-types/assetType";
import { CustomFieldCreationForm } from "./CustomFieldCreationForm";
import { useFieldArray, useForm } from "react-hook-form";
import { AssetTypeCreateRequestWithTemporaryFields } from "./types";
import { numberOrNull } from "~/lib/reactHookFormUtils";
import { FormFieldRequiredErrorMessage } from "~/components/common/FormFieldRequiredErrorMessage";

const renderNestedAssetTypes = (assetTypes: AssetType[], level = 0) => {
  return assetTypes.map((assetType) => (
    <React.Fragment key={assetType.id}>
      <option value={assetType.id}>
        {String.fromCharCode(160).repeat(level * 4)}
        {assetType.name}
      </option>
      {assetType.children &&
        renderNestedAssetTypes(assetType.children, level + 1)}
    </React.Fragment>
  ));
};

export const AssetTypeCreationForm = () => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AssetTypeCreateRequestWithTemporaryFields>({
    defaultValues: { fields: [] },
  });
  const { fields, append, prepend, remove, move } = useFieldArray({
    control,
    name: "fields",
  });
  const { data: defaultTeam, isLoading: isLoadingDefaultTeam } =
    api.user.defaultTeam.useQuery();

  const { data: assetTypes, refetch: refetchTags } =
    api.assetType.list.useQuery(
      { teamId: defaultTeam?.id ?? "" },
      { enabled: !!defaultTeam }
    );
  const {
    mutateAsync: createAssetType,
    isError,
    isLoading: isLoadingCreation,
    isSuccess: assetTypeCreated,
  } = api.assetType.create.useMutation();

  const onSubmit = async (data: AssetTypeCreateRequestWithTemporaryFields) => {
    if (!defaultTeam) {
      throw new Error("No default team found");
    }
    await createAssetType({
      ...data,
      teamId: defaultTeam.id,
    });
    remove();
    reset();
    setValue("fields", []);
    void refetchTags();
  };

  return (
    <Stack gap={2}>
      <AssetTypeBreadcrumbs create />
      <CreateAssetTypeExplanation />
      {isError && (
        <Alert status="error">
          <AlertIcon />
          <AlertDescription>
            Creating your asset type was not successful
          </AlertDescription>
        </Alert>
      )}
      {assetTypeCreated && (
        <Alert status="success">
          <AlertIcon />
          <AlertDescription>
            Asset type was created successfully
          </AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={2}>
          <FormControl>
            <FormLabel>Parent Asset Type</FormLabel>
            <Select
              placeholder="None"
              {...register("parentId", {
                setValueAs: numberOrNull,
              })}
            >
              {assetTypes && renderNestedAssetTypes(assetTypes)}
            </Select>
          </FormControl>
          <FormControl isInvalid={!!errors.name}>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              autoFocus
              {...register("name", { required: true })}
            />
            {errors.name && <FormFieldRequiredErrorMessage />}
          </FormControl>
          <CustomFieldCreationForm
            control={control}
            fields={fields}
            append={append}
            prepend={prepend}
            remove={remove}
            move={move}
          />
          <Flex justifyContent="flex-end">
            <Button
              leftIcon={<FiSave />}
              colorScheme="green"
              type="submit"
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
