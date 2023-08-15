import {
  InsertPatch,
  Patch,
  SpliceTextPatch,
  next,
} from "@automerge/automerge";
import { describe, test, expect } from "vitest";
import { patch, unpatch } from "../src";

type DataType = {
  values: string[];
};

describe("next Document Tests", () => {
  test("Inserting a string into an array of strings", () => {
    const doc = next.from<DataType>({ values: [] });

    const updated = next.change(doc, (doc) => {
      doc.values.push("hello");
    });

    expect(updated.values).toEqual(["hello"]);

    const patches = [
      { action: "insert", path: ["values", 1], values: [""] } as InsertPatch,
      {
        action: "splice",
        path: ["values", 1, 0],
        value: "there",
      } as SpliceTextPatch,
    ];

    const unpatches = patches.map((p) => unpatch(updated, p)).reverse();

    const patched = next.change(updated, (doc) => {
      patches.forEach((p) => {
        patch(doc, p);
      });
    });

    expect(patched.values).toEqual(["hello", "there"]);

    const unpatched = next.change(patched, (doc) => {
      unpatches.forEach((p) => {
        patch(doc, p);
      });
    });

    expect(unpatched.values).toEqual(["hello"]);
  });

  test("reversing a delete patch when removing an object", () => {
    const doc = next.from<{ object?: { hello: string } }>({
      object: { hello: "world" },
    });

    const patches: Patch[] = [];

    const updated = next.change(
      doc,
      {
        patchCallback: (p) => {
          patches.push(...p);
        },
      },
      (doc) => {
        delete doc.object;
      }
    );

    const unpatches = patches.map((p) => unpatch(doc, p)).reverse();

    const reversed = next.change(updated, (doc) => {
      unpatches.forEach((p) => {
        patch(doc, p);
      });
    });

    expect(reversed.object).toEqual({ hello: "world" });
  });
});
