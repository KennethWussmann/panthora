import { IconButton, Tooltip } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { FiEdit } from "react-icons/fi";
import { DeleteIconButton } from "@/components/common/DeleteIconButton";
import { useTeam } from "@/lib/SelectedTeamProvider";
import { useErrorHandlingMutation } from "@/lib/useErrorHandling";
import { type LabelTemplate } from "@/server/lib/label-templates/labelTemplate";
import { api } from "@/utils/api";

export const LabelTemplateActionsCell = ({
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
            push(`/settings/team/label-templates/edit/${labelTemplate.id}`)
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
