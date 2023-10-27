import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Spacer,
  VStack,
  useBreakpointValue,
  IconButton,
  Divider,
  useOutsideClick,
  useColorModeValue,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { Logo } from "./Logo";
import { NavItems } from "./NavItems";
import { NavSearchBar } from "./NavSearchBar";
import { NavLogout } from "./NavLogout";

export const NavTopbar = () => {
  const navRef = useRef<HTMLDivElement>(null);
  const isDesktop = useBreakpointValue({ base: false, lg: true });
  const [menuOpen, setMenuOpen] = useState(false);

  useOutsideClick({
    ref: navRef,
    handler: () => setMenuOpen(false),
  });

  return (
    <Box
      ref={navRef}
      as="nav"
      position="fixed"
      zIndex={100}
      py={4}
      top={0}
      w="100%"
      bg={useColorModeValue("gray.100", "gray.900")}
    >
      <Container maxW="container.xl">
        <HStack justifyContent={"space-between"}>
          <Logo />
          <Spacer />
          <NavSearchBar hideShortcut />
          <Spacer />
          <IconButton
            variant="ghost"
            icon={menuOpen ? <FiX /> : <FiMenu />}
            aria-label="Open or close menu"
            onClick={() => setMenuOpen(!menuOpen)}
          />
        </HStack>
        {!isDesktop && menuOpen && (
          <VStack spacing="5" align={"stretch"}>
            <Spacer />
            <Divider />
            <NavItems />
            <Divider />
            <NavLogout />
          </VStack>
        )}
      </Container>
    </Box>
  );
};
