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
import { CustomFieldCreationForm } from "./CustomFieldCreateEditForm";
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

export const AssetTypeCreateEditForm = ({
  assetType,
  refetch,
}: {
  assetType?: AssetType;
  refetch?: VoidFunction;
}) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AssetTypeCreateRequestWithTemporaryFields>({
    defaultValues: assetType
      ? {
          id: assetType.id,
          name: assetType.name,
          parentId: assetType.parentId,
          fields: assetType.fields,
        }
      : {
          fields: [],
        },
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
    isError: isErrorCreation,
    isLoading: isLoadingCreation,
    isSuccess: assetTypeCreated,
  } = api.assetType.create.useMutation();
  const {
    mutateAsync: updateAssetType,
    isError: isErrorUpdate,
    isLoading: isLoadingUpdate,
    isSuccess: assetTypeUpdated,
  } = api.assetType.update.useMutation();

  const onSubmit = (data: AssetTypeCreateRequestWithTemporaryFields) => {
    if (!defaultTeam) {
      throw new Error("No default team found");
    }

    if (assetType) {
      onUpdate(data);
    } else {
      onCreate(data);
    }
    refetchTags();
  };

  const onCreate = async (data: AssetTypeCreateRequestWithTemporaryFields) => {
    if (!defaultTeam) {
      throw new Error("No default team found");
    }
    await createAssetType({
      ...data,
      id: null,
      teamId: defaultTeam.id,
    });
    remove();
    reset();
    setValue("fields", []);
    refetchTags();
  };

  const onUpdate = async (data: AssetTypeCreateRequestWithTemporaryFields) => {
    if (!defaultTeam) {
      throw new Error("No default team found");
    }
    await updateAssetType({
      ...data,
      teamId: defaultTeam.id,
    });
    refetch?.();
    refetchTags();
  };

  return (
    <Stack gap={2}>
      <AssetTypeBreadcrumbs create={!assetType} edit={assetType?.id} />
      <CreateAssetTypeExplanation />
      {isErrorCreation && (
        <Alert status="error">
          <AlertIcon />
          <AlertDescription>
            Creating your asset type was not successful
          </AlertDescription>
        </Alert>
      )}
      {isErrorUpdate && (
        <Alert status="error">
          <AlertIcon />
          <AlertDescription>
            Saving your changes to the asset type was not successful
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
      {assetTypeUpdated && (
        <Alert status="success">
          <AlertIcon />
          <AlertDescription>
            Changes to asset type were saved successfully
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
              isLoading={
                isLoadingDefaultTeam || isLoadingCreation || isLoadingUpdate
              }
            >
              {assetType ? "Save" : "Create"}
            </Button>
          </Flex>
        </Stack>
      </form>
    </Stack>
  );
};
