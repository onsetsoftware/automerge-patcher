import { type Doc, type Patch, Text } from "@automerge/automerge";
import { getProperty, setProperty } from "dot-prop";
import { isPlainObject } from "./helpers";

export function patch<T>(doc: Doc<T>, patch: Patch) {
  if (patch.action === "splice") {
    const [index, ...path] = [...patch.path].reverse();

    const value: any = getProperty(doc, path.reverse().join("."));

    value.insertAt(Number(index), ...patch.values);

    return;
  }

  if (patch.action === "del") {
    const [index, ...path] = [...patch.path].reverse();

    const value: any = getProperty(doc, path.reverse().join("."));

    if (isPlainObject(value) && !(value instanceof Text)) {
      delete value[index];
      return;
    }

    value.deleteAt(Number(index), patch.length || 1);

    return;
  }

  if (patch.action === "put") {
    setProperty(doc, patch.path.join("."), patch.value);
    return;
  }

  if (patch.action === "inc") {
    const value: any = getProperty(doc, patch.path.join("."));
    value.increment(patch.value);
    return;
  }

  throw new Error(`Unknown patch action: ${(patch as any).action}`);
}
