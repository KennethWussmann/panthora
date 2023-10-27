import { type Session } from "next-auth";

import { api } from "~/utils/api";
import { AppType } from "next/app";
import { Providers } from "./providers";
import { DashboardLayout } from "~/components/layout/DashboardLayout";

const App: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <Providers session={session}>
      <DashboardLayout>
        <Component {...pageProps} />
      </DashboardLayout>
    </Providers>
  );
};
export default api.withTRPC(App);
