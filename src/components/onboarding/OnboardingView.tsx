import { Box, Container, Stack } from "@chakra-ui/react";
import { type User } from "~/server/lib/user/user";
import { UserOnboarding } from "./UserOnboarding";

export const OnboardingView = ({ user }: { user: User }) => {
  return (
    <Container maxW="xl" py={{ base: "12", md: "24" }}>
      <Box p={8} borderWidth={1} rounded={4}>
        <Stack spacing="8">
          <UserOnboarding user={user} />
        </Stack>
      </Box>
    </Container>
  );
};
