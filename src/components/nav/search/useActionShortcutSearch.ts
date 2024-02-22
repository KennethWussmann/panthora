import { UserRole, UserTeamMembershipRole } from "@prisma/client";
import { signOut } from "next-auth/react";
import { useUser } from "~/lib/UserProvider";
import { useTeamMembershipRole } from "~/lib/useTeamMembershipRole";

export type ActionShortcut = {
  index: "actions";
  name: string;
  searchTerms: string[];
  href?: string;
  onClick?: VoidFunction | (() => Promise<void>);
  requiresInstanceAdmin?: boolean;
  requiresTeamAdmin?: boolean;
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
    requiresTeamAdmin: true,
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
    requiresTeamAdmin: true,
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
    requiresTeamAdmin: true,
  },
  {
    index: "actions",
    name: "Administration Settings",
    searchTerms: ["settings", "admin", "administrative", "user", "users"],
    href: "/settings/administration",
    requiresInstanceAdmin: true,
  },
];

const hasAccessToAction = (
  instanceRole: UserRole | undefined,
  membershipRole: UserTeamMembershipRole | undefined,
  action: ActionShortcut
) => {
  if (!action.requiresInstanceAdmin && !action.requiresTeamAdmin) {
    return true;
  }
  if (
    action.requiresTeamAdmin &&
    membershipRole !== UserTeamMembershipRole.ADMIN &&
    membershipRole !== UserTeamMembershipRole.OWNER
  ) {
    return false;
  }
  if (action.requiresInstanceAdmin && instanceRole !== UserRole.ADMIN) {
    return false;
  }
  return true;
};

export const useActionShortcutSearch = (search: string): ActionShortcut[] => {
  const { user } = useUser();
  const { role } = useTeamMembershipRole();
  const searchTerms = search.toLowerCase().split(" ");

  if (search.length === 0) {
    return [];
  }
  return actions
    .filter((action) => hasAccessToAction(user?.role, role, action))
    .filter((action) =>
      searchTerms.every((searchTerm) =>
        action.searchTerms.some((actionTerm) =>
          actionTerm.toLowerCase().startsWith(searchTerm)
        )
      )
    );
};
