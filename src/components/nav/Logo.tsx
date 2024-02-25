import { Button, type ButtonProps, HStack, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";

export const Logo = (props: ButtonProps) => {
  const { push } = useRouter();

  return (
    <Button
      variant="ghost"
      justifyContent={"start"}
      {...props}
      onClick={() => void push("/dashboard")}
    >
      <HStack spacing="3">
        <Text color="on-accent-subtle">Panthora</Text>
      </HStack>
    </Button>
  );
};
