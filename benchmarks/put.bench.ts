import { PutPatch, change, from, next } from "@automerge/automerge";
import { bench, describe } from "vitest";
import { patch } from "../src";
import { documentData, documentDataWithoutText } from "../tests/data";
import { options } from "./options";

describe("Put Value", () => {
  bench(
    "put",
    () => {
      const doc = from(documentData);
      change(doc, (doc) => {
        doc.object.data = "new value";
      });
    },
    options
  );

  bench(
    "apply patch",
    () => {
      const doc = from(documentData);
      const patches: PutPatch[] = [
        { action: "put", path: ["object", "data"], value: "new value" },
      ];

      change(doc, (doc) => {
        patch(doc, patches[0]);
      });
    },
    options
  );
});

describe("Put Value - next", () => {
  bench(
    "put",
    () => {
      const doc = next.from(documentDataWithoutText);
      next.change(doc, (doc) => {
        doc.object.data = "new value";
      });
    },
    options
  );

  bench(
    "apply patch",
    () => {
      const doc = next.from(documentDataWithoutText);
      const patches: PutPatch[] = [
        { action: "put", path: ["object", "data"], value: "new value" },
      ];

      next.change(doc, (doc) => {
        patch(doc, patches[0]);
      });
    },
    options
  );
});
