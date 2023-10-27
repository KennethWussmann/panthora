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
} from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import { useRouter } from "next/router";
import { AssetTypeItem } from "./AssetTypeItem";
import { AssetTypeBreadcrumbs } from "../AssetTypeBreadcrumbs";
import { AssetTypeExplanation } from "./AssetTypeExplanation";
import { AssetTypeRow } from "./AssetTypeRow";

const data: AssetTypeItem[] = [
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

export const AssetTypeTable: React.FC = () => {
  const { push } = useRouter();
  return (
    <Stack gap={2}>
      <AssetTypeBreadcrumbs />
      <AssetTypeExplanation />
      <Flex justify="end">
        <Button
          leftIcon={<FiPlus />}
          colorScheme="green"
          onClick={() => push("/asset-types/create")}
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
            <AssetTypeRow key={item.id} item={item} level={0} />
          ))}
        </Tbody>
      </Table>
    </Stack>
  );
};
