import { change, type Doc, from, Patch, } from "@automerge/automerge";
import { patch as applyPatch, TempIncPatch, unpatch } from "../src"
import { beforeEach, describe, expect, test } from "vitest";
import { Document } from "./data";
import { pick } from "dot-object";

describe("Applying Patches", () => {
  let doc: Doc<typeof Document>;
  beforeEach(() => {
    doc = from(Document);
  });

  const tests: {name: string, patch: Patch | TempIncPatch, expected: any, path: string}[] = [
    {
      name: "splice text",
      patch: {
        action: "splice",
        path: ["text", 0],
        values: ["h"],
      },
      path: "text",
      expected: "hhello world",
    },
    {
      name: "delete text",
      patch: {
        action: "del",
        path: ["text", 2],
      },
      path: "text",
      expected: "helo world",
    },
    {
      name: "insert into array",
      patch: {
        action: "splice",
        path: ["array", 1],
        values: ["there"],
      },
      path: "array",
      expected: ["hello", "there", "world"],
    },
    {
      name: "delete array entry",
      patch: {
        action: "del",
        path: ["array", 1],
      },
      path: "array",
      expected: ["hello"],
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

      expect(JSON.parse(JSON.stringify(pick(path, newDoc) || null))).toEqual(expected);
    });
  });
  
  test('', () => {
    const doc = from({foo: 'bar'});
    
    let patch;
    
    const doc2 = change(doc, {
      patchCallback: (p, old) => {
        patch = unpatch(old, p);
      }
    }, (doc) => {
      doc.foo = 'baz';
    });

    expect(doc2.foo).toBe('baz');
    
    const doc3 = change(doc2, (doc) => {
      applyPatch(doc, patch);
    });
    
    expect(doc3.foo).toBe('bar');
  });
});
