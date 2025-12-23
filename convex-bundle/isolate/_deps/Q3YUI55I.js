import {
  a as o,
  b as Xo,
  c as uc,
  d as kn,
  f as y,
  g as Yo,
  i as Zo,
  j as Qo,
  k as In,
  l as it
} from "./L7MGDOHJ.js";

// node_modules/@convex-dev/auth/node_modules/cookie/dist/index.js
var oi = Xo((ae) => {
  "use strict";
  Object.defineProperty(ae, "__esModule", { value: !0 });
  ae.parseCookie = ri;
  ae.parse = ri;
  ae.stringifyCookie = mc;
  ae.stringifySetCookie = Wt;
  ae.serialize = Wt;
  ae.parseSetCookie = yc;
  ae.stringifySetCookie = Wt;
  ae.serialize = Wt;
  var ei = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/, ti = /^[\u0021-\u003A\u003C-\u007E]*$/, dc = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i, lc = /^[\u0020-\u003A\u003D-\u007E]*$/, fc = /^-?\d+$/, pc = Object.prototype.toString, hc = /* @__PURE__ */ (() => {
    let e = /* @__PURE__ */ o(function() {
    }, "C");
    return e.prototype = /* @__PURE__ */ Object.create(null), e;
  })();
  function ri(e, t) {
    let r = new hc(), n = e.length;
    if (n < 2)
      return r;
    let i = t?.decode || ni, s = 0;
    do {
      let a = Cn(e, s, n);
      if (a === -1)
        break;
      let c = Tn(e, s, n);
      if (a > c) {
        s = e.lastIndexOf(";", a - 1) + 1;
        continue;
      }
      let d = ge(e, s, a);
      r[d] === void 0 && (r[d] = i(ge(e, a + 1, c))), s = c + 1;
    } while (s < n);
    return r;
  }
  o(ri, "parseCookie");
  function mc(e, t) {
    let r = t?.encode || encodeURIComponent, n = [];
    for (let i of Object.keys(e)) {
      let s = e[i];
      if (s === void 0)
        continue;
      if (!ei.test(i))
        throw new TypeError(`cookie name is invalid: ${i}`);
      let a = r(s);
      if (!ti.test(a))
        throw new TypeError(`cookie val is invalid: ${s}`);
      n.push(`${i}=${a}`);
    }
    return n.join("; ");
  }
  o(mc, "stringifyCookie");
  function Wt(e, t, r) {
    let n = typeof e == "object" ? e : { ...r, name: e, value: String(t) }, s = (typeof t == "object" ? t : r)?.encode || encodeURIComponent;
    if (!ei.test(n.name))
      throw new TypeError(`argument name is invalid: ${n.name}`);
    let a = n.value ? s(n.value) : "";
    if (!ti.test(a))
      throw new TypeError(`argument val is invalid: ${n.value}`);
    let c = n.name + "=" + a;
    if (n.maxAge !== void 0) {
      if (!Number.isInteger(n.maxAge))
        throw new TypeError(`option maxAge is invalid: ${n.maxAge}`);
      c += "; Max-Age=" + n.maxAge;
    }
    if (n.domain) {
      if (!dc.test(n.domain))
        throw new TypeError(`option domain is invalid: ${n.domain}`);
      c += "; Domain=" + n.domain;
    }
    if (n.path) {
      if (!lc.test(n.path))
        throw new TypeError(`option path is invalid: ${n.path}`);
      c += "; Path=" + n.path;
    }
    if (n.expires) {
      if (!wc(n.expires) || !Number.isFinite(n.expires.valueOf()))
        throw new TypeError(`option expires is invalid: ${n.expires}`);
      c += "; Expires=" + n.expires.toUTCString();
    }
    if (n.httpOnly && (c += "; HttpOnly"), n.secure && (c += "; Secure"), n.partitioned && (c += "; Partitioned"), n.priority)
      switch (typeof n.priority == "string" ? n.priority.toLowerCase() : void 0) {
        case "low":
          c += "; Priority=Low";
          break;
        case "medium":
          c += "; Priority=Medium";
          break;
        case "high":
          c += "; Priority=High";
          break;
        default:
          throw new TypeError(`option priority is invalid: ${n.priority}`);
      }
    if (n.sameSite)
      switch (typeof n.sameSite == "string" ? n.sameSite.toLowerCase() : n.sameSite) {
        case !0:
        case "strict":
          c += "; SameSite=Strict";
          break;
        case "lax":
          c += "; SameSite=Lax";
          break;
        case "none":
          c += "; SameSite=None";
          break;
        default:
          throw new TypeError(`option sameSite is invalid: ${n.sameSite}`);
      }
    return c;
  }
  o(Wt, "stringifySetCookie");
  function yc(e, t) {
    let r = t?.decode || ni, n = e.length, i = Tn(e, 0, n), s = Cn(e, 0, i), a = s === -1 ? { name: "", value: r(ge(e, 0, i)) } : {
      name: ge(e, 0, s),
      value: r(ge(e, s + 1, i))
    }, c = i + 1;
    for (; c < n; ) {
      let d = Tn(e, c, n), l = Cn(e, c, d), u = l === -1 ? ge(e, c, d) : ge(e, c, l), f = l === -1 ? void 0 : ge(e, l + 1, d);
      switch (u.toLowerCase()) {
        case "httponly":
          a.httpOnly = !0;
          break;
        case "secure":
          a.secure = !0;
          break;
        case "partitioned":
          a.partitioned = !0;
          break;
        case "domain":
          a.domain = f;
          break;
        case "path":
          a.path = f;
          break;
        case "max-age":
          f && fc.test(f) && (a.maxAge = Number(f));
          break;
        case "expires":
          if (!f)
            break;
          let m = new Date(f);
          Number.isFinite(m.valueOf()) && (a.expires = m);
          break;
        case "priority":
          if (!f)
            break;
          let h = f.toLowerCase();
          (h === "low" || h === "medium" || h === "high") && (a.priority = h);
          break;
        case "samesite":
          if (!f)
            break;
          let p = f.toLowerCase();
          (p === "lax" || p === "strict" || p === "none") && (a.sameSite = p);
          break;
      }
      c = d + 1;
    }
    return a;
  }
  o(yc, "parseSetCookie");
  function Tn(e, t, r) {
    let n = e.indexOf(";", t);
    return n === -1 ? r : n;
  }
  o(Tn, "endIndex");
  function Cn(e, t, r) {
    let n = e.indexOf("=", t);
    return n < r ? n : -1;
  }
  o(Cn, "eqIndex");
  function ge(e, t, r) {
    let n = t, i = r;
    do {
      let s = e.charCodeAt(n);
      if (s !== 32 && s !== 9)
        break;
    } while (++n < i);
    for (; i > n; ) {
      let s = e.charCodeAt(i - 1);
      if (s !== 32 && s !== 9)
        break;
      i--;
    }
    return e.slice(n, i);
  }
  o(ge, "valueSlice");
  function ni(e) {
    if (e.indexOf("%") === -1)
      return e;
    try {
      return decodeURIComponent(e);
    } catch {
      return e;
    }
  }
  o(ni, "decode");
  function wc(e) {
    return pc.call(e) === "[object Date]";
  }
  o(wc, "isDate");
});

// node_modules/cookie/index.js
var Yn = Xo((Xn) => {
  "use strict";
  Xn.parse = yu;
  Xn.serialize = wu;
  var lu = Object.prototype.toString, fu = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/, pu = /^("?)[\u0021\u0023-\u002B\u002D-\u003A\u003C-\u005B\u005D-\u007E]*\1$/, hu = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i, mu = /^[\u0020-\u003A\u003D-\u007E]*$/;
  function yu(e, t) {
    if (typeof e != "string")
      throw new TypeError("argument str must be a string");
    var r = {}, n = e.length;
    if (n < 2) return r;
    var i = t && t.decode || gu, s = 0, a = 0, c = 0;
    do {
      if (a = e.indexOf("=", s), a === -1) break;
      if (c = e.indexOf(";", s), c === -1)
        c = n;
      else if (a > c) {
        s = e.lastIndexOf(";", a - 1) + 1;
        continue;
      }
      var d = Xi(e, s, a), l = Yi(e, a, d), u = e.slice(d, l);
      if (!r.hasOwnProperty(u)) {
        var f = Xi(e, a + 1, c), m = Yi(e, c, f);
        e.charCodeAt(f) === 34 && e.charCodeAt(m - 1) === 34 && (f++, m--);
        var h = e.slice(f, m);
        r[u] = _u(h, i);
      }
      s = c + 1;
    } while (s < n);
    return r;
  }
  o(yu, "parse");
  function Xi(e, t, r) {
    do {
      var n = e.charCodeAt(t);
      if (n !== 32 && n !== 9) return t;
    } while (++t < r);
    return r;
  }
  o(Xi, "startIndex");
  function Yi(e, t, r) {
    for (; t > r; ) {
      var n = e.charCodeAt(--t);
      if (n !== 32 && n !== 9) return t + 1;
    }
    return r;
  }
  o(Yi, "endIndex");
  function wu(e, t, r) {
    var n = r && r.encode || encodeURIComponent;
    if (typeof n != "function")
      throw new TypeError("option encode is invalid");
    if (!fu.test(e))
      throw new TypeError("argument name is invalid");
    var i = n(t);
    if (!pu.test(i))
      throw new TypeError("argument val is invalid");
    var s = e + "=" + i;
    if (!r) return s;
    if (r.maxAge != null) {
      var a = Math.floor(r.maxAge);
      if (!isFinite(a))
        throw new TypeError("option maxAge is invalid");
      s += "; Max-Age=" + a;
    }
    if (r.domain) {
      if (!hu.test(r.domain))
        throw new TypeError("option domain is invalid");
      s += "; Domain=" + r.domain;
    }
    if (r.path) {
      if (!mu.test(r.path))
        throw new TypeError("option path is invalid");
      s += "; Path=" + r.path;
    }
    if (r.expires) {
      var c = r.expires;
      if (!bu(c) || isNaN(c.valueOf()))
        throw new TypeError("option expires is invalid");
      s += "; Expires=" + c.toUTCString();
    }
    if (r.httpOnly && (s += "; HttpOnly"), r.secure && (s += "; Secure"), r.partitioned && (s += "; Partitioned"), r.priority) {
      var d = typeof r.priority == "string" ? r.priority.toLowerCase() : r.priority;
      switch (d) {
        case "low":
          s += "; Priority=Low";
          break;
        case "medium":
          s += "; Priority=Medium";
          break;
        case "high":
          s += "; Priority=High";
          break;
        default:
          throw new TypeError("option priority is invalid");
      }
    }
    if (r.sameSite) {
      var l = typeof r.sameSite == "string" ? r.sameSite.toLowerCase() : r.sameSite;
      switch (l) {
        case !0:
          s += "; SameSite=Strict";
          break;
        case "lax":
          s += "; SameSite=Lax";
          break;
        case "strict":
          s += "; SameSite=Strict";
          break;
        case "none":
          s += "; SameSite=None";
          break;
        default:
          throw new TypeError("option sameSite is invalid");
      }
    }
    return s;
  }
  o(wu, "serialize");
  function gu(e) {
    return e.indexOf("%") !== -1 ? decodeURIComponent(e) : e;
  }
  o(gu, "decode");
  function bu(e) {
    return lu.call(e) === "[object Date]";
  }
  o(bu, "isDate");
  function _u(e, t) {
    try {
      return t(e);
    } catch {
      return e;
    }
  }
  o(_u, "tryDecode");
});

// node_modules/@convex-dev/auth/dist/server/implementation/index.js
var gn = kn(oi(), 1);

// node_modules/@convex-dev/auth/dist/server/utils.js
function Q(e) {
  let t = process.env[e];
  if (t === void 0)
    throw new Error(`Missing environment variable \`${e}\``);
  return t;
}
o(Q, "requireEnv");
function Bt(e) {
  return /(localhost|127\.0\.0\.1):\d+/.test(e ?? "");
}
o(Bt, "isLocalHost");

// node_modules/@convex-dev/auth/dist/server/cookies.js
var ce = {
  httpOnly: !0,
  sameSite: "none",
  secure: !0,
  path: "/",
  partitioned: !0
}, gc = 60 * 15;
function ii(e, t) {
  return {
    name: ai(e),
    value: t,
    options: { ...ce, maxAge: gc }
  };
}
o(ii, "redirectToParamCookie");
function si(e, t) {
  let r = ai(e), n = t[r];
  if (n === void 0)
    return null;
  let i = {
    name: r,
    value: "",
    options: { ...ce, maxAge: 0 }
  };
  return { redirectTo: n, updatedCookie: i };
}
o(si, "useRedirectToParam");
function ai(e) {
  return (Bt(process.env.CONVEX_SITE_URL) ? "" : "__Host-") + e + "RedirectTo";
}
o(ai, "redirectToParamCookieName");

// node_modules/@auth/core/lib/utils/cookie.js
var Ne = function(e, t, r, n) {
  if (r === "a" && !n) throw new TypeError("Private accessor was defined without a getter");
  if (typeof t == "function" ? e !== t || !n : !t.has(e)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return r === "m" ? n : r === "a" ? n.call(e) : n ? n.value : t.get(e);
}, bc, st, ci, ui, _c, xc;
st = /* @__PURE__ */ new WeakMap(), ci = /* @__PURE__ */ new WeakMap(), ui = /* @__PURE__ */ new WeakMap(), bc = /* @__PURE__ */ new WeakSet(), _c = /* @__PURE__ */ o(function(t) {
  let r = Math.ceil(t.value.length / 3936);
  if (r === 1)
    return Ne(this, st, "f")[t.name] = t.value, [t];
  let n = [];
  for (let i = 0; i < r; i++) {
    let s = `${t.name}.${i}`, a = t.value.substr(i * 3936, 3936);
    n.push({ ...t, name: s, value: a }), Ne(this, st, "f")[s] = a;
  }
  return Ne(this, ui, "f").debug("CHUNKING_SESSION_COOKIE", {
    message: "Session cookie exceeds allowed 4096 bytes.",
    emptyCookieSize: 160,
    valueSize: t.value.length,
    chunks: n.map((i) => i.value.length + 160)
  }), n;
}, "_SessionStore_chunk"), xc = /* @__PURE__ */ o(function() {
  let t = {};
  for (let r in Ne(this, st, "f"))
    delete Ne(this, st, "f")?.[r], t[r] = {
      name: r,
      value: "",
      options: { ...Ne(this, ci, "f").options, maxAge: 0 }
    };
  return t;
}, "_SessionStore_clean");

// node_modules/@auth/core/errors.js
var U = class extends Error {
  static {
    o(this, "AuthError");
  }
  constructor(t, r) {
    t instanceof Error ? super(void 0, {
      cause: { err: t, ...t.cause, ...r }
    }) : typeof t == "string" ? (r instanceof Error && (r = { err: r, ...r.cause }), super(t, r)) : super(void 0, t), this.name = this.constructor.name, this.type = this.constructor.type ?? "AuthError", this.kind = this.constructor.kind ?? "error", Error.captureStackTrace?.(this, this.constructor);
    let n = `https://errors.authjs.dev#${this.type.toLowerCase()}`;
    this.message += `${this.message ? ". " : ""}Read more at ${n}`;
  }
}, ue = class extends U {
  static {
    o(this, "SignInError");
  }
};
ue.kind = "signIn";
var at = class extends U {
  static {
    o(this, "AdapterError");
  }
};
at.type = "AdapterError";
var ct = class extends U {
  static {
    o(this, "AccessDenied");
  }
};
ct.type = "AccessDenied";
var Jt = class extends U {
  static {
    o(this, "CallbackRouteError");
  }
};
Jt.type = "CallbackRouteError";
var zt = class extends U {
  static {
    o(this, "ErrorPageLoop");
  }
};
zt.type = "ErrorPageLoop";
var Mt = class extends U {
  static {
    o(this, "EventError");
  }
};
Mt.type = "EventError";
var jt = class extends U {
  static {
    o(this, "InvalidCallbackUrl");
  }
};
jt.type = "InvalidCallbackUrl";
var ut = class extends ue {
  static {
    o(this, "CredentialsSignin");
  }
  constructor() {
    super(...arguments), this.code = "credentials";
  }
};
ut.type = "CredentialsSignin";
var Vt = class extends U {
  static {
    o(this, "InvalidEndpoints");
  }
};
Vt.type = "InvalidEndpoints";
var be = class extends U {
  static {
    o(this, "InvalidCheck");
  }
};
be.type = "InvalidCheck";
var Ft = class extends U {
  static {
    o(this, "JWTSessionError");
  }
};
Ft.type = "JWTSessionError";
var dt = class extends U {
  static {
    o(this, "MissingAdapter");
  }
};
dt.type = "MissingAdapter";
var Gt = class extends U {
  static {
    o(this, "MissingAdapterMethods");
  }
};
Gt.type = "MissingAdapterMethods";
var qt = class extends U {
  static {
    o(this, "MissingAuthorize");
  }
};
qt.type = "MissingAuthorize";
var lt = class extends U {
  static {
    o(this, "MissingSecret");
  }
};
lt.type = "MissingSecret";
var Xt = class extends ue {
  static {
    o(this, "OAuthAccountNotLinked");
  }
};
Xt.type = "OAuthAccountNotLinked";
var Yt = class extends ue {
  static {
    o(this, "OAuthCallbackError");
  }
};
Yt.type = "OAuthCallbackError";
var Zt = class extends U {
  static {
    o(this, "OAuthProfileParseError");
  }
};
Zt.type = "OAuthProfileParseError";
var Qt = class extends U {
  static {
    o(this, "SessionTokenError");
  }
};
Qt.type = "SessionTokenError";
var Rn = class extends ue {
  static {
    o(this, "OAuthSignInError");
  }
};
Rn.type = "OAuthSignInError";
var Pn = class extends ue {
  static {
    o(this, "EmailSignInError");
  }
};
Pn.type = "EmailSignInError";
var er = class extends U {
  static {
    o(this, "SignOutError");
  }
};
er.type = "SignOutError";
var We = class extends U {
  static {
    o(this, "UnknownAction");
  }
};
We.type = "UnknownAction";
var tr = class extends U {
  static {
    o(this, "UnsupportedStrategy");
  }
};
tr.type = "UnsupportedStrategy";
var ft = class extends U {
  static {
    o(this, "InvalidProvider");
  }
};
ft.type = "InvalidProvider";
var rr = class extends U {
  static {
    o(this, "UntrustedHost");
  }
};
rr.type = "UntrustedHost";
var nr = class extends U {
  static {
    o(this, "Verification");
  }
};
nr.type = "Verification";
var or = class extends ue {
  static {
    o(this, "MissingCSRF");
  }
};
or.type = "MissingCSRF";
var ir = class extends U {
  static {
    o(this, "DuplicateConditionalUI");
  }
};
ir.type = "DuplicateConditionalUI";
var sr = class extends U {
  static {
    o(this, "MissingWebAuthnAutocomplete");
  }
};
sr.type = "MissingWebAuthnAutocomplete";
var ar = class extends U {
  static {
    o(this, "WebAuthnVerificationError");
  }
};
ar.type = "WebAuthnVerificationError";
var cr = class extends ue {
  static {
    o(this, "AccountNotLinked");
  }
};
cr.type = "AccountNotLinked";
var ur = class extends U {
  static {
    o(this, "ExperimentalFeatureNotEnabled");
  }
};
ur.type = "ExperimentalFeatureNotEnabled";

// node_modules/@panva/hkdf/dist/web/runtime/hkdf.js
var vc = /* @__PURE__ */ o(() => {
  if (typeof globalThis < "u")
    return globalThis;
  if (typeof self < "u")
    return self;
  if (typeof window < "u")
    return window;
  throw new Error("unable to locate global object");
}, "getGlobal"), li = /* @__PURE__ */ o(async (e, t, r, n, i) => {
  let { crypto: { subtle: s } } = vc();
  return new Uint8Array(await s.deriveBits({
    name: "HKDF",
    hash: `SHA-${e.substr(3)}`,
    salt: r,
    info: n
  }, await s.importKey("raw", t, "HKDF", !1, ["deriveBits"]), i << 3));
}, "default");

// node_modules/@panva/hkdf/dist/web/index.js
function Ac(e) {
  switch (e) {
    case "sha256":
    case "sha384":
    case "sha512":
    case "sha1":
      return e;
    default:
      throw new TypeError('unsupported "digest" value');
  }
}
o(Ac, "normalizeDigest");
function Un(e, t) {
  if (typeof e == "string")
    return new TextEncoder().encode(e);
  if (!(e instanceof Uint8Array))
    throw new TypeError(`"${t}"" must be an instance of Uint8Array or a string`);
  return e;
}
o(Un, "normalizeUint8Array");
function Ec(e) {
  let t = Un(e, "ikm");
  if (!t.byteLength)
    throw new TypeError('"ikm" must be at least one byte in length');
  return t;
}
o(Ec, "normalizeIkm");
function kc(e) {
  let t = Un(e, "info");
  if (t.byteLength > 1024)
    throw TypeError('"info" must not contain more than 1024 bytes');
  return t;
}
o(kc, "normalizeInfo");
function Ic(e, t) {
  if (typeof e != "number" || !Number.isInteger(e) || e < 1)
    throw new TypeError('"keylen" must be a positive integer');
  let r = parseInt(t.substr(3), 10) >> 3 || 20;
  if (e > 255 * r)
    throw new TypeError('"keylen" too large');
  return e;
}
o(Ic, "normalizeKeylen");
async function fi(e, t, r, n, i) {
  return li(Ac(e), Ec(t), Un(r, "salt"), kc(n), Ic(i, e));
}
o(fi, "hkdf");

// node_modules/jose/dist/browser/runtime/webcrypto.js
var v = crypto, J = /* @__PURE__ */ o((e) => e instanceof CryptoKey, "isCryptoKey");

// node_modules/jose/dist/browser/runtime/digest.js
var Tc = /* @__PURE__ */ o(async (e, t) => {
  let r = `SHA-${e.slice(-3)}`;
  return new Uint8Array(await v.subtle.digest(r, t));
}, "digest"), dr = Tc;

// node_modules/jose/dist/browser/lib/buffer_utils.js
var K = new TextEncoder(), ne = new TextDecoder(), lr = 2 ** 32;
function Z(...e) {
  let t = e.reduce((i, { length: s }) => i + s, 0), r = new Uint8Array(t), n = 0;
  for (let i of e)
    r.set(i, n), n += i.length;
  return r;
}
o(Z, "concat");
function pi(e, t) {
  return Z(K.encode(e), new Uint8Array([0]), t);
}
o(pi, "p2s");
function On(e, t, r) {
  if (t < 0 || t >= lr)
    throw new RangeError(`value must be >= 0 and <= ${lr - 1}. Received ${t}`);
  e.set([t >>> 24, t >>> 16, t >>> 8, t & 255], r);
}
o(On, "writeUInt32BE");
function fr(e) {
  let t = Math.floor(e / lr), r = e % lr, n = new Uint8Array(8);
  return On(n, t, 0), On(n, r, 4), n;
}
o(fr, "uint64be");
function pr(e) {
  let t = new Uint8Array(4);
  return On(t, e), t;
}
o(pr, "uint32be");
function hr(e) {
  return Z(pr(e.length), e);
}
o(hr, "lengthAndInput");
async function hi(e, t, r) {
  let n = Math.ceil((t >> 3) / 32), i = new Uint8Array(n * 32);
  for (let s = 0; s < n; s++) {
    let a = new Uint8Array(4 + e.length + r.length);
    a.set(pr(s + 1)), a.set(e, 4), a.set(r, 4 + e.length), i.set(await dr("sha256", a), s * 32);
  }
  return i.slice(0, t >> 3);
}
o(hi, "concatKdf");

// node_modules/jose/dist/browser/runtime/base64url.js
var Cc = /* @__PURE__ */ o((e) => {
  let t = e;
  typeof t == "string" && (t = K.encode(t));
  let r = 32768, n = [];
  for (let i = 0; i < t.length; i += r)
    n.push(String.fromCharCode.apply(null, t.subarray(i, i + r)));
  return btoa(n.join(""));
}, "encodeBase64"), $ = /* @__PURE__ */ o((e) => Cc(e).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_"), "encode"), Rc = /* @__PURE__ */ o((e) => {
  let t = atob(e), r = new Uint8Array(t.length);
  for (let n = 0; n < t.length; n++)
    r[n] = t.charCodeAt(n);
  return r;
}, "decodeBase64"), M = /* @__PURE__ */ o((e) => {
  let t = e;
  t instanceof Uint8Array && (t = ne.decode(t)), t = t.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "");
  try {
    return Rc(t);
  } catch {
    throw new TypeError("The input to be decoded is not correctly encoded.");
  }
}, "decode");

// node_modules/jose/dist/browser/util/errors.js
var X = class extends Error {
  static {
    o(this, "JOSEError");
  }
  constructor(t, r) {
    super(t, r), this.code = "ERR_JOSE_GENERIC", this.name = this.constructor.name, Error.captureStackTrace?.(this, this.constructor);
  }
};
X.code = "ERR_JOSE_GENERIC";
var G = class extends X {
  static {
    o(this, "JWTClaimValidationFailed");
  }
  constructor(t, r, n = "unspecified", i = "unspecified") {
    super(t, { cause: { claim: n, reason: i, payload: r } }), this.code = "ERR_JWT_CLAIM_VALIDATION_FAILED", this.claim = n, this.reason = i, this.payload = r;
  }
};
G.code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
var Be = class extends X {
  static {
    o(this, "JWTExpired");
  }
  constructor(t, r, n = "unspecified", i = "unspecified") {
    super(t, { cause: { claim: n, reason: i, payload: r } }), this.code = "ERR_JWT_EXPIRED", this.claim = n, this.reason = i, this.payload = r;
  }
};
Be.code = "ERR_JWT_EXPIRED";
var Je = class extends X {
  static {
    o(this, "JOSEAlgNotAllowed");
  }
  constructor() {
    super(...arguments), this.code = "ERR_JOSE_ALG_NOT_ALLOWED";
  }
};
Je.code = "ERR_JOSE_ALG_NOT_ALLOWED";
var C = class extends X {
  static {
    o(this, "JOSENotSupported");
  }
  constructor() {
    super(...arguments), this.code = "ERR_JOSE_NOT_SUPPORTED";
  }
};
C.code = "ERR_JOSE_NOT_SUPPORTED";
var Re = class extends X {
  static {
    o(this, "JWEDecryptionFailed");
  }
  constructor(t = "decryption operation failed", r) {
    super(t, r), this.code = "ERR_JWE_DECRYPTION_FAILED";
  }
};
Re.code = "ERR_JWE_DECRYPTION_FAILED";
var g = class extends X {
  static {
    o(this, "JWEInvalid");
  }
  constructor() {
    super(...arguments), this.code = "ERR_JWE_INVALID";
  }
};
g.code = "ERR_JWE_INVALID";
var me = class extends X {
  static {
    o(this, "JWSInvalid");
  }
  constructor() {
    super(...arguments), this.code = "ERR_JWS_INVALID";
  }
};
me.code = "ERR_JWS_INVALID";
var Pe = class extends X {
  static {
    o(this, "JWTInvalid");
  }
  constructor() {
    super(...arguments), this.code = "ERR_JWT_INVALID";
  }
};
Pe.code = "ERR_JWT_INVALID";
var pt = class extends X {
  static {
    o(this, "JWKInvalid");
  }
  constructor() {
    super(...arguments), this.code = "ERR_JWK_INVALID";
  }
};
pt.code = "ERR_JWK_INVALID";
var Dn = class extends X {
  static {
    o(this, "JWKSInvalid");
  }
  constructor() {
    super(...arguments), this.code = "ERR_JWKS_INVALID";
  }
};
Dn.code = "ERR_JWKS_INVALID";
var Ln = class extends X {
  static {
    o(this, "JWKSNoMatchingKey");
  }
  constructor(t = "no applicable key found in the JSON Web Key Set", r) {
    super(t, r), this.code = "ERR_JWKS_NO_MATCHING_KEY";
  }
};
Ln.code = "ERR_JWKS_NO_MATCHING_KEY";
var Hn = class extends X {
  static {
    o(this, "JWKSMultipleMatchingKeys");
  }
  constructor(t = "multiple matching keys found in the JSON Web Key Set", r) {
    super(t, r), this.code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
  }
};
Hn.code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
var Kn = class extends X {
  static {
    o(this, "JWKSTimeout");
  }
  constructor(t = "request timed out", r) {
    super(t, r), this.code = "ERR_JWKS_TIMEOUT";
  }
};
Kn.code = "ERR_JWKS_TIMEOUT";
var $n = class extends X {
  static {
    o(this, "JWSSignatureVerificationFailed");
  }
  constructor(t = "signature verification failed", r) {
    super(t, r), this.code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
  }
};
$n.code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";

// node_modules/jose/dist/browser/runtime/random.js
var ze = v.getRandomValues.bind(v);

// node_modules/jose/dist/browser/lib/iv.js
function Nn(e) {
  switch (e) {
    case "A128GCM":
    case "A128GCMKW":
    case "A192GCM":
    case "A192GCMKW":
    case "A256GCM":
    case "A256GCMKW":
      return 96;
    case "A128CBC-HS256":
    case "A192CBC-HS384":
    case "A256CBC-HS512":
      return 128;
    default:
      throw new C(`Unsupported JWE Algorithm: ${e}`);
  }
}
o(Nn, "bitLength");
var mi = /* @__PURE__ */ o((e) => ze(new Uint8Array(Nn(e) >> 3)), "default");

// node_modules/jose/dist/browser/lib/check_iv_length.js
var Oc = /* @__PURE__ */ o((e, t) => {
  if (t.length << 3 !== Nn(e))
    throw new g("Invalid Initialization Vector length");
}, "checkIvLength"), mr = Oc;

// node_modules/jose/dist/browser/runtime/check_cek_length.js
var Dc = /* @__PURE__ */ o((e, t) => {
  let r = e.byteLength << 3;
  if (r !== t)
    throw new g(`Invalid Content Encryption Key length. Expected ${t} bits, got ${r} bits`);
}, "checkCekLength"), Me = Dc;

// node_modules/jose/dist/browser/runtime/timing_safe_equal.js
var Lc = /* @__PURE__ */ o((e, t) => {
  if (!(e instanceof Uint8Array))
    throw new TypeError("First argument must be a buffer");
  if (!(t instanceof Uint8Array))
    throw new TypeError("Second argument must be a buffer");
  if (e.length !== t.length)
    throw new TypeError("Input buffers must have the same length");
  let r = e.length, n = 0, i = -1;
  for (; ++i < r; )
    n |= e[i] ^ t[i];
  return n === 0;
}, "timingSafeEqual"), yi = Lc;

