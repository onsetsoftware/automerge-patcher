import { change, type Doc, from, Patch } from "@automerge/automerge";
import { patch as applyPatch } from "../src";
import { beforeEach, describe, expect, test } from "vitest";
import { Document } from "./data";
import { getProperty } from "dot-prop";

describe("Applying Patches", () => {
  let doc: Doc<typeof Document>;
  beforeEach(() => {
    doc = from(Document);
  });

  const tests: { name: string; patch: Patch; expected: any; path: string }[] = [
    {
      name: "insert text",
      patch: {
        action: "insert",
        path: ["text", 6],
        values: ["t", "h", "e", "r", "e", " "],
      },
      path: "text",
      expected: "hello there world",
    },
    {
      name: "delete text",
      patch: {
        action: "del",
        path: ["text", 2],
        length: 3,
      },
      path: "text",
      expected: "he world",
    },
    {
      name: "insert into array",
      patch: {
        action: "insert",
        path: ["array", 1],
        values: ["there", "my"],
      },
      path: "array",
      expected: ["hello", "there", "my", "world"],
    },
    {
      name: "delete array entry",
      patch: {
        action: "del",
        path: ["array", 0],
        length: 2,
      },
      path: "array",
      expected: [],
    },
    {
      name: "replace value",
      patch: {
        action: "put",
        path: ["string"],
        value: "changed",
        conflict: false,
      },
      path: "string",
      expected: "changed",
    },
    {
      name: "add new value",
      patch: {
        action: "put",
        path: ["object", "data"],
        value: "changed",
        conflict: false,
      },
      path: "object.data",
      expected: "changed",
    },
    {
      name: "delete object property",
      patch: {
        action: "del",
        path: ["people", "entities", "id-1"],
      },
      path: "people.entities.id-1",
      expected: null,
    },
    {
      name: "increment counter",
      patch: {
        action: "inc",
        path: ["counter"],
        value: 5,
      },
      path: "counter",
      expected: 5,
    },
  ];

  tests.forEach(({ name, patch, expected, path }) => {
    test(name, () => {
      const newDoc = change(doc, (doc) => {
        applyPatch(doc, patch);
      });

      expect(
        JSON.parse(JSON.stringify(getProperty(newDoc, path) || null))
      ).toEqual(expected);
    });
  });
});
