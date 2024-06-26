import {
  Hide,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Progress,
  Show,
  Stack,
  Tag,
  useDisclosure,
} from "@chakra-ui/react";
import {
  FiBox,
  FiCommand,
  FiDelete,
  FiFolder,
  FiSearch,
  FiTag,
  FiX,
} from "react-icons/fi";
import { AdvancedSearchExplanation } from "./AdvancedSearchExplanation";
import { api } from "@/utils/api";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import { type SearchResult } from "@/server/lib/search/searchResponse";
import { useSearchShortcut } from "./useSearchShortcut";
import { useTeam } from "@/lib/SelectedTeamProvider";
import { ResultGroup } from "./ResultGroup";
import {
  type ActionShortcut,
  useActionShortcutSearch,
} from "./useActionShortcutSearch";
import { EmptyListIcon } from "@/components/common/EmptyListIcon";
import { useImportModal } from "@/components/import/ImportModal";

export const NavSearchBar = ({ hideShortcut }: { hideShortcut?: true }) => {
  const { push } = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure();
  const { team } = useTeam();
  const [loadingRouter, setLoadingRouter] = useState(false);
  const { onOpen: openImportModal } = useImportModal();

  useSearchShortcut(onToggle);

  const { data: entitiesSearchResults, isLoading: isSearching } =
    api.search.search.useQuery(
      {
        query: searchQuery,
        teamId: team?.id ?? "",
      },
      {
        enabled: team && searchQuery.length > 0,
      }
    );
  const actionResults = useActionShortcutSearch(searchQuery);

  const results = useMemo(
    () => ({
      assets: entitiesSearchResults?.assets ?? [],
      assetTypes: entitiesSearchResults?.assetTypes ?? [],
      tags: entitiesSearchResults?.tags ?? [],
      actions: actionResults,
    }),
    [entitiesSearchResults, actionResults]
  );

  const hasAssets = results.assets.length > 0;
  const hasAssetTypes = results.assetTypes.length > 0;
  const hasTags = results.tags.length > 0;
  const hasActions = results.actions.length > 0;
  const hasResults = hasAssets || hasAssetTypes || hasTags || hasActions;

  const openResult = async (result: SearchResult | ActionShortcut) => {
    setLoadingRouter(true);
    switch (result.index) {
      case "assets":
        await push(`/assets/edit/${result.id}`);
        break;
      case "assetTypes":
        await push(`/asset-types/edit/${result.id}`);
        break;
      case "tags":
        await push(`/tags/edit/${result.id}`);
        break;
      case "actions":
        if (result.href) {
          await push(result.href);
        }
        if (result.openModal === "import") {
          openImportModal();
        }
        await result.onClick?.();
        break;
    }
    setLoadingRouter(false);
    onClose();
  };

  useEffect(() => {
    setSearchQuery("");
  }, [isOpen]);
  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size={"2xl"}>
        <ModalOverlay bg={"rgba(0,0,0,0.3)"} />
        <ModalContent mx={4}>
          <ModalBody p={2}>
            <Stack>
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
                  isDisabled={loadingRouter}
                  placeholder="Search"
                  variant={"flushed"}
                  size={"lg"}
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <InputRightElement marginTop={1} marginRight={1}>
                  <IconButton
                    icon={searchQuery.length === 0 ? <FiX /> : <FiDelete />}
                    aria-label={
                      searchQuery.length === 0 ? "Close Search" : "Clear Search"
                    }
                    variant={"ghost"}
                    size={"sm"}
                    disabled={searchQuery.length === 0}
                    onClick={() => {
                      if (searchQuery.trim().length === 0) {
                        onClose();
                      } else {
                        setSearchQuery("");
                      }
                    }}
                  />
                </InputRightElement>
              </InputGroup>
              {(loadingRouter || (isSearching && searchQuery.length > 0)) && (
                <Progress
                  isIndeterminate
                  size="xs"
                  mt={"-2"}
                  rounded={"full"}
                />
              )}

              {!hasResults && searchQuery.length === 0 && (
                <AdvancedSearchExplanation />
              )}
              {!isSearching && !hasResults && searchQuery.length > 0 && (
                <EmptyListIcon icon={FiSearch} label={"No results found"} />
              )}

              {hasAssets && (
                <ResultGroup
                  title="Assets"
                  icon={<FiBox />}
                  results={results.assets}
                  onClick={(result) => openResult(result)}
                />
              )}
              {hasAssetTypes && (
                <ResultGroup
                  title="Asset Types"
                  icon={<FiFolder />}
                  results={results.assetTypes}
                  onClick={(result) => openResult(result)}
                />
              )}
              {hasTags && (
                <ResultGroup
                  title="Tags"
                  icon={<FiTag />}
                  results={results.tags}
                  onClick={(result) => openResult(result)}
                />
              )}
              {hasActions && (
                <ResultGroup
                  title="Actions"
                  icon={<FiCommand />}
                  results={results.actions}
                  onClick={(result) => openResult(result)}
                />
              )}
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Show breakpoint="(max-width: 500px)">
        <IconButton
          icon={<FiSearch />}
          aria-label="Search"
          variant={"outline"}
          onClick={() => {
            if (!team) {
              return;
            }
            onOpen();
          }}
        />
      </Show>
      <Hide breakpoint="(max-width: 500px)">
        <InputGroup
          onClick={(e) => {
            if (!team) {
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
            isDisabled={!team || isOpen}
          />
          {!hideShortcut && (
            <InputRightElement
              pointerEvents="none"
              color="gray.300"
              fontSize="1.2em"
              marginRight={2}
            >
              <Tag>⌘K</Tag>
            </InputRightElement>
          )}
        </InputGroup>
      </Hide>
    </>
  );
};
