import { DelPatch, SpliceTextPatch, unstable } from "@automerge/automerge";
import { bench, describe } from "vitest";
import { patch } from "../src";
import { documentDataWithoutText } from "../tests/data";
import { options } from "./options";

describe("Splice - unstable", () => {
  bench(
    "splice",
    () => {
      const doc = unstable.from(documentDataWithoutText);
      unstable.change(doc, (doc) => {
        unstable.splice(doc, ["string"], 5, 0, " there");
      });
    },
    options,
  );

  bench(
    "apply patch",
    () => {
      const doc = unstable.from(documentDataWithoutText);
      const patches: SpliceTextPatch[] = [
        { action: "splice", path: ["string", 5], value: "there" },
      ];

      unstable.change(doc, (doc) => {
        patch(doc, patches[0]);
      });
    },
    options,
  );
});

describe("Splice Delete - unstable", () => {
  bench(
    "splice",
    () => {
      const doc = unstable.from(documentDataWithoutText);
      unstable.change(doc, { patchCallback: console.log }, (doc) => {
        unstable.splice(doc, ["string"], 5, 3);
      });
    },
    options,
  );

  bench(
    "apply patch",
    () => {
      const doc = unstable.from(documentDataWithoutText);
      const patches: DelPatch[] = [
        { action: "del", path: ["string", 5], length: 3 },
      ];

      unstable.change(doc, (doc) => {
        patch(doc, patches[0]);
      });
    },
    options,
  );
});
