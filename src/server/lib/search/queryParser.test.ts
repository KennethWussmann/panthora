import { describe, expect, test } from "vitest";
import { parseQuery } from "./queryParser";

describe("parseQuery", () => {
  test("parses query with is keyword", () => {
    const result = parseQuery("is:asset Hello World");

    expect(result).toMatchInlineSnapshot(`
      {
        "exclude": {},
        "is": "asset",
        "offsets": [
          {
            "keyword": "is",
            "offsetEnd": 8,
            "offsetStart": 0,
            "value": "asset",
          },
          {
            "offsetEnd": 14,
            "offsetStart": 9,
            "text": "Hello",
          },
          {
            "offsetEnd": 20,
            "offsetStart": 15,
            "text": "World",
          },
        ],
        "text": "Hello World",
      }
    `);
  });
  test("parses query with name keyword and space", () => {
    const result = parseQuery('is:asset name:"Hello World"');

    expect(result).toMatchInlineSnapshot(`
      {
        "exclude": {},
        "is": "asset",
        "name": "Hello World",
        "offsets": [
          {
            "keyword": "is",
            "offsetEnd": 8,
            "offsetStart": 0,
            "value": "asset",
          },
          {
            "keyword": "name",
            "offsetEnd": 27,
            "offsetStart": 9,
            "value": "Hello World",
          },
        ],
      }
    `);
  });
  test("parses query with no keywords", () => {
    const result = parseQuery("Hello World");

    expect(result).toMatchInlineSnapshot('"Hello World"');
  });
});
