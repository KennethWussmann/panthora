import { type TeamInvite as TeamInviteRelation } from "@prisma/client";

export type TeamInvite = Pick<
  TeamInviteRelation,
  "id" | "createdAt" | "updatedAt" | "expires"
> & {
  teamName: string;
  invitedByEmail: string;
  invitedEmail: string;
};
