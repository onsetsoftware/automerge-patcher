import { type Doc, type Patch, unstable } from "@automerge/automerge";
import { getProperty, setProperty } from "dot-prop";
import { isPlainObject } from "./helpers";
import { InsertPatch } from "./index";

export function patch<T>(doc: Doc<T>, patch: Patch | InsertPatch) {
  if (patch.action === "insert") {
    const [index, ...path] = [...patch.path].reverse();

    const value: any = getProperty(doc, path.reverse().join("."));

    value.insertAt(Number(index), ...patch.values);

    return;
  }

  if (patch.action === "del") {
    const [index, ...path] = [...patch.path].reverse();

    const value: any = getProperty(doc, path.reverse().join("."));

    if (typeof value === "string") {
      unstable.splice(doc, path.join("/"), index as number, patch.length || 1);

      return;
    }

    if (isPlainObject(value)) {
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

  if (patch.action === "splice") {
    unstable.splice(
      doc,
      patch.path.slice(0, -1).join("/"),
      patch.path.at(-1) as number,
      0,
      patch.value
    );

    return;
  }

  throw new Error(`Unknown patch action: ${(patch as any).action}`);
}
