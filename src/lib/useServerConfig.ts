import { api } from "~/utils/api";

export const useServerConfig = () => {
  const { data: config, isLoading } = api.server.config.public.useQuery();
  return { config, isLoading };
};
