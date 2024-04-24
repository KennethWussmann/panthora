"use client";

import { CacheProvider } from "@chakra-ui/next-js";
import { ChakraProvider, ColorModeScript, extendTheme } from "@chakra-ui/react";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ImportModal } from "@/components/import/ImportModal";
import { SelectedAssetProvider } from "@/lib/SelectedAssetsProvider";
import { SelectedTeamProvider } from "@/lib/SelectedTeamProvider";
import { UserProvider } from "@/lib/UserProvider";
import { AnnotationsProvider } from "~/components/onboarding/annotation/AnnotationProvider";

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
    <AnnotationsProvider>
      <CacheProvider>
        <ChakraProvider theme={theme}>
          {/* eslint-disable-next-line */}
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <SessionProvider session={session}>
            <UserProvider>
              <SelectedTeamProvider>
                <SelectedAssetProvider>
                  <ImportModal>{children}</ImportModal>
                </SelectedAssetProvider>
              </SelectedTeamProvider>
            </UserProvider>
          </SessionProvider>
        </ChakraProvider>
      </CacheProvider>
    </AnnotationsProvider>
  );
}

export default Providers;
