import { signOut } from "next-auth/react";

export type ActionShortcut = {
  index: "actions";
  name: string;
  searchTerms: string[];
  href?: string;
  onClick?: VoidFunction | (() => Promise<void>);
};

const actions: ActionShortcut[] = [
  {
    index: "actions",
    name: "Create Asset",
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
    href: "/settings/label-templates/create",
  },
  {
    index: "actions",
    name: "Show assets",
    searchTerms: ["show", "asset", "assets"],
    href: "/assets",
  },
  {
    index: "actions",
    name: "Show asset types",
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
    name: "Show tags",
    searchTerms: ["show", "tags"],
    href: "/tags",
  },
  {
    index: "actions",
    name: "Show label templates",
    searchTerms: ["show", "label", "templates"],
    href: "/settings",
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
    name: "Settings",
    searchTerms: ["settings", "rename", "team", "label", "template", "search"],
    href: "/settings",
  },
];

export const useActionShortcutSearch = (search: string): ActionShortcut[] => {
  const searchTerms = search.toLowerCase().split(" ");

  if (search.length === 0) {
    return [];
  }
  return actions.filter((action) =>
    searchTerms.every((searchTerm) =>
      action.searchTerms.some((actionTerm) =>
        actionTerm.toLowerCase().startsWith(searchTerm)
      )
    )
  );
};
