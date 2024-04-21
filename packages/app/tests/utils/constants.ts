import { faker } from "@faker-js/faker";
import userWithSeedSeed from "tests/seeds/user-with-seed.seed";
import { type ImportSchema } from "~/server/lib/import/importSchema";

export const e2eBaseUrl = "http://localhost:3000";

export type E2EUserType = "user" | "user-with-seed";

export type E2EUser = {
  email: string;
  password: string;
  teamName: string;
  seed?: ImportSchema;
  storageState: string;
};

const baseUser: (
  type: E2EUserType
) => Pick<E2EUser, "email" | "password" | "teamName"> = (type) => ({
  email: faker.internet
    .email({ provider: `${type}.e2e.panthora.io` })
    .toLowerCase(),
  password: "e2eTestPassword!",
  teamName: "E2E Test",
});

export const e2eUsers: Record<E2EUserType, E2EUser> = {
  user: {
    ...baseUser("user"),
    storageState: "./test-results/storage/user.state.json",
  },
  "user-with-seed": {
    ...baseUser("user-with-seed"),
    seed: userWithSeedSeed,
    storageState: "./test-results/storage/user-with-seed.state.json",
  },
};
