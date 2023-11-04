import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Select,
  Stack,
} from "@chakra-ui/react";
import { AssetBreadcrumbs } from "../AssetBreadcrumbs";
import { CreateEditAssetExplanation } from "./CreateEditAssetExplanation";
import { AssetCreateEditRequest } from "~/server/lib/assets/assetCreateEditRequest";
import { useFieldArray, useForm } from "react-hook-form";
import { api } from "~/utils/api";
import { Asset } from "@prisma/client";
import { AssetTypeSelector } from "~/components/asset-types/AssetTypeSelector";
import { FiSave } from "react-icons/fi";
import { numberOrNull } from "~/lib/reactHookFormUtils";
import { AssetCreateEditCustomFieldsForm } from "./AssetCreateEditCustomFieldsForm";
import { useEffect } from "react";

export const AssetCreateEditForm = ({
  asset,
  refetch,
}: {
  asset?: Asset;
  refetch?: VoidFunction;
}) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AssetCreateEditRequest>();
  const { fields: customFieldValues } = useFieldArray({
    control,
    name: "customFieldValues",
  });
  const { data: defaultTeam, isLoading: isLoadingDefaultTeam } =
    api.user.defaultTeam.useQuery();
  const {
    mutateAsync: updateAsset,
    isError: isErrorUpdate,
    isLoading: isLoadingUpdate,
    isSuccess: assetUpdated,
  } = api.asset.update.useMutation();
  const {
    mutateAsync: createAsset,
    isError: isErrorCreate,
    isLoading: isLoadingCreate,
    isSuccess: assetCreated,
  } = api.asset.create.useMutation();
  const selectedAssetTypeId = watch("assetTypeId");
  const { data: assetType, isLoading: isLoadingAssetType } =
    api.assetType.getWithFields.useQuery(selectedAssetTypeId, {
      enabled: !!selectedAssetTypeId,
    });

  const hasNoFields = assetType?.fields?.length === 0;

  const onSubmit = (data: AssetCreateEditRequest) => {
    if (!defaultTeam) {
      throw new Error("No default team found");
    }

    if (asset) {
      onUpdate(data);
    } else {
      onCreate(data);
    }
  };

  const onCreate = async (data: AssetCreateEditRequest) => {
    if (!defaultTeam) {
      throw new Error("No default team found");
    }
    await createAsset({
      ...data,
      teamId: defaultTeam.id,
    });
    reset();
  };

  const onUpdate = async (data: AssetCreateEditRequest) => {
    if (!defaultTeam) {
      throw new Error("No default team found");
    }
    await updateAsset({
      ...data,
      teamId: defaultTeam.id,
    });
    refetch?.();
  };

  useEffect(() => {
    if (!assetType?.fields) {
      setValue("customFieldValues", []);
      return;
    }
    setValue(
      "customFieldValues",
      assetType.fields.map((field) => ({
        fieldId: field.id,
        value: "",
      }))
    );
  }, [assetType?.fields]);

  return (
    <Stack gap={2}>
      <AssetBreadcrumbs create />
      <CreateEditAssetExplanation />
      {isErrorCreate && (
        <Alert status="error">
          <AlertIcon />
          <AlertDescription>
            Creating your asset was not successful
          </AlertDescription>
        </Alert>
      )}
      {isErrorUpdate && (
        <Alert status="error">
          <AlertIcon />
          <AlertDescription>
            Saving your changes to the asset was not successful
          </AlertDescription>
        </Alert>
      )}
      {assetCreated && (
        <Alert status="success">
          <AlertIcon />
          <AlertDescription>Asset was created successfully</AlertDescription>
        </Alert>
      )}
      {assetUpdated && (
        <Alert status="success">
          <AlertIcon />
          <AlertDescription>
            Changes to asset were saved successfully
          </AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={2}>
          <AssetTypeSelector
            label="Asset Type"
            {...register("assetTypeId", {
              required: true,
              setValueAs: numberOrNull,
            })}
          />
          {hasNoFields && (
            <Alert status="error">
              <AlertIcon />
              <AlertDescription>
                Creating an asset of this asset type is not possible. The
                selected asset type does not have any fields.
              </AlertDescription>
            </Alert>
          )}
          {assetType?.fields && assetType.fields.length > 0 && (
            <AssetCreateEditCustomFieldsForm
              assetType={assetType}
              control={control}
              customFieldValues={customFieldValues}
            />
          )}
          <Flex justifyContent="flex-end">
            <Button
              leftIcon={<FiSave />}
              colorScheme="green"
              type="submit"
              isLoading={
                isLoadingDefaultTeam ||
                isLoadingCreate ||
                isLoadingUpdate ||
                (selectedAssetTypeId ? isLoadingAssetType : false)
              }
              isDisabled={hasNoFields || !assetType || !selectedAssetTypeId}
            >
              {asset ? "Save" : "Create"}
            </Button>
          </Flex>
        </Stack>
      </form>
    </Stack>
  );
};
