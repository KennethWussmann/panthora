import { type ImportSchema } from "~/server/lib/import/importSchema";

const seed: ImportSchema = {
  $schema: `https://panthora.app/import-0.2.0.schema.json`,
  version: "1.0",
  author: "E2E",
  name: "user-with-seed",
  description:
    "Contains one Book asset type with 7 fields and no tags nor assets.",
  tags: [],
  assetTypes: [
    {
      name: "Book",
      fields: [
        {
          type: "STRING",
          name: "Title",
          inputRequired: true,
          showInTable: true,
        },
        {
          type: "STRING",
          name: "Author",
          inputRequired: true,
          showInTable: true,
        },
        {
          type: "STRING",
          name: "Publisher",
          inputRequired: false,
          showInTable: true,
        },
        {
          type: "NUMBER",
          name: "Publication Year",
          inputMin: 1450,
          inputMax: 2024,
          inputRequired: false,
          showInTable: true,
        },
        {
          type: "STRING",
          name: "ISBN",
          inputRequired: false,
          showInTable: true,
        },
        {
          type: "STRING",
          name: "Genre",
          inputRequired: false,
          showInTable: true,
        },
        {
          type: "BOOLEAN",
          name: "Read",
          inputRequired: false,
          showInTable: true,
        },
      ],
    },
  ],
};

export default seed;
