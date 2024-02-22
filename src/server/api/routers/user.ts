import { env } from "~/env.mjs";
import {
  createTRPCRouter,
  instanceAdminProcedure,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { userChangePasswordRequest } from "~/server/lib/user/userChangePasswordRequest";
import { userListRequest } from "~/server/lib/user/userListRequest";
import { userRegisterRequest } from "~/server/lib/user/userRegisterRequest";

export const userRouter = createTRPCRouter({
  listAll: instanceAdminProcedure
    .input(userListRequest)
    .query(async ({ input, ctx }) => {
      return await ctx.applicationContext.userService.getAllUsers(input);
    }),
  me: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.applicationContext.userService.getMe(ctx.session.user.id);
  }),
  changePassword: protectedProcedure
    .input(userChangePasswordRequest)
    .mutation(async ({ ctx, input }) => {
      if (!env.PASSWORD_AUTH_ENABLED) {
        throw new Error("Password auth is disabled");
      }
      await ctx.applicationContext.userService.changePassword(
        ctx.session.user.id,
        input
      );
    }),
  register: publicProcedure
    .input(userRegisterRequest)
    .mutation(async ({ ctx, input }) => {
      if (!env.PASSWORD_AUTH_ENABLED) {
        throw new Error("Password auth is disabled");
      }
      if (ctx.session?.user) {
        throw new Error("User already logged in");
      }
      await ctx.applicationContext.userService.register(
        ctx.remoteAddress,
        input
      );
    }),
});
