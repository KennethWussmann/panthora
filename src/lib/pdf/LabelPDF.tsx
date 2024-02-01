import { Document, Image, mm } from "pdfjs";
import { OpenSans } from "./openSans";
import { usePDF } from "./usePDF";
import { type AssetWithFields } from "~/server/lib/assets/asset";
import { dataURLtoUint8Array } from "./dataUrlToUint8Array";
import { appUrl } from "../appUrl";
import QRCode from "qrcode";
import { useEffect, useRef } from "react";
import { FieldType } from "@prisma/client";

const baseDocument = () =>
  new Document({
    font: OpenSans,
    width: 57 * mm,
    height: 32 * mm,
    padding: 3 * mm,
    fontSize: 7,
  });

const labelCell = (doc: Document, asset: AssetWithFields, qrCode: string) => {
  const fieldsToShow = asset.assetType.fields
    .filter((field) => field.showInTable)
    .map((field) => ({
      field,
      value: asset.fieldValues.find((f) => f.customFieldId === field.id)!,
    }));

  const table = doc.table({ widths: [20 * mm, 35 * mm] });
  const row = table.row();

  row.cell().image(new Image(dataURLtoUint8Array(qrCode)));
  const textCell = row.cell({
    paddingLeft: 2 * mm,
  });
  fieldsToShow.forEach(({ value, field: { fieldType } }) => {
    if (fieldType === FieldType.TAG) {
      textCell.text(value.tags.map((tag) => tag.name).join(", "));
    } else {
      textCell.text(String(value.value));
    }
  });

  table.row().cell().text(asset.id, { fontSize: 5 });
};

export const LabelPDF = ({
  assets,
  showPrintDialog = true,
}: {
  assets: AssetWithFields[];
  showPrintDialog?: boolean;
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pdfUrl = usePDF({
    document: async () => {
      const doc = baseDocument();
      await Promise.all(
        assets.map(async (asset, index) => {
          const isLast = index === assets.length - 1;
          const qrCode = await QRCode.toDataURL(
            `${appUrl()}/asset/${asset.id}`,
            {
              type: "image/jpeg",
              margin: 0,
              scale: 2,
            }
          );
          labelCell(doc, asset, qrCode);
          if (!isLast) {
            doc.pageBreak();
          }
        })
      );
      return doc;
    },
    skip: assets.length === 0,
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
