import { faker } from "@faker-js/faker";
import { resolve } from "path";
import userWithSeedSeed from "tests/seeds/user-with-seed.seed";
import screenshotSeed from "tests/seeds/screenshot.seed";
import { type ImportSchema } from "~/server/lib/import/importSchema";

export const e2eBaseUrl = "http://localhost:3000";

export type E2EUserType = "user" | "user-with-seed" | "user-screenshots";

export type E2EUser = {
  email: string;
  password: string;
  teamName: string;
  seed?: ImportSchema;
  storageState: string;
};

const baseUser: (
  type: E2EUserType
) => Pick<E2EUser, "email" | "password" | "teamName" | "storageState"> = (
  type
) => ({
  email: faker.internet
    .email({ provider: `${type}.e2e.panthora.app` })
    .toLowerCase(),
  storageState: `./test-results/storage/${type}.state.json`,
  password: "e2eTestPassword!",
  teamName: "E2E Test",
});

export const e2eUsers: Record<E2EUserType, E2EUser> = {
  user: baseUser("user"),
  "user-with-seed": {
    ...baseUser("user-with-seed"),
    seed: userWithSeedSeed,
  },
  "user-screenshots": {
    ...baseUser("user-screenshots"),
    teamName: "Food Tracker",
    seed: screenshotSeed,
  },
};

export const screenshotPath = resolve(
  __dirname,
  "../../../../docs/assets/screenshots"
);

export const websiteAssets = resolve(
  __dirname,
  "../../../website/src/assets/images"
);
