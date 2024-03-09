import { Divider, Heading, VStack } from "@chakra-ui/react";
import { type Control } from "react-hook-form";
import { type AssetType } from "@/server/lib/asset-types/assetType";
import { type AssetCreateEditRequest } from "@/server/lib/assets/assetCreateEditRequest";
import { AssetCreateEditCustomFieldInput } from "./AssetCreateEditCustomFieldInput";

export const AssetCreateEditCustomFieldsForm = ({
  control,
  assetType,
}: {
  assetType: AssetType;
  control: Control<AssetCreateEditRequest, unknown>;
}) => {
  return (
    <VStack spacing={2} align={"stretch"}>
      <Heading size={"md"} mt={8}>
        Configuration
      </Heading>
      <Divider mb={2} />
      {assetType.fields.map((field, index) => (
        <AssetCreateEditCustomFieldInput
          key={field.id}
          index={index}
          control={control}
          customField={field}
        />
      ))}
    </VStack>
  );
};
