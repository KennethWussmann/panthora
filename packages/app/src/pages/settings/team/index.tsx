import { Progress } from "@chakra-ui/react";
import Error from "next/error";
import { SettingsView } from "@/components/settings/SettingsView";
import { useTeamMembershipRole } from "@/lib/useTeamMembershipRole";

export default function Settings() {
  const { team, refetch, isLoading, isAdminOrOwner } = useTeamMembershipRole();
  if (isLoading || !team) {
    return <Progress size={"xs"} isIndeterminate rounded={"full"} />;
  }

  if (!isAdminOrOwner) {
    return <Error statusCode={403} />;
  }

  return <SettingsView team={team} refetch={refetch} />;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  };
}
