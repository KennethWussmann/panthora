import { Tag as TagRelation } from "@prisma/client";

export type Tag = TagRelation & { children: Tag[] };
