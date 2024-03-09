import React from "react";
import { type Control, type UseFieldArrayMove } from "react-hook-form";
import { v4 as uuid } from "uuid";
import {
  VStack,
  Button,
  Flex,
  Heading,
  Alert,
  AlertIcon,
  AlertDescription,
  HStack,
  Spacer,
} from "@chakra-ui/react";
import { NewCustomFieldForm } from "./NewCustomField";
import { FieldType } from "@prisma/client";
import { FiPlus } from "react-icons/fi";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  type AssetTypeCreateRequestWithTemporaryFields,
  type TemporaryCustomField,
} from "./types";

export const CustomFieldCreationForm = ({
  fields,
  append,
  prepend,
  remove,
  move,
  control,
}: {
  fields: TemporaryCustomField[];
  append: (field: TemporaryCustomField) => void;
  prepend: (field: TemporaryCustomField) => void;
  remove: (id: number) => void;
  move: UseFieldArrayMove;
  control: Control<AssetTypeCreateRequestWithTemporaryFields, unknown>;
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addField = (where: "start" | "end") => {
    (where === "start" ? prepend : append)({
      id: uuid(),
      type: FieldType.STRING,
      name: "",
      inputRequired: false,
      inputMin: null,
      inputMax: null,
      showInTable: false,
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && active.id && over?.id) {
      const oldIndex = fields.findIndex((item) => item.id === active.id);
      const newIndex = fields.findIndex((item) => item.id === over.id);
      move(oldIndex, newIndex);
    }
  };

  return (
    <VStack spacing={2} align={"stretch"}>
      <HStack>
        <Heading size={"sx"}>Custom fields</Heading>
        <Spacer />
        <Flex justifyContent={"flex-end"}>
          <Button leftIcon={<FiPlus />} onClick={() => addField("start")}>
            Add Custom Field
          </Button>
        </Flex>
      </HStack>
      {fields.length === 0 && (
        <Alert status="info">
          <AlertIcon />
          <AlertDescription>
            There are no custom fields for this asset type. Click the button
            above to add custom fields.
          </AlertDescription>
        </Alert>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={fields} strategy={verticalListSortingStrategy}>
          {fields.map((field, index) => (
            <NewCustomFieldForm
              key={field.id}
              index={index}
              onRemove={() => remove(index)}
              field={field}
              control={control}
            />
          ))}
        </SortableContext>
      </DndContext>
      {fields.length > 0 && (
        <Flex justifyContent={"flex-end"}>
          <Button leftIcon={<FiPlus />} onClick={() => addField("end")}>
            Add Custom Field
          </Button>
        </Flex>
      )}
    </VStack>
  );
};
