import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Container,
  Divider,
  HStack,
  Heading,
  Stack,
  Text,
  useBoolean,
} from "@chakra-ui/react";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getProviders, signIn } from "next-auth/react";
import { useEffect, type ReactElement, useState } from "react";
import { FaAws, FaDiscord, FaGithub, FaGoogle } from "react-icons/fa";
import { getServerAuthSession } from "~/server/auth/auth";
import { useRouter } from "next/router";
import BlankLayout from "~/components/layout/BlankLayout";
import { CredentialsLoginForm } from "../../components/auth/CredentialsLoginForm";
import { CredentialsRegisterForm } from "../../components/auth/CredentialsRegisterForm";
import { FiLogIn, FiUserPlus } from "react-icons/fi";

const providerIcons: Record<string, ReactElement> = {
  cognito: <FaAws />,
  discord: <FaDiscord />,
  google: <FaGoogle />,
  github: <FaGithub />,
};

export default function SignIn({
  providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const isPasswordAuthEnabled = "password" in providers;
  const hasProviders = Object.keys(providers).length > 0;
  const hasThirdPartyProviders = isPasswordAuthEnabled
    ? Object.keys(providers).length > 1
    : Object.keys(providers).length > 0;
  const [autoSignIn, setAutoSignIn] = useBoolean();
  const {
    query: { error, logout },
  } = useRouter();
  const [credentialsForm, setCredentialsForm] = useState<
    "login" | "register" | "none"
  >(isPasswordAuthEnabled ? "login" : "none");
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    if (
      !logout &&
      !error &&
      !isPasswordAuthEnabled &&
      Object.keys(providers).length === 1
    ) {
      // if there is only one third-party provider, sign in with it.
      setAutoSignIn.on();
      setLoading(true);
      void signIn(Object.keys(providers)[0], { callbackUrl: "/dashboard" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container maxW="md" py={{ base: "12", md: "24" }}>
      <Box p={8} borderWidth={1} rounded={4}>
        <Stack spacing="8">
          <Stack spacing="6">
            <Stack spacing={{ base: "2", md: "3" }} textAlign="center">
              <Heading size={"lg"}>Panthora</Heading>
              {credentialsForm === "login" && (
                <Text color="fg.muted">Login with your credentials</Text>
              )}
              {credentialsForm === "register" && (
                <Text color="fg.muted">Register a new account</Text>
              )}
            </Stack>
          </Stack>
          {!hasProviders && (
            <Alert status="error">
              <AlertIcon />
              <AlertDescription>
                There are no configured sign in providers. Please check the
                configuration.
              </AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert status="error">
              <AlertIcon />
              <AlertDescription>
                There was an error during login: {error}
              </AlertDescription>
            </Alert>
          )}
          {logout && (
            <Alert status="success">
              <AlertIcon />
              <AlertDescription>Logged out successfully</AlertDescription>
            </Alert>
          )}
          {autoSignIn && (
            <Alert status="info">
              <AlertIcon />
              <AlertDescription>
                Logging in with {Object.values(providers).at(0)?.name} ...
              </AlertDescription>
            </Alert>
          )}
          <Stack spacing="6">
            {isPasswordAuthEnabled && (
              <>
                {credentialsForm === "login" && (
                  <Stack>
                    <CredentialsLoginForm />
                    <Divider />
                    <Button
                      leftIcon={<FiUserPlus />}
                      onClick={() => {
                        setCredentialsForm("register");
                      }}
                    >
                      Create Account
                    </Button>
                  </Stack>
                )}
                {credentialsForm === "register" && (
                  <Stack>
                    <CredentialsRegisterForm />
                    <Divider />
                    <Button
                      leftIcon={<FiLogIn />}
                      onClick={() => {
                        setCredentialsForm("login");
                      }}
                    >
                      Login
                    </Button>
                  </Stack>
                )}
                {hasThirdPartyProviders && (
                  <HStack>
                    <Divider />
                    <Text textStyle="sm" color="fg.muted">
                      OR
                    </Text>
                    <Divider />
                  </HStack>
                )}
              </>
            )}
            {!autoSignIn &&
              hasThirdPartyProviders &&
              !isPasswordAuthEnabled && (
                <Text color="fg.muted" textAlign={"center"}>
                  Login with one of the providers
                </Text>
              )}
            <Stack spacing="3">
              {Object.values(providers)
                .filter((provider) => provider.id !== "password")
                .map((provider) => (
                  <Button
                    key={provider.name}
                    onClick={() => {
                      setLoading(true);
                      void signIn(provider.id, { callbackUrl: "/dashboard" });
                    }}
                    variant={"outline"}
                    w={"full"}
                    leftIcon={providerIcons[provider.id]}
                    loadingText={provider.name}
                    isLoading={autoSignIn || isLoading}
                  >
                    {provider.name}
                  </Button>
                ))}
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Container>
  );
}
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerAuthSession(context);

  if (session) {
    return { redirect: { destination: "/dashboard" } };
  }

  const providers = await getProviders();

  return {
    props: { providers: providers ?? [] },
  };
}

SignIn.layout = BlankLayout;
