import { LabelComponents } from "@prisma/client";
import { z } from "zod";

export const labelTemplateCreateEditRequest = z.object({
  id: z.string().nullable().default(null),
  teamId: z.string(),
  name: z.string(),
  default: z.boolean(),
  width: z.number().optional(),
  height: z.number().optional(),
  padding: z.number().optional(),
  fontSize: z.number().optional(),
  qrCodeScale: z.number().optional(),
  components: z.array(z.nativeEnum(LabelComponents)).min(1),
});

export type LabelTemplateCreateEditRequest = z.infer<
  typeof labelTemplateCreateEditRequest
>;
