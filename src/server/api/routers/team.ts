import { type Team } from "@prisma/client";
import { z } from "zod";
import {
  createTRPCRouter,
  instanceAdminProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { teamAddMemberRequest } from "~/server/lib/team/teamAddMemberRequest";
import { teamCreateEditRequest } from "~/server/lib/team/teamCreateEditRequest";
import { teamListRequest } from "~/server/lib/team/teamListRequest";
import { teamRemoveMemberRequest } from "~/server/lib/team/teamRemoveMemberRequest";

export const teamRouter = createTRPCRouter({
  listAll: instanceAdminProcedure
    .input(teamListRequest)
    .query(async ({ input, ctx }) => {
      return await ctx.applicationContext.teamService.getAllTeams(input);
    }),
  list: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.applicationContext.teamService.getTeams(
        ctx.session.user.id
      );
    } catch {
      return undefined;
    }
  }),
  get: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return await ctx.applicationContext.teamService.getUserTeam(
      ctx.session.user.id,
      input
    );
  }),
  membership: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return await ctx.applicationContext.teamService.getUserMembership(
        ctx.session.user.id,
        input
      );
    }),
  updateTeam: protectedProcedure
    .input(teamCreateEditRequest)
    .mutation(async ({ ctx, input }) => {
      await ctx.applicationContext.teamService.updateTeam(
        ctx.session.user.id,
        input
      );
    }),
  addMember: protectedProcedure
    .input(teamAddMemberRequest)
    .mutation(async ({ ctx, input }) => {
      return await ctx.applicationContext.teamService.addTeamMember(
        ctx.session.user.id,
        input
      );
    }),
  removeMember: protectedProcedure
    .input(teamRemoveMemberRequest)
    .mutation(async ({ ctx, input }) => {
      await ctx.applicationContext.teamService.removeTeamMember(
        ctx.session.user.id,
        input
      );
    }),
  updateMemberRole: protectedProcedure
    .input(teamAddMemberRequest)
    .mutation(async ({ ctx, input }) => {
      return await ctx.applicationContext.teamService.addTeamMember(
        ctx.session.user.id,
        input
      );
    }),
  members: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      return await ctx.applicationContext.teamService.getMembers(
        ctx.session.user.id,
        input
      );
    }),
  create: protectedProcedure
    .input(teamCreateEditRequest)
    .mutation(async ({ ctx, input }): Promise<Team> => {
      return await ctx.applicationContext.teamCreationService.createTeam(
        ctx.session.user.id,
        input
      );
    }),
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      await ctx.applicationContext.teamDeletionService.deleteTeam(
        ctx.session.user.id,
        input
      );
    }),
});
