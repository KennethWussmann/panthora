import React, { useMemo } from "react";
import {
  Stack,
  Alert,
  AlertIcon,
  AlertDescription,
  Checkbox,
  useBoolean,
  Tag,
  Flex,
  ButtonGroup,
  Button,
  Menu,
  MenuButton,
  IconButton,
  MenuList,
  MenuItem,
  Divider,
  TagLabel,
  TagLeftIcon,
  Box,
  useDisclosure,
} from "@chakra-ui/react";
import {
  FiBox,
  FiCheck,
  FiChevronDown,
  FiPlus,
  FiPlusCircle,
  FiPrinter,
  FiX,
} from "react-icons/fi";
import { useRouter } from "next/router";
import { AssetActionsCell } from "./AssetRow";
import { api } from "@/utils/api";
import { Link } from "@chakra-ui/next-js";
import { uniqBy } from "lodash";
import { useSelectedAssets } from "@/lib/SelectedAssetsProvider";
import { type AssetWithFields } from "@/server/lib/assets/asset";
import { useTeam } from "@/lib/SelectedTeamProvider";
import { createColumnHelper } from "@tanstack/react-table";
import { FieldType } from "@prisma/client";
import { DataTable } from "~/components/common/DataTable/DataTable";
import { FilterOptions } from "./filter/FilterOptions";
import { useAssetTable } from "./AssetTableContext";

const columnHelper = createColumnHelper<AssetWithFields>();

export const AssetTable: React.FC = () => {
  const { filters, filterExpression, clearFilters } = useAssetTable();
  const { isOpen: isFiltersOpen, onToggle: toggleFilters } = useDisclosure();
  const { selectedAssets, setSelectedAssets, setSelectedLabelTemplate } =
    useSelectedAssets();
  const [isLoadingPrintView, setLoadingPrintView] = useBoolean();
  const { push } = useRouter();
  const { team } = useTeam();
  const {
    data: assetsResponse,
    refetch: refetchAssets,
    isLoading: isLoadingAssets,
  } = api.asset.search.useQuery(
    { teamId: team?.id ?? "", filter: filterExpression },
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

  const assets = useMemo(() => assetsResponse?.assets, [assetsResponse]);
  const uniqueFieldsToShow = useMemo(
    () =>
      assets
        ? uniqBy(
            assets
              .flatMap((asset) => asset.assetType?.fields ?? [])
              .filter((field) => field.showInTable),
            (field) => field.id
          )
        : [],
    [assets]
  );

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "selectAll",
        meta: { filterLabel: "Select" },
        header: () => (
          <Checkbox
            isChecked={
              assets && assets.length > 0
                ? selectedAssets.length === assets.length
                : false
            }
            onChange={() => {
              if (selectedAssets.length === assets?.length) {
                setSelectedAssets([]);
              } else {
                setSelectedAssets(assets ?? []);
              }
            }}
          />
        ),
        cell: ({ row: { original } }) => (
          <Checkbox
            isChecked={selectedAssets.includes(original)}
            onChange={(e) => {
              const selected = e.target.checked;
              if (selected) {
                setSelectedAssets((selected: AssetWithFields[]) => [
                  ...selected,
                  original,
                ]);
              } else {
                setSelectedAssets((selected) =>
                  selected.filter((a) => a.id !== original.id)
                );
              }
            }}
          />
        ),
      }),
      columnHelper.accessor("createdAt", {
        id: "createdAt",
        header: "Created at",
        cell: ({ getValue }) => getValue().toISOString(),
      }),
      ...uniqueFieldsToShow.map((field) =>
        columnHelper.display({
          id: field.id,
          header: field.name,
          cell: ({ row }) => {
            const asset = row.original;
            const fieldValue = asset.fieldValues.find(
              (fv) => fv.customFieldId === field.id
            );
            switch (
              fieldValue?.customField?.fieldType as FieldType | undefined
            ) {
              case FieldType.STRING:
                return fieldValue?.stringValue;
              case FieldType.TAG:
                return fieldValue?.tagsValue?.map((tag) => (
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
                ));
              case FieldType.BOOLEAN:
                return (
                  <Tag>
                    <TagLeftIcon
                      as={fieldValue?.booleanValue ? FiCheck : FiX}
                    />
                    <TagLabel>
                      {fieldValue?.booleanValue ? "Yes" : "No"}
                    </TagLabel>
                  </Tag>
                );
              case FieldType.NUMBER:
                return fieldValue?.intValue ?? fieldValue?.decimalValue;
              case FieldType.DATE:
                return fieldValue?.dateTimeValue?.toISOString().split("T")[0];
              case FieldType.TIME:
                return fieldValue?.dateTimeValue?.toISOString().split("T")[1];
              case FieldType.DATETIME:
                return fieldValue?.dateTimeValue?.toISOString();
              default:
                return null;
            }
          },
        })
      ),
      columnHelper.display({
        header: "Actions",
        meta: { isNumeric: true },
        cell: ({ row: { original } }) => (
          <AssetActionsCell asset={original} onDelete={refetchAssets} />
        ),
      }),
    ],
    [
      uniqueFieldsToShow,
      assets,
      selectedAssets,
      setSelectedAssets,
      push,
      refetchAssets,
    ]
  );

  return (
    <Stack gap={6}>
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

      <Flex gap={4} w="full">
        <Box flex={1} minW={0}>
          <DataTable
            columns={columns}
            data={assets ?? []}
            size={"sm"}
            isLoading={
              isLoadingAssets || isLoadingAssetTypes || isLoadingLabelTemplates
            }
            emptyList={{
              icon: FiBox,
              label: "No assets found",
              createHref: "/assets/create",
            }}
            filterActions={
              <Flex gap={2}>
                <Box borderLeftWidth={1} />
                <Button
                  leftIcon={<FiPlusCircle />}
                  variant={"outline"}
                  onClick={toggleFilters}
                >
                  Add Filter
                </Button>
                {filters.length > 0 && (
                  <Button
                    leftIcon={<FiX />}
                    variant={"ghost"}
                    onClick={clearFilters}
                  >
                    Clear
                  </Button>
                )}
              </Flex>
            }
            tableActions={
              <Flex gap={2}>
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
            }
          />
        </Box>
        <Box flex="none">
          <FilterOptions
            isOpen={isFiltersOpen}
            onClose={toggleFilters}
            assetsResponse={assetsResponse}
            assetTypes={assetTypes ?? []}
          />
        </Box>
      </Flex>
    </Stack>
  );
};
