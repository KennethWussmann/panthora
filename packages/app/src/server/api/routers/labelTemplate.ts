import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { labelTemplateCreateEditRequest } from "@/server/lib/label-templates/labelTemplateCreateEditRequest";
import { labelTemplateDeleteRequest } from "@/server/lib/label-templates/labelTemplateDeleteRequest";
import { labelTemplateListRequest } from "@/server/lib/label-templates/labelTemplateListRequest";

export const labelTemplateRouter = createTRPCRouter({
  create: protectedProcedure
    .input(labelTemplateCreateEditRequest)
    .mutation(({ ctx, input }) => {
      return ctx.applicationContext.labelTemplateService.createLabelTemplate(
        ctx.session.user.id,
        input
      );
    }),
  update: protectedProcedure
    .input(labelTemplateCreateEditRequest)
    .mutation(({ ctx, input }) => {
      return ctx.applicationContext.labelTemplateService.updateLabelTemplate(
        ctx.session.user.id,
        input
      );
    }),
  delete: protectedProcedure
    .input(labelTemplateDeleteRequest)
    .mutation(({ ctx, input }) => {
      return ctx.applicationContext.labelTemplateService.deleteLabelTemplate(
        ctx.session.user.id,
        input
      );
    }),
  get: protectedProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.applicationContext.labelTemplateService.getById(
      ctx.session.user.id,
      input
    );
  }),
  default: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .query(({ ctx, input: { teamId } }) => {
      return ctx.applicationContext.labelTemplateService.getDefaultLabelTemplate(
        ctx.session.user.id,
        teamId
      );
    }),
  list: protectedProcedure
    .input(labelTemplateListRequest)
    .query(({ ctx, input }) => {
      return ctx.applicationContext.labelTemplateService.getLabelTemplates(
        ctx.session.user.id,
        input
      );
    }),
});
