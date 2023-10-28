import { z } from "zod";

export const tagCreateRequest = z.object({
  teamId: z.string(),
  name: z.string(),
  parentId: z.number().optional(),
});

export type TagCreateRequest = z.infer<typeof tagCreateRequest>;
