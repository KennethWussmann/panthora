import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { teamUpdateRequest } from "~/server/lib/user/teamUpdateRequest";

export const userRouter = createTRPCRouter({
  defaultTeam: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.applicationContext.userService.getDefaultTeam(
        ctx.session.user.id
      );
    } catch {
      return undefined;
    }
  }),
  updateTeam: protectedProcedure
    .input(teamUpdateRequest)
    .mutation(async ({ ctx, input }) => {
      await ctx.applicationContext.userService.updateTeam(
        ctx.session.user.id,
        input
      );
    }),
});
