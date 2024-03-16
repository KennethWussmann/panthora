import { type Options, hash, verify } from "@node-rs/argon2";

const v0x13 = 1;
const argon2Options: Options = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
  version: v0x13,
  secret: undefined,
};

export const hashPassword = async (password: string): Promise<string> =>
  await hash(password.normalize("NFKC"), argon2Options);

export const verifyPassword = async (hash: string, password: string) =>
  await verify(hash, password.normalize("NFKC"), argon2Options);
