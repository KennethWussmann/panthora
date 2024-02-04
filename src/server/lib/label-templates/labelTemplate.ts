import {
  type LabelTemplate as LabelTemplateRelation,
  type Team as TeamRelation,
} from "@prisma/client";

export type LabelTemplate = LabelTemplateRelation & {
  team: TeamRelation | null;
};
