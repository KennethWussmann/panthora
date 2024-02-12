import { env } from "~/env.mjs";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { userRegisterRequest } from "~/server/lib/user/userRegisterRequest";

export const userRouter = createTRPCRouter({
  register: publicProcedure
    .input(userRegisterRequest)
    .mutation(async ({ ctx, input }) => {
      if (!env.PASSWORD_AUTH_ENABLED) {
        throw new Error("Password auth is disabled");
      }
      if (ctx.session?.user) {
        throw new Error("User already logged in");
      }
      await ctx.applicationContext.userService.register(input);
    }),
});
