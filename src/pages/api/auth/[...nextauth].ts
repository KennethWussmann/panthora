import NextAuth from "next-auth";

import { authOptions } from "~/server/auth/auth";

export default NextAuth(authOptions);
