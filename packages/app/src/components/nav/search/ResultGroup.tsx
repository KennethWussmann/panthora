import { Heading, Icon, List, ListItem, Box, useColorModeValue } from "@chakra-ui/react";
import { type ReactNode } from "react";

const ResultItem = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: VoidFunction;
}) => {
  const selectedSearchResultBackgroundColor = useColorModeValue(
    "gray.100",
    "gray.600"
  );

  return (
    <Box
      py={2}
      px={3}
      _hover={{ bg: selectedSearchResultBackgroundColor, cursor: "pointer" }}
      rounded={"lg"}
      onClick={onClick}
    >
      <ListItem>{children}</ListItem>
    </Box>
  );
};

type ResultGroupResultItem = unknown;
type ResultGroupProps<T extends ResultGroupResultItem> = {
  title: string;
  icon: ReactNode;
  results: T[];
  onClick: (result: T) => void | Promise<void>;
};

export const ResultGroup = <T extends ResultGroupResultItem>({
  title,
  icon,
  results,
  onClick,
}: ResultGroupProps<T>) => {
  if (results.length === 0) {
    return null;
  }
  return (
    <Box my={1} mx={1}>
      <Heading size={"xs"} fontWeight={"bold"} color={"gray.400"} mx={3} my={1}>
        <Icon fontSize={"1.2rem"}>{icon}</Icon> {title}
      </Heading>
      <List>
        {results.map((result, index) => (
          <ResultItem key={index} onClick={async () => await onClick(result)}>
            {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */}
            {(result as unknown as any)?.name ?? "N/A"}
          </ResultItem>
        ))}
      </List>
    </Box>
  );
};
