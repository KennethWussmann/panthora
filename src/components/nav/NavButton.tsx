import {
  type As,
  Button,
  type ButtonProps,
  HStack,
  Icon,
  Text,
  IconButton,
  ButtonGroup,
  Flex,
  Box,
} from "@chakra-ui/react";
import Link from "next/link";

interface NavButtonProps extends ButtonProps {
  icon: As;
  label: string;
  href?: string;
  secondaryAction?: {
    icon: As;
    href: string;
  };
}

export const NavButton = (props: NavButtonProps) => {
  const { icon, label, href, onClick, secondaryAction, ...buttonProps } = props;

  const primaryButton = (
    <Button
      variant="ghost"
      {...buttonProps}
      justifyContent={"start"}
      w={"full"}
      onClick={onClick ? onClick : undefined}
    >
      <HStack spacing="3">
        <Icon as={icon} boxSize="6" color="on-accent-subtle" />
        <Text color="on-accent-subtle">{label}</Text>
      </HStack>
    </Button>
  );

  const primaryButtonWithLink = href ? (
    <Box w={"full"}>
      <Link href={props.href!}>{primaryButton}</Link>
    </Box>
  ) : (
    primaryButton
  );

  const secondaryButton = secondaryAction && (
    <Link href={secondaryAction.href}>
      <IconButton
        aria-label={label}
        variant={"ghost"}
        icon={<Icon as={secondaryAction.icon} boxSize="4" />}
      />
    </Link>
  );

  if (secondaryButton) {
    return (
      <ButtonGroup isAttached>
        {primaryButtonWithLink}
        {secondaryButton}
      </ButtonGroup>
    );
  }

  return primaryButtonWithLink;
};
