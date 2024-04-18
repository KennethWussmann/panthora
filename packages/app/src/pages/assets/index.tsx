import { AssetTable } from "@/components/assets/List/AssetTable";
import { AssetTableProvider } from "~/components/assets/List/AssetTableContext";

export default function Assets() {
  return (
    <>
      <AssetTableProvider>
        <AssetTable />
      </AssetTableProvider>
    </>
  );
}
