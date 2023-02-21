import { type Patch, Text } from "@automerge/automerge";
import { getProperty } from "dot-prop";
import { isTextObject } from "./helpers";

export const unpatch = <T extends Record<string, {}>>(
  doc: T,
  patch: Patch
): Patch => {
  if (patch.action === "insert") {
    return {
      action: "del",
      path: patch.path,
      length: patch.values.length,
    };
  }

  if (patch.action === "del") {
    const [index, ...path] = [...patch.path].reverse();

    const value = getProperty(doc, path.reverse().join("."), doc) as
      | Record<string | number, any>
      | T
      | Text
      | Array<any>
      | string;

    if (typeof value === "string") {
      return {
        action: "splice",
        path: patch.path,
        value: [...Array(patch.length)]
          .map((_, i) => value[Number(index) + i])
          .join(""),
      };
    }

    if (!Array.isArray(value) && !isTextObject(value)) {
      return {
        action: "put",
        path: patch.path,
        conflict: false,
        value: value[index],
      };
    }

    const length = patch.length || 1;

    return {
      action: "insert",
      path: patch.path,
      values: isTextObject(value)
        ? [...Array(length)].map((_, i) => value.get(Number(index) + i))
        : [...Array(length)].map((_, i) => value[Number(index) + i]),
    };
  }

  if (patch.action === "put") {
    const value = getProperty(doc, patch.path.join("."));

    if (value !== undefined) {
      return {
        action: "put",
        path: patch.path,
        conflict: false,
        value: JSON.parse(JSON.stringify(value)),
      };
    } else {
      return {
        action: "del",
        path: patch.path,
      };
    }
  }

  if (patch.action === "inc") {
    return {
      action: "inc",
      path: patch.path,
      value: -patch.value,
    };
  }

  if (patch.action === "splice") {
    return {
      action: "del",
      path: patch.path,
      length: patch.value.length,
    };
  }

  throw new Error(`Unknown patch action: ${(patch as any).action}`);
};
