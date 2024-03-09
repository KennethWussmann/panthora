import { type User as UserRelation } from "@prisma/client";

export type User = Pick<
  UserRelation,
  "id" | "email" | "role" | "createdAt" | "updatedAt"
>;

export type UserMe = User & {
  hasPassword: boolean;
  accounts: {
    provider: string;
    type: string;
  }[];
};
