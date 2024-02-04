import { signOut } from "next-auth/react";

type ActionShortcut = {
  name: string;
  searchTerms: string[];
  href?: string;
  onClick?: VoidFunction | (() => Promise<void>);
};

const actions: ActionShortcut[] = [
  {
    name: "Create Asset",
    searchTerms: ["create", "asset", "assets"],
    href: "/assets/create",
  },
  {
    name: "Create Asset Type",
    searchTerms: ["create", "asset", "type", "types"],
    href: "/asset-types/create",
  },
  {
    name: "Create Tag",
    searchTerms: ["create", "tag", "tags"],
    href: "/tags/create",
  },
  {
    name: "Create label template",
    searchTerms: ["create", "label", "template"],
    href: "/settings/label-templates/create",
  },
  {
    name: "Show assets",
    searchTerms: ["show", "asset", "assets"],
    href: "/assets",
  },
  {
    name: "Show asset types",
    searchTerms: ["show", "asset", "types"],
    href: "/asset-types",
  },
  {
    name: "Dashboard",
    searchTerms: ["dashboard", "home", "overview"],
    href: "/dashboard",
  },
  {
    name: "Show tags",
    searchTerms: ["show", "tags"],
    href: "/tags",
  },
  {
    name: "Show label templates",
    searchTerms: ["show", "label", "templates"],
    href: "/settings",
  },
  {
    name: "Log out",
    searchTerms: ["logout", "log", "out", "sign", "off", "exit"],
    onClick: async () => {
      await signOut({ redirect: false });
      window.location.href = "/auth/signin?logout=true";
    },
  },
  {
    name: "Settings",
    searchTerms: ["settings", "rename", "team", "label", "template", "search"],
    href: "/settings",
  },
];

export type ActionSearchResult = {
  index: "actions";
  result: ActionShortcut;
};

export const useActionShortcutSearch = (
  search: string
): ActionSearchResult[] => {
  const searchTerms = search.toLowerCase().split(" ");

  if (search.length === 0) {
    return [];
  }
  return actions
    .filter((action) =>
      searchTerms.every((searchTerm) =>
        action.searchTerms.some((actionTerm) =>
          actionTerm.toLowerCase().startsWith(searchTerm)
        )
      )
    )
    .map((action) => ({
      index: "actions",
      result: action,
    }));
};
