import { UserTeamMembershipRole } from "@prisma/client";

export const roleLabels: Record<UserTeamMembershipRole, string> = {
  [UserTeamMembershipRole.OWNER]: "Owner",
  [UserTeamMembershipRole.ADMIN]: "Admin",
  [UserTeamMembershipRole.MEMBER]: "Member",
};
