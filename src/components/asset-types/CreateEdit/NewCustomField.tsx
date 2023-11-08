import React, { useEffect } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Stack,
  Switch,
  VStack,
} from "@chakra-ui/react";
import { FiTrash } from "react-icons/fi";
import { FieldType } from "@prisma/client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BiMoveVertical } from "react-icons/bi";
import {
  AssetTypeCreateRequestWithTemporaryFields,
  TemporaryCustomField,
} from "./types";
import { Control, Controller, useWatch } from "react-hook-form";
import { numberOrNull } from "~/lib/reactHookFormUtils";
import { FormFieldRequiredErrorMessage } from "~/components/common/FormFieldRequiredErrorMessage";
import { fieldTypeLabel } from "~/lib/fieldTypeLabel";
import { TagSelector } from "~/components/common/TagSelector";

export const NewCustomFieldForm = ({
  index,
  onRemove,
  field,
  control,
}: {
  index: number;
  onRemove: VoidFunction;
  field: TemporaryCustomField;
  control: Control<AssetTypeCreateRequestWithTemporaryFields, unknown>;
}) => {
  const {
    register,
    _formState: { errors: formErrors },
  } = control;
  const errors = formErrors.fields?.[index];
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });
  const customTransitions =
    "box-shadow 0.3s ease, margin 0.3s ease, background-color 0.3s ease";
  const finalTransition = transition
    ? `${transition}, ${customTransitions}`
    : customTransitions;
  const fieldType = useWatch({
    control,
    name: `fields.${index}.type`,
  });

  return (
    <Box
      border={"1px"}
      borderColor={["gray.200", "gray.600"]}
      bg={isDragging ? ["gray.50", "gray.600"] : ["white", "gray.800"]}
      p={4}
      rounded={"lg"}
      style={{
        transform: CSS.Transform.toString({
          x: 0,
          y: transform?.y || 0,
          scaleX: transform?.scaleX || 1,
          scaleY: transform?.scaleY || 1,
        }),
        transition: finalTransition,
        boxShadow: isDragging ? "0px 8px 16px rgba(0,0,0,0.2)" : "none",
        zIndex: isDragging ? 10 : undefined,
        marginLeft: isDragging ? "-10px" : undefined,
        marginRight: isDragging ? "10px" : undefined,
        marginTop: isDragging ? "-10px" : undefined,
        marginBottom: isDragging ? "10px" : undefined,
      }}
    >
      <Stack gap={2}>
        <div data-no-dnd="true">
          <Box as="form">
            <VStack spacing={2} align={"stretch"}>
              <HStack>
                <FormControl>
                  <FormLabel>Type</FormLabel>
                  <Select
                    isDisabled={isDragging}
                    {...register(`fields.${index}.type`)}
                  >
                    {Object.values(FieldType).map((type) => (
                      <option key={type} value={type}>
                        {fieldTypeLabel[type]}
                      </option>
                    ))}
                  </Select>
                  <FormHelperText>
                    The data type that will guide the input of this custom field
                  </FormHelperText>
                </FormControl>

                <FormControl isInvalid={!!errors?.name}>
                  <FormLabel>Name</FormLabel>
                  <Input
                    isDisabled={isDragging}
                    isRequired
                    {...register(`fields.${index}.name`, { required: true })}
                  />
                  {errors?.name && <FormFieldRequiredErrorMessage />}
                  <FormHelperText>
                    The display name of this field when creating an asset
                  </FormHelperText>
                </FormControl>
              </HStack>

              <HStack align={"stretch"}>
                <FormControl>
                  <FormLabel htmlFor="required" mb="0">
                    Required
                  </FormLabel>
                  <Switch
                    isDisabled={isDragging}
                    {...register(`fields.${index}.inputRequired`)}
                  />
                  <FormHelperText>
                    Input in this custom field will be required when creating an
                    asset of this asset type
                  </FormHelperText>
                </FormControl>
                <FormControl isInvalid={!!errors?.name}>
                  <FormLabel>Show in table</FormLabel>
                  <Switch
                    isDisabled={isDragging}
                    {...register(`fields.${index}.showInTable`)}
                  />
                  {errors?.showInTable && <FormFieldRequiredErrorMessage />}
                  <FormHelperText>
                    The value of this field will appear in table views
                  </FormHelperText>
                </FormControl>
              </HStack>

              {(fieldType === FieldType.NUMBER ||
                fieldType === FieldType.STRING ||
                fieldType === FieldType.CURRENCY ||
                fieldType === FieldType.TAG) && (
                <HStack>
                  <FormControl>
                    <FormLabel>Minimum Length</FormLabel>
                    <NumberInput>
                      <NumberInputField
                        disabled={isDragging}
                        {...register(`fields.${index}.inputMin`, {
                          setValueAs: numberOrNull,
                        })}
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Maximum Length</FormLabel>
                    <NumberInput>
                      <NumberInputField
                        disabled={isDragging}
                        {...register(`fields.${index}.inputMax`, {
                          setValueAs: numberOrNull,
                        })}
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>
              )}

              {fieldType === FieldType.CURRENCY && (
                <FormControl>
                  <FormLabel>Currency</FormLabel>
                  <Input
                    isDisabled={isDragging}
                    {...register(`fields.${index}.currency`)}
                  />
                </FormControl>
              )}

              {fieldType === FieldType.TAG && (
                <>
                  <FormControl>
                    <FormLabel>Parent Tag</FormLabel>
                    <Controller
                      name={`fields.${index}.parentTagId`}
                      control={control}
                      render={({ field }) => (
                        <TagSelector
                          value={field.value}
                          onChange={(tagId) => field.onChange(tagId)}
                          allowParentsOnly
                        />
                      )}
                    />
                  </FormControl>
                  <Alert status="info">
                    <AlertIcon />
                    <AlertDescription>
                      The <b>Tag</b> data type allows users to select any number
                      of tags. Selecting an optional parent tag will limit the
                      available tags to only those that are children of the
                      parent tag.
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </VStack>
          </Box>
        </div>
        <Flex justifyContent={"space-between"}>
          <Button
            leftIcon={<BiMoveVertical />}
            variant={"ghost"}
            ref={setNodeRef}
            cursor={"grab"}
            {...attributes}
            {...listeners}
          >
            Drag to move
          </Button>
          <Button
            leftIcon={<FiTrash />}
            colorScheme="red"
            variant={"ghost"}
            onClick={onRemove}
            isDisabled={isDragging}
          >
            Remove
          </Button>
        </Flex>
      </Stack>
    </Box>
  );
};
