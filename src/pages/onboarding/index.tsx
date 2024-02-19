import Error from "next/error";
import BlankLayout from "~/components/layout/BlankLayout";
import { OnboardingView } from "~/components/onboarding/OnboardingView";
import { useUser } from "~/lib/UserProvider";

const Onboarding = () => {
  const { user } = useUser();
  if (!user) {
    return <Error statusCode={401} />;
  }
  return <OnboardingView user={user} />;
};

Onboarding.layout = BlankLayout;
export default Onboarding;
