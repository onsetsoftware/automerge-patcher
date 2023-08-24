import {
  Patch,
  PatchInfo,
  deleteAt,
  insertAt,
  next,
} from "@automerge/automerge";
import { bench, describe } from "vitest";
import { unpatchAll } from "../src/unpatch";

type DataType = {
  values: string[];
};
describe.only("unpatch all", () => {
  const doc = next.from<DataType>({
    values: ["oh", "you", "pretty", "things", "don't", "you", "know"],
  });

  const patches: Patch[] = [];
  let patchInfo: PatchInfo<DataType>;
  next.change(
    doc,
    {
      patchCallback: (p, info) => {
        patchInfo = info;
        patches.push(...p);
      },
    },
    (doc) => {
      insertAt(doc.values, 0, "things");
      deleteAt(doc.values, 4);
    }
  );

  bench("unpatch all", () => {
    unpatchAll(patchInfo.before, patches);
  });

  bench("diff", () => {
    next.diff(
      patchInfo.after,
      next.getHeads(patchInfo.after),
      next.getHeads(doc)
    );
  });
});
