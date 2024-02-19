import { SettingsView } from "~/components/settings/SettingsView";

export default function Settings() {
  return <SettingsView />;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getStaticPaths() {
  return {
    paths: [],
    fallback: true,
  };
}
