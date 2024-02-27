import { type ReactNode } from "react";
import { NavSidebar } from "../nav/NavSidebar";
import { Container, Flex, Show, Spacer } from "@chakra-ui/react";
import { NavTopbar } from "../nav/NavTopbar";
import { Breadcrumbs } from "../breadcrumbs/Breadcrumbs";
import { TeamInviteBanner } from "../team-invite/TeamInviteBanner";
import { Restricted } from "../auth/Restricted";
import { OnboardingRedirect } from "../onboarding/OnboardingRedirect";

const DesktopLayout = ({ children }: { children: ReactNode }) => {
  return (
    <Flex minH="100vh" flexDirection="row">
      <Flex position="sticky" top="0" maxH="100vh" zIndex="1">
        <NavSidebar />
      </Flex>
      <Flex flex="1" p={6} direction="column" overflowY="scroll">
        <TeamInviteBanner />
        <Breadcrumbs />

        {children}
      </Flex>
    </Flex>
  );
};

const MobileLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <NavTopbar />
      <Spacer mt={"70px"} />
      <Container maxW={"container.lg"} py={6}>
        <TeamInviteBanner />
        <Breadcrumbs />

        {children}
      </Container>
    </>
  );
};

export const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <Restricted>
      <OnboardingRedirect />
      <Show above="md">
        <DesktopLayout>{children}</DesktopLayout>
      </Show>
      <Show below="md">
        <MobileLayout>{children}</MobileLayout>
      </Show>
    </Restricted>
  );
};
