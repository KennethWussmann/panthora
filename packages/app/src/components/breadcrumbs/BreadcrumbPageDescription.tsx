import { Box, Flex, Icon, Tooltip } from "@chakra-ui/react";
import { type ReactNode } from "react";
import { FaInfoCircle } from "react-icons/fa";
import { pageDescriptions } from "../nav/NavItems";

export const BreadcrumbPageDescription = ({
  page,
  children,
}: {
  page: string;
  children: ReactNode;
}) => {
  const description = pageDescriptions[page];
  return (
    <Tooltip label={description} aria-label="Page description">
      <Box>
        <Flex align="center" gap={2}>
          {children}
          {description && (
            <Icon as={FaInfoCircle} color="gray.400" h={4} w={4} />
          )}
        </Flex>
      </Box>
    </Tooltip>
  );
};
