import { z } from "zod";

const importRequest = z.object({
  teamId: z.string(),
  data: z.string(),
});

export type ImportRequest = z.infer<typeof importRequest>;
