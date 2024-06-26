/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

import { initTRPC, TRPCError } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";
import { defaultApplicationContext } from "@/server/lib/applicationContext";

import { getServerAuthSession } from "@/server/auth/auth";
import { type RateLimitType } from "../lib/rate-limit/rateLimitService";
import { UserRole } from "@prisma/client";

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  // Get the session from the server using the getServerSession wrapper function
  const session = await getServerAuthSession({ req, res });

  const xForwardedFor = req.headers["x-forwarded-for"];
  let remoteAddress = req.socket.remoteAddress;
  if (xForwardedFor) {
    remoteAddress = Array.isArray(xForwardedFor)
      ? xForwardedFor[0]
      : xForwardedFor.split(",")[0];
  }

  if (!remoteAddress || remoteAddress.length === 0) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Could not determine remote address",
    });
  }

  return {
    session,
    remoteAddress,
    applicationContext: defaultApplicationContext,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

export const rateLimit = (type: RateLimitType) =>
  t.middleware(async ({ ctx, next }) => {
    try {
      await ctx.applicationContext.rateLimitService.consume(
        type,
        ctx.remoteAddress,
        ctx.session?.user?.id
      );
    } catch (e) {
      if (e instanceof Error) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: e.message });
      } else {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
      }
    }

    return next();
  });

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(rateLimit("request"));

/** Reusable middleware that enforces users are logged in before running the procedure. */
const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

const enforceUserIsInstanceAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const { role } = await ctx.applicationContext.userService.getMe(
    ctx.session.user.id
  );

  if (role !== UserRole.ADMIN) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(enforceUserIsAuthed)
  .use(rateLimit("request"));

export const instanceAdminProcedure = t.procedure
  .use(enforceUserIsInstanceAdmin)
  .use(rateLimit("request"));
