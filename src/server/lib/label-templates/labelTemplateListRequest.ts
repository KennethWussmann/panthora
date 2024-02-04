import { type z } from "zod";
import { listRequest } from "../commonSchema/listRequest";

export const labelTemplateListRequest = listRequest;

export type LabelTemplateListRequest = z.infer<typeof labelTemplateListRequest>;
