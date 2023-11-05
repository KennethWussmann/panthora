import Error from "next/error";
import { useRouter } from "next/router";
import { AssetTypeCreateEditForm } from "~/components/asset-types/CreateEdit/AssetTypeCreateEditForm";
import { api } from "~/utils/api";

export default function EditAssetType() {
  const { query } = useRouter();
  const assetTypeId = query.id ? query.id : undefined;

  if (typeof assetTypeId !== "string") {
    return <Error statusCode={404} />;
  }

  const {
    data: assetType,
    refetch,
    isLoading,
  } = api.assetType.get.useQuery(assetTypeId);

  if (isLoading) {
    return null;
  }

  if (!assetType) {
    return <Error statusCode={404} />;
  }

  return <AssetTypeCreateEditForm assetType={assetType} refetch={refetch} />;
}
