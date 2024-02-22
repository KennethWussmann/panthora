import { Divider } from "@chakra-ui/react";
import {
  FiBarChart2,
  FiBox,
  FiFolder,
  FiPlus,
  FiSettings,
  FiShield,
  FiTag,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { NavButton } from "./NavButton";
import { useUser } from "~/lib/UserProvider";
import { canSeeNavigationItem, type NavigationItem } from "./NavigationItem";
import {
  NavCollapsableButton,
  type NavCollapsableButtonProps,
} from "./NavCollapsableButton";
import { useTeamMembershipRole } from "~/lib/useTeamMembershipRole";

export const navigationItems: (NavigationItem | NavCollapsableButtonProps)[] = [
  {
    icon: FiBarChart2,
    label: "Dashboard",
    href: "/dashboard",
  },
  null,
  {
    icon: FiBox,
    label: "Assets",
    href: "/assets",
    secondaryAction: {
      icon: FiPlus,
      href: "/assets/create",
    },
  },
  {
    icon: FiFolder,
    label: "Asset Types",
    href: "/asset-types",
  },
  {
    icon: FiTag,
    label: "Tags",
    href: "/tags",
  },
  null,
  {
    icon: FiSettings,
    label: "Settings",
    items: [
      {
        icon: FiUser,
        label: "User",
        href: "/settings/user",
      },
      {
        icon: FiUsers,
        label: "Team",
        href: "/settings/team",
        requiresTeamAdmin: true,
      },
      {
        icon: FiShield,
        label: "Administration",
        href: "/settings/administration",
        requiresInstanceAdmin: true,
      },
    ],
  },
];

export const NavItems = () => {
  const { user } = useUser();
  const { role } = useTeamMembershipRole();

  return (
    <>
      {navigationItems.map((item, index) => {
        if (!item) {
          return <Divider key={index} />;
        }
        if (!canSeeNavigationItem(user?.role, role, item)) {
          return null;
        }
        if ("items" in item) {
          return <NavCollapsableButton key={index} {...item} />;
        }
        return (
          <NavButton
            key={index}
            icon={item.icon}
            label={item.label}
            onClick={item.onClick}
            href={item.href}
            secondaryAction={item.secondaryAction}
          />
        );
      })}
    </>
  );
};
