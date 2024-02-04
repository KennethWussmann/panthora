import { Progress, Table, Tbody, Th, Thead, Tr } from "@chakra-ui/react";
import { type Team } from "@prisma/client";
import { api } from "~/utils/api";
import { EmptyLabelTemplateRow, LabelTemplateRow } from "./LabelTemplateRow";

export const LabelTemplateTable = ({ team }: { team: Team }) => {
  const {
    data: templates,
    isLoading: isLoadingTemplates,
    refetch: refetchTemplates,
  } = api.labelTemplate.list.useQuery({ teamId: team.id });

  return (
    <>
      {isLoadingTemplates && <Progress size="xs" isIndeterminate />}
      {!isLoadingTemplates && (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Created at</Th>
              <Th>Name</Th>
              <Th>Dimensions (Width x Height)</Th>
              <Th>Components</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {templates?.length === 0 && <EmptyLabelTemplateRow />}
            {templates?.map((template) => (
              <LabelTemplateRow
                key={template.id}
                labelTemplate={template}
                refetchLabelTemplates={refetchTemplates}
              />
            ))}
          </Tbody>
        </Table>
      )}
    </>
  );
};
