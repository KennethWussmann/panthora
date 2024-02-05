import { Box, Flex, IconButton, Td, Tooltip, Tr } from "@chakra-ui/react";
import { FiEdit } from "react-icons/fi";
import { BiSubdirectoryRight } from "react-icons/bi";
import { type Tag } from "@prisma/client";
import { DeleteIconButton } from "~/components/common/DeleteIconButton";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { useErrorHandlingMutation } from "~/lib/useErrorHandling";
import { useTeam } from "~/lib/SelectedTeamProvider";

const TagActions = ({
  tag,
  onDelete,
}: {
  tag: Tag;
  onDelete: VoidFunction;
}) => {
  const { push } = useRouter();
  const { team } = useTeam();
  const deleteTag = useErrorHandlingMutation(api.tag.delete);

  const handleDelete = async () => {
    if (!team) {
      return;
    }

    await deleteTag.mutateAsync({ teamId: team.id, id: tag.id });
    onDelete();
  };

  return (
    <>
      <Tooltip label="Edit">
        <IconButton
          variant={"ghost"}
          icon={<FiEdit />}
          aria-label="Edit"
          onClick={() => push(`tags/edit/${tag.id}`)}
        />
      </Tooltip>
      <DeleteIconButton itemName={tag.name} onConfirm={handleDelete} />
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
