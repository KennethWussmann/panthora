import { signOut, useSession } from "next-auth/react";
import { useEffect, type ReactNode } from "react";
import { api } from "@/utils/api";

export const Restricted = ({ children }: { children: ReactNode }) => {
  const session = useSession();
  const {
    data: user,
    isLoading,
    isError,
    isRefetchError,
  } = api.user.me.useQuery(undefined, {
    refetchInterval: 5000,
    retry: false,
  });

  useEffect(() => {
    if ((!isLoading && !user) || isError || isRefetchError) {
      if (session.status === "authenticated") {
        void signOut();
      }
      window.location.href = "/auth/signin";
    }
  }, [user, isLoading, isError, isRefetchError, session.status]);

  if (isLoading || !user || isError || isRefetchError) {
    return null;
  }

  return children;
};
