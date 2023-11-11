import Error from "next/error";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

export default function AssetDetails() {
  const { query } = useRouter();
  const assetId = query.id ? query.id : undefined;

  if (typeof assetId !== "string") {
    return <Error statusCode={404} />;
  }

  const { data: asset, isLoading } = api.asset.get.useQuery(assetId);

  if (isLoading) {
    return null;
  }

  if (!asset) {
    return <Error statusCode={404} />;
  }

  return asset.id;
}
