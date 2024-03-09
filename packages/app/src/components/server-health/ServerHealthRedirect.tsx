import { useRouter } from "next/router";
import { useEffect } from "react";
import { api } from "@/utils/api";

export const ServerHealthRedirect = () => {
  const { push, asPath } = useRouter();
  const { data: health } = api.server.health.useQuery(undefined, {
    refetchInterval: 1000 * 60,
  });

  useEffect(() => {
    if (health && !health.ok && !asPath.includes("/status")) {
      void push("/status");
    }
  }, [health, push, asPath]);
  return null;
};
