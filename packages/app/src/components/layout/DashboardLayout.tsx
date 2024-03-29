import { type ReactNode } from "react";
import { Container, Flex, Show } from "@chakra-ui/react";
import { Breadcrumbs } from "../breadcrumbs/Breadcrumbs";
import { TeamInviteBanner } from "../team-invite/TeamInviteBanner";
import { Restricted } from "../auth/Restricted";
import { OnboardingRedirect } from "../onboarding/OnboardingRedirect";
import { NavSidebar } from "../nav/NavSidebar";
import { NavTopbar } from "../nav/NavTopbar";

export const DashboardLayout = ({ children }: { children: ReactNode }) => (
  <Restricted>
    <OnboardingRedirect />
    <Flex
      flexDirection={{ base: "column", md: "row" }}
      minH={{ base: undefined, md: "100vh" }}
    >
      <Show above="md">
        <Flex position="sticky" top="0" maxH="100vh" zIndex="1">
          <NavSidebar />
        </Flex>
      </Show>
      <Show below="md">
        <NavTopbar />
      </Show>
      <Flex
        as={Container}
        flexDir={"column"}
        overflowY={"scroll"}
        maxWidth={"full"}
        p={{ base: 4, md: 6 }}
        mt={{ base: "70px", md: 0 }}
      >
        <TeamInviteBanner />
        <Breadcrumbs />
        {children}
      </Flex>
    </Flex>
  </Restricted>
);
