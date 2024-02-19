import { Divider, type As } from "@chakra-ui/react";
import {
  FiBarChart2,
  FiBox,
  FiFolder,
  FiPlus,
  FiSettings,
  FiShield,
  FiTag,
} from "react-icons/fi";
import { NavButton } from "./NavButton";
import { useUser } from "~/lib/UserProvider";
import { UserRole } from "@prisma/client";

type NavigationItem = {
  icon: As;
  label: string;
  onClick?: VoidFunction;
  href?: string;
  secondaryAction?: {
    icon: As;
    href: string;
  };
  administrative?: boolean;
} | null;

export const navigationItems: NavigationItem[] = [
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
    href: "/settings",
  },
  {
    icon: FiShield,
    label: "Administration",
    href: "/administration",
    administrative: true,
  },
];

export const NavItems = () => {
  const { user } = useUser();

  const canSee = (item: NavigationItem) => {
    if (!item?.administrative) {
      return true;
    }
    return user?.role === UserRole.ADMIN;
  };

  return (
    <>
      {navigationItems.map((item, index) =>
        item ? (
          canSee(item) ? (
            <NavButton
              key={index}
              icon={item.icon}
              label={item.label}
              onClick={item.onClick}
              href={item.href}
              isActive={window.location.pathname.startsWith(item.href ?? "/")}
              secondaryAction={item.secondaryAction}
            />
          ) : null
        ) : (
          <Divider key={index} />
        )
      )}
    </>
  );
};
