import {
  a as m
} from "./_deps/2LUM3MJ4.js";
import {
  b as i
} from "./_deps/Q3YUI55I.js";
import {
  a as u
} from "./_deps/4ONYFKAR.js";
import {
  a,
  f as d
} from "./_deps/L7MGDOHJ.js";

// src/convex/rooms.ts
var p = u({
  args: {
    roomId: d.id("rooms"),
    cursor: d.optional(d.string()),
    numItems: d.optional(d.number())
  },
  handler: /* @__PURE__ */ a(async (e, o) => {
    let r = await e.db.query("queuedSongs").withIndex("by_room_type", (t) => t.eq("room", o.roomId)).order("asc").take(o.numItems ?? 5);
    return await Promise.all(
      r.map(async (t) => {
        if (!t.addedBy)
          return {
            ...t,
            addedByNickname: void 0
          };
        let n = await e.db.get(t.addedBy);
        return {
          ...t,
          addedByNickname: n?.nickname
        };
      })
    );
  }, "handler")
}), S = u({
  args: {
    code: d.string()
  },
  handler: /* @__PURE__ */ a(async (e, o) => {
    let r = await e.db.query("rooms").withIndex("by_code", (n) => n.eq("code", o.code)).unique();
    if (!r)
      return null;
    let t = r?.currentSong?.addedBy ? await e.db.get(r.currentSong.addedBy) : null;
    return {
      ...r,
      currentSong: r.currentSong ? {
        ...r.currentSong,
        addedByNickname: t?.nickname
      } : null
    };
  }, "handler")
}), q = u({
  args: {
    roomId: d.id("rooms")
  },
  handler: /* @__PURE__ */ a(async (e, o) => {
    let r = await i(e);
    if (!r)
      return !1;
    let t = await e.db.get(o.roomId);
    if (!t)
      throw new Error("Room not found");
    return t.host === r;
  }, "handler")
}), B = u({
  args: {
    roomId: d.id("rooms")
  },
  handler: /* @__PURE__ */ a(async (e, o) => {
    let r = await e.db.get(o.roomId);
    if (!r)
      throw new Error("Room not found");
    let t = await i(e);
    if (!t)
      return null;
    let n = await e.db.query("queuedSongs").withIndex(
      "by_added_by_room",
      (s) => s.eq("addedBy", t).eq("room", o.roomId)
    ).collect();
    return r.settings.maxSongsPerUser - n.length;
  }, "handler")
}), _ = m({
  args: {
    roomId: d.id("rooms"),
    videoId: d.string(),
    title: d.string(),
    artist: d.string(),
    duration: d.number()
  },
  handler: /* @__PURE__ */ a(async (e, o) => {
    let r = await i(e);
    if (!r)
      throw new Error("User not found");
    let t = await e.db.get(o.roomId);
    if (!t)
      throw new Error("Room not found");
    if ((await e.db.query("queuedSongs").withIndex(
      "by_added_by_room",
      (s) => s.eq("addedBy", r).eq("room", o.roomId)
    ).collect()).length >= t.settings.maxSongsPerUser)
      throw new Error("User has reached the maximum number of songs");
    t.currentSong ? await e.db.insert("queuedSongs", {
      room: o.roomId,
      videoId: o.videoId,
      type: "addedByUser",
      addedBy: r,
      title: o.title,
      artist: o.artist,
      duration: o.duration
    }) : await e.db.patch(o.roomId, {
      currentSong: {
        addedBy: r,
        videoId: o.videoId,
        title: o.title,
        artist: o.artist,
        duration: o.duration,
        type: "addedByUser"
      }
    });
  }, "handler")
}), U = m({
  args: {
    roomId: d.id("rooms")
  },
  handler: /* @__PURE__ */ a(async (e, o) => {
    let r = await e.db.get(o.roomId);
    if (!r)
      throw new Error("Room not found");
    let t = await i(e);
    if (!t)
      throw new Error("User not found");
    if (r.host !== t)
      throw new Error("User is not the host of the room");
    let n = await e.db.query("queuedSongs").withIndex("by_room_type", (s) => s.eq("room", o.roomId)).order("asc").first();
    if (n) {
      let { addedBy: s, type: c, videoId: I, title: w, artist: y, duration: l } = n;
      await e.db.patch(o.roomId, {
        currentSong: {
          addedBy: s,
          type: c,
          videoId: I,
          title: w,
          artist: y,
          duration: l
        }
      }), await e.db.delete(n._id);
    } else
      await e.db.patch(o.roomId, {
        currentSong: void 0
      });
  }, "handler")
});
export {
  _ as addSong,
  p as getQueue,
  S as getRoomByCode,
  B as getSongsLeftToAdd,
  q as isHost,
  U as popSong
};
//# sourceMappingURL=rooms.js.map
