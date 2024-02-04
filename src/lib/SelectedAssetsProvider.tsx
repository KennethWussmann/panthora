import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type SetStateAction,
  type Dispatch,
} from "react";
import type { AssetWithFields } from "~/server/lib/assets/asset";
import { type LabelTemplate } from "~/server/lib/label-templates/labelTemplate";

type SelectedAssetContextType = {
  selectedAssets: AssetWithFields[];
  setSelectedAssets: Dispatch<SetStateAction<AssetWithFields[]>>;
  selectedLabelTemplate: LabelTemplate | undefined;
  setSelectedLabelTemplate: Dispatch<SetStateAction<LabelTemplate | undefined>>;
};

const SelectedAssetContext = createContext<
  SelectedAssetContextType | undefined
>(undefined);

export const useSelectedAssets = (): SelectedAssetContextType => {
  const context = useContext(SelectedAssetContext);
  if (!context) {
    throw new Error(
      "useSelectedAssets must be used within a SelectedAssetProvider"
    );
  }
  return context;
};

type SelectedAssetProviderProps = {
  children: ReactNode;
};

export const SelectedAssetProvider: React.FC<SelectedAssetProviderProps> = ({
  children,
}) => {
  const [selectedAssets, setSelectedAssets] = useState<AssetWithFields[]>([]);
  const [selectedLabelTemplate, setSelectedLabelTemplate] =
    useState<LabelTemplate>();

  return (
    <SelectedAssetContext.Provider
      value={{
        selectedAssets,
        setSelectedAssets,
        selectedLabelTemplate,
        setSelectedLabelTemplate,
      }}
    >
      {children}
    </SelectedAssetContext.Provider>
  );
};
