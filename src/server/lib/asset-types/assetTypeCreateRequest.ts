import { FieldType } from "@prisma/client";
import { z } from "zod";
import { fieldTypeUnion } from "./fieldTypeUnion";

const customFieldCreateRequest = z.object({
  name: z.string(),
  type: fieldTypeUnion,
  required: z.boolean(),
});

export const assetTypeCreateRequest = z.object({
  teamId: z.string(),
  name: z.string(),
  parentId: z.number().optional(),
  fields: z.array(customFieldCreateRequest),
});

export type AssetTypeCreateRequest = z.infer<typeof assetTypeCreateRequest>;
