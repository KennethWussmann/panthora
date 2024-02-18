import { Divider, Heading, VStack } from "@chakra-ui/react";
import { type Control } from "react-hook-form";
import { type AssetType } from "~/server/lib/asset-types/assetType";
import {
  type AssetCreateEditCustomFieldValue,
  type AssetCreateEditRequest,
} from "~/server/lib/assets/assetCreateEditRequest";
import { AssetCreateEditCustomFieldInput } from "./AssetCreateEditCustomFieldInput";

export const AssetCreateEditCustomFieldsForm = ({
  customFieldValues,
  control,
  assetType,
}: {
  assetType: AssetType;
  customFieldValues: AssetCreateEditCustomFieldValue[];
  control: Control<AssetCreateEditRequest, unknown>;
}) => {
  return (
    <VStack spacing={2} align={"stretch"}>
      <Heading size={"md"} mt={8}>
        Configuration
      </Heading>
      <Divider mb={2} />
      {customFieldValues.map((customFieldValue, index) => (
        <AssetCreateEditCustomFieldInput
          key={customFieldValue.fieldId}
          index={index}
          control={control}
          customField={
            assetType.fields.find(
              (field) => field.id === customFieldValue.fieldId
            )!
          }
        />
      ))}
    </VStack>
  );
};
