import { getProviders } from "next-auth/react";
import { useEffect, useState } from "react";

export const useLoginProviders = () => {
  const [providers, setProviders] = useState<
    Awaited<ReturnType<typeof getProviders>> | undefined
  >();
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    getProviders()
      .then((providers) => {
        setProviders(providers);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  });

  return {
    providers,
    isPasswordAuthEnabled: providers && "password" in providers,
    isLoading,
  };
};
