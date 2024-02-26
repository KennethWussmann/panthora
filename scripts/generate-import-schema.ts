import { writeFile } from "fs/promises";
import { join } from "path";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  importSchema,
  importSchemaVersion,
} from "~/server/lib/import/importSchema";

const generate = async () => {
  const jsonSchema = zodToJsonSchema(importSchema);
  await writeFile(
    join(__dirname, `../schemas/import-${importSchemaVersion}.schema.json`),
    JSON.stringify(jsonSchema, null, 2)
  );
};

void generate();
