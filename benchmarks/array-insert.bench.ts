import {
  InsertPatch,
  change,
  from,
  insertAt,
  next,
} from "@automerge/automerge";
import { bench, describe } from "vitest";
import { patch } from "../src";
import { documentData, documentDataWithoutText } from "../tests/data";
import { options } from "./options";

describe("Array Insert", () => {
  bench(
    "array push",
    () => {
      const doc = from(documentData);
      change(doc, (doc) => {
        doc.array.push("there", "my");
      });
    },
    options
  );

  bench(
    "insertAt",
    () => {
      const doc = from(documentData);
      change(doc, (doc) => {
        insertAt(doc.array, 2, "there", "my");
      });
    },
    options
  );

  bench(
    "array splice",
    () => {
      const doc = from(documentData);
      change(doc, (doc) => {
        doc.array.splice(2, 0, "there", "my");
      });
    },
    options
  );

  bench(
    "apply patch",
    () => {
      const doc = from(documentData);
      const patches = [
        {
          action: "insert",
          path: ["array", 2],
          values: ["there", "my"],
        } as InsertPatch,
      ];

      change(doc, (doc) => {
        patch(doc, patches[0]);
      });
    },
    options
  );
});

describe("Array Insert - Deeply Nested", () => {
  bench(
    "array push",
    () => {
      const doc = from(documentData);
      change(doc, (doc) => {
        doc.deeply.nested.object.with.a.long.path.push("there", "my");
      });
    },
    options
  );

  bench(
    "apply patch",
    () => {
      const doc = from(documentData);
      const patches = [
        {
          action: "insert",
          path: ["deeply", "nested", "object", "with", "a", "long", "path", 2],
          values: ["there", "my"],
        } as InsertPatch,
      ];

      change(doc, (doc) => {
        patch(doc, patches[0]);
      });
    },
    options
  );
});

describe("Array Insert - next", () => {
  bench(
    "array push",
    () => {
      const doc = next.from(documentDataWithoutText);
      next.change(doc, (doc) => {
        doc.array.push("there", "my");
      });
    },
    options
  );

  bench(
    "insertAt",
    () => {
      const doc = next.from(documentDataWithoutText);
      next.change(doc, (doc) => {
        insertAt(doc.array, 2, "there", "my");
      });
    },
    options
  );

  bench(
    "array splice",
    () => {
      const doc = next.from(documentDataWithoutText);
      next.change(doc, (doc) => {
        doc.array.splice(2, 0, "there", "my");
      });
    },
    options
  );

  bench(
    "apply patch",
    () => {
      const doc = next.from(documentDataWithoutText);
      const patches = [
        {
          action: "insert",
          path: ["array", 2],
          values: ["there", "my"],
        } as InsertPatch,
      ];

      next.change(doc, (doc) => {
        patch(doc, patches[0]);
      });
    },
    options
  );
});
