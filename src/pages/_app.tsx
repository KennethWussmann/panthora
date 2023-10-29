import { type Session } from "next-auth";

import { api } from "~/utils/api";
import { AppType } from "next/app";
import { Providers } from "./providers";
import { DashboardLayout } from "~/components/layout/DashboardLayout";
import Head from "next/head";

const App: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <Providers session={session}>
      <DashboardLayout>
        <Head>
          <title>Tory</title>
        </Head>
        <Component {...pageProps} />
      </DashboardLayout>
    </Providers>
  );
};
export default api.withTRPC(App);
