import { Box, Flex, IconButton, Td, Tooltip, Tr } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { BiSubdirectoryRight } from "react-icons/bi";
import { FiEdit, FiFolder } from "react-icons/fi";
import { DeleteIconButton } from "@/components/common/DeleteIconButton";
import { EmptyListIcon } from "@/components/common/EmptyListIcon";
import { useTeam } from "@/lib/SelectedTeamProvider";
import { useErrorHandlingMutation } from "@/lib/useErrorHandling";
import { type AssetType } from "@/server/lib/asset-types/assetType";
import { api } from "@/utils/api";

type AssetTypeRowProps = {
  assetType: AssetType;
  level: number;
  refetchAssetTypes: VoidFunction;
};

const AssetTypeActions = ({
  assetType,
  onDelete,
}: {
  assetType: AssetType;
  onDelete: VoidFunction;
}) => {
  const { push } = useRouter();
  const { team } = useTeam();
  const deleteAssetType = useErrorHandlingMutation(api.assetType.delete);

  const handleDelete = async () => {
    if (!team) {
      return;
    }

    await deleteAssetType.mutateAsync({
      teamId: team.id,
      id: assetType.id,
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
          onClick={() => push(`/asset-types/edit/${assetType.id}`)}
        />
      </Tooltip>
      <DeleteIconButton itemName={assetType.name} onConfirm={handleDelete} />
    </>
  );
};

export const AssetTypeRow: React.FC<AssetTypeRowProps> = ({
  assetType,
  level,
  refetchAssetTypes,
}) => {
  return (
    <Tr key={assetType.id}>
      <Td>
        <Box pl={`${(level - 1) * 20}px`}>
          <Flex alignItems={"center"} gap={2}>
            {level > 0 && <BiSubdirectoryRight size={"20px"} />}{" "}
            {assetType.name}{" "}
            {assetType.fields.length > 0 && (
              <b>
                {assetType.fields.length}{" "}
                {assetType.fields.length === 1 ? "field" : "fields"}{" "}
              </b>
            )}
          </Flex>
        </Box>
      </Td>
      <Td textAlign="right">
        <AssetTypeActions assetType={assetType} onDelete={refetchAssetTypes} />
      </Td>
    </Tr>
  );
};

export const EmptyAssetTypeRow = () => {
  return (
    <Tr>
      <Td colSpan={2}>
        <EmptyListIcon
          icon={FiFolder}
          label={"No asset types found"}
          createHref="/asset-types/create"
        />
      </Td>
    </Tr>
  );
};