import { type TeamInvite as TeamInviteRelation } from "@prisma/client";

export type TeamInvite = Pick<
  TeamInviteRelation,
  "id" | "createdAt" | "updatedAt" | "expires" | "role"
> & {
  teamName: string;
  invitedByEmail: string;
  invitedEmail: string;
};
