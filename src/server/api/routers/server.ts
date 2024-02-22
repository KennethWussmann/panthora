import { UserRole } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

const isDatabaseHealthy = async () => {
  try {
    await db.$queryRaw`SELECT 1`;
    return true;
  } catch (e) {
    return false;
  }
};

export const serverRouter = createTRPCRouter({
  health: protectedProcedure.query(async ({ ctx }) => {
    const [me, meiliSearch, database] = await Promise.all([
      ctx.applicationContext.userService.getMe(ctx.session.user.id),
      ctx.applicationContext.searchService.isMeiliSearchHealthy(),
      isDatabaseHealthy(),
    ]);
    return {
      ok: meiliSearch && database,
      ...(me.role === UserRole.ADMIN
        ? { details: { meiliSearch, database } }
        : {}),
    };
  }),
});