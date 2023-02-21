import {
  type Doc,
  type Extend,
  List,
  type Patch,
  Text,
  unstable,
} from "@automerge/automerge";
import { getProperty, setProperty } from "dot-prop";
import { isPlainObject } from "./helpers";

export function patch<T>(doc: Extend<T>, patch: Patch) {
  if (patch.action === "insert") {
    const [index, ...path] = [...patch.path].reverse();

    const value = getProperty(doc, path.reverse().join(".")) as
      | Text
      | List<any>;

    value.insertAt(Number(index), ...patch.values);

    return;
  }

  if (patch.action === "del") {
    const [index, ...path] = [...patch.path].reverse();

    const value: any = getProperty(doc, path.reverse().join("."));

    if (typeof value === "string") {
      unstable.splice(
        doc as Doc<T>,
        path.join("/"),
        index as number,
        patch.length || 1
      );

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
    setProperty(doc as Doc<T>, patch.path.join("."), patch.value);
    return;
  }

  if (patch.action === "inc") {
    const value: any = getProperty(doc, patch.path.join("."));
    value.increment(patch.value);
    return;
  }

  if (patch.action === "splice") {
    unstable.splice(
      doc as Doc<T>,
      patch.path.slice(0, -1).join("/"),
      patch.path.at(-1) as number,
      0,
      patch.value
    );

    return;
  }

  throw new Error(`Unknown patch action: ${(patch as any).action}`);
}
