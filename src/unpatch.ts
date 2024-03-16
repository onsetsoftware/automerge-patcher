import {
  type Doc,
  type Patch,
  type Prop,
  type Text,
} from "@automerge/automerge";
import { clone, getProperty, isTextObject } from "./helpers";
import { patch } from "./patch";

const pathChanged = (
  path: Prop[],
  before: Doc<any>,
  after: Doc<any>,
): boolean => {
  const beforeValue = getProperty(before, path, before);
  const afterValue = getProperty(after, path, after);

  return JSON.stringify(beforeValue) === JSON.stringify(afterValue);
};

export const filterRedundantPatches = <T>(
  patches: Patch[],
  before: Doc<T>,
  after: Doc<T>,
): Patch[] => {
  return patches.filter((patch) => {
    if (patch.action === "del" || patch.action === "splice") {
      const [_, ...path] = [...patch.path].reverse();
      return !pathChanged(path.reverse(), before, after);
    }

    if (
      patch.action === "put" ||
      patch.action === "insert" ||
      patch.action === "inc"
    ) {
      return !pathChanged(patch.path, before, after);
    }

    return true;
  });
};

export const unpatch = <T>(doc: Doc<T>, patch: Patch): Patch => {
  if (patch.action === "insert") {
    return {
      action: "del",
      path: patch.path,
      length: patch.values.length,
    };
  }

  if (patch.action === "del") {
    const [index, ...path] = [...patch.path].reverse();

    const value = getProperty(doc, path.reverse(), doc) as
      | Record<Prop, any>
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
        value: clone(value[index]),
      };
    }

    const length = patch.length || 1;

    return {
      action: "insert",
      path: patch.path,
      values: isTextObject(value)
        ? [...Array(length)].map((_, i) => value.get(Number(index) + i))
        : [...Array(length)].map((_, i) => clone(value[Number(index) + i])),
    };
  }

  if (patch.action === "put") {
    const value = getProperty(doc, patch.path);

    if (value !== undefined) {
      return {
        action: "put",
        path: patch.path,
        conflict: false,
        value: clone(value),
      };
    } else {
      // getProperty cannot look up the value of text on put actions,
      // so handle that case separately here.
      const parent = getProperty(doc, patch.path.slice(0, -1));
      const lastPart = patch.path[patch.path.length - 1];
      if (isTextObject(parent) && typeof lastPart === "number") {
        return {
          action: "put",
          path: patch.path,
          conflict: false,
          value: parent.get(lastPart),
        };
      }

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

  throw new Error(`Unknown patch action: ${patch.action}`);
};

export const unpatchAll = <T>(beforeDoc: Doc<T>, patches: Patch[]): Patch[] => {
  const copy = clone(beforeDoc);

  const inverse: Patch[] = [];

  patches.forEach((p) => {
    inverse.push(unpatch(copy, p));
    patch(copy, p);
  });

  return inverse.reverse();
};
