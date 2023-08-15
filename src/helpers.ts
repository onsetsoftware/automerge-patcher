import { Doc, Prop, Text } from "@automerge/automerge";
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

export function clone<T>(arg: T): T {
  return JSON.parse(JSON.stringify(arg));
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
