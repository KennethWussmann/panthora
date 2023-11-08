import { type As, Button, type ButtonProps, HStack, Icon, Text } from '@chakra-ui/react';
import Link from 'next/link';

interface NavButtonProps extends ButtonProps {
  icon: As;
  label: string;
  href?: string;
}

export const NavButton = (props: NavButtonProps) => {
  const { icon, label, href, onClick, ...buttonProps } = props;

  const button = (
    <Button
      variant="ghost"
      {...buttonProps}
      justifyContent={'start'}
      width={'100%'}
      onClick={onClick ? onClick : undefined}
    >
      <HStack spacing="3">
        <Icon as={icon} boxSize="6" color="on-accent-subtle" />
        <Text color="on-accent-subtle">{label}</Text>
      </HStack>
    </Button>
  );

  if (href) {
    return <Link href={props.href!}>{button}</Link>;
  }
  return button;
};
