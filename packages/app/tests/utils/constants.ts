import { faker } from "@faker-js/faker";

export const e2eBaseUrl = "http://localhost:3000";

export const e2eUser = {
  email:
    `${faker.person.firstName()}.${faker.person.lastName()}@panthora.io`.toLowerCase(),
  password: "e2eTestPassword!",
  teamName: "E2E Test",
  storageState: "./test-results/user-storage-state.json",
};
