import { Box, Container, Stack } from "@chakra-ui/react";
import { UserOnboarding } from "./UserOnboarding";
import { useUser } from "@/lib/UserProvider";

export const OnboardingView = () => {
  const { user } = useUser();

  if (!user) {
    return null;
  }
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
