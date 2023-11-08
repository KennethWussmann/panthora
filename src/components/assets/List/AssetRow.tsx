import { IconButton, Td, Tooltip, Tr } from "@chakra-ui/react";
import { CustomField } from "@prisma/client";
import { useRouter } from "next/router";
import { FiEdit, FiPrinter } from "react-icons/fi";
import { AssetWithFields } from "~/server/lib/assets/asset";

type AssetRowProps = {
  asset: AssetWithFields;
  uniqueFieldsToShow: CustomField[];
};

const AssetActions = ({ asset }: { asset: AssetWithFields }) => {
  const { push } = useRouter();
  return (
    <>
      <Tooltip label="Edit">
        <IconButton
          onClick={() => push(`/assets/edit/${asset.id}`)}
          variant={"ghost"}
          icon={<FiEdit />}
          aria-label="Edit"
        />
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

export const AssetRow = ({ asset, uniqueFieldsToShow }: AssetRowProps) => {
  return (
    <>
      <Tr key={asset.id}>
        {uniqueFieldsToShow.map((field) => {
          const fieldValue = asset.fieldValues.find(
            (fv) => fv.customFieldId === field.id
          );
          return <Td key={field.id}>{fieldValue?.value || ""}</Td>;
        })}
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
