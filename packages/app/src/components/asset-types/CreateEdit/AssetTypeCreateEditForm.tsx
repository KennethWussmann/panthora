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
import { FiSave } from "react-icons/fi";
import { api } from "@/utils/api";
import React from "react";
import { CreateAssetTypeExplanation } from "./CreateAssetTypeExplanation";
import { type AssetType } from "@/server/lib/asset-types/assetType";
import { CustomFieldCreationForm } from "./CustomFieldCreateEditForm";
import { useFieldArray, useForm } from "react-hook-form";
import { type AssetTypeCreateRequestWithTemporaryFields } from "./types";
import { FormFieldRequiredErrorMessage } from "@/components/common/FormFieldRequiredErrorMessage";
import { AssetTypeSelector } from "../AssetTypeSelector";
import { useErrorHandlingMutation } from "@/lib/useErrorHandling";
import { useTeam } from "@/lib/SelectedTeamProvider";
import { Annotation } from "~/components/onboarding/annotation/Annotation";

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
    formState: { errors, isDirty },
  } = useForm<AssetTypeCreateRequestWithTemporaryFields>({
    defaultValues: assetType
      ? ({
          id: assetType.id,
          name: assetType.name,
          parentId: assetType.parentId,
          fields: assetType.fields.map((field) =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            ({
              ...field,
              type: field.fieldType,
              parentTagId: field.tagId,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            })
          ),
        } as unknown as AssetTypeCreateRequestWithTemporaryFields)
      : {
          fields: [],
        },
  });
  const { fields, append, prepend, remove, move } = useFieldArray({
    control,
    name: "fields",
  });
  const { team } = useTeam();

  const {
    mutateAsync: createAssetType,
    isError: isErrorCreation,
    isLoading: isLoadingCreation,
    isSuccess: assetTypeCreated,
  } = useErrorHandlingMutation(api.assetType.create);
  const {
    mutateAsync: updateAssetType,
    isError: isErrorUpdate,
    isLoading: isLoadingUpdate,
    isSuccess: assetTypeUpdated,
  } = useErrorHandlingMutation(api.assetType.update);

  const onSubmit = (data: AssetTypeCreateRequestWithTemporaryFields) => {
    if (!team) {
      throw new Error("No team selected");
    }

    if (assetType) {
      void onUpdate(data);
    } else {
      void onCreate(data);
    }
  };

  const onCreate = async (data: AssetTypeCreateRequestWithTemporaryFields) => {
    if (!team) {
      throw new Error("No team selected");
    }
    await createAssetType({
      ...data,
      parentId:
        !data.parentId || data.parentId.length === 0 ? null : data.parentId,
      id: null,
      teamId: team.id,
    });
    remove();
    reset();
    setValue("fields", []);
  };

  const onUpdate = async (data: AssetTypeCreateRequestWithTemporaryFields) => {
    if (!team) {
      throw new Error("No team selected");
    }
    await updateAssetType({
      ...data,
      parentId:
        !data.parentId || data.parentId.length === 0 ? null : data.parentId,
      teamId: team.id,
    });
    refetch?.();
  };

  return (
    <Stack gap={2}>
      {!assetType && <CreateAssetTypeExplanation />}
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
          <Annotation text={"1"} collection="create-asset-type-1">
            <AssetTypeSelector
              label="Parent Asset Type"
              {...register("parentId")}
            />
          </Annotation>
          <FormControl isInvalid={!!errors.name}>
            <FormLabel>Name</FormLabel>
            <Annotation text={"2"} collection="create-asset-type-1">
              <Input
                type="text"
                autoFocus
                {...register("name", { required: true })}
              />
            </Annotation>
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
              isLoading={!team || isLoadingCreation || isLoadingUpdate}
              isDisabled={!isDirty}
            >
              {assetType ? "Save" : "Create"}
            </Button>
          </Flex>
        </Stack>
      </form>
    </Stack>
  );
};
