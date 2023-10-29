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
import { FiSave } from "react-icons/fi";
import { api } from "~/utils/api";
import React, { useState } from "react";
import { CreateAssetTypeExplanation } from "./CreateAssetTypeExplanation";
import { AssetTypeBreadcrumbs } from "../AssetTypeBreadcrumbs";
import { AssetType } from "~/server/lib/asset-types/assetType";
import {
  CustomFieldCreationForm,
  TemporaryCustomField,
} from "./CustomFieldCreationForm";

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
  const [fields, setFields] = useState<TemporaryCustomField[]>([]);
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

  const [name, setName] = useState("");
  const [parentTag, setParentTag] = useState<number>();

  const handleAssetTypeCreation = async () => {
    if (!defaultTeam) {
      throw new Error("No default team found");
    }
    if (name.length === 0) {
      return;
    }
    await createAssetType({
      teamId: defaultTeam.id,
      name,
      parentId: parentTag,
      fields,
    });
    void refetchTags();
    setName("");
    setParentTag(undefined);
    setFields([]);
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
      <form onSubmit={handleAssetTypeCreation}>
        <Stack gap={2}>
          <FormControl>
            <FormLabel>Parent Asset Type</FormLabel>
            <Select
              placeholder="None"
              value={parentTag}
              onChange={(e) => setParentTag(parseInt(e.target.value, 10))}
            >
              {assetTypes && renderNestedAssetTypes(assetTypes)}
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
          <CustomFieldCreationForm fields={fields} setFields={setFields} />
          <Flex justifyContent="flex-end">
            <Button
              leftIcon={<FiSave />}
              colorScheme="green"
              onClick={handleAssetTypeCreation}
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
