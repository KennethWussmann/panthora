import { parseISO } from "date-fns";
import { parse } from "search-query-parser";

export const parseQuery = (query: string, customFieldSlugs: string[]) => {
  const result = parse(query, { keywords: ["is", ...customFieldSlugs] });
  return result;
};

const extractOperator = (value: string): [string | null, string] => {
  const trimmedValue = value.trim();
  const pattern = /^[<>]/;
  const match = trimmedValue.match(pattern);

  if (match) {
    // Operator found, return operator and the rest of the string without it
    return [match[0], trimmedValue.substring(1).trim()];
  } else {
    // No operator found, return null and the original trimmed string
    return [null, trimmedValue];
  }
};

const isDate = (value: string) => {
  try {
    const date = parseISO(value);
    return isNaN(date.getTime()) ? false : date;
  } catch (e) {
    return false;
  }
};

const convertInputValue = (value: string) => {
  if (!isNaN(Number(value))) {
    return value;
  }

  const date = isDate(value);

  if (date) {
    return date.getTime();
  }
  return value;
};

type IsFilter = "asset" | "asset-type" | "tag" | undefined;

const parseTypeValue = (value: string): IsFilter => {
  const sanitized = value
    .trim()
    .toLowerCase()
    .replace(" ", "-")
    .replace("_", "-");

  if (sanitized === "asset") {
    return "asset";
  }
  if (sanitized === "asset-type" || sanitized === "assettype") {
    return "asset-type";
  }
  if (sanitized === "tag") {
    return "tag";
  }
  return undefined;
};

export const convertQueryToMeiliSearchQuery = (
  query: string,
  customFieldSlugs: string[]
): {
  query: string | undefined;
  filter: string | undefined;
  is: IsFilter;
} => {
  const parsedQuery = parseQuery(query, customFieldSlugs);
  if (typeof parsedQuery === "string") {
    return { query: parsedQuery, filter: undefined, is: undefined };
  }

  let is: IsFilter = undefined;

  const filter = parsedQuery.offsets
    ?.map((offset) => {
      if ("keyword" in offset && offset.value) {
        if (offset.keyword === "is") {
          is = parseTypeValue(offset.value);
          return undefined;
        }

        const [operator, value] = extractOperator(offset.value);
        return [offset.keyword, operator ?? "=", convertInputValue(value)].join(
          " "
        );
      }
      return undefined;
    })
    ?.filter((x) => x !== undefined)
    ?.join(" AND ");
  const text = Array.isArray(parsedQuery.text)
    ? parsedQuery.text.join(" ")
    : parsedQuery.text;
  return {
    query: text,
    filter: filter && filter.length > 0 ? filter : undefined,
    is,
  };
};
