import {
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";

export const NavSearchBar = ({ hideShortcut }: { hideShortcut?: true }) => {
  return (
    <InputGroup>
      <InputLeftElement pointerEvents="none" color="gray.300" fontSize="1.2em">
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
  );
};
