import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const statsRouter = createTRPCRouter({
  get: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ ctx, input: { teamId } }) => {
      return ctx.applicationContext.statsService.getStats(
        ctx.session.user.id,
        teamId
      );
    }),
});
