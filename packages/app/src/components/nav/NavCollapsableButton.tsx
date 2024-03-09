import {
  Box,
  type As,
  Button,
  useDisclosure,
  HStack,
  Icon,
  Text,
  Collapse,
  Stack,
} from "@chakra-ui/react";
import {
  canSeeNavigationItem,
  type SimpleNavigationItem,
} from "./NavigationItem";
import { FiChevronDown } from "react-icons/fi";
import { NavButton } from "./NavButton";
import { useUser } from "@/lib/UserProvider";
import { useTeamMembershipRole } from "@/lib/useTeamMembershipRole";

export type NavCollapsableButtonProps = {
  icon: As;
  label: string;
  items: SimpleNavigationItem[];
};

const PopoverIcon = (props: { isOpen: boolean }) => {
  const iconStyles = {
    transform: props.isOpen ? "rotate(-180deg)" : undefined,
    transition: "transform 0.2s",
    transformOrigin: "center",
  };
  return <Icon aria-hidden as={FiChevronDown} __css={iconStyles} />;
};

export const NavCollapsableButton = ({
  icon,
  label,
  items,
}: NavCollapsableButtonProps) => {
  const { user } = useUser();
  const { role } = useTeamMembershipRole();
  const { isOpen, onToggle } = useDisclosure();
  return (
    <Box>
      <Button
        variant="ghost"
        onClick={onToggle}
        justifyContent="space-between"
        width="full"
      >
        <HStack spacing="3">
          <Icon as={icon} boxSize="6" color="on-accent-subtle" />
          <Text color="on-accent-subtle">{label}</Text>
        </HStack>
        <PopoverIcon isOpen={isOpen} />
      </Button>
      <Collapse in={isOpen} animateOpacity>
        <Stack spacing="1" alignItems="stretch" ps="8" py="1">
          {items
            .filter((item) => canSeeNavigationItem(user?.role, role, item))
            .map((item) => (
              <NavButton key={item.label} {...item} />
            ))}
        </Stack>
      </Collapse>
    </Box>
  );
};
