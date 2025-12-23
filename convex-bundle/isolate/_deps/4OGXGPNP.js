import {
  a as n,
  b as s,
  c as i
} from "./Q3YUI55I.js";
import {
  a as u
} from "./4ONYFKAR.js";
import {
  a as o
} from "./L7MGDOHJ.js";

// node_modules/@convex-dev/auth/dist/providers/ConvexCredentials.js
function a(r) {
  return {
    id: "credentials",
    type: "credentials",
    authorize: /* @__PURE__ */ o(async () => null, "authorize"),
    // @ts-expect-error Internal
    options: r
  };
}
o(a, "ConvexCredentials");

// node_modules/@convex-dev/auth/dist/providers/Anonymous.js
function d(r = {}) {
  let t = r.id ?? "anonymous";
  return a({
    id: "anonymous",
    authorize: /* @__PURE__ */ o(async (m, e) => {
      let p = r.profile?.(m, e) ?? { isAnonymous: !0 }, { user: c } = await i(e, {
        provider: t,
        account: { id: crypto.randomUUID() },
        profile: p
      });
      return { userId: c._id };
    }, "authorize"),
    ...r
  });
}
o(d, "Anonymous");

// src/convex/auth.ts
var { auth: U, signIn: g, signOut: w, store: z, isAuthenticated: b } = n({
  providers: [d]
}), q = u({
  handler: /* @__PURE__ */ o(async (r) => {
    let t = await s(r);
    return t ? await r.db.get(t) : null;
  }, "handler")
});

export {
  U as a,
  g as b,
  w as c,
  z as d,
  b as e,
  q as f
};
//# sourceMappingURL=4OGXGPNP.js.map
