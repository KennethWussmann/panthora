import { z } from "zod";
import { listRequest } from "../commonSchema/listRequest";

export const tagListRequest = listRequest.extend({
  parentId: z.string().optional(),
});

export type TagListRequest = z.infer<typeof tagListRequest>;
