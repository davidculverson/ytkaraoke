import {
  m as o,
  n,
  p as r
} from "./_deps/L7MGDOHJ.js";

// src/convex/_generated/api.js
var e = o, p = r();

// src/convex/crons.ts
var t = n();
t.hourly(
  "clean expired rooms",
  { minuteUTC: 0 },
  e.rooms.manage.cleanExpiredRooms
);
var a = t;
export {
  a as default
};
//# sourceMappingURL=crons.js.map
