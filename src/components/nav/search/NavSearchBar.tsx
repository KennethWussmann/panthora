import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Code,
  Divider,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Stack,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { FiBox, FiFolder, FiSearch, FiTag } from "react-icons/fi";
import { AdvancedSearchExplanation } from "./AdvancedSearchExplanation";

const AssetSearchResultTypeColumn = () => (
  <Td fontWeight={"bold"}>
    <Icon fontSize={"1.2rem"}>
      <FiBox />
    </Icon>
    Asset
  </Td>
);
const AssetTypeSearchResultTypeColumn = () => (
  <Td fontWeight={"bold"}>
    <Icon fontSize={"1.2rem"}>
      <FiFolder />
    </Icon>
    Asset Type
  </Td>
);
const TagSearchResultTypeColumn = () => (
  <Td fontWeight={"bold"}>
    <Icon fontSize={"1.2rem"}>
      <FiTag />
    </Icon>
    Asset
  </Td>
);

export const NavSearchBar = ({ hideShortcut }: { hideShortcut?: true }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size={"3xl"}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody mt={10} mb={4}>
            <Stack gap={4}>
              <InputGroup>
                <InputLeftElement
                  pointerEvents="none"
                  color="gray.300"
                  fontSize="1.2em"
                  mt={1}
                  ml={1}
                >
                  <FiSearch />
                </InputLeftElement>
                <Input
                  placeholder="Search"
                  variant={"outline"}
                  size={"lg"}
                  autoFocus
                />
                {!hideShortcut && (
                  <InputRightElement
                    pointerEvents="none"
                    color="gray.300"
                    fontSize="1.2em"
                    marginRight={2}
                  />
                )}
              </InputGroup>

              <AdvancedSearchExplanation />
              <Progress size="xs" isIndeterminate />

              <TableContainer>
                <Table variant="simple">
                  <TableCaption>49 Results</TableCaption>
                  <Thead>
                    <Tr>
                      <Th>Type</Th>
                      <Th>Name</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr _hover={{ bgColor: "gray.100", cursor: "pointer" }}>
                      <AssetSearchResultTypeColumn />
                      <Td>millimetres (mm)</Td>
                    </Tr>
                    <Tr>
                      <AssetTypeSearchResultTypeColumn />
                      <Td>centimetres (cm)</Td>
                    </Tr>
                    <Tr>
                      <TagSearchResultTypeColumn />
                      <Td>metres (m)</Td>
                    </Tr>
                  </Tbody>
                </Table>
              </TableContainer>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
      <InputGroup
        onClick={(e) => {
          onOpen();
          e.preventDefault();
        }}
      >
        <InputLeftElement
          pointerEvents="none"
          color="gray.300"
          fontSize="1.2em"
        >
          <FiSearch />
        </InputLeftElement>
        <Input placeholder="Search" variant={"outline"} />
        {!hideShortcut && (
          <InputRightElement
            pointerEvents="none"
            color="gray.300"
            fontSize="1.2em"
            marginRight={2}
          />
        )}
      </InputGroup>
    </>
  );
};
