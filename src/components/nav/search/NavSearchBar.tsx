import {
  Box,
  CircularProgress,
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
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import {
  FiBox,
  FiCommand,
  FiFolder,
  FiSearch,
  FiTag,
  FiX,
} from "react-icons/fi";
import { AdvancedSearchExplanation } from "./AdvancedSearchExplanation";
import { api } from "~/utils/api";
import {
  type ReactNode,
  useEffect,
  useState,
  type KeyboardEventHandler,
  type KeyboardEvent,
  useMemo,
} from "react";
import { useRouter } from "next/router";
import { type SearchResult } from "~/server/lib/search/searchResponse";
import { useSearchShortcut } from "./useSearchShortcut";
import {
  type ActionSearchResult,
  useActionShortcutSearch,
} from "./useActionShortcutSearch";

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
const ActionResultTypeColumn = () => (
  <Td fontWeight={"bold"}>
    <Icon fontSize={"1.2rem"}>
      <FiCommand />
    </Icon>
    Action
  </Td>
);

const searchResultTypeMap: Record<
  "assetTypes" | "assets" | "tags" | "actions",
  ReactNode
> = {
  assetTypes: <AssetTypeSearchResultTypeColumn />,
  assets: <AssetSearchResultTypeColumn />,
  tags: <TagSearchResultTypeColumn />,
  actions: <ActionResultTypeColumn />,
};

export const NavSearchBar = ({ hideShortcut }: { hideShortcut?: true }) => {
  const { push } = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure();
  const { data: defaultTeam, isLoading: isLoadingDefaultTeam } =
    api.user.defaultTeam.useQuery();
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [loadingRouter, setLoadingRouter] = useState(false);
  const modalOverlayLoadingBackgroundColor = useColorModeValue(
    "rgba(255, 255, 255, 0.8)",
    "rgba(0, 0, 0, 0.8)"
  );

  useSearchShortcut(onToggle);

  const { data: entitiesSearchResults } = api.search.search.useQuery(
    {
      query: searchQuery,
      teamId: defaultTeam?.id ?? "",
    },
    {
      enabled: defaultTeam && searchQuery.length > 0 && !isLoadingDefaultTeam,
    }
  );

  const actionResults = useActionShortcutSearch(searchQuery);

  const searchResults = useMemo(
    () => [...(actionResults ?? []), ...(entitiesSearchResults ?? [])],
    [actionResults, entitiesSearchResults]
  );

  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (
    e: KeyboardEvent
  ) => {
    if (!searchResults) return;

    switch (e.key) {
      case "ArrowDown":
        setSelectedIndex(
          (selectedIndex) => (selectedIndex + 1) % searchResults.length
        );
        break;
      case "ArrowUp":
        setSelectedIndex(
          (selectedIndex) =>
            (selectedIndex - 1 + searchResults.length) % searchResults.length
        );
        break;
      case "Enter":
        if (selectedIndex >= 0) {
          void openResult(searchResults.at(selectedIndex)!);
        }
        break;
      default:
        break;
    }
  };

  const openResult = async (result: SearchResult | ActionSearchResult) => {
    setLoadingRouter(true);
    switch (result.index) {
      case "assets":
        await push(`/assets/edit/${result.result.id}`);
        break;
      case "assetTypes":
        await push(`/asset-types/edit/${result.result.id}`);
        break;
      case "tags":
        await push(`/tags/edit/${result.result.id}`);
        break;
      case "actions":
        if (result.result.href) {
          await push(result.result.href);
        }
        await result.result.onClick?.();
        break;
    }
    setLoadingRouter(false);
    onClose();
  };

  useEffect(() => {
    setSearchQuery("");
  }, [isOpen]);

  useEffect(() => {
    // Reset the selected index when the search results change
    console.log("Resetting selected index");
    setSelectedIndex(searchResults.length > 0 ? 0 : -1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  useEffect(() => {
    console.log("selectedIndex", selectedIndex);
  }, [selectedIndex]);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size={"3xl"}>
        <ModalOverlay />
        <ModalContent onKeyDown={handleKeyDown} position={"relative"}>
          {loadingRouter && (
            <Box
              position="absolute"
              rounded={"md"}
              top={0}
              left={0}
              right={0}
              bottom={0}
              display="flex"
              justifyContent="center"
              alignItems="center"
              zIndex={100}
              backgroundColor={modalOverlayLoadingBackgroundColor}
            >
              <CircularProgress isIndeterminate />
            </Box>
          )}
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
