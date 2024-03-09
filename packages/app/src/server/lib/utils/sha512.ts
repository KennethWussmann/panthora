import { createHash } from "crypto";

export const sha512 = (input: string): string => {
  return createHash("sha512").update(input).digest("hex");
};
