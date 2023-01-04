import { Patch } from "@automerge/automerge";
import { pick, set } from "dot-object";
import { isPlainObject } from "is-plain-object";
import { TempIncPatch } from "./index";

export function patch(doc: any, patch: Patch | TempIncPatch) {
  if (patch.action === "splice") {
    const [index, ...path] = [...patch.path].reverse();

    const value = pick(path.reverse().join("."), doc);

    value.insertAt(Number(index), ...patch.values);

    return;
  }

  if (patch.action === "del") {
    const [index, ...path] = [...patch.path].reverse();

    const value = pick(path.reverse().join("."), doc);
    
    if (isPlainObject(value)) {
      delete value[index];
      return;
    }
    
    value.deleteAt(Number(index), patch.length || 1);

    return;
  }
  

  if (patch.action === "put") {
    set(patch.path.join("."), patch.value, doc);
    return;
  }
  
  if (patch.action === "inc") {
    const value = pick(patch.path.join("."), doc);
    value.increment(patch.value);
    return;
  }
  
  throw new Error(`Unknown patch action: ${(patch as any).action}`);
}
