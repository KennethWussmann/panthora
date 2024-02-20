import { UserRole } from "@prisma/client";
import { signOut } from "next-auth/react";
import { useUser } from "~/lib/UserProvider";

export type ActionShortcut = {
  index: "actions";
  name: string;
  searchTerms: string[];
  href?: string;
  onClick?: VoidFunction | (() => Promise<void>);
  administrative?: boolean;
};

const actions: ActionShortcut[] = [
  {
    index: "actions",
    name: "Create asset",
    searchTerms: ["create", "asset", "assets"],
    href: "/assets/create",
  },
  {
    index: "actions",
    name: "Create Asset Type",
    searchTerms: ["create", "asset", "type", "types"],
    href: "/asset-types/create",
  },
  {
    index: "actions",
    name: "Create Tag",
    searchTerms: ["create", "tag", "tags"],
    href: "/tags/create",
  },
  {
    index: "actions",
    name: "Create Label Template",
    searchTerms: ["create", "label", "template"],
    href: "/settings/team/label-templates/create",
  },
  {
    index: "actions",
    name: "Show assets",
    searchTerms: ["show", "asset", "assets"],
    href: "/assets",
  },
  {
    index: "actions",
    name: "Show Asset Types",
    searchTerms: ["show", "asset", "types"],
    href: "/asset-types",
  },
  {
    index: "actions",
    name: "Dashboard",
    searchTerms: ["dashboard", "home", "overview"],
    href: "/dashboard",
  },
  {
    index: "actions",
    name: "Show Tags",
    searchTerms: ["show", "tags"],
    href: "/tags",
  },
  {
    index: "actions",
    name: "Show Label Templates",
    searchTerms: ["show", "label", "templates"],
    href: "/settings/team",
  },
  {
    index: "actions",
    name: "Log out",
    searchTerms: ["logout", "log", "out", "sign", "off", "exit"],
    onClick: async () => {
      await signOut({ redirect: false });
      window.location.href = "/auth/signin?logout=true";
    },
  },
  {
    index: "actions",
    name: "Team Settings",
    searchTerms: ["settings", "rename", "team", "label", "template", "search"],
    href: "/settings/team",
  },
  {
    index: "actions",
    name: "Administration Settings",
    searchTerms: ["settings", "admin", "administrative", "user", "users"],
    href: "/settings/administration",
    administrative: true,
  },
];

export const useActionShortcutSearch = (search: string): ActionShortcut[] => {
  const { user } = useUser();
  const searchTerms = search.toLowerCase().split(" ");

  if (search.length === 0) {
    return [];
  }
  return actions
    .filter((action) => !action.administrative || user?.role === UserRole.ADMIN)
    .filter((action) =>
      searchTerms.every((searchTerm) =>
        action.searchTerms.some((actionTerm) =>
          actionTerm.toLowerCase().startsWith(searchTerm)
        )
      )
    );
};
