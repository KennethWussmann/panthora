import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  HStack,
  Heading,
  Input,
  Stack,
  Text,
  useBoolean,
} from "@chakra-ui/react";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getProviders, signIn } from "next-auth/react";
import { useEffect, type ReactElement } from "react";
import { FiLogIn } from "react-icons/fi";
import { FaAws, FaDiscord, FaGithub, FaGoogle } from "react-icons/fa";
import { getServerAuthSession } from "~/server/auth/auth";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import BlankLayout from "~/components/layout/BlankLayout";
import { CredentialsLoginForm } from "./CredentialsLoginForm";

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
    push,
    query: { error, logout },
  } = useRouter();

  useEffect(() => {
    if (
      !logout &&
      !error &&
      !isPasswordAuthEnabled &&
      Object.keys(providers).length === 1
    ) {
      // if there is only one third-party provider, sign in with it.
      setAutoSignIn.on();
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
              <Heading size={"lg"}>Tory</Heading>
              {isPasswordAuthEnabled && (
                <Text color="fg.muted">Login with your credentials</Text>
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
                <CredentialsLoginForm />
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
                    onClick={() =>
                      signIn(provider.id, { callbackUrl: "/dashboard" })
                    }
                    variant={"outline"}
                    w={"full"}
                    leftIcon={providerIcons[provider.id]}
                    isLoading={autoSignIn}
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
