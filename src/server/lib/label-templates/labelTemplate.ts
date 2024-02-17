import {
  type LabelTemplate as LabelTemplateRelation,
  type Team as TeamRelation,
} from "@prisma/client";

export type LabelTemplate = Omit<LabelTemplateRelation, "qrCodeScale"> & {
  team: TeamRelation | null;
  qrCodeScale: number;
};
