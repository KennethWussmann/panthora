import { type As, Heading, Icon, VStack, Button, Box } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { FiPlus } from "react-icons/fi";

export const EmptyListIcon = ({
  icon,
  label = "Not found",
  createHref,
}: {
  icon: As;
  label?: string;
  createHref?: string;
}) => {
  const { push } = useRouter();
  return (
    <VStack my={8} gap={8}>
      <Box>
        <VStack>
          <Icon as={icon} w={12} h={12} color="InactiveCaptionText" />
          <Heading size={"md"} color="InactiveCaptionText">
            {label}
          </Heading>
        </VStack>
      </Box>
      {createHref && (
        <Button
          leftIcon={<FiPlus />}
          size={"sm"}
          variant={"outline"}
          onClick={() => push(createHref)}
        >
          Create
        </Button>
      )}
    </VStack>
  );
};
