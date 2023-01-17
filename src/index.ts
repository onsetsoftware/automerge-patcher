import { Prop } from "@automerge/automerge";

export { unpatch } from "./unpatch";
export { patch } from "./patch";

type Value = string | number | boolean | null | Date | Uint8Array;

export type InsertPatch = {
  action: "insert";
  path: Prop[];
  values: Value[];
};
