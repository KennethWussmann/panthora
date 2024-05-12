import {
  useState,
  type ReactNode,
  type FC,
  cloneElement,
  Children,
  type RefObject,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { useMultipleSelection, useCombobox } from "downshift";
import {
  Box,
  Input,
  List,
  ListItem,
  Tag,
  useColorModeValue,
  Flex,
  TagLabel,
  TagCloseButton,
  InputGroup,
  InputLeftElement,
  Icon,
  Text,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  Checkbox,
  useOutsideClick,
} from "@chakra-ui/react";
import { FiChevronDown, FiSearch } from "react-icons/fi";

type ComboBoxProps<T> = {
  values?: T[];
  onChange?: (value: T[]) => void;
  onSearchInputChange?: (value: string) => void;
  onSearchSuggestionsChange?: (value: T[]) => void;
  children: ReactNode;
  placeholder?: string;
  min?: number;
  max?: number;
  variant?: "inline" | "grouped";
  itemName?: { singular: string; plural: string };
  isSearchable?: boolean;
};

type ComboBoxItemProps<T> = {
  value: T;
  children: ReactNode;
  _selected?: boolean;
};

export const ComboBoxItem: FC<ComboBoxItemProps<unknown>> = ({ children }) => (
  <>{children}</>
);

export const ComboBox = <T extends number | string>({
  children,
  values = [],
  onChange,
  placeholder = "Select",
  min,
  max,
  variant = "inline",
  itemName = { singular: "Item", plural: "Items" },
  isSearchable = true,
  onSearchInputChange,
  onSearchSuggestionsChange,
}: ComboBoxProps<T>) => {
  const {
    getDropdownProps,
    addSelectedItem,
    removeSelectedItem,
    selectedItems,
  } = useMultipleSelection<T>({
    selectedItems: values,
    onSelectedItemsChange: ({ selectedItems }) => {
      if (selectedItems) {
        onChange?.(selectedItems);
      }
      setInputValue("");
    },
  });
  const maximumReached = max && selectedItems.length >= max;
  const minimumReached = min ? selectedItems.length >= min : true;
  const comboBoxRef = useRef<HTMLDivElement>(null);
  const childs = useMemo(
    () =>
      Children.toArray(children).map(
        (child) => child as React.ReactElement<ComboBoxItemProps<T>>
      ),
    [children]
  );
  const comboBoxItems = childs.filter(
    (child) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      (child.type as any)?.name === "ComboBoxItem"
  );
  const appendixItems = childs.filter(
    (child) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      (child.type as any)?.name !== "ComboBoxItem"
  );
  useOutsideClick({
    ref: comboBoxRef,
    handler: () => setOpen(false),
  });

  const items = comboBoxItems.map((child) =>
    cloneElement(child, {
      _selected: values.includes(child.props.value),
    })
  );

  const [inputValue, setInputValue] = useState("");
  const filteredItems = items.filter((item) => {
    return (
      item.props.children
        ?.toString()
        ?.toLowerCase()
        ?.includes(inputValue.toLowerCase()) &&
      (!maximumReached || item.props._selected)
    );
  });
  const [isOpen, setOpen] = useState(false);
  const { getMenuProps, getInputProps, highlightedIndex, getItemProps } =
    useCombobox({
      items: filteredItems,
      isOpen,
      inputValue,
      onInputValueChange: ({ inputValue }) => {
        setInputValue(inputValue || "");
      },
      onSelectedItemChange: ({ selectedItem }) => {
        const value = selectedItem.props.value;
        if (selectedItems.includes(value)) {
          removeSelectedItem(value);
        } else if (!maximumReached) {
          addSelectedItem(value);
        }
        setInputValue("");
        comboBoxRef.current?.focus();
      },
      itemToString: (item) =>
        item ? item.props.children?.toString() ?? "" : "",
    });
  const inputProps = getInputProps(
    getDropdownProps({ preventKeyAction: isOpen })
  );
  const focusInput = () => {
    setOpen(true);
    (inputProps.ref as RefObject<HTMLInputElement>).current?.focus();
  };
  const itemHoverBackgroundColor = useColorModeValue("gray.100", "gray.600");
  const menuBackgroundColor = useColorModeValue("white", "gray.700");

  useEffect(() => {
    setInputValue("");
  }, [isOpen]);

  useEffect(() => {
    onSearchSuggestionsChange?.(filteredItems.map((item) => item.props.value));
  }, [filteredItems, onSearchSuggestionsChange]);

  
  return (
    <FormControl
      isInvalid={!minimumReached}
      onFocus={focusInput}
      onClick={focusInput}
      ref={comboBoxRef}
      w={"auto"}
    >
      <Box position="relative">
        <Box
          borderWidth={1}
          rounded={"md"}
          p={2}
          overflow="hidden"
          borderColor={!minimumReached ? "red.500" : undefined}
          tabIndex={0}
        >
          {variant === "inline" && (
            <>
              <Flex gap={2} alignItems={"flex-start"} flexWrap="wrap">
                {selectedItems.map((value) => (
                  <Tag
                    key={value}
                    p={1}
                    px={2}
                    maxW={"none"}
                    whiteSpace={"nowrap"}
                  >
                    <TagLabel>
                      {
                        items.find((item) => item.props.value === value)?.props
                          .children
                      }
                    </TagLabel>
                    <TagCloseButton onClick={() => removeSelectedItem(value)} />
                  </Tag>
                ))}
              </Flex>
              {selectedItems.length === 0 && (
                <Flex
                  alignItems={"center"}
                  justifyContent={"space-between"}
                  px={1}
                >
                  <Text ml={1} color={"gray.500"}>
                    {placeholder}
                  </Text>

                  <Icon as={FiChevronDown} />
                </Flex>
              )}
            </>
          )}
          {variant === "grouped" && (
            <Flex
              alignItems={"center"}
              justifyContent={"space-between"}
              px={1}
              gap={2}
              height={"22px"}
            >
              <Flex gap={2}>
                <Tag rounded={"full"}>
                  <TagLabel>{selectedItems.length}</TagLabel>
                </Tag>
                <Text>
                  {selectedItems.length === 1
                    ? itemName.singular
                    : itemName.plural}
                </Text>
              </Flex>
              <Icon as={FiChevronDown} />
            </Flex>
          )}
        </Box>
        <Box
          p={2}
          borderWidth={1}
          rounded={"md"}
          mt={1}
          bg={menuBackgroundColor}
          hidden={!isOpen}
          position="absolute"
          width="full"
          zIndex="dropdown"
          boxShadow={"lg"}
          w={"max-content"}
        >
          <InputGroup hidden={!isSearchable} mb={2}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="gray.500" />
            </InputLeftElement>
            <Input
              {...inputProps}
              variant={"flushed"}
              placeholder="Search"
              onChange={(e) => {
                setInputValue(e.target.value);
                onSearchInputChange?.(e.target.value);
              }}
            />
          </InputGroup>
          <List {...getMenuProps()} maxH={64} overflowY={"scroll"}>
            {filteredItems.map((item, index) => (
              <ListItem
                key={`${item.props.value}${index}`}
                {...getItemProps({ item, index })}
                bg={
                  highlightedIndex === index
                    ? itemHoverBackgroundColor
                    : undefined
                }
                rounded={"md"}
                p={2}
                px={4}
              >
                <Checkbox
                  isChecked={selectedItems.includes(item.props.value)}
                  onChange={(e) => e.preventDefault()}
                  onClick={(e) => e.preventDefault()}
                  pointerEvents={"none"}
                >
                  {item.props.children}
                </Checkbox>
              </ListItem>
            ))}
          </List>
          {appendixItems && (
            <Box mt={2} w="full">
              {appendixItems}
            </Box>
          )}
        </Box>
      </Box>
      {!minimumReached && (
        <FormErrorMessage>
          Select at least {String(min)} {min === 1 ? "item" : "items"}
        </FormErrorMessage>
      )}
      {maximumReached && (
        <FormHelperText>
          Maximum number of selected items reached
        </FormHelperText>
      )}
    </FormControl>
  );
};
