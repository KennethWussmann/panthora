import { IconButton, Td, Tooltip, Tr } from "@chakra-ui/react";
import { FiEdit, FiPrinter } from "react-icons/fi";
import { AssetWithFields } from "~/server/lib/assets/asset";

type AssetRowProps = {
  asset: AssetWithFields;
};

const AssetActions = ({ asset }: { asset: AssetWithFields }) => {
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

export const AssetRow = ({ asset }: AssetRowProps) => {
  return (
    <>
      <Tr key={asset.id}>
        <Td>{asset.assetType.fields.length}</Td>
        <Td textAlign="right">
          <AssetActions asset={asset} />
        </Td>
      </Tr>
    </>
  );
};

export const EmptyAssetRow = () => {
  return (
    <Tr>
      <Td colSpan={2}>No assets found</Td>
    </Tr>
  );
};
