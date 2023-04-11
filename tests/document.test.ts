import { InsertPatch, SpliceTextPatch, unstable } from "@automerge/automerge";
import { describe, test, expect } from "vitest";
import { patch, unpatch } from "../src";

type DataType = {
  values: string[];
};

describe("Unstable Document Tests", () => {
  test("Inserting a string into an array of strings", () => {
    const doc = unstable.from<DataType>({ values: [] });

    const updated = unstable.change(doc, (doc) => {
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

    const patched = unstable.change(updated, (doc) => {
      patches.forEach((p) => {
        patch(doc, p);
      });
    });

    expect(patched.values).toEqual(["hello", "there"]);

    const unpatched = unstable.change(patched, (doc) => {
      unpatches.forEach((p) => {
        patch(doc, p);
      });
    });

    expect(unpatched.values).toEqual(["hello"]);
  });
});
