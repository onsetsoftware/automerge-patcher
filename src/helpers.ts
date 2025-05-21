import { Doc, Prop, next, isImmutableString } from "@automerge/automerge/slim";

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
    !(arg instanceof Date) &&
    baseIsPlainObject(arg) &&
    !isImmutableString(arg) &&
    !Array.isArray(arg)
  );
}

const replacerReviver = () => {
  // we hard code a random uuid to avoid collisions
  const dateUuid = "a4c5c0bf-a658-4af9-a1ad-efeb7f10c793";
  const bytesUuid = "7ae7efe9-84c6-4c7c-906f-0985b55c6644";
  return [
    function (this: Record<string, unknown>, k: string) {
      const v: unknown = this[k];
      if (v instanceof Date) {
        return `${dateUuid}-${v.getTime()}`;
      }
      if (isBytes(v)) {
        return [bytesUuid, v.toString()];
      }
      if (
        typeof v === "object" &&
        v !== null &&
        "toJSON" in v &&
        typeof v.toJSON === "function"
      ) {
        return v.toJSON();
      }
      return v;
    },
    (_: string, v: unknown) => {
      if (Array.isArray(v) && v[0] === bytesUuid) {
        return new Uint8Array(v[1].split(",").map(Number));
      }
      if (typeof v === "string" && v.startsWith(dateUuid)) {
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

export function isTextObject(arg: any): arg is string {
  return typeof arg === "string";
}

export function isBytes(arg: any): arg is Uint8Array {
  return arg instanceof Uint8Array;
}

export function getProperty<T extends Doc<T>>(
  doc: T,
  path: string[] | Prop[],
  defaultValue?: any,
): any {
  return path.reduce((acc, key) => acc?.[key as keyof T], doc) ?? defaultValue;
}

export function setProperty<T extends object>(
  doc: T | Doc<T>,
  path: string[] | Prop[],
  value: any,
): T {
  const segments = path.slice() as unknown as (keyof T)[];
  const lastKey = segments.pop();

  let target: any = doc;

  for (let i = 0; i < segments.length; i++) {
    const key = segments[i];
    if (!(key in target)) {
      target[key] = {};
    }
    target = target[key];
  }

  if (lastKey) {
    target[lastKey] = value;
  }

  return doc;
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
