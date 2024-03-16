import {
  FormControl,
  FormLabel,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Switch,
} from "@chakra-ui/react";
import { type CustomField, FieldType } from "@prisma/client";
import {
  type Control,
  Controller,
  type FieldPath,
  type RegisterOptions,
} from "react-hook-form";
import { FormFieldRequiredErrorMessage } from "@/components/common/FormFieldRequiredErrorMessage";
import { numberOrNull } from "@/lib/reactHookFormUtils";
import { type AssetCreateEditRequest } from "@/server/lib/assets/assetCreateEditRequest";
import { DateTimePicker } from "@/components/common/DateTimePicker";
import { TagSearchInput } from "@/components/common/TagSearchInput";
import { api } from "@/utils/api";
import { useTeam } from "@/lib/SelectedTeamProvider";

const getRegisterOptions = (customField: CustomField) => {
  const registerOptions: RegisterOptions<
    AssetCreateEditRequest,
    FieldPath<AssetCreateEditRequest>
  > = {
    required: customField.inputRequired,
  };
  if (
    customField.fieldType === FieldType.NUMBER ||
    customField.fieldType === FieldType.CURRENCY
  ) {
    registerOptions.setValueAs = numberOrNull;
    if (customField.inputMin !== null) {
      registerOptions.min = customField.inputMin;
    }
    if (customField.inputMax !== null) {
      registerOptions.max = customField.inputMax;
    }
  }
  if (customField.fieldType === FieldType.STRING) {
    if (customField.inputMin !== null) {
      registerOptions.minLength = customField.inputMin;
    }
    if (customField.inputMax !== null) {
      registerOptions.maxLength = customField.inputMax;
    }
  }
  return registerOptions;
};

const fieldTypeToFieldPath: Record<
  FieldType,
  (index: number) => FieldPath<AssetCreateEditRequest>
> = {
  [FieldType.STRING]: (i) => `customFieldValues.${i}.stringValue`,
  [FieldType.BOOLEAN]: (i) => `customFieldValues.${i}.booleanValue`,
  [FieldType.NUMBER]: (i) => `customFieldValues.${i}.numberValue`,
  [FieldType.DATE]: (i) => `customFieldValues.${i}.dateTimeValue`,
  [FieldType.DATETIME]: (i) => `customFieldValues.${i}.dateTimeValue`,
  [FieldType.TIME]: (i) => `customFieldValues.${i}.dateTimeValue`,
  [FieldType.CURRENCY]: (i) => `customFieldValues.${i}.numberValue`,
  [FieldType.TAG]: (i) => `customFieldValues.${i}.tagsValue`,
};

export const AssetCreateEditCustomFieldInput = ({
  index,
  customField,
  control,
}: {
  index: number;
  customField: CustomField;
  control: Control<AssetCreateEditRequest, unknown>;
}) => {
  const {
    register,
    _formState: { errors: formErrors },
  } = control;
  const errors = formErrors.customFieldValues?.[index];
  const formFieldName = fieldTypeToFieldPath[customField.fieldType](index);
  const inputProps = register(formFieldName, getRegisterOptions(customField));
  const { team } = useTeam();
  const { data: tags } = api.tag.list.useQuery(
    {
      teamId: team!.id,
      parentId: customField.tagId ?? "",
    },
    {
      enabled: team && customField.fieldType === FieldType.TAG,
    }
  );

  return (
    <>
      <FormControl mb={4}>
        <FormLabel>{customField.name}</FormLabel>
        {(customField.fieldType === FieldType.NUMBER ||
          customField.fieldType === FieldType.CURRENCY) && (
          <NumberInput
            min={customField.inputMin ?? undefined}
            max={customField.inputMax ?? undefined}
          >
            <NumberInputField {...inputProps} />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        )}
        {customField.fieldType === FieldType.STRING && (
          <Input {...inputProps} />
        )}
        {customField.fieldType === FieldType.BOOLEAN && (
          <Switch {...inputProps} />
        )}
        {customField.fieldType === FieldType.DATE && (
          <Controller
            name={formFieldName}
            control={control}
            render={({ field }) => (
              <DateTimePicker
                mode="date"
                value={
                  field.value ? new Date(String(field.value)) : new Date(1000)
                }
                onChange={(date) => field.onChange(date?.toISOString())}
              />
            )}
          />
        )}
        {customField.fieldType === FieldType.TIME && (
          <Controller
            name={formFieldName}
            control={control}
            render={({ field }) => (
              <DateTimePicker
                mode="time"
                value={field.value ? new Date(String(field.value)) : new Date()}
                onChange={(date) => field.onChange(date?.toISOString())}
              />
            )}
          />
        )}
        {customField.fieldType === FieldType.DATETIME && (
          <Controller
            name={formFieldName}
            control={control}
            render={({ field }) => (
              <DateTimePicker
                mode="datetime"
                value={field.value ? new Date(String(field.value)) : new Date()}
                onChange={(date) => field.onChange(date?.toISOString())}
              />
            )}
          />
        )}
        {customField.fieldType === FieldType.TAG && (
          <Controller
            name={`customFieldValues.${index}.tagsValue`}
            control={control}
            render={({ field: { onChange, value } }) => (
              <TagSearchInput
                suggestions={tags ?? []}
                onTagsChange={(tagIds) => {
                  onChange(tagIds);
                }}
                value={value ?? []}
                setValue={onChange}
                max={customField.inputMax ?? undefined}
                min={customField.inputMin ?? undefined}
              />
            )}
          />
        )}
        {errors?.stringValue && <FormFieldRequiredErrorMessage />}
      </FormControl>
    </>
  );
};
