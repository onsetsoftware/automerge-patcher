import { change, type Doc, from, init, Patch } from "@automerge/automerge";
import { patch as applyPatch } from "../src";
import { beforeEach, describe, expect, test } from "vitest";
import { documentData } from "./data";
import { clone, getProperty } from "../src/helpers";

describe("Applying Patches", () => {
  let doc: Doc<typeof documentData>;
  let plainDoc: Doc<typeof documentData>;
  beforeEach(() => {
    plainDoc = clone(documentData);
    doc = from(documentData);
  });

  const tests: { name: string; patch: Patch; expected: any; path: string }[] = [
    {
      name: "delete root property",
      patch: {
        action: "del",
        path: ["optional"],
      },
      path: "optional",
      expected: null,
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
    {
      name: "splice insert text",
      patch: {
        action: "splice",
        path: ["object", "hello", 5],
        value: " there",
      },
      path: "object.hello",
      expected: "world there",
    },
    {
      name: "splice delete text",
      patch: {
        action: "del",
        path: ["object", "hello", 1],
        length: 2,
      },
      path: "object.hello",
      expected: "wld",
    },
  ];

  tests.forEach(({ name, patch, expected, path }) => {
    test("Automerge: " + name, () => {
      const newDoc = change(doc, (doc) => {
        applyPatch(doc, patch);
      });

      expect(
        JSON.parse(
          JSON.stringify(getProperty(newDoc, path.split(".")) || null),
        ),
      ).toEqual(expected);
    });
  });

  tests.forEach(({ name, patch, expected, path }) => {
    test("JS: " + name, () => {
      applyPatch(plainDoc, patch);

      expect(getProperty(plainDoc, path.split(".")) || null).toEqual(expected);
    });
  });

  test("splicing an empty string works within the same function", () => {
    const doc = init<{ foo: string }>();

    const newDoc = change(doc, (doc) => {
      doc.foo = "";
      applyPatch(doc, {
        action: "splice",
        path: ["foo", 0],
        value: "hello",
      });
    });

    expect(newDoc.foo).toEqual("hello");
  });

  test('change the value of the property at path ["."]', () => {
    const doc = from({ ".": 0 });

    const newDoc = change(doc, (doc) => {
      applyPatch(doc, {
        action: "put",
        path: ["."],
        value: 1,
      });
    });
    expect(newDoc["."]).toEqual(1);
  });

  test('change the value of the property at path ["test.", ".x"]', () => {
    const doc = from({ "test.": { ".x": 0 } });

    const newDoc = change(doc, (doc) => {
      applyPatch(doc, {
        action: "put",
        path: ["test.", ".x"],
        value: 1,
      });
    });
    expect(newDoc["test."][".x"]).toEqual(1);
  });

  test('change the value of the property at path [" x "]', () => {
    const doc = from({ " x ": 0 });

    const newDoc = change(doc, (doc) => {
      applyPatch(doc, {
        action: "put",
        path: [" x "],
        value: 1,
      });
    });
    expect(newDoc[" x "]).toEqual(1);
  });
});
