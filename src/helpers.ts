import { isPlainObject as baseIsPlainObject } from "is-plain-object";
import { Text, Counter } from "@automerge/automerge";

export function isPlainObject(arg: any): boolean {
  return (
    baseIsPlainObject(arg) &&
    !(arg instanceof Text) &&
    !(arg instanceof Date) &&
    !(arg instanceof Counter)
  );
}
