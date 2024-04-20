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
import { useUser } from "@/lib/UserProvider";
import { canSeeNavigationItem, type NavigationItem } from "./NavigationItem";
import {
  NavCollapsableButton,
  type NavCollapsableButtonProps,
} from "./NavCollapsableButton";
import { useTeamMembershipRole } from "@/lib/useTeamMembershipRole";

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

export const pageDescriptions: Record<string, string> = {
  Dashboard: "The dashboard shows a summary of your assets and asset types.",
  Assets:
    "Assets are the things you want to keep track of. They can be anything and can have any number of custom fields. You can assign tags to them and search by them. To get started with creating assets you first need to create an asset type. They are the basis for your assets and define which fields assets have.",
  "Asset Types":
    "With Asset Types you can create a template for your assets and define custom fields for them. You can then create assets based on these templates.",
  Tags: "Tags allow you to organise your assets. You can assign tags to assets, create custom fields for tags and search by them. They are the basis for a good inventory and allow you to structure your storage in a way that makes sense to you.",
};

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
