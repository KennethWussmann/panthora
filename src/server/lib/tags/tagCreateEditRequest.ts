import { z } from "zod";

export const tagCreateEditRequest = z.object({
  id: z.string().nullable().default(null),
  teamId: z.string(),
  name: z.string(),
  parentId: z.string().nullable().default(null),
});

export type TagCreateEditRequest = z.infer<typeof tagCreateEditRequest>;
