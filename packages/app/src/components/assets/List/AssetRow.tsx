import { IconButton, Tooltip } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { FiEdit, FiPrinter } from "react-icons/fi";
import { DeleteIconButton } from "@/components/common/DeleteIconButton";
import { useTeam } from "@/lib/SelectedTeamProvider";
import { useErrorHandlingMutation } from "@/lib/useErrorHandling";
import { type AssetWithFields } from "@/server/lib/assets/asset";
import { api } from "@/utils/api";

export const AssetActionsCell = ({
  asset,
  onDelete,
}: {
  asset: AssetWithFields;
  onDelete: VoidFunction;
}) => {
  const { push } = useRouter();
  const { team } = useTeam();
  const deleteAsset = useErrorHandlingMutation(api.asset.delete);

  const handleDelete = async () => {
    if (!team) {
      return;
    }

    await deleteAsset.mutateAsync({
      teamId: team.id,
      id: asset.id,
    });
    onDelete();
  };

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
      <DeleteIconButton
        itemName={asset.fieldValues?.[0]?.stringValue ?? asset.id}
        onConfirm={handleDelete}
      />
    </>
  );
};
