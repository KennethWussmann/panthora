import { Box, IconButton, Td, Tooltip, Tr } from "@chakra-ui/react";
import { FiEdit, FiPrinter } from "react-icons/fi";
import { TagItem } from "./TagItem";

type TagRowProps = {
  item: TagItem;
  level: number;
};

const TagActions = ({ tag }: { tag: TagItem }) => {
  return (
    <>
      <Tooltip label="Edit">
        <IconButton variant={"ghost"} icon={<FiEdit />} aria-label="Edit" />
      </Tooltip>
      <Tooltip label="Print label">
        <IconButton
          variant={"ghost"}
          icon={<FiPrinter />}
          aria-label="Print label"
        />
      </Tooltip>
    </>
  );
};

export const TagRow: React.FC<TagRowProps> = ({ item, level }) => {
  return (
    <>
      <Tr key={item.id}>
        <Td>
          <Box pl={`${level * 20}px`}>{item.name}</Box>
        </Td>
        <Td textAlign="right">
          <TagActions tag={item} />
        </Td>
      </Tr>
      {item.children &&
        item.children.map((child) => (
          <TagRow key={child.id} item={child} level={level + 1} />
        ))}
    </>
  );
};
