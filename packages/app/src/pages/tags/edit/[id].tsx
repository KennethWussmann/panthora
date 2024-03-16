import Error from "next/error";
import { useRouter } from "next/router";
import { TagEditCreationForm } from "@/components/tags/Create/TagEditCreationForm";
import { api } from "@/utils/api";

export default function EditTag() {
  const { query } = useRouter();
  const tagId = query.id ? query.id : undefined;

  if (typeof tagId !== "string") {
    return <Error statusCode={404} />;
  }

  const { data: tag, refetch, isLoading } = api.tag.get.useQuery(tagId);

  if (isLoading) {
    return null;
  }

  if (!tag) {
    return <Error statusCode={404} />;
  }

  return <TagEditCreationForm tag={tag} refetch={refetch} />;
}
