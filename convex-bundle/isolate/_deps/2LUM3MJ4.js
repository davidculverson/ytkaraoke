import {
  b as q,
  c as P
} from "./4ONYFKAR.js";
import {
  a as c,
  e as $,
  f
} from "./L7MGDOHJ.js";

// node_modules/convex-helpers/index.js
function S(o, e) {
  return Object.fromEntries(Object.entries(o).filter(([t]) => e.includes(t)));
}
c(S, "pick");
function V(o, e) {
  return Object.fromEntries(Object.entries(o).filter(([t]) => !e.includes(t)));
}
c(V, "omit");
var U = Symbol();

// node_modules/convex-helpers/validators.js
var K = f.string(), N = f.float64(), X = f.float64(), Y = f.boolean(), Z = f.int64(), W = f.int64(), D = f.any(), v = f.null(), { id: ee, object: te, array: ne, bytes: re, literal: oe, optional: ie, union: se } = f, ce = f.bytes();
function g(o, e) {
  let t = $(o);
  if (Object.keys(e).length === 0)
    return t;
  switch (t.kind) {
    case "object":
      return f.object(B(t.fields, e));
    case "union":
      return f.union(...t.members.map((i) => g(i, e)));
    default:
      throw new Error("Cannot add arguments to a validator that is not an object or union.");
  }
}
c(g, "addFieldsToValidator");
function B(o, e) {
  let t = { ...o };
  for (let [i, l] of Object.entries(e)) {
    let a = t[i];
    if (a) {
      if (a.kind !== l.kind)
        throw new Error(`Cannot intersect validators with different kinds: ${a.kind} and ${l.kind}`);
      a.isOptional !== l.isOptional && a.isOptional === "optional" && (t[i] = l);
    } else
      t[i] = l;
  }
  return t;
}
c(B, "intersectValidators");
var ae = f.optional(f.any());

// node_modules/convex-helpers/server/customFunctions.js
function j(o) {
  return {
    args: {},
    input: /* @__PURE__ */ c(async (e, t, i) => ({
      ctx: await o(e, i),
      args: {}
    }), "input")
  };
}
c(j, "customCtx");
var C = {
  args: {},
  input() {
    return { args: {}, ctx: {} };
  }
};
function _(o, e) {
  return z(o, e);
}
c(_, "customMutation");
function z(o, e) {
  let t = e.input ?? C.input, i = e.args ?? C.args;
  return /* @__PURE__ */ c(function(a) {
    let { args: w, handler: p = a, returns: y, ...h } = a;
    if (w)
      return o({
        args: g(w, i),
        returns: y,
        handler: /* @__PURE__ */ c(async (n, r) => {
          let s = await t(n, S(r, Object.keys(i)), h), u = V(r, Object.keys(i)), d = { ...n, ...s.ctx }, m = { ...u, ...s.args }, I = await p(d, m);
          return s.onSuccess && await s.onSuccess({ ctx: n, args: u, result: I }), I;
        }, "handler")
      });
    if (Object.keys(i).length > 0)
      throw new Error("If you're using a custom function with arguments for the input customization, you must declare the arguments for the function too.");
    return o({
      returns: a.returns,
      handler: /* @__PURE__ */ c(async (n, r) => {
        let s = await t(n, r, h), u = { ...n, ...s.ctx }, d = { ...r, ...s.args }, m = await p(u, d);
        return s.onSuccess && await s.onSuccess({ ctx: n, args: r, result: m }), m;
      }, "handler")
    });
  }, "customBuilder");
}
c(z, "customFnBuilder");

