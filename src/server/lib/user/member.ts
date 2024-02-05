import { UserTeamMembershipRole } from "@prisma/client";

export type Member = {
  id: string;
  email: string;
  role: UserTeamMembershipRole;
};
