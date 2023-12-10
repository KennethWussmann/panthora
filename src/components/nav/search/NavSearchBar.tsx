import {
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
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
import { api } from "~/utils/api";
import { type ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { type SearchResult } from "~/server/lib/search/searchResponse";
import { useSearchShortcut } from "./useSearchShortcut";

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
    Tag
  </Td>
);

const searchResultTypeMap: Record<"assetTypes" | "assets" | "tags", ReactNode> =
  {
    assetTypes: <AssetTypeSearchResultTypeColumn />,
    assets: <AssetSearchResultTypeColumn />,
    tags: <TagSearchResultTypeColumn />,
  };

export const NavSearchBar = ({ hideShortcut }: { hideShortcut?: true }) => {
  const { push } = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure();
  const { data: defaultTeam, isLoading: isLoadingDefaultTeam } =
    api.user.defaultTeam.useQuery();

  useSearchShortcut(onToggle);

  const { data: searchResults } = api.search.search.useQuery(
    {
      query: searchQuery,
      teamId: defaultTeam?.id ?? "",
    },
    {
      enabled: defaultTeam && searchQuery.length > 0 && !isLoadingDefaultTeam,
    }
  );

  const openResult = (result: SearchResult) => {
    switch (result.index) {
      case "assets":
        void push(`/assets/edit/${result.result.id}`);
        break;
      case "assetTypes":
        void push(`/asset-types/edit/${result.result.id}`);
        break;
      case "tags":
        void push(`/tags/edit/${result.result.id}`);
        break;
    }
    onClose();
  };

  useEffect(() => {
    setSearchQuery("");
  }, [isOpen]);

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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>

              <AdvancedSearchExplanation />

              {searchResults && (
                <TableContainer>
                  <Table variant="simple">
                    <TableCaption>
                      {searchResults.length}{" "}
                      {searchResults.length === 1 ? "result" : "results"}
                    </TableCaption>
                    <Thead>
                      <Tr>
                        <Th>Type</Th>
                        <Th>Name</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {searchResults.map((result, index) => (
                        <Tr
                          key={index}
                          _hover={{ bgColor: "gray.100", cursor: "pointer" }}
                          onClick={() => openResult(result)}
                        >
                          {searchResultTypeMap[result.index]}
                          <Td>{result.result.name}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
      <InputGroup
        onClick={(e) => {
          if (isLoadingDefaultTeam) {
            return;
          }
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
        <Input
          placeholder="Search"
          variant={"outline"}
          isDisabled={isLoadingDefaultTeam || isOpen}
        />
        {!hideShortcut && (
          <InputRightElement
            pointerEvents="none"
            color="gray.300"
            fontSize="1.2em"
            marginRight={2}
          >
            ⌘K
          </InputRightElement>
        )}
      </InputGroup>
    </>
  );
};
