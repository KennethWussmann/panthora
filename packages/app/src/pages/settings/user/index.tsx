import { Progress } from "@chakra-ui/react";
import { UserSettingsView } from "@/components/settings/UserSettings/UserSettingsView";
import { useUser } from "@/lib/UserProvider";

const User = () => {
  const { user } = useUser();
  if (!user) {
    return <Progress isIndeterminate />;
  }
  return <UserSettingsView user={user} />;
};

export default User;
