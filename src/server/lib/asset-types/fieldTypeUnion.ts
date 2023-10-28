import { z } from "zod";

export const fieldTypeUnion = z.union([
  z.literal("STRING"),
  z.literal("NUMBER"),
  z.literal("BOOLEAN"),
  z.literal("DATE"),
  z.literal("TIME"),
  z.literal("DATETIME"),
  z.literal("CURRENCY"),
  z.literal("TAG"),
]);
