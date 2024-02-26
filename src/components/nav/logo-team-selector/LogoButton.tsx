import { Button, type ButtonProps } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { LogoPanthora } from "~/components/common/LogoPanthora";

export const LogoButton = (props: ButtonProps) => {
  const { push } = useRouter();

  return (
    <Button
      variant={"ghost"}
      {...props}
      p={0}
      onClick={() => void push("/dashboard")}
    >
      <LogoPanthora h={"30px"} w={"128px"} />
    </Button>
  );
};
