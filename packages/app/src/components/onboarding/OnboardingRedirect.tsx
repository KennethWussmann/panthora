import { useRouter } from "next/router";
import { useEffect } from "react";
import { api } from "@/utils/api";

export const OnboardingRedirect = () => {
  const { push, asPath } = useRouter();
  const { data: teams, isLoading } = api.team.list.useQuery(undefined, {
    retry: false,
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (
      asPath.startsWith("/onboarding") ||
      asPath.startsWith("/api") ||
      asPath.startsWith("/auth") ||
      isLoading ||
      !teams
    ) {
      return;
    }
    if (teams.length === 0) {
      void push("/onboarding");
    }
  }, [asPath, push, teams, isLoading]);

  return null;
};
