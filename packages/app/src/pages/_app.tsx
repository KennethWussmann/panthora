import { type Session } from "next-auth";

import "../styles/globals.css";
import { api } from "@/utils/api";
import { type AppProps } from "next/app";
import Providers from "./_providers";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Head from "next/head";
import { type FC, type ReactNode } from "react";
import { type NextPage } from "next";
import { ServerHealthRedirect } from "@/components/server-health/ServerHealthRedirect";

// eslint-disable-next-line @typescript-eslint/ban-types
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  layout: FC<{ children: ReactNode }>;
};

type AppPropsWithLayout = AppProps<{ session: Session | null }> & {
  Component: NextPageWithLayout;
};

const App = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) => {
  const Layout = Component.layout || DashboardLayout;

  return (
    <Providers session={session}>
      <Layout>
        <Head>
          <title>Panthora</title>
          <link rel="icon" href="/favicon.ico" sizes="256x256" />
          <link
            rel="icon"
            href="/favicon.svg"
            sizes="any"
            type="image/svg+xml"
          />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/site.webmanifest" />
        </Head>
        <ServerHealthRedirect />
        <Component {...pageProps} />
      </Layout>
    </Providers>
  );
};
export default api.withTRPC(App);
