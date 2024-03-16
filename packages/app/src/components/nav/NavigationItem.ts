import { type As } from "@chakra-ui/react";
import { UserRole, UserTeamMembershipRole } from "@prisma/client";

export type SimpleNavigationItem = {
  icon: As;
  label: string;
  onClick?: VoidFunction;
  href?: string;
  requiresTeamAdmin?: boolean;
  requiresInstanceAdmin?: boolean;
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
  instanceRole: UserRole | undefined,
  membershipRole: UserTeamMembershipRole | undefined,
  item: SimpleNavigationItem
) => {
  if (!item?.requiresInstanceAdmin && !item?.requiresTeamAdmin) {
    return true;
  }
  if (
    item?.requiresTeamAdmin &&
    membershipRole !== UserTeamMembershipRole.ADMIN &&
    membershipRole !== UserTeamMembershipRole.OWNER
  ) {
    return false;
  }
  if (item?.requiresInstanceAdmin && instanceRole !== UserRole.ADMIN) {
    return false;
  }
  return true;
};
