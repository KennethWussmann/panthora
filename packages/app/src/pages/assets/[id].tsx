import Error from "next/error";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { api } from "@/utils/api";

export default function AssetDetails() {
  const { query, push } = useRouter();
  const assetId = query.id ? query.id : undefined;
  const { data: asset, isLoading } = api.asset.get.useQuery(
    typeof assetId === "string" && !!assetId ? assetId : "",
    {
      enabled: typeof assetId === "string" && !!assetId,
    }
  );

  useEffect(() => {
    if (asset) {
      void push(`/assets/edit/${asset.id}`);
    }
  }, [asset, push]);

  if (typeof assetId !== "string") {
    return <Error statusCode={404} />;
  }

  if (isLoading) {
    return null;
  }

  if (!asset) {
    return <Error statusCode={404} />;
  }

  return asset.id;
}
