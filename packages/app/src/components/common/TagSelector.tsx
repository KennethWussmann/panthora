import { Select } from "@chakra-ui/react";
import React from "react";
import { useTeam } from "@/lib/SelectedTeamProvider";
import { type Tag } from "@/server/lib/tags/tag";
import { api } from "@/utils/api";

const renderNestedTags = (tags: Tag[], level = 0) => {
  return tags.map((tag) => (
    <React.Fragment key={tag.id}>
      <option value={tag.id}>
        {String.fromCharCode(160).repeat(level * 4)}
        {tag.name}
      </option>
      {tag.children && renderNestedTags(tag.children, level + 1)}
    </React.Fragment>
  ));
};

export const TagSelector = ({
  value,
  onChange,
  isDisabled = false,
  allowParentsOnly,
}: {
  value: string | undefined;
  onChange: (tagId: string | undefined) => void;
  isDisabled?: boolean;
  allowParentsOnly?: boolean;
}) => {
  const { team } = useTeam();

  const { data: tags } = api.tag.list.useQuery(
    { teamId: team?.id ?? "", parentsOnly: allowParentsOnly },
    { enabled: !!team }
  );
  return (
    <Select
      placeholder="None"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      isDisabled={isDisabled || !team}
    >
      {tags && renderNestedTags(tags)}
    </Select>
  );
};
