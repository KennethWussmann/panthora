import { faker } from "@faker-js/faker";
import { resolve } from "path";

export const e2eBaseUrl = "http://localhost:3000";

export type E2EUserType = "user" | "user-with-seed";

export type E2EUser = {
  email: string;
  password: string;
  teamName: string;
  seed?: string;
  storageState: string;
};

const baseUser: () => Pick<
  E2EUser,
  "email" | "password" | "teamName"
> = () => ({
  email:
    `${faker.person.firstName()}.${faker.person.lastName()}@panthora.io`.toLowerCase(),
  password: "e2eTestPassword!",
  teamName: "E2E Test",
});

export const e2eUsers: Record<E2EUserType, E2EUser> = {
  user: {
    ...baseUser(),
    storageState: "./test-results/storage/user.state.json",
  },
  "user-with-seed": {
    ...baseUser(),
    seed: resolve("./tests/seeds/user-with-seed.seed.json"),
    storageState: "./test-results/storage/user-with-seed.state.json",
  },
};
