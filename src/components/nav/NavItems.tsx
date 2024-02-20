import { Divider } from "@chakra-ui/react";
import {
  FiBarChart2,
  FiBox,
  FiFolder,
  FiPlus,
  FiSettings,
  FiShield,
  FiTag,
  FiUsers,
} from "react-icons/fi";
import { NavButton } from "./NavButton";
import { useUser } from "~/lib/UserProvider";
import { canSeeNavigationItem, type NavigationItem } from "./NavigationItem";
import {
  NavCollapsableButton,
  type NavCollapsableButtonProps,
} from "./NavCollapsableButton";

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
        icon: FiUsers,
        label: "Team",
        href: "/settings/team",
      },
      {
        icon: FiShield,
        label: "Administration",
        href: "/settings/administration",
        administrative: true,
      },
    ],
  },
];

export const NavItems = () => {
  const { user } = useUser();

  return (
    <>
      {navigationItems.map((item, index) => {
        if (!item) {
          return <Divider key={index} />;
        }
        if (!canSeeNavigationItem(user?.role, item)) {
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
