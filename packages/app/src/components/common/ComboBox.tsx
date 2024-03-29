import {
  useState,
  type ReactNode,
  type FC,
  cloneElement,
  Children,
  type RefObject,
} from "react";
import { useMultipleSelection, useCombobox } from "downshift";
import {
  Box,
  Input,
  List,
  ListItem,
  ListIcon,
  Tag,
  useColorModeValue,
  Flex,
  TagLabel,
  TagCloseButton,
  InputGroup,
  InputLeftElement,
  Icon,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  FormControl,
  FormErrorMessage,
} from "@chakra-ui/react";
import { FiCheck, FiSearch } from "react-icons/fi";

type ComboBoxProps<T> = {
  values?: T[];
  onChange?: (value: T[]) => void;
  children: ReactNode;
  placeholder?: string;
  min?: number;
  max?: number;
};

type ComboBoxItemProps<T> = {
  value: T;
  children: ReactNode;
  _selected?: boolean;
};

export const ComboBoxItem: FC<ComboBoxItemProps<unknown>> = ({ children }) => (
  <>{children}</>
);

export const ComboBox = <T extends number>({
  children,
  values = [],
  onChange,
  placeholder = "Select",
  min,
  max,
}: ComboBoxProps<T>) => {
  const {
    getDropdownProps,
    addSelectedItem,
    removeSelectedItem,
    selectedItems,
  } = useMultipleSelection<T>({
    initialSelectedItems: values,
    onSelectedItemsChange: ({ selectedItems }) => {
      if (selectedItems) {
        onChange?.(selectedItems);
      }
    },
  });
  const maximumReached = max && selectedItems.length >= max;
  const minimumReached = min && selectedItems.length >= min;

  const items = Children.toArray(children).map((child) =>
    cloneElement(child as React.ReactElement<ComboBoxItemProps<T>>, {
      _selected: values.includes(
        (child as React.ReactElement<ComboBoxItemProps<T>>).props.value
      ),
    })
  );

  const [inputValue, setInputValue] = useState("");
  const filteredItems = items.filter((item) =>
    item.props.children
      ?.toString()
      ?.toLowerCase()
      ?.includes(inputValue.toLowerCase())
  );
  const {
    isOpen,
    openMenu,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    items: filteredItems,
    inputValue,
    onInputValueChange: ({ inputValue }) => {
      console.log("Set Input Value", inputValue);
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
    },
    itemToString: (item) => (item ? item.props.children?.toString() ?? "" : ""),
  });
  const inputProps = getInputProps(
    getDropdownProps({ preventKeyAction: isOpen })
  );
  const focusInput = () => {
    openMenu();
    (inputProps.ref as RefObject<HTMLInputElement>).current?.focus();
  };
  const itemHoverBackgroundColor = useColorModeValue("gray.100", "gray.600");
  const menuBackgroundColor = useColorModeValue("white", "gray.700");

  return (
    <FormControl isInvalid={!minimumReached}>
      <Box position="relative" onClick={focusInput}>
        <Box
          borderWidth={1}
          rounded={"md"}
          p={2}
          overflow="hidden"
          borderColor={!minimumReached ? "red.500" : undefined}
        >
          <Flex gap={2} alignItems={"flex-start"} flexWrap="wrap">
            {selectedItems.map((value) => (
              <Tag key={value} p={1} px={2} maxW={"none"} whiteSpace={"nowrap"}>
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
            <Text ml={1} color={"gray.500"}>
              {placeholder}
            </Text>
          )}
        </Box>
        <Box
          p={2}
          borderWidth={1}
          rounded={"md"}
          mt={1}
          bg={menuBackgroundColor}
          hidden={!isOpen}
        >
          {maximumReached && (
            <Alert status="warning" mb={2}>
              <AlertIcon />
              <AlertTitle>Maximum number of items reached</AlertTitle>
            </Alert>
          )}
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiSearch} color="gray.500" />
            </InputLeftElement>
            <Input {...inputProps} variant={"flushed"} placeholder="Search" />
          </InputGroup>
          <List {...getMenuProps()} mt={2} maxH={64} overflowY={"scroll"}>
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
                {item.props._selected && <ListIcon as={FiCheck} />}
                {item.props.children}
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
      {!minimumReached && (
        <FormErrorMessage>Select at least {min} items</FormErrorMessage>
      )}
    </FormControl>
  );
};
