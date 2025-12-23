import {
  a as l,
  b as u
} from "../_deps/2LUM3MJ4.js";
import {
  b as i
} from "../_deps/Q3YUI55I.js";
import {
  a as d
} from "../_deps/4ONYFKAR.js";
import {
  a,
  f as n
} from "../_deps/L7MGDOHJ.js";

// src/convex/rooms/manage.ts
var p = l({
  args: {
    maxSongsPerUser: n.number(),
    fallbackSongs: n.optional(
      n.array(
        n.object({
          videoId: n.string(),
          title: n.string(),
          artist: n.string(),
          duration: n.number()
        })
      )
    )
  },
  handler: /* @__PURE__ */ a(async (t, o) => {
    let r = await i(t);
    if (!r)
      throw new Error("User not found");
    let e;
    do
      e = f(4);
    while (await t.db.query("rooms").withIndex("by_code", (c) => c.eq("code", e)).unique());
    let s = await t.db.insert("rooms", {
      host: r,
      code: e,
      expiresAt: Date.now() + 1e3 * 60 * 60 * 48,
      // 48 hours
      settings: {
        maxSongsPerUser: o.maxSongsPerUser
      }
    });
    return o.fallbackSongs && await m(t, s, o.fallbackSongs), { roomId: s, code: e };
  }, "handler")
}), y = d({
  handler: /* @__PURE__ */ a(async (t) => {
    let o = await i(t);
    return o ? await t.db.query("rooms").withIndex("by_host", (r) => r.eq("host", o)).collect() : null;
  }, "handler")
});
async function m(t, o, r) {
  for (let e of r.slice(0, 100))
    await t.db.insert("queuedSongs", {
      room: o,
      type: "fallback",
      videoId: e.videoId,
      title: e.title,
      artist: e.artist,
      duration: e.duration
    });
}
a(m, "addFallbackSongs");
var x = u({
  handler: /* @__PURE__ */ a(async (t) => {
    let o = await t.db.query("rooms").withIndex("by_expires_at", (r) => r.lt("expiresAt", Date.now())).collect();
    for (let r of o)
      await t.db.delete(r._id);
  }, "handler")
});
function f(t) {
  let o = "", r = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789", e = r.length;
  for (let s = 0; s < t; s++)
    o += r.charAt(
      Math.floor(Math.random() * e)
    );
  return o;
}
a(f, "generateRoomCode");
export {
  x as cleanExpiredRooms,
  p as createRoom,
  y as listOwnRooms
};
//# sourceMappingURL=manage.js.map
