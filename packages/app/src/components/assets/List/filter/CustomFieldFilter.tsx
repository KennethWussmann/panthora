import { type CategoriesDistribution } from "meilisearch";
import {
  Button,
  Checkbox,
  Collapse,
  Divider,
  Flex,
  Tag,
  useDisclosure,
} from "@chakra-ui/react";
import { FieldType } from "@prisma/client";
import { type ReactElement } from "react";
import { type FilterKeyValue, type FacetFilter } from "./facetFilter";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { useAssetTable, useAssetTableFilter } from "../AssetTableContext";
import { type AssetTypeField } from "~/server/lib/asset-types/assetType";

type CustomFieldFilterProps = {
  filter: FacetFilter;
  distribution: CategoriesDistribution;
  onChange: (filter: FacetFilter) => void;
};

const buildFacetFilter =
  (
    filter: FacetFilter,
    onChange: (filter: FacetFilter) => void,
    value: string
  ) =>
  (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    const conditions: FilterKeyValue[] = filter.conditions.filter(
      ({ value: v }) => v !== value
    );

    if (checked) {
      conditions.push({ key: filter.field.slug, value });
    }

    onChange({
      ...filter,
      conditions,
    });
  };

const isChecked = (filter: FacetFilter, value: string) =>
  filter.conditions.some(({ value: v }) => v === value);

const CheckboxFilter = ({
  filter,
  distribution,
  onChange,
}: CustomFieldFilterProps) => {
  const truncateLimit = 5;
  const isTruncated = Object.keys(distribution ?? {}).length > truncateLimit;
  const truncatedDistribution = isTruncated
    ? Object.fromEntries(
        Object.entries(distribution ?? {}).slice(0, truncateLimit)
      )
    : distribution;
  const additionalDistribution = isTruncated
    ? Object.entries(distribution ?? {}).slice(truncateLimit)
    : [];

  const { isOpen, getButtonProps } = useDisclosure();

  return (
    <Flex direction="column" gap={2}>
      {Object.entries(truncatedDistribution ?? {}).map(([value, count]) => (
        <Checkbox
          key={`${filter.field.id}-${value}`}
          isChecked={isChecked(filter, value)}
          onChange={buildFacetFilter(filter, onChange, value)}
        >
          {value} <Tag rounded="full">{count}</Tag>
        </Checkbox>
      ))}
      <Collapse in={isOpen} animateOpacity>
        <Flex direction="column" gap={2}>
          {additionalDistribution.map(([value, count]) => (
            <Checkbox
              key={`${filter.field.id}-${value}`}
              isChecked={isChecked(filter, value)}
              onChange={buildFacetFilter(filter, onChange, value)}
            >
              {value} <Tag rounded="full">{count}</Tag>
            </Checkbox>
          ))}
        </Flex>
      </Collapse>
      {isTruncated && (
        <>
          <Divider />
          <Button
            size="xs"
            {...getButtonProps()}
            variant={"ghost"}
            leftIcon={isOpen ? <FiChevronUp /> : <FiChevronDown />}
          >
            {isOpen
              ? "Show less"
              : `Show ${additionalDistribution.length} more`}
          </Button>
        </>
      )}
    </Flex>
  );
};

const BooleanFilter = ({
  filter,
  distribution,
  onChange,
}: CustomFieldFilterProps) => (
  <Flex direction="column" gap={2}>
    {Object.entries(distribution ?? {}).map(([value, count]) => (
      <Checkbox
        key={`${filter.field.id}-${value}`}
        isChecked={isChecked(filter, value)}
        onChange={buildFacetFilter(filter, onChange, value)}
      >
        {value === "true" ? "Yes" : "No"} <Tag rounded="full">{count}</Tag>
      </Checkbox>
    ))}
  </Flex>
);

const filterType: Partial<
  Record<FieldType, (props: CustomFieldFilterProps) => ReactElement>
> = {
  [FieldType.TAG]: CheckboxFilter,
  [FieldType.STRING]: CheckboxFilter,
  [FieldType.BOOLEAN]: BooleanFilter,
};

export const CustomFieldFilter = ({
  field,
  distribution,
}: {
  field: AssetTypeField;
  distribution: CategoriesDistribution;
}) => {
  const { updateFilter } = useAssetTable();
  const filter = useAssetTableFilter(field);
  return filterType[filter.field.fieldType]?.({
    filter,
    distribution,
    onChange: updateFilter,
  });
};
