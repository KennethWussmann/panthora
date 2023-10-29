import { SettingsForm } from "~/components/settings/SettingsForm";

export default function Settings() {
  return <SettingsForm />;
}

function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  };
}
