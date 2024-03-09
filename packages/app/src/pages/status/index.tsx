import BlankLayout from "@/components/layout/BlankLayout";
import { ServerHealthView } from "@/components/server-health/ServerHealthView";
import { useUser } from "@/lib/UserProvider";

const Setup = () => {
  const { user } = useUser();
  if (!user) {
    return null;
  }
  return <ServerHealthView user={user} />;
};

Setup.layout = BlankLayout;

export default Setup;
