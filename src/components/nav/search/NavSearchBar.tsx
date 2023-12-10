import {
  Icon,
  IconButton,
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
import { FiBox, FiFolder, FiSearch, FiTag, FiX } from "react-icons/fi";
import { AdvancedSearchExplanation } from "./AdvancedSearchExplanation";
import { api } from "~/utils/api";
import {
  type ReactNode,
  useEffect,
  useState,
  KeyboardEventHandler,
  KeyboardEvent,
} from "react";
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
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

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

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (
    e: KeyboardEvent
  ) => {
    if (!searchResults) return;

    let newIndex: number;
    switch (e.key) {
      case "ArrowDown":
        newIndex = (selectedIndex + 1) % searchResults.length;
        setSelectedIndex(newIndex);
        break;
      case "ArrowUp":
        newIndex =
          (selectedIndex - 1 + searchResults.length) % searchResults.length;
        setSelectedIndex(newIndex);
        break;
      case "Enter":
        if (selectedIndex >= 0) {
          openResult(searchResults.at(selectedIndex)!);
        }
        break;
      default:
        break;
    }
  };

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

  useEffect(() => {
    // Reset the selected index when the search results change
    setSelectedIndex(-1);
  }, [searchResults]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size={"3xl"}>
        <ModalOverlay />
        <ModalContent onKeyDown={handleKeyDown}>
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
                <InputRightElement marginTop={1} marginRight={1}>
                  <IconButton
                    icon={<FiX />}
                    aria-label="Clear"
                    variant={"ghost"}
                    size={"sm"}
                    disabled={searchQuery.length === 0}
                    onClick={() => setSearchQuery("")}
                  />
                </InputRightElement>
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
                          backgroundColor={
                            selectedIndex === index ? "gray.100" : undefined
                          }
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
