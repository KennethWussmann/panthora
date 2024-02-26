import { z } from "zod";

export const importRequest = z.object({
  teamId: z.string(),
  data: z.string(),
});

export type ImportRequest = z.infer<typeof importRequest>;