// node_modules/convex-helpers/server/triggers.js
var b = class {
  static {
    c(this, "Triggers");
  }
  registered = {};
  register(e, t) {
    this.registered[e] || (this.registered[e] = []), this.registered[e].push(t);
  }
  wrapDB = /* @__PURE__ */ c((e) => ({ ...e, db: A(e, e.db, this) }), "wrapDB");
}, x = class {
  static {
    c(this, "Lock");
  }
  promise = null;
  resolve = null;
  async withLock(e) {
    let t = await this._lock();
    try {
      return await e();
    } finally {
      t();
    }
  }
  async _lock() {
    for (; this.promise !== null; )
      await this.promise;
    return [this.promise, this.resolve] = this._newLock(), () => {
      this.promise = null, this.resolve?.();
    };
  }
  _newLock() {
    let e;
    return [new Promise((i) => {
      e = i;
    }), () => e()];
  }
}, L = new x(), T = new x(), F = [];
function A(o, e, t, i = !1) {
  let l = /* @__PURE__ */ c(async (n, r, s) => {
    let [u, d, m] = s !== void 0 ? [n, r, s] : [O(e, t.registered, n), n, r];
    return await a(u, d, m);
  }, "patch");
  async function a(n, r, s) {
    return n ? await k(o, e, t, n, i, async () => {
      let u = await e.get(r);
      await e.patch(n, r, s);
      let d = await e.get(r);
      return [void 0, { operation: "update", id: r, oldDoc: u, newDoc: d }];
    }) : await e.patch(r, s);
  }
  c(a, "_patch");
  let w = /* @__PURE__ */ c(async (n, r, s) => {
    let [u, d, m] = s !== void 0 ? [n, r, s] : [O(e, t.registered, n), n, r];
    return await p(u, d, m);
  }, "replace");
  async function p(n, r, s) {
    return n ? await k(o, e, t, n, i, async () => {
      let u = await e.get(r);
      await e.replace(n, r, s);
      let d = await e.get(r);
      return [void 0, { operation: "update", id: r, oldDoc: u, newDoc: d }];
    }) : await e.replace(r, s);
  }
  c(p, "_replace");
  let y = /* @__PURE__ */ c(async (n, r) => {
    let [s, u] = r !== void 0 ? [n, r] : [O(e, t.registered, n), n];
    return await h(s, u);
  }, "delete_");
  async function h(n, r) {
    return n ? await k(o, e, t, n, i, async () => {
      let s = await e.get(r);
      return await e.delete(n, r), [void 0, { operation: "delete", id: r, oldDoc: s, newDoc: null }];
    }) : await e.delete(r);
  }
  return c(h, "_delete"), {
    insert: /* @__PURE__ */ c(async (n, r) => t.registered[n] ? await k(o, e, t, n, i, async () => {
      let s = await e.insert(n, r), u = await e.get(s);
      return [s, { operation: "insert", id: s, oldDoc: null, newDoc: u }];
    }) : await e.insert(n, r), "insert"),
    patch: l,
    replace: w,
    delete: y,
    system: e.system,
    get: e.get,
    query: e.query,
    normalizeId: e.normalizeId
  };
}
c(A, "writerWithTriggers");
function O(o, e, t) {
  for (let i of Object.keys(e))
    if (o.normalizeId(i, t))
      return i;
  return null;
}
c(O, "_tableNameFromId");
async function M(o, e, t, i, l) {
  return await L.withLock(async () => {
    let [a, w] = await l(), p = {
      ...o,
      db: A(o, e, t, !0),
      innerDb: e
    };
    for (let y of t.registered[i] ?? [])
      F.push(async () => {
        await y(p, w);
      });
    return a;
  });
}
c(M, "_queueTriggers");
async function k(o, e, t, i, l, a) {
  return l ? await M(o, e, t, i, a) : await T.withLock(async () => {
    let w = await M(o, e, t, i, a), p = null;
    for (; F.length > 0; ) {
      let y = F.shift();
      try {
        await y();
      } catch (h) {
        p ? console.error(h) : p = h;
      }
    }
    if (p !== null)
      throw p;
    return w;
  });
}
c(k, "_execThenTrigger");

// src/convex/functions.ts
var E = new b();
E.register("rooms", async (o, e) => {
  if (e.operation === "delete")
    for await (let t of o.db.query("queuedSongs").withIndex("by_room_type", (i) => i.eq("room", e.id)))
      await o.db.delete(t._id);
});
var xe = _(q, j(E.wrapDB)), ge = _(
  P,
  j(E.wrapDB)
);

export {
  xe as a,
  ge as b
};
//# sourceMappingURL=2LUM3MJ4.js.map
