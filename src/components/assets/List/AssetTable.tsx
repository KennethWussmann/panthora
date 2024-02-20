import React from "react";
import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Button,
  Stack,
  Flex,
  Alert,
  AlertIcon,
  AlertDescription,
  Checkbox,
  useBoolean,
  ButtonGroup,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tag,
  Divider,
} from "@chakra-ui/react";
import { FiChevronDown, FiPlus, FiPrinter } from "react-icons/fi";
import { AssetExplanation } from "./AssetExplanation";
import { useRouter } from "next/router";
import { AssetRow } from "./AssetRow";
import { api } from "~/utils/api";
import { Link } from "@chakra-ui/next-js";
import { uniqBy } from "lodash";
import { useSelectedAssets } from "~/lib/SelectedAssetsProvider";
import { type AssetWithFields } from "~/server/lib/assets/asset";
import { useTeam } from "~/lib/SelectedTeamProvider";

export const AssetTable: React.FC = () => {
  const { selectedAssets, setSelectedAssets, setSelectedLabelTemplate } =
    useSelectedAssets();
  const [isLoadingPrintView, setLoadingPrintView] = useBoolean();
  const { push } = useRouter();
  const { team } = useTeam();
  const { data: assets, refetch: refetchAssets } = api.asset.list.useQuery(
    { teamId: team?.id ?? "" },
    { enabled: !!team }
  );
  const { data: assetTypes, isLoading: isLoadingAssetTypes } =
    api.assetType.list.useQuery(
      { teamId: team?.id ?? "" },
      { enabled: !!team }
    );
  const { data: labelTemplates, isLoading: isLoadingLabelTemplates } =
    api.labelTemplate.list.useQuery(
      { teamId: team?.id ?? "" },
      { enabled: !!team }
    );

  const showAssetTypeMissingNotice = assetTypes?.length === 0;
  const showCreateFirstAssetNotice =
    !showAssetTypeMissingNotice && assets && assets.length === 0;

  const uniqueFieldsToShow = assets
    ? uniqBy(
        assets
          .flatMap((asset) => asset.assetType?.fields ?? [])
          .filter((field) => field.showInTable),
        (field) => field.id
      )
    : [];

  return (
    <Stack gap={2}>
      <AssetExplanation />
      {showAssetTypeMissingNotice && (
        <Alert status="info">
          <AlertIcon />
          <AlertDescription>
            You don&apos;t have any asset types yet.{" "}
            <Link href="/asset-types/create" textDecor={"underline"}>
              Create one first
            </Link>{" "}
            to be able to create assets.
          </AlertDescription>
        </Alert>
      )}

      <Flex justify="end" gap={2}>
        <ButtonGroup
          isAttached
          variant="outline"
          isDisabled={selectedAssets.length === 0}
        >
          <Button
            leftIcon={<FiPrinter />}
            onClick={() => {
              setSelectedLabelTemplate(undefined);
              void push("/assets/print");
              setLoadingPrintView.on();
            }}
            isLoading={
              isLoadingAssetTypes ||
              isLoadingPrintView ||
              isLoadingLabelTemplates
            }
          >
            {selectedAssets.length === 0
              ? "Print"
              : `Print ${selectedAssets.length} ${
                  selectedAssets.length === 1 ? "label" : "labels"
                }`}
          </Button>
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FiChevronDown />}
              isLoading={
                isLoadingAssetTypes ||
                isLoadingPrintView ||
                isLoadingLabelTemplates
              }
            />
            <MenuList>
              {labelTemplates?.map((labelTemplate) => (
                <MenuItem
                  key={labelTemplate.id}
                  flex={1}
                  justifyContent={"space-between"}
                  onClick={() => {
                    setSelectedLabelTemplate(labelTemplate);
                    void push("/assets/print");
                    setLoadingPrintView.on();
                  }}
                >
                  {labelTemplate.name}{" "}
                  <Tag ml={4}>
                    {labelTemplate.width} mm x {labelTemplate.height} mm
                  </Tag>
                </MenuItem>
              ))}
              <Divider />
              <MenuItem
                onClick={() => {
                  void push("/settings/team/label-templates/create");
                }}
                gap={4}
              >
                <FiPlus /> Create template
              </MenuItem>
            </MenuList>
          </Menu>
        </ButtonGroup>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="green"
          onClick={() => push("/assets/create")}
          isLoading={isLoadingAssetTypes}
          isDisabled={showAssetTypeMissingNotice}
        >
          Create
        </Button>
      </Flex>
      {showCreateFirstAssetNotice && (
        <Alert status="info">
          <AlertIcon />
          <AlertDescription>
            You don&apos;t have any assets.{" "}
            <Link href="/assets/create" textDecor={"underline"}>
              Create your first asset.
            </Link>
          </AlertDescription>
        </Alert>
      )}
      {assets && assets.length > 0 && (
        <Table variant="simple" size={"sm"}>
          <Thead>
            <Tr>
              <Th>
                <Checkbox
                  isChecked={selectedAssets.length === assets?.length}
                  onChange={() => {
                    if (selectedAssets.length === assets?.length) {
                      setSelectedAssets([]);
                    } else {
                      setSelectedAssets(assets ?? []);
                    }
                  }}
                />
              </Th>
              <Th>Created at</Th>
              {uniqueFieldsToShow.map((field) => (
                <Th key={field.id}>{field.name}</Th>
              ))}
              <Th textAlign="right">Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {assets?.map((asset) => (
              <AssetRow
                key={asset.id}
                asset={asset}
                uniqueFieldsToShow={uniqueFieldsToShow}
                refetchAssets={refetchAssets}
                selected={selectedAssets.includes(asset)}
                setSelected={(selected) => {
                  if (selected) {
                    setSelectedAssets((selected: AssetWithFields[]) => [
                      ...selected,
                      asset,
                    ]);
                  } else {
                    setSelectedAssets((selected) =>
                      selected.filter((a) => a.id !== asset.id)
                    );
                  }
                }}
              />
            ))}
          </Tbody>
        </Table>
      )}
    </Stack>
  );
};
