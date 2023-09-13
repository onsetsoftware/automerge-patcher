import { DelPatch, SpliceTextPatch, next } from "@automerge/automerge";
import { bench, describe } from "vitest";
import { patch } from "../src";
import { documentDataWithoutText } from "../tests/data";
import { options } from "./options";

describe("Splice - next", () => {
  bench(
    "splice",
    () => {
      const doc = next.from(documentDataWithoutText);
      next.change(doc, (doc) => {
        next.splice(doc, ["string"], 5, 0, " there");
      });
    },
    options
  );

  bench(
    "apply patch",
    () => {
      const doc = next.from(documentDataWithoutText);
      const patches: SpliceTextPatch[] = [
        { action: "splice", path: ["string", 5], value: "there" },
      ];

      next.change(doc, (doc) => {
        patch(doc, patches[0]);
      });
    },
    options
  );
});

describe("Splice Delete - next", () => {
  bench(
    "splice",
    () => {
      const doc = next.from(documentDataWithoutText);
      next.change(doc, (doc) => {
        next.splice(doc, ["string"], 5, 3);
      });
    },
    options
  );

  bench(
    "apply patch",
    () => {
      const doc = next.from(documentDataWithoutText);
      const patches: DelPatch[] = [
        { action: "del", path: ["string", 5], length: 3 },
      ];

      next.change(doc, (doc) => {
        patch(doc, patches[0]);
      });
    },
    options
  );
});
