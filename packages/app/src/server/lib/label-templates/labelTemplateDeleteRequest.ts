import { z } from "zod";

export const labelTemplateDeleteRequest = z.object({
  teamId: z.string(),
  id: z.string(),
});

export type LabelTemplateDeleteRequest = z.infer<
  typeof labelTemplateDeleteRequest
>;
