import { IconButton, Stack, Tag, Td, Tooltip, Tr } from "@chakra-ui/react";
import { LabelComponents } from "@prisma/client";
import { useRouter } from "next/router";
import { FiEdit } from "react-icons/fi";
import { DeleteIconButton } from "~/components/common/DeleteIconButton";
import { useTeam } from "~/lib/SelectedTeamProvider";
import { useErrorHandlingMutation } from "~/lib/useErrorHandling";
import { type LabelTemplate } from "~/server/lib/label-templates/labelTemplate";
import { api } from "~/utils/api";

type LabelTemplateRowProps = {
  labelTemplate: LabelTemplate;
  refetchLabelTemplates: VoidFunction;
};

const LabelTemplateActions = ({
  labelTemplate,
  onDelete,
}: {
  labelTemplate: LabelTemplate;
  onDelete: VoidFunction;
}) => {
  const { push } = useRouter();
  const { team } = useTeam();
  const deleteLabelTemplate = useErrorHandlingMutation(
    api.labelTemplate.delete
  );

  const handleDelete = async () => {
    if (!team) {
      return;
    }

    await deleteLabelTemplate.mutateAsync({
      teamId: team.id,
      id: labelTemplate.id,
    });
    onDelete();
  };

  return (
    <>
      <Tooltip label="Edit">
        <IconButton
          variant={"ghost"}
          icon={<FiEdit />}
          aria-label="Edit"
          onClick={() =>
            push(`/settings/label-templates/edit/${labelTemplate.id}`)
          }
        />
      </Tooltip>
      <DeleteIconButton
        itemName={labelTemplate.name}
        onConfirm={handleDelete}
        isDisabled={labelTemplate.default}
        tooltipText={
          labelTemplate.default
            ? "Default label templates cannot be deleted"
            : "Delete"
        }
      />
    </>
  );
};

const componentLabels: Record<LabelComponents, string> = {
  [LabelComponents.QR_CODE]: "QR-Code",
  [LabelComponents.ASSET_ID]: "Asset ID",
  [LabelComponents.ASSET_VALUES]: "Asset Values",
};

export const LabelTemplateRow: React.FC<LabelTemplateRowProps> = ({
  labelTemplate,
  refetchLabelTemplates,
}) => {
  return (
    <Tr key={labelTemplate.id}>
      <Td>{labelTemplate.createdAt.toISOString()}</Td>
      <Td>
        {labelTemplate.name}{" "}
        {labelTemplate.default && <Tag ml={2}>Default</Tag>}
      </Td>
      <Td>
        {labelTemplate.width} mm x {labelTemplate.height} mm
      </Td>
      <Td>
        {labelTemplate.components.map((component) => (
          <Tag mr={2} key={component}>
            {componentLabels[component]}
          </Tag>
        ))}
      </Td>
      <Td>
        <LabelTemplateActions
          labelTemplate={labelTemplate}
          onDelete={refetchLabelTemplates}
        />
      </Td>
    </Tr>
  );
};

export const EmptyLabelTemplateRow = () => {
  return (
    <Tr>
      <Td colSpan={5}>No label templates found</Td>
    </Tr>
  );
};
