import {
  Text,
  insertAt,
  next,
  type Doc,
  type Patch,
  isAutomerge,
} from "@automerge/automerge";

import {
  getProperty,
  isPlainObject,
  isTextObject,
  setProperty,
} from "./helpers";

export function patch<T>(doc: Doc<T>, patch: Patch) {
  const automerge = isAutomerge(doc);

  if (patch.action === "insert") {
    const [index, ...path] = [...patch.path].reverse();

    const value = getProperty(doc, path.reverse().join(".")) as
      | string
      | Text
      | any[];

    if (typeof value === "string") {
      if (automerge) {
        setProperty(
          doc,
          path.reverse().join("."),
          new Text(
            value.slice(0, Number(index)) +
              patch.values.join("") +
              value.slice(Number(index)),
          ),
        );
      } else {
        setProperty(
          doc,
          path.reverse().join("."),
          value.slice(0, Number(index)) +
            patch.values.join("") +
            value.slice(Number(index)),
        );
      }
      return;
    }

    if (isTextObject(value)) {
      value.insertAt(Number(index), ...patch.values);
      return;
    }

    if (automerge) {
      insertAt(value, Number(index), ...patch.values);
    } else {
      value.splice(Number(index), 0, ...patch.values);
    }
    return;
  }

  if (patch.action === "del") {
    const [index, ...path] = [...patch.path].reverse();

    const value: any = path.length
      ? getProperty(doc, path.reverse().join("."))
      : doc;

    if (typeof value === "string") {
      if (automerge) {
        next.splice(doc, path, index as number, patch.length || 1);
      } else {
        setProperty(
          doc,
          path.join("."),
          value.substring(0, Number(index)) +
            value.substring(Number(index) + (patch.length || 1)),
        );
      }

      return;
    }

    if (isPlainObject(value)) {
      delete value[index];
      return;
    }

    if (automerge) {
      value.deleteAt(Number(index), patch.length || 1);
    } else {
      value.splice(Number(index), patch.length || 1);
    }

    return;
  }

  if (patch.action === "put") {
    setProperty(doc, patch.path.join("."), patch.value);
    return;
  }

  if (patch.action === "inc") {
    let value: any = getProperty(doc, patch.path.join("."));
    if (automerge) {
      value.increment(patch.value);
    } else {
      value = Number(value);
      setProperty(doc, patch.path.join("."), value + patch.value);
    }
    return;
  }

  if (patch.action === "splice") {
    const [index, ...path] = [...patch.path].reverse();
    if (automerge) {
      next.splice(doc, path.reverse(), index as number, 0, patch.value);
    } else {
      const value: any = getProperty(doc, path.reverse().join("."));

      setProperty(
        doc,
        path.join("."),
        value.substring(0, Number(index)) +
          patch.value +
          value.substring(Number(index)),
      );
    }

    return;
  }

  throw new Error(`Unknown patch action: ${(patch as any).action}`);
}
