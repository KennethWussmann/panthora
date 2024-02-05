import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { teamCreateEditRequest } from "~/server/lib/user/teamCreateEditRequest";

export const userRouter = createTRPCRouter({
  defaultTeam: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.applicationContext.teamService.getDefaultTeam(
        ctx.session.user.id
      );
    } catch {
      return undefined;
    }
  }),
  updateTeam: protectedProcedure
    .input(teamCreateEditRequest)
    .mutation(async ({ ctx, input }) => {
      await ctx.applicationContext.teamService.updateTeam(
        ctx.session.user.id,
        input
      );
    }),
});
