import React from "react";
import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Button,
  Stack,
  Flex,
  VStack,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "@chakra-ui/react";
import { TagItem } from "./TagItem";
import { TagRow } from "./TagRow";
import { FiChevronRight, FiFilePlus, FiPlus } from "react-icons/fi";
import { TagExplanation } from "./TagExplanation";
import { useRouter } from "next/router";
import { TagsBreadcrumbs } from "../TagsBreadcrumbs";

const data: TagItem[] = [
  {
    id: "1",
    name: "Root1",
    children: [
      {
        id: "1.1",
        name: "Child1",
      },
      {
        id: "1.2",
        name: "Child2",
        children: [
          {
            id: "1.1",
            name: "Child1",
          },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Root2",
    children: [
      {
        id: "2.1",
        name: "Child1",
      },
    ],
  },
];

export const TagTable: React.FC = () => {
  const { push } = useRouter();
  return (
    <Stack gap={2}>
      <TagsBreadcrumbs />
      <TagExplanation />
      <Flex justify="end">
        <Button
          leftIcon={<FiPlus />}
          colorScheme="green"
          onClick={() => push("/tags/create")}
        >
          Create
        </Button>
      </Flex>
      <Table variant="simple" size={"sm"}>
        <Thead>
          <Tr>
            <Th>Name</Th>
            <Th textAlign="right">Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((item) => (
            <TagRow key={item.id} item={item} level={0} />
          ))}
        </Tbody>
      </Table>
    </Stack>
  );
};
