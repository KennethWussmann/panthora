import { Progress } from "@chakra-ui/react";
import Error from "next/error";
import { LabelPDF } from "~/lib/pdf/LabelPDF";
import { api } from "~/utils/api";

export default function PrintAssets() {
  const { data: defaultTeam, isLoading: isLoadingDefaultTeam } =
    api.user.defaultTeam.useQuery();
  const { data: assets, isLoading } = api.asset.list.useQuery(
    {
      teamId: defaultTeam?.id ?? "",
    },
    {
      enabled: !!defaultTeam,
    }
  );

  if (isLoading || isLoadingDefaultTeam || !assets) {
    return <Progress size="xs" isIndeterminate />;
  }

  if (!assets) {
    return <Error statusCode={404} />;
  }

  return <LabelPDF assets={assets} />;
}
