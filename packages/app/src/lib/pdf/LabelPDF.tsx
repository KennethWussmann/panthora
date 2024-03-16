import { Document, Image, type Row, mm } from "pdfjs";
import { OpenSans } from "./openSans";
import { usePDF } from "./usePDF";
import { type AssetWithFields } from "@/server/lib/assets/asset";
import { dataURLtoUint8Array } from "./dataUrlToUint8Array";
import { appUrl } from "../appUrl";
import QRCode from "qrcode";
import { useEffect, useRef } from "react";
import { FieldType, LabelComponents } from "@prisma/client";
import { type LabelTemplate } from "@/server/lib/label-templates/labelTemplate";
import { api } from "@/utils/api";

const baseDocument = (template: LabelTemplate) =>
  new Document({
    font: OpenSans,
    width: template.width * mm,
    height: template.height * mm,
    padding: template.padding * mm,
    fontSize: template.fontSize,
  });

const labelCell = (
  doc: Document,
  template: LabelTemplate,
  asset: AssetWithFields,
  qrCode: string
) => {
  const table = doc.table({
    widths: [template.qrCodeScale * 10 * mm, 35 * mm],
  });
  const row = table.row();

  if (template.components?.includes(LabelComponents.QR_CODE)) {
    qrCodeImg(row, qrCode);
  }
  if (template.components?.includes(LabelComponents.ASSET_VALUES)) {
    assetText(row, asset);
  }
  if (template.components?.includes(LabelComponents.ASSET_ID)) {
    assetId(table, asset);
  }
};

const qrCodeImg = (row: Row, qrCode: string) => {
  row.cell().image(new Image(dataURLtoUint8Array(qrCode)));
};

const assetText = (row: Row, asset: AssetWithFields) => {
  const fieldsToShow = asset.assetType.fields
    .filter((field) => field.showInTable)
    .map((field) => ({
      field,
      value: asset.fieldValues.find((f) => f.customFieldId === field.id)!,
    }));

  const textCell = row.cell({
    paddingLeft: 2 * mm,
  });
  fieldsToShow.forEach(({ value, field: { fieldType } }) => {
    if (fieldType === FieldType.TAG) {
      textCell.text(value.tagsValue.map((tag) => tag.name).join(", "));
    } else {
      textCell.text(String(value?.stringValue));
    }
  });
};

const assetId = (
  table: ReturnType<Document["table"]>,
  asset: AssetWithFields
) => {
  table.row().cell().text(asset.id, { fontSize: 5 });
};

export const LabelPDF = ({
  assets,
  showPrintDialog = true,
  labelTemplate,
}: {
  assets: AssetWithFields[];
  showPrintDialog?: boolean;
  labelTemplate?: LabelTemplate;
}) => {
  const { data: defaultLabelTemplate } = api.labelTemplate.default.useQuery({
    teamId: assets[0]!.teamId!,
  });
  const template = labelTemplate ?? defaultLabelTemplate;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pdfUrl = usePDF({
    document: async () => {
      if (!template) {
        throw new Error("No label template");
      }
      const doc = baseDocument(template);
      await Promise.all(
        assets.map(async (asset, index) => {
          const isLast = index === assets.length - 1;
          const qrCode = await QRCode.toDataURL(
            `${appUrl()}/assets/${asset.id}`,
            {
              type: "image/jpeg",
              margin: 0,
              scale: template.qrCodeScale,
            }
          );
          labelCell(doc, template, asset, qrCode);
          if (!isLast) {
            doc.pageBreak();
          }
        })
      );
      return doc;
    },
    dependencies: [assets, template],
    skip: assets.length === 0 || !template,
  });

  useEffect(() => {
    if (!showPrintDialog || !iframeRef.current || !pdfUrl) {
      return;
    }

    const iframeWindow = iframeRef.current.contentWindow;
    if (!iframeWindow) {
      return;
    }

    iframeWindow.print();
  }, [showPrintDialog, pdfUrl]);

  if (!pdfUrl) {
    return null;
  }

  return (
    <iframe
      ref={iframeRef}
      src={pdfUrl}
      width="100%"
      height="100%"
      style={{ border: "none", minHeight: "90vh" }}
    />
  );
};
