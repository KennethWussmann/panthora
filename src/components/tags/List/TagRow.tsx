import {
  Box,
  Flex,
  IconButton,
  Td,
  Tooltip,
  Tr,
} from "@chakra-ui/react";
import { FiEdit } from "react-icons/fi";
import { BiSubdirectoryRight } from "react-icons/bi";
import { type Tag } from "@prisma/client";
import { DeleteIconButton } from "~/components/common/DeleteIconButton";
import { api } from "~/utils/api";

const TagActions = ({
  tag,
  onDelete,
}: {
  tag: Tag;
  onDelete: VoidFunction;
}) => {
  const { data: defaultTeam } = api.user.defaultTeam.useQuery();
  const deleteTag = api.tag.delete.useMutation();

  const handleDelete = async () => {
    if (!defaultTeam) {
      return;
    }

    await deleteTag.mutateAsync({ teamId: defaultTeam.id, id: tag.id });
    onDelete();
  };

  return (
    <>
      <Tooltip label="Edit">
        <IconButton variant={"ghost"} icon={<FiEdit />} aria-label="Edit" />
      </Tooltip>
      <Tooltip label="Delete">
        <DeleteIconButton itemName={tag.name} onConfirm={handleDelete} />
      </Tooltip>
    </>
  );
};

export const TagRow = ({
  tag,
  level,
  refetchTags,
}: {
  tag: Tag;
  level: number;
  refetchTags: VoidFunction;
}) => {
  return (
    <>
      <Tr key={tag.id}>
        <Td>
          <Box pl={`${(level - 1) * 20}px`}>
            <Flex alignItems={"center"} gap={2}>
              {level > 0 && <BiSubdirectoryRight size={"20px"} />} {tag.name}
            </Flex>
          </Box>
        </Td>
        <Td textAlign="right">
          <TagActions tag={tag} onDelete={refetchTags} />
        </Td>
      </Tr>
    </>
  );
};

export const EmptyTagRow = () => {
  return (
    <Tr>
      <Td colSpan={2}>No tags found</Td>
    </Tr>
  );
};
