import { parse } from "search-query-parser";

export const parseQuery = (query: string) => {
  const result = parse(query, { keywords: ["is", "name"] });
  return result;
};
