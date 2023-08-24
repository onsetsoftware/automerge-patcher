import { Doc, Prop, Text, next } from "@automerge/automerge";
import { Path, getByPath, setByPath } from "dot-path-value";

function baseIsPlainObject(arg: any): arg is Record<string, any> {
  if (arg == null || typeof arg !== "object") {
    return false;
  }
  const proto = Object.getPrototypeOf(arg);
  if (proto == null) {
    return true;
  }
  return proto === Object.prototype;
}

export function isPlainObject(arg: any): arg is Record<Prop, any> {
  return (
    baseIsPlainObject(arg) &&
    !isTextObject(arg) &&
    !(arg instanceof Date) &&
    !Array.isArray(arg)
  );
}

const replacerReviver = () => {
  // we hard code a randon uuid to avoid collisions
  const uuid = "a4c5c0bf-a658-4af9-a1ad-efeb7f10c793";
  return [
    function (this: Record<string, unknown>, k: string) {
      const v: unknown = this[k];
      if (v instanceof Date) {
        return `${uuid}-${v.getTime()}`;
      }
      return v;
    },
    (_: string, v: unknown) => {
      if (typeof v === "string" && v.startsWith(uuid)) {
        return new Date(parseInt(v.slice(v.lastIndexOf("-") + 1), 10));
      }
      return v;
    },
  ];
};

const [replacer, reviver] = replacerReviver();

export function clone<T>(arg: T): T {
  return JSON.parse(JSON.stringify(arg, replacer), reviver);
}

export function isTextObject(arg: any): arg is Text {
  return arg instanceof Text;
}

export function getProperty<T extends Doc<T>>(
  doc: T,
  path: string,
  defaultValue?: any
): any {
  return getByPath(doc, path as Path<T>) ?? defaultValue;
}

export function setProperty<T>(doc: T | Doc<T>, path: string, value: any): T {
  return setByPath(doc as Record<string, any>, path, value) as T;
}

// this is a hack for now, but will look to introduce a 1st party function in automerge
export function isNext(doc: Doc<unknown>) {
  try {
    next.getConflicts(doc, "");
  } catch (e) {
    return false;
  }
  return true;
}
