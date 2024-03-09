import { type ClientConfig } from "pg";

export const parseDatabaseUrl = (databaseUrl: string): ClientConfig => {
  const url = new URL(databaseUrl);
  return {
    host: url.hostname,
    port: parseInt(url.port, 10),
    database: url.pathname.slice(1),
    user: url.username,
    password: url.password,
  };
};
