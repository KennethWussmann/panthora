import React, { useState } from "react";
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
import { CustomFieldCreateRequest } from "~/server/lib/asset-types/assetTypeCreateRequest";
import { FiPlus } from "react-icons/fi";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export type TemporaryCustomField = CustomFieldCreateRequest & {
  id: number;
};

export const CustomFieldCreationForm = ({
  fields,
  setFields,
}: {
  fields: TemporaryCustomField[];
  setFields: (
    fn: (fields: TemporaryCustomField[]) => TemporaryCustomField[]
  ) => void;
}) => {
  const [incrementalId, setIncrementalId] = useState(1);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addField = (where: "start" | "end") => {
    setFields((prevFields) => [
      ...(where === "start" ? [] : prevFields),
      { id: incrementalId, type: FieldType.STRING, name: "", required: false },
      ...(where === "end" ? [] : prevFields),
    ]);
    setIncrementalId((prev) => prev + 1);
  };

  const removeField = (index: number) => {
    setFields((prevFields) => prevFields.filter((_, i) => i !== index));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && active.id && over?.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
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
          {fields.map(({ id }, index) => (
            <NewCustomFieldForm
              key={id}
              id={id}
              onRemove={() => removeField(index)}
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
