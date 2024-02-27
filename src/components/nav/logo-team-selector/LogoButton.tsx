import { type ButtonProps, IconButton } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { LogoIcon } from "~/components/common/LogoIcon";
import { LogoPanthora } from "~/components/common/LogoPanthora";

export const LogoButton = (props: ButtonProps & { showIcon?: boolean }) => {
  const { push } = useRouter();

  return (
    <IconButton
      variant={"ghost"}
      aria-label={"Panthora"}
      onClick={() => void push("/dashboard")}
      icon={
        props.showIcon ? (
          <LogoIcon size={"30px"} />
        ) : (
          <LogoPanthora h={"30px"} w={"128px"} />
        )
      }
      {...props}
    />
  );
};
