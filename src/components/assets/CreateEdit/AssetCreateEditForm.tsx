import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Flex,
  Stack,
} from "@chakra-ui/react";
import { AssetBreadcrumbs } from "../AssetBreadcrumbs";
import { CreateAssetExplanation } from "./CreateAssetExplanation";
import { type AssetCreateEditRequest } from "~/server/lib/assets/assetCreateEditRequest";
import { useFieldArray, useForm } from "react-hook-form";
import { api } from "~/utils/api";
import { AssetTypeSelector } from "~/components/asset-types/AssetTypeSelector";
import { FiSave } from "react-icons/fi";
import { AssetCreateEditCustomFieldsForm } from "./AssetCreateEditCustomFieldsForm";
import { useEffect } from "react";
import { type AssetWithFields } from "~/server/lib/assets/asset";
import { useErrorHandlingMutation } from "~/lib/useErrorHandling";

export const AssetCreateEditForm = ({
  asset,
  refetch,
}: {
  asset?: AssetWithFields;
  refetch?: VoidFunction;
}) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isDirty },
  } = useForm<AssetCreateEditRequest>(
    asset
      ? {
          defaultValues: {
            id: asset.id,
            assetTypeId: asset.assetTypeId,
            teamId: asset.teamId ?? undefined,
            customFieldValues:
              asset.assetType.fields?.map((field) => {
                const customFieldValue = asset.fieldValues?.find(
                  (value) => value.customFieldId === field.id
                );
                return customFieldValue
                  ? {
                      fieldId: customFieldValue.customFieldId,
                      value: customFieldValue.value,
                    }
                  : {
                      fieldId: field.id,
                      value: "",
                    };
              }) ?? [],
          },
        }
      : undefined
  );
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
  } = useErrorHandlingMutation(api.asset.update);
  const {
    mutateAsync: createAsset,
    isError: isErrorCreate,
    isLoading: isLoadingCreate,
    isSuccess: assetCreated,
  } = useErrorHandlingMutation(api.asset.create);
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
      void onUpdate(data);
    } else {
      void onCreate(data);
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
    console.log(data);
    await updateAsset({
      ...data,
      teamId: defaultTeam.id,
    });
    refetch?.();
  };

  useEffect(() => {
    if (asset) {
      return;
    }
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
  }, [asset, assetType?.fields, setValue]);

  return (
    <Stack gap={2}>
      <AssetBreadcrumbs
        create={!asset}
        edit={asset?.id ? String(asset.id) : undefined}
      />
      {!asset && <CreateAssetExplanation />}
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
          {!asset && (
            <AssetTypeSelector
              label="Asset Type"
              {...register("assetTypeId", {
                required: true,
              })}
            />
          )}
          {hasNoFields && (
            <Alert status="error">
              <AlertIcon />
              <AlertDescription>
                Creating an asset of this asset type is not possible. The
                selected asset type does not have any fields.
              </AlertDescription>
            </Alert>
          )}
          {!assetType && (
            <Alert status="info">
              <AlertIcon />
              <AlertDescription>
                Select an asset type to get started
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
              isDisabled={
                hasNoFields || !assetType || !selectedAssetTypeId || !isDirty
              }
            >
              {asset ? "Save" : "Create"}
            </Button>
          </Flex>
        </Stack>
      </form>
    </Stack>
  );
};
