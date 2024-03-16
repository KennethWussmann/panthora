import { useRouter } from "next/router";
import { useEffect } from "react";

const Settings = () => {
  const { back } = useRouter();

  useEffect(() => {
    back();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default Settings;
