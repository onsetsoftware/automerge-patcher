import { Text } from "@automerge/automerge";

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

export function isPlainObject(arg: any): arg is Record<string, any> {
  return (
    baseIsPlainObject(arg) &&
    !isTextObject(arg) &&
    !(arg instanceof Date) &&
    !Array.isArray(arg)
  );
}

export function isTextObject(arg: any): arg is Text {
  return arg instanceof Text;
}
