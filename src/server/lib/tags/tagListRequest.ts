import { z } from "zod";
import { listRequest } from "../commonSchema/listRequest";

export const tagListRequest = listRequest;

export type TagListRequest = z.infer<typeof tagListRequest>;
