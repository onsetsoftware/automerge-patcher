import { DelPatch, InsertPatch, change, from } from "@automerge/automerge";
import { bench, describe } from "vitest";
import { patch } from "../src";
import { documentData } from "../tests/data";
import { options } from "./options";

describe("Text Insert", () => {
  bench(
    "insertAt",
    () => {
      const doc = from(documentData);
      change(doc, (doc) => {
        doc.text.insertAt(2, "x", "y", "z");
      });
    },
    options,
  );

  bench(
    "apply patch",
    () => {
      const doc = from(documentData);
      const patches = [
        {
          action: "insert",
          path: ["text", 2],
          values: ["x", "y", "z"],
        } as InsertPatch,
      ];

      change(doc, (doc) => {
        patch(doc, patches[0]);
      });
    },
    options,
  );
});

describe("Text Delete", () => {
  bench(
    "deleteAt",
    () => {
      const doc = from(documentData);
      change(doc, (doc) => {
        doc.text.deleteAt(2, 2);
      });
    },
    options,
  );

  bench(
    "apply patch",
    () => {
      const doc = from(documentData);
      const patches: DelPatch[] = [
        { action: "del", path: ["text", 2], length: 2 },
      ];

      change(doc, (doc) => {
        patch(doc, patches[0]);
      });
    },
    options,
  );
});
