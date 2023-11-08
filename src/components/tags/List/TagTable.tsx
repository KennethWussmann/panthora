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
import { EmptyTagRow, TagRow } from "./TagRow";
import { FiPlus } from "react-icons/fi";
import { TagExplanation } from "./TagExplanation";
import { useRouter } from "next/router";
import { TagsBreadcrumbs } from "../TagsBreadcrumbs";
import { api } from "~/utils/api";
import { type Tag } from "~/server/lib/tags/tag";

const renderNestedTags = (
  tags: Tag[],
  refetchTags: VoidFunction,
  level = 0
) => {
  return tags.map((tag) => (
    <React.Fragment key={tag.id}>
      <TagRow tag={tag} level={level} refetchTags={refetchTags} />
      {tag.children && renderNestedTags(tag.children, refetchTags, level + 1)}
    </React.Fragment>
  ));
};

export const TagTable: React.FC = () => {
  const { push } = useRouter();
  const { data: defaultTeam } = api.user.defaultTeam.useQuery();
  const tagQuery = api.tag.list.useQuery(
    { teamId: defaultTeam?.id ?? "" },
    { enabled: !!defaultTeam }
  );

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
      {!tagQuery.isLoading && (
        <Table variant="simple" size={"sm"}>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th textAlign="right">Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {tagQuery?.data?.length === 0 && <EmptyTagRow />}
            {tagQuery?.data &&
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              renderNestedTags(tagQuery.data, tagQuery.refetch)}
          </Tbody>
        </Table>
      )}
    </Stack>
  );
};
