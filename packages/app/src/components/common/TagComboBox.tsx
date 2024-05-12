import { ComboBox, ComboBoxItem } from "./ComboBox";
import { useState } from "react";
import { Button, Progress } from "@chakra-ui/react";
import { useTeam } from "~/lib/SelectedTeamProvider";
import { api } from "~/utils/api";
import { FiPlus } from "react-icons/fi";

export type TagComboBoxProps = {
  parentTagId: string;
  values: string[];
  onChange: (value: string[]) => void;
  min?: number;
  max?: number;
};

export const TagComboBox = ({
  parentTagId,
  values,
  onChange,
  min,
  max,
}: TagComboBoxProps) => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [availableOptions, setAvailableOptions] = useState<number>(0);
  const { team } = useTeam();
  const {
    data: tags,
    refetch,
    isLoading,
  } = api.tag.list.useQuery(
    {
      teamId: team!.id,
      parentId: parentTagId ?? "",
    },
    {
      enabled: !!team,
    }
  );
  const createTag = api.tag.create.useMutation();

  return (
    <ComboBox
      values={values ?? []}
      onChange={(tagIds) => {
        onChange?.(tagIds);
      }}
      max={max}
      min={min}
      placeholder="Select Tags"
      onSearchInputChange={setSearchValue}
      onSearchSuggestionsChange={(options) =>
        setAvailableOptions(options.length)
      }
    >
      {isLoading && <Progress size="xs" isIndeterminate />}
      {!isLoading &&
        tags?.map((tag) => (
          <ComboBoxItem key={tag.id} value={tag.id}>
            {tag.name}
          </ComboBoxItem>
        ))}
      {availableOptions === 0 && searchValue.length > 0 && (
        <Button
          variant={"ghost"}
          leftIcon={<FiPlus />}
          w={"full"}
          onClick={async () => {
            const { id } = await createTag.mutateAsync({
              teamId: team!.id,
              parentId: parentTagId,
              name: searchValue,
            });
            void refetch();
            onChange([...(values ?? []), id]);
          }}
        >
          Create Tag
        </Button>
      )}
    </ComboBox>
  );
};
