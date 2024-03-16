import { Restricted } from "@/components/auth/Restricted";
import BlankLayout from "@/components/layout/BlankLayout";
import { OnboardingView } from "@/components/onboarding/OnboardingView";

const Onboarding = () => {
  return (
    <Restricted>
      <OnboardingView />
    </Restricted>
  );
};

Onboarding.layout = BlankLayout;
export default Onboarding;
