import Error from "next/error";
import { useRouter } from "next/router";
import { LabelTemplateCreateEditForm } from "~/components/settings/LabelTemplateSettings/LabelTemplateCreateEditForm";
import { api } from "~/utils/api";

export default function LabelTemplateEditPage() {
  const { query } = useRouter();
  const labelTemplateId = query.id ? query.id : undefined;

  if (typeof labelTemplateId !== "string") {
    return <Error statusCode={404} />;
  }

  const {
    data: labelTemplate,
    refetch,
    isLoading,
  } = api.labelTemplate.get.useQuery(labelTemplateId);

  if (isLoading) {
    return null;
  }

  if (!labelTemplate) {
    return <Error statusCode={404} />;
  }

  return (
    <LabelTemplateCreateEditForm
      labelTemplate={labelTemplate}
      refetch={refetch}
    />
  );
}
