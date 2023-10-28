import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

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
});
