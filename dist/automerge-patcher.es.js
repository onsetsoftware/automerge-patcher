import { Text as v } from "@automerge/automerge";
import { pick as o, set as f } from "dot-object";
import { isPlainObject as l } from "is-plain-object";
const g = (r, e) => {
  if (e.action === "splice")
    return {
      action: "del",
      path: e.path,
      length: e.values.length
    };
  if (e.action === "del") {
    const [n, ...i] = [...e.path].reverse(), t = o(i.reverse().join("."), r) || r;
    if (l(t))
      return {
        action: "put",
        path: e.path,
        conflict: !1,
        value: t[n]
      };
    const u = e.length || 1;
    return {
      action: "splice",
      path: e.path,
      values: t instanceof v ? [...Array(u)].map((s, a) => t.get(Number(n) + a)) : [...Array(u)].map((s, a) => t[Number(n) + a])
    };
  }
  if (e.action === "put") {
    const n = o(e.path.join("."), r);
    return n ? {
      action: "put",
      path: e.path,
      conflict: !1,
      value: JSON.parse(JSON.stringify(n))
    } : {
      action: "del",
      path: e.path
    };
  }
  if (e.action === "inc")
    return {
      action: "inc",
      path: e.path,
      value: -e.value
    };
  throw new Error(`Unknown patch action: ${e.action}`);
};
function j(r, e) {
  if (e.action === "splice") {
    const [n, ...i] = [...e.path].reverse();
    o(i.reverse().join("."), r).insertAt(Number(n), ...e.values);
    return;
  }
  if (e.action === "del") {
    const [n, ...i] = [...e.path].reverse(), t = o(i.reverse().join("."), r);
    if (l(t)) {
      delete t[n];
      return;
    }
    t.deleteAt(Number(n), e.length || 1);
    return;
  }
  if (e.action === "put") {
    f(e.path.join("."), e.value, r);
    return;
  }
  if (e.action === "inc") {
    o(e.path.join("."), r).increment(e.value);
    return;
  }
  throw new Error(`Unknown patch action: ${e.action}`);
}
export {
  j as patch,
  g as unpatch
};
