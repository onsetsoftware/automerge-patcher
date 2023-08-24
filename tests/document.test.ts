import {
  InsertPatch,
  Patch,
  SpliceTextPatch,
  change,
  clone,
  deleteAt,
  from,
  insertAt,
  next,
} from "@automerge/automerge";
import { describe, test, expect } from "vitest";
import { patch, unpatch } from "../src";
import { unpatchAll } from "../src/unpatch";

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

  test("moving a string in an array of strings", () => {
    const doc = next.from<DataType>({
      values: ["oh", "you", "pretty", "things", "don't", "you", "know"],
    });

    const patches: Patch[] = [];

    const changed = next.change(
      doc,
      {
        patchCallback: (p) => {
          patches.push(...p);
        },
      },
      (doc) => {
        insertAt(doc.values, 0, "things");
        deleteAt(doc.values, 4);
      }
    );
    const reverse = unpatchAll(doc, patches);

    expect(reverse).toEqual([
      { action: "del", path: ["values", 0, 0], length: 6 },
      { action: "insert", path: ["values", 4], values: ["things"] },
      { action: "del", path: ["values", 0], length: 1 },
    ]);

    const updated = next.change(changed, (doc) => {
      reverse.forEach((p) => {
        patch(doc, p);
      });
    });

    expect(updated.values).toEqual(doc.values);
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
