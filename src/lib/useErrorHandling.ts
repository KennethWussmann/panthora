import { useToast } from "@chakra-ui/react";
import { type AnyMutationProcedure } from "@trpc/server";

import { type DecorateProcedure } from "@trpc/react-query/shared";

export const useErrorHandlingMutation = <
  Procedure extends AnyMutationProcedure,
  Params = unknown,
  V extends string = string
>(
  proc: DecorateProcedure<Procedure, Params, V>
) => {
  const toast = useToast();
  return proc.useMutation({
    useErrorBoundary: false,
    onError: (error: unknown) => {
      if (error instanceof Error) {
        toast({
          title: error.name,
          description: error.message,
          status: "error",
          duration: 30000,
          isClosable: true,
        });
      }
    },
  });
};
