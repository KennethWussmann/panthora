import {
  Box,
  Input,
  Tag as ChakraTag,
  TagCloseButton,
  TagLabel,
  VStack,
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverArrow,
  PopoverBody,
  HStack,
} from "@chakra-ui/react";
import { useState, useRef, KeyboardEvent } from "react";

type Tag = {
  id: string;
  name: string;
};

type TagSearchInputProps = {
  suggestions: Tag[];
  onTagsChange: (tags: string[]) => void;
  value: string[];
  setValue: (tags: string[]) => void;
  min?: number;
  max?: number;
};

export const TagSearchInput: React.FC<TagSearchInputProps> = ({
  suggestions,
  onTagsChange,
  value,
  setValue,
  min = 0,
  max,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const maximumReached = !!max && value.length === max;

  const filteredSuggestions = inputValue
    ? suggestions.filter(
        (sug) => sug.name.startsWith(inputValue) && !value.includes(sug.id)
      )
    : suggestions.filter((sug) => !value.includes(sug.id));

  const addTag = (tag: Tag) => {
    if (!value.includes(tag.id)) {
      const newTagIds = [...value, tag.id];
      setValue(newTagIds);
      onTagsChange(newTagIds);
      setInputValue("");
    }
  };

  const removeTag = (tagId: string) => {
    const newTagIds = value.filter((id) => id !== tagId);
    setValue(newTagIds);
    onTagsChange(newTagIds);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveSuggestionIndex((prev) =>
          Math.min(prev + 1, suggestions.length - 1)
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveSuggestionIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (
          activeSuggestionIndex >= 0 &&
          activeSuggestionIndex < suggestions.length
        ) {
          const selectedTag = suggestions[activeSuggestionIndex];
          if (selectedTag) {
            addTag(selectedTag);
          }
          setActiveSuggestionIndex(-1);
        }
        break;

      default:
        break;
    }
  };

  return (
    <VStack align="start">
      <HStack align={"stretch"}>
        {value.map((tagId) => {
          const tag = suggestions.find((t) => t.id === tagId);
          if (!tag) return null;
          return (
            <ChakraTag key={tag.id}>
              <TagLabel>{tag.name}</TagLabel>
              <TagCloseButton onClick={() => removeTag(tag.id)} />
            </ChakraTag>
          );
        })}
      </HStack>
      <Popover
        isLazy
        initialFocusRef={inputRef}
        isOpen={inputValue.length >= 1 ? true : undefined}
      >
        <PopoverTrigger>
          <Input
            ref={inputRef}
            value={inputValue}
            placeholder="Search for tags"
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            isDisabled={maximumReached}
          />
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverBody p={0}>
            {!maximumReached &&
              filteredSuggestions.map((sug, index) => (
                <Box
                  key={sug.id}
                  px={4}
                  py={2}
                  bg={
                    activeSuggestionIndex === index ? "gray.100" : "transparent"
                  }
                  cursor="pointer"
                  onMouseEnter={() => setActiveSuggestionIndex(index)}
                  onClick={() => {
                    addTag(sug);
                    setInputValue("");
                  }}
                >
                  {sug.name}
                </Box>
              ))}
            {filteredSuggestions.length === 0 && (
              <Box borderRadius={"sm"} textAlign={"center"} px={4} py={2}>
                No tags found
              </Box>
            )}
            {maximumReached && (
              <Box borderRadius={"sm"} textAlign={"center"} px={4} py={2}>
                Maxmium number of tags reached
              </Box>
            )}
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </VStack>
  );
};
