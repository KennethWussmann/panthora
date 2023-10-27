import { Box, IconButton, Td, Tooltip, Tr } from "@chakra-ui/react";
import { FiEdit, FiPrinter } from "react-icons/fi";
import { AssetTypeItem } from "./AssetTypeItem";

type AssetTypeRowProps = {
  item: AssetTypeItem;
  level: number;
};

const AssetTypeActions = ({ assetType }: { assetType: AssetTypeItem }) => {
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

export const AssetTypeRow: React.FC<AssetTypeRowProps> = ({ item, level }) => {
  return (
    <>
      <Tr key={item.id}>
        <Td>
          <Box pl={`${level * 20}px`}>{item.name}</Box>
        </Td>
        <Td textAlign="right">
          <AssetTypeActions assetType={item} />
        </Td>
      </Tr>
      {item.children &&
        item.children.map((child) => (
          <AssetTypeRow key={child.id} item={child} level={level + 1} />
        ))}
    </>
  );
};
