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
import { AssetExplanation } from "./AssetExplanation";
import { useRouter } from "next/router";
import { AssetItem } from "./AssetItem";
import { AssetBreadcrumbs } from "../AssetBreadcrumbs";
import { AssetRow } from "./AssetRow";

const data: AssetItem[] = [
  {
    id: "1",
    name: "Root1",
  },
  {
    id: "2",
    name: "Root2",
  },
];

export const AssetTable: React.FC = () => {
  const { push } = useRouter();
  return (
    <Stack gap={2}>
      <AssetBreadcrumbs />
      <AssetExplanation />
      <Flex justify="end">
        <Button
          leftIcon={<FiPlus />}
          colorScheme="green"
          onClick={() => push("/assets/create")}
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
            <AssetRow key={item.id} item={item} level={0} />
          ))}
        </Tbody>
      </Table>
    </Stack>
  );
};
