import { IncPatch, change, from } from "@automerge/automerge";
import { bench, describe } from "vitest";
import { patch } from "../src";
import { documentData } from "../tests/data";
import { options } from "./options";

describe("Counter Increment", () => {
  bench(
    "increment",
    () => {
      const doc = from(documentData);
      change(doc, (doc) => {
        doc.counter.increment(1);
      });
    },
    options,
  );

  bench(
    "apply patch",
    () => {
      const doc = from(documentData);
      const patches: IncPatch[] = [
        { action: "inc", path: ["counter"], value: 1 },
      ];

      change(doc, (doc) => {
        patch(doc, patches[0]);
      });
    },
    options,
  );
});

describe("Counter Increment", () => {
  bench(
    "increment",
    () => {
      const doc = from(documentData);
      change(doc, (doc) => {
        doc.counter.decrement(1);
      });
    },
    options,
  );

  bench(
    "apply patch",
    () => {
      const doc = from(documentData);
      const patches: IncPatch[] = [
        { action: "inc", path: ["counter"], value: -1 },
      ];

      change(doc, (doc) => {
        patch(doc, patches[0]);
      });
    },
    options,
  );
});
