import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Progress,
} from "@chakra-ui/react";
import { Control, useWatch } from "react-hook-form";
import { LabelPDF } from "~/lib/pdf/LabelPDF";
import { LabelTemplateCreateEditRequest } from "~/server/lib/label-templates/labelTemplateCreateEditRequest";
import { api } from "~/utils/api";

export const LabelTemplatePrintPreview = ({
  teamId,
  control,
}: {
  teamId: string;
  control: Control<LabelTemplateCreateEditRequest, unknown>;
}) => {
  const { data: assets } = api.asset.list.useQuery({
    teamId,
    limit: 3,
  });
  const labelTemplateDraft = useWatch({ control });

  if (!assets) {
    return <Progress size="xs" isIndeterminate />;
  }

  if (assets.length === 0) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <AlertTitle>No assets found</AlertTitle>
        <AlertDescription>
          The label template preview requires at least one asset to be present,
          which will be used to render the label. You can continue to create the
          template without a preview.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <LabelPDF
      assets={assets}
      labelTemplate={{
        createdAt: new Date(),
        updatedAt: new Date(),
        id: "preview",
        name: "Preview",
        teamId,
        width: 57,
        height: 32,
        padding: 2,
        fontSize: 7,
        team: {
          id: teamId,
          name: "Preview",
        },
        components: [],
        default: false,
        qrCodeScale: 2,
        ...labelTemplateDraft,
      }}
      showPrintDialog={false}
    />
  );
};
