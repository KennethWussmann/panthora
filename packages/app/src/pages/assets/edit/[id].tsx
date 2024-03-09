import Error from "next/error";
import { useRouter } from "next/router";
import { AssetCreateEditForm } from "@/components/assets/CreateEdit/AssetCreateEditForm";
import { api } from "@/utils/api";

export default function EditAsset() {
  const { query } = useRouter();
  const assetId = query.id ? query.id : undefined;

  if (typeof assetId !== "string") {
    return <Error statusCode={404} />;
  }

  const { data: asset, refetch, isLoading } = api.asset.get.useQuery(assetId);

  if (isLoading) {
    return null;
  }

  if (!asset) {
    return <Error statusCode={404} />;
  }

  return <AssetCreateEditForm asset={asset} refetch={refetch} />;
}
