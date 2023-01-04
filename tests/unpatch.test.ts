import { beforeEach, describe, expect, test } from "vitest";
import type { Patch } from "@automerge/automerge";
import { Document } from "./data";
import { TempIncPatch, unpatch } from "../src";

describe("Un-patching patches", () => {
  beforeEach(() => {});

  const tests: {name: string, patch: Patch | TempIncPatch, expected: Patch | TempIncPatch}[] = [
    {
      name: "basic text splice",
      patch: {
        action: "splice",
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
        length: 2
      },
      expected: {
        action: "splice",
        path: ["text", 0],
        values: ["h", "e"],
      }
    },

    {
      name: "array delete",
      patch: {
        action: "del",
        path: ["array", 0],
        length: 2
      },
      expected: {
        action: "splice",
        path: ["array", 0],
        values: ["hello", "world"],
      }
    },

    {
      name: "array splice",
      patch: {
        action: "splice",
        path: ["array", 1],
        values: ["there", "again"],
      },
      expected: {
        action: "del",
        path: ["array", 1],
        length: 2,
      }
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
      }
    },

    {
      name: "put value where value does not exists",
      patch: {
        action: "put",
        path: ["object", "new-string"],
        value: "this is new",
        conflict: false,
      },

      expected:{
        action: "del",
        path: ["object", "new-string"],
      }
    },

    {
      name: "delete value from object",
      patch: {
        action: "del",
        path: ["object", "hello"],
      },
      expected:{
        action: "put",
        path: ["object", "hello"],
        value: "world",
        conflict: false,
      }
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
        value: Document.people.entities["id-1"] as any,
        conflict: false,
      }
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
      }
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
      }
    }
  ];
  
  tests.forEach(({name, patch, expected}) => {
    test(name, () => {
      const unPatched = unpatch(Document, patch);
      expect(unPatched).toEqual(expected);
    });
  });
});
