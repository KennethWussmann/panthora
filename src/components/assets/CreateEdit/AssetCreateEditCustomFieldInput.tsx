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
import { Control } from "react-hook-form";
import { FormFieldRequiredErrorMessage } from "~/components/common/FormFieldRequiredErrorMessage";
import { numberOrNull } from "~/lib/reactHookFormUtils";
import { AssetCreateEditRequest } from "~/server/lib/assets/assetCreateEditRequest";

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

        {errors?.value && <FormFieldRequiredErrorMessage />}
      </FormControl>
    </>
  );
};
