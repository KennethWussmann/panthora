import { Checkbox, IconButton, Tag, Td, Tooltip, Tr } from "@chakra-ui/react";
import { FieldType, type CustomField } from "@prisma/client";
import { useRouter } from "next/router";
import { FiEdit, FiPrinter } from "react-icons/fi";
import { DeleteIconButton } from "~/components/common/DeleteIconButton";
import { type AssetWithFields } from "~/server/lib/assets/asset";

type AssetRowProps = {
  asset: AssetWithFields;
  uniqueFieldsToShow: CustomField[];
  selected: boolean;
  setSelected: (selected: boolean) => void;
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
          onClick={() => push(`/assets/print/${asset.id}`)}
          variant={"ghost"}
          icon={<FiPrinter />}
          aria-label="Print label"
        />
      </Tooltip>
      <Tooltip label="Delete">
        <DeleteIconButton
          itemName={asset.id}
          onConfirm={() => {
            //
          }}
        />
      </Tooltip>
    </>
  );
};

export const AssetRow = ({
  selected,
  setSelected,
  asset,
  uniqueFieldsToShow,
}: AssetRowProps) => {
  const { push } = useRouter();
  return (
    <>
      <Tr key={asset.id}>
        <Td>
          <Checkbox
            isChecked={selected}
            onChange={(e) => setSelected(e.target.checked)}
          />
        </Td>
        <Td>{asset.createdAt.toISOString()}</Td>
        {uniqueFieldsToShow.map((field) => {
          const fieldValue = asset.fieldValues.find(
            (fv) => fv.customFieldId === field.id
          );
          if (fieldValue?.customField.fieldType === FieldType.TAG) {
            return (
              <Td key={field.id}>
                {fieldValue?.tags?.map((tag) => (
                  <Tag
                    key={tag.id}
                    mr={2}
                    _hover={{
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                    onClick={() => push(`/tags/edit/${tag.id}`)}
                  >
                    {tag.name}
                  </Tag>
                ))}
              </Td>
            );
          }
          return <Td key={field.id}>{fieldValue?.value ?? ""}</Td>;
        })}
        <Td textAlign="right">
          <AssetActions asset={asset} />
        </Td>
      </Tr>
    </>
  );
};
