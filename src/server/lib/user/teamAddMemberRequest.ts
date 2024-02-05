import { UserTeamMembershipRole } from "@prisma/client";
import { z } from "zod";

export const teamAddMemberRequest = z.object({
  teamId: z.string(),
  memberId: z.string(),
  role: z
    .nativeEnum(UserTeamMembershipRole)
    .default(UserTeamMembershipRole.MEMBER),
});

export type TeamAddMemberRequest = z.infer<typeof teamAddMemberRequest>;
