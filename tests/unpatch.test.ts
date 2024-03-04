import { beforeEach, describe, expect, test } from "vitest";
import type { Patch } from "@automerge/automerge";
import { documentData } from "./data";
import { unpatch } from "../src";

describe("Un-patching patches", () => {
  beforeEach(() => {});

  const tests: { name: string; patch: Patch; expected: Patch }[] = [
    {
      name: "basic text insert",
      patch: {
        action: "insert",
        path: ["text", 0],
        values: ["h", "e", "l", "l", "o"],
      },
      expected: { action: "del", path: ["text", 0], length: 5 },
    },

    {
      name: "basic text delete",
      patch: {
        action: "del",
        path: ["text", 0],
        length: 2,
      },
      expected: {
        action: "insert",
        path: ["text", 0],
        values: ["h", "e"],
      },
    },

    {
      name: "basic text put",
      patch: {
        action: "put",
        path: ["text", 0],
        value: "b"
      },
      expected: { action: "put", path: ["text", 0], value: "h", conflict: false },
    },

    {
      name: "array delete",
      patch: {
        action: "del",
        path: ["array", 0],
        length: 2,
      },
      expected: {
        action: "insert",
        path: ["array", 0],
        values: ["hello", "world"],
      },
    },

    {
      name: "array insert",
      patch: {
        action: "insert",
        path: ["array", 1],
        values: ["there", "again"],
      },
      expected: {
        action: "del",
        path: ["array", 1],
        length: 2,
      },
    },

    {
      name: "put date",
      patch: {
        action: "put",
        path: ["date"],
        value: new Date(1692724758677),
        conflict: false,
      },
      expected: {
        action: "put",
        path: ["date"],
        value: new Date(1692724609057),
        conflict: false,
      },
    },

    {
      name: "del date",
      patch: {
        action: "del",
        path: ["date"],
      },
      expected: {
        action: "put",
        path: ["date"],
        value: new Date(1692724609057),
        conflict: false
      },
    },

    {
      name: "del deeply nested date",
      patch: {
        action: "del",
        path: ["deeply", "nested"],
      },
      expected: {
        action: "put",
        path: ["deeply", "nested"],
        value: documentData.deeply.nested,
        conflict: false
      },
    },

    {
      name: "put value where value exists",
      patch: {
        action: "put",
        path: ["string"],
        value: "changed",
        conflict: false,
      },
      expected: {
        action: "put",
        path: ["string"],
        value: "hello world",
        conflict: false,
      },
    },

    {
      name: "put value where value does not exists",
      patch: {
        action: "put",
        path: ["object", "new-string"],
        value: "this is new",
        conflict: false,
      },

      expected: {
        action: "del",
        path: ["object", "new-string"],
      },
    },

    {
      name: "put value where value is empty string",
      patch: {
        action: "put",
        path: ["object", "empty"],
        value: "this is new",
        conflict: false,
      },

      expected: {
        action: "put",
        path: ["object", "empty"],
        value: "",
        conflict: false,
      },
    },

    {
      name: "delete value from object",
      patch: {
        action: "del",
        path: ["object", "hello"],
      },
      expected: {
        action: "put",
        path: ["object", "hello"],
        value: "world",
        conflict: false,
      },
    },

    {
      name: "delete nested object from object",
      patch: {
        action: "del",
        path: ["people", "entities", "id-1"],
      },
      expected: {
        action: "put",
        path: ["people", "entities", "id-1"],
        value: documentData.people.entities["id-1"] as any,
        conflict: false,
      },
    },
    {
      name: "increment counter",
      patch: {
        action: "inc",
        path: ["counter"],
        value: 1,
      },
      expected: {
        action: "inc",
        path: ["counter"],
        value: -1,
      },
    },
    {
      name: "decrement counter",
      patch: {
        action: "inc",
        path: ["counter"],
        value: -5,
      },
      expected: {
        action: "inc",
        path: ["counter"],
        value: 5,
      },
    },
    {
      name: "splice string",
      patch: {
        action: "splice",
        path: ["string", 0],
        value: "hello",
      },
      expected: {
        action: "del",
        path: ["string", 0],
        length: 5,
      },
    },
    {
      name: "delete string",
      patch: {
        action: "del",
        path: ["string", 0],
        length: 5,
      },
      expected: {
        action: "splice",
        path: ["string", 0],
        value: "hello",
      },
    },
    {
      name: "delete bytes",
      patch: {
        action: "del",
        path: ["bytes"],
      },
      expected: {
        action: "put",
        path: ["bytes"],
        value: new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]),
        conflict: false,
      },
    }
  ];

  tests.forEach(({ name, patch, expected }) => {
    test(name, () => {
      const unPatched = unpatch(documentData, patch);
      expect(unPatched).toEqual(expected);
    });
  });
});
