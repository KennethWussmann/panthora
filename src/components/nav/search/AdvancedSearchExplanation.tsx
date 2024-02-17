import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Code,
  HStack,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";

export const AdvancedSearchExplanation = () => {
  const selectedSearchResultBackgroundColor = useColorModeValue(
    "gray.100",
    "gray.600"
  );

  return (
    <Accordion
      allowToggle
      sx={{
        ".chakra-accordion__item:first-of-type": {
          borderTopWidth: 0,
        },
        ".chakra-accordion__item:last-of-type": {
          borderBottomWidth: 0,
        },
        ".chakra-accordion__button": {
          borderRadius: "lg",
          _hover: {
            bg: selectedSearchResultBackgroundColor,
          },
        },
      }}
    >
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box as="span" flex="1" textAlign="left">
              Advanced
            </Box>
            <AccordionIcon mr={"-2px"} />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <Stack gap={4}>
            <p>
              You can craft more advanced and fine-grained search queries using
              keywords in a special syntax. By combining certain selectors, you
              can search for exactly what you are looking for. See some examples
              below.
            </p>
            <TableContainer>
              <Table variant="simple" size={"sm"}>
                <Thead>
                  <Tr>
                    <Th>Selector</Th>
                    <Th>Examples</Th>
                    <Th>Description</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>
                      <Code>is:</Code>
                    </Td>
                    <Td>
                      <HStack gap={2}>
                        <Code>is:asset</Code>
                        <Code>is:assettype</Code>
                        <Code>is:tag</Code>
                      </HStack>
                    </Td>
                    <Td>Search for a specific entity</Td>
                  </Tr>
                  <Tr>
                    <Td>
                      <Code>fieldname:</Code>
                    </Td>
                    <Td>
                      <HStack gap={2}>
                        <Code>name:Headphones</Code>
                        <Code>quantity:1</Code>
                      </HStack>
                    </Td>
                    <Td>Search inside a specific custom field</Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
            <p>
              For example, if you look for an asset called{" "}
              <Code>Headphones</Code> with a quantity of <Code>1</Code>, you can
              search for <Code>is:asset name:Headphones quantity:1</Code>.
            </p>
          </Stack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};
