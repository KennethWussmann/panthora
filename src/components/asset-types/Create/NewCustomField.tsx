import React, { useEffect, useState } from "react";
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
  NumberInput,
  NumberInputField,
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
import { Control } from "react-hook-form";
import { numberOrNull } from "~/lib/reactHookFormUtils";
import { FormFieldRequiredErrorMessage } from "~/components/common/FormFieldRequiredErrorMessage";

const fieldTypeLabel: Record<FieldType, string> = {
  [FieldType.BOOLEAN]: "Boolean",
  [FieldType.CURRENCY]: "Currency",
  [FieldType.DATE]: "Date",
  [FieldType.TIME]: "Time",
  [FieldType.DATETIME]: "Date & Time",
  [FieldType.NUMBER]: "Number",
  [FieldType.STRING]: "String",
  [FieldType.TAG]: "Tag",
};

export const NewCustomFieldForm = ({
  index,
  onRemove,
  field,
  control: {
    register,
    _formState: { errors: formErrors },
  },
}: {
  index: number;
  onRemove: VoidFunction;
  field: TemporaryCustomField;
  control: Control<AssetTypeCreateRequestWithTemporaryFields, unknown>;
}) => {
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

  return (
    <Box
      border={"1px"}
      borderColor={"gray.200"}
      bg={isDragging ? "gray.50" : "white"}
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

              <FormControl>
                <FormLabel htmlFor="required" mb="0">
                  Required
                </FormLabel>
                <Switch
                  isDisabled={isDragging}
                  {...register(`fields.${index}.required`)}
                />
                <FormHelperText>
                  Input in this custom field will be required when creating an
                  asset of this asset type
                </FormHelperText>
              </FormControl>

              {(field.type === FieldType.NUMBER ||
                field.type === FieldType.STRING ||
                field.type === FieldType.CURRENCY ||
                field.type === FieldType.TAG) && (
                <HStack>
                  <FormControl>
                    <FormLabel>Minimum Length</FormLabel>
                    <NumberInput>
                      <NumberInputField
                        disabled={isDragging}
                        {...register(`fields.${index}.min`, {
                          setValueAs: numberOrNull,
                        })}
                      />
                    </NumberInput>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Maximum Length</FormLabel>
                    <NumberInput>
                      <NumberInputField
                        disabled={isDragging}
                        {...register(`fields.${index}.max`, {
                          setValueAs: numberOrNull,
                        })}
                      />
                    </NumberInput>
                  </FormControl>
                </HStack>
              )}

              {field.type === FieldType.CURRENCY && (
                <FormControl>
                  <FormLabel>Currency</FormLabel>
                  <Input
                    isDisabled={isDragging}
                    {...register(`fields.${index}.currency`)}
                  />
                </FormControl>
              )}

              {field.type === FieldType.TAG && (
                <>
                  <FormControl>
                    <FormLabel>Parent Tag ID</FormLabel>
                    <NumberInput>
                      <NumberInputField
                        disabled={isDragging}
                        {...register(`fields.${index}.parentTagId`, {
                          setValueAs: numberOrNull,
                          required: true,
                        })}
                      />
                    </NumberInput>
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
