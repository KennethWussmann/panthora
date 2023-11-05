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
import { CustomField, FieldType } from "@prisma/client";
import { Control, Controller, useWatch } from "react-hook-form";
import { FormFieldRequiredErrorMessage } from "~/components/common/FormFieldRequiredErrorMessage";
import { numberOrNull } from "~/lib/reactHookFormUtils";
import { AssetCreateEditRequest } from "~/server/lib/assets/assetCreateEditRequest";
import { DateTimePicker } from "~/components/common/DateTimePicker";
import { TagSearchInput } from "~/components/common/TagSearchInput";

const suggestions = [
  { id: "1", name: "apple" },
  { id: "2", name: "banana" },
  { id: "3", name: "cherry" },
];

const getRegisterOptions = (customField: CustomField) => {
  const registerOptions: Record<string, unknown> = {
    required: customField.inputRequired,
  };
  if (
    customField.fieldType === FieldType.NUMBER ||
    customField.fieldType === FieldType.CURRENCY
  ) {
    registerOptions.valueAs = numberOrNull;
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
  const formFieldName = `customFieldValues.${index}.value` as const;
  const inputProps = register(formFieldName, getRegisterOptions(customField));
  const value = useWatch({
    control,
    name: formFieldName,
  });

  return (
    <>
      <FormControl>
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
            name={formFieldName}
            control={control}
            render={({ field: { onChange, value } }) => (
              <TagSearchInput
                suggestions={suggestions}
                onTagsChange={(tagIds) => {
                  onChange(tagIds);
                }}
                value={value && Array.isArray(value) ? value : []}
                setValue={onChange}
                max={1}
              />
            )}
          />
        )}
        {errors?.value && <FormFieldRequiredErrorMessage />}
      </FormControl>
    </>
  );
};