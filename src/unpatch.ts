import { Patch, Text } from "@automerge/automerge";
import { pick } from "dot-object";
import { isPlainObject } from "is-plain-object";
import { TempIncPatch } from "./index";

export const unpatch = <T extends Record<string, any>>(
  doc: T,
  patch: Patch | TempIncPatch
):  Patch | TempIncPatch => {
  if (patch.action === "splice") {
    return {
      action: "del",
      path: patch.path,
      length: patch.values.length,
    };
  }

  if (patch.action === "del") {
    const [index, ...path] = [...patch.path].reverse();

    const value = pick(path.reverse().join("."), doc) || doc;
    
    if (isPlainObject(value)) {
      return {
        action: "put",
        path: patch.path,
        conflict: false,
        value: value[index],
      };
    }

    const length = patch.length || 1;
    
    return {
      action: "splice",
      path: patch.path,
      values:
        value instanceof Text
          ? [...Array(length)].map((_, i) => value.get(Number(index) + i))
          : [...Array(length)].map((_, i) => value[Number(index) + i]),
    };
  }

  if (patch.action === "put") {
    const value = pick(patch.path.join("."), doc);

    if (value) {
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

  throw new Error(`Unknown patch action: ${(patch as any).action}`);
};
