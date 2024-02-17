import { useRouter } from "next/router";
import { useEffect } from "react";

const Page = () => {
  const { push } = useRouter();

  useEffect(() => {
    void push("/settings");
  });
  return null;
};

export default Page;
