import { type As } from "@chakra-ui/react";
import { UserRole } from "@prisma/client";

export type SimpleNavigationItem = {
  icon: As;
  label: string;
  onClick?: VoidFunction;
  href?: string;
  administrative?: boolean;
};

export type NavigationItem =
  | (SimpleNavigationItem & {
      secondaryAction?: {
        icon: As;
        href: string;
      };
    })
  | null;

export const canSeeNavigationItem = (
  role: UserRole | undefined,
  item: SimpleNavigationItem
) => {
  if (!item?.administrative) {
    return true;
  }
  return role === UserRole.ADMIN;
};
