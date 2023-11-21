import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { db } from "../db";

export const CustomCredentialsProvider = () =>
  CredentialsProvider({
    id: "password",
    credentials: {
      email: { label: "E-Mail", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials) {
        return null;
      }
      try {
        const user = await db.user.findFirst({
          where: {
            email: {
              equals: credentials.email,
              mode: "insensitive",
            },
          },
        });

        if (user?.password && credentials) {
          const validPassword = await bcrypt.compare(
            credentials.password,
            user.password as string
          );

          if (validPassword) {
            return user;
          }
        }
      } catch (error) {
        console.error(error);
      }
      return null;
    },
  });
