import Error from "next/error";
import { useSelectedAssets } from "~/lib/SelectedAssetsProvider";
import { LabelPDF } from "~/lib/pdf/LabelPDF";

export default function PrintAssets() {
  const { selectedAssets, selectedLabelTemplate } = useSelectedAssets();

  if (selectedAssets.length === 0) {
    return <Error statusCode={404} />;
  }

  return (
    <LabelPDF assets={selectedAssets} labelTemplate={selectedLabelTemplate} />
  );
}