// node_modules/jose/dist/browser/lib/crypto_key.js
function q(e, t = "algorithm.name") {
  return new TypeError(`CryptoKey does not support this operation, its ${t} must be ${e}`);
}
o(q, "unusable");
function ye(e, t) {
  return e.name === t;
}
o(ye, "isAlgorithm");
function yr(e) {
  return parseInt(e.name.slice(4), 10);
}
o(yr, "getHashLength");
function Hc(e) {
  switch (e) {
    case "ES256":
      return "P-256";
    case "ES384":
      return "P-384";
    case "ES512":
      return "P-521";
    default:
      throw new Error("unreachable");
  }
}
o(Hc, "getNamedCurve");
function wi(e, t) {
  if (t.length && !t.some((r) => e.usages.includes(r))) {
    let r = "CryptoKey does not support this operation, its usages must include ";
    if (t.length > 2) {
      let n = t.pop();
      r += `one of ${t.join(", ")}, or ${n}.`;
    } else t.length === 2 ? r += `one of ${t[0]} or ${t[1]}.` : r += `${t[0]}.`;
    throw new TypeError(r);
  }
}
o(wi, "checkUsage");
function gi(e, t, ...r) {
  switch (t) {
    case "HS256":
    case "HS384":
    case "HS512": {
      if (!ye(e.algorithm, "HMAC"))
        throw q("HMAC");
      let n = parseInt(t.slice(2), 10);
      if (yr(e.algorithm.hash) !== n)
        throw q(`SHA-${n}`, "algorithm.hash");
      break;
    }
    case "RS256":
    case "RS384":
    case "RS512": {
      if (!ye(e.algorithm, "RSASSA-PKCS1-v1_5"))
        throw q("RSASSA-PKCS1-v1_5");
      let n = parseInt(t.slice(2), 10);
      if (yr(e.algorithm.hash) !== n)
        throw q(`SHA-${n}`, "algorithm.hash");
      break;
    }
    case "PS256":
    case "PS384":
    case "PS512": {
      if (!ye(e.algorithm, "RSA-PSS"))
        throw q("RSA-PSS");
      let n = parseInt(t.slice(2), 10);
      if (yr(e.algorithm.hash) !== n)
        throw q(`SHA-${n}`, "algorithm.hash");
      break;
    }
    case "EdDSA": {
      if (e.algorithm.name !== "Ed25519" && e.algorithm.name !== "Ed448")
        throw q("Ed25519 or Ed448");
      break;
    }
    case "Ed25519": {
      if (!ye(e.algorithm, "Ed25519"))
        throw q("Ed25519");
      break;
    }
    case "ES256":
    case "ES384":
    case "ES512": {
      if (!ye(e.algorithm, "ECDSA"))
        throw q("ECDSA");
      let n = Hc(t);
      if (e.algorithm.namedCurve !== n)
        throw q(n, "algorithm.namedCurve");
      break;
    }
    default:
      throw new TypeError("CryptoKey does not support this operation");
  }
  wi(e, r);
}
o(gi, "checkSigCryptoKey");
function ee(e, t, ...r) {
  switch (t) {
    case "A128GCM":
    case "A192GCM":
    case "A256GCM": {
      if (!ye(e.algorithm, "AES-GCM"))
        throw q("AES-GCM");
      let n = parseInt(t.slice(1, 4), 10);
      if (e.algorithm.length !== n)
        throw q(n, "algorithm.length");
      break;
    }
    case "A128KW":
    case "A192KW":
    case "A256KW": {
      if (!ye(e.algorithm, "AES-KW"))
        throw q("AES-KW");
      let n = parseInt(t.slice(1, 4), 10);
      if (e.algorithm.length !== n)
        throw q(n, "algorithm.length");
      break;
    }
    case "ECDH": {
      switch (e.algorithm.name) {
        case "ECDH":
        case "X25519":
        case "X448":
          break;
        default:
          throw q("ECDH, X25519, or X448");
      }
      break;
    }
    case "PBES2-HS256+A128KW":
    case "PBES2-HS384+A192KW":
    case "PBES2-HS512+A256KW":
      if (!ye(e.algorithm, "PBKDF2"))
        throw q("PBKDF2");
      break;
    case "RSA-OAEP":
    case "RSA-OAEP-256":
    case "RSA-OAEP-384":
    case "RSA-OAEP-512": {
      if (!ye(e.algorithm, "RSA-OAEP"))
        throw q("RSA-OAEP");
      let n = parseInt(t.slice(9), 10) || 1;
      if (yr(e.algorithm.hash) !== n)
        throw q(`SHA-${n}`, "algorithm.hash");
      break;
    }
    default:
      throw new TypeError("CryptoKey does not support this operation");
  }
  wi(e, r);
}
o(ee, "checkEncCryptoKey");

// node_modules/jose/dist/browser/lib/invalid_key_input.js
function bi(e, t, ...r) {
  if (r = r.filter(Boolean), r.length > 2) {
    let n = r.pop();
    e += `one of type ${r.join(", ")}, or ${n}.`;
  } else r.length === 2 ? e += `one of type ${r[0]} or ${r[1]}.` : e += `of type ${r[0]}.`;
  return t == null ? e += ` Received ${t}` : typeof t == "function" && t.name ? e += ` Received function ${t.name}` : typeof t == "object" && t != null && t.constructor?.name && (e += ` Received an instance of ${t.constructor.name}`), e;
}
o(bi, "message");
var z = /* @__PURE__ */ o((e, ...t) => bi("Key must be ", e, ...t), "default");
function Wn(e, t, ...r) {
  return bi(`Key for the ${e} algorithm must be `, t, ...r);
}
o(Wn, "withAlg");

// node_modules/jose/dist/browser/runtime/is_key_like.js
var Bn = /* @__PURE__ */ o((e) => J(e) ? !0 : e?.[Symbol.toStringTag] === "KeyObject", "default"), W = ["CryptoKey"];

// node_modules/jose/dist/browser/runtime/decrypt.js
async function Kc(e, t, r, n, i, s) {
  if (!(t instanceof Uint8Array))
    throw new TypeError(z(t, "Uint8Array"));
  let a = parseInt(e.slice(1, 4), 10), c = await v.subtle.importKey("raw", t.subarray(a >> 3), "AES-CBC", !1, ["decrypt"]), d = await v.subtle.importKey("raw", t.subarray(0, a >> 3), {
    hash: `SHA-${a << 1}`,
    name: "HMAC"
  }, !1, ["sign"]), l = Z(s, n, r, fr(s.length << 3)), u = new Uint8Array((await v.subtle.sign("HMAC", d, l)).slice(0, a >> 3)), f;
  try {
    f = yi(i, u);
  } catch {
  }
  if (!f)
    throw new Re();
  let m;
  try {
    m = new Uint8Array(await v.subtle.decrypt({ iv: n, name: "AES-CBC" }, c, r));
  } catch {
  }
  if (!m)
    throw new Re();
  return m;
}
o(Kc, "cbcDecrypt");
async function $c(e, t, r, n, i, s) {
  let a;
  t instanceof Uint8Array ? a = await v.subtle.importKey("raw", t, "AES-GCM", !1, ["decrypt"]) : (ee(t, e, "decrypt"), a = t);
  try {
    return new Uint8Array(await v.subtle.decrypt({
      additionalData: s,
      iv: n,
      name: "AES-GCM",
      tagLength: 128
    }, a, Z(r, i)));
  } catch {
    throw new Re();
  }
}
o($c, "gcmDecrypt");
var Nc = /* @__PURE__ */ o(async (e, t, r, n, i, s) => {
  if (!J(t) && !(t instanceof Uint8Array))
    throw new TypeError(z(t, ...W, "Uint8Array"));
  if (!n)
    throw new g("JWE Initialization Vector missing");
  if (!i)
    throw new g("JWE Authentication Tag missing");
  switch (mr(e, n), e) {
    case "A128CBC-HS256":
    case "A192CBC-HS384":
    case "A256CBC-HS512":
      return t instanceof Uint8Array && Me(t, parseInt(e.slice(-3), 10)), Kc(e, t, r, n, i, s);
    case "A128GCM":
    case "A192GCM":
    case "A256GCM":
      return t instanceof Uint8Array && Me(t, parseInt(e.slice(1, 4), 10)), $c(e, t, r, n, i, s);
    default:
      throw new C("Unsupported JWE Content Encryption Algorithm");
  }
}, "decrypt"), wr = Nc;

// node_modules/jose/dist/browser/lib/is_disjoint.js
var Wc = /* @__PURE__ */ o((...e) => {
  let t = e.filter(Boolean);
  if (t.length === 0 || t.length === 1)
    return !0;
  let r;
  for (let n of t) {
    let i = Object.keys(n);
    if (!r || r.size === 0) {
      r = new Set(i);
      continue;
    }
    for (let s of i) {
      if (r.has(s))
        return !1;
      r.add(s);
    }
  }
  return !0;
}, "isDisjoint"), je = Wc;

// node_modules/jose/dist/browser/lib/is_object.js
function Bc(e) {
  return typeof e == "object" && e !== null;
}
o(Bc, "isObjectLike");
function Y(e) {
  if (!Bc(e) || Object.prototype.toString.call(e) !== "[object Object]")
    return !1;
  if (Object.getPrototypeOf(e) === null)
    return !0;
  let t = e;
  for (; Object.getPrototypeOf(t) !== null; )
    t = Object.getPrototypeOf(t);
  return Object.getPrototypeOf(e) === t;
}
o(Y, "isObject");

// node_modules/jose/dist/browser/runtime/bogus.js
var Jc = [
  { hash: "SHA-256", name: "HMAC" },
  !0,
  ["sign"]
], Ve = Jc;

// node_modules/jose/dist/browser/runtime/aeskw.js
function _i(e, t) {
  if (e.algorithm.length !== parseInt(t.slice(1, 4), 10))
    throw new TypeError(`Invalid key size for alg: ${t}`);
}
o(_i, "checkKeySize");
function xi(e, t, r) {
  if (J(e))
    return ee(e, t, r), e;
  if (e instanceof Uint8Array)
    return v.subtle.importKey("raw", e, "AES-KW", !0, [r]);
  throw new TypeError(z(e, ...W, "Uint8Array"));
}
o(xi, "getCryptoKey");
var ht = /* @__PURE__ */ o(async (e, t, r) => {
  let n = await xi(t, e, "wrapKey");
  _i(n, e);
  let i = await v.subtle.importKey("raw", r, ...Ve);
  return new Uint8Array(await v.subtle.wrapKey("raw", i, n, "AES-KW"));
}, "wrap"), mt = /* @__PURE__ */ o(async (e, t, r) => {
  let n = await xi(t, e, "unwrapKey");
  _i(n, e);
  let i = await v.subtle.unwrapKey("raw", r, n, "AES-KW", ...Ve);
  return new Uint8Array(await v.subtle.exportKey("raw", i));
}, "unwrap");

// node_modules/jose/dist/browser/runtime/ecdhes.js
async function gr(e, t, r, n, i = new Uint8Array(0), s = new Uint8Array(0)) {
  if (!J(e))
    throw new TypeError(z(e, ...W));
  if (ee(e, "ECDH"), !J(t))
    throw new TypeError(z(t, ...W));
  ee(t, "ECDH", "deriveBits");
  let a = Z(hr(K.encode(r)), hr(i), hr(s), pr(n)), c;
  e.algorithm.name === "X25519" ? c = 256 : e.algorithm.name === "X448" ? c = 448 : c = Math.ceil(parseInt(e.algorithm.namedCurve.substr(-3), 10) / 8) << 3;
  let d = new Uint8Array(await v.subtle.deriveBits({
    name: e.algorithm.name,
    public: e
  }, t, c));
  return hi(d, n, a);
}
o(gr, "deriveKey");
async function Si(e) {
  if (!J(e))
    throw new TypeError(z(e, ...W));
  return v.subtle.generateKey(e.algorithm, !0, ["deriveBits"]);
}
o(Si, "generateEpk");
function br(e) {
  if (!J(e))
    throw new TypeError(z(e, ...W));
  return ["P-256", "P-384", "P-521"].includes(e.algorithm.namedCurve) || e.algorithm.name === "X25519" || e.algorithm.name === "X448";
}
o(br, "ecdhAllowed");

// node_modules/jose/dist/browser/lib/check_p2s.js
function Jn(e) {
  if (!(e instanceof Uint8Array) || e.length < 8)
    throw new g("PBES2 Salt Input must be 8 or more octets");
}
o(Jn, "checkP2s");

// node_modules/jose/dist/browser/runtime/pbes2kw.js
function zc(e, t) {
  if (e instanceof Uint8Array)
    return v.subtle.importKey("raw", e, "PBKDF2", !1, ["deriveBits"]);
  if (J(e))
    return ee(e, t, "deriveBits", "deriveKey"), e;
  throw new TypeError(z(e, ...W, "Uint8Array"));
}
o(zc, "getCryptoKey");
async function Ai(e, t, r, n) {
  Jn(e);
  let i = pi(t, e), s = parseInt(t.slice(13, 16), 10), a = {
    hash: `SHA-${t.slice(8, 11)}`,
    iterations: r,
    name: "PBKDF2",
    salt: i
  }, c = {
    length: s,
    name: "AES-KW"
  }, d = await zc(n, t);
  if (d.usages.includes("deriveBits"))
    return new Uint8Array(await v.subtle.deriveBits(a, d, s));
  if (d.usages.includes("deriveKey"))
    return v.subtle.deriveKey(a, d, c, !1, ["wrapKey", "unwrapKey"]);
  throw new TypeError('PBKDF2 key "usages" must include "deriveBits" or "deriveKey"');
}
o(Ai, "deriveKey");
var Ei = /* @__PURE__ */ o(async (e, t, r, n = 2048, i = ze(new Uint8Array(16))) => {
  let s = await Ai(i, e, n, t);
  return { encryptedKey: await ht(e.slice(-6), s, r), p2c: n, p2s: $(i) };
}, "encrypt"), ki = /* @__PURE__ */ o(async (e, t, r, n, i) => {
  let s = await Ai(i, e, n, t);
  return mt(e.slice(-6), s, r);
}, "decrypt");

// node_modules/jose/dist/browser/runtime/subtle_rsaes.js
function Fe(e) {
  switch (e) {
    case "RSA-OAEP":
    case "RSA-OAEP-256":
    case "RSA-OAEP-384":
    case "RSA-OAEP-512":
      return "RSA-OAEP";
    default:
      throw new C(`alg ${e} is not supported either by JOSE or your javascript runtime`);
  }
}
o(Fe, "subtleRsaEs");

// node_modules/jose/dist/browser/runtime/check_key_length.js
var yt = /* @__PURE__ */ o((e, t) => {
  if (e.startsWith("RS") || e.startsWith("PS")) {
    let { modulusLength: r } = t.algorithm;
    if (typeof r != "number" || r < 2048)
      throw new TypeError(`${e} requires key modulusLength to be 2048 bits or larger`);
  }
}, "default");

// node_modules/jose/dist/browser/runtime/rsaes.js
var Ii = /* @__PURE__ */ o(async (e, t, r) => {
  if (!J(t))
    throw new TypeError(z(t, ...W));
  if (ee(t, e, "encrypt", "wrapKey"), yt(e, t), t.usages.includes("encrypt"))
    return new Uint8Array(await v.subtle.encrypt(Fe(e), t, r));
  if (t.usages.includes("wrapKey")) {
    let n = await v.subtle.importKey("raw", r, ...Ve);
    return new Uint8Array(await v.subtle.wrapKey("raw", n, t, Fe(e)));
  }
  throw new TypeError('RSA-OAEP key "usages" must include "encrypt" or "wrapKey" for this operation');
}, "encrypt"), Ti = /* @__PURE__ */ o(async (e, t, r) => {
  if (!J(t))
    throw new TypeError(z(t, ...W));
  if (ee(t, e, "decrypt", "unwrapKey"), yt(e, t), t.usages.includes("decrypt"))
    return new Uint8Array(await v.subtle.decrypt(Fe(e), t, r));
  if (t.usages.includes("unwrapKey")) {
    let n = await v.subtle.unwrapKey("raw", r, t, Fe(e), ...Ve);
    return new Uint8Array(await v.subtle.exportKey("raw", n));
  }
  throw new TypeError('RSA-OAEP key "usages" must include "decrypt" or "unwrapKey" for this operation');
}, "decrypt");

// node_modules/jose/dist/browser/lib/is_jwk.js
function Ue(e) {
  return Y(e) && typeof e.kty == "string";
}
o(Ue, "isJWK");
function Ci(e) {
  return e.kty !== "oct" && typeof e.d == "string";
}
o(Ci, "isPrivateJWK");
function Ri(e) {
  return e.kty !== "oct" && typeof e.d > "u";
}
o(Ri, "isPublicJWK");
function Pi(e) {
  return Ue(e) && e.kty === "oct" && typeof e.k == "string";
}
o(Pi, "isSecretJWK");

