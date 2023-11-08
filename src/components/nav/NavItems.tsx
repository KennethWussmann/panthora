import { type As } from "@chakra-ui/react";
import {
  FiBarChart2,
  FiBox,
  FiFolder,
  FiSettings,
  FiTag,
} from "react-icons/fi";
import { NavButton } from "./NavButton";

type NavigationItem = {
  icon: As;
  label: string;
  onClick?: VoidFunction;
  href?: string;
};

export const navigationItems: NavigationItem[] = [
  {
    icon: FiBarChart2,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: FiBox,
    label: "Assets",
    href: "/assets",
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
  {
    icon: FiSettings,
    label: "Settings",
    href: "/settings",
  },
];

export const NavItems = () => {
  return (
    <>
      {navigationItems.map((item, index) => (
        <NavButton
          key={index}
          icon={item.icon}
          label={item.label}
          onClick={item.onClick}
          href={item.href}
          isActive={window.location.pathname.startsWith(item.href ?? "/")}
        />
      ))}
    </>
  );
};
