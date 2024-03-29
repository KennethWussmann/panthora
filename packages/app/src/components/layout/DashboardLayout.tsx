import { type ReactNode } from "react";
import { Container, Flex, useBreakpointValue } from "@chakra-ui/react";
import { Breadcrumbs } from "../breadcrumbs/Breadcrumbs";
import { TeamInviteBanner } from "../team-invite/TeamInviteBanner";
import { Restricted } from "../auth/Restricted";
import { OnboardingRedirect } from "../onboarding/OnboardingRedirect";
import { NavSidebar } from "../nav/NavSidebar";
import { NavTopbar } from "../nav/NavTopbar";

export const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const isDesktop = useBreakpointValue({ base: false, md: true });

  return (
    <Restricted>
      <OnboardingRedirect />
      <Flex minH="100vh" flexDirection={isDesktop ? "row" : "column"}>
        {isDesktop ? <NavSidebar /> : <NavTopbar />}
        <Flex
          as={Container}
          p={6}
          flexDir={"column"}
          overflowY={"scroll"}
          mt={isDesktop ? 0 : "70px"}
          maxWidth={isDesktop ? "none" : "container.lg"}
        >
          <TeamInviteBanner />
          <Breadcrumbs />
          {children}
        </Flex>
      </Flex>
    </Restricted>
  );
};
