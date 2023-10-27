import { Box, IconButton, Td, Tooltip, Tr } from "@chakra-ui/react";
import { FiEdit, FiPrinter } from "react-icons/fi";
import { AssetItem } from "./AssetItem";

type AssetRowProps = {
  item: AssetItem;
  level: number;
};

const AssetActions = ({ asset }: { asset: AssetItem }) => {
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

export const AssetRow: React.FC<AssetRowProps> = ({ item, level }) => {
  return (
    <>
      <Tr key={item.id}>
        <Td>
          <Box pl={`${level * 20}px`}>{item.name}</Box>
        </Td>
        <Td textAlign="right">
          <AssetActions asset={item} />
        </Td>
      </Tr>
    </>
  );
};
