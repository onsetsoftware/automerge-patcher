import {
  DelPatch,
  change,
  deleteAt,
  from,
  unstable,
} from "@automerge/automerge";
import { bench, describe } from "vitest";
import { patch } from "../src";
import { documentData, documentDataWithoutText } from "../tests/data";
import { options } from "./options";

describe("Array Delete", () => {
  bench(
    "deleteAt",
    () => {
      const doc = from(documentData);
      change(doc, (doc) => {
        deleteAt(doc.array, 1, 1);
      });
    },
    options,
  );

  bench(
    "array splice",
    () => {
      const doc = from(documentData);
      change(doc, (doc) => {
        doc.array.splice(1, 1);
      });
    },
    options,
  );

  bench(
    "apply patch",
    () => {
      const doc = from(documentData);
      const patches: DelPatch[] = [{ action: "del", path: ["array", 1] }];

      change(doc, (doc) => {
        patch(doc, patches[0]);
      });
    },
    options,
  );
});

describe("Array Delete - Unstable", () => {
  bench(
    "deleteAt",
    () => {
      const doc = unstable.from(documentDataWithoutText);
      unstable.change(doc, (doc) => {
        deleteAt(doc.array, 1, 1);
      });
    },
    options,
  );

  bench(
    "array splice",
    () => {
      const doc = unstable.from(documentDataWithoutText);
      unstable.change(doc, (doc) => {
        doc.array.splice(1, 1);
      });
    },
    options,
  );

  bench(
    "apply patch",
    () => {
      const doc = unstable.from(documentDataWithoutText);
      const patches: DelPatch[] = [{ action: "del", path: ["array", 1] }];

      unstable.change(doc, (doc) => {
        patch(doc, patches[0]);
      });
    },
    options,
  );
});
