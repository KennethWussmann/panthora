import { SettingsForm } from "~/components/settings/SettingsForm";

export default function Settings() {
  return <SettingsForm />;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  };
}
