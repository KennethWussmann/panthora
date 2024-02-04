import { useEffect, useState } from "react";
import type { Document } from "pdfjs";

export const usePDF = ({
  document,
  skip,
  dependencies,
}: {
  document: () => Promise<Document> | Document;
  skip: boolean;
  dependencies?: unknown[];
}) => {
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    if (skip) {
      return;
    }
    let isSubscribed = true;

    const generatePDF = async () => {
      const doc = await document();
      const buf = await doc.asBuffer();
      const blob = new Blob([buf], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      if (isSubscribed) {
        setPdfUrl(url);
      }

      return () => {
        URL.revokeObjectURL(url);
        isSubscribed = false;
      };
    };

    void generatePDF();

    return () => {
      isSubscribed = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, ...(dependencies ?? [])]);

  return pdfUrl;
};
