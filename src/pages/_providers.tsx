"use client";

import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider, ColorModeScript, extendTheme } from "@chakra-ui/react";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { SelectedAssetProvider } from "~/lib/SelectedAssetsProvider";
import { SelectedTeamProvider } from "~/lib/SelectedTeamProvider";

const theme = extendTheme({
  config: {
    initialColorMode: "system",
    useSystemColorMode: true,
  },
});

function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        {/* eslint-disable-next-line */}
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <SessionProvider session={session}>
          <SelectedTeamProvider>
            <SelectedAssetProvider>{children}</SelectedAssetProvider>
          </SelectedTeamProvider>
        </SessionProvider>
      </ChakraProvider>
    </CacheProvider>
  );
}

export default Providers;