// node_modules/jose/dist/browser/runtime/jwk_to_key.js
function jc(e) {
  let t, r;
  switch (e.kty) {
    case "RSA": {
      switch (e.alg) {
        case "PS256":
        case "PS384":
        case "PS512":
          t = { name: "RSA-PSS", hash: `SHA-${e.alg.slice(-3)}` }, r = e.d ? ["sign"] : ["verify"];
          break;
        case "RS256":
        case "RS384":
        case "RS512":
          t = { name: "RSASSA-PKCS1-v1_5", hash: `SHA-${e.alg.slice(-3)}` }, r = e.d ? ["sign"] : ["verify"];
          break;
        case "RSA-OAEP":
        case "RSA-OAEP-256":
        case "RSA-OAEP-384":
        case "RSA-OAEP-512":
          t = {
            name: "RSA-OAEP",
            hash: `SHA-${parseInt(e.alg.slice(-3), 10) || 1}`
          }, r = e.d ? ["decrypt", "unwrapKey"] : ["encrypt", "wrapKey"];
          break;
        default:
          throw new C('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    case "EC": {
      switch (e.alg) {
        case "ES256":
          t = { name: "ECDSA", namedCurve: "P-256" }, r = e.d ? ["sign"] : ["verify"];
          break;
        case "ES384":
          t = { name: "ECDSA", namedCurve: "P-384" }, r = e.d ? ["sign"] : ["verify"];
          break;
        case "ES512":
          t = { name: "ECDSA", namedCurve: "P-521" }, r = e.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          t = { name: "ECDH", namedCurve: e.crv }, r = e.d ? ["deriveBits"] : [];
          break;
        default:
          throw new C('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    case "OKP": {
      switch (e.alg) {
        case "Ed25519":
          t = { name: "Ed25519" }, r = e.d ? ["sign"] : ["verify"];
          break;
        case "EdDSA":
          t = { name: e.crv }, r = e.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          t = { name: e.crv }, r = e.d ? ["deriveBits"] : [];
          break;
        default:
          throw new C('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    default:
      throw new C('Invalid or unsupported JWK "kty" (Key Type) Parameter value');
  }
  return { algorithm: t, keyUsages: r };
}
o(jc, "subtleMapping");
var Vc = /* @__PURE__ */ o(async (e) => {
  if (!e.alg)
    throw new TypeError('"alg" argument is required when "jwk.alg" is not present');
  let { algorithm: t, keyUsages: r } = jc(e), n = [
    t,
    e.ext ?? !1,
    e.key_ops ?? r
  ], i = { ...e };
  return delete i.alg, delete i.use, v.subtle.importKey("jwk", i, ...n);
}, "parse"), _r = Vc;

// node_modules/jose/dist/browser/runtime/normalize_key.js
var Ui = /* @__PURE__ */ o((e) => M(e), "exportKeyValue"), Ge, qe, Oi = /* @__PURE__ */ o((e) => e?.[Symbol.toStringTag] === "KeyObject", "isKeyObject"), xr = /* @__PURE__ */ o(async (e, t, r, n, i = !1) => {
  let s = e.get(t);
  if (s?.[n])
    return s[n];
  let a = await _r({ ...r, alg: n });
  return i && Object.freeze(t), s ? s[n] = a : e.set(t, { [n]: a }), a;
}, "importAndCache"), Fc = /* @__PURE__ */ o((e, t) => {
  if (Oi(e)) {
    let r = e.export({ format: "jwk" });
    return delete r.d, delete r.dp, delete r.dq, delete r.p, delete r.q, delete r.qi, r.k ? Ui(r.k) : (qe || (qe = /* @__PURE__ */ new WeakMap()), xr(qe, e, r, t));
  }
  return Ue(e) ? e.k ? M(e.k) : (qe || (qe = /* @__PURE__ */ new WeakMap()), xr(qe, e, e, t, !0)) : e;
}, "normalizePublicKey"), Gc = /* @__PURE__ */ o((e, t) => {
  if (Oi(e)) {
    let r = e.export({ format: "jwk" });
    return r.k ? Ui(r.k) : (Ge || (Ge = /* @__PURE__ */ new WeakMap()), xr(Ge, e, r, t));
  }
  return Ue(e) ? e.k ? M(e.k) : (Ge || (Ge = /* @__PURE__ */ new WeakMap()), xr(Ge, e, e, t, !0)) : e;
}, "normalizePrivateKey"), Oe = { normalizePublicKey: Fc, normalizePrivateKey: Gc };

// node_modules/jose/dist/browser/lib/cek.js
function wt(e) {
  switch (e) {
    case "A128GCM":
      return 128;
    case "A192GCM":
      return 192;
    case "A256GCM":
    case "A128CBC-HS256":
      return 256;
    case "A192CBC-HS384":
      return 384;
    case "A256CBC-HS512":
      return 512;
    default:
      throw new C(`Unsupported JWE Algorithm: ${e}`);
  }
}
o(wt, "bitLength");
var _e = /* @__PURE__ */ o((e) => ze(new Uint8Array(wt(e) >> 3)), "default");

// node_modules/jose/dist/browser/runtime/asn1.js
var xe = /* @__PURE__ */ o((e, t, r = 0) => {
  r === 0 && (t.unshift(t.length), t.unshift(6));
  let n = e.indexOf(t[0], r);
  if (n === -1)
    return !1;
  let i = e.subarray(n, n + t.length);
  return i.length !== t.length ? !1 : i.every((s, a) => s === t[a]) || xe(e, t, n + 1);
}, "findOid"), Di = /* @__PURE__ */ o((e) => {
  switch (!0) {
    case xe(e, [42, 134, 72, 206, 61, 3, 1, 7]):
      return "P-256";
    case xe(e, [43, 129, 4, 0, 34]):
      return "P-384";
    case xe(e, [43, 129, 4, 0, 35]):
      return "P-521";
    case xe(e, [43, 101, 110]):
      return "X25519";
    case xe(e, [43, 101, 111]):
      return "X448";
    case xe(e, [43, 101, 112]):
      return "Ed25519";
    case xe(e, [43, 101, 113]):
      return "Ed448";
    default:
      throw new C("Invalid or unsupported EC Key Curve or OKP Key Sub Type");
  }
}, "getNamedCurve"), qc = /* @__PURE__ */ o(async (e, t, r, n, i) => {
  let s, a, c = new Uint8Array(atob(r.replace(e, "")).split("").map((l) => l.charCodeAt(0))), d = t === "spki";
  switch (n) {
    case "PS256":
    case "PS384":
    case "PS512":
      s = { name: "RSA-PSS", hash: `SHA-${n.slice(-3)}` }, a = d ? ["verify"] : ["sign"];
      break;
    case "RS256":
    case "RS384":
    case "RS512":
      s = { name: "RSASSA-PKCS1-v1_5", hash: `SHA-${n.slice(-3)}` }, a = d ? ["verify"] : ["sign"];
      break;
    case "RSA-OAEP":
    case "RSA-OAEP-256":
    case "RSA-OAEP-384":
    case "RSA-OAEP-512":
      s = {
        name: "RSA-OAEP",
        hash: `SHA-${parseInt(n.slice(-3), 10) || 1}`
      }, a = d ? ["encrypt", "wrapKey"] : ["decrypt", "unwrapKey"];
      break;
    case "ES256":
      s = { name: "ECDSA", namedCurve: "P-256" }, a = d ? ["verify"] : ["sign"];
      break;
    case "ES384":
      s = { name: "ECDSA", namedCurve: "P-384" }, a = d ? ["verify"] : ["sign"];
      break;
    case "ES512":
      s = { name: "ECDSA", namedCurve: "P-521" }, a = d ? ["verify"] : ["sign"];
      break;
    case "ECDH-ES":
    case "ECDH-ES+A128KW":
    case "ECDH-ES+A192KW":
    case "ECDH-ES+A256KW": {
      let l = Di(c);
      s = l.startsWith("P-") ? { name: "ECDH", namedCurve: l } : { name: l }, a = d ? [] : ["deriveBits"];
      break;
    }
    case "Ed25519":
      s = { name: "Ed25519" }, a = d ? ["verify"] : ["sign"];
      break;
    case "EdDSA":
      s = { name: Di(c) }, a = d ? ["verify"] : ["sign"];
      break;
    default:
      throw new C('Invalid or unsupported "alg" (Algorithm) value');
  }
  return v.subtle.importKey(t, c, s, i?.extractable ?? !1, a);
}, "genericImport"), Li = /* @__PURE__ */ o((e, t, r) => qc(/(?:-----(?:BEGIN|END) PRIVATE KEY-----|\s)/g, "pkcs8", e, t, r), "fromPKCS8");

// node_modules/jose/dist/browser/key/import.js
async function zn(e, t, r) {
  if (typeof e != "string" || e.indexOf("-----BEGIN PRIVATE KEY-----") !== 0)
    throw new TypeError('"pkcs8" must be PKCS#8 formatted string');
  return Li(e, t, r);
}
o(zn, "importPKCS8");
async function Mn(e, t) {
  if (!Y(e))
    throw new TypeError("JWK must be an object");
  switch (t || (t = e.alg), e.kty) {
    case "oct":
      if (typeof e.k != "string" || !e.k)
        throw new TypeError('missing "k" (Key Value) Parameter value');
      return M(e.k);
    case "RSA":
      if ("oth" in e && e.oth !== void 0)
        throw new C('RSA JWK "oth" (Other Primes Info) Parameter value is not supported');
    case "EC":
    case "OKP":
      return _r({ ...e, alg: t });
    default:
      throw new C('Unsupported "kty" (Key Type) Parameter value');
  }
}
o(Mn, "importJWK");

// node_modules/jose/dist/browser/lib/check_key_type.js
var Xe = /* @__PURE__ */ o((e) => e?.[Symbol.toStringTag], "tag"), jn = /* @__PURE__ */ o((e, t, r) => {
  if (t.use !== void 0 && t.use !== "sig")
    throw new TypeError("Invalid key for this operation, when present its use must be sig");
  if (t.key_ops !== void 0 && t.key_ops.includes?.(r) !== !0)
    throw new TypeError(`Invalid key for this operation, when present its key_ops must include ${r}`);
  if (t.alg !== void 0 && t.alg !== e)
    throw new TypeError(`Invalid key for this operation, when present its alg must be ${e}`);
  return !0;
}, "jwkMatchesOp"), Xc = /* @__PURE__ */ o((e, t, r, n) => {
  if (!(t instanceof Uint8Array)) {
    if (n && Ue(t)) {
      if (Pi(t) && jn(e, t, r))
        return;
      throw new TypeError('JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present');
    }
    if (!Bn(t))
      throw new TypeError(Wn(e, t, ...W, "Uint8Array", n ? "JSON Web Key" : null));
    if (t.type !== "secret")
      throw new TypeError(`${Xe(t)} instances for symmetric algorithms must be of type "secret"`);
  }
}, "symmetricTypeCheck"), Yc = /* @__PURE__ */ o((e, t, r, n) => {
  if (n && Ue(t))
    switch (r) {
      case "sign":
        if (Ci(t) && jn(e, t, r))
          return;
        throw new TypeError("JSON Web Key for this operation be a private JWK");
      case "verify":
        if (Ri(t) && jn(e, t, r))
          return;
        throw new TypeError("JSON Web Key for this operation be a public JWK");
    }
  if (!Bn(t))
    throw new TypeError(Wn(e, t, ...W, n ? "JSON Web Key" : null));
  if (t.type === "secret")
    throw new TypeError(`${Xe(t)} instances for asymmetric algorithms must not be of type "secret"`);
  if (r === "sign" && t.type === "public")
    throw new TypeError(`${Xe(t)} instances for asymmetric algorithm signing must be of type "private"`);
  if (r === "decrypt" && t.type === "public")
    throw new TypeError(`${Xe(t)} instances for asymmetric algorithm decryption must be of type "private"`);
  if (t.algorithm && r === "verify" && t.type === "private")
    throw new TypeError(`${Xe(t)} instances for asymmetric algorithm verifying must be of type "public"`);
  if (t.algorithm && r === "encrypt" && t.type === "private")
    throw new TypeError(`${Xe(t)} instances for asymmetric algorithm encryption must be of type "public"`);
}, "asymmetricTypeCheck");
function Hi(e, t, r, n) {
  t.startsWith("HS") || t === "dir" || t.startsWith("PBES2") || /^A\d{3}(?:GCM)?KW$/.test(t) ? Xc(t, r, n, e) : Yc(t, r, n, e);
}
o(Hi, "checkKeyType");
var Sr = Hi.bind(void 0, !1), Ki = Hi.bind(void 0, !0);

// node_modules/jose/dist/browser/runtime/encrypt.js
async function Zc(e, t, r, n, i) {
  if (!(r instanceof Uint8Array))
    throw new TypeError(z(r, "Uint8Array"));
  let s = parseInt(e.slice(1, 4), 10), a = await v.subtle.importKey("raw", r.subarray(s >> 3), "AES-CBC", !1, ["encrypt"]), c = await v.subtle.importKey("raw", r.subarray(0, s >> 3), {
    hash: `SHA-${s << 1}`,
    name: "HMAC"
  }, !1, ["sign"]), d = new Uint8Array(await v.subtle.encrypt({
    iv: n,
    name: "AES-CBC"
  }, a, t)), l = Z(i, n, d, fr(i.length << 3)), u = new Uint8Array((await v.subtle.sign("HMAC", c, l)).slice(0, s >> 3));
  return { ciphertext: d, tag: u, iv: n };
}
o(Zc, "cbcEncrypt");
async function Qc(e, t, r, n, i) {
  let s;
  r instanceof Uint8Array ? s = await v.subtle.importKey("raw", r, "AES-GCM", !1, ["encrypt"]) : (ee(r, e, "encrypt"), s = r);
  let a = new Uint8Array(await v.subtle.encrypt({
    additionalData: i,
    iv: n,
    name: "AES-GCM",
    tagLength: 128
  }, s, t)), c = a.slice(-16);
  return { ciphertext: a.slice(0, -16), tag: c, iv: n };
}
o(Qc, "gcmEncrypt");
var eu = /* @__PURE__ */ o(async (e, t, r, n, i) => {
  if (!J(r) && !(r instanceof Uint8Array))
    throw new TypeError(z(r, ...W, "Uint8Array"));
  switch (n ? mr(e, n) : n = mi(e), e) {
    case "A128CBC-HS256":
    case "A192CBC-HS384":
    case "A256CBC-HS512":
      return r instanceof Uint8Array && Me(r, parseInt(e.slice(-3), 10)), Zc(e, t, r, n, i);
    case "A128GCM":
    case "A192GCM":
    case "A256GCM":
      return r instanceof Uint8Array && Me(r, parseInt(e.slice(1, 4), 10)), Qc(e, t, r, n, i);
    default:
      throw new C("Unsupported JWE Content Encryption Algorithm");
  }
}, "encrypt"), vr = eu;

// node_modules/jose/dist/browser/lib/aesgcmkw.js
async function $i(e, t, r, n) {
  let i = e.slice(0, 7), s = await vr(i, r, t, n, new Uint8Array(0));
  return {
    encryptedKey: s.ciphertext,
    iv: $(s.iv),
    tag: $(s.tag)
  };
}
o($i, "wrap");
async function Ni(e, t, r, n, i) {
  let s = e.slice(0, 7);
  return wr(s, t, r, n, i, new Uint8Array(0));
}
o(Ni, "unwrap");

// node_modules/jose/dist/browser/lib/decrypt_key_management.js
async function tu(e, t, r, n, i) {
  switch (Sr(e, t, "decrypt"), t = await Oe.normalizePrivateKey?.(t, e) || t, e) {
    case "dir": {
      if (r !== void 0)
        throw new g("Encountered unexpected JWE Encrypted Key");
      return t;
    }
    case "ECDH-ES":
      if (r !== void 0)
        throw new g("Encountered unexpected JWE Encrypted Key");
    case "ECDH-ES+A128KW":
    case "ECDH-ES+A192KW":
    case "ECDH-ES+A256KW": {
      if (!Y(n.epk))
        throw new g('JOSE Header "epk" (Ephemeral Public Key) missing or invalid');
      if (!br(t))
        throw new C("ECDH with the provided key is not allowed or not supported by your javascript runtime");
      let s = await Mn(n.epk, e), a, c;
      if (n.apu !== void 0) {
        if (typeof n.apu != "string")
          throw new g('JOSE Header "apu" (Agreement PartyUInfo) invalid');
        try {
          a = M(n.apu);
        } catch {
          throw new g("Failed to base64url decode the apu");
        }
      }
      if (n.apv !== void 0) {
        if (typeof n.apv != "string")
          throw new g('JOSE Header "apv" (Agreement PartyVInfo) invalid');
        try {
          c = M(n.apv);
        } catch {
          throw new g("Failed to base64url decode the apv");
        }
      }
      let d = await gr(s, t, e === "ECDH-ES" ? n.enc : e, e === "ECDH-ES" ? wt(n.enc) : parseInt(e.slice(-5, -2), 10), a, c);
      if (e === "ECDH-ES")
        return d;
      if (r === void 0)
        throw new g("JWE Encrypted Key missing");
      return mt(e.slice(-6), d, r);
    }
    case "RSA1_5":
    case "RSA-OAEP":
    case "RSA-OAEP-256":
    case "RSA-OAEP-384":
    case "RSA-OAEP-512": {
      if (r === void 0)
        throw new g("JWE Encrypted Key missing");
      return Ti(e, t, r);
    }
    case "PBES2-HS256+A128KW":
    case "PBES2-HS384+A192KW":
    case "PBES2-HS512+A256KW": {
      if (r === void 0)
        throw new g("JWE Encrypted Key missing");
      if (typeof n.p2c != "number")
        throw new g('JOSE Header "p2c" (PBES2 Count) missing or invalid');
      let s = i?.maxPBES2Count || 1e4;
      if (n.p2c > s)
        throw new g('JOSE Header "p2c" (PBES2 Count) out is of acceptable bounds');
      if (typeof n.p2s != "string")
        throw new g('JOSE Header "p2s" (PBES2 Salt) missing or invalid');
      let a;
      try {
        a = M(n.p2s);
      } catch {
        throw new g("Failed to base64url decode the p2s");
      }
      return ki(e, t, r, n.p2c, a);
    }
    case "A128KW":
    case "A192KW":
    case "A256KW": {
      if (r === void 0)
        throw new g("JWE Encrypted Key missing");
      return mt(e, t, r);
    }
    case "A128GCMKW":
    case "A192GCMKW":
    case "A256GCMKW": {
      if (r === void 0)
        throw new g("JWE Encrypted Key missing");
      if (typeof n.iv != "string")
        throw new g('JOSE Header "iv" (Initialization Vector) missing or invalid');
      if (typeof n.tag != "string")
        throw new g('JOSE Header "tag" (Authentication Tag) missing or invalid');
      let s;
      try {
        s = M(n.iv);
      } catch {
        throw new g("Failed to base64url decode the iv");
      }
      let a;
      try {
        a = M(n.tag);
      } catch {
        throw new g("Failed to base64url decode the tag");
      }
      return Ni(e, t, r, s, a);
    }
    default:
      throw new C('Invalid or unsupported "alg" (JWE Algorithm) header value');
  }
}
o(tu, "decryptKeyManagement");
var Wi = tu;

// node_modules/jose/dist/browser/lib/validate_crit.js
function ru(e, t, r, n, i) {
  if (i.crit !== void 0 && n?.crit === void 0)
    throw new e('"crit" (Critical) Header Parameter MUST be integrity protected');
  if (!n || n.crit === void 0)
    return /* @__PURE__ */ new Set();
  if (!Array.isArray(n.crit) || n.crit.length === 0 || n.crit.some((a) => typeof a != "string" || a.length === 0))
    throw new e('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
  let s;
  r !== void 0 ? s = new Map([...Object.entries(r), ...t.entries()]) : s = t;
  for (let a of n.crit) {
    if (!s.has(a))
      throw new C(`Extension Header Parameter "${a}" is not recognized`);
    if (i[a] === void 0)
      throw new e(`Extension Header Parameter "${a}" is missing`);
    if (s.get(a) && n[a] === void 0)
      throw new e(`Extension Header Parameter "${a}" MUST be integrity protected`);
  }
  return new Set(n.crit);
}
o(ru, "validateCrit");
var Ye = ru;

// node_modules/jose/dist/browser/lib/validate_algorithms.js
var nu = /* @__PURE__ */ o((e, t) => {
  if (t !== void 0 && (!Array.isArray(t) || t.some((r) => typeof r != "string")))
    throw new TypeError(`"${e}" option must be an array of strings`);
  if (t)
    return new Set(t);
}, "validateAlgorithms"), Vn = nu;

// node_modules/jose/dist/browser/jwe/flattened/decrypt.js
async function Bi(e, t, r) {
  if (!Y(e))
    throw new g("Flattened JWE must be an object");
  if (e.protected === void 0 && e.header === void 0 && e.unprotected === void 0)
    throw new g("JOSE Header missing");
  if (e.iv !== void 0 && typeof e.iv != "string")
    throw new g("JWE Initialization Vector incorrect type");
  if (typeof e.ciphertext != "string")
    throw new g("JWE Ciphertext missing or incorrect type");
  if (e.tag !== void 0 && typeof e.tag != "string")
    throw new g("JWE Authentication Tag incorrect type");
  if (e.protected !== void 0 && typeof e.protected != "string")
    throw new g("JWE Protected Header incorrect type");
  if (e.encrypted_key !== void 0 && typeof e.encrypted_key != "string")
    throw new g("JWE Encrypted Key incorrect type");
  if (e.aad !== void 0 && typeof e.aad != "string")
    throw new g("JWE AAD incorrect type");
  if (e.header !== void 0 && !Y(e.header))
    throw new g("JWE Shared Unprotected Header incorrect type");
  if (e.unprotected !== void 0 && !Y(e.unprotected))
    throw new g("JWE Per-Recipient Unprotected Header incorrect type");
  let n;
  if (e.protected)
    try {
      let k = M(e.protected);
      n = JSON.parse(ne.decode(k));
    } catch {
      throw new g("JWE Protected Header is invalid");
    }
  if (!je(n, e.header, e.unprotected))
    throw new g("JWE Protected, JWE Unprotected Header, and JWE Per-Recipient Unprotected Header Parameter names must be disjoint");
  let i = {
    ...n,
    ...e.header,
    ...e.unprotected
  };
  if (Ye(g, /* @__PURE__ */ new Map(), r?.crit, n, i), i.zip !== void 0)
    throw new C('JWE "zip" (Compression Algorithm) Header Parameter is not supported.');
  let { alg: s, enc: a } = i;
  if (typeof s != "string" || !s)
    throw new g("missing JWE Algorithm (alg) in JWE Header");
  if (typeof a != "string" || !a)
    throw new g("missing JWE Encryption Algorithm (enc) in JWE Header");
  let c = r && Vn("keyManagementAlgorithms", r.keyManagementAlgorithms), d = r && Vn("contentEncryptionAlgorithms", r.contentEncryptionAlgorithms);
  if (c && !c.has(s) || !c && s.startsWith("PBES2"))
    throw new Je('"alg" (Algorithm) Header Parameter value not allowed');
  if (d && !d.has(a))
    throw new Je('"enc" (Encryption Algorithm) Header Parameter value not allowed');
  let l;
  if (e.encrypted_key !== void 0)
    try {
      l = M(e.encrypted_key);
    } catch {
      throw new g("Failed to base64url decode the encrypted_key");
    }
  let u = !1;
  typeof t == "function" && (t = await t(n, e), u = !0);
  let f;
  try {
    f = await Wi(s, t, l, i, r);
  } catch (k) {
    if (k instanceof TypeError || k instanceof g || k instanceof C)
      throw k;
    f = _e(a);
  }
  let m, h;
  if (e.iv !== void 0)
    try {
      m = M(e.iv);
    } catch {
      throw new g("Failed to base64url decode the iv");
    }
  if (e.tag !== void 0)
    try {
      h = M(e.tag);
    } catch {
      throw new g("Failed to base64url decode the tag");
    }
  let p = K.encode(e.protected ?? ""), b;
  e.aad !== void 0 ? b = Z(p, K.encode("."), K.encode(e.aad)) : b = p;
  let w;
  try {
    w = M(e.ciphertext);
  } catch {
    throw new g("Failed to base64url decode the ciphertext");
  }
  let E = { plaintext: await wr(a, f, w, m, h, b) };
  if (e.protected !== void 0 && (E.protectedHeader = n), e.aad !== void 0)
    try {
      E.additionalAuthenticatedData = M(e.aad);
    } catch {
      throw new g("Failed to base64url decode the aad");
    }
  return e.unprotected !== void 0 && (E.sharedUnprotectedHeader = e.unprotected), e.header !== void 0 && (E.unprotectedHeader = e.header), u ? { ...E, key: t } : E;
}
o(Bi, "flattenedDecrypt");

// node_modules/jose/dist/browser/jwe/compact/decrypt.js
async function Ji(e, t, r) {
  if (e instanceof Uint8Array && (e = ne.decode(e)), typeof e != "string")
    throw new g("Compact JWE must be a string or Uint8Array");
  let { 0: n, 1: i, 2: s, 3: a, 4: c, length: d } = e.split(".");
  if (d !== 5)
    throw new g("Invalid Compact JWE");
  let l = await Bi({
    ciphertext: a,
    iv: s || void 0,
    protected: n,
    tag: c || void 0,
    encrypted_key: i || void 0
  }, t, r), u = { plaintext: l.plaintext, protectedHeader: l.protectedHeader };
  return typeof t == "function" ? { ...u, key: l.key } : u;
}
o(Ji, "compactDecrypt");

// node_modules/jose/dist/browser/lib/private_symbols.js
var zi = Symbol();

// node_modules/jose/dist/browser/runtime/key_to_jwk.js
var ou = /* @__PURE__ */ o(async (e) => {
  if (e instanceof Uint8Array)
    return {
      kty: "oct",
      k: $(e)
    };
  if (!J(e))
    throw new TypeError(z(e, ...W, "Uint8Array"));
  if (!e.extractable)
    throw new TypeError("non-extractable CryptoKey cannot be exported as a JWK");
  let { ext: t, key_ops: r, alg: n, use: i, ...s } = await v.subtle.exportKey("jwk", e);
  return s;
}, "keyToJWK"), Mi = ou;

// node_modules/jose/dist/browser/key/export.js
async function ji(e) {
  return Mi(e);
}
o(ji, "exportJWK");

// node_modules/jose/dist/browser/lib/encrypt_key_management.js
async function iu(e, t, r, n, i = {}) {
  let s, a, c;
  switch (Sr(e, r, "encrypt"), r = await Oe.normalizePublicKey?.(r, e) || r, e) {
    case "dir": {
      c = r;
      break;
    }
    case "ECDH-ES":
    case "ECDH-ES+A128KW":
    case "ECDH-ES+A192KW":
    case "ECDH-ES+A256KW": {
      if (!br(r))
        throw new C("ECDH with the provided key is not allowed or not supported by your javascript runtime");
      let { apu: d, apv: l } = i, { epk: u } = i;
      u || (u = (await Si(r)).privateKey);
      let { x: f, y: m, crv: h, kty: p } = await ji(u), b = await gr(r, u, e === "ECDH-ES" ? t : e, e === "ECDH-ES" ? wt(t) : parseInt(e.slice(-5, -2), 10), d, l);
      if (a = { epk: { x: f, crv: h, kty: p } }, p === "EC" && (a.epk.y = m), d && (a.apu = $(d)), l && (a.apv = $(l)), e === "ECDH-ES") {
        c = b;
        break;
      }
      c = n || _e(t);
      let w = e.slice(-6);
      s = await ht(w, b, c);
      break;
    }
    case "RSA1_5":
    case "RSA-OAEP":
    case "RSA-OAEP-256":
    case "RSA-OAEP-384":
    case "RSA-OAEP-512": {
      c = n || _e(t), s = await Ii(e, r, c);
      break;
    }
    case "PBES2-HS256+A128KW":
    case "PBES2-HS384+A192KW":
    case "PBES2-HS512+A256KW": {
      c = n || _e(t);
      let { p2c: d, p2s: l } = i;
      ({ encryptedKey: s, ...a } = await Ei(e, r, c, d, l));
      break;
    }
    case "A128KW":
    case "A192KW":
    case "A256KW": {
      c = n || _e(t), s = await ht(e, r, c);
      break;
    }
    case "A128GCMKW":
    case "A192GCMKW":
    case "A256GCMKW": {
      c = n || _e(t);
      let { iv: d } = i;
      ({ encryptedKey: s, ...a } = await $i(e, r, c, d));
      break;
    }
    default:
      throw new C('Invalid or unsupported "alg" (JWE Algorithm) header value');
  }
  return { cek: c, encryptedKey: s, parameters: a };
}
o(iu, "encryptKeyManagement");
var Vi = iu;

// node_modules/jose/dist/browser/jwe/flattened/encrypt.js
var Ar = class {
  static {
    o(this, "FlattenedEncrypt");
  }
  constructor(t) {
    if (!(t instanceof Uint8Array))
      throw new TypeError("plaintext must be an instance of Uint8Array");
    this._plaintext = t;
  }
  setKeyManagementParameters(t) {
    if (this._keyManagementParameters)
      throw new TypeError("setKeyManagementParameters can only be called once");
    return this._keyManagementParameters = t, this;
  }
  setProtectedHeader(t) {
    if (this._protectedHeader)
      throw new TypeError("setProtectedHeader can only be called once");
    return this._protectedHeader = t, this;
  }
  setSharedUnprotectedHeader(t) {
    if (this._sharedUnprotectedHeader)
      throw new TypeError("setSharedUnprotectedHeader can only be called once");
    return this._sharedUnprotectedHeader = t, this;
  }
  setUnprotectedHeader(t) {
    if (this._unprotectedHeader)
      throw new TypeError("setUnprotectedHeader can only be called once");
    return this._unprotectedHeader = t, this;
  }
  setAdditionalAuthenticatedData(t) {
    return this._aad = t, this;
  }
  setContentEncryptionKey(t) {
    if (this._cek)
      throw new TypeError("setContentEncryptionKey can only be called once");
    return this._cek = t, this;
  }
  setInitializationVector(t) {
    if (this._iv)
      throw new TypeError("setInitializationVector can only be called once");
    return this._iv = t, this;
  }
  async encrypt(t, r) {
    if (!this._protectedHeader && !this._unprotectedHeader && !this._sharedUnprotectedHeader)
      throw new g("either setProtectedHeader, setUnprotectedHeader, or sharedUnprotectedHeader must be called before #encrypt()");
    if (!je(this._protectedHeader, this._unprotectedHeader, this._sharedUnprotectedHeader))
      throw new g("JWE Protected, JWE Shared Unprotected and JWE Per-Recipient Header Parameter names must be disjoint");
    let n = {
      ...this._protectedHeader,
      ...this._unprotectedHeader,
      ...this._sharedUnprotectedHeader
    };
    if (Ye(g, /* @__PURE__ */ new Map(), r?.crit, this._protectedHeader, n), n.zip !== void 0)
      throw new C('JWE "zip" (Compression Algorithm) Header Parameter is not supported.');
    let { alg: i, enc: s } = n;
    if (typeof i != "string" || !i)
      throw new g('JWE "alg" (Algorithm) Header Parameter missing or invalid');
    if (typeof s != "string" || !s)
      throw new g('JWE "enc" (Encryption Algorithm) Header Parameter missing or invalid');
    let a;
    if (this._cek && (i === "dir" || i === "ECDH-ES"))
      throw new TypeError(`setContentEncryptionKey cannot be called with JWE "alg" (Algorithm) Header ${i}`);
    let c;
    {
      let b;
      ({ cek: c, encryptedKey: a, parameters: b } = await Vi(i, s, t, this._cek, this._keyManagementParameters)), b && (r && zi in r ? this._unprotectedHeader ? this._unprotectedHeader = { ...this._unprotectedHeader, ...b } : this.setUnprotectedHeader(b) : this._protectedHeader ? this._protectedHeader = { ...this._protectedHeader, ...b } : this.setProtectedHeader(b));
    }
    let d, l, u;
    this._protectedHeader ? l = K.encode($(JSON.stringify(this._protectedHeader))) : l = K.encode(""), this._aad ? (u = $(this._aad), d = Z(l, K.encode("."), K.encode(u))) : d = l;
    let { ciphertext: f, tag: m, iv: h } = await vr(s, this._plaintext, c, this._iv, d), p = {
      ciphertext: $(f)
    };
    return h && (p.iv = $(h)), m && (p.tag = $(m)), a && (p.encrypted_key = $(a)), u && (p.aad = u), this._protectedHeader && (p.protected = ne.decode(l)), this._sharedUnprotectedHeader && (p.unprotected = this._sharedUnprotectedHeader), this._unprotectedHeader && (p.header = this._unprotectedHeader), p;
  }
};

// node_modules/jose/dist/browser/runtime/subtle_dsa.js
function Fn(e, t) {
  let r = `SHA-${e.slice(-3)}`;
  switch (e) {
    case "HS256":
    case "HS384":
    case "HS512":
      return { hash: r, name: "HMAC" };
    case "PS256":
    case "PS384":
    case "PS512":
      return { hash: r, name: "RSA-PSS", saltLength: e.slice(-3) >> 3 };
    case "RS256":
    case "RS384":
    case "RS512":
      return { hash: r, name: "RSASSA-PKCS1-v1_5" };
    case "ES256":
    case "ES384":
    case "ES512":
      return { hash: r, name: "ECDSA", namedCurve: t.namedCurve };
    case "Ed25519":
      return { name: "Ed25519" };
    case "EdDSA":
      return { name: t.name };
    default:
      throw new C(`alg ${e} is not supported either by JOSE or your javascript runtime`);
  }
}
o(Fn, "subtleDsa");

// node_modules/jose/dist/browser/runtime/get_sign_verify_key.js
async function Gn(e, t, r) {
  if (r === "sign" && (t = await Oe.normalizePrivateKey(t, e)), r === "verify" && (t = await Oe.normalizePublicKey(t, e)), J(t))
    return gi(t, e, r), t;
  if (t instanceof Uint8Array) {
    if (!e.startsWith("HS"))
      throw new TypeError(z(t, ...W));
    return v.subtle.importKey("raw", t, { hash: `SHA-${e.slice(-3)}`, name: "HMAC" }, !1, [r]);
  }
  throw new TypeError(z(t, ...W, "Uint8Array", "JSON Web Key"));
}
o(Gn, "getCryptoKey");

// node_modules/jose/dist/browser/lib/epoch.js
var de = /* @__PURE__ */ o((e) => Math.floor(e.getTime() / 1e3), "default");

// node_modules/jose/dist/browser/lib/secs.js
var su = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i, De = /* @__PURE__ */ o((e) => {
  let t = su.exec(e);
  if (!t || t[4] && t[1])
    throw new TypeError("Invalid time period format");
  let r = parseFloat(t[2]), n = t[3].toLowerCase(), i;
  switch (n) {
    case "sec":
    case "secs":
    case "second":
    case "seconds":
    case "s":
      i = Math.round(r);
      break;
    case "minute":
    case "minutes":
    case "min":
    case "mins":
    case "m":
      i = Math.round(r * 60);
      break;
    case "hour":
    case "hours":
    case "hr":
    case "hrs":
    case "h":
      i = Math.round(r * 3600);
      break;
    case "day":
    case "days":
    case "d":
      i = Math.round(r * 86400);
      break;
    case "week":
    case "weeks":
    case "w":
      i = Math.round(r * 604800);
      break;
    default:
      i = Math.round(r * 31557600);
      break;
  }
  return t[1] === "-" || t[4] === "ago" ? -i : i;
}, "default");

// node_modules/jose/dist/browser/lib/jwt_claims_set.js
var Fi = /* @__PURE__ */ o((e) => e.toLowerCase().replace(/^application\//, ""), "normalizeTyp"), au = /* @__PURE__ */ o((e, t) => typeof e == "string" ? t.includes(e) : Array.isArray(e) ? t.some(Set.prototype.has.bind(new Set(e))) : !1, "checkAudiencePresence"), Gi = /* @__PURE__ */ o((e, t, r = {}) => {
  let n;
  try {
    n = JSON.parse(ne.decode(t));
  } catch {
  }
  if (!Y(n))
    throw new Pe("JWT Claims Set must be a top-level JSON object");
  let { typ: i } = r;
  if (i && (typeof e.typ != "string" || Fi(e.typ) !== Fi(i)))
    throw new G('unexpected "typ" JWT header value', n, "typ", "check_failed");
  let { requiredClaims: s = [], issuer: a, subject: c, audience: d, maxTokenAge: l } = r, u = [...s];
  l !== void 0 && u.push("iat"), d !== void 0 && u.push("aud"), c !== void 0 && u.push("sub"), a !== void 0 && u.push("iss");
  for (let p of new Set(u.reverse()))
    if (!(p in n))
      throw new G(`missing required "${p}" claim`, n, p, "missing");
  if (a && !(Array.isArray(a) ? a : [a]).includes(n.iss))
    throw new G('unexpected "iss" claim value', n, "iss", "check_failed");
  if (c && n.sub !== c)
    throw new G('unexpected "sub" claim value', n, "sub", "check_failed");
  if (d && !au(n.aud, typeof d == "string" ? [d] : d))
    throw new G('unexpected "aud" claim value', n, "aud", "check_failed");
  let f;
  switch (typeof r.clockTolerance) {
    case "string":
      f = De(r.clockTolerance);
      break;
    case "number":
      f = r.clockTolerance;
      break;
    case "undefined":
      f = 0;
      break;
    default:
      throw new TypeError("Invalid clockTolerance option type");
  }
  let { currentDate: m } = r, h = de(m || /* @__PURE__ */ new Date());
  if ((n.iat !== void 0 || l) && typeof n.iat != "number")
    throw new G('"iat" claim must be a number', n, "iat", "invalid");
  if (n.nbf !== void 0) {
    if (typeof n.nbf != "number")
      throw new G('"nbf" claim must be a number', n, "nbf", "invalid");
    if (n.nbf > h + f)
      throw new G('"nbf" claim timestamp check failed', n, "nbf", "check_failed");
  }
  if (n.exp !== void 0) {
    if (typeof n.exp != "number")
      throw new G('"exp" claim must be a number', n, "exp", "invalid");
    if (n.exp <= h - f)
      throw new Be('"exp" claim timestamp check failed', n, "exp", "check_failed");
  }
  if (l) {
    let p = h - n.iat, b = typeof l == "number" ? l : De(l);
    if (p - f > b)
      throw new Be('"iat" claim timestamp check failed (too far in the past)', n, "iat", "check_failed");
    if (p < 0 - f)
      throw new G('"iat" claim timestamp check failed (it should be in the past)', n, "iat", "check_failed");
  }
  return n;
}, "default");

// node_modules/jose/dist/browser/jwt/decrypt.js
async function qn(e, t, r) {
  let n = await Ji(e, t, r), i = Gi(n.protectedHeader, n.plaintext, r), { protectedHeader: s } = n;
  if (s.iss !== void 0 && s.iss !== i.iss)
    throw new G('replicated "iss" claim header parameter mismatch', i, "iss", "mismatch");
  if (s.sub !== void 0 && s.sub !== i.sub)
    throw new G('replicated "sub" claim header parameter mismatch', i, "sub", "mismatch");
  if (s.aud !== void 0 && JSON.stringify(s.aud) !== JSON.stringify(i.aud))
    throw new G('replicated "aud" claim header parameter mismatch', i, "aud", "mismatch");
  let a = { payload: i, protectedHeader: s };
  return typeof t == "function" ? { ...a, key: n.key } : a;
}
o(qn, "jwtDecrypt");

// node_modules/jose/dist/browser/jwe/compact/encrypt.js
var Er = class {
  static {
    o(this, "CompactEncrypt");
  }
  constructor(t) {
    this._flattened = new Ar(t);
  }
  setContentEncryptionKey(t) {
    return this._flattened.setContentEncryptionKey(t), this;
  }
  setInitializationVector(t) {
    return this._flattened.setInitializationVector(t), this;
  }
  setProtectedHeader(t) {
    return this._flattened.setProtectedHeader(t), this;
  }
  setKeyManagementParameters(t) {
    return this._flattened.setKeyManagementParameters(t), this;
  }
  async encrypt(t, r) {
    let n = await this._flattened.encrypt(t, r);
    return [n.protected, n.encrypted_key, n.iv, n.ciphertext, n.tag].join(".");
  }
};

// node_modules/jose/dist/browser/runtime/sign.js
var cu = /* @__PURE__ */ o(async (e, t, r) => {
  let n = await Gn(e, t, "sign");
  yt(e, n);
  let i = await v.subtle.sign(Fn(e, n.algorithm), n, r);
  return new Uint8Array(i);
}, "sign"), qi = cu;

// node_modules/jose/dist/browser/jws/flattened/sign.js
var kr = class {
  static {
    o(this, "FlattenedSign");
  }
  constructor(t) {
    if (!(t instanceof Uint8Array))
      throw new TypeError("payload must be an instance of Uint8Array");
    this._payload = t;
  }
  setProtectedHeader(t) {
    if (this._protectedHeader)
      throw new TypeError("setProtectedHeader can only be called once");
    return this._protectedHeader = t, this;
  }
  setUnprotectedHeader(t) {
    if (this._unprotectedHeader)
      throw new TypeError("setUnprotectedHeader can only be called once");
    return this._unprotectedHeader = t, this;
  }
  async sign(t, r) {
    if (!this._protectedHeader && !this._unprotectedHeader)
      throw new me("either setProtectedHeader or setUnprotectedHeader must be called before #sign()");
    if (!je(this._protectedHeader, this._unprotectedHeader))
      throw new me("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
    let n = {
      ...this._protectedHeader,
      ...this._unprotectedHeader
    }, i = Ye(me, /* @__PURE__ */ new Map([["b64", !0]]), r?.crit, this._protectedHeader, n), s = !0;
    if (i.has("b64") && (s = this._protectedHeader.b64, typeof s != "boolean"))
      throw new me('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
    let { alg: a } = n;
    if (typeof a != "string" || !a)
      throw new me('JWS "alg" (Algorithm) Header Parameter missing or invalid');
    Ki(a, t, "sign");
    let c = this._payload;
    s && (c = K.encode($(c)));
    let d;
    this._protectedHeader ? d = K.encode($(JSON.stringify(this._protectedHeader))) : d = K.encode("");
    let l = Z(d, K.encode("."), c), u = await qi(a, t, l), f = {
      signature: $(u),
      payload: ""
    };
    return s && (f.payload = ne.decode(c)), this._unprotectedHeader && (f.header = this._unprotectedHeader), this._protectedHeader && (f.protected = ne.decode(d)), f;
  }
};

// node_modules/jose/dist/browser/jws/compact/sign.js
var Ir = class {
  static {
    o(this, "CompactSign");
  }
  constructor(t) {
    this._flattened = new kr(t);
  }
  setProtectedHeader(t) {
    return this._flattened.setProtectedHeader(t), this;
  }
  async sign(t, r) {
    let n = await this._flattened.sign(t, r);
    if (n.payload === void 0)
      throw new TypeError("use the flattened module for creating JWS with b64: false");
    return `${n.protected}.${n.payload}.${n.signature}`;
  }
};

// node_modules/jose/dist/browser/jwt/produce.js
function Le(e, t) {
  if (!Number.isFinite(t))
    throw new TypeError(`Invalid ${e} input`);
  return t;
}
o(Le, "validateInput");
var Ze = class {
  static {
    o(this, "ProduceJWT");
  }
  constructor(t = {}) {
    if (!Y(t))
      throw new TypeError("JWT Claims Set MUST be an object");
    this._payload = t;
  }
  setIssuer(t) {
    return this._payload = { ...this._payload, iss: t }, this;
  }
  setSubject(t) {
    return this._payload = { ...this._payload, sub: t }, this;
  }
  setAudience(t) {
    return this._payload = { ...this._payload, aud: t }, this;
  }
  setJti(t) {
    return this._payload = { ...this._payload, jti: t }, this;
  }
  setNotBefore(t) {
    return typeof t == "number" ? this._payload = { ...this._payload, nbf: Le("setNotBefore", t) } : t instanceof Date ? this._payload = { ...this._payload, nbf: Le("setNotBefore", de(t)) } : this._payload = { ...this._payload, nbf: de(/* @__PURE__ */ new Date()) + De(t) }, this;
  }
  setExpirationTime(t) {
    return typeof t == "number" ? this._payload = { ...this._payload, exp: Le("setExpirationTime", t) } : t instanceof Date ? this._payload = { ...this._payload, exp: Le("setExpirationTime", de(t)) } : this._payload = { ...this._payload, exp: de(/* @__PURE__ */ new Date()) + De(t) }, this;
  }
  setIssuedAt(t) {
    return typeof t > "u" ? this._payload = { ...this._payload, iat: de(/* @__PURE__ */ new Date()) } : t instanceof Date ? this._payload = { ...this._payload, iat: Le("setIssuedAt", de(t)) } : typeof t == "string" ? this._payload = {
      ...this._payload,
      iat: Le("setIssuedAt", de(/* @__PURE__ */ new Date()) + De(t))
    } : this._payload = { ...this._payload, iat: Le("setIssuedAt", t) }, this;
  }
};

// node_modules/jose/dist/browser/jwt/sign.js
var gt = class extends Ze {
  static {
    o(this, "SignJWT");
  }
  setProtectedHeader(t) {
    return this._protectedHeader = t, this;
  }
  async sign(t, r) {
    let n = new Ir(K.encode(JSON.stringify(this._payload)));
    if (n.setProtectedHeader(this._protectedHeader), Array.isArray(this._protectedHeader?.crit) && this._protectedHeader.crit.includes("b64") && this._protectedHeader.b64 === !1)
      throw new Pe("JWTs MUST NOT use unencoded payload");
    return n.sign(t, r);
  }
};

// node_modules/jose/dist/browser/jwt/encrypt.js
var bt = class extends Ze {
  static {
    o(this, "EncryptJWT");
  }
  setProtectedHeader(t) {
    if (this._protectedHeader)
      throw new TypeError("setProtectedHeader can only be called once");
    return this._protectedHeader = t, this;
  }
  setKeyManagementParameters(t) {
    if (this._keyManagementParameters)
      throw new TypeError("setKeyManagementParameters can only be called once");
    return this._keyManagementParameters = t, this;
  }
  setContentEncryptionKey(t) {
    if (this._cek)
      throw new TypeError("setContentEncryptionKey can only be called once");
    return this._cek = t, this;
  }
  setInitializationVector(t) {
    if (this._iv)
      throw new TypeError("setInitializationVector can only be called once");
    return this._iv = t, this;
  }
  replicateIssuerAsHeader() {
    return this._replicateIssuerAsHeader = !0, this;
  }
  replicateSubjectAsHeader() {
    return this._replicateSubjectAsHeader = !0, this;
  }
  replicateAudienceAsHeader() {
    return this._replicateAudienceAsHeader = !0, this;
  }
  async encrypt(t, r) {
    let n = new Er(K.encode(JSON.stringify(this._payload)));
    return this._replicateIssuerAsHeader && (this._protectedHeader = { ...this._protectedHeader, iss: this._payload.iss }), this._replicateSubjectAsHeader && (this._protectedHeader = { ...this._protectedHeader, sub: this._payload.sub }), this._replicateAudienceAsHeader && (this._protectedHeader = { ...this._protectedHeader, aud: this._payload.aud }), n.setProtectedHeader(this._protectedHeader), this._iv && n.setInitializationVector(this._iv), this._cek && n.setContentEncryptionKey(this._cek), this._keyManagementParameters && n.setKeyManagementParameters(this._keyManagementParameters), n.encrypt(t, r);
  }
};

// node_modules/jose/dist/browser/jwk/thumbprint.js
var Se = /* @__PURE__ */ o((e, t) => {
  if (typeof e != "string" || !e)
    throw new pt(`${t} missing or invalid`);
}, "check");
async function Tr(e, t) {
  if (!Y(e))
    throw new TypeError("JWK must be an object");
  if (t ?? (t = "sha256"), t !== "sha256" && t !== "sha384" && t !== "sha512")
    throw new TypeError('digestAlgorithm must one of "sha256", "sha384", or "sha512"');
  let r;
  switch (e.kty) {
    case "EC":
      Se(e.crv, '"crv" (Curve) Parameter'), Se(e.x, '"x" (X Coordinate) Parameter'), Se(e.y, '"y" (Y Coordinate) Parameter'), r = { crv: e.crv, kty: e.kty, x: e.x, y: e.y };
      break;
    case "OKP":
      Se(e.crv, '"crv" (Subtype of Key Pair) Parameter'), Se(e.x, '"x" (Public Key) Parameter'), r = { crv: e.crv, kty: e.kty, x: e.x };
      break;
    case "RSA":
      Se(e.e, '"e" (Exponent) Parameter'), Se(e.n, '"n" (Modulus) Parameter'), r = { e: e.e, kty: e.kty, n: e.n };
      break;
    case "oct":
      Se(e.k, '"k" (Key Value) Parameter'), r = { k: e.k, kty: e.kty };
      break;
    default:
      throw new C('"kty" (Key Type) Parameter missing or unsupported');
  }
  let n = K.encode(JSON.stringify(r));
  return $(await dr(t, n));
}
o(Tr, "calculateJwkThumbprint");

// node_modules/jose/dist/browser/util/base64url.js
var _t = {};
uc(_t, {
  decode: () => du,
  encode: () => uu
});
var uu = $, du = M;

// node_modules/@auth/core/jwt.js
var Su = kn(Yn(), 1);
var vu = 30 * 24 * 60 * 60, Au = /* @__PURE__ */ o(() => Date.now() / 1e3 | 0, "now"), Zi = "dir", Zn = "A256CBC-HS512";
async function Cr(e) {
  let { token: t = {}, secret: r, maxAge: n = vu, salt: i } = e, s = Array.isArray(r) ? r : [r], a = await Qi(Zn, s[0], i), c = await Tr({ kty: "oct", k: _t.encode(a) }, `sha${a.byteLength << 3}`);
  return await new bt(t).setProtectedHeader({ alg: Zi, enc: Zn, kid: c }).setIssuedAt().setExpirationTime(Au() + n).setJti(crypto.randomUUID()).encrypt(a);
}
o(Cr, "encode");
async function Rr(e) {
  let { token: t, secret: r, salt: n } = e, i = Array.isArray(r) ? r : [r];
  if (!t)
    return null;
  let { payload: s } = await qn(t, async ({ kid: a, enc: c }) => {
    for (let d of i) {
      let l = await Qi(c, d, n);
      if (a === void 0)
        return l;
      let u = await Tr({ kty: "oct", k: _t.encode(l) }, `sha${l.byteLength << 3}`);
      if (a === u)
        return l;
    }
    throw new Error("no matching decryption secret");
  }, {
    clockTolerance: 15,
    keyManagementAlgorithms: [Zi],
    contentEncryptionAlgorithms: [Zn, "A256GCM"]
  });
  return s;
}
o(Rr, "decode");
async function Qi(e, t, r) {
  let n;
  switch (e) {
    case "A256CBC-HS512":
      n = 64;
      break;
    case "A256GCM":
      n = 32;
      break;
    default:
      throw new Error("Unsupported JWT Content Encryption Algorithm");
  }
  return await fi("sha256", t, r, `Auth.js Generated Encryption Key (${r})`, n);
}
o(Qi, "getDerivedEncryptionKey");

// node_modules/@auth/core/lib/utils/web.js
var es = kn(Yn(), 1);

// node_modules/@auth/core/lib/utils/logger.js
var Qn = "\x1B[31m", ku = "\x1B[33m", Iu = "\x1B[90m", xt = "\x1B[0m", Tu = {
  error(e) {
    let t = e instanceof U ? e.type : e.name;
    if (console.error(`${Qn}[auth][error]${xt} ${t}: ${e.message}`), e.cause && typeof e.cause == "object" && "err" in e.cause && e.cause.err instanceof Error) {
      let { err: r, ...n } = e.cause;
      console.error(`${Qn}[auth][cause]${xt}:`, r.stack), n && console.error(`${Qn}[auth][details]${xt}:`, JSON.stringify(n, null, 2));
    } else e.stack && console.error(e.stack.replace(/.*/, "").substring(1));
  },
  warn(e) {
    let t = `https://warnings.authjs.dev#${e}`;
    console.warn(`${ku}[auth][warn][${e}]${xt}`, `Read more: ${t}`);
  },
  debug(e, t) {
    console.log(`${Iu}[auth][debug]:${xt} ${e}`, JSON.stringify(t, null, 2));
  }
};
function St(e) {
  let t = {
    ...Tu
  };
  return e.debug || (t.debug = () => {
  }), e.logger?.error && (t.error = e.logger.error), e.logger?.warn && (t.warn = e.logger.warn), e.logger?.debug && (t.debug = e.logger.debug), e.logger ?? (e.logger = t), t;
}
o(St, "setLogger");

// node_modules/oauth4webapi/build/index.js
var ro;
(typeof navigator > "u" || !navigator.userAgent?.startsWith?.("Mozilla/5.0 ")) && (ro = "oauth4webapi/v3.8.3");
function Et(e, t) {
  if (e == null)
    return !1;
  try {
    return e instanceof t || Object.getPrototypeOf(e)[Symbol.toStringTag] === t.prototype[Symbol.toStringTag];
  } catch {
    return !1;
  }
}
o(Et, "looseInstanceOf");
var oe = "ERR_INVALID_ARG_VALUE", te = "ERR_INVALID_ARG_TYPE";
function L(e, t, r) {
  let n = new TypeError(e, { cause: r });
  return Object.assign(n, { code: t }), n;
}
o(L, "CodedTypeError");
var we = Symbol(), ss = Symbol(), Ru = Symbol(), Ae = Symbol(), Dr = Symbol(), no = Symbol(), Vw = Symbol(), Pu = new TextEncoder(), Uu = new TextDecoder();
function le(e) {
  return typeof e == "string" ? Pu.encode(e) : Uu.decode(e);
}
o(le, "buf");
var oo;
Uint8Array.prototype.toBase64 ? oo = /* @__PURE__ */ o((e) => (e instanceof ArrayBuffer && (e = new Uint8Array(e)), e.toBase64({ alphabet: "base64url", omitPadding: !0 })), "encodeBase64Url") : oo = /* @__PURE__ */ o((t) => {
  t instanceof ArrayBuffer && (t = new Uint8Array(t));
  let r = [];
  for (let n = 0; n < t.byteLength; n += 32768)
    r.push(String.fromCharCode.apply(null, t.subarray(n, n + 32768)));
  return btoa(r.join("")).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}, "encodeBase64Url");
var io;
Uint8Array.fromBase64 ? io = /* @__PURE__ */ o((e) => {
  try {
    return Uint8Array.fromBase64(e, { alphabet: "base64url" });
  } catch (t) {
    throw L("The input to be decoded is not correctly encoded.", oe, t);
  }
}, "decodeBase64Url") : io = /* @__PURE__ */ o((e) => {
  try {
    let t = atob(e.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "")), r = new Uint8Array(t.length);
    for (let n = 0; n < t.length; n++)
      r[n] = t.charCodeAt(n);
    return r;
  } catch (t) {
    throw L("The input to be decoded is not correctly encoded.", oe, t);
  }
}, "decodeBase64Url");
function fe(e) {
  return typeof e == "string" ? io(e) : oo(e);
}
o(fe, "b64u");
var re = class extends Error {
  static {
    o(this, "UnsupportedOperationError");
  }
  code;
  constructor(t, r) {
    super(t, r), this.name = this.constructor.name, this.code = gd, Error.captureStackTrace?.(this, this.constructor);
  }
}, so = class extends Error {
  static {
    o(this, "OperationProcessingError");
  }
  code;
  constructor(t, r) {
    super(t, r), this.name = this.constructor.name, r?.code && (this.code = r?.code), Error.captureStackTrace?.(this, this.constructor);
  }
};
function A(e, t, r) {
  return new so(e, { code: t, cause: r });
}
o(A, "OPE");
function Ou(e, t) {
  if (!(e instanceof CryptoKey))
    throw L(`${t} must be a CryptoKey`, te);
}
o(Ou, "assertCryptoKey");
function Du(e, t) {
  if (Ou(e, t), e.type !== "private")
    throw L(`${t} must be a private CryptoKey`, oe);
}
o(Du, "assertPrivateKey");
function Pr(e) {
  return !(e === null || typeof e != "object" || Array.isArray(e));
}
o(Pr, "isJsonObject");
function Lr(e) {
  Et(e, Headers) && (e = Object.fromEntries(e.entries()));
  let t = new Headers(e ?? {});
  if (ro && !t.has("user-agent") && t.set("user-agent", ro), t.has("authorization"))
    throw L('"options.headers" must not include the "authorization" header name', oe);
  return t;
}
o(Lr, "prepareHeaders");
function lo(e, t) {
  if (t !== void 0) {
    if (typeof t == "function" && (t = t(e.href)), !(t instanceof AbortSignal))
      throw L('"options.signal" must return or be an instance of AbortSignal', te);
    return t;
  }
}
o(lo, "signal");
function as(e) {
  return e.includes("//") ? e.replace("//", "/") : e;
}
o(as, "replaceDoubleSlash");
function Lu(e, t, r = !1) {
  return e.pathname === "/" ? e.pathname = t : e.pathname = as(`${t}/${r ? e.pathname : e.pathname.replace(/(\/)$/, "")}`), e;
}
o(Lu, "prependWellKnown");
function Hu(e, t) {
  return e.pathname = as(`${e.pathname}/${t}`), e;
}
o(Hu, "appendWellKnown");
async function Ku(e, t, r, n) {
  if (!(e instanceof URL))
    throw L(`"${t}" must be an instance of URL`, te);
  fo(e, n?.[we] !== !0);
  let i = r(new URL(e.href)), s = Lr(n?.headers);
  return s.set("accept", "application/json"), (n?.[Ae] || fetch)(i.href, {
    body: void 0,
    headers: Object.fromEntries(s.entries()),
    method: "GET",
    redirect: "manual",
    signal: lo(i, n?.signal)
  });
}
o(Ku, "performDiscovery");
async function cs(e, t) {
  return Ku(e, "issuerIdentifier", (r) => {
    switch (t?.algorithm) {
      case void 0:
      case "oidc":
        Hu(r, ".well-known/openid-configuration");
        break;
      case "oauth2":
        Lu(r, ".well-known/oauth-authorization-server");
        break;
      default:
        throw L('"options.algorithm" must be "oidc" (default), or "oauth2"', oe);
    }
    return r;
  }, t);
}
o(cs, "discoveryRequest");
function vt(e, t, r, n, i) {
  try {
    if (typeof e != "number" || !Number.isFinite(e))
      throw L(`${r} must be a number`, te, i);
    if (e > 0)
      return;
    if (t) {
      if (e !== 0)
        throw L(`${r} must be a non-negative number`, oe, i);
      return;
    }
    throw L(`${r} must be a positive number`, oe, i);
  } catch (s) {
    throw n ? A(s.message, n, i) : s;
  }
}
o(vt, "assertNumber");
function V(e, t, r, n) {
  try {
    if (typeof e != "string")
      throw L(`${t} must be a string`, te, n);
    if (e.length === 0)
      throw L(`${t} must not be empty`, oe, n);
  } catch (i) {
    throw r ? A(i.message, r, n) : i;
  }
}
o(V, "assertString");
async function us(e, t) {
  let r = e;
  if (!(r instanceof URL) && r !== is)
    throw L('"expectedIssuerIdentifier" must be an instance of URL', te);
  if (!Et(t, Response))
    throw L('"response" must be an instance of Response', te);
  if (t.status !== 200)
    throw A('"response" is not a conform Authorization Server Metadata response (unexpected HTTP status code)', mo, t);
  Mr(t);
  let n = await wo(t);
  if (V(n.issuer, '"response" body "issuer" property', O, { body: n }), r !== is && new URL(n.issuer).href !== r.href)
    throw A('"response" body "issuer" property does not match the expected value', Is, { expected: r.href, body: n, attribute: "issuer" });
  return n;
}
o(us, "processDiscoveryResponse");
function ds(e) {
  Nu(e, "application/json");
}
o(ds, "assertApplicationJson");
function $u(e, ...t) {
  let r = '"response" content-type must be ';
  if (t.length > 2) {
    let n = t.pop();
    r += `${t.join(", ")}, or ${n}`;
  } else t.length === 2 ? r += `${t[0]} or ${t[1]}` : r += t[0];
  return A(r, xd, e);
}
o($u, "notJson");
function Nu(e, t) {
  if (ws(e) !== t)
    throw $u(e, t);
}
o(Nu, "assertContentType");
function Hr() {
  return fe(crypto.getRandomValues(new Uint8Array(32)));
}
o(Hr, "randomBytes");
function Kr() {
  return Hr();
}
o(Kr, "generateRandomCodeVerifier");
function $r() {
  return Hr();
}
o($r, "generateRandomState");
function Nr() {
  return Hr();
}
o(Nr, "generateRandomNonce");
async function Wr(e) {
  return V(e, "codeVerifier"), fe(await crypto.subtle.digest("SHA-256", le(e)));
}
o(Wr, "calculatePKCECodeChallenge");
function Wu(e) {
  return e instanceof CryptoKey ? { key: e } : e?.key instanceof CryptoKey ? (e.kid !== void 0 && V(e.kid, '"kid"'), {
    key: e.key,
    kid: e.kid
  }) : {};
}
o(Wu, "getKeyAndKid");
function Bu(e) {
  switch (e.algorithm.hash.name) {
    case "SHA-256":
      return "PS256";
    case "SHA-384":
      return "PS384";
    case "SHA-512":
      return "PS512";
    default:
      throw new re("unsupported RsaHashedKeyAlgorithm hash name", {
        cause: e
      });
  }
}
o(Bu, "psAlg");
function Ju(e) {
  switch (e.algorithm.hash.name) {
    case "SHA-256":
      return "RS256";
    case "SHA-384":
      return "RS384";
    case "SHA-512":
      return "RS512";
    default:
      throw new re("unsupported RsaHashedKeyAlgorithm hash name", {
        cause: e
      });
  }
}
o(Ju, "rsAlg");
function zu(e) {
  switch (e.algorithm.namedCurve) {
    case "P-256":
      return "ES256";
    case "P-384":
      return "ES384";
    case "P-521":
      return "ES512";
    default:
      throw new re("unsupported EcKeyAlgorithm namedCurve", { cause: e });
  }
}
o(zu, "esAlg");
function Mu(e) {
  switch (e.algorithm.name) {
    case "RSA-PSS":
      return Bu(e);
    case "RSASSA-PKCS1-v1_5":
      return Ju(e);
    case "ECDSA":
      return zu(e);
    case "Ed25519":
    case "ML-DSA-44":
    case "ML-DSA-65":
    case "ML-DSA-87":
      return e.algorithm.name;
    case "EdDSA":
      return "Ed25519";
    default:
      throw new re("unsupported CryptoKey algorithm name", { cause: e });
  }
}
o(Mu, "keyToJws");
function Qe(e) {
  let t = e?.[ss];
  return typeof t == "number" && Number.isFinite(t) ? t : 0;
}
o(Qe, "getClockSkew");
function Br(e) {
  let t = e?.[Ru];
  return typeof t == "number" && Number.isFinite(t) && Math.sign(t) !== -1 ? t : 30;
}
o(Br, "getClockTolerance");
function Jr() {
  return Math.floor(Date.now() / 1e3);
}
o(Jr, "epochTime");
function kt(e) {
  if (typeof e != "object" || e === null)
    throw L('"as" must be an object', te);
  V(e.issuer, '"as.issuer"');
}
o(kt, "assertAs");
function It(e) {
  if (typeof e != "object" || e === null)
    throw L('"client" must be an object', te);
  V(e.client_id, '"client.client_id"');
}
o(It, "assertClient");
function ls(e) {
  return V(e, '"clientSecret"'), (t, r, n, i) => {
    n.set("client_id", r.client_id), n.set("client_secret", e);
  };
}
o(ls, "ClientSecretPost");
function fs(e, t) {
  let r = Jr() + Qe(t);
  return {
    jti: Hr(),
    aud: e.issuer,
    exp: r + 60,
    iat: r,
    nbf: r,
    iss: t.client_id,
    sub: t.client_id
  };
}
o(fs, "clientAssertionPayload");
function ps(e, t) {
  let { key: r, kid: n } = Wu(e);
  return Du(r, '"clientPrivateKey.key"'), async (i, s, a, c) => {
    let d = { alg: Mu(r), kid: n }, l = fs(i, s);
    t?.[Dr]?.(d, l), a.set("client_id", s.client_id), a.set("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer"), a.set("client_assertion", await ju(d, l, r));
  };
}
o(ps, "PrivateKeyJwt");
function hs(e, t) {
  V(e, '"clientSecret"');
  let r = t?.[Dr], n;
  return async (i, s, a, c) => {
    n ||= await crypto.subtle.importKey("raw", le(e), { hash: "SHA-256", name: "HMAC" }, !1, ["sign"]);
    let d = { alg: "HS256" }, l = fs(i, s);
    r?.(d, l);
    let u = `${fe(le(JSON.stringify(d)))}.${fe(le(JSON.stringify(l)))}`, f = await crypto.subtle.sign(n.algorithm, n, le(u));
    a.set("client_id", s.client_id), a.set("client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer"), a.set("client_assertion", `${u}.${fe(new Uint8Array(f))}`);
  };
}
o(hs, "ClientSecretJwt");
async function ju(e, t, r) {
  if (!r.usages.includes("sign"))
    throw L('CryptoKey instances used for signing assertions must include "sign" in their "usages"', oe);
  let n = `${fe(le(JSON.stringify(e)))}.${fe(le(JSON.stringify(t)))}`, i = fe(await crypto.subtle.sign(Id(r), r, le(n)));
  return `${n}.${i}`;
}
o(ju, "signJwt");
var Vu = URL.parse ? (e, t) => URL.parse(e, t) : (e, t) => {
  try {
    return new URL(e, t);
  } catch {
    return null;
  }
};
function fo(e, t) {
  if (t && e.protocol !== "https:")
    throw A("only requests to HTTPS are allowed", Sd, e);
  if (e.protocol !== "https:" && e.protocol !== "http:")
    throw A("only HTTP and HTTPS requests are allowed", vd, e);
}
o(fo, "checkProtocol");
function ns(e, t, r, n) {
  let i;
  if (typeof e != "string" || !(i = Vu(e)))
    throw A(`authorization server metadata does not contain a valid ${r ? `"as.mtls_endpoint_aliases.${t}"` : `"as.${t}"`}`, e === void 0 ? Ad : Ed, { attribute: r ? `mtls_endpoint_aliases.${t}` : t });
  return fo(i, n), i;
}
o(ns, "validateEndpoint");
function ms(e, t, r, n) {
  return r && e.mtls_endpoint_aliases && t in e.mtls_endpoint_aliases ? ns(e.mtls_endpoint_aliases[t], t, r, n) : ns(e[t], t, r, n);
}
o(ms, "resolveEndpoint");
var ao = class extends Error {
  static {
    o(this, "ResponseBodyError");
  }
  cause;
  code;
  error;
  status;
  error_description;
  response;
  constructor(t, r) {
    super(t, r), this.name = this.constructor.name, this.code = wd, this.cause = r.cause, this.error = r.cause.error, this.status = r.response.status, this.error_description = r.cause.error_description, Object.defineProperty(this, "response", { enumerable: !1, value: r.response }), Error.captureStackTrace?.(this, this.constructor);
  }
}, At = class extends Error {
  static {
    o(this, "AuthorizationResponseError");
  }
  cause;
  code;
  error;
  error_description;
  constructor(t, r) {
    super(t, r), this.name = this.constructor.name, this.code = bd, this.cause = r.cause, this.error = r.cause.get("error"), this.error_description = r.cause.get("error_description") ?? void 0, Error.captureStackTrace?.(this, this.constructor);
  }
}, co = class extends Error {
  static {
    o(this, "WWWAuthenticateChallengeError");
  }
  cause;
  code;
  response;
  status;
  constructor(t, r) {
    super(t, r), this.name = this.constructor.name, this.code = yd, this.cause = r.cause, this.status = r.response.status, this.response = r.response, Object.defineProperty(this, "response", { enumerable: !1 }), Error.captureStackTrace?.(this, this.constructor);
  }
}, Ur = "[a-zA-Z0-9!#$%&\\'\\*\\+\\-\\.\\^_`\\|~]+", Fu = "[a-zA-Z0-9\\-\\._\\~\\+\\/]+={0,2}", Gu = '"((?:[^"\\\\]|\\\\[\\s\\S])*)"', qu = "(" + Ur + ")\\s*=\\s*" + Gu, Xu = "(" + Ur + ")\\s*=\\s*(" + Ur + ")", Yu = new RegExp("^[,\\s]*(" + Ur + ")"), Zu = new RegExp("^[,\\s]*" + qu + "[,\\s]*(.*)"), Qu = new RegExp("^[,\\s]*" + Xu + "[,\\s]*(.*)"), ed = new RegExp("^(" + Fu + ")(?:$|[,\\s])(.*)");
function td(e) {
  if (!Et(e, Response))
    throw L('"response" must be an instance of Response', te);
  let t = e.headers.get("www-authenticate");
  if (t === null)
    return;
  let r = [], n = t;
  for (; n; ) {
    let i = n.match(Yu), s = i?.[1].toLowerCase();
    if (!s)
      return;
    let a = n.substring(i[0].length);
    if (a && !a.match(/^[\s,]/))
      return;
    let c = a.match(/^\s+(.*)$/), d = !!c;
    n = c ? c[1] : void 0;
    let l = {}, u;
    if (d)
      for (; n; ) {
        let m, h;
        if (i = n.match(Zu)) {
          if ([, m, h, n] = i, h.includes("\\"))
            try {
              h = JSON.parse(`"${h}"`);
            } catch {
            }
          l[m.toLowerCase()] = h;
          continue;
        }
        if (i = n.match(Qu)) {
          [, m, h, n] = i, l[m.toLowerCase()] = h;
          continue;
        }
        if (i = n.match(ed)) {
          if (Object.keys(l).length)
            break;
          [, u, n] = i;
          break;
        }
        return;
      }
    else
      n = a || void 0;
    let f = { scheme: s, parameters: l };
    u && (f.token68 = u), r.push(f);
  }
  if (r.length)
    return r;
}
o(td, "parseWwwAuthenticateChallenges");
async function rd(e) {
  if (e.status > 399 && e.status < 500) {
    Mr(e), ds(e);
    try {
      let t = await e.clone().json();
      if (Pr(t) && typeof t.error == "string" && t.error.length)
        return t;
    } catch {
    }
  }
}
o(rd, "parseOAuthResponseErrorBody");
async function nd(e, t, r) {
  if (e.status !== t) {
    Ss(e);
    let n;
    throw (n = await rd(e)) ? (await e.body?.cancel(), new ao("server responded with an error in the response body", {
      cause: n,
      response: e
    })) : A(`"response" is not a conform ${r} response (unexpected HTTP status code)`, mo, e);
  }
}
o(nd, "checkOAuthBodyError");
function ys(e) {
  if (!ho.has(e))
    throw L('"options.DPoP" is not a valid DPoPHandle', oe);
}
o(ys, "assertDPoP");
async function od(e, t, r, n, i, s) {
  if (V(e, '"accessToken"'), !(r instanceof URL))
    throw L('"url" must be an instance of URL', te);
  fo(r, s?.[we] !== !0), n = Lr(n), s?.DPoP && (ys(s.DPoP), await s.DPoP.addProof(r, n, t.toUpperCase(), e)), n.set("authorization", `${n.has("dpop") ? "DPoP" : "Bearer"} ${e}`);
  let a = await (s?.[Ae] || fetch)(r.href, {
    body: i,
    headers: Object.fromEntries(n.entries()),
    method: t,
    redirect: "manual",
    signal: lo(r, s?.signal)
  });
  return s?.DPoP?.cacheNonce(a, r), a;
}
o(od, "resourceRequest");
async function po(e, t, r, n) {
  kt(e), It(t);
  let i = ms(e, "userinfo_endpoint", t.use_mtls_endpoint_aliases, n?.[we] !== !0), s = Lr(n?.headers);
  return t.userinfo_signed_response_alg ? s.set("accept", "application/jwt") : (s.set("accept", "application/json"), s.append("accept", "application/jwt")), od(r, "GET", i, s, null, {
    ...n,
    [ss]: Qe(t)
  });
}
o(po, "userInfoRequest");
var id = Symbol();
function ws(e) {
  return e.headers.get("content-type")?.split(";")[0];
}
o(ws, "getContentType");
async function gs(e, t, r, n, i) {
  if (kt(e), It(t), !Et(n, Response))
    throw L('"response" must be an instance of Response', te);
  if (Ss(n), n.status !== 200)
    throw A('"response" is not a conform UserInfo Endpoint response (unexpected HTTP status code)', mo, n);
  Mr(n);
  let s;
  if (ws(n) === "application/jwt") {
    let { claims: a, jwt: c } = await Ts(await n.text(), Cs.bind(void 0, t.userinfo_signed_response_alg, e.userinfo_signing_alg_values_supported, void 0), Qe(t), Br(t), i?.[no]).then(cd.bind(void 0, t.client_id)).then(ud.bind(void 0, e));
    _s.set(n, c), s = a;
  } else {
    if (t.userinfo_signed_response_alg)
      throw A("JWT UserInfo Response expected", _d, n);
    s = await wo(n);
  }
  switch (V(s.sub, '"response" body "sub" property', O, { body: s }), r) {
    case id:
      break;
    default:
      if (V(r, '"expectedSubject"'), s.sub !== r)
        throw A('unexpected "response" body "sub" property value', Is, {
          expected: r,
          body: s,
          attribute: "sub"
        });
  }
  return s;
}
o(gs, "processUserInfoResponse");
async function sd(e, t, r, n, i, s, a) {
  return await r(e, t, i, s), s.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8"), (a?.[Ae] || fetch)(n.href, {
    body: i,
    headers: Object.fromEntries(s.entries()),
    method: "POST",
    redirect: "manual",
    signal: lo(n, a?.signal)
  });
}
o(sd, "authenticatedRequest");
async function ad(e, t, r, n, i, s) {
  let a = ms(e, "token_endpoint", t.use_mtls_endpoint_aliases, s?.[we] !== !0);
  i.set("grant_type", n);
  let c = Lr(s?.headers);
  c.set("accept", "application/json"), s?.DPoP !== void 0 && (ys(s.DPoP), await s.DPoP.addProof(a, c, "POST"));
  let d = await sd(e, t, r, a, i, c, s);
  return s?.DPoP?.cacheNonce(d, a), d;
}
o(ad, "tokenEndpointRequest");
var bs = /* @__PURE__ */ new WeakMap(), _s = /* @__PURE__ */ new WeakMap();
function zr(e) {
  if (!e.id_token)
    return;
  let t = bs.get(e);
  if (!t)
    throw L('"ref" was already garbage collected or did not resolve from the proper sources', oe);
  return t;
}
o(zr, "getValidatedIdTokenClaims");
async function xs(e, t, r, n, i, s) {
  if (kt(e), It(t), !Et(r, Response))
    throw L('"response" must be an instance of Response', te);
  await nd(r, 200, "Token Endpoint"), Mr(r);
  let a = await wo(r);
  if (V(a.access_token, '"response" body "access_token" property', O, {
    body: a
  }), V(a.token_type, '"response" body "token_type" property', O, {
    body: a
  }), a.token_type = a.token_type.toLowerCase(), a.expires_in !== void 0) {
    let c = typeof a.expires_in != "number" ? parseFloat(a.expires_in) : a.expires_in;
    vt(c, !0, '"response" body "expires_in" property', O, {
      body: a
    }), a.expires_in = c;
  }
  if (a.refresh_token !== void 0 && V(a.refresh_token, '"response" body "refresh_token" property', O, {
    body: a
  }), a.scope !== void 0 && typeof a.scope != "string")
    throw A('"response" body "scope" property must be a string', O, { body: a });
  if (a.id_token !== void 0) {
    V(a.id_token, '"response" body "id_token" property', O, {
      body: a
    });
    let c = ["aud", "exp", "iat", "iss", "sub"];
    t.require_auth_time === !0 && c.push("auth_time"), t.default_max_age !== void 0 && (vt(t.default_max_age, !0, '"client.default_max_age"'), c.push("auth_time")), n?.length && c.push(...n);
    let { claims: d, jwt: l } = await Ts(a.id_token, Cs.bind(void 0, t.id_token_signed_response_alg, e.id_token_signing_alg_values_supported, "RS256"), Qe(t), Br(t), i).then(pd.bind(void 0, c)).then(As.bind(void 0, e)).then(vs.bind(void 0, t.client_id));
    if (Array.isArray(d.aud) && d.aud.length !== 1) {
      if (d.azp === void 0)
        throw A('ID Token "aud" (audience) claim includes additional untrusted audiences', ve, { claims: d, claim: "aud" });
      if (d.azp !== t.client_id)
        throw A('unexpected ID Token "azp" (authorized party) claim value', ve, { expected: t.client_id, claims: d, claim: "azp" });
    }
    d.auth_time !== void 0 && vt(d.auth_time, !0, 'ID Token "auth_time" (authentication time)', O, { claims: d }), _s.set(r, l), bs.set(a, d);
  }
  if (s?.[a.token_type] !== void 0)
    s[a.token_type](r, a);
  else if (a.token_type !== "dpop" && a.token_type !== "bearer")
    throw new re("unsupported `token_type` value", { cause: { body: a } });
  return a;
}
o(xs, "processGenericAccessTokenResponse");
function Ss(e) {
  let t;
  if (t = td(e))
    throw new co("server responded with a challenge in the WWW-Authenticate HTTP Header", { cause: t, response: e });
}
o(Ss, "checkAuthenticationChallenges");
function cd(e, t) {
  return t.claims.aud !== void 0 ? vs(e, t) : t;
}
o(cd, "validateOptionalAudience");
function vs(e, t) {
  if (Array.isArray(t.claims.aud)) {
    if (!t.claims.aud.includes(e))
      throw A('unexpected JWT "aud" (audience) claim value', ve, {
        expected: e,
        claims: t.claims,
        claim: "aud"
      });
  } else if (t.claims.aud !== e)
    throw A('unexpected JWT "aud" (audience) claim value', ve, {
      expected: e,
      claims: t.claims,
      claim: "aud"
    });
  return t;
}
o(vs, "validateAudience");
function ud(e, t) {
  return t.claims.iss !== void 0 ? As(e, t) : t;
}
o(ud, "validateOptionalIssuer");
function As(e, t) {
  let r = e[Cd]?.(t) ?? e.issuer;
  if (t.claims.iss !== r)
    throw A('unexpected JWT "iss" (issuer) claim value', ve, {
      expected: r,
      claims: t.claims,
      claim: "iss"
    });
  return t;
}
o(As, "validateIssuer");
var ho = /* @__PURE__ */ new WeakSet();
function dd(e) {
  return ho.add(e), e;
}
o(dd, "brand");
var ld = Symbol();
async function Es(e, t, r, n, i, s, a) {
  if (kt(e), It(t), !ho.has(n))
    throw L('"callbackParameters" must be an instance of URLSearchParams obtained from "validateAuthResponse()", or "validateJwtAuthResponse()', oe);
  V(i, '"redirectUri"');
  let c = He(n, "code");
  if (!c)
    throw A('no authorization code in "callbackParameters"', O);
  let d = new URLSearchParams(a?.additionalParameters);
  return d.set("redirect_uri", i), d.set("code", c), s !== ld && (V(s, '"codeVerifier"'), d.set("code_verifier", s)), ad(e, t, r, "authorization_code", d, a);
}
o(Es, "authorizationCodeGrantRequest");
var fd = {
  aud: "audience",
  c_hash: "code hash",
  client_id: "client id",
  exp: "expiration time",
  iat: "issued at",
  iss: "issuer",
  jti: "jwt id",
  nonce: "nonce",
  s_hash: "state hash",
  sub: "subject",
  ath: "access token hash",
  htm: "http method",
  htu: "http uri",
  cnf: "confirmation",
  auth_time: "authentication time"
};
function pd(e, t) {
  for (let r of e)
    if (t.claims[r] === void 0)
      throw A(`JWT "${r}" (${fd[r]}) claim missing`, O, {
        claims: t.claims
      });
  return t;
}
o(pd, "validatePresence");
var eo = Symbol(), to = Symbol();
async function ks(e, t, r, n) {
  return typeof n?.expectedNonce == "string" || typeof n?.maxAge == "number" || n?.requireIdToken ? hd(e, t, r, n.expectedNonce, n.maxAge, n[no], n.recognizedTokenTypes) : md(e, t, r, n?.[no], n?.recognizedTokenTypes);
}
o(ks, "processAuthorizationCodeResponse");
async function hd(e, t, r, n, i, s, a) {
  let c = [];
  switch (n) {
    case void 0:
      n = eo;
      break;
    case eo:
      break;
    default:
      V(n, '"expectedNonce" argument'), c.push("nonce");
  }
  switch (i ??= t.default_max_age, i) {
    case void 0:
      i = to;
      break;
    case to:
      break;
    default:
      vt(i, !0, '"maxAge" argument'), c.push("auth_time");
  }
  let d = await xs(e, t, r, c, s, a);
  V(d.id_token, '"response" body "id_token" property', O, {
    body: d
  });
  let l = zr(d);
  if (i !== to) {
    let u = Jr() + Qe(t), f = Br(t);
    if (l.auth_time + i < u - f)
      throw A("too much time has elapsed since the last End-User authentication", Or, { claims: l, now: u, tolerance: f, claim: "auth_time" });
  }
  if (n === eo) {
    if (l.nonce !== void 0)
      throw A('unexpected ID Token "nonce" claim value', ve, {
        expected: void 0,
        claims: l,
        claim: "nonce"
      });
  } else if (l.nonce !== n)
    throw A('unexpected ID Token "nonce" claim value', ve, {
      expected: n,
      claims: l,
      claim: "nonce"
    });
  return d;
}
o(hd, "processAuthorizationCodeOpenIDResponse");
async function md(e, t, r, n, i) {
  let s = await xs(e, t, r, void 0, n, i), a = zr(s);
  if (a) {
    if (t.default_max_age !== void 0) {
      vt(t.default_max_age, !0, '"client.default_max_age"');
      let c = Jr() + Qe(t), d = Br(t);
      if (a.auth_time + t.default_max_age < c - d)
        throw A("too much time has elapsed since the last End-User authentication", Or, { claims: a, now: c, tolerance: d, claim: "auth_time" });
    }
    if (a.nonce !== void 0)
      throw A('unexpected ID Token "nonce" claim value', ve, {
        expected: void 0,
        claims: a,
        claim: "nonce"
      });
  }
  return s;
}
o(md, "processAuthorizationCodeOAuth2Response");
var yd = "OAUTH_WWW_AUTHENTICATE_CHALLENGE", wd = "OAUTH_RESPONSE_BODY_ERROR", gd = "OAUTH_UNSUPPORTED_OPERATION", bd = "OAUTH_AUTHORIZATION_RESPONSE_ERROR", _d = "OAUTH_JWT_USERINFO_EXPECTED", uo = "OAUTH_PARSE_ERROR", O = "OAUTH_INVALID_RESPONSE";
var xd = "OAUTH_RESPONSE_IS_NOT_JSON", mo = "OAUTH_RESPONSE_IS_NOT_CONFORM", Sd = "OAUTH_HTTP_REQUEST_FORBIDDEN", vd = "OAUTH_REQUEST_PROTOCOL_FORBIDDEN", Or = "OAUTH_JWT_TIMESTAMP_CHECK_FAILED", ve = "OAUTH_JWT_CLAIM_COMPARISON_FAILED", Is = "OAUTH_JSON_ATTRIBUTE_COMPARISON_FAILED";
var Ad = "OAUTH_MISSING_SERVER_METADATA", Ed = "OAUTH_INVALID_SERVER_METADATA";
function Mr(e) {
  if (e.bodyUsed)
    throw L('"response" body has been used already', oe);
}
o(Mr, "assertReadableResponse");
function os(e) {
  let { algorithm: t } = e;
  if (typeof t.modulusLength != "number" || t.modulusLength < 2048)
    throw new re(`unsupported ${t.name} modulusLength`, {
      cause: e
    });
}
o(os, "checkRsaKeyAlgorithm");
function kd(e) {
  let { algorithm: t } = e;
  switch (t.namedCurve) {
    case "P-256":
      return "SHA-256";
    case "P-384":
      return "SHA-384";
    case "P-521":
      return "SHA-512";
    default:
      throw new re("unsupported ECDSA namedCurve", { cause: e });
  }
}
o(kd, "ecdsaHashName");
function Id(e) {
  switch (e.algorithm.name) {
    case "ECDSA":
      return {
        name: e.algorithm.name,
        hash: kd(e)
      };
    case "RSA-PSS":
      switch (os(e), e.algorithm.hash.name) {
        case "SHA-256":
        case "SHA-384":
        case "SHA-512":
          return {
            name: e.algorithm.name,
            saltLength: parseInt(e.algorithm.hash.name.slice(-3), 10) >> 3
          };
        default:
          throw new re("unsupported RSA-PSS hash name", { cause: e });
      }
    case "RSASSA-PKCS1-v1_5":
      return os(e), e.algorithm.name;
    case "ML-DSA-44":
    case "ML-DSA-65":
    case "ML-DSA-87":
    case "Ed25519":
      return e.algorithm.name;
  }
  throw new re("unsupported CryptoKey algorithm name", { cause: e });
}
o(Id, "keyToSubtle");
async function Ts(e, t, r, n, i) {
  let { 0: s, 1: a, length: c } = e.split(".");
  if (c === 5)
    if (i !== void 0)
      e = await i(e), { 0: s, 1: a, length: c } = e.split(".");
    else
      throw new re("JWE decryption is not configured", { cause: e });
  if (c !== 3)
    throw A("Invalid JWT", O, e);
  let d;
  try {
    d = JSON.parse(le(fe(s)));
  } catch (f) {
    throw A("failed to parse JWT Header body as base64url encoded JSON", uo, f);
  }
  if (!Pr(d))
    throw A("JWT Header must be a top level object", O, e);
  if (t(d), d.crit !== void 0)
    throw new re('no JWT "crit" header parameter extensions are supported', {
      cause: { header: d }
    });
  let l;
  try {
    l = JSON.parse(le(fe(a)));
  } catch (f) {
    throw A("failed to parse JWT Payload body as base64url encoded JSON", uo, f);
  }
  if (!Pr(l))
    throw A("JWT Payload must be a top level object", O, e);
  let u = Jr() + r;
  if (l.exp !== void 0) {
    if (typeof l.exp != "number")
      throw A('unexpected JWT "exp" (expiration time) claim type', O, { claims: l });
    if (l.exp <= u - n)
      throw A('unexpected JWT "exp" (expiration time) claim value, expiration is past current timestamp', Or, { claims: l, now: u, tolerance: n, claim: "exp" });
  }
  if (l.iat !== void 0 && typeof l.iat != "number")
    throw A('unexpected JWT "iat" (issued at) claim type', O, { claims: l });
  if (l.iss !== void 0 && typeof l.iss != "string")
    throw A('unexpected JWT "iss" (issuer) claim type', O, { claims: l });
  if (l.nbf !== void 0) {
    if (typeof l.nbf != "number")
      throw A('unexpected JWT "nbf" (not before) claim type', O, { claims: l });
    if (l.nbf > u + n)
      throw A('unexpected JWT "nbf" (not before) claim value', Or, {
        claims: l,
        now: u,
        tolerance: n,
        claim: "nbf"
      });
  }
  if (l.aud !== void 0 && typeof l.aud != "string" && !Array.isArray(l.aud))
    throw A('unexpected JWT "aud" (audience) claim type', O, { claims: l });
  return { header: d, claims: l, jwt: e };
}
o(Ts, "validateJwt");
function Cs(e, t, r, n) {
  if (e !== void 0) {
    if (typeof e == "string" ? n.alg !== e : !e.includes(n.alg))
      throw A('unexpected JWT "alg" header parameter', O, {
        header: n,
        expected: e,
        reason: "client configuration"
      });
    return;
  }
  if (Array.isArray(t)) {
    if (!t.includes(n.alg))
      throw A('unexpected JWT "alg" header parameter', O, {
        header: n,
        expected: t,
        reason: "authorization server metadata"
      });
    return;
  }
  if (r !== void 0) {
    if (typeof r == "string" ? n.alg !== r : typeof r == "function" ? !r(n.alg) : !r.includes(n.alg))
      throw A('unexpected JWT "alg" header parameter', O, {
        header: n,
        expected: r,
        reason: "default value"
      });
    return;
  }
  throw A('missing client or server configuration to verify used JWT "alg" header parameter', void 0, { client: e, issuer: t, fallback: r });
}
o(Cs, "checkSigningAlgorithm");
function He(e, t) {
  let { 0: r, length: n } = e.getAll(t);
  if (n > 1)
    throw A(`"${t}" parameter must be provided only once`, O);
  return r;
}
o(He, "getURLSearchParameter");
var yo = Symbol(), Td = Symbol();
function Rs(e, t, r, n) {
  if (kt(e), It(t), r instanceof URL && (r = r.searchParams), !(r instanceof URLSearchParams))
    throw L('"parameters" must be an instance of URLSearchParams, or URL', te);
  if (He(r, "response"))
    throw A('"parameters" contains a JARM response, use validateJwtAuthResponse() instead of validateAuthResponse()', O, { parameters: r });
  let i = He(r, "iss"), s = He(r, "state");
  if (!i && e.authorization_response_iss_parameter_supported)
    throw A('response parameter "iss" (issuer) missing', O, { parameters: r });
  if (i && i !== e.issuer)
    throw A('unexpected "iss" (issuer) response parameter value', O, {
      expected: e.issuer,
      parameters: r
    });
  switch (n) {
    case void 0:
    case Td:
      if (s !== void 0)
        throw A('unexpected "state" response parameter encountered', O, {
          expected: void 0,
          parameters: r
        });
      break;
    case yo:
      break;
    default:
      if (V(n, '"expectedState" argument'), s !== n)
        throw A(s === void 0 ? 'response parameter "state" missing' : 'unexpected "state" response parameter value', O, { expected: n, parameters: r });
  }
  if (He(r, "error"))
    throw new At("authorization response from the server is an error", {
      cause: r
    });
  let c = He(r, "id_token"), d = He(r, "token");
  if (c !== void 0 || d !== void 0)
    throw new re("implicit and hybrid flows are not supported");
  return dd(new URLSearchParams(r));
}
o(Rs, "validateAuthResponse");
async function wo(e, t = ds) {
  let r;
  try {
    r = await e.json();
  } catch (n) {
    throw t(e), A('failed to parse "response" body as JSON', uo, n);
  }
  if (!Pr(r))
    throw A('"response" body must be a top level object', O, { body: r });
  return r;
}
o(wo, "getResponseJsonBody");
var is = Symbol(), Cd = Symbol();

// node_modules/@auth/core/lib/utils/custom-fetch.js
var Ct = Symbol("custom-fetch");

// node_modules/preact/dist/preact.module.js
var Hs, R, Ks, Pd, Rt, Ps, Ud, $s = {}, Ns = [], Od = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
function Ee(e, t) {
  for (var r in t) e[r] = t[r];
  return e;
}
o(Ee, "s");
function Ws(e) {
  var t = e.parentNode;
  t && t.removeChild(e);
}
o(Ws, "a");
function go(e, t, r, n, i) {
  var s = { type: e, props: t, key: r, ref: n, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, __h: null, constructor: void 0, __v: i ?? ++Ks };
  return i == null && R.vnode != null && R.vnode(s), s;
}
o(go, "v");
function ke(e) {
  return e.children;
}
o(ke, "p");
function jr(e, t) {
  this.props = e, this.context = t;
}
o(jr, "d");
function Pt(e, t) {
  if (t == null) return e.__ ? Pt(e.__, e.__.__k.indexOf(e) + 1) : null;
  for (var r; t < e.__k.length; t++) if ((r = e.__k[t]) != null && r.__e != null) return r.__e;
  return typeof e.type == "function" ? Pt(e) : null;
}
o(Pt, "_");
function Bs(e) {
  var t, r;
  if ((e = e.__) != null && e.__c != null) {
    for (e.__e = e.__c.base = null, t = 0; t < e.__k.length; t++) if ((r = e.__k[t]) != null && r.__e != null) {
      e.__e = e.__c.base = r.__e;
      break;
    }
    return Bs(e);
  }
}
o(Bs, "k");
function Us(e) {
  (!e.__d && (e.__d = !0) && Rt.push(e) && !Vr.__r++ || Ps !== R.debounceRendering) && ((Ps = R.debounceRendering) || setTimeout)(Vr);
}
o(Us, "b");
function Vr() {
  for (var e; Vr.__r = Rt.length; ) e = Rt.sort(function(t, r) {
    return t.__v.__b - r.__v.__b;
  }), Rt = [], e.some(function(t) {
    var r, n, i, s, a, c;
    t.__d && (a = (s = (r = t).__v).__e, (c = r.__P) && (n = [], (i = Ee({}, s)).__v = s.__v + 1, js(c, s, i, r.__n, c.ownerSVGElement !== void 0, s.__h != null ? [a] : null, n, a ?? Pt(s), s.__h), Ld(n, s), s.__e != a && Bs(s)));
  });
}
o(Vr, "g");
function Js(e, t, r, n, i, s, a, c, d, l) {
  var u, f, m, h, p, b, w, I = n && n.__k || Ns, E = I.length;
  for (r.__k = [], u = 0; u < t.length; u++) if ((h = r.__k[u] = (h = t[u]) == null || typeof h == "boolean" ? null : typeof h == "string" || typeof h == "number" || typeof h == "bigint" ? go(null, h, null, null, h) : Array.isArray(h) ? go(ke, { children: h }, null, null, null) : h.__b > 0 ? go(h.type, h.props, h.key, h.ref ? h.ref : null, h.__v) : h) != null) {
    if (h.__ = r, h.__b = r.__b + 1, (m = I[u]) === null || m && h.key == m.key && h.type === m.type) I[u] = void 0;
    else for (f = 0; f < E; f++) {
      if ((m = I[f]) && h.key == m.key && h.type === m.type) {
        I[f] = void 0;
        break;
      }
      m = null;
    }
    js(e, h, m = m || $s, i, s, a, c, d, l), p = h.__e, (f = h.ref) && m.ref != f && (w || (w = []), m.ref && w.push(m.ref, null, h), w.push(f, h.__c || p, h)), p != null ? (b == null && (b = p), typeof h.type == "function" && h.__k === m.__k ? h.__d = d = zs(h, d, e) : d = Ms(e, h, m, I, p, d), typeof r.type == "function" && (r.__d = d)) : d && m.__e == d && d.parentNode != e && (d = Pt(m));
  }
  for (r.__e = b, u = E; u--; ) I[u] != null && Fs(I[u], I[u]);
  if (w) for (u = 0; u < w.length; u++) Vs(w[u], w[++u], w[++u]);
}
o(Js, "w");
function zs(e, t, r) {
  for (var n, i = e.__k, s = 0; i && s < i.length; s++) (n = i[s]) && (n.__ = e, t = typeof n.type == "function" ? zs(n, t, r) : Ms(r, n, n, i, n.__e, t));
  return t;
}
o(zs, "m");
function Ms(e, t, r, n, i, s) {
  var a, c, d;
  if (t.__d !== void 0) a = t.__d, t.__d = void 0;
  else if (r == null || i != s || i.parentNode == null) e: if (s == null || s.parentNode !== e) e.appendChild(i), a = null;
  else {
    for (c = s, d = 0; (c = c.nextSibling) && d < n.length; d += 1) if (c == i) break e;
    e.insertBefore(i, s), a = s;
  }
  return a !== void 0 ? a : i.nextSibling;
}
o(Ms, "A");
function Dd(e, t, r, n, i) {
  var s;
  for (s in r) s === "children" || s === "key" || s in t || Fr(e, s, null, r[s], n);
  for (s in t) i && typeof t[s] != "function" || s === "children" || s === "key" || s === "value" || s === "checked" || r[s] === t[s] || Fr(e, s, t[s], r[s], n);
}
o(Dd, "C");
function Os(e, t, r) {
  t[0] === "-" ? e.setProperty(t, r) : e[t] = r == null ? "" : typeof r != "number" || Od.test(t) ? r : r + "px";
}
o(Os, "$");
function Fr(e, t, r, n, i) {
  var s;
  e: if (t === "style") if (typeof r == "string") e.style.cssText = r;
  else {
    if (typeof n == "string" && (e.style.cssText = n = ""), n) for (t in n) r && t in r || Os(e.style, t, "");
    if (r) for (t in r) n && r[t] === n[t] || Os(e.style, t, r[t]);
  }
  else if (t[0] === "o" && t[1] === "n") s = t !== (t = t.replace(/Capture$/, "")), t = t.toLowerCase() in e ? t.toLowerCase().slice(2) : t.slice(2), e.l || (e.l = {}), e.l[t + s] = r, r ? n || e.addEventListener(t, s ? Ls : Ds, s) : e.removeEventListener(t, s ? Ls : Ds, s);
  else if (t !== "dangerouslySetInnerHTML") {
    if (i) t = t.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
    else if (t !== "href" && t !== "list" && t !== "form" && t !== "tabIndex" && t !== "download" && t in e) try {
      e[t] = r ?? "";
      break e;
    } catch {
    }
    typeof r == "function" || (r == null || r === !1 && t.indexOf("-") == -1 ? e.removeAttribute(t) : e.setAttribute(t, r));
  }
}
o(Fr, "H");
function Ds(e) {
  this.l[e.type + !1](R.event ? R.event(e) : e);
}
o(Ds, "I");
function Ls(e) {
  this.l[e.type + !0](R.event ? R.event(e) : e);
}
o(Ls, "T");
function js(e, t, r, n, i, s, a, c, d) {
  var l, u, f, m, h, p, b, w, I, E, k, D, j, H, S, B = t.type;
  if (t.constructor !== void 0) return null;
  r.__h != null && (d = r.__h, c = t.__e = r.__e, t.__h = null, s = [c]), (l = R.__b) && l(t);
  try {
    e: if (typeof B == "function") {
      if (w = t.props, I = (l = B.contextType) && n[l.__c], E = l ? I ? I.props.value : l.__ : n, r.__c ? b = (u = t.__c = r.__c).__ = u.__E : ("prototype" in B && B.prototype.render ? t.__c = u = new B(w, E) : (t.__c = u = new jr(w, E), u.constructor = B, u.render = Kd), I && I.sub(u), u.props = w, u.state || (u.state = {}), u.context = E, u.__n = n, f = u.__d = !0, u.__h = [], u._sb = []), u.__s == null && (u.__s = u.state), B.getDerivedStateFromProps != null && (u.__s == u.state && (u.__s = Ee({}, u.__s)), Ee(u.__s, B.getDerivedStateFromProps(w, u.__s))), m = u.props, h = u.state, f) B.getDerivedStateFromProps == null && u.componentWillMount != null && u.componentWillMount(), u.componentDidMount != null && u.__h.push(u.componentDidMount);
      else {
        if (B.getDerivedStateFromProps == null && w !== m && u.componentWillReceiveProps != null && u.componentWillReceiveProps(w, E), !u.__e && u.shouldComponentUpdate != null && u.shouldComponentUpdate(w, u.__s, E) === !1 || t.__v === r.__v) {
          for (u.props = w, u.state = u.__s, t.__v !== r.__v && (u.__d = !1), u.__v = t, t.__e = r.__e, t.__k = r.__k, t.__k.forEach(function(F) {
            F && (F.__ = t);
          }), k = 0; k < u._sb.length; k++) u.__h.push(u._sb[k]);
          u._sb = [], u.__h.length && a.push(u);
          break e;
        }
        u.componentWillUpdate != null && u.componentWillUpdate(w, u.__s, E), u.componentDidUpdate != null && u.__h.push(function() {
          u.componentDidUpdate(m, h, p);
        });
      }
      if (u.context = E, u.props = w, u.__v = t, u.__P = e, D = R.__r, j = 0, "prototype" in B && B.prototype.render) {
        for (u.state = u.__s, u.__d = !1, D && D(t), l = u.render(u.props, u.state, u.context), H = 0; H < u._sb.length; H++) u.__h.push(u._sb[H]);
        u._sb = [];
      } else do
        u.__d = !1, D && D(t), l = u.render(u.props, u.state, u.context), u.state = u.__s;
      while (u.__d && ++j < 25);
      u.state = u.__s, u.getChildContext != null && (n = Ee(Ee({}, n), u.getChildContext())), f || u.getSnapshotBeforeUpdate == null || (p = u.getSnapshotBeforeUpdate(m, h)), S = l != null && l.type === ke && l.key == null ? l.props.children : l, Js(e, Array.isArray(S) ? S : [S], t, r, n, i, s, a, c, d), u.base = t.__e, t.__h = null, u.__h.length && a.push(u), b && (u.__E = u.__ = null), u.__e = !1;
    } else s == null && t.__v === r.__v ? (t.__k = r.__k, t.__e = r.__e) : t.__e = Hd(r.__e, t, r, n, i, s, a, d);
    (l = R.diffed) && l(t);
  } catch (F) {
    t.__v = null, (d || s != null) && (t.__e = c, t.__h = !!d, s[s.indexOf(c)] = null), R.__e(F, t, r);
  }
}
o(js, "j");
function Ld(e, t) {
  R.__c && R.__c(t, e), e.some(function(r) {
    try {
      e = r.__h, r.__h = [], e.some(function(n) {
        n.call(r);
      });
    } catch (n) {
      R.__e(n, r.__v);
    }
  });
}
o(Ld, "z");
function Hd(e, t, r, n, i, s, a, c) {
  var d, l, u, f = r.props, m = t.props, h = t.type, p = 0;
  if (h === "svg" && (i = !0), s != null) {
    for (; p < s.length; p++) if ((d = s[p]) && "setAttribute" in d == !!h && (h ? d.localName === h : d.nodeType === 3)) {
      e = d, s[p] = null;
      break;
    }
  }
  if (e == null) {
    if (h === null) return document.createTextNode(m);
    e = i ? document.createElementNS("http://www.w3.org/2000/svg", h) : document.createElement(h, m.is && m), s = null, c = !1;
  }
  if (h === null) f === m || c && e.data === m || (e.data = m);
  else {
    if (s = s && Hs.call(e.childNodes), l = (f = r.props || $s).dangerouslySetInnerHTML, u = m.dangerouslySetInnerHTML, !c) {
      if (s != null) for (f = {}, p = 0; p < e.attributes.length; p++) f[e.attributes[p].name] = e.attributes[p].value;
      (u || l) && (u && (l && u.__html == l.__html || u.__html === e.innerHTML) || (e.innerHTML = u && u.__html || ""));
    }
    if (Dd(e, m, f, i, c), u) t.__k = [];
    else if (p = t.props.children, Js(e, Array.isArray(p) ? p : [p], t, r, n, i && h !== "foreignObject", s, a, s ? s[0] : r.__k && Pt(r, 0), c), s != null) for (p = s.length; p--; ) s[p] != null && Ws(s[p]);
    c || ("value" in m && (p = m.value) !== void 0 && (p !== e.value || h === "progress" && !p || h === "option" && p !== f.value) && Fr(e, "value", p, f.value, !1), "checked" in m && (p = m.checked) !== void 0 && p !== e.checked && Fr(e, "checked", p, f.checked, !1));
  }
  return e;
}
o(Hd, "L");
function Vs(e, t, r) {
  try {
    typeof e == "function" ? e(t) : e.current = t;
  } catch (n) {
    R.__e(n, r);
  }
}
o(Vs, "M");
function Fs(e, t, r) {
  var n, i;
  if (R.unmount && R.unmount(e), (n = e.ref) && (n.current && n.current !== e.__e || Vs(n, null, t)), (n = e.__c) != null) {
    if (n.componentWillUnmount) try {
      n.componentWillUnmount();
    } catch (s) {
      R.__e(s, t);
    }
    n.base = n.__P = null, e.__c = void 0;
  }
  if (n = e.__k) for (i = 0; i < n.length; i++) n[i] && Fs(n[i], t, r || typeof e.type != "function");
  r || e.__e == null || Ws(e.__e), e.__ = e.__e = e.__d = void 0;
}
o(Fs, "N");
function Kd(e, t, r) {
  return this.constructor(e, r);
}
o(Kd, "O");
Hs = Ns.slice, R = { __e: /* @__PURE__ */ o(function(e, t, r, n) {
  for (var i, s, a; t = t.__; ) if ((i = t.__c) && !i.__) try {
    if ((s = i.constructor) && s.getDerivedStateFromError != null && (i.setState(s.getDerivedStateFromError(e)), a = i.__d), i.componentDidCatch != null && (i.componentDidCatch(e, n || {}), a = i.__d), a) return i.__E = i;
  } catch (c) {
    e = c;
  }
  throw e;
}, "__e") }, Ks = 0, Pd = /* @__PURE__ */ o(function(e) {
  return e != null && e.constructor === void 0;
}, "i"), jr.prototype.setState = function(e, t) {
  var r;
  r = this.__s != null && this.__s !== this.state ? this.__s : this.__s = Ee({}, this.state), typeof e == "function" && (e = e(Ee({}, r), this.props)), e && Ee(r, e), e != null && this.__v && (t && this._sb.push(t), Us(this));
}, jr.prototype.forceUpdate = function(e) {
  this.__v && (this.__e = !0, e && this.__h.push(e), Us(this));
}, jr.prototype.render = ke, Rt = [], Vr.__r = 0, Ud = 0;

// node_modules/preact-render-to-string/dist/index.mjs
var $d = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|^--/i, ta = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/, Gr = /[\s\n\\/='"\0<>]/, ra = /^xlink:?./, Nd = /["&<]/;
function Ot(e) {
  if (Nd.test(e += "") === !1) return e;
  for (var t = 0, r = 0, n = "", i = ""; r < e.length; r++) {
    switch (e.charCodeAt(r)) {
      case 34:
        i = "&quot;";
        break;
      case 38:
        i = "&amp;";
        break;
      case 60:
        i = "&lt;";
        break;
      default:
        continue;
    }
    r !== t && (n += e.slice(t, r)), n += i, t = r + 1;
  }
  return r !== t && (n += e.slice(t, r)), n;
}
o(Ot, "l");
var Gs = /* @__PURE__ */ o(function(e, t) {
  return String(e).replace(/(\n+)/g, "$1" + (t || "	"));
}, "s"), qs = /* @__PURE__ */ o(function(e, t, r) {
  return String(e).length > (t || 40) || !r && String(e).indexOf(`
`) !== -1 || String(e).indexOf("<") !== -1;
}, "f"), Xs = {}, Wd = /([A-Z])/g;
function na(e) {
  var t = "";
  for (var r in e) {
    var n = e[r];
    n != null && n !== "" && (t && (t += " "), t += r[0] == "-" ? r : Xs[r] || (Xs[r] = r.replace(Wd, "-$1").toLowerCase()), t = typeof n == "number" && $d.test(r) === !1 ? t + ": " + n + "px;" : t + ": " + n + ";");
  }
  return t || void 0;
}
o(na, "p");
function _o(e, t) {
  return Array.isArray(t) ? t.reduce(_o, e) : t != null && t !== !1 && e.push(t), e;
}
o(_o, "_");
function Ys() {
  this.__d = !0;
}
o(Ys, "d");
function oa(e, t) {
  return { __v: e, context: t, props: e.props, setState: Ys, forceUpdate: Ys, __d: !0, __h: [] };
}
o(oa, "v");
function qr(e, t) {
  var r = e.contextType, n = r && t[r.__c];
  return r != null ? n ? n.props.value : r.__ : t;
}
o(qr, "h");
var bo = [];
function Ut(e, t, r, n, i, s) {
  if (e == null || typeof e == "boolean") return "";
  if (typeof e != "object") return Ot(e);
  var a = r.pretty, c = a && typeof a == "string" ? a : "	";
  if (Array.isArray(e)) {
    for (var d = "", l = 0; l < e.length; l++) a && l > 0 && (d += `
`), d += Ut(e[l], t, r, n, i, s);
    return d;
  }
  var u, f = e.type, m = e.props, h = !1;
  if (typeof f == "function") {
    if (h = !0, !r.shallow || !n && r.renderRootComponent !== !1) {
      if (f === ke) {
        var p = [];
        return _o(p, e.props.children), Ut(p, t, r, r.shallowHighOrder !== !1, i, s);
      }
      var b, w = e.__c = oa(e, t);
      R.__b && R.__b(e);
      var I = R.__r;
      if (f.prototype && typeof f.prototype.render == "function") {
        var E = qr(f, t);
        (w = e.__c = new f(m, E)).__v = e, w._dirty = w.__d = !0, w.props = m, w.state == null && (w.state = {}), w._nextState == null && w.__s == null && (w._nextState = w.__s = w.state), w.context = E, f.getDerivedStateFromProps ? w.state = Object.assign({}, w.state, f.getDerivedStateFromProps(w.props, w.state)) : w.componentWillMount && (w.componentWillMount(), w.state = w._nextState !== w.state ? w._nextState : w.__s !== w.state ? w.__s : w.state), I && I(e), b = w.render(w.props, w.state, w.context);
      } else for (var k = qr(f, t), D = 0; w.__d && D++ < 25; ) w.__d = !1, I && I(e), b = f.call(e.__c, m, k);
      return w.getChildContext && (t = Object.assign({}, t, w.getChildContext())), R.diffed && R.diffed(e), Ut(b, t, r, r.shallowHighOrder !== !1, i, s);
    }
    f = (u = f).displayName || u !== Function && u.name || function(vn) {
      var An = (Function.prototype.toString.call(vn).match(/^\s*function\s+([^( ]+)/) || "")[1];
      if (!An) {
        for (var Nt = -1, En = bo.length; En--; ) if (bo[En] === vn) {
          Nt = En;
          break;
        }
        Nt < 0 && (Nt = bo.push(vn) - 1), An = "UnnamedComponent" + Nt;
      }
      return An;
    }(u);
  }
  var j, H, S = "<" + f;
  if (m) {
    var B = Object.keys(m);
    r && r.sortAttributes === !0 && B.sort();
    for (var F = 0; F < B.length; F++) {
      var P = B[F], x = m[P];
      if (P !== "children") {
        if (!Gr.test(P) && (r && r.allAttributes || P !== "key" && P !== "ref" && P !== "__self" && P !== "__source")) {
          if (P === "defaultValue") P = "value";
          else if (P === "defaultChecked") P = "checked";
          else if (P === "defaultSelected") P = "selected";
          else if (P === "className") {
            if (m.class !== void 0) continue;
            P = "class";
          } else i && ra.test(P) && (P = P.toLowerCase().replace(/^xlink:?/, "xlink:"));
          if (P === "htmlFor") {
            if (m.for) continue;
            P = "for";
          }
          P === "style" && x && typeof x == "object" && (x = na(x)), P[0] === "a" && P[1] === "r" && typeof x == "boolean" && (x = String(x));
          var pe = r.attributeHook && r.attributeHook(P, x, t, r, h);
          if (pe || pe === "") S += pe;
          else if (P === "dangerouslySetInnerHTML") H = x && x.__html;
          else if (f === "textarea" && P === "value") j = x;
          else if ((x || x === 0 || x === "") && typeof x != "function") {
            if (!(x !== !0 && x !== "" || (x = P, r && r.xml))) {
              S = S + " " + P;
              continue;
            }
            if (P === "value") {
              if (f === "select") {
                s = x;
                continue;
              }
              f === "option" && s == x && m.selected === void 0 && (S += " selected");
            }
            S = S + " " + P + '="' + Ot(x) + '"';
          }
        }
      } else j = x;
    }
  }
  if (a) {
    var ot = S.replace(/\n\s*/, " ");
    ot === S || ~ot.indexOf(`
`) ? a && ~S.indexOf(`
`) && (S += `
`) : S = ot;
  }
  if (S += ">", Gr.test(f)) throw new Error(f + " is not a valid HTML tag name in " + S);
  var $t, cc = ta.test(f) || r.voidElements && r.voidElements.test(f), he = [];
  if (H) a && qs(H) && (H = `
` + c + Gs(H, c)), S += H;
  else if (j != null && _o($t = [], j).length) {
    for (var bn = a && ~S.indexOf(`
`), Go = !1, _n = 0; _n < $t.length; _n++) {
      var xn = $t[_n];
      if (xn != null && xn !== !1) {
        var Ce = Ut(xn, t, r, !0, f === "svg" || f !== "foreignObject" && i, s);
        if (a && !bn && qs(Ce) && (bn = !0), Ce) if (a) {
          var qo = Ce.length > 0 && Ce[0] != "<";
          Go && qo ? he[he.length - 1] += Ce : he.push(Ce), Go = qo;
        } else he.push(Ce);
      }
    }
    if (a && bn) for (var Sn = he.length; Sn--; ) he[Sn] = `
` + c + Gs(he[Sn], c);
  }
  if (he.length || H) S += he.join("");
  else if (r && r.xml) return S.substring(0, S.length - 1) + " />";
  return !cc || $t || H ? (a && ~S.indexOf(`
`) && (S += `
`), S = S + "</" + f + ">") : S = S.replace(/>$/, " />"), S;
}
o(Ut, "y");
var Bd = { shallow: !0 };
Dt.render = Dt;
var Jd = /* @__PURE__ */ o(function(e, t) {
  return Dt(e, t, Bd);
}, "b"), Zs = [];
function Dt(e, t, r) {
  t = t || {};
  var n, i = R.__s;
  return R.__s = !0, n = r && (r.pretty || r.voidElements || r.sortAttributes || r.shallow || r.allAttributes || r.xml || r.attributeHook) ? Ut(e, t, r) : et(e, t, !1, void 0), R.__c && R.__c(e, Zs), R.__s = i, Zs.length = 0, n;
}
o(Dt, "k");
function zd(e, t) {
  return e === "className" ? "class" : e === "htmlFor" ? "for" : e === "defaultValue" ? "value" : e === "defaultChecked" ? "checked" : e === "defaultSelected" ? "selected" : t && ra.test(e) ? e.toLowerCase().replace(/^xlink:?/, "xlink:") : e;
}
o(zd, "S");
function Md(e, t) {
  return e === "style" && t != null && typeof t == "object" ? na(t) : e[0] === "a" && e[1] === "r" && typeof t == "boolean" ? String(t) : t;
}
o(Md, "w");
var Qs = Array.isArray, ea = Object.assign;
function et(e, t, r, n) {
  if (e == null || e === !0 || e === !1 || e === "") return "";
  if (typeof e != "object") return Ot(e);
  if (Qs(e)) {
    for (var i = "", s = 0; s < e.length; s++) i += et(e[s], t, r, n);
    return i;
  }
  R.__b && R.__b(e);
  var a = e.type, c = e.props;
  if (typeof a == "function") {
    if (a === ke) return et(e.props.children, t, r, n);
    var d;
    d = a.prototype && typeof a.prototype.render == "function" ? function(S, B) {
      var F = S.type, P = qr(F, B), x = new F(S.props, P);
      S.__c = x, x.__v = S, x.__d = !0, x.props = S.props, x.state == null && (x.state = {}), x.__s == null && (x.__s = x.state), x.context = P, F.getDerivedStateFromProps ? x.state = ea({}, x.state, F.getDerivedStateFromProps(x.props, x.state)) : x.componentWillMount && (x.componentWillMount(), x.state = x.__s !== x.state ? x.__s : x.state);
      var pe = R.__r;
      return pe && pe(S), x.render(x.props, x.state, x.context);
    }(e, t) : function(S, B) {
      var F, P = oa(S, B), x = qr(S.type, B);
      S.__c = P;
      for (var pe = R.__r, ot = 0; P.__d && ot++ < 25; ) P.__d = !1, pe && pe(S), F = S.type.call(P, S.props, x);
      return F;
    }(e, t);
    var l = e.__c;
    l.getChildContext && (t = ea({}, t, l.getChildContext()));
    var u = et(d, t, r, n);
    return R.diffed && R.diffed(e), u;
  }
  var f, m, h = "<";
  if (h += a, c) for (var p in f = c.children, c) {
    var b = c[p];
    if (!(p === "key" || p === "ref" || p === "__self" || p === "__source" || p === "children" || p === "className" && "class" in c || p === "htmlFor" && "for" in c || Gr.test(p))) {
      if (b = Md(p = zd(p, r), b), p === "dangerouslySetInnerHTML") m = b && b.__html;
      else if (a === "textarea" && p === "value") f = b;
      else if ((b || b === 0 || b === "") && typeof b != "function") {
        if (b === !0 || b === "") {
          b = p, h = h + " " + p;
          continue;
        }
        if (p === "value") {
          if (a === "select") {
            n = b;
            continue;
          }
          a !== "option" || n != b || "selected" in c || (h += " selected");
        }
        h = h + " " + p + '="' + Ot(b) + '"';
      }
    }
  }
  var w = h;
  if (h += ">", Gr.test(a)) throw new Error(a + " is not a valid HTML tag name in " + h);
  var I = "", E = !1;
  if (m) I += m, E = !0;
  else if (typeof f == "string") I += Ot(f), E = !0;
  else if (Qs(f)) for (var k = 0; k < f.length; k++) {
    var D = f[k];
    if (D != null && D !== !1) {
      var j = et(D, t, a === "svg" || a !== "foreignObject" && r, n);
      j && (I += j, E = !0);
    }
  }
  else if (f != null && f !== !1 && f !== !0) {
    var H = et(f, t, a === "svg" || a !== "foreignObject" && r, n);
    H && (I += H, E = !0);
  }
  if (R.diffed && R.diffed(e), E) h += I;
  else if (ta.test(a)) return w + " />";
  return h + "</" + a + ">";
}
o(et, "j");
Dt.shallowRender = Jd;

// node_modules/@auth/core/lib/actions/callback/oauth/checks.js
var xo = 60 * 15;
async function So(e, t, r) {
  let { cookies: n, logger: i } = r, s = n[e], a = /* @__PURE__ */ new Date();
  a.setTime(a.getTime() + xo * 1e3), i.debug(`CREATE_${e.toUpperCase()}`, {
    name: s.name,
    payload: t,
    COOKIE_TTL: xo,
    expires: a
  });
  let c = await Cr({
    ...r.jwt,
    maxAge: xo,
    token: { value: t },
    salt: s.name
  }), d = { ...s.options, expires: a };
  return { name: s.name, value: c, options: d };
}
o(So, "sealCookie");
async function Vd(e, t, r) {
  try {
    let { logger: n, cookies: i, jwt: s } = r;
    if (n.debug(`PARSE_${e.toUpperCase()}`, { cookie: t }), !t)
      throw new be(`${e} cookie was missing`);
    let a = await Rr({
      ...s,
      token: t,
      salt: i[e].name
    });
    if (a?.value)
      return a.value;
    throw new Error("Invalid cookie");
  } catch (n) {
    throw new be(`${e} value could not be parsed`, {
      cause: n
    });
  }
}
o(Vd, "parseCookie");
function Fd(e, t, r) {
  let { logger: n, cookies: i } = t, s = i[e];
  n.debug(`CLEAR_${e.toUpperCase()}`, { cookie: s }), r.push({
    name: s.name,
    value: "",
    options: { ...i[e].options, maxAge: 0 }
  });
}
o(Fd, "clearCookie");
function vo(e, t) {
  return async function(r, n, i) {
    let { provider: s, logger: a } = i;
    if (!s?.checks?.includes(e))
      return;
    let c = r?.[i.cookies[t].name];
    a.debug(`USE_${t.toUpperCase()}`, { value: c });
    let d = await Vd(t, c, i);
    return Fd(t, i, n), d;
  };
}
o(vo, "useCookie");
var sa = {
  /** Creates a PKCE code challenge and verifier pair. The verifier in stored in the cookie. */
  async create(e) {
    let t = Kr(), r = await Wr(t);
    return { cookie: await So("pkceCodeVerifier", t, e), value: r };
  },
  /**
   * Returns code_verifier if the provider is configured to use PKCE,
   * and clears the container cookie afterwards.
   * An error is thrown if the code_verifier is missing or invalid.
   */
  use: vo("pkce", "pkceCodeVerifier")
}, Gd = 60 * 15, ia = "encodedState", Ao = {
  /** Creates a state cookie with an optionally encoded body. */
  async create(e, t) {
    let { provider: r } = e;
    if (!r.checks.includes("state")) {
      if (t)
        throw new be("State data was provided but the provider is not configured to use state");
      return;
    }
    let n = {
      origin: t,
      random: $r()
    }, i = await Cr({
      secret: e.jwt.secret,
      token: n,
      salt: ia,
      maxAge: Gd
    });
    return { cookie: await So("state", i, e), value: i };
  },
  /**
   * Returns state if the provider is configured to use state,
   * and clears the container cookie afterwards.
   * An error is thrown if the state is missing or invalid.
   */
  use: vo("state", "state"),
  /** Decodes the state. If it could not be decoded, it throws an error. */
  async decode(e, t) {
    try {
      t.logger.debug("DECODE_STATE", { state: e });
      let r = await Rr({
        secret: t.jwt.secret,
        token: e,
        salt: ia
      });
      if (r)
        return r;
      throw new Error("Invalid state");
    } catch (r) {
      throw new be("State could not be decoded", { cause: r });
    }
  }
}, aa = {
  async create(e) {
    if (!e.provider.checks.includes("nonce"))
      return;
    let t = Nr();
    return { cookie: await So("nonce", t, e), value: t };
  },
  /**
   * Returns nonce if the provider is configured to use nonce,
   * and clears the container cookie afterwards.
   * An error is thrown if the nonce is missing or invalid.
   * @see https://openid.net/specs/openid-connect-core-1_0.html#NonceNotes
   * @see https://danielfett.de/2020/05/16/pkce-vs-nonce-equivalent-or-not/#nonce
   */
  use: vo("nonce", "nonce")
}, ib = 60 * 15;

// node_modules/@auth/core/lib/index.js
var ol = Symbol("skip-csrf-check"), il = Symbol("return-type-raw");

// node_modules/@auth/core/lib/utils/env.js
function Eo(e, t, r = !1) {
  try {
    let n = e.AUTH_URL;
    n && (t.basePath ? r || St(t).warn("env-url-basepath-redundant") : t.basePath = new URL(n).pathname);
  } catch {
  } finally {
    t.basePath ?? (t.basePath = "/auth");
  }
  if (!t.secret?.length) {
    t.secret = [];
    let n = e.AUTH_SECRET;
    n && t.secret.push(n);
    for (let i of [1, 2, 3]) {
      let s = e[`AUTH_SECRET_${i}`];
      s && t.secret.unshift(s);
    }
  }
  t.redirectProxyUrl ?? (t.redirectProxyUrl = e.AUTH_REDIRECT_PROXY_URL), t.trustHost ?? (t.trustHost = !!(e.AUTH_URL ?? e.AUTH_TRUST_HOST ?? e.VERCEL ?? e.CF_PAGES ?? e.NODE_ENV !== "production")), t.providers = t.providers.map((n) => {
    let { id: i } = typeof n == "function" ? n({}) : n, s = i.toUpperCase().replace(/-/g, "_"), a = e[`AUTH_${s}_ID`], c = e[`AUTH_${s}_SECRET`], d = e[`AUTH_${s}_ISSUER`], l = e[`AUTH_${s}_KEY`], u = typeof n == "function" ? n({ clientId: a, clientSecret: c, issuer: d, apiKey: l }) : n;
    return u.type === "oauth" || u.type === "oidc" ? (u.clientId ?? (u.clientId = a), u.clientSecret ?? (u.clientSecret = c), u.issuer ?? (u.issuer = d)) : u.type === "email" && (u.apiKey ?? (u.apiKey = l)), u;
  });
}
o(Eo, "setEnvDefaults");

// node_modules/@convex-dev/auth/dist/server/provider_utils.js
function ua(e) {
  let t = da(e), r = t.providers.filter((n) => n.type === "credentials").map((n) => n.extraProviders).flat().filter((n) => n !== void 0);
  return {
    ...t,
    extraProviders: sl(r),
    theme: t.theme ?? {
      colorScheme: "auto",
      logo: "",
      brandColor: "",
      buttonText: ""
    }
  };
}
o(ua, "configDefaults");
function sl(e) {
  let t = { providers: e };
  return da(t), t.providers;
}
o(sl, "materializeProviders");
function da(e) {
  let t = e.providers.map((n) => al(typeof n == "function" ? n() : n)), r = { ...e, providers: t };
  return Eo(process.env, r), r.providers.forEach((n) => {
    if (n.type === "phone") {
      let i = n.id.toUpperCase().replace(/-/g, "_");
      n.apiKey ??= process.env[`AUTH_${i}_KEY`];
    }
  }), r;
}
o(da, "materializeAndDefaultProviders");
function al(e) {
  let t = Io(e, e.options);
  return t.type === "oauth" || t.type === "oidc" ? dl(t) : t;
}
o(al, "providerDefaults");
var cl = /* @__PURE__ */ o((e) => la({
  id: e.sub ?? e.id ?? crypto.randomUUID(),
  name: e.name ?? e.nickname ?? e.preferred_username,
  email: e.email ?? void 0,
  image: e.picture ?? void 0
}), "defaultProfile"), ul = /* @__PURE__ */ o((e) => la({
  access_token: e.access_token,
  id_token: e.id_token,
  refresh_token: e.refresh_token,
  expires_at: e.expires_at,
  scope: e.scope,
  token_type: e.token_type,
  session_state: e.session_state
}), "defaultAccount");
function la(e) {
  let t = {};
  for (let [r, n] of Object.entries(e))
    n !== void 0 && (t[r] = n);
  return t;
}
o(la, "stripUndefined");
function dl(e) {
  e.issuer && (e.wellKnown ??= `${e.issuer}/.well-known/openid-configuration`);
  let t = e.checks ?? ["pkce"];
  return e.redirectProxyUrl && (t.includes("state") || t.push("state"), e.redirectProxyUrl = `${e.redirectProxyUrl}/callback/${e.id}`), {
    ...e,
    checks: t,
    profile: e.profile ?? cl,
    account: e.account ?? ul
  };
}
o(dl, "normalizeOAuth");
var ll = "convexauth.mumbojumbo", fl = `https://${ll}`;
function $e(e, t) {
  if (!e && t)
    return;
  if (typeof e == "string")
    return { url: new URL(e) };
  let r = new URL(e?.url ?? fl);
  if (e?.params != null)
    for (let [n, i] of Object.entries(e.params))
      r.searchParams.set(n, String(n === "claims" ? JSON.stringify(i) : i));
  return { url: r, request: e?.request, conform: e?.conform };
}
o($e, "normalizeEndpoint");
function Io(e, ...t) {
  if (!t.length)
    return e;
  let r = t.shift();
  if (ko(e) && ko(r))
    for (let n in r)
      ko(r[n]) ? (e[n] || Object.assign(e, { [n]: {} }), Io(e[n], r[n])) : Object.assign(e, { [n]: r[n] });
  return Io(e, ...t);
}
o(Io, "merge");
function ko(e) {
  return e && typeof e == "object" && !Array.isArray(e);
}
o(ko, "isObject");
function fa(e, t) {
  let r = e.providers.concat(t ? e.extraProviders : []).map((n) => `\`${n.id}\``);
  return r.length > 0 ? r.join(", ") : "no providers have been configured";
}
o(fa, "listAvailableProviders");

// node_modules/@oslojs/binary/dist/uint.js
var To = class {
  static {
    o(this, "BigEndian");
  }
  uint8(t, r) {
    if (t.byteLength < r + 1)
      throw new TypeError("Insufficient bytes");
    return t[r];
  }
  uint16(t, r) {
    if (t.byteLength < r + 2)
      throw new TypeError("Insufficient bytes");
    return t[r] << 8 | t[r + 1];
  }
  uint32(t, r) {
    if (t.byteLength < r + 4)
      throw new TypeError("Insufficient bytes");
    let n = 0;
    for (let i = 0; i < 4; i++)
      n |= t[r + i] << 24 - i * 8;
    return n;
  }
  uint64(t, r) {
    if (t.byteLength < r + 8)
      throw new TypeError("Insufficient bytes");
    let n = 0n;
    for (let i = 0; i < 8; i++)
      n |= BigInt(t[r + i]) << BigInt(56 - i * 8);
    return n;
  }
  putUint8(t, r, n) {
    if (t.length < n + 1)
      throw new TypeError("Not enough space");
    if (r < 0 || r > 255)
      throw new TypeError("Invalid uint8 value");
    t[n] = r;
  }
  putUint16(t, r, n) {
    if (t.length < n + 2)
      throw new TypeError("Not enough space");
    if (r < 0 || r > 65535)
      throw new TypeError("Invalid uint16 value");
    t[n] = r >> 8, t[n + 1] = r & 255;
  }
  putUint32(t, r, n) {
    if (t.length < n + 4)
      throw new TypeError("Not enough space");
    if (r < 0 || r > 4294967295)
      throw new TypeError("Invalid uint32 value");
    for (let i = 0; i < 4; i++)
      t[n + i] = r >> (3 - i) * 8 & 255;
  }
  putUint64(t, r, n) {
    if (t.length < n + 8)
      throw new TypeError("Not enough space");
    if (r < 0 || r > 18446744073709551615n)
      throw new TypeError("Invalid uint64 value");
    for (let i = 0; i < 8; i++)
      t[n + i] = Number(r >> BigInt((7 - i) * 8) & 0xffn);
  }
}, Co = class {
  static {
    o(this, "LittleEndian");
  }
  uint8(t, r) {
    if (t.byteLength < r + 1)
      throw new TypeError("Insufficient bytes");
    return t[r];
  }
  uint16(t, r) {
    if (t.byteLength < r + 2)
      throw new TypeError("Insufficient bytes");
    return t[r] | t[r + 1] << 8;
  }
  uint32(t, r) {
    if (t.byteLength < r + 4)
      throw new TypeError("Insufficient bytes");
    let n = 0;
    for (let i = 0; i < 4; i++)
      n |= t[r + i] << i * 8;
    return n;
  }
  uint64(t, r) {
    if (t.byteLength < r + 8)
      throw new TypeError("Insufficient bytes");
    let n = 0n;
    for (let i = 0; i < 8; i++)
      n |= BigInt(t[r + i]) << BigInt(i * 8);
    return n;
  }
  putUint8(t, r, n) {
    if (t.length < 1 + n)
      throw new TypeError("Insufficient space");
    if (r < 0 || r > 255)
      throw new TypeError("Invalid uint8 value");
    t[n] = r;
  }
  putUint16(t, r, n) {
    if (t.length < 2 + n)
      throw new TypeError("Insufficient space");
    if (r < 0 || r > 65535)
      throw new TypeError("Invalid uint16 value");
    t[n + 1] = r >> 8, t[n] = r & 255;
  }
  putUint32(t, r, n) {
    if (t.length < 4 + n)
      throw new TypeError("Insufficient space");
    if (r < 0 || r > 4294967295)
      throw new TypeError("Invalid uint32 value");
    for (let i = 0; i < 4; i++)
      t[n + i] = r >> i * 8 & 255;
  }
  putUint64(t, r, n) {
    if (t.length < 8 + n)
      throw new TypeError("Insufficient space");
    if (r < 0 || r > 18446744073709551615n)
      throw new TypeError("Invalid uint64 value");
    for (let i = 0; i < 8; i++)
      t[n + i] = Number(r >> BigInt(i * 8) & 0xffn);
  }
}, tt = new To(), pl = new Co();

// node_modules/@oslojs/binary/dist/bits.js
function ie(e, t) {
  return (e << 32 - t | e >>> t) >>> 0;
}
o(ie, "rotr32");

// node_modules/@oslojs/binary/dist/big.js
function Xr(e) {
  if (e.byteLength < 1)
    throw new TypeError("Empty Uint8Array");
  let t = 0n;
  for (let r = 0; r < e.byteLength; r++)
    t += BigInt(e[r]) << BigInt((e.byteLength - 1 - r) * 8);
  return t;
}
o(Xr, "bigIntFromBytes");

// node_modules/@oslojs/crypto/dist/sha2/sha224.js
var fx = new Uint32Array([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);

// node_modules/@oslojs/crypto/dist/sha2/sha256.js
function Ro(e) {
  let t = new Yr();
  return t.update(e), t.digest();
}
o(Ro, "sha256");
var Yr = class {
  static {
    o(this, "SHA256");
  }
  blockSize = 64;
  size = 32;
  blocks = new Uint8Array(64);
  currentBlockSize = 0;
  H = new Uint32Array([
    1779033703,
    3144134277,
    1013904242,
    2773480762,
    1359893119,
    2600822924,
    528734635,
    1541459225
  ]);
  l = 0n;
  w = new Uint32Array(64);
  update(t) {
    if (this.l += BigInt(t.byteLength) * 8n, this.currentBlockSize + t.byteLength < 64) {
      this.blocks.set(t, this.currentBlockSize), this.currentBlockSize += t.byteLength;
      return;
    }
    let r = 0;
    if (this.currentBlockSize > 0) {
      let n = t.slice(0, 64 - this.currentBlockSize);
      this.blocks.set(n, this.currentBlockSize), this.process(), r += n.byteLength, this.currentBlockSize = 0;
    }
    for (; r + 64 <= t.byteLength; ) {
      let n = t.slice(r, r + 64);
      this.blocks.set(n), this.process(), r += 64;
    }
    if (t.byteLength - r > 0) {
      let n = t.slice(r);
      this.blocks.set(n), this.currentBlockSize = n.byteLength;
    }
  }
  digest() {
    this.blocks[this.currentBlockSize] = 128, this.currentBlockSize += 1, 64 - this.currentBlockSize < 8 && (this.blocks.fill(0, this.currentBlockSize), this.process(), this.currentBlockSize = 0), this.blocks.fill(0, this.currentBlockSize), tt.putUint64(this.blocks, this.l, this.blockSize - 8), this.process();
    let t = new Uint8Array(32);
    for (let r = 0; r < 8; r++)
      tt.putUint32(t, this.H[r], r * 4);
    return t;
  }
  process() {
    for (let l = 0; l < 16; l++)
      this.w[l] = (this.blocks[l * 4] << 24 | this.blocks[l * 4 + 1] << 16 | this.blocks[l * 4 + 2] << 8 | this.blocks[l * 4 + 3]) >>> 0;
    for (let l = 16; l < 64; l++) {
      let u = (ie(this.w[l - 2], 17) ^ ie(this.w[l - 2], 19) ^ this.w[l - 2] >>> 10) >>> 0, f = (ie(this.w[l - 15], 7) ^ ie(this.w[l - 15], 18) ^ this.w[l - 15] >>> 3) >>> 0;
      this.w[l] = u + this.w[l - 7] + f + this.w[l - 16] | 0;
    }
    let t = this.H[0], r = this.H[1], n = this.H[2], i = this.H[3], s = this.H[4], a = this.H[5], c = this.H[6], d = this.H[7];
    for (let l = 0; l < 64; l++) {
      let u = (ie(s, 6) ^ ie(s, 11) ^ ie(s, 25)) >>> 0, f = (s & a ^ ~s & c) >>> 0, m = d + u + f + ml[l] + this.w[l] | 0, h = (ie(t, 2) ^ ie(t, 13) ^ ie(t, 22)) >>> 0, p = (t & r ^ t & n ^ r & n) >>> 0, b = h + p | 0;
      d = c, c = a, a = s, s = i + m | 0, i = n, n = r, r = t, t = m + b | 0;
    }
    this.H[0] = t + this.H[0] | 0, this.H[1] = r + this.H[1] | 0, this.H[2] = n + this.H[2] | 0, this.H[3] = i + this.H[3] | 0, this.H[4] = s + this.H[4] | 0, this.H[5] = a + this.H[5] | 0, this.H[6] = c + this.H[6] | 0, this.H[7] = d + this.H[7] | 0;
  }
}, ml = new Uint32Array([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);

// node_modules/@oslojs/crypto/dist/sha2/sha512.js
var xx = new BigUint64Array([
  0x428a2f98d728ae22n,
  0x7137449123ef65cdn,
  0xb5c0fbcfec4d3b2fn,
  0xe9b5dba58189dbbcn,
  0x3956c25bf348b538n,
  0x59f111f1b605d019n,
  0x923f82a4af194f9bn,
  0xab1c5ed5da6d8118n,
  0xd807aa98a3030242n,
  0x12835b0145706fben,
  0x243185be4ee4b28cn,
  0x550c7dc3d5ffb4e2n,
  0x72be5d74f27b896fn,
  0x80deb1fe3b1696b1n,
  0x9bdc06a725c71235n,
  0xc19bf174cf692694n,
  0xe49b69c19ef14ad2n,
  0xefbe4786384f25e3n,
  0x0fc19dc68b8cd5b5n,
  0x240ca1cc77ac9c65n,
  0x2de92c6f592b0275n,
  0x4a7484aa6ea6e483n,
  0x5cb0a9dcbd41fbd4n,
  0x76f988da831153b5n,
  0x983e5152ee66dfabn,
  0xa831c66d2db43210n,
  0xb00327c898fb213fn,
  0xbf597fc7beef0ee4n,
  0xc6e00bf33da88fc2n,
  0xd5a79147930aa725n,
  0x06ca6351e003826fn,
  0x142929670a0e6e70n,
  0x27b70a8546d22ffcn,
  0x2e1b21385c26c926n,
  0x4d2c6dfc5ac42aedn,
  0x53380d139d95b3dfn,
  0x650a73548baf63den,
  0x766a0abb3c77b2a8n,
  0x81c2c92e47edaee6n,
  0x92722c851482353bn,
  0xa2bfe8a14cf10364n,
  0xa81a664bbc423001n,
  0xc24b8b70d0f89791n,
  0xc76c51a30654be30n,
  0xd192e819d6ef5218n,
  0xd69906245565a910n,
  0xf40e35855771202an,
  0x106aa07032bbd1b8n,
  0x19a4c116b8d2d0c8n,
  0x1e376c085141ab53n,
  0x2748774cdf8eeb99n,
  0x34b0bcb5e19b48a8n,
  0x391c0cb3c5c95a63n,
  0x4ed8aa4ae3418acbn,
  0x5b9cca4f7763e373n,
  0x682e6ff3d6b2b8a3n,
  0x748f82ee5defb2fcn,
  0x78a5636f43172f60n,
  0x84c87814a1f0ab72n,
  0x8cc702081a6439ecn,
  0x90befffa23631e28n,
  0xa4506cebde82bde9n,
  0xbef9a3f7b2c67915n,
  0xc67178f2e372532bn,
  0xca273eceea26619cn,
  0xd186b8c721c0c207n,
  0xeada7dd6cde0eb1en,
  0xf57d4f7fee6ed178n,
  0x06f067aa72176fban,
  0x0a637dc5a2c898a6n,
  0x113f9804bef90daen,
  0x1b710b35131c471bn,
  0x28db77f523047d84n,
  0x32caab7b40c72493n,
  0x3c9ebe0a15c9bebcn,
  0x431d67c49c100d4cn,
  0x4cc5d4becb3e42b6n,
  0x597f299cfc657e2an,
  0x5fcb6fab3ad6faecn,
  0x6c44198c4a475817n
]);

// node_modules/@oslojs/encoding/dist/hex.js
function Po(e) {
  let t = "";
  for (let r = 0; r < e.length; r++)
    t += ha[e[r] >> 4], t += ha[e[r] & 15];
  return t;
}
o(Po, "encodeHexLowerCase");
var ha = "0123456789abcdef";

// node_modules/@oslojs/encoding/dist/base32.js
var ma;
(function(e) {
  e[e.Include = 0] = "Include", e[e.None = 1] = "None";
})(ma || (ma = {}));
var ya;
(function(e) {
  e[e.Required = 0] = "Required", e[e.Ignore = 1] = "Ignore";
})(ya || (ya = {}));

// node_modules/@oslojs/encoding/dist/base64.js
var wa;
(function(e) {
  e[e.Include = 0] = "Include", e[e.None = 1] = "None";
})(wa || (wa = {}));
var ga;
(function(e) {
  e[e.Required = 0] = "Required", e[e.Ignore = 1] = "Ignore";
})(ga || (ga = {}));

// node_modules/@oslojs/crypto/dist/random/index.js
function yl(e, t) {
  if (t < 2)
    throw new Error("Argument 'max' must be a positive integer larger than 1");
  let r = (t - 1n).toString(2).length, n = r % 8, i = new Uint8Array(Math.ceil(r / 8));
  try {
    e.read(i);
  } catch (a) {
    throw new Error("Failed to retrieve random bytes", {
      cause: a
    });
  }
  n !== 0 && (i[0] &= (1 << n) - 1);
  let s = Xr(i);
  for (; s >= t; ) {
    try {
      e.read(i);
    } catch (a) {
      throw new Error("Failed to retrieve random bytes", {
        cause: a
      });
    }
    n !== 0 && (i[0] &= (1 << n) - 1), s = Xr(i);
  }
  return s;
}
o(yl, "generateRandomInteger");
function wl(e, t) {
  if (t < 2 || t > Number.MAX_SAFE_INTEGER)
    throw new Error("Argument 'max' must be a positive integer larger than 1");
  return Number(yl(e, BigInt(t)));
}
o(wl, "generateRandomIntegerNumber");
function ba(e, t, r) {
  let n = "";
  for (let i = 0; i < r; i++)
    n += t[wl(e, t.length)];
  return n;
}
o(ba, "generateRandomString");

// node_modules/@convex-dev/auth/dist/server/implementation/utils.js
var Ie = "|", Oo = "|";
function Zr(e) {
  return e !== void 0 ? Number(e) : void 0;
}
o(Zr, "stringToNumber");
async function rt(e) {
  return Po(Ro(new TextEncoder().encode(e)));
}
o(rt, "sha256");
function Qr(e, t) {
  return ba({
    read(n) {
      crypto.getRandomValues(n);
    }
  }, t, e);
}
o(Qr, "generateRandomString");
function Do(e) {
  _(T.ERROR, e instanceof Error ? e.message + `
` + e.stack?.replace("\\n", `
`) : e);
}
o(Do, "logError");
var T = {
  ERROR: "ERROR",
  WARN: "WARN",
  INFO: "INFO",
  DEBUG: "DEBUG"
};
function _(e, ...t) {
  let r = T[process.env.AUTH_LOG_LEVEL ?? "INFO"] ?? "INFO";
  switch (e) {
    case "ERROR":
      console.error(...t);
      break;
    case "WARN":
      r !== "ERROR" && console.warn(...t);
      break;
    case "INFO":
      (r === "INFO" || r === "DEBUG") && console.info(...t);
      break;
    case "DEBUG":
      r === "DEBUG" && console.debug(...t);
      break;
  }
}
o(_, "logWithLevel");
var Uo = 5;
function N(e) {
  return e === "" ? "" : process.env.AUTH_LOG_SECRETS !== "true" ? e.length < Uo * 2 ? "<redacted>" : e.substring(0, Uo) + "<redacted>" + e.substring(e.length - Uo) : e;
}
o(N, "maybeRedact");

// node_modules/@convex-dev/auth/dist/server/implementation/tokens.js
var gl = 1e3 * 60 * 60;
async function _a(e, t) {
  let r = await zn(Q("JWT_PRIVATE_KEY"), "RS256"), n = new Date(Date.now() + (t.jwt?.durationMs ?? gl));
  return await new gt({
    sub: e.userId + Ie + e.sessionId
  }).setProtectedHeader({ alg: "RS256" }).setIssuedAt().setIssuer(Q("CONVEX_SITE_URL")).setAudience("convex").setExpirationTime(n).sign(r);
}
o(_a, "generateToken");

// node_modules/@convex-dev/auth/dist/server/implementation/refreshTokens.js
var bl = 1e3 * 60 * 60 * 24 * 30, en = 10 * 1e3;
async function xa(e, t, r, n) {
  let i = Date.now() + (t.session?.inactiveDurationMs ?? Zr(process.env.AUTH_SESSION_INACTIVE_DURATION_MS) ?? bl);
  return await e.db.insert("authRefreshTokens", {
    sessionId: r,
    expirationTime: i,
    parentRefreshTokenId: n ?? void 0
  });
}
o(xa, "createRefreshToken");
var Sa = /* @__PURE__ */ o((e, t) => `${e}${Oo}${t}`, "formatRefreshToken"), tn = /* @__PURE__ */ o((e) => {
  let [t, r] = e.split(Oo);
  if (!t || !r)
    throw new Error(`Can't parse refresh token: ${N(e)}`);
  return {
    refreshTokenId: t,
    sessionId: r
  };
}, "parseRefreshToken");
async function va(e, t) {
  let r = [t], n = [t._id];
  for (; n.length > 0; ) {
    let i = [];
    for (let s of n) {
      let a = await e.db.query("authRefreshTokens").withIndex("sessionIdAndParentRefreshTokenId", (c) => c.eq("sessionId", t.sessionId).eq("parentRefreshTokenId", s)).collect();
      r.push(...a), i.push(...a.map((c) => c._id));
    }
    n = i;
  }
  for (let i of r)
    (i.firstUsedTime === void 0 || i.firstUsedTime > Date.now() - en) && await e.db.patch(i._id, {
      firstUsedTime: Date.now() - en
    });
  return r;
}
o(va, "invalidateRefreshTokensInSubtree");
async function rn(e, t) {
  let r = await e.db.query("authRefreshTokens").withIndex("sessionIdAndParentRefreshTokenId", (n) => n.eq("sessionId", t)).collect();
  for (let n of r)
    await e.db.delete(n._id);
}
o(rn, "deleteAllRefreshTokens");
async function Aa(e, t, r) {
  let n = await e.db.get(t);
  if (n === null)
    return _(T.ERROR, "Invalid refresh token"), null;
  if (n.expirationTime < Date.now())
    return _(T.ERROR, "Expired refresh token"), null;
  if (n.sessionId !== r)
    return _(T.ERROR, "Invalid refresh token session ID"), null;
  let i = await e.db.get(n.sessionId);
  return i === null ? (_(T.ERROR, "Invalid refresh token session"), null) : i.expirationTime < Date.now() ? (_(T.ERROR, "Expired refresh token session"), null) : { session: i, refreshTokenDoc: n };
}
o(Aa, "refreshTokenIfValid");
async function Ea(e, t) {
  return e.db.query("authRefreshTokens").withIndex("sessionId", (r) => r.eq("sessionId", t)).filter((r) => r.eq(r.field("firstUsedTime"), void 0)).order("desc").first();
}
o(Ea, "loadActiveRefreshToken");

// node_modules/@convex-dev/auth/dist/server/implementation/sessions.js
var _l = 1e3 * 60 * 60 * 24 * 30;
async function nn(e, t, r, n, i) {
  return {
    userId: r,
    sessionId: n,
    tokens: i ? await Lt(e, t, {
      userId: r,
      sessionId: n,
      issuedRefreshTokenId: null,
      parentRefreshTokenId: null
    }) : null
  };
}
o(nn, "maybeGenerateTokensForSession");
async function on(e, t, r) {
  let n = await se(e);
  if (n !== null) {
    let i = await e.db.get(n);
    i !== null && await Ht(e, i);
  }
  return await xl(e, r, t);
}
o(on, "createNewAndDeleteExistingSession");
async function Lt(e, t, r) {
  let n = { userId: r.userId, sessionId: r.sessionId }, i = r.issuedRefreshTokenId ?? await xa(e, t, r.sessionId, r.parentRefreshTokenId), s = {
    token: await _a(n, t),
    refreshToken: Sa(i, r.sessionId)
  };
  return _(T.DEBUG, `Generated token ${N(s.token)} and refresh token ${N(i)} for session ${N(r.sessionId)}`), s;
}
o(Lt, "generateTokensForSession");
async function xl(e, t, r) {
  let n = Date.now() + (r.session?.totalDurationMs ?? Zr(process.env.AUTH_SESSION_TOTAL_DURATION_MS) ?? _l);
  return await e.db.insert("authSessions", { expirationTime: n, userId: t });
}
o(xl, "createSession");
async function Ht(e, t) {
  await e.db.delete(t._id), await rn(e, t._id);
}
o(Ht, "deleteSession");
async function se(e) {
  let t = await e.auth.getUserIdentity();
  if (t === null)
    return null;
  let [, r] = t.subject.split(Ie);
  return r;
}
o(se, "getAuthSessionId");

// node_modules/@convex-dev/auth/dist/server/implementation/mutations/signIn.js
var ka = y.object({
  userId: y.id("users"),
  sessionId: y.optional(y.id("authSessions")),
  generateTokens: y.boolean()
});
async function Ia(e, t, r) {
  _(T.DEBUG, "signInImpl args:", t);
  let { userId: n, sessionId: i, generateTokens: s } = t, a = i ?? await on(e, r, n);
  return await nn(e, r, n, a, s);
}
o(Ia, "signInImpl");
var Lo = /* @__PURE__ */ o(async (e, t) => e.runMutation("auth:store", {
  args: {
    type: "signIn",
    ...t
  }
}), "callSignIn");

// node_modules/@convex-dev/auth/dist/server/implementation/mutations/signOut.js
async function Ta(e) {
  let t = await se(e);
  if (t !== null) {
    let r = await e.db.get(t);
    if (r !== null)
      return await Ht(e, r), { userId: r.userId, sessionId: r._id };
  }
  return null;
}
o(Ta, "signOutImpl");
var Ho = /* @__PURE__ */ o(async (e) => e.runMutation("auth:store", {
  args: {
    type: "signOut"
  }
}), "callSignOut");

// node_modules/@convex-dev/auth/dist/server/implementation/mutations/refreshSession.js
var Ca = y.object({
  refreshToken: y.string()
});
async function Ra(e, t, r, n) {
  let { refreshToken: i } = t, { refreshTokenId: s, sessionId: a } = tn(i);
  _("DEBUG", `refreshSessionImpl args: Token ID: ${N(s)} Session ID: ${N(a)}`);
  let c = await Aa(e, s, a);
  if (c === null) {
    let h = await e.db.get(a);
    return h !== null && await e.db.delete(h._id), await rn(e, a), null;
  }
  let { session: d } = c, l = d._id, u = d.userId, f = c.refreshTokenDoc.firstUsedTime;
  if (f === void 0) {
    await e.db.patch(s, {
      firstUsedTime: Date.now()
    });
    let h = await Lt(e, n, {
      userId: u,
      sessionId: l,
      issuedRefreshTokenId: null,
      parentRefreshTokenId: s
    }), { refreshTokenId: p } = tn(h.refreshToken);
    return _("DEBUG", `Exchanged ${N(c.refreshTokenDoc._id)} (first use) for new refresh token ${N(p)}`), h;
  }
  let m = await Ea(e, a);
  if (_("DEBUG", `Active refresh token: ${N(m?._id ?? "(none)")}, parent ${N(m?.parentRefreshTokenId ?? "(none)")}`), m !== null && m.parentRefreshTokenId === s)
    return _("DEBUG", `Token ${N(c.refreshTokenDoc._id)} is parent of active refresh token ${N(m._id)}, so returning that token`), await Lt(e, n, {
      userId: u,
      sessionId: l,
      issuedRefreshTokenId: m._id,
      parentRefreshTokenId: s
    });
  if (f + en > Date.now()) {
    let h = await Lt(e, n, {
      userId: u,
      sessionId: l,
      issuedRefreshTokenId: null,
      parentRefreshTokenId: s
    }), { refreshTokenId: p } = tn(h.refreshToken);
    return _("DEBUG", `Exchanged ${N(c.refreshTokenDoc._id)} (reuse) for new refresh token ${N(p)}`), h;
  } else {
    _("ERROR", "Refresh token used outside of reuse window"), _("DEBUG", `Token ${N(c.refreshTokenDoc._id)} being used outside of reuse window, so invalidating all refresh tokens in subtree`);
    let h = await va(e, c.refreshTokenDoc);
    return _("DEBUG", `Invalidated ${h.length} refresh tokens in subtree: ${h.map((p) => N(p._id)).join(", ")}`), null;
  }
}
o(Ra, "refreshSessionImpl");
var Ko = /* @__PURE__ */ o(async (e, t) => e.runMutation("auth:store", {
  args: {
    type: "refreshSession",
    ...t
  }
}), "callRefreshSession");

// node_modules/@convex-dev/auth/dist/server/implementation/rateLimit.js
async function sn(e, t, r) {
  let n = await Pa(e, t, r);
  return n === null ? !1 : n.attempsLeft < 1;
}
o(sn, "isSignInRateLimited");
async function an(e, t, r) {
  let n = await Pa(e, t, r);
  if (n !== null)
    await e.db.patch(n.limit._id, {
      attemptsLeft: n.attempsLeft - 1,
      lastAttemptTime: Date.now()
    });
  else {
    let i = Ua(r);
    await e.db.insert("authRateLimits", {
      identifier: t,
      attemptsLeft: i - 1,
      lastAttemptTime: Date.now()
    });
  }
}
o(an, "recordFailedSignIn");
async function cn(e, t) {
  let r = await e.db.query("authRateLimits").withIndex("identifier", (n) => n.eq("identifier", t)).unique();
  r !== null && await e.db.delete(r._id);
}
o(cn, "resetSignInRateLimit");
async function Pa(e, t, r) {
  let n = Date.now(), i = Ua(r), s = await e.db.query("authRateLimits").withIndex("identifier", (l) => l.eq("identifier", t)).unique();
  if (s === null)
    return null;
  let a = n - s.lastAttemptTime, c = i / (60 * 60 * 1e3), d = Math.min(i, s.attemptsLeft + a * c);
  return { limit: s, attempsLeft: d };
}
o(Pa, "getRateLimitState");
function Ua(e) {
  return e.signIn?.maxFailedAttempsPerHour ?? 10;
}
o(Ua, "configuredMaxAttempsPerHour");

// node_modules/@convex-dev/auth/dist/server/implementation/users.js
async function Te(e, t, r, n, i) {
  let s = await Sl(e, t, "existingAccount" in r ? r.existingAccount : null, n, i), a = await El(e, s, r, n);
  return { userId: s, accountId: a };
}
o(Te, "upsertUserAndAccount");
async function Sl(e, t, r, n, i) {
  _(T.DEBUG, "defaultCreateOrUpdateUser args:", {
    existingAccountId: r?._id,
    existingSessionId: t,
    args: n
  });
  let s = r?.userId ?? null;
  if (i.callbacks?.createOrUpdateUser !== void 0)
    return _(T.DEBUG, "Using custom createOrUpdateUser callback"), await i.callbacks.createOrUpdateUser(e, {
      existingUserId: s,
      ...n
    });
  let { provider: a, profile: { emailVerified: c, phoneVerified: d, ...l } } = n, u = c ?? ((a.type === "oauth" || a.type === "oidc") && a.allowDangerousEmailAccountLinking !== !1), f = d ?? !1, m = n.shouldLinkViaEmail || u || a.type === "email", h = n.shouldLinkViaPhone || f || a.type === "phone", p = s;
  if (s === null) {
    let E = typeof l.email == "string" && m ? (await vl(e, l.email))?._id ?? null : null, k = typeof l.phone == "string" && h ? (await Al(e, l.phone))?._id ?? null : null;
    E !== null && k !== null ? (_(T.DEBUG, `Found existing email and phone verified users, so not linking: email: ${E}, phone: ${k}`), p = null) : E !== null ? (_(T.DEBUG, `Found existing email verified user, linking: ${E}`), p = E) : k !== null ? (_(T.DEBUG, `Found existing phone verified user, linking: ${k}`), p = k) : (_(T.DEBUG, "No existing verified users found, creating new user"), p = null);
  }
  let b = {
    ...u ? { emailVerificationTime: Date.now() } : null,
    ...f ? { phoneVerificationTime: Date.now() } : null,
    ...l
  }, w = p;
  if (p !== null)
    try {
      await e.db.patch(p, b);
    } catch (E) {
      throw new Error(`Could not update user document with ID \`${p}\`, either the user has been deleted but their account has not, or the profile data doesn't match the \`users\` table schema: ${E.message}`);
    }
  else
    p = await e.db.insert("users", b);
  let I = i.callbacks?.afterUserCreatedOrUpdated;
  return I !== void 0 ? (_(T.DEBUG, "Calling custom afterUserCreatedOrUpdated callback"), await I(e, {
    userId: p,
    existingUserId: w,
    ...n
  })) : _(T.DEBUG, "No custom afterUserCreatedOrUpdated callback, skipping"), p;
}
o(Sl, "defaultCreateOrUpdateUser");
async function vl(e, t) {
  let r = await e.db.query("users").withIndex("email", (n) => n.eq("email", t)).filter((n) => n.neq(n.field("emailVerificationTime"), void 0)).take(2);
  return r.length === 1 ? r[0] : null;
}
o(vl, "uniqueUserWithVerifiedEmail");
async function Al(e, t) {
  let r = await e.db.query("users").withIndex("phone", (n) => n.eq("phone", t)).filter((n) => n.neq(n.field("phoneVerificationTime"), void 0)).take(2);
  return r.length === 1 ? r[0] : null;
}
o(Al, "uniqueUserWithVerifiedPhone");
async function El(e, t, r, n) {
  let i = "existingAccount" in r ? r.existingAccount._id : await e.db.insert("authAccounts", {
    userId: t,
    provider: n.provider.id,
    providerAccountId: r.providerAccountId,
    secret: r.secret
  });
  return "existingAccount" in r && r.existingAccount.userId !== t && await e.db.patch(i, { userId: t }), n.profile.emailVerified && await e.db.patch(i, { emailVerified: n.profile.email }), n.profile.phoneVerified && await e.db.patch(i, { phoneVerified: n.profile.phone }), i;
}
o(El, "createOrUpdateAccount");
async function Oa(e, t) {
  let r = await e.db.get(t);
  if (r === null)
    throw new Error(`Expected an account to exist for ID "${t}"`);
  return r;
}
o(Oa, "getAccountOrThrow");

// node_modules/@convex-dev/auth/dist/server/implementation/mutations/verifyCodeAndSignIn.js
var Da = y.object({
  params: y.any(),
  provider: y.optional(y.string()),
  verifier: y.optional(y.string()),
  generateTokens: y.boolean(),
  allowExtraProviders: y.boolean()
});
async function La(e, t, r, n) {
  _(T.DEBUG, "verifyCodeAndSignInImpl args:", {
    params: { email: t.params.email, phone: t.params.phone },
    provider: t.provider,
    verifier: t.verifier,
    generateTokens: t.generateTokens,
    allowExtraProviders: t.allowExtraProviders
  });
  let { generateTokens: i, provider: s, allowExtraProviders: a } = t, c = t.params.email ?? t.params.phone;
  if (c !== void 0 && await sn(e, c, n))
    return _(T.ERROR, "Too many failed attempts to verify code for this email"), null;
  let d = await kl(e, t, s ?? null, r, a, n, await se(e));
  if (d === null)
    return c !== void 0 && await an(e, c, n), null;
  c !== void 0 && await cn(e, c);
  let { userId: l } = d, u = await on(e, n, l);
  return await nn(e, n, l, u, i);
}
o(La, "verifyCodeAndSignInImpl");
var Kt = /* @__PURE__ */ o(async (e, t) => e.runMutation("auth:store", {
  args: {
    type: "verifyCodeAndSignIn",
    ...t
  }
}), "callVerifyCodeAndSignIn");
async function kl(e, t, r, n, i, s, a) {
  let { params: c, verifier: d } = t, l = await rt(c.code), u = await e.db.query("authVerificationCodes").withIndex("code", (E) => E.eq("code", l)).unique();
  if (u === null)
    return _(T.ERROR, "Invalid verification code"), null;
  if (await e.db.delete(u._id), u.verifier !== d)
    return _(T.ERROR, "Invalid verifier"), null;
  if (u.expirationTime < Date.now())
    return _(T.ERROR, "Expired verification code"), null;
  let { accountId: f, emailVerified: m, phoneVerified: h } = u, p = await e.db.get(f);
  if (p === null)
    return _(T.ERROR, "Account associated with this email has been deleted"), null;
  if (r !== null && u.provider !== r)
    return _(T.ERROR, `Invalid provider "${r}" for given \`code\`, which was generated by provider "${u.provider}"`), null;
  let b = n(u.provider, i);
  b !== null && (b.type === "email" || b.type === "phone") && b.authorize !== void 0 && await b.authorize(t.params, p);
  let w = p.userId, I = n(p.provider);
  return I.type === "oauth" || I.type === "oidc" || ({ userId: w } = await Te(e, a, { existingAccount: p }, {
    type: "verification",
    provider: I,
    profile: {
      ...m !== void 0 ? { email: m, emailVerified: !0 } : {},
      ...h !== void 0 ? { phone: h, phoneVerified: !0 } : {}
    }
  }, s)), { providerAccountId: p.providerAccountId, userId: w };
}
o(kl, "verifyCodeOnly");

// node_modules/@convex-dev/auth/dist/server/implementation/mutations/verifierSignature.js
var Ha = y.object({
  verifier: y.string(),
  signature: y.string()
});
async function Ka(e, t) {
  let { verifier: r, signature: n } = t, i = await e.db.get(r);
  if (i === null)
    throw new Error("Invalid verifier");
  return await e.db.patch(i._id, { signature: n });
}
o(Ka, "verifierSignatureImpl");
var $o = /* @__PURE__ */ o(async (e, t) => e.runMutation("auth:store", {
  args: {
    type: "verifierSignature",
    ...t
  }
}), "callVerifierSignature");

// node_modules/@convex-dev/auth/dist/server/implementation/mutations/userOAuth.js
var Il = 1e3 * 60 * 2, $a = y.object({
  provider: y.string(),
  providerAccountId: y.string(),
  profile: y.any(),
  signature: y.string()
});
async function Na(e, t, r, n) {
  _("DEBUG", "userOAuthImpl args:", t);
  let { profile: i, provider: s, providerAccountId: a, signature: c } = t, d = r(s), l = await e.db.query("authAccounts").withIndex("providerAndAccountId", (p) => p.eq("provider", s).eq("providerAccountId", a)).unique(), u = await e.db.query("authVerifiers").withIndex("signature", (p) => p.eq("signature", c)).unique();
  if (u === null)
    throw new Error("Invalid state");
  let { accountId: f } = await Te(e, u.sessionId ?? null, l !== null ? { existingAccount: l } : { providerAccountId: a }, { type: "oauth", provider: d, profile: i }, n), m = Qr(8, "0123456789");
  await e.db.delete(u._id);
  let h = await e.db.query("authVerificationCodes").withIndex("accountId", (p) => p.eq("accountId", f)).unique();
  return h !== null && await e.db.delete(h._id), await e.db.insert("authVerificationCodes", {
    code: await rt(m),
    accountId: f,
    provider: s,
    expirationTime: Date.now() + Il,
    // The use of a verifier means we don't need an identifier
    // during verification.
    verifier: u._id
  }), m;
}
o(Na, "userOAuthImpl");
var No = /* @__PURE__ */ o(async (e, t) => e.runMutation("auth:store", {
  args: {
    type: "userOAuth",
    ...t
  }
}), "callUserOAuth");

// node_modules/@convex-dev/auth/dist/server/implementation/mutations/createVerificationCode.js
var Wa = y.object({
  accountId: y.optional(y.id("authAccounts")),
  provider: y.string(),
  email: y.optional(y.string()),
  phone: y.optional(y.string()),
  code: y.string(),
  expirationTime: y.number(),
  allowExtraProviders: y.boolean()
});
async function Ba(e, t, r, n) {
  _(T.DEBUG, "createVerificationCodeImpl args:", t);
  let { email: i, phone: s, code: a, expirationTime: c, provider: d, accountId: l, allowExtraProviders: u } = t, f = l !== void 0 ? await Oa(e, l) : await e.db.query("authAccounts").withIndex("providerAndAccountId", (p) => p.eq("provider", d).eq("providerAccountId", i ?? s)).unique(), m = r(d, u), { accountId: h } = await Te(e, await se(e), f !== null ? { existingAccount: f } : { providerAccountId: i ?? s }, m.type === "email" ? { type: "email", provider: m, profile: { email: i } } : { type: "phone", provider: m, profile: { phone: s } }, n);
  return await Tl(e, h, d, a, c, { email: i, phone: s }), i ?? s;
}
o(Ba, "createVerificationCodeImpl");
var Wo = /* @__PURE__ */ o(async (e, t) => e.runMutation("auth:store", {
  args: {
    type: "createVerificationCode",
    ...t
  }
}), "callCreateVerificationCode");
async function Tl(e, t, r, n, i, { email: s, phone: a }) {
  let c = await e.db.query("authVerificationCodes").withIndex("accountId", (d) => d.eq("accountId", t)).unique();
  c !== null && await e.db.delete(c._id), await e.db.insert("authVerificationCodes", {
    accountId: t,
    provider: r,
    code: await rt(n),
    expirationTime: i,
    emailVerified: s,
    phoneVerified: a
  });
}
o(Tl, "generateUniqueVerificationCode");

// node_modules/@convex-dev/auth/dist/server/implementation/provider.js
async function un(e, t) {
  if (e.type !== "credentials")
    throw new Error(`Provider ${e.id} is not a credentials provider`);
  let r = e.crypto?.hashSecret;
  if (r === void 0)
    throw new Error(`Provider ${e.id} does not have a \`crypto.hashSecret\` function`);
  return await r(t);
}
o(un, "hash");
async function dn(e, t, r) {
  if (e.type !== "credentials")
    throw new Error(`Provider ${e.id} is not a credentials provider`);
  let n = e.crypto?.verifySecret;
  if (n === void 0)
    throw new Error(`Provider ${e.id} does not have a \`crypto.verifySecret\` function`);
  return await n(t, r);
}
o(dn, "verify");

// node_modules/@convex-dev/auth/dist/server/implementation/mutations/createAccountFromCredentials.js
var za = y.object({
  provider: y.string(),
  account: y.object({ id: y.string(), secret: y.optional(y.string()) }),
  profile: y.any(),
  shouldLinkViaEmail: y.optional(y.boolean()),
  shouldLinkViaPhone: y.optional(y.boolean())
});
async function Ma(e, t, r, n) {
  _(T.DEBUG, "createAccountFromCredentialsImpl args:", {
    provider: t.provider,
    account: {
      id: t.account.id,
      secret: N(t.account.secret ?? "")
    }
  });
  let { provider: i, account: s, profile: a, shouldLinkViaEmail: c, shouldLinkViaPhone: d } = t, l = r(i), u = await e.db.query("authAccounts").withIndex("providerAndAccountId", (p) => p.eq("provider", l.id).eq("providerAccountId", s.id)).unique();
  if (u !== null) {
    if (s.secret !== void 0 && !await dn(l, s.secret, u.secret ?? ""))
      throw new Error(`Account ${s.id} already exists`);
    return {
      account: u,
      // TODO: Ian removed this,
      user: await e.db.get(u.userId)
    };
  }
  let f = s.secret !== void 0 ? await un(l, s.secret) : void 0, { userId: m, accountId: h } = await Te(e, await se(e), { providerAccountId: s.id, secret: f }, {
    type: "credentials",
    provider: l,
    profile: a,
    shouldLinkViaEmail: c,
    shouldLinkViaPhone: d
  }, n);
  return {
    account: await e.db.get(h),
    user: await e.db.get(m)
  };
}
o(Ma, "createAccountFromCredentialsImpl");
var Bo = /* @__PURE__ */ o(async (e, t) => e.runMutation("auth:store", {
  args: {
    type: "createAccountFromCredentials",
    ...t
  }
}), "callCreateAccountFromCredentials");

// node_modules/@convex-dev/auth/dist/server/implementation/mutations/retrieveAccountWithCredentials.js
var ja = y.object({
  provider: y.string(),
  account: y.object({ id: y.string(), secret: y.optional(y.string()) })
});
async function Va(e, t, r, n) {
  let { provider: i, account: s } = t;
  _(T.DEBUG, "retrieveAccountWithCredentialsImpl args:", {
    provider: i,
    account: {
      id: s.id,
      secret: N(s.secret ?? "")
    }
  });
  let a = await e.db.query("authAccounts").withIndex("providerAndAccountId", (c) => c.eq("provider", i).eq("providerAccountId", s.id)).unique();
  if (a === null)
    return "InvalidAccountId";
  if (s.secret !== void 0) {
    if (await sn(e, a._id, n))
      return "TooManyFailedAttempts";
    if (!await dn(r(i), s.secret, a.secret ?? ""))
      return await an(e, a._id, n), "InvalidSecret";
    await cn(e, a._id);
  }
  return {
    account: a,
    // TODO: Ian removed this
    user: await e.db.get(a.userId)
  };
}
o(Va, "retrieveAccountWithCredentialsImpl");

// node_modules/@convex-dev/auth/dist/server/implementation/mutations/modifyAccount.js
var Fa = y.object({
  provider: y.string(),
  account: y.object({ id: y.string(), secret: y.string() })
});
async function Ga(e, t, r) {
  let { provider: n, account: i } = t;
  _(T.DEBUG, "retrieveAccountWithCredentialsImpl args:", {
    provider: n,
    account: {
      id: i.id,
      secret: N(i.secret ?? "")
    }
  });
  let s = await e.db.query("authAccounts").withIndex("providerAndAccountId", (a) => a.eq("provider", n).eq("providerAccountId", i.id)).unique();
  if (s === null)
    throw new Error(`Cannot modify account with ID ${i.id} because it does not exist`);
  await e.db.patch(s._id, {
    secret: await un(r(n), i.secret)
  });
}
o(Ga, "modifyAccountImpl");

// node_modules/@convex-dev/auth/dist/server/implementation/mutations/invalidateSessions.js
var qa = y.object({
  userId: y.id("users"),
  except: y.optional(y.array(y.id("authSessions")))
});
var Xa = /* @__PURE__ */ o(async (e, t) => {
  _(T.DEBUG, "invalidateSessionsImpl args:", t);
  let { userId: r, except: n } = t, i = new Set(n ?? []), s = await e.db.query("authSessions").withIndex("userId", (a) => a.eq("userId", r)).collect();
  for (let a of s)
    i.has(a._id) || await Ht(e, a);
}, "invalidateSessionsImpl");

// node_modules/@convex-dev/auth/dist/server/implementation/mutations/verifier.js
async function Ya(e) {
  return await e.db.insert("authVerifiers", {
    sessionId: await se(e) ?? void 0
  });
}
o(Ya, "verifierImpl");
var Jo = /* @__PURE__ */ o(async (e) => e.runMutation("auth:store", {
  args: {
    type: "verifier"
  }
}), "callVerifier");

// node_modules/@convex-dev/auth/dist/server/implementation/mutations/index.js
var Za = y.object({
  args: y.union(y.object({
    type: y.literal("signIn"),
    ...ka.fields
  }), y.object({
    type: y.literal("signOut")
  }), y.object({
    type: y.literal("refreshSession"),
    ...Ca.fields
  }), y.object({
    type: y.literal("verifyCodeAndSignIn"),
    ...Da.fields
  }), y.object({
    type: y.literal("verifier")
  }), y.object({
    type: y.literal("verifierSignature"),
    ...Ha.fields
  }), y.object({
    type: y.literal("userOAuth"),
    ...$a.fields
  }), y.object({
    type: y.literal("createVerificationCode"),
    ...Wa.fields
  }), y.object({
    type: y.literal("createAccountFromCredentials"),
    ...za.fields
  }), y.object({
    type: y.literal("retrieveAccountWithCredentials"),
    ...ja.fields
  }), y.object({
    type: y.literal("modifyAccount"),
    ...Fa.fields
  }), y.object({
    type: y.literal("invalidateSessions"),
    ...qa.fields
  }))
}), Qa = /* @__PURE__ */ o(async (e, t, r, n) => {
  let i = t.args;
  switch (_(T.INFO, `\`auth:store\` type: ${i.type}`), i.type) {
    case "signIn":
      return Ia(e, i, n);
    case "signOut":
      return Ta(e);
    case "refreshSession":
      return Ra(e, i, r, n);
    case "verifyCodeAndSignIn":
      return La(e, i, r, n);
    case "verifier":
      return Ya(e);
    case "verifierSignature":
      return Ka(e, i);
    case "userOAuth":
      return Na(e, i, r, n);
    case "createVerificationCode":
      return Ba(e, i, r, n);
    case "createAccountFromCredentials":
      return Ma(e, i, r, n);
    case "retrieveAccountWithCredentials":
      return Va(e, i, r, n);
    case "modifyAccount":
      return Ga(e, i, r);
    case "invalidateSessions":
      return Xa(e, i);
    default:
  }
}, "storeImpl");

// node_modules/@convex-dev/auth/dist/server/implementation/redirects.js
async function ln(e, t) {
  if (t.redirectTo !== void 0) {
    if (typeof t.redirectTo != "string")
      throw new Error(`Expected \`redirectTo\` to be a string, got ${t.redirectTo}`);
    return await (e.callbacks?.redirect ?? Cl)(t);
  }
  return ec();
}
o(ln, "redirectAbsoluteUrl");
async function Cl({ redirectTo: e }) {
  let t = ec();
  if (e.startsWith("?") || e.startsWith("/"))
    return `${t}${e}`;
  if (e.startsWith(t)) {
    let r = e[t.length];
    if (r === void 0 || r === "?" || r === "/")
      return e;
  }
  throw new Error(`Invalid \`redirectTo\` ${e} for configured SITE_URL: ${t.toString()}`);
}
o(Cl, "defaultRedirectCallback");
function fn(e, t, r) {
  let n = /([^:]+):(.*)/, [, i, s] = e.match(n), a = /^\/\/(?:\/|$|\?)/.test(s), c = a && s.startsWith("///"), d = new URL(`http:${a ? "//googblibok" + s.slice(2) : s}`);
  d.searchParams.set(t, r);
  let [, , l] = d.toString().match(n);
  return `${i}:${a ? (c ? "/" : "") + "//" + l.slice(13) : l}`;
}
o(fn, "setURLSearchParam");
function ec() {
  return Q("SITE_URL").replace(/\/$/, "");
}
o(ec, "siteUrl");

// node_modules/@convex-dev/auth/dist/server/implementation/signIn.js
var Rl = 60 * 60 * 24;
async function tc(e, t, r, n) {
  if (t === null && r.refreshToken)
    return { kind: "refreshTokens", signedIn: { tokens: await Ko(e, {
      refreshToken: r.refreshToken
    }) } };
  if (t === null && r.params?.code !== void 0)
    return {
      kind: "signedIn",
      signedIn: await Kt(e, {
        params: r.params,
        verifier: r.verifier,
        generateTokens: !0,
        allowExtraProviders: n.allowExtraProviders
      })
    };
  if (t === null)
    throw new Error("Cannot sign in: Missing `provider`, `params.code` or `refreshToken`");
  if (t.type === "email" || t.type === "phone")
    return Pl(e, t, r, n);
  if (t.type === "credentials")
    return Ul(e, t, r, n);
  if (t.type === "oauth" || t.type === "oidc")
    return Ol(e, t, r, n);
  let i = t;
  throw new Error(`Provider type ${t.type} is not supported yet`);
}
o(tc, "signInImpl");
async function Pl(e, t, r, n) {
  if (r.params?.code !== void 0) {
    let u = await Kt(e, {
      params: r.params,
      provider: t.id,
      generateTokens: n.generateTokens,
      allowExtraProviders: n.allowExtraProviders
    });
    if (u === null)
      throw new Error("Could not verify code");
    return {
      kind: "signedIn",
      signedIn: u
    };
  }
  let s = t.generateVerificationToken ? await t.generateVerificationToken() : Qr(32, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"), a = Date.now() + (t.maxAge ?? Rl) * 1e3, c = await Wo(e, {
    provider: t.id,
    accountId: r.accountId,
    email: r.params?.email,
    phone: r.params?.phone,
    code: s,
    expirationTime: a,
    allowExtraProviders: n.allowExtraProviders
  }), d = await ln(e.auth.config, r.params ?? {}), l = {
    identifier: c,
    url: fn(d, "code", s),
    token: s,
    expires: new Date(a)
  };
  return t.type === "email" ? await t.sendVerificationRequest(
    {
      ...l,
      provider: {
        ...t,
        from: (
          // Simplifies demo configuration of Resend
          t.from === "Auth.js <no-reply@authjs.dev>" && t.id === "resend" ? "My App <onboarding@resend.dev>" : t.from
        )
      },
      request: new Request("http://localhost"),
      // TODO: Document
      theme: e.auth.config.theme
    },
    // @ts-expect-error Figure out typing for email providers so they can
    // access ctx.
    e
  ) : t.type === "phone" && await t.sendVerificationRequest({ ...l, provider: t }, e), { kind: "started", started: !0 };
}
o(Pl, "handleEmailAndPhoneProvider");
async function Ul(e, t, r, n) {
  let i = await t.authorize(r.params ?? {}, e);
  return i === null ? { kind: "signedIn", signedIn: null } : {
    kind: "signedIn",
    signedIn: await Lo(e, {
      userId: i.userId,
      sessionId: i.sessionId,
      generateTokens: n.generateTokens
    })
  };
}
o(Ul, "handleCredentials");
async function Ol(e, t, r, n) {
  if (r.params?.code !== void 0)
    return {
      kind: "signedIn",
      signedIn: await Kt(e, {
        params: r.params,
        verifier: r.verifier,
        generateTokens: !0,
        allowExtraProviders: n.allowExtraProviders
      })
    };
  let i = new URL((process.env.CUSTOM_AUTH_SITE_URL ?? Q("CONVEX_SITE_URL")) + `/api/auth/signin/${t.id}`), s = await Jo(e);
  if (i.searchParams.set("code", s), r.params?.redirectTo !== void 0) {
    if (typeof r.params.redirectTo != "string")
      throw new Error(`Expected \`redirectTo\` to be a string, got ${r.params.redirectTo}`);
    i.searchParams.set("redirectTo", r.params.redirectTo);
  }
  return { kind: "redirect", redirect: i.toString(), verifier: s };
}
o(Ol, "handleOAuthProvider");

// node_modules/@convex-dev/auth/dist/server/oauth/checks.js
var rc = 60 * 15;
async function zo(e, t, r) {
  let { cookies: n } = r, i = n[e], s = /* @__PURE__ */ new Date();
  s.setTime(s.getTime() + rc * 1e3), _("DEBUG", `CREATE_${e.toUpperCase()}`, {
    name: i.name,
    payload: t,
    COOKIE_TTL: rc,
    expires: s
  });
  let a = { ...i.options, expires: s };
  return { name: i.name, value: t, options: a };
}
o(zo, "createCookie");
function Dl(e, t, r) {
  let { cookies: n } = t, i = n[e];
  _("DEBUG", `CLEAR_${e.toUpperCase()}`, { cookie: i }), r.push({
    name: i.name,
    value: "",
    options: { ...n[e].options, maxAge: 0 }
  });
}
o(Dl, "clearCookie");
function Mo(e, t) {
  return async function(r, n, i) {
    let { provider: s } = i;
    if (!s?.checks?.includes(e))
      return;
    let a = r?.[i.cookies[t].name];
    return _("DEBUG", `USE_${t.toUpperCase()}`, { value: a }), Dl(t, i, n), a;
  };
}
o(Mo, "useCookie");
var pn = {
  /** Creates a PKCE code challenge and verifier pair. The verifier is stored in the cookie. */
  async create(e) {
    let t = Kr(), r = await Wr(t);
    return { cookie: await zo("pkceCodeVerifier", t, e), codeChallenge: r, codeVerifier: t };
  },
  /**
   * Returns code_verifier if the provider is configured to use PKCE,
   * and clears the container cookie afterwards.
   * An error is thrown if the code_verifier is missing or invalid.
   */
  use: Mo("pkce", "pkceCodeVerifier")
}, hn = {
  /** Creates a state cookie with an optionally encoded body. */
  async create(e, t) {
    let { provider: r } = e;
    if (!r.checks.includes("state")) {
      if (t)
        throw new Error("State data was provided but the provider is not configured to use state");
      return;
    }
    let n = $r();
    return { cookie: await zo("state", n, e), value: n };
  },
  /**
   * Returns state if the provider is configured to use state,
   * and clears the container cookie afterwards.
   * An error is thrown if the state is missing or invalid.
   */
  use: Mo("state", "state")
}, mn = {
  async create(e) {
    if (!e.provider.checks.includes("nonce"))
      return;
    let t = Nr();
    return { cookie: await zo("nonce", t, e), value: t };
  },
  /**
   * Returns nonce if the provider is configured to use nonce,
   * and clears the container cookie afterwards.
   * An error is thrown if the nonce is missing or invalid.
   * @see https://openid.net/specs/openid-connect-core-1_0.html#NonceNotes
   * @see https://danielfett.de/2020/05/16/pkce-vs-nonce-equivalent-or-not/#nonce
   */
  use: Mo("nonce", "nonce")
};

// node_modules/@convex-dev/auth/dist/server/oauth/lib/utils/customFetch.js
function nt(e) {
  return { [Ae]: e[Ct] ?? fetch };
}
o(nt, "fetchOpt");

// node_modules/@convex-dev/auth/dist/server/oauth/convexAuth.js
function yn(e) {
  return (process.env.CUSTOM_AUTH_SITE_URL ?? Q("CONVEX_SITE_URL")) + "/api/auth/callback/" + e;
}
o(yn, "callbackUrl");
function wn({ codeVerifier: e, state: t, nonce: r }) {
  return [e, t, r].filter((n) => n !== void 0).join(" ");
}
o(wn, "getAuthorizationSignature");
function jo(e, t) {
  return (Bt(process.env.CONVEX_SITE_URL) ? "" : "__Host-") + t + "OAuth" + e;
}
o(jo, "oauthStateCookieName");
var Vo = /* @__PURE__ */ o((e) => ({
  pkceCodeVerifier: {
    name: jo("pkce", e),
    options: {
      ...ce
    }
  },
  state: {
    name: jo("state", e),
    options: {
      ...ce
    }
  },
  nonce: {
    name: jo("nonce", e),
    options: {
      ...ce
    }
  },
  // ConvexAuth: We don't support webauthn, so this value doesn't actually matter
  webauthnChallenge: {
    name: "ConvexAuth_shouldNotBeUsed_webauthnChallenge",
    options: {
      ...ce
    }
  },
  // ConvexAuth: We don't use these cookies, so their values should never be used
  sessionToken: {
    name: "ConvexAuth_shouldNotBeUsed_sessionToken",
    options: {
      ...ce
    }
  },
  callbackUrl: {
    name: "ConvexAuth_shouldNotBeUsed_callbackUrl",
    options: {
      ...ce
    }
  },
  csrfToken: {
    name: "ConvexAuth_shouldNotBeUsed_csrfToken",
    options: {
      ...ce
    }
  }
}), "defaultCookiesOptions");
async function Fo(e) {
  if (!e.authorization || !e.token || !e.userinfo) {
    if (!e.issuer)
      throw new Error(`Provider \`${e.id}\` is missing an \`issuer\` URL configuration. Consult the provider docs.`);
    let i = new URL(e.issuer), s = await cs(i, {
      ...nt(e),
      [we]: !0
    }), a = await us(i, s);
    if (!a.token_endpoint)
      throw new TypeError("TODO: Authorization server did not provide a token endpoint.");
    let c = a;
    return {
      ...e,
      checks: e.checks,
      profile: e.profile,
      account: e.account,
      clientId: e.clientId,
      idToken: e.type === "oidc" ? e.idToken : void 0,
      // ConvexAuth: Apparently it's important for us to normalize the endpoint after
      // service discovery (https://github.com/get-convex/convex-auth/commit/35bf716bfb0d29dbce1cbca318973b0732f75015)
      authorization: $e({
        ...e.authorization,
        url: c.authorization_endpoint
      }),
      token: $e({
        ...e.token,
        url: c.token_endpoint
      }),
      userinfo: c.userinfo_endpoint ? $e({
        ...e.userinfo,
        url: c.userinfo_endpoint
      }) : e.userinfo,
      as: c,
      configSource: "discovered"
    };
  }
  let t = $e(e.authorization), r = $e(e.token), n = e.userinfo ? $e(e.userinfo) : void 0;
  return {
    ...e,
    checks: e.checks,
    profile: e.profile,
    account: e.account,
    clientId: e.clientId,
    idToken: e.type === "oidc" ? e.idToken : void 0,
    authorization: t,
    token: r,
    userinfo: n,
    as: {
      issuer: e.issuer ?? "theremustbeastringhere.dev",
      authorization_endpoint: t?.url.toString(),
      token_endpoint: r?.url.toString(),
      userinfo_endpoint: n?.url.toString()
    },
    configSource: "provided"
  };
}
o(Fo, "oAuthConfigToInternalProvider");

// node_modules/@convex-dev/auth/dist/server/oauth/authorizationUrl.js
async function oc(e) {
  let { provider: t } = e, r = t.authorization?.url, { as: n, authorization: i, configSource: s } = t;
  if (!i)
    throw new TypeError("Could not determine the authorization endpoint.");
  r || (r = new URL(i.url));
  let a = r.searchParams, c = yn(t.id), d = Object.assign({
    response_type: "code",
    // clientId can technically be undefined, should we check this in assert.ts or rely on the Authorization Server to do it?
    client_id: t.clientId,
    redirect_uri: c,
    // @ts-expect-error TODO:
    ...t.authorization?.params
  }, Object.fromEntries(r.searchParams.entries() ?? []));
  for (let p in d)
    a.set(p, d[p]);
  let l = [], u = await hn.create(e);
  u && (a.set("state", u.value), l.push(u.cookie));
  let f;
  if (t.checks?.includes("pkce"))
    if (s === "discovered" && !n.code_challenge_methods_supported?.includes("S256"))
      t.type === "oidc" && (t.checks = ["nonce"]);
    else {
      let p = await pn.create(e);
      a.set("code_challenge", p.codeChallenge), a.set("code_challenge_method", "S256"), l.push(p.cookie), f = p.codeVerifier;
    }
  let m = await mn.create(e);
  m && (a.set("nonce", m.value), l.push(m.cookie)), t.type === "oidc" && !r.searchParams.has("scope") && r.searchParams.set("scope", "openid profile email"), _("DEBUG", "authorization url is ready", {
    url: r,
    cookies: l,
    provider: t
  });
  let h = wn({
    codeVerifier: f,
    state: a.get("state") ?? void 0,
    nonce: a.get("nonce") ?? void 0
  });
  return { redirect: r.toString(), cookies: l, signature: h };
}
o(oc, "getAuthorizationUrl");

// node_modules/@convex-dev/auth/dist/server/oauth/lib/utils/providers.js
function ic(e) {
  return e.type === "oidc";
}
o(ic, "isOIDCProvider");

// node_modules/@convex-dev/auth/dist/server/oauth/callback.js
function sc(e) {
  return encodeURIComponent(e).replace(/%20/g, "+");
}
o(sc, "formUrlEncode");
function Ll(e, t) {
  let r = sc(e), n = sc(t);
  return `Basic ${btoa(`${r}:${n}`)}`;
}
o(Ll, "clientSecretBasic");
async function ac(e, t, r) {
  let { provider: n } = r, { userinfo: i, as: s } = n, a = {
    client_id: n.clientId,
    ...n.client
  }, c;
  switch (a.token_endpoint_auth_method) {
    // TODO: in the next breaking major version have undefined be `client_secret_post`
    case void 0:
    case "client_secret_basic":
      c = /* @__PURE__ */ o((k, D, j, H) => {
        H.set("authorization", Ll(n.clientId, n.clientSecret));
      }, "clientAuth");
      break;
    case "client_secret_post":
      c = ls(n.clientSecret);
      break;
    case "client_secret_jwt":
      c = hs(n.clientSecret);
      break;
    case "private_key_jwt":
      c = ps(n.token.clientPrivateKey, {
        // TODO: review in the next breaking change
        [Dr](k, D) {
          D.aud = [s.issuer, s.token_endpoint];
        }
      });
      break;
    default:
      throw new Error("unsupported client authentication method");
  }
  let d = [], l = await hn.use(t, d, r), u;
  try {
    u = Rs(s, a, new URLSearchParams(e), n.checks.includes("state") ? l : yo);
  } catch (k) {
    if (k instanceof At) {
      let D = {
        providerId: n.id,
        ...Object.fromEntries(k.cause.entries())
      };
      throw _("DEBUG", "OAuthCallbackError", D), new Error("OAuth Provider returned an error", { cause: D });
    }
    throw k;
  }
  let f = await pn.use(t, d, r), m = yn(n.id), h = await Es(s, a, c, u, m, f ?? "decoy", {
    // TODO: move away from allowing insecure HTTP requests
    [we]: !0,
    [Ae]: (...k) => (n.checks.includes("pkce") || k[1].body.delete("code_verifier"), nt(n)[Ae](...k))
  });
  n.token?.conform && (h = await n.token.conform(h.clone()) ?? h);
  let p = {}, b = await mn.use(t, d, r), w = ic(n), I = await ks(s, a, h, {
    expectedNonce: b,
    requireIdToken: w
  }), E = I;
  if (w) {
    let k = zr(I);
    if (k === void 0)
      throw new Error("ID Token claims are missing");
    let D = k;
    if (p = D, n.id === "apple")
      try {
        p.user = JSON.parse(e?.user);
      } catch {
      }
    if (n.idToken === !1) {
      let j = await po(s, a, I.access_token, {
        ...nt(n),
        // TODO: move away from allowing insecure HTTP requests
        [we]: !0
      });
      p = await gs(s, a, D.sub, j);
    }
  } else if (i?.request) {
    let k = await i.request({ tokens: E, provider: n });
    k instanceof Object && (p = k);
  } else if (i?.url)
    p = await (await po(s, a, I.access_token, nt(n))).json();
  else
    throw new TypeError("No userinfo endpoint configured");
  return E.expires_in && (E.expires_at = Math.floor(Date.now() / 1e3) + Number(E.expires_in)), {
    profile: p,
    tokens: E,
    cookies: d,
    signature: wn({ codeVerifier: f, state: l, nonce: b })
  };
}
o(ac, "handleOAuth");

// node_modules/@convex-dev/auth/dist/server/implementation/index.js
function Hl(e) {
  let t = ua(e), r = t.providers.some((c) => c.type === "oauth" || c.type === "oidc"), n = /* @__PURE__ */ o((c, d = !1) => t.providers.find((l) => l.id === c) ?? (d ? t.extraProviders.find((l) => l.id === c) : void 0), "getProvider"), i = /* @__PURE__ */ o((c, d = !1) => {
    let l = n(c, d);
    if (l === void 0) {
      let u = `Provider \`${c}\` is not configured, available providers are ${fa(t, d)}.`;
      throw _(T.ERROR, u), new Error(u);
    }
    return l;
  }, "getProviderOrThrow"), s = /* @__PURE__ */ o((c) => ({ ...c, auth: { ...c.auth, config: t } }), "enrichCtx");
  return {
    /**
     * Helper for configuring HTTP actions.
     */
    auth: {
      /**
       * @deprecated - Use `getAuthUserId` from "@convex-dev/auth/server":
       *
       * ```ts
       * import { getAuthUserId } from "@convex-dev/auth/server";
       * ```
       *
       * @hidden
       */
      getUserId: /* @__PURE__ */ o(async (c) => {
        let d = await c.auth.getUserIdentity();
        if (d === null)
          return null;
        let [l] = d.subject.split(Ie);
        return l;
      }, "getUserId"),
      /**
       * @deprecated - Use `getAuthSessionId` from "@convex-dev/auth/server":
       *
       * ```
       * import { getAuthSessionId } from "@convex-dev/auth/server";
       * ```
       *
       * @hidden
       */
      getSessionId: /* @__PURE__ */ o(async (c) => {
        let d = await c.auth.getUserIdentity();
        if (d === null)
          return null;
        let [, l] = d.subject.split(Ie);
        return l;
      }, "getSessionId"),
      /**
       * Add HTTP actions for JWT verification and OAuth sign-in.
       *
       * ```ts
       * import { httpRouter } from "convex/server";
       * import { auth } from "./auth.js";
       *
       * const http = httpRouter();
       *
       * auth.addHttpRoutes(http);
       *
       * export default http;
       * ```
       *
       * The following routes are handled always:
       *
       * - `/.well-known/openid-configuration`
       * - `/.well-known/jwks.json`
       *
       * The following routes are handled if OAuth is configured:
       *
       * - `/api/auth/signin/*`
       * - `/api/auth/callback/*`
       *
       * @param http your HTTP router
       */
      addHttpRoutes: /* @__PURE__ */ o((c) => {
        if (c.route({
          path: "/.well-known/openid-configuration",
          method: "GET",
          handler: it(async () => new Response(JSON.stringify({
            issuer: Q("CONVEX_SITE_URL"),
            jwks_uri: Q("CONVEX_SITE_URL") + "/.well-known/jwks.json",
            authorization_endpoint: Q("CONVEX_SITE_URL") + "/oauth/authorize"
          }), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "public, max-age=15, stale-while-revalidate=15, stale-if-error=86400"
            }
          }))
        }), c.route({
          path: "/.well-known/jwks.json",
          method: "GET",
          handler: it(async () => new Response(Q("JWKS"), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "public, max-age=15, stale-while-revalidate=15, stale-if-error=86400"
            }
          }))
        }), r) {
          c.route({
            pathPrefix: "/api/auth/signin/",
            method: "GET",
            handler: it(Nl(400, async (l, u) => {
              let f = new URL(u.url), h = f.pathname.split("/").at(-1);
              if (h === null)
                throw new Error("Missing provider id");
              let p = f.searchParams.get("code");
              if (p === null)
                throw new Error("Missing sign-in verifier");
              let b = i(h), { redirect: w, cookies: I, signature: E } = await oc({
                provider: await Fo(b),
                cookies: Vo(h)
              });
              await $o(l, {
                verifier: p,
                signature: E
              });
              let k = f.searchParams.get("redirectTo");
              k !== null && I.push(ii(h, k));
              let D = new Headers({ Location: w });
              for (let { name: j, value: H, options: S } of I)
                D.append("Set-Cookie", (0, gn.serialize)(j, H, S));
              return new Response(null, { status: 302, headers: D });
            }))
          });
          let d = it(async (l, u) => {
            let f = l, m = new URL(u.url), p = m.pathname.split("/").at(-1);
            _(T.DEBUG, "Handling OAuth callback for provider:", p);
            let b = i(p), w = Wl(u), I = si(b.id, w), E = await ln(t, {
              redirectTo: I?.redirectTo
            }), k = m.searchParams;
            if (u.headers.get("Content-Type") === "application/x-www-form-urlencoded") {
              let D = await u.formData();
              for (let [j, H] of D.entries())
                typeof H == "string" && k.append(j, H);
            }
            try {
              let { profile: D, tokens: j, signature: H } = await ac(Object.fromEntries(k.entries()), w, {
                provider: await Fo(b),
                cookies: Vo(b.id)
              }), { id: S, ...B } = await b.profile(D, j);
              if (typeof S != "string")
                throw new Error(`The profile method of the ${p} config must return a string ID`);
              let F = await No(f, {
                provider: p,
                providerAccountId: S,
                profile: B,
                signature: H
              });
              return new Response(null, {
                status: 302,
                headers: {
                  Location: fn(E, "code", F),
                  "Cache-Control": "must-revalidate"
                }
              });
            } catch (D) {
              return Do(D), Response.redirect(E);
            }
          });
          c.route({
            pathPrefix: "/api/auth/callback/",
            method: "GET",
            handler: d
          }), c.route({
            pathPrefix: "/api/auth/callback/",
            method: "POST",
            handler: d
          });
        }
      }, "addHttpRoutes")
    },
    /**
     * Action called by the client to sign the user in.
     *
     * Also used for refreshing the session.
     */
    signIn: In({
      args: {
        provider: y.optional(y.string()),
        params: y.optional(y.any()),
        verifier: y.optional(y.string()),
        refreshToken: y.optional(y.string()),
        calledBy: y.optional(y.string())
      },
      handler: /* @__PURE__ */ o(async (c, d) => {
        d.calledBy !== void 0 && _("INFO", `\`auth:signIn\` called by ${d.calledBy}`);
        let l = d.provider !== void 0 ? i(d.provider) : null, u = await tc(s(c), l, d, {
          generateTokens: !0,
          allowExtraProviders: !1
        });
        switch (u.kind) {
          case "redirect":
            return { redirect: u.redirect, verifier: u.verifier };
          case "signedIn":
          case "refreshTokens":
            return { tokens: u.signedIn?.tokens ?? null };
          case "started":
            return { started: !0 };
          default: {
            let f = u;
            throw new Error(`Unexpected result from signIn, ${u}`);
          }
        }
      }, "handler")
    }),
    /**
     * Action called by the client to invalidate the current session.
     */
    signOut: In({
      args: {},
      handler: /* @__PURE__ */ o(async (c) => {
        await Ho(c);
      }, "handler")
    }),
    /**
     * Internal mutation used by the library to read and write
     * to the database during signin and signout.
     */
    store: Zo({
      args: Za,
      handler: /* @__PURE__ */ o(async (c, d) => Qa(c, d, i, t), "handler")
    }),
    /**
     * Utility function for frameworks to use to get the current auth state
     * based on credentials that they've supplied separately.
     */
    isAuthenticated: Qo({
      args: {},
      handler: /* @__PURE__ */ o(async (c, d) => await c.auth.getUserIdentity() !== null, "handler")
    })
  };
}
o(Hl, "convexAuth");
async function Kl(e) {
  let t = await e.auth.getUserIdentity();
  if (t === null)
    return null;
  let [r] = t.subject.split(Ie);
  return r;
}
o(Kl, "getAuthUserId");
async function $l(e, t) {
  return await Bo(e, t);
}
o($l, "createAccount");
function Nl(e, t) {
  return async (r, n) => {
    try {
      return await t(r, n);
    } catch (i) {
      return i instanceof Yo ? new Response(null, {
        status: e,
        statusText: i.data
      }) : (Do(i), new Response(null, {
        status: 500,
        statusText: "Internal Server Error"
      }));
    }
  };
}
o(Nl, "convertErrorsToResponse");
function Wl(e) {
  return (0, gn.parse)(e.headers.get("Cookie") ?? "");
}
o(Wl, "getCookies");

export {
  Hl as a,
  Kl as b,
  $l as c
};
/*! Bundled license information:

cookie/index.js:
  (*!
   * cookie
   * Copyright(c) 2012-2014 Roman Shtylman
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)
*/
//# sourceMappingURL=Q3YUI55I.js.map
