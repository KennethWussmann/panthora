import { z } from "zod";

export const teamRemoveMemberRequest = z.object({
  teamId: z.string(),
  email: z.string(),
});

export type TeamRemoveMemberRequest = z.infer<typeof teamRemoveMemberRequest>;
