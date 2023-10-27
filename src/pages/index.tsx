import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session.data?.user) {
      router.push("/dashboard");
    } else {
      void signIn(undefined, { callbackUrl: "/dashboard" });
    }
  });

  return null;
}
