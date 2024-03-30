import React, { useMemo } from "react";
import { Button, Stack } from "@chakra-ui/react";
import { FiPlus, FiTag } from "react-icons/fi";
import { TagExplanation } from "./TagExplanation";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { type Tag } from "@/server/lib/tags/tag";
import { useTeam } from "@/lib/SelectedTeamProvider";
import { DataTable } from "~/components/common/DataTable/DataTable";
import { createColumnHelper } from "@tanstack/react-table";
import { TagActionsCell, TagCell } from "./TagRow";

type FlattenedTag = Tag & { level: number };

const flattenTags = (tags: Tag[], level = 0): FlattenedTag[] => {
  return tags.reduce<FlattenedTag[]>((acc, tag) => {
    acc.push({ ...tag, level });
    if (tag.children) {
      acc.push(...flattenTags(tag.children, level + 1));
    }
    return acc;
  }, []);
};

const columnHelper = createColumnHelper<FlattenedTag>();

export const TagTable: React.FC = () => {
  const { push } = useRouter();
  const { team } = useTeam();
  const tagQuery = api.tag.list.useQuery(
    { teamId: team?.id ?? "" },
    { enabled: !!team }
  );
  const tags = useMemo(
    () => (tagQuery.data ? flattenTags(tagQuery.data) : []),
    [tagQuery.data]
  );
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        id: "name",
        header: "Name",
        cell: (cell) => (
          <TagCell tag={cell.row.original} level={cell.row.original.level} />
        ),
      }),
      columnHelper.display({
        header: "Actions",
        meta: { isNumeric: true },
        cell: (cell) => (
          <TagActionsCell tag={cell.row.original} onDelete={tagQuery.refetch} />
        ),
      }),
    ],
    [tagQuery.refetch]
  );

  return (
    <Stack gap={6}>
      <TagExplanation />
      {!tagQuery.isLoading && (
        <DataTable
          columns={columns}
          data={tags}
          variant={"simple"}
          size={"sm"}
          emptyList={{
            icon: FiTag,
            label: "No tags found",
            createHref: "/tags/create",
          }}
          tableActions={
            <Button
              leftIcon={<FiPlus />}
              colorScheme="green"
              onClick={() => push("/tags/create")}
            >
              Create
            </Button>
          }
        />
      )}
    </Stack>
  );
};
