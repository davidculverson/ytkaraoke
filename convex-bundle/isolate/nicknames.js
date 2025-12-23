import {
  a as i
} from "./_deps/2LUM3MJ4.js";
import {
  b as a
} from "./_deps/Q3YUI55I.js";
import {
  a as o
} from "./_deps/4ONYFKAR.js";
import {
  a as t,
  f as s
} from "./_deps/L7MGDOHJ.js";

// src/convex/nicknames.ts
var k = i({
  args: {
    nickname: s.string()
  },
  handler: /* @__PURE__ */ t(async (r, e) => {
    let n = await a(r);
    if (!n)
      throw new Error("User not found");
    if (e.nickname.length < 3 || e.nickname.length > 16)
      throw new Error("Nickname must be between 3 and 16 characters long");
    await r.db.patch(n, {
      nickname: e.nickname
    });
  }, "handler")
}), h = o({
  handler: /* @__PURE__ */ t(async (r) => {
    let e = await a(r);
    return e ? (await r.db.get(e))?.nickname : null;
  }, "handler")
}), w = o({
  args: {
    userId: s.id("users")
  },
  handler: /* @__PURE__ */ t(async (r, e) => (await r.db.get(e.userId))?.nickname, "handler")
});
export {
  h as getNickname,
  w as getNicknameByUserId,
  k as setNickname
};
//# sourceMappingURL=nicknames.js.map
