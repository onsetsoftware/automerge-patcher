import { change, type Doc, from, Patch, next } from "@automerge/automerge";
import { patch as applyPatch } from "../src";
import { beforeEach, describe, expect, test } from "vitest";
import { documentData } from "./data";
import { clone, getProperty } from "../src/helpers";

describe("Applying Patches", () => {
  let doc: Doc<typeof documentData>;
  let nextDoc: Doc<Omit<typeof documentData, "text">>;
  let plainDoc: Doc<typeof documentData>;
  beforeEach(() => {
    plainDoc = clone(documentData);
    doc = from(documentData);
    const { text, ...withoutText } = documentData;
    nextDoc = next.from({ ...withoutText });
  });

  const stableTests: {
    name: string;
    patch: Patch;
    expected: any;
    path: string;
  }[] = [
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
      name: "insert text",
      patch: {
        action: "insert",
        path: ["emptyText", 0],
        values: ["h", "e", "l", "l", "o"],
      },
      path: "emptyText",
      expected: "hello",
    },
    {
      name: "delete root property",
      patch: {
        action: "del",
        path: ["optional"],
      },
      path: "optional",
      expected: null,
    },
  ];

  const tests: { name: string; patch: Patch; expected: any; path: string }[] = [
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

  const nextTests: {
    name: string;
    patch: Patch;
    expected: any;
    path: string;
  }[] = [
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

  [...stableTests, ...tests].forEach(({ name, patch, expected, path }) => {
    test("Automerge stable: " + name, () => {
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

  [...stableTests, ...tests, ...nextTests].forEach(
    ({ name, patch, expected, path }) => {
      test("JS: " + name, () => {
        applyPatch(plainDoc, patch);

        expect(getProperty(plainDoc, path.split(".")) || null).toEqual(
          expected,
        );
      });
    },
  );

  [...tests, ...nextTests].forEach(({ name, patch, expected, path }) => {
    test("Automerge next: " + name, () => {
      const newDoc = next.change(nextDoc, (doc) => {
        applyPatch(doc, patch);
      });

      expect(
        JSON.parse(
          JSON.stringify(getProperty(newDoc, path.split(".")) || null),
        ),
      ).toEqual(expected);
    });
  });

  test("splicing an empty string works within the same function", () => {
    const doc = next.init<{ foo: string }>();

    const newDoc = next.change(doc, (doc) => {
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
    const doc = next.from({ ".": 0 });

    const newDoc = next.change(doc, (doc) => {
      applyPatch(doc, {
        action: "put",
        path: ["."],
        value: 1,
      });
    });
    expect(newDoc["."]).toEqual(1);
  });

  test('change the value of the property at path ["test.", ".x"]', () => {
    const doc = next.from({ "test.": { ".x": 0 } });

    const newDoc = next.change(doc, (doc) => {
      applyPatch(doc, {
        action: "put",
        path: ["test.", ".x"],
        value: 1,
      });
    });
    expect(newDoc["test."][".x"]).toEqual(1);
  });

  test('change the value of the property at path [" x "]', () => {
    const doc = next.from({ " x ": 0 });

    const newDoc = next.change(doc, (doc) => {
      applyPatch(doc, {
        action: "put",
        path: [" x "],
        value: 1,
      });
    });
    expect(newDoc[" x "]).toEqual(1);
  });

  test('Write to a path that includes "valueOf"', () => {
    const pathToWrite = ["valueOf","!"];
    const valueToWrite = 1;
      const doc = next.from({"valueOf":{"!":{"!":0}}});
      const newDoc = next.change(doc, (doc) => {
        applyPatch(doc, {
          action: "put",
          path: pathToWrite,
          value: valueToWrite,
        });
      });
      expect(getProperty(newDoc, pathToWrite)).toEqual(valueToWrite);
  });

});
