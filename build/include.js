
// minifier: path aliases

enyo.path.addPaths({kernel: "../enyo/source/kernel/", ajax: "../enyo/source/ajax/", dom: "../enyo/source/dom/", touch: "../enyo/source/touch/", ui: "../enyo/source/ui/", layout: "./layout/", mvc: "./mvc/"});

// log.js

enyo.logging = {
level: 99,
levels: {
log: 20,
warn: 10,
error: 0
},
shouldLog: function(e) {
var t = parseInt(this.levels[e], 0);
return t <= this.level;
},
_log: function(e, t) {
if (typeof console == "undefined") return;
var n = enyo.isArray(t) ? t : enyo.cloneArray(t);
enyo.dumbConsole && (n = [ n.join(" ") ]);
var r = console[e];
r && r.apply ? r.apply(console, n) : console.log.apply ? console.log.apply(console, n) : console.log(n.join(" "));
},
log: function(e, t) {
typeof console != "undefined" && this.shouldLog(e) && this._log(e, t);
}
}, enyo.setLogLevel = function(e) {
var t = parseInt(e, 0);
isFinite(t) && (enyo.logging.level = t);
}, enyo.log = function() {
enyo.logging.log("log", arguments);
}, enyo.warn = function() {
enyo.logging.log("warn", arguments);
}, enyo.error = function() {
enyo.logging.log("error", arguments);
};

// lang.js

(function() {
enyo.global = this;
var e = 0;
enyo.ready(function() {
var e = window.performance = window.performance || {};
e.now = e.now || e.mozNow || e.msNow || e.oNow || e.webkitNow || enyo.now, enyo.bench = function() {
return e.now();
};
});
var t = enyo.exists = function(e) {
return undefined !== e;
}, n = enyo.lastIndexOf = function(e, t, n) {
if (t.lastIndexOf) return t.lastIndexOf(e, n || t.length);
var r = "string" == typeof t, i = (r ? t.split("") : t).reverse(), s = i.length - 1, o = t.length, u;
return r && (i = i.join("")), u = enyo.indexOf(e, i, o - (n || o)), r || i.reverse(), -1 === u ? u : s - u;
}, r = function(e) {
var t = 0;
while ("." === e[t]) ++t;
return 0 !== t && (e = e.slice(t)), e;
}, i = function(e) {
return e && "function" == typeof e && !0 === e.isProperty;
}, s = function(e) {
return e && "function" == typeof e && !0 === e.overloaded;
};
enyo.getPath = function(e) {
if (!t(e) || null === e) return undefined;
var n = 0, i, o, u, a, f = "object" == typeof e && e.recursing ? !0 : !1, l = this === enyo && !0 !== f ? window : this;
if ("object" == typeof e) {
if (!e.path || "string" != typeof e.path) return undefined;
e = e.path;
}
e = r(e), n = e.indexOf(".");
if (-1 === n) u = "get" + enyo.cap(e), i = s(l[u]) ? l[u].call(this) : l[e]; else {
o = e.substring(0, n), e = e.slice(n + 1);
if ("object" != typeof l[o]) return undefined;
i = enyo.getPath.call(l[o], {
path: e,
recursing: !0
});
}
return "function" == typeof i && !0 === i.isProperty ? (a = enyo.toArray(arguments).slice(1), i.apply(this, a)) : i;
};
var o = enyo.proxyMethod = function(e, t) {
return function() {
return e.apply(t, arguments);
};
};
enyo.setPath = function(e, n, s) {
if (!t(e) || "string" != typeof e) return this;
var o = enyo === this ? enyo.global : this, u, a, f, l, c = !0 === s ? !0 : !1, h = "function" == typeof s ? s : undefined, p = enyo.getPath.call(o, e);
e = r(e), u = e.indexOf(".");
if (-1 === u) a = o[e], !0 === i(a) ? (f = enyo.toArray(arguments).slice(1), a.apply(o, f)) : o[e] = n; else {
l = e.split(".");
while (l.length) {
a = l.shift();
if ("enyo" === a && enyo === o) continue;
0 === l.length ? !0 === i(a) ? (f = enyo.toArray(arguments).slice(1), a.apply(o, f)) : o[a] = n : ("object" != typeof o[a] && (o[a] = {}), o = o[a]);
}
}
return !0 !== c && (h ? c = h(p, n) : c = p !== n), !0 === c && o.notifyObservers && (o.notifyObservers(e, p, n), o.notifyObservers("set:" + e, p, n)), o;
}, enyo.findAndInstance = function(e, n) {
var r, i, s;
return n = t(n) && "function" == typeof n ? n : enyo.nop, s = enyo.getPath.call(this, e), s ? ("string" == typeof s ? (r = enyo.getPath(s), t(r) && "function" != typeof r && (i = r, r = undefined)) : "function" == typeof s ? r = s : i = s, t(r) && !t(i) && (i = new r), t(i) && (this[e] = i), n(r, i)) : n();
};
var u = enyo.uid = function(t) {
return String((t ? t : "") + e++);
};
enyo.irand = function(e) {
return Math.floor(Math.random() * e);
}, enyo.cap = function(e) {
return e.slice(0, 1).toUpperCase() + e.slice(1);
}, enyo.uncap = function(e) {
return e.slice(0, 1).toLowerCase() + e.slice(1);
}, enyo.format = function(e) {
var t = /\%./g, n = 0, r = e, i = arguments, s = function(e) {
return i[++n];
};
return r.replace(t, s);
};
var a = Object.prototype.toString;
enyo.isString = function(e) {
return a.call(e) === "[object String]";
}, enyo.isFunction = function(e) {
return a.call(e) === "[object Function]";
}, enyo.isArray = Array.isArray || function(e) {
return a.call(e) === "[object Array]";
}, enyo.isTrue = function(e) {
return e !== "false" && e !== !1 && e !== 0 && e !== null && e !== undefined;
}, enyo.indexOf = function(e, t, n) {
if (t.indexOf) return t.indexOf(e, n);
if (n) {
n < 0 && (n = 0);
if (n > t.length) return -1;
}
for (var r = n || 0, i = t.length, s; (s = t[r]) || r < i; r++) if (s == e) return r;
return -1;
}, enyo.remove = function(e, t) {
var n = enyo.indexOf(e, t);
n >= 0 && t.splice(n, 1);
}, enyo.forEach = function(e, t, n) {
if (e) {
var r = n || this;
if (enyo.isArray(e) && e.forEach) e.forEach(t, r); else {
var i = Object(e), s = i.length >>> 0;
for (var o = 0; o < s; o++) o in i && t.call(r, i[o], o, i);
}
}
}, enyo.map = function(e, t, n) {
var r = n || this;
if (enyo.isArray(e) && e.map) return e.map(t, r);
var i = [], s = function(e, n, s) {
i.push(t.call(r, e, n, s));
};
return enyo.forEach(e, s, r), i;
};
var f = enyo.merge = function() {
var e = Array.prototype.concat.apply([], arguments);
return c(e);
}, l = enyo.union = function() {
var e = Array.prototype.concat.apply([], arguments), t = [], r = [], i = 0, s = e.length, o;
for (; i < s; ++i) o = e[i], ~t.indexOf(o) || (t.push(o), i === n(o, e) && r.push(o));
return r;
}, c = enyo.unique = l, h = enyo.reduce = f, p = enyo.only = function(e, n) {
var r = {}, i = 0, s, o;
if (!!t(e) && e instanceof Array) {
if (!t(n) || "object" != typeof n) return r;
e = c(e);
for (s = e.length; i < s; ++i) o = e[i], o in n && (r[o] = n[o]);
return r;
}
return r;
}, d = enyo.remap = function(e, t) {
var n = {}, r, i;
for (r in e) i = e[r], r in t && (n[i] = t[r]);
return n;
}, v = enyo.except = function(e, n) {
var r = {}, i, s = 0, o, u;
if (!!t(e) && e instanceof Array) {
if (!t(n) || "object" != typeof n) return r;
i = l(e, y(n));
for (o = i.length; s < o; ++s) {
u = i[s];
if (!(u in n)) continue;
r[u] = n[u];
}
return r;
}
return r;
}, m = enyo.indexBy = function(e, n, r) {
var i = {}, s, o, u = 0;
if (!!t(n) && n instanceof Array) {
if (!t(e) || "string" != typeof e) return i;
var a = enyo.clone(n);
r = t(r) && "function" == typeof r ? r : undefined;
for (o = n.length; u < o; ++u) s = n[u], t(s) && t(s[e]) && (r ? r(e, s, i, a) : i[s[e]] = s);
return i;
}
return i;
}, g = enyo.pluck = function(e, n) {
var r = [], i = 0, s;
if (!t(e) || !t(n)) return r;
if (n instanceof Array) {
if ("string" != typeof e) return r;
for (s = n.length; i < s; ++i) {
if (!t(n[i])) continue;
t(n[i][e]) && r.push(n[i][e]);
}
return r;
}
return r;
};
enyo.filter = function(e, t, n) {
var r = n || this;
if (enyo.isArray(e) && e.filter) return e.filter(t, r);
var i = [], s = function(e, n, s) {
var o = e;
t.call(r, e, n, s) && i.push(o);
};
return enyo.forEach(e, s, r), i;
};
var y = enyo.keys = Object.keys || function(e) {
var t = [], n = Object.prototype.hasOwnProperty;
for (var r in e) n.call(e, r) && t.push(r);
if (!{
toString: null
}.propertyIsEnumerable("toString")) {
var i = [ "toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "constructor" ];
for (var s = 0, o; o = i[s]; s++) n.call(e, o) && t.push(o);
}
return t;
};
enyo.cloneArray = function(e, t, n) {
var r = n || [];
for (var i = t || 0, s = e.length; i < s; i++) r.push(e[i]);
return r;
}, enyo.toArray = enyo.cloneArray, enyo.clone = function(e) {
return enyo.isArray(e) ? enyo.cloneArray(e) : enyo.mixin({}, e);
};
var b = {};
enyo.mixin = function(e, t) {
e = e || {};
if (t) {
var n, r, i;
for (n in t) r = t[n], b[n] !== r && (e[n] = r);
}
return e;
}, enyo.bind = function(e, t) {
t || (t = e, e = null), e = e || enyo.global;
if (enyo.isString(t)) {
if (!e[t]) throw [ 'enyo.bind: scope["', t, '"] is null (scope="', e, '")' ].join("");
t = e[t];
}
if (enyo.isFunction(t)) {
var n = enyo.cloneArray(arguments, 2);
return t.bind ? t.bind.apply(t, [ e ].concat(n)) : function() {
var r = enyo.cloneArray(arguments);
return t.apply(e, n.concat(r));
};
}
throw [ 'enyo.bind: scope["', t, '"] is not a function (scope="', e, '")' ].join("");
}, enyo.asyncMethod = function(e, t) {
return setTimeout(enyo.bind.apply(enyo, arguments), 1);
}, enyo.call = function(e, t, n) {
var r = e || this;
if (t) {
var i = r[t] || t;
if (i && i.apply) return i.apply(r, n || []);
}
}, enyo.now = Date.now || function() {
return (new Date).getTime();
}, enyo.nop = function() {}, enyo.nob = {}, enyo.nar = [], enyo.instance = function() {}, enyo.setPrototype || (enyo.setPrototype = function(e, t) {
e.prototype = t;
}), enyo.delegate = function(e) {
return enyo.setPrototype(enyo.instance, e), new enyo.instance;
}, $L = function(e) {
return e;
};
})();

// job.js

enyo.job = function(e, t, n) {
enyo.job.stop(e), enyo.job._jobs[e] = setTimeout(function() {
enyo.job.stop(e), t();
}, n);
}, enyo.job.stop = function(e) {
enyo.job._jobs[e] && (clearTimeout(enyo.job._jobs[e]), delete enyo.job._jobs[e]);
}, enyo.job._jobs = {};

// macroize.js

enyo.macroize = function(e, t, n) {
var r, i, s = e, o = n || enyo.macroize.pattern, u = function(e, n) {
return r = enyo.getPath.call(t, n), r === undefined || r === null ? "{$" + n + "}" : (i = !0, r);
}, a = 0;
do {
i = !1, s = s.replace(o, u);
if (++a >= 20) throw "enyo.macroize: recursion too deep";
} while (i);
return s;
}, enyo.quickMacroize = function(e, t, n) {
var r, i, s = e, o = n || enyo.macroize.pattern, u = function(e, n) {
return n in t ? r = t[n] : r = enyo.getPath.call(t, n), r === undefined || r === null ? "{$" + n + "}" : r;
};
return s = s.replace(o, u), s;
}, enyo.macroize.pattern = /\{\$([^{}]*)\}/g;

// Oop.js

enyo.Observer = function(e) {
var t = enyo.toArray(arguments).slice(1);
if (!enyo.exists(e) || "function" != typeof e) throw "enyo.Observer: invalid observer, must have a function";
return e.isObserver = !0, e.events = (e.events ? e.events : []).concat(t), e;
}, enyo.Computed = function(e) {
var t = enyo.toArray(arguments).slice(1);
if (!enyo.exists(e) || "function" != typeof e) throw "enyo.Computed: invalid computed property, must have a function";
return e.isProperty = !0, e.properties = (e.properties ? e.properties : []).concat(t), e;
}, enyo.concat = [ "concat", "bindings", "mixins" ], enyo.handleConcatenatedProperties = function(e, t) {
var n = enyo.merge(e.concat || [], t.concat || []), r, i, s;
while (n.length) r = n.shift(), s = e[r], i = t[r], s instanceof Array && i instanceof Array && (e[r] = enyo.merge(s, i), delete t[r]);
}, enyo.kind = function(e) {
enyo._kindCtors = {};
var t = e.name || "";
delete e.name;
var n = "kind" in e, r = e.kind;
delete e.kind;
var i = enyo.constructorForKind(r), s = i && i.prototype || null;
if (n && r === undefined || i === undefined) {
var o = r === undefined ? "undefined kind" : "unknown kind (" + r + ")";
throw "enyo.kind: Attempt to subclass an " + o + ". Check dependencies for [" + (t || "<unnamed>") + "].";
}
var u = enyo.kind.makeCtor();
return e.hasOwnProperty("constructor") && (e._constructor = e.constructor, delete e.constructor), enyo.setPrototype(u, s ? enyo.delegate(s) : {}), enyo.handleConcatenatedProperties(u.prototype, e), enyo.mixin(u.prototype, e), u.prototype.kindName = t, u.prototype.base = i, u.prototype.ctor = u, enyo.forEach(enyo.kind.features, function(t) {
t(u, e);
}), enyo.setPath(t, u), u;
}, enyo.singleton = function(e, t) {
var n = e.name;
delete e.name;
var r = enyo.kind(e), i;
return enyo.setPath.call(t || enyo.global, n, i = new r), i;
}, enyo.kind.makeCtor = function() {
return function() {
if (!(this instanceof arguments.callee)) throw "enyo.kind: constructor called directly, not using 'new'";
var e;
this._constructor && (e = this._constructor.apply(this, arguments)), this.constructed && this.constructed.apply(this, arguments);
if (e) return e;
};
}, enyo.kind.defaultNamespace = "enyo", enyo.kind.features = [], enyo.kind.features.push(function(e, t) {
var n = e.prototype;
n.inherited || (n.inherited = enyo.kind.inherited);
if (n.base) for (var r in t) {
var i = t[r];
enyo.isFunction(i) && (i._inherited = n.base.prototype[r] || enyo.nop, i.nom = n.kindName + "." + r + "()");
}
}), enyo.kind.inherited = function(e, t) {
var n = e.callee, r = n._inherited;
if (!r || "function" != typeof r) n = n.caller, r = n ? n._inherited : undefined;
if ("function" == typeof r) return r.apply(this, t || e);
}, enyo.kind.features.push(function(e, t) {
enyo.mixin(e, enyo.kind.statics), t.statics && (enyo.mixin(e, t.statics), delete e.prototype.statics);
var n = e.prototype.base;
while (n) n.subclass(e, t), n = n.prototype.base;
}), enyo.kind.statics = {
subclass: function(e, t) {},
extend: function(e) {
enyo.mixin(this.prototype, e);
var t = this;
enyo.forEach(enyo.kind.features, function(n) {
n(t, e);
});
}
}, enyo._kindCtors = {}, enyo.constructorForKind = function(e) {
if (e === null || enyo.isFunction(e)) return e;
if (e) {
var t = enyo._kindCtors[e];
return t ? t : enyo._kindCtors[e] = enyo.Theme[e] || enyo[e] || enyo.getPath.call(enyo, e) || window[e] || enyo.getPath(e);
}
return enyo.defaultCtor;
}, enyo.Theme = {}, enyo.registerTheme = function(e) {
enyo.mixin(enyo.Theme, e);
};

// Binding.js

(function() {
function e(e, t) {
this.transformer = e, this.binding = t;
}
function i() {
var e = 0, t = arguments.length;
enyo.Binding.bindingCount++;
for (; e < t; ++e) enyo.mixin(this, arguments[e]);
this.id = enyo.uid("binding"), this.setup();
}
enyo.Binding = i, enyo.Transform = e, e.prototype = {
transform: function(e, t) {
var n = this.transformer, r = this.binding, i = r.owner || enyo.global;
return n.call(i, e, t, r);
},
destroy: function() {
this.transformer = null, this.binding = null;
}
};
var t = enyo.Binding.map = {}, n = function(e) {
t[e.id] = e;
}, r = function(e) {
e = e.isBinding ? e.id : e, t[e] && delete t[e];
};
enyo.Binding.bindingCount = 0;
var s = function(e, t) {
var n = e[(t || [])[0]];
if (enyo.exists(n)) return enyo.global === e ? "object" == typeof n ? e : undefined : e;
}, o = enyo.Binding.getParts = function(e, t) {
if (this.debug) debugger;
var n, r = 0, i = {}, o, u, a, f, l, c = this.owner, h = e[0] === "." ? !0 : !1;
e = e[0] === "." ? e.slice(1) : e, n = e.split("."), o = h ? t || c : t || s(enyo.global, n) || c, f = o, i.property = a = n.length > 1 ? n.pop() : e;
if (a === e || !h && t) i.base = f; else {
u = f;
for (; r < n.length; ++r) {
l = n[r];
if (!l) continue;
u = u[l];
if (!u || "string" == typeof u) return l !== a && (i.base = null), i;
}
l !== e && (f = u), i.base = f;
}
return i;
};
enyo.Binding.transform = function(e, t) {
var n = this.transform;
return n(e, t);
}, i.prototype = {
source: null,
target: null,
sourceProperty: null,
targetProperty: null,
sourceResponder: null,
targetResponder: null,
isConnected: !1,
isRefreshing: !1,
sourceConnected: !1,
targetConnected: !1,
to: null,
from: null,
owner: null,
autoConnect: !0,
autoSync: !0,
transform: null,
oneWay: !0,
isBinding: !0,
destroyed: !1,
synchronizing: !1,
setup: function() {
var e = this.debug;
if (!0 === e) debugger;
var t = this.autoConnect, r = this.autoSync, i = this.setupSource(), s = this.setupTarget(), o = this.isRefreshing;
n(this), this.setupTransform();
if (!i || !s) {
o && s && this.setTargetValue(null);
return;
}
try {
(t || o) && this.connect();
} catch (u) {
if ("binding-destroyed" === u) return;
throw u;
}
(r || o) && this.sync();
},
sync: function() {
!0 === this.isConnected && this.syncFromSource();
},
refresh: function() {
this.isRefreshing = !0, this.disconnect(), this.setup(), this.isRefreshing = !1;
},
connect: function() {
if (!0 === this.isConnected) return;
if (!0 === this.destroyed) return;
this.connectSource(), this.connectTarget(), this.sourceConnected && this.targetConnected ? this.isConnected = !0 : this.isConnected = !1;
},
disconnect: function() {
if (!1 === this.isConnected) return;
this.disconnectSource(), this.disconnectTarget(), this.isConnected = !1;
},
setupSource: function() {
var e, t, n = this.sourceProperty, r = this.source, i = this.from;
return r && n ? !0 : i ? (e = o.call(this, i, r), t = e.base, n = e.property, !t || "object" != typeof t ? !1 : (this.source = t, this.sourceProperty = n, !0)) : !1;
},
setupTarget: function() {
var e, t, n = this.targetProperty, r = this.target, i = this.to;
return r && n ? !0 : i ? (e = o.call(this, i, r), t = e.base, n = e.property, !t || "object" != typeof t ? !1 : (this.target = t, this.targetProperty = n, !0)) : !1;
},
stop: function() {
throw "stop-binding";
},
connectSource: function() {
var e = this.source, t = this.sourceProperty, n = this.sourceResponder;
if (e instanceof enyo.Object) {
if (!enyo.exists(n) || "function" != typeof n) n = enyo.bind(this, this.syncFromSource), this.sourceResponder = n;
if (!0 === e.destroyed) throw this.destroy(), "binding-destroyed";
return !0 === this.sourceConnected ? !0 : enyo.exists(e) ? (n.bindingId = this.id, e.addObserver(t, n), this.sourceConnected = !0) : this.sourceConnected = !1;
}
return this.sourceConnected = !1;
},
connectTarget: function() {
var e = this.target, t = this.targetProperty, n = this.targetResponder, r = this.oneWay;
if (e instanceof enyo.Object) {
if (!0 === e.destroyed) throw this.destroy(), "binding-destroyed";
if (!0 === r) return this.targetConnected = !0;
if (!enyo.exists(n) || "function" != typeof n) n = enyo.bind(this, this.syncFromTarget), this.targetResponder = n;
return !0 === this.targetConnected ? !0 : enyo.exists(e) ? (n.bindingId = this.id, e.addObserver(t, n), this.targetConnected = !0) : this.targetConnected = !1;
}
return this.targetConnected = !1;
},
syncFromSource: function() {
var e = !this.oneWay, t = this.getSourceValue(), n = this.transform;
try {
t = n.transform(t, "source");
} catch (r) {
if ("stop-binding" === r) return;
throw r;
}
e && (this.synchronizing = !0, this.disconnectTarget()), this.setTargetValue(t), e && (this.connectTarget(), this.synchronizing = !1);
},
syncFromTarget: function() {
var e = this.getTargetValue(), t = this.transform;
try {
e = t.transform(e, "target");
} catch (n) {
if ("stop-binding" === n) return;
throw n;
}
this.disconnectSource(), this.setSourceValue(e), this.connectSource();
},
disconnectSource: function() {
var e = this.source, t = this.sourceProperty, n = this.sourceResponder;
if (!enyo.exists(e)) return;
e.removeObserver(t, n), this.sourceConnected = !1;
},
disconnectTarget: function() {
var e = this.target, t = this.targetResponder, n = this.targetProperty;
if (!enyo.exists(e)) return;
"function" == typeof t && e.removeObserver(n, t), this.targetConnected = !1;
},
setSourceValue: function(e) {
var t = this.source, n = this.sourceProperty;
t.set(n, e, !0);
},
setTargetValue: function(e) {
var t = this.target, n = this.targetProperty;
t.set(n, e, !0);
},
getSourceValue: function() {
var e = this.source, t = this.sourceProperty;
return e.get(t);
},
getTargetValue: function() {
var e = this.target, t = this.targetProperty;
return e.get(t);
},
setupTransform: function() {
var t = this.transform, n = this.owner || {};
"string" == typeof t ? t = n[t] || enyo.getPath.call(n, t) || enyo.getPath.call(enyo.global, t) : "function" == typeof t && (t = this.transform), "function" != typeof t && (t = this.transform = function(e) {
return e;
}), t instanceof e || (this.transform = new e(t, this));
},
destroy: function() {
if (!0 === this.destroyed) return;
this.destroyed = !0, this.disconnect(), this.source = null, this.target = null, this.sourceResponder = null, this.targetResponder = null, enyo.Binding.bindingCount--, this.transform && (this.transform.destroy(), this.transform = null), this.owner && this.owner.removeBinding(this), r(this);
}
};
})();

// Object.js

enyo.kind({
name: "enyo.Object",
kind: null,
concat: enyo.concat,
mixins: null,
initBindings: !0,
initMixins: !0,
initObservers: !0,
appliedMixins: null,
initComputed: !0,
bindings: null,
observers: null,
computed: null,
constructor: function() {
enyo._objectCount++, this.setup();
},
constructed: function(e) {
if (e) for (var t in e) {
if (!e.hasOwnProperty(t)) continue;
this[t] = e[t];
}
},
destroyObject: function(e) {
this[e] && this[e].destroy && this[e].destroy(), this[e] = null;
},
log: function() {
var e = arguments.callee.caller, t = ((e ? e.nom : "") || "(instance method)") + ":";
enyo.logging.log("log", [ t ].concat(enyo.cloneArray(arguments)));
},
warn: function() {
this._log("warn", arguments);
},
error: function() {
this._log("error", arguments);
},
_log: function(e, t) {
if (enyo.logging.shouldLog(e)) try {
throw new Error;
} catch (n) {
enyo.logging._log(e, [ t.callee.caller.nom + ": " ].concat(enyo.cloneArray(t))), enyo.log(n.stack);
}
},
findAndInstance: function(e) {
if (!enyo.exists(e)) return;
var t = this[e + "FindAndInstance"];
return t = enyo.exists(t) && "function" == typeof t ? enyo.bind(this, t) : null, enyo.findAndInstance.call(this, e, t);
},
setupMixins: function(e) {
if (!1 === this.initMixins && !e) return;
this.initMixins = !1, this.appliedMixins || (this.appliedMixins = []), enyo.forEach(this.mixins || [], this.prepareMixin, this);
},
prepareMixin: function(e) {
"string" == typeof e && (e = enyo.getPath(e)), e && this.extend(e);
},
setup: function() {
this.setupMixins(), this.setupObservers(), this.setupComputed(), this.setupBindings();
},
setupBindings: function(e) {
if (!1 === this.initBindings && !e) return;
this.initBindings = !1;
if (!0 === this.didSetupBindings) return this.refreshBindings();
var t = this.bindings || [], n = 0, r, i;
this.bindings = [];
for (r = t.length; n < r; ++n) i = t[n], this.binding(i);
this.didSetupBindings = !0, this.notifyObservers("didSetupBindings"), this.removeObserver("didSetupBindings");
},
binding: function() {
var e = arguments, t = 0, n = e.length, r, i = {}, s = this.bindings;
for (; t < n; ++t) enyo.mixin(i, e[t]);
return r = new enyo.Binding({
owner: this,
autoConnect: !0
}, i), s.push(r), r;
},
clearBindings: function(e) {
var t = enyo.cloneArray(e || this.bindings || []), n;
while (t.length) n = t.shift(), n instanceof enyo.Binding && n.destroy();
},
refreshBindings: function(e) {
var t = enyo.cloneArray(e || this.bindings || []), n;
while (t.length) n = t.shift(), n instanceof enyo.Binding && n.refresh();
},
removeBinding: function(e) {
if (!enyo.exists(e) || !(e instanceof enyo.Binding)) return;
var t = this.bindings || [], n = t.indexOf(e);
!~n || t.splice(n, 1);
},
setupComputed: function(e) {
if (!1 === this.initComputed && !e) return;
this.initComputed = !1;
var t, n, r, i, s, o, u, a = this.computed || (this.computed = {});
for (n in this) {
if (!enyo.exists(t = this[n])) continue;
if ("function" == typeof t && !0 === t.isProperty) {
a[n] = t, s = t.properties || [];
for (r = 0, i = s.length; r < i; ++r) o = s[r], u = enyo.bind(this, function(e) {
this.notifyObservers(e, null, this.get(e), !0);
}, n), this.addObserver(o, u);
}
}
},
setupObservers: function(e) {
if (!1 === this.initObservers && !e) return;
this.initObservers = !1, this.didSetupObservers = !0;
var t, n, r, i, s = this.observers || (this.observers = {}), o, u;
for (t in this) {
if (!enyo.exists(n = this[t])) continue;
if ("function" == typeof n && !0 === n.isObserver) {
o = n.events || [];
if (!o.length) continue;
for (r = 0, i = o.length; r < i; ++r) u = o[r], this.addObserver(u, n, this);
}
}
},
addObserver: function(e, t, n) {
var r = this.observers || (this.observers = {}), i;
return t = n ? enyo.bind(n, t) : t, enyo.exists(r[e]) ? i = r[e] : i = r[e] = [], ~i.indexOf(t) || i.push(t), t;
},
removeObserver: function(e, t) {
var n = this.observers, r, i;
if (!(i = n[e])) return this;
enyo.exists(t) && "function" == typeof t ? (r = i.indexOf(t), !~r || i.splice(r, 1)) : delete n[e];
},
removeAllObservers: function() {
var e = this.observers, t, n, r, i, s;
for (i in e) {
if (!e.hasOwnProperty(i)) continue;
t = e[i], e[i] = null;
for (s = 0, len = t.length; s < len; ++s) n = t[s], n.bindingId && (r = enyo.Binding.map[n.bindingId], r && r instanceof enyo.Binding && r.destroy());
}
return this.observers = {}, this;
},
notifyObservers: function(e, t, n) {
var r = this.observers || {}, i = r[e] || [], s = 0, o, u = enyo.uncap(e) + "Changed";
"*" !== e && (i = enyo.merge(i, r["*"] || []));
if (i) for (; s < i.length; ++s) {
o = i[s];
if (!enyo.exists(o) || "function" != typeof o) continue;
!1 === this.allowNotifications ? this.addNotificationToQueue(e, o, [ e, t, n ]) : o.call(this, e, t, n);
}
enyo.exists(this[u]) && "function" == typeof this[u] && (!1 === this.allowNotifications ? this.addNotificationToQueue(e, this[u], [ t, n ]) : this[u].call(this, t, n));
},
notificationQueue: null,
allowNotifications: !0,
allowNotificationQueue: !0,
addNotificationToQueue: function(e, t, n) {
var r = this.notificationQueue || (this.notificationQueue = {}), i = r[e];
n = n || [];
if (!1 === this.allowNotificationQueue) return;
enyo.exists(i) ? (i[0] !== n && i.splice(0, 1, n), ~i.indexOf(t) || i.push(t)) : r[e] = [ n, t ];
},
stopNotifications: function(e) {
this.allowNotifications = !1, this._stop_count += 1, !0 === e && this.disableNotificationQueue();
},
_stop_count: 0,
startNotifications: function(e) {
0 !== this._stop_count && --this._stop_count, 0 === this._stop_count && (this.allowNotifications = !0, this.flushNotifications()), !0 === e && this.enableNotificationQueue();
},
enableNotificationQueue: function() {
this.allowNotificationQueue = !0;
},
disableNotificationQueue: function() {
this.allowNotificationQueue = !1, this.notificationQueue = {};
},
flushNotifications: function() {
if (0 !== this._stop_count) return;
var e = this.notificationQueue, t, n, r, i;
if (!enyo.exists(e) || !1 === this.allowNotificationQueue) return;
for (n in e) {
if (!e.hasOwnProperty(n)) continue;
r = e[n], i = r.shift(), "function" == typeof i && (r.unshift(i), i = []);
while (r.length) t = r.shift(), t.apply(this, i);
}
},
get: function(e) {
return enyo.getPath.apply(this, arguments);
},
set: function(e, t) {
return enyo.setPath.apply(this, arguments);
},
extend: function() {
var e = enyo.toArray(arguments), t, n, r;
while (e.length && (t = e.shift())) if (t.isMixin || "function" == typeof t) this.extendMixin(t); else for (n in t) {
if (!t.hasOwnProperty(n)) continue;
r = t[n], "string" == typeof r ? this[n] = r : "function" == typeof r && this.extendMethod(n, r, t);
}
},
extendMethod: function(e, t, n) {
var r = this[e], i = !!t.isProperty, s = !!t.isObserver, o;
o = enyo.proxyMethod(t, this);
if (!enyo.exists(r) || "function" != typeof r) r = enyo.nop;
this[e] = o, o._inherited = r, !0 === i ? (o.isProperty = !0, o.properties = t.properties || []) : !0 === s && (o.isObserver = !0, o.events = t.events || []), o.isExtended = !0;
},
extendMixin: function(e) {
enyo.exists(e) && e.apply && e.apply(this);
},
destroy: function() {
this.clearBindings(), this.removeAllObservers(), this.destroyed = !0;
}
}), enyo._objectCount = 0, enyo.Object.subclass = function(e, t) {
this.publish(e, t);
}, enyo.Object.publish = function(e, t) {
var n = t.published;
if (n) {
var r = e.prototype;
for (var i in n) {
if (t[i] && enyo.isFunction(t[i]) && t[i].isProperty) continue;
enyo.Object.addGetterSetter(i, n[i], r);
}
}
}, enyo.Object.addGetterSetter = function(e, t, n) {
var r = "get" + enyo.cap(e), i = "set" + enyo.cap(e), s;
n[e] = t, s = n[r], "function" != typeof s ? (s = n[r] = function() {
return this.get(e);
}, s.overloaded = !1) : !1 !== s.overloaded && (s.overloaded = !0), s = n[i], "function" != typeof s ? (s = n[i] = function() {
return this.set(e, arguments[0]);
}, s.overloaded = !1) : !1 !== s.overloaded && (s.overloaded = !0);
};

// Component.js

enyo.kind({
name: "enyo.Component",
kind: enyo.Object,
published: {
name: "",
id: "",
owner: null
},
statics: {
_kindPrefixi: {},
_unnamedKindNumber: 0
},
defaultKind: "Component",
handlers: {},
initMixins: !1,
initComputed: !1,
toString: function() {
return this.kindName;
},
constructor: function(e) {
this._componentNameMap = {}, this.$ = {}, this.inherited(arguments);
},
constructed: function(e) {
this.importProps(e), this.initMixins = !0, this.setup(), this.create();
},
importProps: function(e) {
if (e) for (var t in e) this[t] = e[t];
this.handlers = enyo.mixin(enyo.clone(this.kindHandlers), this.handlers);
},
create: function() {
this.ownerChanged(), this.initComponents(), this.initComputed = !0, this.setup();
},
initComponents: function() {
this.createChrome(this.kindComponents), this.createClientComponents(this.components);
},
createChrome: function(e) {
this.createComponents(e, {
isChrome: !0
});
},
createClientComponents: function(e) {
this.createComponents(e, {
owner: this.getInstanceOwner()
});
},
getInstanceOwner: function() {
return !this.owner || this.owner.notInstanceOwner ? this : this.owner;
},
destroy: function() {
this.destroyComponents(), this.setOwner(null), this.inherited(arguments);
},
destroyComponents: function() {
enyo.forEach(this.getComponents(), function(e) {
e.destroyed || e.destroy();
});
},
makeId: function() {
var e = "_", t = this.owner && this.owner.getId(), n = this.name || "@@" + ++enyo.Component._unnamedKindNumber;
return (t ? t + e : "") + n;
},
ownerChanged: function(e) {
e && e.removeComponent && e.removeComponent(this), this.owner && this.owner.addComponent && this.owner.addComponent(this), this.id || (this.id = this.makeId());
},
nameComponent: function(e) {
var t = enyo.Component.prefixFromKindName(e.kindName), n, r = this._componentNameMap[t] || 0;
do n = t + (++r > 1 ? String(r) : ""); while (this.$[n]);
return this._componentNameMap[t] = Number(r), e.name = n;
},
addComponent: function(e) {
var t = e.getName();
t || (t = this.nameComponent(e)), this.$[t] && this.warn('Duplicate component name "' + t + '" in owner "' + this.id + '" violates ' + "unique-name-under-owner rule, replacing existing component in the hash and continuing, " + "but this is an error condition and should be fixed."), this.$[t] = e;
},
removeComponent: function(e) {
delete this.$[e.getName()];
},
getComponents: function() {
var e = [];
for (var t in this.$) e.push(this.$[t]);
return e;
},
adjustComponentProps: function(e) {
this.defaultProps && enyo.mixin(e, this.defaultProps), e.kind = e.kind || e.isa || this.defaultKind, e.owner = e.owner || this;
},
_createComponent: function(e, t) {
if (!e.kind && "kind" in e) throw "enyo.create: Attempt to create a null kind. Check dependencies for [" + e.name + "].";
var n = enyo.mixin(enyo.clone(t), e);
return this.adjustComponentProps(n), enyo.Component.create(n);
},
createComponent: function(e, t) {
return this._createComponent(e, t);
},
createComponents: function(e, t) {
if (e) {
var n = [];
for (var r = 0, i; i = e[r]; r++) n.push(this._createComponent(i, t));
return n;
}
},
getBubbleTarget: function() {
return this.owner;
},
bubble: function(e, t, n) {
if (this._silenced) return;
var r = t || {};
return "originator" in r || (r.originator = n || this), this.dispatchBubble(e, r, n);
},
bubbleUp: function(e, t, n) {
if (this._silenced) return;
var r = this.getBubbleTarget();
return r ? r.dispatchBubble(e, t, this) : !1;
},
dispatchEvent: function(e, t, n) {
if (this._silenced) return;
this.decorateEvent(e, t, n);
if (this.handlers && this.handlers[e] && this.dispatch(this.handlers[e], t, n)) return !0;
if (this[e]) return this.bubbleDelegation(this.owner, this[e], e, t, this);
},
dispatchBubble: function(e, t, n) {
if (this._silenced) return;
return this.dispatchEvent(e, t, n) ? !0 : this.bubbleUp(e, t, n);
},
decorateEvent: function(e, t, n) {},
bubbleDelegation: function(e, t, n, r, i) {
if (this._silenced) return;
var s = this.getBubbleTarget();
if (s) return s.delegateEvent(e, t, n, r, i);
},
delegateEvent: function(e, t, n, r, i) {
if (this._silenced) return;
return this.decorateEvent(n, r, i), e == this ? this.dispatch(t, r, i) : this.bubbleDelegation(e, t, n, r, i);
},
dispatch: function(e, t, n) {
if (this._silenced) return;
var r = e && this[e];
if (r) return r.call(this, n || this, t);
},
waterfall: function(e, t, n) {
if (this._silenced) return;
if (this.dispatchEvent(e, t, n)) return !0;
this.waterfallDown(e, t, n || this);
},
waterfallDown: function(e, t, n) {
if (this._silenced) return;
for (var r in this.$) this.$[r].waterfall(e, t, n);
},
_silenced: !1,
_silence_count: 0,
silence: function() {
this._silenced = !0, this._silence_count += 1;
},
unsilence: function() {
0 !== this._silence_count && --this._silence_count, 0 === this._silence_count && (this._silenced = !1);
}
}), enyo.defaultCtor = enyo.Component, enyo.create = enyo.Component.create = function(e) {
if (!e.kind && "kind" in e) throw "enyo.create: Attempt to create a null kind. Check dependencies for [" + (e.name || "") + "].";
var t = e.kind || e.isa || enyo.defaultCtor, n = enyo.constructorForKind(t);
return n || (enyo.error('no constructor found for kind "' + t + '"'), n = enyo.Component), new n(e);
}, enyo.Component.subclass = function(e, t) {
var n = e.prototype;
t.components && (n.kindComponents = t.components, delete n.components);
if (t.handlers) {
var r = n.kindHandlers;
n.kindHandlers = enyo.mixin(enyo.clone(r), n.handlers), n.handlers = null;
}
t.events && this.publishEvents(e, t);
}, enyo.Component.publishEvents = function(e, t) {
var n = t.events;
if (n) {
var r = e.prototype;
for (var i in n) this.addEvent(i, n[i], r);
}
}, enyo.Component.addEvent = function(e, t, n) {
var r, i;
enyo.isString(t) ? (e.slice(0, 2) != "on" && (enyo.warn("enyo.Component.addEvent: event names must start with 'on'. " + n.kindName + " event '" + e + "' was auto-corrected to 'on" + e + "'."), e = "on" + e), r = t, i = "do" + enyo.cap(e.slice(2))) : (r = t.value, i = t.caller), n[e] = r, n[i] || (n[i] = function(t) {
return this.bubble(e, t);
});
}, enyo.Component.prefixFromKindName = function(e) {
var t = enyo.Component._kindPrefixi[e];
if (!t) {
var n = e.lastIndexOf(".");
t = n >= 0 ? e.slice(n + 1) : e, t = t.charAt(0).toLowerCase() + t.slice(1), enyo.Component._kindPrefixi[e] = t;
}
return t;
};

// UiComponent.js

enyo.kind({
name: "enyo.UiComponent",
kind: enyo.Component,
published: {
container: null,
parent: null,
controlParentName: "client",
layoutKind: ""
},
handlers: {
onresize: "resizeHandler"
},
addBefore: undefined,
statics: {
_resizeFlags: {
showingOnly: !0
}
},
create: function() {
this.controls = [], this.children = [], this.containerChanged(), this.inherited(arguments), this.layoutKindChanged();
},
destroy: function() {
this.destroyClientControls(), this.setContainer(null), this.inherited(arguments);
},
importProps: function(e) {
this.inherited(arguments), this.owner || (this.owner = enyo.master);
},
createComponents: function() {
var e = this.inherited(arguments);
return this.discoverControlParent(), e;
},
discoverControlParent: function() {
this.controlParent = this.$[this.controlParentName] || this.controlParent;
},
adjustComponentProps: function(e) {
e.container = e.container || this, this.inherited(arguments);
},
containerChanged: function(e) {
e && e.removeControl(this), this.container && this.container.addControl(this, this.addBefore);
},
parentChanged: function(e) {
e && e != this.parent && e.removeChild(this);
},
isDescendantOf: function(e) {
var t = this;
while (t && t != e) t = t.parent;
return e && t == e;
},
getControls: function() {
return this.controls;
},
getClientControls: function() {
var e = [];
for (var t = 0, n = this.controls, r; r = n[t]; t++) r.isChrome || e.push(r);
return e;
},
destroyClientControls: function() {
var e = this.getClientControls();
for (var t = 0, n; n = e[t]; t++) n.destroy();
},
addControl: function(e, t) {
this.controls.push(e), this.addChild(e, t);
},
removeControl: function(e) {
return e.setParent(null), enyo.remove(e, this.controls);
},
indexOfControl: function(e) {
return enyo.indexOf(e, this.controls);
},
indexOfClientControl: function(e) {
return enyo.indexOf(e, this.getClientControls());
},
indexInContainer: function() {
return this.container.indexOfControl(this);
},
clientIndexInContainer: function() {
return this.container.indexOfClientControl(this);
},
controlAtIndex: function(e) {
return this.controls[e];
},
addChild: function(e, t) {
if (this.controlParent) this.controlParent.addChild(e); else {
e.setParent(this);
if (t !== undefined) {
var n = t === null ? 0 : this.indexOfChild(t);
this.children.splice(n, 0, e);
} else this.children.push(e);
}
},
removeChild: function(e) {
return enyo.remove(e, this.children);
},
indexOfChild: function(e) {
return enyo.indexOf(e, this.children);
},
layoutKindChanged: function() {
this.layout && this.layout.destroy(), this.layout = enyo.createFromKind(this.layoutKind, this), this.generated && this.render();
},
flow: function() {
this.layout && this.layout.flow();
},
reflow: function() {
this.layout && this.layout.reflow();
},
resized: function() {
this.waterfall("onresize", enyo.UiComponent._resizeFlags), this.waterfall("onpostresize", enyo.UiComponent._resizeFlags);
},
resizeHandler: function() {
this.reflow();
},
waterfallDown: function(e, t, n) {
for (var r in this.$) this.$[r] instanceof enyo.UiComponent || this.$[r].waterfall(e, t, n);
for (var i = 0, s = this.children, o; o = s[i]; i++) (o.showing || !t || !t.showingOnly) && o.waterfall(e, t, n);
},
getBubbleTarget: function() {
return this.parent;
}
}), enyo.createFromKind = function(e, t) {
var n = e && enyo.constructorForKind(e);
if (n) return new n(t);
}, enyo.master = new enyo.Component({
name: "master",
notInstanceOwner: !0,
eventFlags: {
showingOnly: !0
},
getId: function() {
return "";
},
isDescendantOf: enyo.nop,
bubble: function(e, t, n) {
e == "onresize" ? (enyo.master.waterfallDown("onresize", this.eventFlags), enyo.master.waterfallDown("onpostresize", this.eventFlags)) : enyo.Signals.send(e, t);
}
});

// Layout.js

enyo.kind({
name: "enyo.Layout",
kind: null,
layoutClass: "",
constructor: function(e) {
this.container = e, e && e.addClass(this.layoutClass);
},
destroy: function() {
this.container && this.container.removeClass(this.layoutClass);
},
flow: function() {},
reflow: function() {}
});

// Signals.js

enyo.kind({
name: "enyo.Signals",
kind: enyo.Component,
create: function() {
this.inherited(arguments), enyo.Signals.addListener(this);
},
destroy: function() {
enyo.Signals.removeListener(this), this.inherited(arguments);
},
notify: function(e, t) {
this.dispatchEvent(e, t);
},
statics: {
listeners: [],
addListener: function(e) {
this.listeners.push(e);
},
removeListener: function(e) {
enyo.remove(e, this.listeners);
},
send: function(e, t) {
enyo.forEach(this.listeners, function(n) {
n.notify(e, t);
});
}
}
});

// Controller.js

enyo.kind({
name: "enyo.Controller",
kind: "enyo.Component",
mixins: [ "enyo.MultipleDispatchMixin" ],
data: null,
create: function() {
this.inherited(arguments), this.id = this.makeId();
},
ownerChanged: function() {
this.refreshBindings();
},
controllerBubbleTarget: null,
getBubbleTarget: function() {
return this.get("bubbleTarget");
},
bubbleTarget: enyo.Computed(function() {
return this.get("controllerBubbleTarget");
}, "controllerBubbleTarget")
});

// Router.js

(function() {
var e = [], t = function(t) {
var n = enyo.cloneArray(e), r;
while (n.length) r = n.shift(), r.hashChanged(t);
}, n = /\:[a-zA-Z0-9]*/g, r = function(e) {
return e[0] === "#" ? e.slice(1) : e;
};
enyo.ready(function() {
enyo.dispatcher.listen(window, "hashchange", t);
}), enyo.kind({
name: "enyo.Router",
kind: "enyo.Controller",
listening: !0,
internalOnly: !1,
staticRoutes: null,
dynamicRoutes: null,
defaultRoute: null,
triggerOnStart: !0,
current: "",
routes: null,
trigger: function(e) {
e ? "string" == typeof e && (e = {
location: e
}) : e = {
location: this.get("current")
};
var n = e.location, r = e.global, i = e.change;
i ? window.location.hash = n : r ? t(n) : this.hashChanged(n);
},
location: enyo.Computed(function(e) {
if (!e) return r(this.get("current"));
e = r(e), this.internalOnly ? this.set("current", e) : window.location.hash = e;
}, "current"),
constructor: function() {
this.staticRoutes = {}, this.dynamicRoutes = [], this.inherited(arguments);
},
create: function() {
this.inherited(arguments), this.setupRoutes(), this.set("current", r(window.location.hash)), e.push(this), this.triggerOnStart && this.trigger();
},
destroy: function() {
var t = e.indexOf(this);
~t || e.splice(t, 1), this.inherited(arguments);
},
hashChanged: function(e) {
var e = e || r(window.location.hash);
"string" != typeof e && (e = e.newURL.split("#")[1]), this.listening && (this.set("current", e), this.handle(e));
},
handle: function(e) {
if (this.handleStatic(e)) return;
this.handleDynamic(e) || this.handleDefault(e);
},
execHandler: function(e, t, n, r) {
var i = t;
return "string" == typeof t && (e ? "string" == typeof e && (e = enyo.getPath(e)) : e = this, i = this[t] || e[t], "function" == typeof i && (r.handler = i, r.context = e)), i && "function" == typeof i ? (i.apply(e, n), !0) : !1;
},
handleStatic: function(e) {
var t = this.staticRoutes, n, r, i;
return (n = t[e]) ? (r = n.handler, i = n.context, this.execHandler(i, r, [ e ], n)) : !1;
},
handleDynamic: function(e) {
var t = this.dynamicRoutes, n, r, i, s, o, u = 0, a = t.length;
for (; u < a; ++u) {
r = t[u], n = r.regex;
if (o = n.exec(e)) return o = o.slice(1), i = r.handler, s = r.context, this.execHandler(s, i, o, r);
}
return !1;
},
handleDefault: function(e) {
var t = this.defaultRoute || {}, n = t.context, r = t.handler;
return this.execHandler(n, r, [ e ], t);
},
setupRoutes: function() {
var e = this.routes, t = 0, n = e.length, r, i;
for (; t < n; ++t) {
r = e[t];
if (!r) continue;
this.addRoute(r);
}
},
addRoute: function(e) {
var t = this.staticRoutes, r = this.dynamicRoutes, i;
!0 === e.default ? this.defaultRoute = e : n.test(e.path) ? (i = new RegExp(e.path.replace(n, "([a-zA-Z0-9]*)")), e.regex = i, r.push(e)) : t[e.path] = e;
}
});
})();

// ArrayController.js

enyo.kind({
name: "enyo.ArrayController",
kind: "enyo.Controller",
length: 0,
data: enyo.Computed(function(e) {
var t = this._modified, n = this._cached, r = this._store, i = 0, s = this.length;
if (!e) {
if (t > n || !r || s !== r.length) {
r = this._store = [];
for (; i < s; ++i) r[i] = this[i];
this._cached = enyo.bench();
}
return r;
}
this.reset(e);
}, "length"),
_modified: null,
_cached: null,
_store: null,
_init_values: null,
push: function() {
var e = arguments, t = this.length, n = e.length + t, r = 0, i = {}, s = this.get("data"), o = this.length;
if (n) {
for (; t < n; ++t, ++r) i[t] = this[t] = e[r];
return this.length = n, this._modified = enyo.bench(), this.notifyObservers("length", o, this.length), this.dispatchBubble("didadd", {
values: i
}, this), this.length;
}
return 0;
},
pop: function() {
if (this.length) {
var e = this.length - 1, t = this[e], n = {};
return delete this[e], this.length = e, n[e] = t, this._modified = enyo.bench(), this.notifyObservers("length", e + 1, e), this.dispatchBubble("didremove", {
values: n
}, this), t;
}
},
shift: function() {
if (this.length) {
var e = this[0], t = 1, n = this.length, r = {};
for (; t < n; ++t) this[t - 1] = this[t];
return delete this[n - 1], this.length = n - 1, r[0] = e, this._modified = enyo.bench(), this.notifyObservers("length", n, this.length), this.dispatchBubble("didremove", {
values: r
}, this), e;
}
},
unshift: function() {
if (arguments.length) {
var e = this.length, t = e - 1, n = arguments.length, r = t + n, i = {};
for (; r >= n; --r, --t) this[r] = this[t];
for (t = 0; t < n; ++t) i[t] = this[t] = arguments[t];
return this.length = e + arguments.length, this._modified = enyo.bench(), this.notifyObservers("length", e, this.length), this.dispatchBubble("didadd", {
values: i
}, this), this.length;
}
},
indexOf: function(e, t) {
return enyo.indexOf(e, this.get("data"), t);
},
lastIndexOf: function(e, t) {
return enyo.lastIndexOf(e, this.get("data"), t);
},
splice: function(e, t) {
var n = enyo.toArray(arguments).slice(2), r = n.length, i = this.length, s = i - 1, o = [], u = {
added: {
len: 0
},
removed: {
len: 0
},
changed: {
len: 0
}
}, a = 0, f, l, c, h, p;
e = e < 0 ? 0 : e >= i ? i : e, t = t && !isNaN(t) && t + e <= i ? t : 0;
if (t) {
c = e + t - r;
for (f = e, l = e + t - 1; f <= l; ++f, ++a) o[a] = this[f], r && r >= t ? (u.changed[f] = this[f], u.changed.len++) : r && r < t && f < c && (u.changed[f] = this[f], u.changed.len++), u.removed[f] = this[f], u.removed.len++;
}
if (r && r > t) {
h = r - t, a = s;
for (; a >= e && a < i; --a) this[a + h] = this[a];
this.length += h;
} else {
h = t - (r ? r : 0), a = e + t;
for (; a < i; ++a) this[a - h] = this[a], u.changed[a - h] = this[a - h], u.changed.len++;
f = this.length -= h;
for (; f < i; ++f) delete this[f];
}
if (r) {
a = 0, f = e, h = t ? t > r ? t - r : r - t : 0;
for (; a < r; ++f, ++a) {
this[f] = n[a], i && f < i && (u.changed[f] = this[f], u.changed.len++);
if (!i || h && a >= h || !t) u.added[i + a - h] = this[i + a - h], u.added.len++;
}
}
return u.removed.len && (delete u.removed.len, this.dispatchBubble("didremove", {
values: u.removed
}, this)), u.added.len && (delete u.added.len, this.dispatchBubble("didadd", {
values: u.added
}, this)), u.changed.len && (delete u.changed.len, this.dispatchBubble("didchange", {
values: u.changed
}, this)), o;
},
join: function(e) {
this.get("data").join(e);
},
map: function(e, t) {
return enyo.map(this.get("data"), e, t);
},
filter: function(e, t) {
return enyo.filter(this.get("data"), e, t);
},
add: function(e, t) {
var e = e.length ? e : [ e ], n = this.length, r = t && !isNaN(t) && t >= 0 && t < n ? t : n, i = [ r, 0 ].concat(e);
this.splice.apply(this, i);
},
remove: function(e, t) {
var n, r, i, s = 0;
if (e instanceof Array) {
n = {
removed: {},
changed: {}
}, r = 0, i = e.length, this.silence(), this.stopNotifications(!0);
for (; r < i; ++r) t = this.indexOf(e[r]), t < s && (s = t), n.removed[r] = e[r], this.remove(e[r], t);
for (r = s, i = this.length; r < i; ++r) n.changed[r] = this[r];
this.unsilence(), this.startNotifications(!0), this.dispatchBubble("didremove", {
values: n.removed
}, this), this.dispatchBubble("didchange", {
values: n.changed
}, this);
} else r = isNaN(t) ? this.indexOf(e) : t, !~r || this.splice(r, 1);
},
reset: function(e) {
this.silence(), this.stopNotifications(!0), e ? this.splice.apply(this, [ 0, this.length ].concat(e)) : this.splice(0, this.length), this.unsilence(), this.startNotifications(!0), this.dispatchBubble("didreset", {
values: this
}, this);
},
swap: function(e, t) {
var n = {}, r = this[e], i = this[t];
n[e] = this[e] = i, n[t] = this[t] = r, this.dispatchBubble("didchange", {
values: n
}, this);
},
move: function(e, t) {
var n, r = this.length, i = r - 1;
e = e < 0 ? 0 : e >= r ? i : e, t = t < 0 ? 0 : t >= r ? i : t;
if (e === t) return;
n = this[e], this.silence(), this.stopNotifications(!0), e === i ? this.pop() : this.splice(e, 1), this.unsilence(), this.startNotifications(!0), this.splice(t, 0, n);
},
contains: function(e) {
return ~enyo.indexOf(this.get("data"), e) ? !0 : !1;
},
at: function(e) {
return this[e];
},
find: function(e, t) {
var n = 0, r = this.length, i;
for (; n < r; ++n) {
i = this.at(n);
if (e.call(t || this, i)) return i;
}
return !1;
},
changed: function(e) {
var t = {}, n = 0, r, i, s, o, u;
if (e) e instanceof Array ? i = e.slice() : i = enyo.keys(e); else {
i = [], r = this.length, o = this.get("data");
for (; n < r; ++n) u = o[n], this.comparator(this[n], u) || (t[n] = this[n], i.push(n));
}
if (!i.length) return;
for (r = i.length; n < r; ++n) s = i[n], t[s] = this[s];
this._modified = enyo.bench(), this.dispatchBubble("didchange", {
values: t
}, this);
},
comparator: function(e, t) {
return e === t;
},
create: function() {
this._cached = this._modified = enyo.bench(), this._store = [], this.inherited(arguments), this._init_values && (this.push.apply(this, this._init_values), this._init_values = null);
},
constructor: function() {
this.inherited(arguments);
if (arguments.length) {
var e = [], t = 0, n = arguments.length;
for (; t < n; ++t) arguments[t] instanceof Array ? e = e.concat(arguments[t]) : e.push(arguments[t]);
this._init_values = e;
}
}
});

// Mixin.js

(function() {
function e(t) {
var n = enyo.mixin(enyo.clone(e.defaults), t), r = enyo.union(e.ignore, enyo.keys(n)), i = t.name;
enyo.setPath(i, this), enyo.mixin(this, n), this.properties = r;
}
enyo.Mixin = function(t) {
return new e(t);
}, e.defaults = {
initMixin: null,
destroyMixin: null,
name: ""
}, e.ignore = [ "initMixin", "destroyMixin", "name" ], e.prototype = {
isMixin: !0,
apply: function(e) {
var t = e.appliedMixins || (e.appliedMixins = []), n;
if (!!~t.indexOf(this)) return;
t.push(this.name), e.extend(this.get("extension")), this.injectDestructor(e), !0 === e.didSetupObservers && e.setupObservers(!0), this.initMixin && (!0 === e.didSetupBindings ? this.initMixin.call(e) : (n = enyo.proxyMethod(this.initMixin, e), e.addObserver("didSetupBindings", n)));
},
get: function() {
return enyo.getPath.apply(this, arguments);
},
extension: enyo.Computed(function() {
var e = {}, t = this.properties;
return enyo.forEach(t, function(t) {
e[t] = this[t], "function" == typeof this[t] && (e[t].nom = this.name + "." + t);
}, this), e;
}),
injectDestructor: function(e) {
var t = e.destroy || enyo.nop, n = this.destroyMixin;
if ("function" != typeof n) return;
n = e.destroy = enyo.proxyMethod(n, e), n._inherited = t;
}
};
})();

// MultipleDispatchMixin.js

enyo.Mixin({
name: "enyo.MultipleDispatchMixin",
dispatchTargets: null,
defaultDispatch: !1,
initMixin: function() {
this.dispatchTargets = [];
},
ownerChanged: function() {
this.inherited(arguments), this.owner && this.owner instanceof enyo.Control && (this.defaultDispatch = !0, this.controllerBubbleTarget = this.owner);
},
addDispatchTarget: function(e) {
var t = this.dispatchTargets;
t.indexOf(e) === -1 && e !== this && t.push(e), this.inherited(arguments);
},
dispatchFrom: function(e, t) {
return t.dispatchedByController ? t.dispatchController === this ? !0 : !1 : (e === this && (t.dispatchedByController = !0, t.dispatchController = this), !1);
},
bubbleUp: function(e, t, n) {
var r;
if (this.defaultDispatch) return this.inherited(arguments);
r = this.get("dispatchTargets"), enyo.forEach(enyo.clone(r), function(r) {
r && (r.destroyed ? this.removeDispatchTarget(r) : r.dispatchBubble(e, t, n));
}, this);
},
dispatch: function(e, t, n) {
return this.inherited(arguments);
},
dispatchEvent: function(e, t, n) {
return this.dispatchFrom(n, t) ? !1 : this.inherited(arguments);
},
bubbleDelegation: function(e, t, n, r, i) {
if (this.defaultDispatch) {
if (this.proxiedController) {
debugger;
if (this.proxiedController.delegateEvent(e, t, n, r, i)) return !0;
}
return this.inherited(arguments);
}
var s = this.get("dispatchTargets");
enyo.forEach(enyo.clone(s), function(s) {
s && (s.destroyed ? this.removeDispatchTarget(s) : s.delegateEvent(e, t, n, r, i));
});
},
removeDispatchTarget: function(e) {
var t = this.get("dispatchTargets"), n;
n = t.indexOf(e), n !== -1 && t.splice(n, 1);
}
});

// ViewController.js

enyo.kind({
name: "enyo.ViewController",
kind: "enyo.Controller",
view: null,
renderTarget: "document.body",
constructor: function() {
this.inherited(arguments);
},
create: function() {
var e = this.get("viewKind");
this.view = new e, this.inherited(arguments);
},
render: function() {
var e = this.get("target"), t = this.get("view");
t.renderInto(e);
},
renderInto: function(e) {
this.set("renderTarget", e), this.render();
},
target: enyo.Computed(function() {
var e = this.renderTarget;
"string" == typeof e && ("#" === e[0] ? (e = e.slice(1), e = enyo.dom.byId(e)) : e = enyo.getPath(e), e || (e = enyo.dom.byId(e)));
if (!e) throw "Cannot find requested render target!";
return e;
}, "renderTarget"),
viewKind: enyo.Computed(function() {
var e = this.view;
"string" == typeof e && (e = enyo.getPath(e));
if (!e) throw "Cannot find the requested view!";
return e;
}, "view")
});

// Application.js

(function() {
var e = enyo.applications = {}, t = function(t) {
var n = t.kindName, r = e[n] || (e[n] = []);
r.push(t);
}, n = function(t) {
var n = t.kindName, r = e[n] || [], i = r.indexOf(t);
~i || r.splice(i, 1);
}, r = function(e) {
var t, n;
return "string" != typeof e || "" === e ? undefined : (t = e.split("."), 1 === t.length ? undefined : (n = t.shift(), n));
};
enyo.kind({
name: "enyo.Application",
kind: "enyo.ViewController",
autoStart: !0,
renderOnStart: !1,
controllers: null,
initBindings: !1,
concat: [ "controllers" ],
constructor: function(e) {
e && enyo.exists(e.name) && enyo.setPath(e.name, this), this.inherited(arguments);
},
create: function() {
this.initComponents(), this.inherited(arguments), !0 === this.autoStart && this.start();
},
initComponents: function() {
this.setupControllers();
},
start: function() {
t(this), this.initBindings = !0, this.setup(), !0 === this.renderOnStart && this.render();
},
setupControllers: function() {
var e = this.controllers, t, n = this.get("namespace"), i = "%..%.";
this.controllers = null, enyo.forEach(e, function(e) {
var s = e.name, o = Boolean(e.global), u, a;
delete e.name, delete e.global, a = r(s), u = enyo.kind(e), enyo.exists(a) ? n !== a && !0 !== o && (s = enyo.format(i, n, s)) : !0 !== o && (s = enyo.format(i, n, s)), t = new u, t.runtimePath = s, enyo.setPath(s, t);
});
},
namespace: enyo.Computed(function() {
return r(this.kindName);
}),
destroy: function() {
this.inherited(arguments), n(this);
}
});
})();

// ObjectController.js

enyo.kind({
name: "enyo.ObjectController",
kind: "enyo.Controller",
_getting: !1,
_listener: null,
_last: null,
get: function(e) {
var t;
return "data" === e ? this.inherited(arguments) : (!1 === (t = this.getDataProperty(e)) && (t = this.inherited(arguments)), t);
},
set: function(e, t) {
if (!this.setDataProperty(e, t)) return this.inherited(arguments);
},
setDataProperty: function(e, t) {
var n = this.get("data");
return n && this.isAttribute(e) ? (enyo.setPath.call(n, e, t), this.startNotifications(), !0) : !1;
},
getDataProperty: function(e) {
var t = this.get("data");
return t && this.isAttribute(e) ? enyo.getPath.call(t, e) : !1;
},
isAttribute: function(e) {
var t = this.get("data");
if (t) {
if ("function" == typeof t.isAttribute) return t.isAttribute(e);
if (t.hasOwnProperty(e)) return !0;
}
return !1;
},
releaseData: function(e) {
var e = e || this.get("data");
if (!e || !(e instanceof enyo.Object)) return;
this._listener && e.removeObserver("*", this._listener), this._last = null;
},
sync: function() {
var e = this.observers, t, n, r, i = 0, s, o;
for (n in e) {
r = e[n];
if (!r || !r.length) continue;
for (i = 0, s = r.length; i < s; ++i) {
t = r[i];
if (t.bindingId) {
o = enyo.Binding.map[t.bindingId];
if (!o) continue;
o.sync();
}
}
}
},
initData: function(e) {
var e = e || this.get("data");
if (!e || !(e instanceof enyo.Object)) return;
this._listener = e.addObserver("*", this.notifyObservers, this), this._last = e;
},
create: function() {
this.inherited(arguments), this.dataDidChange();
},
notifyAll: function() {
var e = this.observers, t, n;
for (n in e) {
if (!e.hasOwnProperty(n)) continue;
if (!1 === this.isAttribute(n)) continue;
t = e[n], enyo.forEach(t, function(e) {
"function" == typeof e && e();
}, this);
}
},
dataDidChange: enyo.Observer(function() {
this._last && this.releaseData(this._last), this.initData(), this.notifyAll();
}, "data")
});

// Async.js

enyo.kind({
name: "enyo.Async",
kind: enyo.Object,
published: {
timeout: 0
},
failed: !1,
context: null,
constructor: function() {
this.responders = [], this.errorHandlers = [];
},
accumulate: function(e, t) {
var n = t.length < 2 ? t[0] : enyo.bind(t[0], t[1]);
e.push(n);
},
response: function() {
return this.accumulate(this.responders, arguments), this;
},
error: function() {
return this.accumulate(this.errorHandlers, arguments), this;
},
route: function(e, t) {
var n = enyo.bind(this, "respond");
e.response(function(e, t) {
n(t);
});
var r = enyo.bind(this, "fail");
e.error(function(e, t) {
r(t);
}), e.go(t);
},
handle: function(e, t) {
var n = t.shift();
if (n) if (n instanceof enyo.Async) this.route(n, e); else {
var r = enyo.call(this.context || this, n, [ this, e ]);
r = r !== undefined ? r : e, (this.failed ? this.fail : this.respond).call(this, r);
}
},
startTimer: function() {
this.startTime = enyo.now(), this.timeout && (this.timeoutJob = setTimeout(enyo.bind(this, "timeoutComplete"), this.timeout));
},
endTimer: function() {
this.timeoutJob && (this.endTime = enyo.now(), clearTimeout(this.timeoutJob), this.timeoutJob = null, this.latency = this.endTime - this.startTime);
},
timeoutComplete: function() {
this.timedout = !0, this.fail("timeout");
},
respond: function(e) {
this.failed = !1, this.endTimer(), this.handle(e, this.responders);
},
fail: function(e) {
this.failed = !0, this.endTimer(), this.handle(e, this.errorHandlers);
},
recover: function() {
this.failed = !1;
},
go: function(e) {
return enyo.asyncMethod(this, function() {
this.respond(e);
}), this;
}
});

// json.js

enyo.json = {
stringify: function(e, t, n) {
return JSON.stringify(e, t, n);
},
parse: function(e, t) {
return e ? JSON.parse(e, t) : null;
}
};

// cookie.js

enyo.getCookie = function(e) {
var t = document.cookie.match(new RegExp("(?:^|; )" + e + "=([^;]*)"));
return t ? decodeURIComponent(t[1]) : undefined;
}, enyo.setCookie = function(e, t, n) {
var r = e + "=" + encodeURIComponent(t), i = n || {}, s = i.expires;
if (typeof s == "number") {
var o = new Date;
o.setTime(o.getTime() + s * 24 * 60 * 60 * 1e3), s = o;
}
s && s.toUTCString && (i.expires = s.toUTCString());
var u, a;
for (u in i) r += "; " + u, a = i[u], a !== !0 && (r += "=" + a);
document.cookie = r;
};

// xhr.js

enyo.xhr = {
request: function(e) {
var t = this.getXMLHttpRequest(e), n = enyo.path.rewrite(this.simplifyFileURL(e.url)), r = e.method || "GET", i = !e.sync;
e.username ? t.open(r, n, i, e.username, e.password) : t.open(r, n, i), enyo.mixin(t, e.xhrFields), e.callback && this.makeReadyStateHandler(t, e.callback), e.headers = e.headers || {}, r !== "GET" && enyo.platform.ios && enyo.platform.ios >= 6 && e.headers["cache-control"] !== null && (e.headers["cache-control"] = e.headers["cache-control"] || "no-cache");
if (t.setRequestHeader) for (var s in e.headers) e.headers[s] && t.setRequestHeader(s, e.headers[s]);
return typeof t.overrideMimeType == "function" && e.mimeType && t.overrideMimeType(e.mimeType), t.send(e.body || null), !i && e.callback && t.onreadystatechange(t), t;
},
cancel: function(e) {
e.onload && (e.onload = null), e.onreadystatechange && (e.onreadystatechange = null), e.abort && e.abort();
},
makeReadyStateHandler: function(e, t) {
window.XDomainRequest && e instanceof XDomainRequest && (e.onload = function() {
var n;
typeof e.responseText == "string" && (n = e.responseText), t.apply(null, [ n, e ]);
}), e.onreadystatechange = function() {
if (e.readyState == 4) {
var n;
typeof e.responseText == "string" && (n = e.responseText), t.apply(null, [ n, e ]);
}
};
},
inOrigin: function(e) {
var t = document.createElement("a"), n = !1;
t.href = e;
if (t.protocol === ":" || t.protocol === window.location.protocol && t.hostname === window.location.hostname && t.port === (window.location.port || (window.location.protocol === "https:" ? "443" : "80"))) n = !0;
return n;
},
simplifyFileURL: function(e) {
var t = document.createElement("a"), n = !1;
return t.href = e, t.protocol === "file:" || t.protocol === ":" && window.location.protocol === "file:" ? t.protocol + "//" + t.host + t.pathname : e;
},
getXMLHttpRequest: function(e) {
try {
if (enyo.platform.ie < 10 && window.XDomainRequest && !e.headers && !this.inOrigin(e.url) && !/^file:\/\//.test(window.location.href)) return new XDomainRequest;
} catch (t) {}
try {
return new XMLHttpRequest;
} catch (t) {}
return null;
}
};

// formdata.js

(function(e) {
function i() {
this.fake = !0, this._fields = [], this.boundary = "--------------------------";
for (var e = 0; e < 24; e++) this.boundary += Math.floor(Math.random() * 10).toString(16);
}
function s(e, t) {
this.name = t.name, this.type = t.type || "application/octet-stream";
if (!enyo.isArray(e)) throw new Error("enyo.Blob only handles Arrays of Strings");
if (e.length > 0 && typeof e[0] != "string") throw new Error("enyo.Blob only handles Arrays of Strings");
this._bufs = e;
}
if (e.FormData) try {
var t = new e.FormData, n = new e.Blob;
enyo.FormData = e.FormData, enyo.Blob = e.Blob;
return;
} catch (r) {}
i.prototype.getContentType = function() {
return "multipart/form-data; boundary=" + this.boundary;
}, i.prototype.append = function(e, t, n) {
this._fields.push([ e, t, n ]);
}, i.prototype.toString = function() {
var e = this.boundary, t = "";
return enyo.forEach(this._fields, function(n) {
t += "--" + e + "\r\n";
if (n[2] || n[1].name) {
var r = n[1], i = n[2] || r.name;
t += 'Content-Disposition: form-data; name="' + n[0] + '"; filename="' + i + '"\r\n', t += "Content-Type: " + r.type + "\r\n\r\n", t += r.getAsBinary() + "\r\n";
} else t += 'Content-Disposition: form-data; name="' + n[0] + '";\r\n\r\n', t += n[1] + "\r\n";
}), t += "--" + e + "--", t;
}, enyo.FormData = i, s.prototype.getAsBinary = function() {
var e = "", t = e.concat.apply(e, this._bufs);
return t;
}, enyo.Blob = s;
})(window);

// AjaxProperties.js

enyo.AjaxProperties = {
cacheBust: !0,
url: "",
method: "GET",
handleAs: "json",
contentType: "application/x-www-form-urlencoded",
sync: !1,
headers: null,
postBody: "",
username: "",
password: "",
xhrFields: null,
mimeType: null
};

// Ajax.js

enyo.kind({
name: "enyo.Ajax",
kind: enyo.Async,
published: enyo.AjaxProperties,
constructor: function(e) {
enyo.mixin(this, e), this.inherited(arguments);
},
go: function(e) {
return this.startTimer(), this.request(e), this;
},
request: function(e) {
var t = this.url.split("?"), n = t.shift() || "", r = t.length ? t.join("?").split("&") : [], i = null;
enyo.isString(e) ? i = e : e && (i = enyo.Ajax.objectToQuery(e)), i && (r.push(i), i = null), this.cacheBust && r.push(Math.random());
var s = r.length ? [ n, r.join("&") ].join("?") : n, o = {}, u;
this.method != "GET" && (u = this.postBody, this.method === "POST" && u instanceof enyo.FormData ? u.fake && (o["Content-Type"] = u.getContentType(), u = u.toString()) : (o["Content-Type"] = this.contentType, u instanceof Object && (this.contentType === "application/json" ? u = JSON.stringify(u) : this.contentType === "application/x-www-form-urlencoded" ? u = enyo.Ajax.objectToQuery(u) : u = u.toString()))), enyo.mixin(o, this.headers), enyo.keys(o).length === 0 && (o = undefined);
try {
this.xhr = enyo.xhr.request({
url: s,
method: this.method,
callback: enyo.bind(this, "receive"),
body: u,
headers: o,
sync: window.PalmSystem ? !1 : this.sync,
username: this.username,
password: this.password,
xhrFields: this.xhrFields,
mimeType: this.mimeType
});
} catch (a) {
this.fail(a);
}
},
receive: function(e, t) {
if (!this.failed && !this.destroyed) {
var n;
typeof t.responseText == "string" ? n = t.responseText : n = t.responseBody, this.xhrResponse = {
status: t.status,
headers: enyo.Ajax.parseResponseHeaders(t),
body: n
}, this.isFailure(t) ? this.fail(t.status) : this.respond(this.xhrToResponse(t));
}
},
fail: function(e) {
this.xhr && (enyo.xhr.cancel(this.xhr), this.xhr = null), this.inherited(arguments);
},
xhrToResponse: function(e) {
if (e) return this[(this.handleAs || "text") + "Handler"](e);
},
isFailure: function(e) {
try {
var t = "";
return typeof e.responseText == "string" && (t = e.responseText), e.status === 0 && t === "" ? !0 : e.status !== 0 && (e.status < 200 || e.status >= 300);
} catch (n) {
return !0;
}
},
xmlHandler: function(e) {
return e.responseXML;
},
textHandler: function(e) {
return e.responseText;
},
jsonHandler: function(e) {
var t = e.responseText;
try {
return t && enyo.json.parse(t);
} catch (n) {
return enyo.warn("Ajax request set to handleAs JSON but data was not in JSON format"), t;
}
},
statics: {
objectToQuery: function(e) {
var t = encodeURIComponent, n = [], r = {};
for (var i in e) {
var s = e[i];
if (s != r[i]) {
var o = t(i) + "=";
if (enyo.isArray(s)) for (var u = 0; u < s.length; u++) n.push(o + t(s[u])); else n.push(o + t(s));
}
}
return n.join("&");
},
parseResponseHeaders: function(e) {
var t = {}, n = [];
e.getAllResponseHeaders && (n = e.getAllResponseHeaders().split(/\r?\n/));
for (var r = 0; r < n.length; r++) {
var i = n[r], s = i.indexOf(": ");
if (s > 0) {
var o = i.substring(0, s).toLowerCase(), u = i.substring(s + 2);
t[o] = u;
}
}
return t;
}
}
});

// Jsonp.js

enyo.kind({
name: "enyo.JsonpRequest",
kind: enyo.Async,
published: {
url: "",
charset: null,
callbackName: "callback",
cacheBust: !0
},
statics: {
nextCallbackID: 0
},
addScriptElement: function() {
var e = document.createElement("script");
e.src = this.src, e.async = "async", this.charset && (e.charset = this.charset), e.onerror = enyo.bind(this, function() {
this.fail(400);
});
var t = document.getElementsByTagName("script")[0];
t.parentNode.insertBefore(e, t), this.scriptTag = e;
},
removeScriptElement: function() {
var e = this.scriptTag;
this.scriptTag = null, e.onerror = null, e.parentNode && e.parentNode.removeChild(e);
},
constructor: function(e) {
enyo.mixin(this, e), this.inherited(arguments);
},
go: function(e) {
return this.startTimer(), this.jsonp(e), this;
},
jsonp: function(e) {
var t = "enyo_jsonp_callback_" + enyo.JsonpRequest.nextCallbackID++;
this.src = this.buildUrl(e, t), this.addScriptElement(), window[t] = enyo.bind(this, this.respond);
var n = enyo.bind(this, function() {
this.removeScriptElement(), window[t] = null;
});
this.response(n), this.error(n);
},
buildUrl: function(e, t) {
var n = this.url.split("?"), r = n.shift() || "", i = n.join("?").split("&"), s = this.bodyArgsFromParams(e, t);
return i.push(s), this.cacheBust && i.push(Math.random()), [ r, i.join("&") ].join("?");
},
bodyArgsFromParams: function(e, t) {
if (enyo.isString(e)) return e.replace("=?", "=" + t);
var n = enyo.mixin({}, e);
return n[this.callbackName] = t, enyo.Ajax.objectToQuery(n);
}
});

// WebService.js

enyo.kind({
name: "enyo._AjaxComponent",
kind: enyo.Component,
published: enyo.AjaxProperties
}), enyo.kind({
name: "enyo.WebService",
kind: enyo._AjaxComponent,
published: {
jsonp: !1,
callbackName: "callback",
charset: null,
timeout: 0
},
events: {
onResponse: "",
onError: ""
},
constructor: function(e) {
this.inherited(arguments);
},
send: function(e, t) {
return this.jsonp ? this.sendJsonp(e, t) : this.sendAjax(e, t);
},
sendJsonp: function(e, t) {
var n = new enyo.JsonpRequest;
for (var r in {
url: 1,
callbackName: 1,
charset: 1,
timeout: 1
}) n[r] = this[r];
return enyo.mixin(n, t), this.sendAsync(n, e);
},
sendAjax: function(e, t) {
var n = new enyo.Ajax(t);
for (var r in enyo.AjaxProperties) n[r] = this[r];
return n.timeout = this.timeout, enyo.mixin(n, t), this.sendAsync(n, e);
},
sendAsync: function(e, t) {
return e.go(t).response(this, "response").error(this, "error");
},
response: function(e, t) {
this.doResponse({
ajax: e,
data: t
});
},
error: function(e, t) {
this.doError({
ajax: e,
data: t
});
}
});

// dom.js

enyo.requiresWindow = function(e) {
e();
}, enyo.dom = {
byId: function(e, t) {
return typeof e == "string" ? (t || document).getElementById(e) : e;
},
escape: function(e) {
return e !== null ? String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
},
getBounds: function(e) {
return e ? {
left: e.offsetLeft,
top: e.offsetTop,
width: e.offsetWidth,
height: e.offsetHeight
} : null;
},
getComputedStyle: function(e) {
return window.getComputedStyle && e && window.getComputedStyle(e, null);
},
getComputedStyleValue: function(e, t, n) {
var r = n || this.getComputedStyle(e);
return r ? r.getPropertyValue(t) : null;
},
getFirstElementByTagName: function(e) {
var t = document.getElementsByTagName(e);
return t && t[0];
},
applyBodyFit: function() {
var e = this.getFirstElementByTagName("html");
e && (e.className += " enyo-document-fit");
var t = this.getFirstElementByTagName("body");
t && (t.className += " enyo-body-fit"), enyo.bodyIsFitting = !0;
},
getWindowWidth: function() {
return window.innerWidth ? window.innerWidth : document.body && document.body.offsetWidth ? document.body.offsetWidth : document.compatMode == "CSS1Compat" && document.documentElement && document.documentElement.offsetWidth ? document.documentElement.offsetWidth : 320;
},
getWindowHeight: function() {
return window.innerHeight ? window.innerHeight : document.body && document.body.offsetHeight ? document.body.offsetHeight : document.compatMode == "CSS1Compat" && document.documentElement && document.documentElement.offsetHeight ? document.documentElement.offsetHeight : 480;
},
_ieCssToPixelValue: function(e, t) {
var n = t, r = e.style, i = r.left, s = e.runtimeStyle && e.runtimeStyle.left;
return s && (e.runtimeStyle.left = e.currentStyle.left), r.left = n, n = r.pixelLeft, r.left = i, s && (r.runtimeStyle.left = s), n;
},
_pxMatch: /px/i,
getComputedBoxValue: function(e, t, n, r) {
var i = r || this.getComputedStyle(e);
if (i) return parseInt(i.getPropertyValue(t + "-" + n), 0);
if (e && e.currentStyle) {
var s = e.currentStyle[t + enyo.cap(n)];
return s.match(this._pxMatch) || (s = this._ieCssToPixelValue(e, s)), parseInt(s, 0);
}
return 0;
},
calcBoxExtents: function(e, t) {
var n = this.getComputedStyle(e);
return {
top: this.getComputedBoxValue(e, t, "top", n),
right: this.getComputedBoxValue(e, t, "right", n),
bottom: this.getComputedBoxValue(e, t, "bottom", n),
left: this.getComputedBoxValue(e, t, "left", n)
};
},
calcPaddingExtents: function(e) {
return this.calcBoxExtents(e, "padding");
},
calcMarginExtents: function(e) {
return this.calcBoxExtents(e, "margin");
},
calcNodePosition: function(e, t) {
var n = 0, r = 0, i = e, s = i.offsetWidth, o = i.offsetHeight, u = enyo.dom.getStyleTransformProp(), a = /translateX\((-?\d+)px\)/i, f = /translateY\((-?\d+)px\)/i, l = 0, c = 0, h = 0, p = 0;
t ? (h = t.offsetHeight, p = t.offsetWidth) : (h = document.body.parentNode.offsetHeight > this.getWindowHeight() ? this.getWindowHeight() - document.body.parentNode.scrollTop : document.body.parentNode.offsetHeight, p = document.body.parentNode.offsetWidth > this.getWindowWidth() ? this.getWindowWidth() - document.body.parentNode.scrollLeft : document.body.parentNode.offsetWidth);
if (i.offsetParent) do r += i.offsetLeft - (i.offsetParent ? i.offsetParent.scrollLeft : 0), u && a.test(i.style[u]) && (r += parseInt(i.style[u].replace(a, "$1"), 10)), n += i.offsetTop - (i.offsetParent ? i.offsetParent.scrollTop : 0), u && f.test(i.style[u]) && (n += parseInt(i.style[u].replace(f, "$1"), 10)), i !== e && (i.currentStyle ? (l = parseInt(i.currentStyle.borderLeftWidth, 10), c = parseInt(i.currentStyle.borderTopWidth, 10)) : window.getComputedStyle ? (l = parseInt(window.getComputedStyle(i, "").getPropertyValue("border-left-width"), 10), c = parseInt(window.getComputedStyle(i, "").getPropertyValue("border-top-width"), 10)) : (l = parseInt(i.style.borderLeftWidth, 10), c = parseInt(i.style.borderTopWidth, 10)), l && (r += l), c && (n += c)); while ((i = i.offsetParent) && i !== t);
return {
top: n,
left: r,
bottom: h - n - o,
right: p - r - s,
height: o,
width: s
};
},
setInnerHtml: function(e, t) {
enyo.execUnsafeLocalFunction(function() {
e.innerHTML = t;
});
}
};

// transform.js

(function() {
enyo.dom.calcCanAccelerate = function() {
if (enyo.platform.android <= 2) return !1;
var e = [ "perspective", "WebkitPerspective", "MozPerspective", "msPerspective", "OPerspective" ];
for (var t = 0, n; n = e[t]; t++) if (typeof document.body.style[n] != "undefined") return !0;
return !1;
};
var e = [ "transform", "-webkit-transform", "-moz-transform", "-ms-transform", "-o-transform" ], t = [ "transform", "webkitTransform", "MozTransform", "msTransform", "OTransform" ];
enyo.dom.getCssTransformProp = function() {
if (this._cssTransformProp) return this._cssTransformProp;
var n = enyo.indexOf(this.getStyleTransformProp(), t);
return this._cssTransformProp = e[n];
}, enyo.dom.getStyleTransformProp = function() {
if (this._styleTransformProp || !document.body) return this._styleTransformProp;
for (var e = 0, n; n = t[e]; e++) if (typeof document.body.style[n] != "undefined") return this._styleTransformProp = n;
}, enyo.dom.domTransformsToCss = function(e) {
var t, n, r = "";
for (t in e) n = e[t], n !== null && n !== undefined && n !== "" && (r += t + "(" + n + ") ");
return r;
}, enyo.dom.transformsToDom = function(e) {
var t = this.domTransformsToCss(e.domTransforms), n = e.hasNode() ? e.node.style : null, r = e.domStyles, i = this.getStyleTransformProp(), s = this.getCssTransformProp();
i && s && (r[s] = t, n ? n[i] = t : e.domStylesChanged());
}, enyo.dom.canTransform = function() {
return Boolean(this.getStyleTransformProp());
}, enyo.dom.canAccelerate = function() {
return this.accelerando !== undefined ? this.accelerando : document.body && (this.accelerando = this.calcCanAccelerate());
}, enyo.dom.transform = function(e, t) {
var n = e.domTransforms = e.domTransforms || {};
enyo.mixin(n, t), this.transformsToDom(e);
}, enyo.dom.transformValue = function(e, t, n) {
var r = e.domTransforms = e.domTransforms || {};
r[t] = n, this.transformsToDom(e);
}, enyo.dom.accelerate = function(e, t) {
var n = t == "auto" ? this.canAccelerate() : t;
this.transformValue(e, "translateZ", n ? 0 : null);
};
})();

// Control.js

enyo.kind({
name: "enyo.Control",
kind: enyo.UiComponent,
published: {
tag: "div",
attributes: null,
classes: "",
style: "",
content: "",
showing: !0,
allowHtml: !1,
src: "",
canGenerate: !0,
fit: null,
isContainer: !1,
controller: null
},
handlers: {
ontap: "tap"
},
defaultKind: "Control",
controlClasses: "",
node: null,
generated: !1,
initBindings: !1,
create: function() {
this.silence(), this.initStyles(), this.inherited(arguments), this.showingChanged(), this.addClass(this.kindClasses), this.addClass(this.classes), this.initProps([ "id", "content", "src", "controller" ]), this.initBindings = !0, this.setup(), this.unsilence();
},
destroy: function() {
this.controller && (this.controller.owner && this === this.controller.owner && this.controller.destroy(), this.controller = null), this.removeNodeFromDom(), enyo.Control.unregisterDomEvents(this.id), this.inherited(arguments);
},
importProps: function(e) {
this.inherited(arguments), this.attributes = enyo.mixin(enyo.clone(this.kindAttributes), this.attributes);
},
initProps: function(e) {
for (var t = 0, n, r; n = e[t]; t++) this[n] && (r = n + "Changed", this[r] && this[r]());
},
controllerChanged: function() {
this.findAndInstance("controller");
},
controllerFindAndInstance: function(e, t) {
if (!e && !t) return;
e ? t.set("owner", this) : t.addDispatchTarget(this), this.refreshBindings();
},
dispatchEvent: function(e, t, n) {
return this.controller && this.controller.dispatchEvent(e, t, n) ? !0 : this.strictlyInternalEvents[e] && this.isInternalEvent(t) ? !0 : this.inherited(arguments);
},
dispatch: function(e, t, n) {
var r = this.controller;
return r && r[e] && enyo.isFunction(r[e]) ? r[e].call(r, n || this, t) : this.inherited(arguments);
},
classesChanged: function(e) {
this.removeClass(e), this.addClass(this.classes);
},
addChild: function(e) {
e.addClass(this.controlClasses), this.inherited(arguments);
},
removeChild: function(e) {
this.inherited(arguments), e.removeClass(this.controlClasses);
},
strictlyInternalEvents: {
onenter: 1,
onleave: 1
},
isInternalEvent: function(e) {
var t = enyo.dispatcher.findDispatchTarget(e.relatedTarget);
return t && t.isDescendantOf(this);
},
hasNode: function() {
return this.generated && (this.node || this.findNodeById());
},
addContent: function(e) {
this.setContent(this.get("content") + e);
},
getAttribute: function(e) {
return this.hasNode() ? this.node.getAttribute(e) : this.attributes[e];
},
setAttribute: function(e, t) {
this.attributes[e] = t, this.hasNode() && this.attributeToNode(e, t), this.invalidateTags();
},
getNodeProperty: function(e, t) {
return this.hasNode() ? this.node[e] : t;
},
setNodeProperty: function(e, t) {
this.hasNode() && (this.node[e] = t);
},
setClassAttribute: function(e) {
this.setAttribute("class", e);
},
getClassAttribute: function() {
return this.attributes["class"] || "";
},
hasClass: function(e) {
return e && (" " + this.getClassAttribute() + " ").indexOf(" " + e + " ") >= 0;
},
addClass: function(e) {
if (e && !this.hasClass(e)) {
var t = this.getClassAttribute();
this.setClassAttribute(t + (t ? " " : "") + e);
}
},
removeClass: function(e) {
if (e && this.hasClass(e)) {
var t = this.getClassAttribute();
t = (" " + t + " ").replace(" " + e + " ", " ").slice(1, -1), this.setClassAttribute(t);
}
},
addRemoveClass: function(e, t) {
this[t ? "addClass" : "removeClass"](e);
},
initStyles: function() {
this.domStyles = this.domStyles || {}, enyo.Control.cssTextToDomStyles(this.kindStyle, this.domStyles), this.domCssText = enyo.Control.domStylesToCssText(this.domStyles);
},
styleChanged: function() {
this.invalidateTags(), this.renderStyles();
},
applyStyle: function(e, t) {
this.domStyles[e] = t, this.domStylesChanged();
},
addStyles: function(e) {
enyo.Control.cssTextToDomStyles(e, this.domStyles), this.domStylesChanged();
},
getComputedStyleValue: function(e, t) {
return this.hasNode() ? enyo.dom.getComputedStyleValue(this.node, e) : t;
},
domStylesChanged: function() {
this.domCssText = enyo.Control.domStylesToCssText(this.domStyles), this.invalidateTags(), this.renderStyles();
},
stylesToNode: function() {
this.node.style.cssText = this.style + (this.style[this.style.length - 1] == ";" ? " " : "; ") + this.domCssText;
},
setupBodyFitting: function() {
enyo.dom.applyBodyFit(), this.addClass("enyo-fit enyo-clip");
},
setupOverflowScrolling: function() {
if (enyo.platform.android || enyo.platform.androidChrome || enyo.platform.blackberry) return;
document.getElementsByTagName("body")[0].className += " webkitOverflowScrolling";
},
render: function() {
if (this.parent) {
this.parent.beforeChildRender(this);
if (!this.parent.generated) return this;
}
return this.hasNode() || this.renderNode(), this.hasNode() && (this.renderDom(), this.generated && this.rendered()), this;
},
renderInto: function(e) {
this.teardownRender();
var t = enyo.dom.byId(e), n = enyo.exists(this.fit) && this.fit === !1;
return t == document.body && !n ? this.setupBodyFitting() : this.fit && this.addClass("enyo-fit enyo-clip"), this.addClass("enyo-no-touch-action"), this.setupOverflowScrolling(), enyo.dom.setInnerHtml(t, this.generateHtml()), this.generated && this.rendered(), this;
},
write: function() {
return this.fit && this.setupBodyFitting(), this.addClass("enyo-no-touch-action"), this.setupOverflowScrolling(), document.write(this.generateHtml()), this.generated && this.rendered(), this;
},
rendered: function() {
this.reflow();
for (var e = 0, t; t = this.children[e]; e++) t.generated && t.rendered();
},
show: function() {
this.setShowing(!0);
},
hide: function() {
this.setShowing(!1);
},
getBounds: function() {
var e = this.node || this.hasNode(), t = enyo.dom.getBounds(e);
return t || {
left: undefined,
top: undefined,
width: undefined,
height: undefined
};
},
setBounds: function(e, t) {
var n = this.domStyles, r = t || "px", i = [ "width", "height", "left", "top", "right", "bottom" ];
for (var s = 0, o, u; u = i[s]; s++) {
o = e[u];
if (o || o === 0) n[u] = o + (enyo.isString(o) ? "" : r);
}
this.domStylesChanged();
},
findNodeById: function() {
return this.id && (this.node = enyo.dom.byId(this.id));
},
idChanged: function(e) {
e && enyo.Control.unregisterDomEvents(e), this.setAttribute("id", this.id), this.id && enyo.Control.registerDomEvents(this.id, this);
},
contentChanged: function() {
this.hasNode() && this.renderContent();
},
getSrc: function() {
return this.getAttribute("src");
},
srcChanged: function() {
if (!this.src) return;
this.setAttribute("src", enyo.path.rewrite(this.src));
},
attributesChanged: function() {
this.invalidateTags(), this.renderAttributes();
},
generateHtml: function() {
if (this.canGenerate === !1) return "";
var e = this.generateInnerHtml(), t = this.generateOuterHtml(e);
return this.generated = !0, t;
},
generateInnerHtml: function() {
return this.flow(), this.children.length ? this.generateChildHtml() : this.allowHtml ? this.get("content") : enyo.Control.escapeHtml(this.get("content"));
},
generateChildHtml: function() {
var e = "";
for (var t = 0, n; n = this.children[t]; t++) {
var r = n.generateHtml();
e += r;
}
return e;
},
generateOuterHtml: function(e) {
return this.tag ? (this.tagsValid || this.prepareTags(), this._openTag + e + this._closeTag) : e;
},
invalidateTags: function() {
this.tagsValid = !1;
},
prepareTags: function() {
var e = this.domCssText + this.style;
this._openTag = "<" + this.tag + (e ? ' style="' + e + '"' : "") + enyo.Control.attributesToHtml(this.attributes), enyo.Control.selfClosing[this.tag] ? (this._openTag += "/>", this._closeTag = "") : (this._openTag += ">", this._closeTag = "</" + this.tag + ">"), this.tagsValid = !0;
},
attributeToNode: function(e, t) {
t === null || t === !1 || t === "" ? this.node.removeAttribute(e) : this.node.setAttribute(e, t);
},
attributesToNode: function() {
for (var e in this.attributes) this.attributeToNode(e, this.attributes[e]);
},
getParentNode: function() {
return this.parentNode || this.parent && (this.parent.hasNode() || this.parent.getParentNode());
},
addNodeToParent: function() {
if (this.node) {
var e = this.getParentNode();
e && (this.addBefore !== undefined ? this.insertNodeInParent(e, this.addBefore && this.addBefore.hasNode()) : this.appendNodeToParent(e));
}
},
appendNodeToParent: function(e) {
e.appendChild(this.node);
},
insertNodeInParent: function(e, t) {
e.insertBefore(this.node, t || e.firstChild);
},
removeNodeFromDom: function() {
this.hasNode() && this.node.parentNode && this.node.parentNode.removeChild(this.node);
},
teardownRender: function() {
this.generated && this.teardownChildren(), this.node = null, this.generated = !1;
},
teardownChildren: function() {
for (var e = 0, t; t = this.children[e]; e++) t.teardownRender();
},
renderNode: function() {
this.teardownRender(), this.node = document.createElement(this.tag), this.addNodeToParent(), this.generated = !0;
},
renderDom: function() {
this.renderAttributes(), this.renderStyles(), this.renderContent();
},
renderContent: function() {
this.generated && this.teardownChildren(), enyo.dom.setInnerHtml(this.node, this.generateInnerHtml());
},
renderStyles: function() {
this.hasNode() && this.stylesToNode();
},
renderAttributes: function() {
this.hasNode() && this.attributesToNode();
},
beforeChildRender: function() {
this.generated && this.flow();
},
syncDisplayToShowing: function() {
var e = this.domStyles;
this.showing ? e.display == "none" && this.applyStyle("display", this._displayStyle || "") : (this._displayStyle = e.display == "none" ? "" : e.display, this.applyStyle("display", "none"));
},
showingChanged: function() {
this.syncDisplayToShowing();
},
getShowing: function() {
return this.showing = this.domStyles.display != "none";
},
fitChanged: function(e) {
this.parent.reflow();
},
statics: {
escapeHtml: function(e) {
return e != null ? String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
},
registerDomEvents: function(e, t) {
enyo.$[e] = t;
},
unregisterDomEvents: function(e) {
enyo.$[e] = null;
},
selfClosing: {
img: 1,
hr: 1,
br: 1,
area: 1,
base: 1,
basefont: 1,
input: 1,
link: 1,
meta: 1,
command: 1,
embed: 1,
keygen: 1,
wbr: 1,
param: 1,
source: 1,
track: 1,
col: 1
},
cssTextToDomStyles: function(e, t) {
if (e) {
var n = e.replace(/; /g, ";").split(";");
for (var r = 0, i, s, o, u; u = n[r]; r++) i = u.split(":"), s = i.shift(), o = i.join(":"), t[s] = o;
}
},
domStylesToCssText: function(e) {
var t, n, r = "";
for (t in e) n = e[t], n !== null && n !== undefined && n !== "" && (r += t + ":" + n + ";");
return r;
},
stylesToHtml: function(e) {
var t = enyo.Control.domStylesToCssText(e);
return t ? ' style="' + t + '"' : "";
},
escapeAttribute: function(e) {
return enyo.isString(e) ? String(e).replace(/&/g, "&amp;").replace(/\"/g, "&quot;") : e;
},
attributesToHtml: function(e) {
var t, n, r = "";
for (t in e) n = e[t], n !== null && n !== !1 && n !== "" && (r += " " + t + '="' + enyo.Control.escapeAttribute(n) + '"');
return r;
}
}
}), enyo.defaultCtor = enyo.Control, enyo.Control.subclass = function(e, t) {
var n = e.prototype;
if (n.classes) {
var r = n.kindClasses;
n.kindClasses = (r ? r + " " : "") + n.classes, n.classes = "";
}
if (n.style) {
var i = n.kindStyle;
n.kindStyle = (i ? i + ";" : "") + n.style, n.style = "";
}
if (t.attributes) {
var s = n.kindAttributes;
n.kindAttributes = enyo.mixin(enyo.clone(s), n.attributes), n.attributes = null;
}
}, enyo.View = enyo.Control;

// platform.js

enyo.platform = {
touch: Boolean("ontouchstart" in window || window.navigator.msMaxTouchPoints),
gesture: Boolean("ongesturestart" in window || window.navigator.msMaxTouchPoints)
}, function() {
var e = navigator.userAgent, t = enyo.platform, n = [ {
platform: "androidChrome",
regex: /Android .* Chrome\/(\d+)[.\d]+/
}, {
platform: "android",
regex: /Android (\d+)/
}, {
platform: "android",
regex: /Silk\/1./,
forceVersion: 2,
extra: {
silk: 1
}
}, {
platform: "android",
regex: /Silk\/2./,
forceVersion: 4,
extra: {
silk: 2
}
}, {
platform: "ie",
regex: /MSIE (\d+)/
}, {
platform: "ios",
regex: /iP(?:hone|ad;(?: U;)? CPU) OS (\d+)/
}, {
platform: "webos",
regex: /(?:web|hpw)OS\/(\d+)/
}, {
platform: "safari",
regex: /Version\/(\d+)[.\d]+\s+Safari/
}, {
platform: "chrome",
regex: /Chrome\/(\d+)[.\d]+/
}, {
platform: "androidFirefox",
regex: /Android;.*Firefox\/(\d+)/
}, {
platform: "firefoxOS",
regex: /Mobile;.*Firefox\/(\d+)/
}, {
platform: "firefox",
regex: /Firefox\/(\d+)/
}, {
platform: "blackberry",
regex: /BB1\d;.*Version\/(\d+\.\d+)/
} ];
for (var r = 0, i, s, o; i = n[r]; r++) {
s = i.regex.exec(e);
if (s) {
i.forceVersion ? o = i.forceVersion : o = Number(s[1]), t[i.platform] = o, i.extra && enyo.mixin(t, i.extra);
break;
}
}
enyo.dumbConsole = Boolean(t.android || t.ios || t.webos);
}();

// animation.js

(function() {
var e = Math.round(1e3 / 60), t = [ "webkit", "moz", "ms", "o", "" ], n = "requestAnimationFrame", r = "cancel" + enyo.cap(n), i = function(t) {
return window.setTimeout(t, e);
}, s = function(e) {
return window.clearTimeout(e);
};
for (var o = 0, u = t.length, a, f, l; (a = t[o]) || o < u; o++) {
if (enyo.platform.ios >= 6) break;
f = a ? a + enyo.cap(r) : r, l = a ? a + enyo.cap(n) : n;
if (window[f]) {
s = window[f], i = window[l], a == "webkit" && s(i(enyo.nop));
break;
}
}
enyo.requestAnimationFrame = function(e, t) {
return i(e, t);
}, enyo.cancelRequestAnimationFrame = function(e) {
return s(e);
};
})(), enyo.easing = {
cubicIn: function(e) {
return Math.pow(e, 3);
},
cubicOut: function(e) {
return Math.pow(e - 1, 3) + 1;
},
expoOut: function(e) {
return e == 1 ? 1 : -1 * Math.pow(2, -10 * e) + 1;
},
quadInOut: function(e) {
return e *= 2, e < 1 ? Math.pow(e, 2) / 2 : -1 * (--e * (e - 2) - 1) / 2;
},
linear: function(e) {
return e;
}
}, enyo.easedLerp = function(e, t, n, r) {
var i = (enyo.now() - e) / t;
return r ? i >= 1 ? 0 : 1 - n(1 - i) : i >= 1 ? 1 : n(i);
};

// phonegap.js

(function() {
if (window.cordova || window.PhoneGap) {
var e = [ "deviceready", "pause", "resume", "online", "offline", "backbutton", "batterycritical", "batterylow", "batterystatus", "menubutton", "searchbutton", "startcallbutton", "endcallbutton", "volumedownbutton", "volumeupbutton" ];
for (var t = 0, n; n = e[t]; t++) document.addEventListener(n, enyo.bind(enyo.Signals, "send", "on" + n), !1);
}
})();

// dispatcher.js

enyo.$ = {}, enyo.dispatcher = {
events: [ "mousedown", "mouseup", "mouseover", "mouseout", "mousemove", "mousewheel", "click", "dblclick", "change", "keydown", "keyup", "keypress", "input" ],
windowEvents: [ "resize", "load", "unload", "message", "hashchange" ],
cssEvents: [ "webkitTransitionEnd", "transitionend" ],
features: [],
connect: function() {
var e = enyo.dispatcher, t, n;
for (t = 0; n = e.events[t]; t++) e.listen(document, n);
for (t = 0; n = e.cssEvents[t]; t++) e.listen(document, n);
for (t = 0; n = e.windowEvents[t]; t++) {
if (n === "unload" && typeof window.chrome == "object" && window.chrome.app) continue;
e.listen(window, n);
}
for (t = 0; n = e.cssEvents[t]; t++) e.listen(document, n);
},
listen: function(e, t, n) {
var r = enyo.dispatch;
e.addEventListener ? this.listen = function(e, t, n) {
e.addEventListener(t, n || r, !1);
} : this.listen = function(e, t, n) {
e.attachEvent("on" + t, function(e) {
return e.target = e.srcElement, e.preventDefault || (e.preventDefault = enyo.iePreventDefault), (n || r)(e);
});
}, this.listen(e, t, n);
},
dispatch: function(e) {
var t = this.findDispatchTarget(e.target) || this.findDefaultTarget(e);
e.dispatchTarget = t;
for (var n = 0, r; r = this.features[n]; n++) if (r.call(this, e) === !0) return;
t && !e.preventDispatch && this.dispatchBubble(e, t);
},
findDispatchTarget: function(e) {
var t, n = e;
try {
while (n) {
if (t = enyo.$[n.id]) {
t.eventNode = n;
break;
}
n = n.parentNode;
}
} catch (r) {
enyo.log(r, n);
}
return t;
},
findDefaultTarget: function(e) {
return enyo.master;
},
dispatchBubble: function(e, t) {
return t.bubble("on" + e.type, e, t);
}
}, enyo.iePreventDefault = function() {
try {
this.returnValue = !1;
} catch (e) {}
}, enyo.dispatch = function(e) {
return enyo.dispatcher.dispatch(e);
}, enyo.bubble = function(e) {
var t = e || window.event;
t && (t.target || (t.target = t.srcElement), enyo.dispatch(t));
}, enyo.bubbler = "enyo.bubble(arguments[0])", function() {
var e = function() {
enyo.bubble(arguments[0]);
};
enyo.makeBubble = function() {
var t = Array.prototype.slice.call(arguments, 0), n = t.shift();
typeof n == "object" && typeof n.hasNode == "function" && enyo.forEach(t, function(t) {
this.hasNode() && enyo.dispatcher.listen(this.node, t, e);
}, n);
};
}(), enyo.requiresWindow(enyo.dispatcher.connect), enyo.dispatcher.features.push(function(e) {
if ("click" === e.type && e.clientX === 0 && e.clientY === 0) {
var t = enyo.clone(e);
t.type = "tap", enyo.dispatch(t);
}
});

// preview.js

(function() {
var e = "previewDomEvent", t = {
feature: function(e) {
t.dispatch(e, e.dispatchTarget);
},
dispatch: function(t, n) {
var r = this.buildLineage(n);
for (var i = 0, s; s = r[i]; i++) if (s[e] && s[e](t) === !0) {
t.preventDispatch = !0;
return;
}
},
buildLineage: function(e) {
var t = [], n = e;
while (n) t.unshift(n), n = n.parent;
return t;
}
};
enyo.dispatcher.features.push(t.feature);
})();

// modal.js

enyo.dispatcher.features.push(function(e) {
var t = e.dispatchTarget, n = this.captureTarget && !this.noCaptureEvents[e.type], r = n && !(t && t.isDescendantOf && t.isDescendantOf(this.captureTarget));
if (r) {
var i = e.captureTarget = this.captureTarget, s = this.autoForwardEvents[e.type] || this.forwardEvents;
this.dispatchBubble(e, i), s || (e.preventDispatch = !0);
}
}), enyo.mixin(enyo.dispatcher, {
noCaptureEvents: {
load: 1,
unload: 1,
error: 1
},
autoForwardEvents: {
leave: 1,
resize: 1
},
captures: [],
capture: function(e, t) {
var n = {
target: e,
forward: t
};
this.captures.push(n), this.setCaptureInfo(n);
},
release: function() {
this.captures.pop(), this.setCaptureInfo(this.captures[this.captures.length - 1]);
},
setCaptureInfo: function(e) {
this.captureTarget = e && e.target, this.forwardEvents = e && e.forward;
}
});

// gesture.js

enyo.gesture = {
eventProps: [ "target", "relatedTarget", "clientX", "clientY", "pageX", "pageY", "screenX", "screenY", "altKey", "ctrlKey", "metaKey", "shiftKey", "detail", "identifier", "dispatchTarget", "which", "srcEvent" ],
makeEvent: function(e, t) {
var n = {
type: e
};
for (var r = 0, i; i = this.eventProps[r]; r++) n[i] = t[i];
n.srcEvent = n.srcEvent || t, n.preventDefault = this.preventDefault, n.disablePrevention = this.disablePrevention;
if (enyo.platform.ie < 10) {
enyo.platform.ie == 8 && n.target && (n.pageX = n.clientX + n.target.scrollLeft, n.pageY = n.clientY + n.target.scrollTop);
var s = window.event && window.event.button;
n.which = s & 1 ? 1 : s & 2 ? 2 : s & 4 ? 3 : 0;
} else (enyo.platform.webos || window.PalmSystem) && n.which === 0 && (n.which = 1);
return n;
},
down: function(e) {
var t = this.makeEvent("down", e);
enyo.dispatch(t), this.downEvent = t;
},
move: function(e) {
var t = this.makeEvent("move", e);
t.dx = t.dy = t.horizontal = t.vertical = 0, t.which && this.downEvent && (t.dx = e.clientX - this.downEvent.clientX, t.dy = e.clientY - this.downEvent.clientY, t.horizontal = Math.abs(t.dx) > Math.abs(t.dy), t.vertical = !t.horizontal), enyo.dispatch(t);
},
up: function(e) {
var t = this.makeEvent("up", e), n = !1;
t.preventTap = function() {
n = !0;
}, enyo.dispatch(t), !n && this.downEvent && this.downEvent.which == 1 && this.sendTap(t), this.downEvent = null;
},
over: function(e) {
enyo.dispatch(this.makeEvent("enter", e));
},
out: function(e) {
enyo.dispatch(this.makeEvent("leave", e));
},
sendTap: function(e) {
var t = this.findCommonAncestor(this.downEvent.target, e.target);
if (t) {
var n = this.makeEvent("tap", e);
n.target = t, enyo.dispatch(n);
}
},
findCommonAncestor: function(e, t) {
var n = t;
while (n) {
if (this.isTargetDescendantOf(e, n)) return n;
n = n.parentNode;
}
},
isTargetDescendantOf: function(e, t) {
var n = e;
while (n) {
if (n == t) return !0;
n = n.parentNode;
}
}
}, enyo.gesture.preventDefault = function() {
this.srcEvent && this.srcEvent.preventDefault();
}, enyo.gesture.disablePrevention = function() {
this.preventDefault = enyo.nop, this.srcEvent && (this.srcEvent.preventDefault = enyo.nop);
}, enyo.dispatcher.features.push(function(e) {
if (enyo.gesture.events[e.type]) return enyo.gesture.events[e.type](e);
}), enyo.gesture.events = {
mousedown: function(e) {
enyo.gesture.down(e);
},
mouseup: function(e) {
enyo.gesture.up(e);
},
mousemove: function(e) {
enyo.gesture.move(e);
},
mouseover: function(e) {
enyo.gesture.over(e);
},
mouseout: function(e) {
enyo.gesture.out(e);
}
}, enyo.requiresWindow(function() {
document.addEventListener && document.addEventListener("DOMMouseScroll", function(e) {
var t = enyo.clone(e);
t.preventDefault = function() {
e.preventDefault();
}, t.type = "mousewheel";
var n = t.VERTICAL_AXIS == t.axis ? "wheelDeltaY" : "wheelDeltaX";
t[n] = t.detail * -40, enyo.dispatch(t);
}, !1);
});

// drag.js

enyo.dispatcher.features.push(function(e) {
if (enyo.gesture.drag[e.type]) return enyo.gesture.drag[e.type](e);
}), enyo.gesture.drag = {
hysteresisSquared: 16,
holdPulseDelay: 200,
trackCount: 5,
minFlick: .1,
minTrack: 8,
down: function(e) {
this.stopDragging(e), this.cancelHold(), this.target = e.target, this.startTracking(e), this.beginHold(e);
},
move: function(e) {
if (this.tracking) {
this.track(e);
if (!e.which) {
this.stopDragging(e), this.cancelHold(), this.tracking = !1;
return;
}
this.dragEvent ? this.sendDrag(e) : this.dy * this.dy + this.dx * this.dx >= this.hysteresisSquared && (this.sendDragStart(e), this.cancelHold());
}
},
up: function(e) {
this.endTracking(e), this.stopDragging(e), this.cancelHold();
},
leave: function(e) {
this.dragEvent && this.sendDragOut(e);
},
stopDragging: function(e) {
if (this.dragEvent) {
this.sendDrop(e);
var t = this.sendDragFinish(e);
return this.dragEvent = null, t;
}
},
makeDragEvent: function(e, t, n, r) {
var i = Math.abs(this.dx), s = Math.abs(this.dy), o = i > s, u = (o ? s / i : i / s) < .414, a = {
type: e,
dx: this.dx,
dy: this.dy,
ddx: this.dx - this.lastDx,
ddy: this.dy - this.lastDy,
xDirection: this.xDirection,
yDirection: this.yDirection,
pageX: n.pageX,
pageY: n.pageY,
clientX: n.clientX,
clientY: n.clientY,
horizontal: o,
vertical: !o,
lockable: u,
target: t,
dragInfo: r,
ctrlKey: n.ctrlKey,
altKey: n.altKey,
metaKey: n.metaKey,
shiftKey: n.shiftKey,
srcEvent: n.srcEvent
};
return enyo.platform.ie == 8 && a.target && (a.pageX = a.clientX + a.target.scrollLeft, a.pageY = a.clientY + a.target.scrollTop), a.preventDefault = enyo.gesture.preventDefault, a.disablePrevention = enyo.gesture.disablePrevention, a;
},
sendDragStart: function(e) {
this.dragEvent = this.makeDragEvent("dragstart", this.target, e), enyo.dispatch(this.dragEvent);
},
sendDrag: function(e) {
var t = this.makeDragEvent("dragover", e.target, e, this.dragEvent.dragInfo);
enyo.dispatch(t), t.type = "drag", t.target = this.dragEvent.target, enyo.dispatch(t);
},
sendDragFinish: function(e) {
var t = this.makeDragEvent("dragfinish", this.dragEvent.target, e, this.dragEvent.dragInfo);
t.preventTap = function() {
e.preventTap && e.preventTap();
}, enyo.dispatch(t);
},
sendDragOut: function(e) {
var t = this.makeDragEvent("dragout", e.target, e, this.dragEvent.dragInfo);
enyo.dispatch(t);
},
sendDrop: function(e) {
var t = this.makeDragEvent("drop", e.target, e, this.dragEvent.dragInfo);
t.preventTap = function() {
e.preventTap && e.preventTap();
}, enyo.dispatch(t);
},
startTracking: function(e) {
this.tracking = !0, this.px0 = e.clientX, this.py0 = e.clientY, this.flickInfo = {
startEvent: e,
moves: []
}, this.track(e);
},
track: function(e) {
this.lastDx = this.dx, this.lastDy = this.dy, this.dx = e.clientX - this.px0, this.dy = e.clientY - this.py0, this.xDirection = this.calcDirection(this.dx - this.lastDx, 0), this.yDirection = this.calcDirection(this.dy - this.lastDy, 0);
var t = this.flickInfo;
t.moves.push({
x: e.clientX,
y: e.clientY,
t: enyo.now()
}), t.moves.length > this.trackCount && t.moves.shift();
},
endTracking: function(e) {
this.tracking = !1;
var t = this.flickInfo, n = t && t.moves;
if (n && n.length > 1) {
var r = n[n.length - 1], i = enyo.now();
for (var s = n.length - 2, o = 0, u = 0, a = 0, f = 0, l = 0, c = 0, h = 0, p; p = n[s]; s--) {
o = i - p.t, u = (r.x - p.x) / o, a = (r.y - p.y) / o, c = c || (u < 0 ? -1 : u > 0 ? 1 : 0), h = h || (a < 0 ? -1 : a > 0 ? 1 : 0);
if (u * c > f * c || a * h > l * h) f = u, l = a;
}
var d = Math.sqrt(f * f + l * l);
d > this.minFlick && this.sendFlick(t.startEvent, f, l, d);
}
this.flickInfo = null;
},
calcDirection: function(e, t) {
return e > 0 ? 1 : e < 0 ? -1 : t;
},
beginHold: function(e) {
this.holdStart = enyo.now(), this.holdJob = setInterval(enyo.bind(this, "sendHoldPulse", e), this.holdPulseDelay);
},
cancelHold: function() {
clearInterval(this.holdJob), this.holdJob = null, this.sentHold && (this.sentHold = !1, this.sendRelease(this.holdEvent));
},
sendHoldPulse: function(e) {
this.sentHold || (this.sentHold = !0, this.sendHold(e));
var t = enyo.gesture.makeEvent("holdpulse", e);
t.holdTime = enyo.now() - this.holdStart, enyo.dispatch(t);
},
sendHold: function(e) {
this.holdEvent = e;
var t = enyo.gesture.makeEvent("hold", e);
enyo.dispatch(t);
},
sendRelease: function(e) {
var t = enyo.gesture.makeEvent("release", e);
enyo.dispatch(t);
},
sendFlick: function(e, t, n, r) {
var i = enyo.gesture.makeEvent("flick", e);
i.xVelocity = t, i.yVelocity = n, i.velocity = r, enyo.dispatch(i);
}
};

// transition.js

enyo.dom.transition = enyo.platform.ios || enyo.platform.android || enyo.platform.chrome || enyo.platform.androidChrome || enyo.platform.safari ? "-webkit-transition" : enyo.platform.firefox || enyo.platform.firefoxOS || enyo.platform.androidFirefox ? "-moz-transition" : "transition";

// touch.js

enyo.requiresWindow(function() {
var e = enyo.gesture, t = e.events;
e.events.touchstart = function(t) {
e.events = n, e.events.touchstart(t);
};
var n = {
_touchCount: 0,
touchstart: function(t) {
this._touchCount += t.changedTouches.length, this.excludedTarget = null;
var n = this.makeEvent(t);
e.down(n), n = this.makeEvent(t), this.overEvent = n, e.over(n);
},
touchmove: function(t) {
enyo.job.stop("resetGestureEvents");
var n = e.drag.dragEvent;
this.excludedTarget = n && n.dragInfo && n.dragInfo.node;
var r = this.makeEvent(t);
e.move(r), enyo.bodyIsFitting && t.preventDefault(), this.overEvent && this.overEvent.target != r.target && (this.overEvent.relatedTarget = r.target, r.relatedTarget = this.overEvent.target, e.out(this.overEvent), e.over(r)), this.overEvent = r;
},
touchend: function(t) {
e.up(this.makeEvent(t)), e.out(this.overEvent), this._touchCount -= t.changedTouches.length;
},
mouseup: function(n) {
this._touchCount === 0 && (this.sawMousedown = !1, e.events = t);
},
makeEvent: function(e) {
var t = enyo.clone(e.changedTouches[0]);
return t.srcEvent = e, t.target = this.findTarget(t), t.which = 1, t;
},
calcNodeOffset: function(e) {
if (e.getBoundingClientRect) {
var t = e.getBoundingClientRect();
return {
left: t.left,
top: t.top,
width: t.width,
height: t.height
};
}
},
findTarget: function(e) {
return document.elementFromPoint(e.clientX, e.clientY);
},
findTargetTraverse: function(e, t, n) {
var r = e || document.body, i = this.calcNodeOffset(r);
if (i && r != this.excludedTarget) {
var s = t - i.left, o = n - i.top;
if (s > 0 && o > 0 && s <= i.width && o <= i.height) {
var u;
for (var a = r.childNodes, f = a.length - 1, l; l = a[f]; f--) {
u = this.findTargetTraverse(l, t, n);
if (u) return u;
}
return r;
}
}
},
connect: function() {
enyo.forEach([ "ontouchstart", "ontouchmove", "ontouchend", "ongesturestart", "ongesturechange", "ongestureend" ], function(e) {
document[e] = enyo.dispatch;
}), enyo.platform.androidChrome <= 18 || enyo.platform.silk === 2 ? this.findTarget = function(e) {
return document.elementFromPoint(e.screenX, e.screenY);
} : document.elementFromPoint || (this.findTarget = function(e) {
return this.findTargetTraverse(null, e.clientX, e.clientY);
});
}
};
n.connect();
});

// msevents.js

(function() {
var e = enyo.gesture;
if (window.navigator.msPointerEnabled) {
var t = [ "MSPointerDown", "MSPointerUp", "MSPointerMove", "MSPointerOver", "MSPointerOut", "MSPointerCancel", "MSGestureTap", "MSGestureDoubleTap", "MSGestureHold", "MSGestureStart", "MSGestureChange", "MSGestureEnd" ];
enyo.forEach(t, function(e) {
enyo.dispatcher.listen(document, e);
}), enyo.dispatcher.features.push(function(e) {
i[e.type] && e.isPrimary && i[e.type](e);
}), enyo.gesture.events = {};
}
var n = function(t, n) {
var r = enyo.clone(n);
return enyo.mixin(r, {
pageX: n.translationX || 0,
pageY: n.translationY || 0,
rotation: n.rotation * (180 / Math.PI) || 0,
type: t,
srcEvent: n,
preventDefault: e.preventDefault,
disablePrevention: e.disablePrevention
});
}, r = function(e) {
var t = enyo.clone(e);
return t.srcEvent = e, t.which = 1, t;
}, i = {
MSPointerDown: function(t) {
var n = r(t);
e.down(n);
},
MSPointerUp: function(t) {
var n = r(t);
e.up(n);
},
MSPointerMove: function(t) {
var n = r(t);
e.move(n);
},
MSPointerCancel: function(t) {
var n = r(t);
e.up(n);
},
MSPointerOver: function(t) {
var n = r(t);
e.over(n);
},
MSPointerOut: function(t) {
var n = r(t);
e.out(n);
}
};
})();

// gesture.js

(function() {
!enyo.platform.gesture && enyo.platform.touch && enyo.dispatcher.features.push(function(n) {
e[n.type] && t[n.type](n);
});
var e = {
touchstart: !0,
touchmove: !0,
touchend: !0
}, t = {
orderedTouches: [],
gesture: null,
touchstart: function(e) {
enyo.forEach(e.changedTouches, function(e) {
var t = e.identifier;
enyo.indexOf(t, this.orderedTouches) < 0 && this.orderedTouches.push(t);
}, this);
if (e.touches.length >= 2 && !this.gesture) {
var t = this.gesturePositions(e);
this.gesture = this.gestureVector(t), this.gesture.angle = this.gestureAngle(t), this.gesture.scale = 1, this.gesture.rotation = 0;
var n = this.makeGesture("gesturestart", e, {
vector: this.gesture,
scale: 1,
rotation: 0
});
enyo.dispatch(n);
}
},
touchend: function(e) {
enyo.forEach(e.changedTouches, function(e) {
enyo.remove(e.identifier, this.orderedTouches);
}, this);
if (e.touches.length <= 1 && this.gesture) {
var t = e.touches[0] || e.changedTouches[e.changedTouches.length - 1];
enyo.dispatch(this.makeGesture("gestureend", e, {
vector: {
xcenter: t.pageX,
ycenter: t.pageY
},
scale: this.gesture.scale,
rotation: this.gesture.rotation
})), this.gesture = null;
}
},
touchmove: function(e) {
if (this.gesture) {
var t = this.makeGesture("gesturechange", e);
this.gesture.scale = t.scale, this.gesture.rotation = t.rotation, enyo.dispatch(t);
}
},
findIdentifiedTouch: function(e, t) {
for (var n = 0, r; r = e[n]; n++) if (r.identifier === t) return r;
},
gesturePositions: function(e) {
var t = this.findIdentifiedTouch(e.touches, this.orderedTouches[0]), n = this.findIdentifiedTouch(e.touches, this.orderedTouches[this.orderedTouches.length - 1]), r = t.pageX, i = n.pageX, s = t.pageY, o = n.pageY, u = i - r, a = o - s, f = Math.sqrt(u * u + a * a);
return {
x: u,
y: a,
h: f,
fx: r,
lx: i,
fy: s,
ly: o
};
},
gestureAngle: function(e) {
var t = e, n = Math.asin(t.y / t.h) * (180 / Math.PI);
return t.x < 0 && (n = 180 - n), t.x > 0 && t.y < 0 && (n += 360), n;
},
gestureVector: function(e) {
var t = e;
return {
magnitude: t.h,
xcenter: Math.abs(Math.round(t.fx + t.x / 2)),
ycenter: Math.abs(Math.round(t.fy + t.y / 2))
};
},
makeGesture: function(e, t, n) {
var r, i, s;
if (n) r = n.vector, i = n.scale, s = n.rotation; else {
var o = this.gesturePositions(t);
r = this.gestureVector(o), i = r.magnitude / this.gesture.magnitude, s = (360 + this.gestureAngle(o) - this.gesture.angle) % 360;
}
var u = enyo.clone(t);
return enyo.mixin(u, {
type: e,
scale: i,
pageX: r.xcenter,
pageY: r.ycenter,
rotation: s
});
}
};
})();

// ScrollMath.js

enyo.kind({
name: "enyo.ScrollMath",
kind: enyo.Component,
published: {
vertical: !0,
horizontal: !0
},
events: {
onScrollStart: "",
onScroll: "",
onScrollStop: ""
},
kSpringDamping: .93,
kDragDamping: .5,
kFrictionDamping: .97,
kSnapFriction: .9,
kFlickScalar: 15,
kMaxFlick: enyo.platform.android > 2 ? 2 : 1e9,
kFrictionEpsilon: .01,
topBoundary: 0,
rightBoundary: 0,
bottomBoundary: 0,
leftBoundary: 0,
interval: 20,
fixedTime: !0,
x0: 0,
x: 0,
y0: 0,
y: 0,
destroy: function() {
this.stop(), this.inherited(arguments);
},
verlet: function(e) {
var t = this.x;
this.x += t - this.x0, this.x0 = t;
var n = this.y;
this.y += n - this.y0, this.y0 = n;
},
damping: function(e, t, n, r) {
var i = .5, s = e - t;
return Math.abs(s) < i ? t : e * r > t * r ? n * s + t : e;
},
boundaryDamping: function(e, t, n, r) {
return this.damping(this.damping(e, t, r, 1), n, r, -1);
},
constrain: function() {
var e = this.boundaryDamping(this.y, this.topBoundary, this.bottomBoundary, this.kSpringDamping);
e != this.y && (this.y0 = e - (this.y - this.y0) * this.kSnapFriction, this.y = e);
var t = this.boundaryDamping(this.x, this.leftBoundary, this.rightBoundary, this.kSpringDamping);
t != this.x && (this.x0 = t - (this.x - this.x0) * this.kSnapFriction, this.x = t);
},
friction: function(e, t, n) {
var r = this[e] - this[t], i = Math.abs(r) > this.kFrictionEpsilon ? n : 0;
this[e] = this[t] + i * r;
},
frame: 10,
simulate: function(e) {
while (e >= this.frame) e -= this.frame, this.dragging || this.constrain(), this.verlet(), this.friction("y", "y0", this.kFrictionDamping), this.friction("x", "x0", this.kFrictionDamping);
return e;
},
animate: function() {
this.stop();
var e = enyo.now(), t = 0, n, r, i = enyo.bind(this, function() {
var s = enyo.now();
this.job = enyo.requestAnimationFrame(i);
var o = s - e;
e = s, this.dragging && (this.y0 = this.y = this.uy, this.x0 = this.x = this.ux), t += Math.max(16, o), this.fixedTime && !this.isInOverScroll() && (t = this.interval), t = this.simulate(t), r != this.y || n != this.x ? this.scroll() : this.dragging || (this.stop(!0), this.scroll()), r = this.y, n = this.x;
});
this.job = enyo.requestAnimationFrame(i);
},
start: function() {
this.job || (this.animate(), this.doScrollStart());
},
stop: function(e) {
this.job = enyo.cancelRequestAnimationFrame(this.job), e && this.doScrollStop();
},
stabilize: function() {
this.start();
var e = Math.min(this.topBoundary, Math.max(this.bottomBoundary, this.y)), t = Math.min(this.leftBoundary, Math.max(this.rightBoundary, this.x));
this.y = this.y0 = e, this.x = this.x0 = t, this.scroll(), this.stop(!0);
},
startDrag: function(e) {
this.dragging = !0, this.my = e.pageY, this.py = this.uy = this.y, this.mx = e.pageX, this.px = this.ux = this.x;
},
drag: function(e) {
if (this.dragging) {
var t = this.vertical ? e.pageY - this.my : 0;
this.uy = t + this.py, this.uy = this.boundaryDamping(this.uy, this.topBoundary, this.bottomBoundary, this.kDragDamping);
var n = this.horizontal ? e.pageX - this.mx : 0;
return this.ux = n + this.px, this.ux = this.boundaryDamping(this.ux, this.leftBoundary, this.rightBoundary, this.kDragDamping), this.start(), !0;
}
},
dragDrop: function(e) {
if (this.dragging && !window.PalmSystem) {
var t = .5;
this.y = this.uy, this.y0 = this.y - (this.y - this.y0) * t, this.x = this.ux, this.x0 = this.x - (this.x - this.x0) * t;
}
this.dragFinish();
},
dragFinish: function() {
this.dragging = !1;
},
flick: function(e) {
var t;
this.vertical && (t = e.yVelocity > 0 ? Math.min(this.kMaxFlick, e.yVelocity) : Math.max(-this.kMaxFlick, e.yVelocity), this.y = this.y0 + t * this.kFlickScalar), this.horizontal && (t = e.xVelocity > 0 ? Math.min(this.kMaxFlick, e.xVelocity) : Math.max(-this.kMaxFlick, e.xVelocity), this.x = this.x0 + t * this.kFlickScalar), this.start();
},
mousewheel: function(e) {
var t = this.vertical ? e.wheelDeltaY || e.wheelDelta : 0;
if (t > 0 && this.y < this.topBoundary || t < 0 && this.y > this.bottomBoundary) return this.stop(!0), this.y = this.y0 = this.y0 + t, this.start(), !0;
},
scroll: function() {
this.doScroll();
},
scrollTo: function(e, t) {
t !== null && (this.y = this.y0 - (t + this.y0) * (1 - this.kFrictionDamping)), e !== null && (this.x = this.x0 - (e + this.x0) * (1 - this.kFrictionDamping)), this.start();
},
setScrollX: function(e) {
this.x = this.x0 = e;
},
setScrollY: function(e) {
this.y = this.y0 = e;
},
setScrollPosition: function(e) {
this.setScrollY(e);
},
isScrolling: function() {
return Boolean(this.job);
},
isInOverScroll: function() {
return this.job && (this.x > this.leftBoundary || this.x < this.rightBoundary || this.y > this.topBoundary || this.y < this.bottomBoundary);
}
});

// ScrollStrategy.js

enyo.kind({
name: "enyo.ScrollStrategy",
tag: null,
published: {
vertical: "default",
horizontal: "default",
scrollLeft: 0,
scrollTop: 0,
maxHeight: null
},
handlers: {
ondragstart: "dragstart",
ondragfinish: "dragfinish",
ondown: "down",
onmove: "move"
},
create: function() {
this.inherited(arguments), this.horizontalChanged(), this.verticalChanged(), this.maxHeightChanged();
},
rendered: function() {
this.inherited(arguments), enyo.makeBubble(this.container, "scroll"), this.scrollNode = this.calcScrollNode();
},
teardownRender: function() {
this.inherited(arguments), this.scrollNode = null;
},
calcScrollNode: function() {
return this.container.hasNode();
},
horizontalChanged: function() {
this.container.applyStyle("overflow-x", this.horizontal == "default" ? "auto" : this.horizontal);
},
verticalChanged: function() {
this.container.applyStyle("overflow-y", this.vertical == "default" ? "auto" : this.vertical);
},
maxHeightChanged: function() {
this.container.applyStyle("max-height", this.maxHeight);
},
scrollTo: function(e, t) {
this.scrollNode && (this.setScrollLeft(e), this.setScrollTop(t));
},
scrollToNode: function(e, t) {
if (this.scrollNode) {
var n = this.getScrollBounds(), r = e, i = {
height: r.offsetHeight,
width: r.offsetWidth,
top: 0,
left: 0
};
while (r && r.parentNode && r.id != this.scrollNode.id) i.top += r.offsetTop, i.left += r.offsetLeft, r = r.parentNode;
this.setScrollTop(Math.min(n.maxTop, t === !1 ? i.top - n.clientHeight + i.height : i.top)), this.setScrollLeft(Math.min(n.maxLeft, t === !1 ? i.left - n.clientWidth + i.width : i.left));
}
},
scrollIntoView: function(e, t) {
e.hasNode() && e.node.scrollIntoView(t);
},
isInView: function(e) {
var t = this.getScrollBounds(), n = e.offsetTop, r = e.offsetHeight, i = e.offsetLeft, s = e.offsetWidth;
return n >= t.top && n + r <= t.top + t.clientHeight && i >= t.left && i + s <= t.left + t.clientWidth;
},
setScrollTop: function(e) {
this.scrollTop = e, this.scrollNode && (this.scrollNode.scrollTop = this.scrollTop);
},
setScrollLeft: function(e) {
this.scrollLeft = e, this.scrollNode && (this.scrollNode.scrollLeft = this.scrollLeft);
},
getScrollLeft: function() {
return this.scrollNode ? this.scrollNode.scrollLeft : this.scrollLeft;
},
getScrollTop: function() {
return this.scrollNode ? this.scrollNode.scrollTop : this.scrollTop;
},
_getScrollBounds: function() {
var e = this.getScrollSize(), t = this.container.hasNode(), n = {
left: this.getScrollLeft(),
top: this.getScrollTop(),
clientHeight: t ? t.clientHeight : 0,
clientWidth: t ? t.clientWidth : 0,
height: e.height,
width: e.width
};
return n.maxLeft = Math.max(0, n.width - n.clientWidth), n.maxTop = Math.max(0, n.height - n.clientHeight), n;
},
getScrollSize: function() {
var e = this.scrollNode;
return {
width: e ? e.scrollWidth : 0,
height: e ? e.scrollHeight : 0
};
},
getScrollBounds: function() {
return this._getScrollBounds();
},
calcStartInfo: function() {
var e = this.getScrollBounds(), t = this.getScrollTop(), n = this.getScrollLeft();
this.canVertical = e.maxTop > 0 && this.vertical != "hidden", this.canHorizontal = e.maxLeft > 0 && this.horizontal != "hidden", this.startEdges = {
top: t === 0,
bottom: t === e.maxTop,
left: n === 0,
right: n === e.maxLeft
};
},
shouldDrag: function(e) {
var t = e.vertical;
return t && this.canVertical || !t && this.canHorizontal;
},
dragstart: function(e, t) {
this.dragging = this.shouldDrag(t);
if (this.dragging) return this.preventDragPropagation;
},
dragfinish: function(e, t) {
this.dragging && (this.dragging = !1, t.preventTap());
},
down: function(e, t) {
this.calcStartInfo();
},
move: function(e, t) {
t.which && (this.canVertical && t.vertical || this.canHorizontal && t.horizontal) && t.disablePrevention();
}
});

// Thumb.js

enyo.kind({
name: "enyo.ScrollThumb",
axis: "v",
minSize: 4,
cornerSize: 6,
classes: "enyo-thumb",
create: function() {
this.inherited(arguments);
var e = this.axis == "v";
this.dimension = e ? "height" : "width", this.offset = e ? "top" : "left", this.translation = e ? "translateY" : "translateX", this.positionMethod = e ? "getScrollTop" : "getScrollLeft", this.sizeDimension = e ? "clientHeight" : "clientWidth", this.addClass("enyo-" + this.axis + "thumb"), this.transform = enyo.dom.canTransform(), enyo.dom.canAccelerate() && enyo.dom.transformValue(this, "translateZ", 0);
},
sync: function(e) {
this.scrollBounds = e._getScrollBounds(), this.update(e);
},
update: function(e) {
if (this.showing) {
var t = this.dimension, n = this.offset, r = this.scrollBounds[this.sizeDimension], i = this.scrollBounds[t], s = 0, o = 0, u = 0;
if (r >= i) {
this.hide();
return;
}
e.isOverscrolling() && (u = e.getOverScrollBounds()["over" + n], s = Math.abs(u), o = Math.max(u, 0));
var a = e[this.positionMethod]() - u, f = r - this.cornerSize, l = Math.floor(r * r / i - s);
l = Math.max(this.minSize, l);
var c = Math.floor(f * a / i + o);
c = Math.max(0, Math.min(f - this.minSize, c)), this.needed = l < r, this.needed && this.hasNode() ? (this._pos !== c && (this._pos = c, this.transform ? enyo.dom.transformValue(this, this.translation, c + "px") : this.axis == "v" ? this.setBounds({
top: c + "px"
}) : this.setBounds({
left: c + "px"
})), this._size !== l && (this._size = l, this.node.style[t] = this.domStyles[t] = l + "px")) : this.hide();
}
},
setShowing: function(e) {
if (e && e != this.showing && this.scrollBounds[this.sizeDimension] >= this.scrollBounds[this.dimension]) return;
this.hasNode() && this.cancelDelayHide();
if (e != this.showing) {
var t = this.showing;
this.showing = e, this.showingChanged(t);
}
},
delayHide: function(e) {
this.showing && enyo.job(this.id + "hide", enyo.bind(this, "hide"), e || 0);
},
cancelDelayHide: function() {
enyo.job.stop(this.id + "hide");
}
});

// TouchScrollStrategy.js

enyo.kind({
name: "enyo.TouchScrollStrategy",
kind: "ScrollStrategy",
overscroll: !0,
preventDragPropagation: !0,
published: {
vertical: "default",
horizontal: "default",
thumb: !0,
scrim: !1,
dragDuringGesture: !0
},
events: {
onShouldDrag: ""
},
handlers: {
onscroll: "domScroll",
onflick: "flick",
onhold: "hold",
ondragstart: "dragstart",
onShouldDrag: "shouldDrag",
ondrag: "drag",
ondragfinish: "dragfinish",
onmousewheel: "mousewheel"
},
tools: [ {
kind: "ScrollMath",
onScrollStart: "scrollMathStart",
onScroll: "scrollMathScroll",
onScrollStop: "scrollMathStop"
}, {
name: "vthumb",
kind: "ScrollThumb",
axis: "v",
showing: !1
}, {
name: "hthumb",
kind: "ScrollThumb",
axis: "h",
showing: !1
} ],
scrimTools: [ {
name: "scrim",
classes: "enyo-fit",
style: "z-index: 1;",
showing: !1
} ],
components: [ {
name: "client",
classes: "enyo-touch-scroller"
} ],
listReordering: !1,
create: function() {
this.inherited(arguments), this.transform = enyo.dom.canTransform(), this.transform || this.overscroll && this.$.client.applyStyle("position", "relative"), this.accel = enyo.dom.canAccelerate();
var e = "enyo-touch-strategy-container";
enyo.platform.ios && this.accel && (e += " enyo-composite"), this.scrimChanged(), this.container.addClass(e), this.translation = this.accel ? "translate3d" : "translate";
},
initComponents: function() {
this.createChrome(this.tools), this.inherited(arguments);
},
destroy: function() {
this.container.removeClass("enyo-touch-strategy-container"), this.inherited(arguments);
},
rendered: function() {
this.inherited(arguments), enyo.makeBubble(this.$.client, "scroll"), this.calcBoundaries(), this.syncScrollMath(), this.thumb && this.alertThumbs();
},
scrimChanged: function() {
this.scrim && !this.$.scrim && this.makeScrim(), !this.scrim && this.$.scrim && this.$.scrim.destroy();
},
makeScrim: function() {
var e = this.controlParent;
this.controlParent = null, this.createChrome(this.scrimTools), this.controlParent = e;
var t = this.container.hasNode();
t && (this.$.scrim.parentNode = t, this.$.scrim.render());
},
isScrolling: function() {
var e = this.$.scrollMath;
return e ? e.isScrolling() : this.scrolling;
},
isOverscrolling: function() {
var e = this.$.scrollMath || this;
return this.overscroll ? e.isInOverScroll() : !1;
},
domScroll: function() {
this.isScrolling() || (this.calcBoundaries(), this.syncScrollMath(), this.thumb && this.alertThumbs());
},
horizontalChanged: function() {
this.$.scrollMath.horizontal = this.horizontal != "hidden";
},
verticalChanged: function() {
this.$.scrollMath.vertical = this.vertical != "hidden";
},
maxHeightChanged: function() {
this.$.client.applyStyle("max-height", this.maxHeight), this.$.client.addRemoveClass("enyo-scrollee-fit", !this.maxHeight);
},
thumbChanged: function() {
this.hideThumbs();
},
stop: function() {
this.isScrolling() && this.$.scrollMath.stop(!0);
},
stabilize: function() {
this.$.scrollMath && this.$.scrollMath.stabilize();
},
scrollTo: function(e, t) {
this.stop(), this.$.scrollMath.scrollTo(e, t || t === 0 ? t : null);
},
scrollIntoView: function() {
this.stop(), this.inherited(arguments);
},
setScrollLeft: function() {
this.stop(), this.inherited(arguments);
},
setScrollTop: function() {
this.stop(), this.inherited(arguments);
},
getScrollLeft: function() {
return this.isScrolling() ? this.scrollLeft : this.inherited(arguments);
},
getScrollTop: function() {
return this.isScrolling() ? this.scrollTop : this.inherited(arguments);
},
calcScrollNode: function() {
return this.$.client.hasNode();
},
calcAutoScrolling: function() {
var e = this.vertical == "auto", t = this.horizontal == "auto" || this.horizontal == "default";
if ((e || t) && this.scrollNode) {
var n = this.getScrollBounds();
e && (this.$.scrollMath.vertical = n.height > n.clientHeight), t && (this.$.scrollMath.horizontal = n.width > n.clientWidth);
}
},
shouldDrag: function(e, t) {
this.calcAutoScrolling();
var n = t.vertical, r = this.$.scrollMath.horizontal && !n, i = this.$.scrollMath.vertical && n, s = t.dy < 0, o = t.dx < 0, u = !s && this.startEdges.top || s && this.startEdges.bottom, a = !o && this.startEdges.left || o && this.startEdges.right;
!t.boundaryDragger && (r || i) && (t.boundaryDragger = this);
if (!u && i || !a && r) return t.dragger = this, !0;
},
flick: function(e, t) {
var n = Math.abs(t.xVelocity) > Math.abs(t.yVelocity) ? this.$.scrollMath.horizontal : this.$.scrollMath.vertical;
if (n && this.dragging) return this.$.scrollMath.flick(t), this.preventDragPropagation;
},
hold: function(e, t) {
if (this.isScrolling() && !this.isOverscrolling()) {
var n = this.$.scrollMath || this;
return n.stop(t), !0;
}
},
move: function(e, t) {},
dragstart: function(e, t) {
if (!this.dragDuringGesture && t.srcEvent.touches && t.srcEvent.touches.length > 1) return !0;
this.doShouldDrag(t), this.dragging = t.dragger == this || !t.dragger && t.boundaryDragger == this;
if (this.dragging) {
t.preventDefault(), this.syncScrollMath(), this.$.scrollMath.startDrag(t);
if (this.preventDragPropagation) return !0;
}
},
drag: function(e, t) {
if (this.listReordering) return !1;
this.dragging && (t.preventDefault(), this.$.scrollMath.drag(t), this.scrim && this.$.scrim.show());
},
dragfinish: function(e, t) {
this.dragging && (t.preventTap(), this.$.scrollMath.dragFinish(), this.dragging = !1, this.scrim && this.$.scrim.hide());
},
mousewheel: function(e, t) {
if (!this.dragging) {
this.calcBoundaries(), this.syncScrollMath(), this.stabilize();
if (this.$.scrollMath.mousewheel(t)) return t.preventDefault(), !0;
}
},
scrollMathStart: function(e) {
this.scrollNode && (this.calcBoundaries(), this.thumb && this.showThumbs());
},
scrollMathScroll: function(e) {
this.overscroll ? this.effectScroll(-e.x, -e.y) : this.effectScroll(-Math.min(e.leftBoundary, Math.max(e.rightBoundary, e.x)), -Math.min(e.topBoundary, Math.max(e.bottomBoundary, e.y))), this.thumb && this.updateThumbs();
},
scrollMathStop: function(e) {
this.effectScrollStop(), this.thumb && this.delayHideThumbs(100);
},
calcBoundaries: function() {
var e = this.$.scrollMath || this, t = this._getScrollBounds();
e.bottomBoundary = t.clientHeight - t.height, e.rightBoundary = t.clientWidth - t.width;
},
syncScrollMath: function() {
var e = this.$.scrollMath;
e && (e.setScrollX(-this.getScrollLeft()), e.setScrollY(-this.getScrollTop()));
},
effectScroll: function(e, t) {
this.scrollNode && (this.scrollLeft = this.scrollNode.scrollLeft = e, this.scrollTop = this.scrollNode.scrollTop = t, this.effectOverscroll(Math.round(e), Math.round(t)));
},
effectScrollStop: function() {
this.effectOverscroll(null, null);
},
effectOverscroll: function(e, t) {
var n = this.scrollNode, r = "0", i = "0", s = this.accel ? ",0" : "";
t !== null && Math.abs(t - n.scrollTop) > 1 && (i = n.scrollTop - t), e !== null && Math.abs(e - n.scrollLeft) > 1 && (r = n.scrollLeft - e), this.transform ? enyo.dom.transformValue(this.$.client, this.translation, r + "px, " + i + "px" + s) : this.$.client.setBounds({
left: r + "px",
top: i + "px"
});
},
getOverScrollBounds: function() {
var e = this.$.scrollMath || this;
return {
overleft: Math.min(e.leftBoundary - e.x, 0) || Math.max(e.rightBoundary - e.x, 0),
overtop: Math.min(e.topBoundary - e.y, 0) || Math.max(e.bottomBoundary - e.y, 0)
};
},
_getScrollBounds: function() {
var e = this.inherited(arguments);
return enyo.mixin(e, this.getOverScrollBounds()), e;
},
getScrollBounds: function() {
return this.stop(), this.inherited(arguments);
},
alertThumbs: function() {
this.showThumbs(), this.delayHideThumbs(500);
},
syncThumbs: function() {
this.$.vthumb.sync(this), this.$.hthumb.sync(this);
},
updateThumbs: function() {
this.$.vthumb.update(this), this.$.hthumb.update(this);
},
showThumbs: function() {
this.syncThumbs(), this.horizontal != "hidden" && this.$.hthumb.show(), this.vertical != "hidden" && this.$.vthumb.show();
},
hideThumbs: function() {
this.$.vthumb.hide(), this.$.hthumb.hide();
},
delayHideThumbs: function(e) {
this.$.vthumb.delayHide(e), this.$.hthumb.delayHide(e);
}
});

// TranslateScrollStrategy.js

enyo.kind({
name: "enyo.TranslateScrollStrategy",
kind: "TouchScrollStrategy",
translateOptimized: !1,
components: [ {
name: "clientContainer",
classes: "enyo-touch-scroller",
components: [ {
name: "client"
} ]
} ],
rendered: function() {
this.inherited(arguments), enyo.makeBubble(this.$.clientContainer, "scroll");
},
getScrollSize: function() {
var e = this.$.client.hasNode();
return {
width: e ? e.scrollWidth : 0,
height: e ? e.scrollHeight : 0
};
},
create: function() {
this.inherited(arguments), enyo.dom.transformValue(this.$.client, this.translation, "0,0,0");
},
calcScrollNode: function() {
return this.$.clientContainer.hasNode();
},
maxHeightChanged: function() {
this.$.client.applyStyle("min-height", this.maxHeight ? null : "100%"), this.$.client.applyStyle("max-height", this.maxHeight), this.$.clientContainer.addRemoveClass("enyo-scrollee-fit", !this.maxHeight);
},
shouldDrag: function(e, t) {
return this.stop(), this.calcStartInfo(), this.inherited(arguments);
},
syncScrollMath: function() {
this.translateOptimized || this.inherited(arguments);
},
setScrollLeft: function(e) {
this.stop();
if (this.translateOptimized) {
var t = this.$.scrollMath;
t.setScrollX(-e), t.stabilize();
} else this.inherited(arguments);
},
setScrollTop: function(e) {
this.stop();
if (this.translateOptimized) {
var t = this.$.scrollMath;
t.setScrollY(-e), t.stabilize();
} else this.inherited(arguments);
},
getScrollLeft: function() {
return this.translateOptimized ? this.scrollLeft : this.inherited(arguments);
},
getScrollTop: function() {
return this.translateOptimized ? this.scrollTop : this.inherited(arguments);
},
scrollMathStart: function(e) {
this.inherited(arguments), this.scrollStarting = !0, this.startX = 0, this.startY = 0, !this.translateOptimized && this.scrollNode && (this.startX = this.getScrollLeft(), this.startY = this.getScrollTop());
},
scrollMathScroll: function(e) {
this.overscroll ? (this.scrollLeft = -e.x, this.scrollTop = -e.y) : (this.scrollLeft = -Math.min(e.leftBoundary, Math.max(e.rightBoundary, e.x)), this.scrollTop = -Math.min(e.topBoundary, Math.max(e.bottomBoundary, e.y))), this.isScrolling() && (this.$.scrollMath.isScrolling() && this.effectScroll(this.startX - this.scrollLeft, this.startY - this.scrollTop), this.thumb && this.updateThumbs());
},
effectScroll: function(e, t) {
var n = e + "px, " + t + "px" + (this.accel ? ",0" : "");
enyo.dom.transformValue(this.$.client, this.translation, n);
},
effectScrollStop: function() {
if (!this.translateOptimized) {
var e = "0,0" + (this.accel ? ",0" : ""), t = this.$.scrollMath, n = this._getScrollBounds(), r = Boolean(n.maxTop + t.bottomBoundary || n.maxLeft + t.rightBoundary);
enyo.dom.transformValue(this.$.client, this.translation, r ? null : e), this.setScrollLeft(this.scrollLeft), this.setScrollTop(this.scrollTop), r && enyo.dom.transformValue(this.$.client, this.translation, e);
}
},
twiddle: function() {
this.translateOptimized && this.scrollNode && (this.scrollNode.scrollTop = 1, this.scrollNode.scrollTop = 0);
},
down: enyo.nop
});

// TransitionScrollStrategy.js

enyo.kind({
name: "enyo.TransitionScrollStrategy",
kind: "enyo.TouchScrollStrategy",
components: [ {
name: "clientContainer",
classes: "enyo-touch-scroller",
components: [ {
name: "client"
} ]
} ],
events: {
onScrollStart: "",
onScroll: "",
onScrollStop: ""
},
handlers: {
ondown: "down",
ondragfinish: "dragfinish",
onwebkitTransitionEnd: "transitionComplete"
},
tools: [ {
name: "vthumb",
kind: "ScrollThumb",
axis: "v",
showing: !0
}, {
name: "hthumb",
kind: "ScrollThumb",
axis: "h",
showing: !1
} ],
kFlickScalar: 600,
topBoundary: 0,
rightBoundary: 0,
bottomBoundary: 0,
leftBoundary: 0,
scrolling: !1,
listener: null,
boundaryX: 0,
boundaryY: 0,
stopTimeout: null,
stopTimeoutMS: 80,
scrollInterval: null,
scrollIntervalMS: 50,
transitions: {
none: "",
scroll: "3.8s cubic-bezier(.19,1,.28,1.0) 0s",
bounce: "0.5s cubic-bezier(0.06,.5,.5,.94) 0s"
},
setScrollLeft: function(e) {
var t = this.scrollLeft;
this.stop(), this.scrollLeft = e;
if (this.isInLeftOverScroll() || this.isInRightOverScroll()) this.scrollLeft = t;
this.effectScroll();
},
setScrollTop: function(e) {
var t = this.scrollTop;
this.stop(), this.scrollTop = e;
if (this.isInTopOverScroll() || this.isInBottomOverScroll()) this.scrollTop = t;
this.effectScroll();
},
setScrollX: function(e) {
this.scrollLeft = -1 * e;
},
setScrollY: function(e) {
this.scrollTop = -1 * e;
},
getScrollLeft: function() {
return this.scrollLeft;
},
getScrollTop: function() {
return this.scrollTop;
},
create: function() {
this.inherited(arguments), enyo.dom.transformValue(this.$.client, this.translation, "0,0,0");
},
destroy: function() {
this.clearCSSTransitionInterval(), this.inherited(arguments);
},
getScrollSize: function() {
var e = this.$.client.hasNode();
return {
width: e ? e.scrollWidth : 0,
height: e ? e.scrollHeight : 0
};
},
horizontalChanged: function() {
this.horizontal == "hidden" && (this.scrollHorizontal = !1);
},
verticalChanged: function() {
this.vertical == "hidden" && (this.scrollVertical = !1);
},
calcScrollNode: function() {
return this.$.clientContainer.hasNode();
},
calcBoundaries: function() {
var e = this._getScrollBounds();
this.bottomBoundary = e.clientHeight - e.height, this.rightBoundary = e.clientWidth - e.width;
},
maxHeightChanged: function() {
this.$.client.applyStyle("min-height", this.maxHeight ? null : "100%"), this.$.client.applyStyle("max-height", this.maxHeight), this.$.clientContainer.addRemoveClass("enyo-scrollee-fit", !this.maxHeight);
},
calcAutoScrolling: function() {
var e = this.getScrollBounds();
this.vertical && (this.scrollVertical = e.height > e.clientHeight), this.horizontal && (this.scrollHorizontal = e.width > e.clientWidth);
},
isInOverScroll: function() {
return this.isInTopOverScroll() || this.isInBottomOverScroll() || this.isInLeftOverScroll() || this.isInRightOverScroll();
},
isInLeftOverScroll: function() {
return this.getScrollLeft() < this.leftBoundary;
},
isInRightOverScroll: function() {
return this.getScrollLeft <= 0 ? !1 : this.getScrollLeft() * -1 < this.rightBoundary;
},
isInTopOverScroll: function() {
return this.getScrollTop() < this.topBoundary;
},
isInBottomOverScroll: function() {
return this.getScrollTop() <= 0 ? !1 : this.getScrollTop() * -1 < this.bottomBoundary;
},
calcStartInfo: function() {
var e = this.getScrollBounds(), t = this.getScrollTop(), n = this.getScrollLeft();
this.startEdges = {
top: t === 0,
bottom: t === e.maxTop,
left: n === 0,
right: n === e.maxLeft
};
},
mousewheel: function(e, t) {
if (!this.dragging) {
this.calcBoundaries(), this.syncScrollMath(), this.stabilize();
var n = this.vertical ? t.wheelDeltaY || t.wheelDelta : 0, r = parseFloat(this.getScrollTop()) + -1 * parseFloat(n);
return r = r * -1 < this.bottomBoundary ? -1 * this.bottomBoundary : r < this.topBoundary ? this.topBoundary : r, this.setScrollTop(r), this.doScroll(), t.preventDefault(), !0;
}
},
scroll: function(e, t) {
this.thumb && this.updateThumbs(), this.calcBoundaries(), this.doScroll();
},
start: function() {
this.startScrolling(), this.doScrollStart();
},
stop: function() {
this.isScrolling() && this.stopScrolling(), this.thumb && this.delayHideThumbs(100), this.doScrollStop();
},
updateX: function() {
var e = window.getComputedStyle(this.$.client.node, null).getPropertyValue(enyo.dom.getCssTransformProp()).split("(")[1];
return e = e == undefined ? 0 : e.split(")")[0].split(",")[4], -1 * parseFloat(e) === this.scrollLeft ? !1 : (this.scrollLeft = -1 * parseFloat(e), !0);
},
updateY: function() {
var e = window.getComputedStyle(this.$.client.node, null).getPropertyValue(enyo.dom.getCssTransformProp()).split("(")[1];
return e = e == undefined ? 0 : e.split(")")[0].split(",")[5], -1 * parseFloat(e) === this.scrollTop ? !1 : (this.scrollTop = -1 * parseFloat(e), !0);
},
effectScroll: function() {
var e = -1 * this.scrollLeft + "px, " + -1 * this.scrollTop + "px" + (this.accel ? ", 0" : "");
enyo.dom.transformValue(this.$.client, this.translation, e);
},
down: function(e, t) {
var n = this;
if (this.isScrolling() && !this.isOverscrolling()) return this.stopTimeout = setTimeout(function() {
n.stop();
}, this.stopTimeoutMS), !0;
},
dragstart: function(e, t) {
this.stopTimeout && clearTimeout(this.stopTimeout);
if (!this.dragDuringGesture && t.srcEvent.touches && t.srcEvent.touches.length > 1) return !0;
this.shouldDrag(t), this.dragging = t.dragger == this || !t.dragger && t.boundaryDragger == this;
if (this.dragging) {
this.isScrolling() && this.stopScrolling(), this.thumb && this.showThumbs(), t.preventDefault(), this.prevY = t.pageY, this.prevX = t.pageX;
if (this.preventDragPropagation) return !0;
}
},
shouldDrag: function(e) {
return this.calcStartInfo(), this.calcBoundaries(), this.calcAutoScrolling(), this.scrollHorizontal ? this.scrollVertical ? this.shouldDragVertical(e) || this.shouldDragHorizontal(e) : this.shouldDragHorizontal(e) : this.shouldDragVertical(e);
},
shouldDragVertical: function(e) {
var t = this.canDragVertical(e), n = this.oobVertical(e);
!e.boundaryDragger && t && (e.boundaryDragger = this);
if (!n && t) return e.dragger = this, !0;
},
shouldDragHorizontal: function(e) {
var t = this.canDragHorizontal(e), n = this.oobHorizontal(e);
!e.boundaryDragger && t && (e.boundaryDragger = this);
if (!n && t) return e.dragger = this, !0;
},
canDragVertical: function(e) {
return this.scrollVertical && e.vertical;
},
canDragHorizontal: function(e) {
return this.scrollHorizontal && !e.vertical;
},
oobVertical: function(e) {
var t = e.dy < 0;
return !t && this.startEdges.top || t && this.startEdges.bottom;
},
oobHorizontal: function(e) {
var t = e.dx < 0;
return !t && this.startEdges.left || t && this.startEdges.right;
},
drag: function(e, t) {
if (this.listReordering) return !1;
this.dragging && (t.preventDefault(), this.scrollLeft = this.scrollHorizontal ? this.calculateDragDistance(parseInt(this.getScrollLeft(), 10), -1 * (t.pageX - this.prevX), this.leftBoundary, this.rightBoundary) : this.getScrollLeft(), this.scrollTop = this.scrollVertical ? this.calculateDragDistance(this.getScrollTop(), -1 * (t.pageY - this.prevY), this.topBoundary, this.bottomBoundary) : this.getScrollTop(), this.effectScroll(), this.scroll(), this.prevY = t.pageY, this.prevX = t.pageX, this.resetBoundaryX(), this.resetBoundaryY());
},
calculateDragDistance: function(e, t, n, r) {
var i = e + t;
return this.overscrollDragDamping(e, i, t, n, r);
},
overscrollDragDamping: function(e, t, n, r, i) {
if (t < r || t * -1 < i) n /= 2, t = e + n;
return t;
},
resetBoundaryX: function() {
this.boundaryX = 0;
},
resetBoundaryY: function() {
this.boundaryY = 0;
},
dragfinish: function(e, t) {
this.dragging && (t.preventTap(), this.dragging = !1, this.isScrolling() || this.correctOverflow(), this.scrim && this.$.scrim.hide());
},
correctOverflow: function() {
if (this.isInOverScroll()) {
var e = this.scrollHorizontal ? this.correctOverflowX() : !1, t = this.scrollVertical ? this.correctOverflowY() : !1;
e !== !1 && t !== !1 ? (this.scrollLeft = e !== !1 ? e : this.getScrollLeft(), this.scrollTop = t !== !1 ? t : this.getScrollTop(), this.startOverflowScrolling()) : e !== !1 ? (this.scrollLeft = e, this.scrollTop = this.targetScrollTop || this.scrollTop, this.targetScrollLeft = this.getScrollLeft(), this.vertical ? this.startScrolling() : this.startOverflowScrolling()) : t !== !1 && (this.scrollTop = t, this.scrollLeft = this.targetScrollLeft || this.scrollLeft, this.targetScrollTop = this.getScrollTop(), this.scrollHorizontal ? this.startScrolling() : this.startOverflowScrolling());
}
},
correctOverflowX: function() {
if (this.isInLeftOverScroll()) {
if (this.beyondBoundary(this.getScrollLeft(), this.leftBoundary, this.boundaryX)) return this.leftBoundary;
} else if (this.isInRightOverScroll() && this.beyondBoundary(this.getScrollLeft(), this.rightBoundary, this.boundaryX)) return -1 * this.rightBoundary;
return !1;
},
correctOverflowY: function() {
if (this.isInTopOverScroll()) {
if (this.beyondBoundary(this.getScrollTop(), this.topBoundary, this.boundaryY)) return this.topBoundary;
} else if (this.isInBottomOverScroll() && this.beyondBoundary(this.getScrollTop(), this.bottomBoundary, this.boundaryY)) return -1 * this.bottomBoundary;
return !1;
},
beyondBoundary: function(e, t, n) {
return Math.abs(Math.abs(t) - Math.abs(e)) > Math.abs(n);
},
flick: function(e, t) {
if (this.dragging && this.flickOnEnabledAxis(t)) return this.scrollLeft = this.scrollHorizontal ? this.calculateFlickDistance(this.scrollLeft, -1 * t.xVelocity) : this.getScrollLeft(), this.scrollTop = this.scrollVertical ? this.calculateFlickDistance(this.scrollTop, -1 * t.yVelocity) : this.getScrollTop(), this.targetScrollLeft = this.scrollLeft, this.targetScrollTop = this.scrollTop, this.boundaryX = null, this.boundaryY = null, this.isInLeftOverScroll() ? this.boundaryX = this.figureBoundary(this.getScrollLeft()) : this.isInRightOverScroll() && (this.boundaryX = this.figureBoundary(-1 * this.bottomBoundary - this.getScrollLeft())), this.isInTopOverScroll() ? this.boundaryY = this.figureBoundary(this.getScrollTop()) : this.isInBottomOverScroll() && (this.boundaryY = this.figureBoundary(-1 * this.bottomBoundary - this.getScrollTop())), this.startScrolling(), this.preventDragPropagation;
},
flickOnEnabledAxis: function(e) {
return Math.abs(e.xVelocity) > Math.abs(e.yVelocity) ? this.scrollHorizontal : this.scrollVertical;
},
calculateFlickDistance: function(e, t) {
return e + t * this.kFlickScalar;
},
startScrolling: function() {
this.applyTransition("scroll"), this.effectScroll(), this.setCSSTransitionInterval(), this.scrolling = !0;
},
startOverflowScrolling: function() {
this.applyTransition("bounce"), this.effectScroll(), this.setOverflowTransitionInterval(), this.scrolling = !0;
},
applyTransition: function(e) {
var t = this.translation + ": " + this.transitions[e];
this.$.client.applyStyle("-webkit-transition", this.transitions[e]);
},
stopScrolling: function() {
this.resetCSSTranslationVals(), this.clearCSSTransitionInterval(), this.scrolling = !1;
},
setCSSTransitionInterval: function() {
this.clearCSSTransitionInterval(), this.scrollInterval = setInterval(enyo.bind(this, function() {
this.updateScrollPosition(), this.correctOverflow();
}), this.scrollIntervalMS);
},
setOverflowTransitionInterval: function() {
this.clearCSSTransitionInterval(), this.scrollInterval = setInterval(enyo.bind(this, function() {
this.updateScrollPosition();
}), this.scrollIntervalMS);
},
updateScrollPosition: function() {
var e = this.updateY(), t = this.updateX();
this.scroll(), !e && !t && this.stop();
},
clearCSSTransitionInterval: function() {
this.scrollInterval && (clearInterval(this.scrollInterval), this.scrollInterval = null);
},
resetCSSTranslationVals: function() {
var e = enyo.dom.getCssTransformProp(), t = window.getComputedStyle(this.$.client.node, null).getPropertyValue(e).split("(")[1].split(")")[0].split(",");
this.applyTransition("none"), this.scrollLeft = -1 * t[4], this.scrollTop = -1 * t[5], this.effectScroll();
},
figureBoundary: function(e) {
var t = Math.abs(e), n = t - t / Math.pow(t, .02);
return n = e < 0 ? -1 * n : n, n;
},
transitionComplete: function(e, t) {
if (t.originator !== this.$.client) return;
var n = !1;
this.isInTopOverScroll() ? (n = !0, this.scrollTop = this.topBoundary) : this.isInBottomOverScroll() && (n = !0, this.scrollTop = -1 * this.bottomBoundary), this.isInLeftOverScroll() ? (n = !0, this.scrollLeft = this.leftBoundary) : this.isInRightOverScroll() && (n = !0, this.scrollLeft = -1 * this.rightBoundary), n ? this.startOverflowScrolling() : this.stop();
},
scrollTo: function(e, t) {
this.setScrollTop(t), this.setScrollLeft(e), this.start();
},
getOverScrollBounds: function() {
return {
overleft: Math.min(this.leftBoundary + this.scrollLeft, 0) || Math.max(this.rightBoundary + this.scrollLeft, 0),
overtop: Math.min(this.topBoundary + this.scrollTop, 0) || Math.max(this.bottomBoundary + this.scrollTop, 0)
};
}
});

// Scroller.js

enyo.kind({
name: "enyo.Scroller",
published: {
horizontal: "default",
vertical: "default",
scrollTop: 0,
scrollLeft: 0,
maxHeight: null,
touch: !1,
strategyKind: "ScrollStrategy",
thumb: !0
},
events: {
onScrollStart: "",
onScroll: "",
onScrollStop: ""
},
touchOverscroll: !0,
preventDragPropagation: !0,
preventScrollPropagation: !0,
handlers: {
onscroll: "domScroll",
onScrollStart: "scrollStart",
onScroll: "scroll",
onScrollStop: "scrollStop"
},
classes: "enyo-scroller",
statics: {
osInfo: [ {
os: "android",
version: 3
}, {
os: "androidChrome",
version: 18
}, {
os: "androidFirefox",
version: 16
}, {
os: "firefoxOS",
version: 16
}, {
os: "ios",
version: 5
}, {
os: "webos",
version: 1e9
}, {
os: "blackberry",
version: 1e9
} ],
hasTouchScrolling: function() {
for (var e = 0, t, n; t = this.osInfo[e]; e++) if (enyo.platform[t.os]) return !0;
if (enyo.platform.ie >= 10 && enyo.platform.touch) return !0;
},
hasNativeScrolling: function() {
for (var e = 0, t, n; t = this.osInfo[e]; e++) if (enyo.platform[t.os] < t.version) return !1;
return !0;
},
getTouchStrategy: function() {
return enyo.platform.android >= 3 ? "TranslateScrollStrategy" : "TouchScrollStrategy";
}
},
controlParentName: "strategy",
create: function() {
this.inherited(arguments), this.horizontalChanged(), this.verticalChanged();
},
importProps: function(e) {
this.inherited(arguments), e && e.strategyKind === undefined && (enyo.Scroller.touchScrolling || this.touch) && (this.strategyKind = enyo.Scroller.getTouchStrategy());
},
initComponents: function() {
this.strategyKindChanged(), this.inherited(arguments);
},
teardownChildren: function() {
this.cacheScrollPosition(), this.inherited(arguments);
},
rendered: function() {
this.inherited(arguments), this.restoreScrollPosition();
},
strategyKindChanged: function() {
this.$.strategy && (this.$.strategy.destroy(), this.controlParent = null), this.createStrategy(), this.hasNode() && this.render();
},
createStrategy: function() {
this.createComponents([ {
name: "strategy",
maxHeight: this.maxHeight,
kind: this.strategyKind,
thumb: this.thumb,
preventDragPropagation: this.preventDragPropagation,
overscroll: this.touchOverscroll,
isChrome: !0
} ]);
},
getStrategy: function() {
return this.$.strategy;
},
maxHeightChanged: function() {
this.$.strategy.setMaxHeight(this.maxHeight);
},
showingChanged: function() {
this.showing || (this.cacheScrollPosition(), this.setScrollLeft(0), this.setScrollTop(0)), this.inherited(arguments), this.showing && this.restoreScrollPosition();
},
thumbChanged: function() {
this.$.strategy.setThumb(this.thumb);
},
cacheScrollPosition: function() {
this.cachedPosition = {
left: this.getScrollLeft(),
top: this.getScrollTop()
};
},
restoreScrollPosition: function() {
this.cachedPosition && (this.setScrollLeft(this.cachedPosition.left), this.setScrollTop(this.cachedPosition.top), this.cachedPosition = null);
},
horizontalChanged: function() {
this.$.strategy.setHorizontal(this.horizontal);
},
verticalChanged: function() {
this.$.strategy.setVertical(this.vertical);
},
setScrollLeft: function(e) {
this.scrollLeft = e, this.$.strategy.setScrollLeft(this.scrollLeft);
},
setScrollTop: function(e) {
this.scrollTop = e, this.$.strategy.setScrollTop(e);
},
getScrollLeft: function() {
return this.$.strategy.getScrollLeft();
},
getScrollTop: function() {
return this.$.strategy.getScrollTop();
},
getScrollBounds: function() {
return this.$.strategy.getScrollBounds();
},
scrollIntoView: function(e, t) {
this.$.strategy.scrollIntoView(e, t);
},
scrollTo: function(e, t) {
this.$.strategy.scrollTo(e, t);
},
scrollToControl: function(e, t) {
this.scrollToNode(e.hasNode(), t);
},
scrollToNode: function(e, t) {
this.$.strategy.scrollToNode(e, t);
},
domScroll: function(e, t) {
return this.$.strategy.domScroll && t.originator == this && this.$.strategy.scroll(e, t), this.doScroll(t), !0;
},
shouldStopScrollEvent: function(e) {
return this.preventScrollPropagation && e.originator.owner != this.$.strategy;
},
scrollStart: function(e, t) {
return this.shouldStopScrollEvent(t);
},
scroll: function(e, t) {
return t.dispatchTarget ? this.preventScrollPropagation && t.originator != this && t.originator.owner != this.$.strategy : this.shouldStopScrollEvent(t);
},
scrollStop: function(e, t) {
return this.shouldStopScrollEvent(t);
},
scrollToTop: function() {
this.setScrollTop(0);
},
scrollToBottom: function() {
this.setScrollTop(this.getScrollBounds().maxTop);
},
scrollToRight: function() {
this.setScrollLeft(this.getScrollBounds().maxLeft);
},
scrollToLeft: function() {
this.setScrollLeft(0);
},
stabilize: function() {
var e = this.getStrategy();
e.stabilize && e.stabilize();
}
}), enyo.Scroller.hasTouchScrolling() && (enyo.Scroller.prototype.strategyKind = enyo.Scroller.getTouchStrategy());

// Animator.js

enyo.kind({
name: "enyo.Animator",
kind: "Component",
published: {
duration: 350,
startValue: 0,
endValue: 1,
node: null,
easingFunction: enyo.easing.cubicOut
},
events: {
onStep: "",
onEnd: "",
onStop: ""
},
constructed: function() {
this.inherited(arguments), this._next = enyo.bind(this, "next");
},
destroy: function() {
this.stop(), this.inherited(arguments);
},
play: function(e) {
return this.stop(), this.reversed = !1, e && enyo.mixin(this, e), this.t0 = this.t1 = enyo.now(), this.value = this.startValue, this.job = !0, this.next(), this;
},
stop: function() {
if (this.isAnimating()) return this.cancel(), this.fire("onStop"), this;
},
reverse: function() {
if (this.isAnimating()) {
this.reversed = !this.reversed;
var e = this.t1 = enyo.now(), t = e - this.t0;
this.t0 = e + t - this.duration;
var n = this.startValue;
return this.startValue = this.endValue, this.endValue = n, this;
}
},
isAnimating: function() {
return Boolean(this.job);
},
requestNext: function() {
this.job = enyo.requestAnimationFrame(this._next, this.node);
},
cancel: function() {
enyo.cancelRequestAnimationFrame(this.job), this.node = null, this.job = null;
},
shouldEnd: function() {
return this.dt >= this.duration;
},
next: function() {
this.t1 = enyo.now(), this.dt = this.t1 - this.t0;
var e = this.fraction = enyo.easedLerp(this.t0, this.duration, this.easingFunction, this.reversed);
this.value = this.startValue + e * (this.endValue - this.startValue), e >= 1 || this.shouldEnd() ? (this.value = this.endValue, this.fraction = 1, this.fire("onStep"), this.fire("onEnd"), this.cancel()) : (this.fire("onStep"), this.requestNext());
},
fire: function(e) {
var t = this[e];
enyo.isString(t) ? this.bubble(e) : t && t.call(this.context || window, this);
}
});

// BaseLayout.js

enyo.kind({
name: "enyo.BaseLayout",
kind: enyo.Layout,
layoutClass: "enyo-positioned",
reflow: function() {
enyo.forEach(this.container.children, function(e) {
e.fit !== null && e.addRemoveClass("enyo-fit", e.fit);
}, this);
}
});

// Image.js

enyo.kind({
name: "enyo.Image",
noEvents: !1,
tag: "img",
attributes: {
draggable: "false"
},
create: function() {
this.noEvents && (delete this.attributes.onload, delete this.attributes.onerror), this.inherited(arguments);
},
rendered: function() {
this.inherited(arguments), enyo.makeBubble(this, "load", "error");
}
});

// Input.js

enyo.kind({
name: "enyo.Input",
published: {
value: "",
placeholder: "",
type: "",
disabled: !1,
selectOnFocus: !1
},
events: {
onDisabledChange: ""
},
defaultFocus: !1,
tag: "input",
classes: "enyo-input",
handlers: {
onfocus: "focused",
oninput: "input",
onclear: "clear",
ondragstart: "dragstart"
},
create: function() {
enyo.platform.ie && (this.handlers.onkeyup = "iekeyup"), this.inherited(arguments), this.placeholderChanged(), this.type && this.typeChanged(), this.valueChanged();
},
rendered: function() {
this.inherited(arguments), enyo.makeBubble(this, "focus", "blur"), enyo.platform.ie == 8 && this.setAttribute("onchange", enyo.bubbler), this.disabledChanged(), this.defaultFocus && this.focus();
},
typeChanged: function() {
this.setAttribute("type", this.type);
},
placeholderChanged: function() {
this.setAttribute("placeholder", this.placeholder);
},
disabledChanged: function() {
this.setAttribute("disabled", this.disabled), this.bubble("onDisabledChange");
},
valueChanged: function() {
this.setAttribute("value", this.value), this.getNodeProperty("value", this.value) !== this.value && this.setNodeProperty("value", this.value);
},
iekeyup: function(e, t) {
var n = enyo.platform.ie, r = t.keyCode;
(n <= 8 || n == 9 && (r == 8 || r == 46)) && this.bubble("oninput", t);
},
clear: function() {
this.setValue("");
},
focus: function() {
this.hasNode() && this.node.focus();
},
hasFocus: function() {
if (this.hasNode()) return document.activeElement === this.node;
},
dragstart: function() {
return this.hasFocus();
},
focused: function() {
this.selectOnFocus && enyo.asyncMethod(this, "selectContents");
},
selectContents: function() {
var e = this.hasNode();
if (e && e.setSelectionRange) e.setSelectionRange(0, e.value.length); else if (e && e.createTextRange) {
var t = e.createTextRange();
t.expand("textedit"), t.select();
}
},
input: function() {
var e = this.getNodeProperty("value");
this.setValue(e);
}
});

// RichText.js

enyo.kind({
name: "enyo.RichText",
classes: "enyo-richtext enyo-selectable",
published: {
allowHtml: !0,
disabled: !1,
value: ""
},
defaultFocus: !1,
statics: {
osInfo: [ {
os: "android",
version: 3
}, {
os: "ios",
version: 5
} ],
hasContentEditable: function() {
for (var e = 0, t, n; t = enyo.RichText.osInfo[e]; e++) if (enyo.platform[t.os] < t.version) return !1;
return !0;
}
},
kind: enyo.Input,
attributes: {
contenteditable: !0
},
handlers: {
onfocus: "focusHandler",
onblur: "blurHandler"
},
create: function() {
this.setTag(enyo.RichText.hasContentEditable() ? "div" : "textarea"), this.inherited(arguments);
},
focusHandler: function() {
this._value = this.getValue();
},
blurHandler: function() {
this._value !== this.getValue() && this.bubble("onchange");
},
valueChanged: function() {
this.hasFocus() ? (this.selectAll(), this.insertAtCursor(this.value)) : this.set("content", this.get("value"));
},
getValue: function() {
if (this.hasNode()) return this.node.innerHTML;
},
hasFocus: function() {
if (this.hasNode()) return document.activeElement === this.node;
},
getSelection: function() {
if (this.hasFocus()) return window.getSelection();
},
removeSelection: function(e) {
var t = this.getSelection();
t && t[e ? "collapseToStart" : "collapseToEnd"]();
},
modifySelection: function(e, t, n) {
var r = this.getSelection();
r && r.modify(e || "move", t, n);
},
moveCursor: function(e, t) {
this.modifySelection("move", e, t);
},
moveCursorToEnd: function() {
this.moveCursor("forward", "documentboundary");
},
moveCursorToStart: function() {
this.moveCursor("backward", "documentboundary");
},
selectAll: function() {
this.hasFocus() && document.execCommand("selectAll");
},
insertAtCursor: function(e) {
if (this.hasFocus()) {
var t = this.allowHtml ? e : enyo.Control.escapeHtml(e).replace(/\n/g, "<br/>");
document.execCommand("insertHTML", !1, t);
}
}
});

// TextArea.js

enyo.kind({
name: "enyo.TextArea",
kind: enyo.Input,
tag: "textarea",
classes: "enyo-textarea",
rendered: function() {
this.inherited(arguments), this.valueChanged();
}
});

// Select.js

enyo.kind({
name: "enyo.Select",
published: {
selected: 0
},
handlers: {
onchange: "change"
},
tag: "select",
defaultKind: "enyo.Option",
rendered: function() {
this.inherited(arguments), enyo.platform.ie == 8 && this.setAttribute("onchange", enyo.bubbler), this.selectedChanged();
},
getSelected: function() {
return Number(this.getNodeProperty("selectedIndex", this.selected));
},
selectedChanged: function() {
this.setNodeProperty("selectedIndex", this.selected);
},
change: function() {
this.selected = this.getSelected();
},
render: function() {
enyo.platform.ie ? this.parent.render() : this.inherited(arguments);
},
getValue: function() {
if (this.hasNode()) return this.node.value;
}
}), enyo.kind({
name: "enyo.Option",
published: {
value: ""
},
tag: "option",
create: function() {
this.inherited(arguments), this.valueChanged();
},
valueChanged: function() {
this.setAttribute("value", this.value);
}
}), enyo.kind({
name: "enyo.OptionGroup",
published: {
label: ""
},
tag: "optgroup",
defaultKind: "enyo.Option",
create: function() {
this.inherited(arguments), this.labelChanged();
},
labelChanged: function() {
this.setAttribute("label", this.label);
}
});

// Group.js

enyo.kind({
name: "enyo.Group",
published: {
highlander: !0,
active: null
},
handlers: {
onActivate: "activate"
},
activate: function(e, t) {
this.highlander && (t.originator.active ? this.setActive(t.originator) : t.originator == this.active && this.active.setActive(!0));
},
activeChanged: function(e) {
e && (e.setActive(!1), e.removeClass("active")), this.active && this.active.addClass("active");
}
});

// GroupItem.js

enyo.kind({
name: "enyo.GroupItem",
published: {
active: !1
},
rendered: function() {
this.inherited(arguments), this.activeChanged();
},
activeChanged: function() {
this.bubble("onActivate");
}
});

// ToolDecorator.js

enyo.kind({
name: "enyo.ToolDecorator",
kind: enyo.GroupItem,
classes: "enyo-tool-decorator"
});

// Button.js

enyo.kind({
name: "enyo.Button",
kind: enyo.ToolDecorator,
tag: "button",
attributes: {
type: "button"
},
published: {
disabled: !1
},
create: function() {
this.inherited(arguments), this.disabledChanged();
},
disabledChanged: function() {
this.setAttribute("disabled", this.disabled);
},
tap: function() {
if (this.disabled) return !0;
this.setActive(!0);
}
});

// Checkbox.js

enyo.kind({
name: "enyo.Checkbox",
kind: enyo.Input,
classes: "enyo-checkbox",
events: {
onActivate: ""
},
published: {
checked: !1,
active: !1,
type: "checkbox"
},
kindClasses: "",
handlers: {
onchange: "change",
onclick: "click"
},
create: function() {
this.inherited(arguments);
},
rendered: function() {
this.inherited(arguments), this.active && this.activeChanged(), this.checkedChanged();
},
checkedChanged: function() {
this.setNodeProperty("checked", this.checked), this.setAttribute("checked", this.checked ? "checked" : ""), this.setActive(this.checked);
},
activeChanged: function() {
this.active = enyo.isTrue(this.active), this.setChecked(this.active), this.bubble("onActivate");
},
setValue: function(e) {
this.setChecked(enyo.isTrue(e));
},
getValue: function() {
return this.getChecked();
},
valueChanged: function() {},
change: function() {
var e = enyo.isTrue(this.getNodeProperty("checked"));
this.setActive(e);
},
click: function(e, t) {
enyo.platform.ie <= 8 && this.bubble("onchange", t);
}
});

// Repeater.js

enyo.kind({
name: "enyo.Repeater",
published: {
count: 0
},
events: {
onSetupItem: ""
},
create: function() {
this.inherited(arguments), this.countChanged();
},
initComponents: function() {
this.itemComponents = this.components || this.kindComponents, this.components = this.kindComponents = null, this.inherited(arguments);
},
countChanged: function() {
this.build();
},
itemAtIndex: function(e) {
return this.controlAtIndex(e);
},
build: function() {
this.destroyClientControls();
for (var e = 0, t; e < this.count; e++) t = this.createComponent({
kind: "enyo.OwnerProxy",
index: e
}), t.createComponents(this.itemComponents), this.doSetupItem({
index: e,
item: t
});
this.render();
},
renderRow: function(e) {
var t = this.itemAtIndex(e);
this.doSetupItem({
index: e,
item: t
});
}
}), enyo.kind({
name: "enyo.OwnerProxy",
tag: null,
decorateEvent: function(e, t, n) {
t && (t.index = this.index), this.inherited(arguments);
},
delegateEvent: function(e, t, n, r, i) {
return e == this && (e = this.owner.owner), this.inherited(arguments, [ e, t, n, r, i ]);
}
});

// DragAvatar.js

enyo.kind({
name: "enyo._DragAvatar",
style: "position: absolute; z-index: 10; pointer-events: none; cursor: move;",
showing: !1,
showingChanged: function() {
this.inherited(arguments), document.body.style.cursor = this.showing ? "move" : null;
}
}), enyo.kind({
name: "enyo.DragAvatar",
kind: enyo.Component,
published: {
showing: !1,
offsetX: 20,
offsetY: 30
},
initComponents: function() {
this.avatarComponents = this.components, this.components = null, this.inherited(arguments);
},
requireAvatar: function() {
this.avatar || (this.avatar = this.createComponent({
kind: enyo._DragAvatar,
parentNode: document.body,
showing: !1,
components: this.avatarComponents
}).render());
},
showingChanged: function() {
this.avatar.setShowing(this.showing), document.body.style.cursor = this.showing ? "move" : null;
},
drag: function(e) {
this.requireAvatar(), this.avatar.setBounds({
top: e.pageY - this.offsetY,
left: e.pageX + this.offsetX
}), this.show();
},
show: function() {
this.setShowing(!0);
},
hide: function() {
this.setShowing(!1);
}
});

// FloatingLayer.js

enyo.kind({
name: "enyo.FloatingLayer",
create: function() {
this.inherited(arguments), this.setParent(null);
},
render: function() {
return this.parentNode = document.body, this.inherited(arguments);
},
generateInnerHtml: function() {
return "";
},
beforeChildRender: function() {
this.hasNode() || this.render();
},
teardownChildren: function() {}
}), enyo.floatingLayer = new enyo.FloatingLayer;

// Popup.js

enyo.kind({
name: "enyo.Popup",
classes: "enyo-popup enyo-no-touch-action",
published: {
modal: !1,
autoDismiss: !0,
floating: !1,
centered: !1
},
showing: !1,
handlers: {
ondown: "down",
onkeydown: "keydown",
ondragstart: "dragstart",
onfocus: "focus",
onblur: "blur",
onRequestShow: "requestShow",
onRequestHide: "requestHide"
},
captureEvents: !0,
events: {
onShow: "",
onHide: ""
},
tools: [ {
kind: "Signals",
onKeydown: "keydown"
} ],
create: function() {
this.inherited(arguments), this.canGenerate = !this.floating;
},
render: function() {
this.floating && (enyo.floatingLayer.hasNode() || enyo.floatingLayer.render(), this.parentNode = enyo.floatingLayer.hasNode()), this.inherited(arguments);
},
destroy: function() {
this.showing && this.release(), this.inherited(arguments);
},
reflow: function() {
this.updatePosition(), this.inherited(arguments);
},
calcViewportSize: function() {
if (window.innerWidth) return {
width: window.innerWidth,
height: window.innerHeight
};
var e = document.documentElement;
return {
width: e.offsetWidth,
height: e.offsetHeight
};
},
updatePosition: function() {
var e = this.calcViewportSize(), t = this.getBounds();
if (this.targetPosition) {
var n = this.targetPosition;
typeof n.left == "number" ? n.left + t.width > e.width ? (n.left - t.width >= 0 ? n.right = e.width - n.left : n.right = 0, n.left = null) : n.right = null : typeof n.right == "number" && (n.right + t.width > e.width ? (n.right - t.width >= 0 ? n.left = e.width - n.right : n.left = 0, n.right = null) : n.left = null), typeof n.top == "number" ? n.top + t.height > e.height ? (n.top - t.height >= 0 ? n.bottom = e.height - n.top : n.bottom = 0, n.top = null) : n.bottom = null : typeof n.bottom == "number" && (n.bottom + t.height > e.height ? (n.bottom - t.height >= 0 ? n.top = e.height - n.bottom : n.top = 0, n.bottom = null) : n.top = null), this.addStyles("left: " + (n.left !== null ? n.left + "px" : "initial") + "; right: " + (n.right !== null ? n.right + "px" : "initial") + "; top: " + (n.top !== null ? n.top + "px" : "initial") + "; bottom: " + (n.bottom !== null ? n.bottom + "px" : "initial") + ";");
} else this.centered && this.addStyles("top: " + Math.max((e.height - t.height) / 2, 0) + "px; left: " + Math.max((e.width - t.width) / 2, 0) + "px;");
},
showingChanged: function() {
this.floating && this.showing && !this.hasNode() && this.render();
if (this.centered || this.targetPosition) this.applyStyle("visibility", "hidden"), this.addStyles("top: 0px; left: 0px; right: initial; bottom: initial;");
this.inherited(arguments), this.showing ? (this.resized(), this.captureEvents && this.capture()) : this.captureEvents && this.release(), (this.centered || this.targetPosition) && this.applyStyle("visibility", null), this.hasNode() && this[this.showing ? "doShow" : "doHide"]();
},
capture: function() {
enyo.dispatcher.capture(this, !this.modal);
},
release: function() {
enyo.dispatcher.release();
},
down: function(e, t) {
this.downEvent = t, this.modal && !t.dispatchTarget.isDescendantOf(this) && t.preventDefault();
},
tap: function(e, t) {
if (this.autoDismiss && !t.dispatchTarget.isDescendantOf(this) && this.downEvent && !this.downEvent.dispatchTarget.isDescendantOf(this)) return this.downEvent = null, this.hide(), !0;
},
dragstart: function(e, t) {
var n = t.dispatchTarget === this || t.dispatchTarget.isDescendantOf(this);
return e.autoDismiss && !n && e.setShowing(!1), !0;
},
keydown: function(e, t) {
this.showing && this.autoDismiss && t.keyCode == 27 && this.hide();
},
blur: function(e, t) {
t.dispatchTarget.isDescendantOf(this) && (this.lastFocus = t.originator);
},
focus: function(e, t) {
var n = t.dispatchTarget;
if (this.modal && !n.isDescendantOf(this)) {
n.hasNode() && n.node.blur();
var r = this.lastFocus && this.lastFocus.hasNode() || this.hasNode();
r && r.focus();
}
},
requestShow: function(e, t) {
return this.show(), !0;
},
requestHide: function(e, t) {
return this.hide(), !0;
},
showAtEvent: function(e, t) {
var n = {
left: e.centerX || e.clientX || e.pageX,
top: e.centerY || e.clientY || e.pageY
};
t && (n.left += t.left || 0, n.top += t.top || 0), this.showAtPosition(n);
},
showAtPosition: function(e) {
this.targetPosition = e, this.show();
}
});

// Selection.js

enyo.kind({
name: "enyo.Selection",
kind: enyo.Component,
published: {
multi: !1
},
events: {
onSelect: "",
onDeselect: "",
onChange: ""
},
create: function() {
this.clear(), this.inherited(arguments);
},
multiChanged: function() {
this.multi || this.clear(), this.doChange();
},
highlander: function(e) {
this.multi || this.deselect(this.lastSelected);
},
clear: function() {
this.selected = {};
},
isSelected: function(e) {
return this.selected[e];
},
setByKey: function(e, t, n) {
if (t) this.selected[e] = n || !0, this.lastSelected = e, this.doSelect({
key: e,
data: this.selected[e]
}); else {
var r = this.isSelected(e);
delete this.selected[e], this.doDeselect({
key: e,
data: r
});
}
this.doChange();
},
deselect: function(e) {
this.isSelected(e) && this.setByKey(e, !1);
},
select: function(e, t) {
this.multi ? this.setByKey(e, !this.isSelected(e), t) : this.isSelected(e) || (this.highlander(), this.setByKey(e, !0, t));
},
toggle: function(e, t) {
!this.multi && this.lastSelected != e && this.deselect(this.lastSelected), this.setByKey(e, !this.isSelected(e), t);
},
getSelected: function() {
return this.selected;
},
remove: function(e) {
var t = {};
for (var n in this.selected) n < e ? t[n] = this.selected[n] : n > e && (t[n - 1] = this.selected[n]);
this.selected = t;
}
});

// DefaultRootView.js

enyo.kind({
name: "enyo.defaultRootView",
kind: "enyo.Control",
content: "No root view was passed to enyo.App"
});

// FittableLayout.js

enyo.kind({
name: "enyo.FittableLayout",
kind: "Layout",
calcFitIndex: function() {
for (var e = 0, t = this.container.children, n; n = t[e]; e++) if (n.fit && n.showing) return e;
},
getFitControl: function() {
var e = this.container.children, t = e[this.fitIndex];
return t && t.fit && t.showing || (this.fitIndex = this.calcFitIndex(), t = e[this.fitIndex]), t;
},
getLastControl: function() {
var e = this.container.children, t = e.length - 1, n = e[t];
while ((n = e[t]) && !n.showing) t--;
return n;
},
_reflow: function(e, t, n, r) {
this.container.addRemoveClass("enyo-stretch", !this.container.noStretch);
var i = this.getFitControl();
if (!i) return;
var s = 0, o = 0, u = 0, a, f = this.container.hasNode();
f && (a = enyo.dom.calcPaddingExtents(f), s = f[t] - (a[n] + a[r]));
var l = i.getBounds();
o = l[n] - (a && a[n] || 0);
var c = this.getLastControl();
if (c) {
var h = enyo.dom.getComputedBoxValue(c.hasNode(), "margin", r) || 0;
if (c != i) {
var p = c.getBounds(), d = l[n] + l[e], v = p[n] + p[e] + h;
u = v - d;
} else u = h;
}
var m = s - (o + u);
i.applyStyle(e, m + "px");
},
reflow: function() {
this.orient == "h" ? this._reflow("width", "clientWidth", "left", "right") : this._reflow("height", "clientHeight", "top", "bottom");
}
}), enyo.kind({
name: "enyo.FittableColumnsLayout",
kind: "FittableLayout",
orient: "h",
layoutClass: "enyo-fittable-columns-layout"
}), enyo.kind({
name: "enyo.FittableRowsLayout",
kind: "FittableLayout",
layoutClass: "enyo-fittable-rows-layout",
orient: "v"
});

// FittableRows.js

enyo.kind({
name: "enyo.FittableRows",
layoutKind: "FittableRowsLayout",
noStretch: !1
});

// FittableColumns.js

enyo.kind({
name: "enyo.FittableColumns",
layoutKind: "FittableColumnsLayout",
noStretch: !1
});

// FlyweightRepeater.js

enyo.kind({
name: "enyo.FlyweightRepeater",
published: {
count: 0,
noSelect: !1,
multiSelect: !1,
toggleSelected: !1,
clientClasses: "",
clientStyle: "",
rowOffset: 0
},
events: {
onSetupItem: "",
onRenderRow: ""
},
bottomUp: !1,
components: [ {
kind: "Selection",
onSelect: "selectDeselect",
onDeselect: "selectDeselect"
}, {
name: "client"
} ],
create: function() {
this.inherited(arguments), this.noSelectChanged(), this.multiSelectChanged(), this.clientClassesChanged(), this.clientStyleChanged();
},
noSelectChanged: function() {
this.noSelect && this.$.selection.clear();
},
multiSelectChanged: function() {
this.$.selection.setMulti(this.multiSelect);
},
clientClassesChanged: function() {
this.$.client.setClasses(this.clientClasses);
},
clientStyleChanged: function() {
this.$.client.setStyle(this.clientStyle);
},
setupItem: function(e) {
this.doSetupItem({
index: e,
selected: this.isSelected(e)
});
},
generateChildHtml: function() {
var e = "";
this.index = null;
for (var t = 0, n = 0; t < this.count; t++) n = this.rowOffset + (this.bottomUp ? this.count - t - 1 : t), this.setupItem(n), this.$.client.setAttribute("data-enyo-index", n), e += this.inherited(arguments), this.$.client.teardownRender();
return e;
},
previewDomEvent: function(e) {
var t = this.index = this.rowForEvent(e);
e.rowIndex = e.index = t, e.flyweight = this;
},
decorateEvent: function(e, t, n) {
var r = t && t.index != null ? t.index : this.index;
t && r != null && (t.index = r, t.flyweight = this), this.inherited(arguments);
},
tap: function(e, t) {
if (this.noSelect || t.index === -1) return;
this.toggleSelected ? this.$.selection.toggle(t.index) : this.$.selection.select(t.index);
},
selectDeselect: function(e, t) {
this.renderRow(t.key);
},
getSelection: function() {
return this.$.selection;
},
isSelected: function(e) {
return this.getSelection().isSelected(e);
},
renderRow: function(e) {
if (e < this.rowOffset || e >= this.count + this.rowOffset) return;
this.setupItem(e);
var t = this.fetchRowNode(e);
t && (enyo.dom.setInnerHtml(t, this.$.client.generateChildHtml()), this.$.client.teardownChildren(), this.doRenderRow({
rowIndex: e
}));
},
fetchRowNode: function(e) {
if (this.hasNode()) return this.node.querySelector('[data-enyo-index="' + e + '"]');
},
rowForEvent: function(e) {
if (!this.hasNode()) return -1;
var t = e.target;
while (t && t !== this.node) {
var n = t.getAttribute && t.getAttribute("data-enyo-index");
if (n !== null) return Number(n);
t = t.parentNode;
}
return -1;
},
prepareRow: function(e) {
if (e < 0 || e >= this.count) return;
this.setupItem(e);
var t = this.fetchRowNode(e);
enyo.FlyweightRepeater.claimNode(this.$.client, t);
},
lockRow: function() {
this.$.client.teardownChildren();
},
performOnRow: function(e, t, n) {
if (e < 0 || e >= this.count) return;
t && (this.prepareRow(e), enyo.call(n || null, t), this.lockRow());
},
statics: {
claimNode: function(e, t) {
var n;
t && (t.id !== e.id ? n = t.querySelector("#" + e.id) : n = t), e.generated = Boolean(n || !e.tag), e.node = n, e.node && e.rendered();
for (var r = 0, i = e.children, s; s = i[r]; r++) this.claimNode(s, t);
}
}
});

// List.js

enyo.kind({
name: "enyo.List",
kind: "Scroller",
classes: "enyo-list",
published: {
count: 0,
rowsPerPage: 50,
bottomUp: !1,
noSelect: !1,
multiSelect: !1,
toggleSelected: !1,
fixedHeight: !1,
reorderable: !1,
centerReorderContainer: !0,
reorderComponents: [],
pinnedReorderComponents: [],
swipeableComponents: [],
enableSwipe: !1,
persistSwipeableItem: !1
},
events: {
onSetupItem: "",
onSetupReorderComponents: "",
onSetupPinnedReorderComponents: "",
onReorder: "",
onSetupSwipeItem: "",
onSwipeDrag: "",
onSwipe: "",
onSwipeComplete: ""
},
handlers: {
onAnimateFinish: "animateFinish",
onRenderRow: "rowRendered",
ondragstart: "dragstart",
ondrag: "drag",
ondragfinish: "dragfinish",
onup: "up",
onholdpulse: "holdpulse"
},
rowHeight: 0,
listTools: [ {
name: "port",
classes: "enyo-list-port enyo-border-box",
components: [ {
name: "generator",
kind: "FlyweightRepeater",
canGenerate: !1,
components: [ {
tag: null,
name: "client"
} ]
}, {
name: "holdingarea",
allowHtml: !0,
classes: "enyo-list-holdingarea"
}, {
name: "page0",
allowHtml: !0,
classes: "enyo-list-page"
}, {
name: "page1",
allowHtml: !0,
classes: "enyo-list-page"
}, {
name: "placeholder"
}, {
name: "swipeableComponents",
style: "position:absolute; display:block; top:-1000px; left:0;"
} ]
} ],
reorderHoldTimeMS: 600,
draggingRowIndex: -1,
draggingRowNode: null,
placeholderRowIndex: -1,
dragToScrollThreshold: .1,
prevScrollTop: 0,
autoScrollTimeoutMS: 20,
autoScrollTimeout: null,
autoscrollPageY: 0,
pinnedReorderMode: !1,
initialPinPosition: -1,
itemMoved: !1,
currentPageNumber: -1,
completeReorderTimeout: null,
swipeIndex: null,
swipeDirection: null,
persistentItemVisible: !1,
persistentItemOrigin: null,
swipeComplete: !1,
completeSwipeTimeout: null,
completeSwipeDelayMS: 500,
normalSwipeSpeedMS: 200,
fastSwipeSpeedMS: 100,
percentageDraggedThreshold: .2,
importProps: function(e) {
e && e.reorderable && (this.touch = !0), this.inherited(arguments);
},
create: function() {
this.pageHeights = [], this.inherited(arguments), this.getStrategy().translateOptimized = !0, this.bottomUpChanged(), this.noSelectChanged(), this.multiSelectChanged(), this.toggleSelectedChanged(), this.$.generator.setRowOffset(0), this.$.generator.setCount(this.count);
},
initComponents: function() {
this.createReorderTools(), this.inherited(arguments), this.createSwipeableComponents();
},
createReorderTools: function() {
this.createComponent({
name: "reorderContainer",
classes: "enyo-list-reorder-container",
ondown: "sendToStrategy",
ondrag: "sendToStrategy",
ondragstart: "sendToStrategy",
ondragfinish: "sendToStrategy",
onflick: "sendToStrategy"
});
},
createStrategy: function() {
this.controlParentName = "strategy", this.inherited(arguments), this.createChrome(this.listTools), this.controlParentName = "client", this.discoverControlParent();
},
createSwipeableComponents: function() {
for (var e = 0; e < this.swipeableComponents.length; e++) this.$.swipeableComponents.createComponent(this.swipeableComponents[e], {
owner: this.owner
});
},
rendered: function() {
this.inherited(arguments), this.$.generator.node = this.$.port.hasNode(), this.$.generator.generated = !0, this.reset();
},
resizeHandler: function() {
this.inherited(arguments), this.refresh();
},
bottomUpChanged: function() {
this.$.generator.bottomUp = this.bottomUp, this.$.page0.applyStyle(this.pageBound, null), this.$.page1.applyStyle(this.pageBound, null), this.pageBound = this.bottomUp ? "bottom" : "top", this.hasNode() && this.reset();
},
noSelectChanged: function() {
this.$.generator.setNoSelect(this.noSelect);
},
multiSelectChanged: function() {
this.$.generator.setMultiSelect(this.multiSelect);
},
toggleSelectedChanged: function() {
this.$.generator.setToggleSelected(this.toggleSelected);
},
countChanged: function() {
this.hasNode() && this.updateMetrics();
},
sendToStrategy: function(e, t) {
this.$.strategy.dispatchEvent("on" + t.type, t, e);
},
updateMetrics: function() {
this.defaultPageHeight = this.rowsPerPage * (this.rowHeight || 100), this.pageCount = Math.ceil(this.count / this.rowsPerPage), this.portSize = 0;
for (var e = 0; e < this.pageCount; e++) this.portSize += this.getPageHeight(e);
this.adjustPortSize();
},
holdpulse: function(e, t) {
if (!this.getReorderable() || this.isReordering()) return;
if (t.holdTime >= this.reorderHoldTimeMS && this.shouldStartReordering(e, t)) return t.preventDefault(), this.startReordering(t), !1;
},
dragstart: function(e, t) {
if (this.isReordering()) return !0;
if (this.isSwipeable()) return this.swipeDragStart(e, t);
},
drag: function(e, t) {
if (this.shouldDoReorderDrag(t)) return t.preventDefault(), this.reorderDrag(t), !0;
if (this.isSwipeable()) return t.preventDefault(), this.swipeDrag(e, t), !0;
},
dragfinish: function(e, t) {
this.isReordering() ? this.finishReordering(e, t) : this.isSwipeable() && this.swipeDragFinish(e, t);
},
up: function(e, t) {
this.isReordering() && this.finishReordering(e, t);
},
generatePage: function(e, t) {
this.page = e;
var n = this.rowsPerPage * this.page;
this.$.generator.setRowOffset(n);
var r = Math.min(this.count - n, this.rowsPerPage);
this.$.generator.setCount(r);
var i = this.$.generator.generateChildHtml();
t.setContent(i), this.getReorderable() && this.draggingRowIndex > -1 && this.hideReorderingRow();
var s = t.getBounds().height;
!this.rowHeight && s > 0 && (this.rowHeight = Math.floor(s / r), this.updateMetrics());
if (!this.fixedHeight) {
var o = this.getPageHeight(e);
this.pageHeights[e] = s, this.portSize += s - o;
}
},
pageForRow: function(e) {
return Math.floor(e / this.rowsPerPage);
},
preserveDraggingRowNode: function(e) {
this.draggingRowNode && this.pageForRow(this.draggingRowIndex) === e && (this.$.holdingarea.hasNode().appendChild(this.draggingRowNode), this.draggingRowNode = null, this.removedInitialPage = !0);
},
update: function(e) {
var t = !1, n = this.positionToPageInfo(e), r = n.pos + this.scrollerHeight / 2, i = Math.floor(r / Math.max(n.height, this.scrollerHeight) + .5) + n.no, s = i % 2 === 0 ? i : i - 1;
this.p0 != s && this.isPageInRange(s) && (this.preserveDraggingRowNode(this.p0), this.generatePage(s, this.$.page0), this.positionPage(s, this.$.page0), this.p0 = s, t = !0, this.p0RowBounds = this.getPageRowHeights(this.$.page0)), s = i % 2 === 0 ? Math.max(1, i - 1) : i, this.p1 != s && this.isPageInRange(s) && (this.preserveDraggingRowNode(this.p1), this.generatePage(s, this.$.page1), this.positionPage(s, this.$.page1), this.p1 = s, t = !0, this.p1RowBounds = this.getPageRowHeights(this.$.page1)), t && (this.$.generator.setRowOffset(0), this.$.generator.setCount(this.count), this.fixedHeight || (this.adjustBottomPage(), this.adjustPortSize()));
},
getPageRowHeights: function(e) {
var t = {}, n = e.hasNode().querySelectorAll("div[data-enyo-index]");
for (var r = 0, i, s; r < n.length; r++) i = n[r].getAttribute("data-enyo-index"), i !== null && (s = enyo.dom.getBounds(n[r]), t[parseInt(i, 10)] = {
height: s.height,
width: s.width
});
return t;
},
updateRowBounds: function(e) {
this.p0RowBounds[e] ? this.updateRowBoundsAtIndex(e, this.p0RowBounds, this.$.page0) : this.p1RowBounds[e] && this.updateRowBoundsAtIndex(e, this.p1RowBounds, this.$.page1);
},
updateRowBoundsAtIndex: function(e, t, n) {
var r = n.hasNode().querySelector('div[data-enyo-index="' + e + '"]'), i = enyo.dom.getBounds(r);
t[e].height = i.height, t[e].width = i.width;
},
updateForPosition: function(e) {
this.update(this.calcPos(e));
},
calcPos: function(e) {
return this.bottomUp ? this.portSize - this.scrollerHeight - e : e;
},
adjustBottomPage: function() {
var e = this.p0 >= this.p1 ? this.$.page0 : this.$.page1;
this.positionPage(e.pageNo, e);
},
adjustPortSize: function() {
this.scrollerHeight = this.getBounds().height;
var e = Math.max(this.scrollerHeight, this.portSize);
this.$.port.applyStyle("height", e + "px");
},
positionPage: function(e, t) {
t.pageNo = e;
var n = this.pageToPosition(e);
t.applyStyle(this.pageBound, n + "px");
},
pageToPosition: function(e) {
var t = 0, n = e;
while (n > 0) n--, t += this.getPageHeight(n);
return t;
},
positionToPageInfo: function(e) {
var t = -1, n = this.calcPos(e), r = this.defaultPageHeight;
while (n >= 0) t++, r = this.getPageHeight(t), n -= r;
return t = Math.max(t, 0), {
no: t,
height: r,
pos: n + r,
startRow: t * this.rowsPerPage,
endRow: Math.min((t + 1) * this.rowsPerPage - 1, this.count - 1)
};
},
isPageInRange: function(e) {
return e == Math.max(0, Math.min(this.pageCount - 1, e));
},
getPageHeight: function(e) {
var t = this.pageHeights[e];
if (!t) {
var n = this.rowsPerPage * e, r = Math.min(this.count - n, this.rowsPerPage);
t = this.defaultPageHeight * (r / this.rowsPerPage);
}
return Math.max(1, t);
},
invalidatePages: function() {
this.p0 = this.p1 = null, this.p0RowBounds = {}, this.p1RowBounds = {}, this.$.page0.setContent(""), this.$.page1.setContent("");
},
invalidateMetrics: function() {
this.pageHeights = [], this.rowHeight = 0, this.updateMetrics();
},
scroll: function(e, t) {
var n = this.inherited(arguments), r = this.getScrollTop();
return this.lastPos === r ? n : (this.lastPos = r, this.update(r), this.pinnedReorderMode && this.reorderScroll(e, t), n);
},
setScrollTop: function(e) {
this.update(e), this.inherited(arguments), this.twiddle();
},
getScrollPosition: function() {
return this.calcPos(this.getScrollTop());
},
setScrollPosition: function(e) {
this.setScrollTop(this.calcPos(e));
},
scrollToBottom: function() {
this.update(this.getScrollBounds().maxTop), this.inherited(arguments);
},
scrollToRow: function(e) {
var t = this.pageForRow(e), n = e % this.rowsPerPage, r = this.pageToPosition(t);
this.updateForPosition(r), r = this.pageToPosition(t), this.setScrollPosition(r);
if (t == this.p0 || t == this.p1) {
var i = this.$.generator.fetchRowNode(e);
if (i) {
var s = i.offsetTop;
this.bottomUp && (s = this.getPageHeight(t) - i.offsetHeight - s);
var o = this.getScrollPosition() + s;
this.setScrollPosition(o);
}
}
},
scrollToStart: function() {
this[this.bottomUp ? "scrollToBottom" : "scrollToTop"]();
},
scrollToEnd: function() {
this[this.bottomUp ? "scrollToTop" : "scrollToBottom"]();
},
refresh: function() {
this.invalidatePages(), this.update(this.getScrollTop()), this.stabilize(), enyo.platform.android === 4 && this.twiddle();
},
reset: function() {
this.getSelection().clear(), this.invalidateMetrics(), this.invalidatePages(), this.stabilize(), this.scrollToStart();
},
getSelection: function() {
return this.$.generator.getSelection();
},
select: function(e, t) {
return this.getSelection().select(e, t);
},
deselect: function(e) {
return this.getSelection().deselect(e);
},
isSelected: function(e) {
return this.$.generator.isSelected(e);
},
renderRow: function(e) {
this.$.generator.renderRow(e);
},
rowRendered: function(e, t) {
this.updateRowBounds(t.rowIndex);
},
prepareRow: function(e) {
this.$.generator.prepareRow(e);
},
lockRow: function() {
this.$.generator.lockRow();
},
performOnRow: function(e, t, n) {
this.$.generator.performOnRow(e, t, n);
},
animateFinish: function(e) {
return this.twiddle(), !0;
},
twiddle: function() {
var e = this.getStrategy();
enyo.call(e, "twiddle");
},
pageForPageNumber: function(e, t) {
return e % 2 === 0 ? !t || e === this.p0 ? this.$.page0 : null : !t || e === this.p1 ? this.$.page1 : null;
},
shouldStartReordering: function(e, t) {
return !!this.getReorderable() && t.rowIndex >= 0 && !this.pinnedReorderMode && e === this.$.strategy && t.index >= 0 ? !0 : !1;
},
startReordering: function(e) {
this.$.strategy.listReordering = !0, this.buildReorderContainer(), this.doSetupReorderComponents(e), this.styleReorderContainer(e), this.draggingRowIndex = this.placeholderRowIndex = e.rowIndex, this.draggingRowNode = e.target, this.removedInitialPage = !1, this.itemMoved = !1, this.initialPageNumber = this.currentPageNumber = this.pageForRow(e.rowIndex), this.prevScrollTop = this.getScrollTop(), this.replaceNodeWithPlaceholder(e.rowIndex);
},
buildReorderContainer: function() {
this.$.reorderContainer.destroyClientControls();
for (var e = 0; e < this.reorderComponents.length; e++) this.$.reorderContainer.createComponent(this.reorderComponents[e], {
owner: this.owner
});
this.$.reorderContainer.render();
},
styleReorderContainer: function(e) {
this.setItemPosition(this.$.reorderContainer, e.rowIndex), this.setItemBounds(this.$.reorderContainer, e.rowIndex), this.$.reorderContainer.setShowing(!0), this.centerReorderContainer && this.centerReorderContainerOnPointer(e);
},
appendNodeToReorderContainer: function(e) {
this.$.reorderContainer.createComponent({
allowHtml: !0,
content: e.innerHTML
}).render();
},
centerReorderContainerOnPointer: function(e) {
var t = enyo.dom.calcNodePosition(this.hasNode()), n = e.pageX - t.left - parseInt(this.$.reorderContainer.domStyles.width, 10) / 2, r = e.pageY - t.top + this.getScrollTop() - parseInt(this.$.reorderContainer.domStyles.height, 10) / 2;
this.getStrategyKind() != "ScrollStrategy" && (n -= this.getScrollLeft(), r -= this.getScrollTop()), this.positionReorderContainer(n, r);
},
positionReorderContainer: function(e, t) {
this.$.reorderContainer.addClass("enyo-animatedTopAndLeft"), this.$.reorderContainer.addStyles("left:" + e + "px;top:" + t + "px;"), this.setPositionReorderContainerTimeout();
},
setPositionReorderContainerTimeout: function() {
this.clearPositionReorderContainerTimeout(), this.positionReorderContainerTimeout = setTimeout(enyo.bind(this, function() {
this.$.reorderContainer.removeClass("enyo-animatedTopAndLeft"), this.clearPositionReorderContainerTimeout();
}), 100);
},
clearPositionReorderContainerTimeout: function() {
this.positionReorderContainerTimeout && (clearTimeout(this.positionReorderContainerTimeout), this.positionReorderContainerTimeout = null);
},
shouldDoReorderDrag: function() {
return !this.getReorderable() || this.draggingRowIndex < 0 || this.pinnedReorderMode ? !1 : !0;
},
reorderDrag: function(e) {
this.positionReorderNode(e), this.checkForAutoScroll(e), this.updatePlaceholderPosition(e.pageY);
},
updatePlaceholderPosition: function(e) {
var t = this.getRowIndexFromCoordinate(e);
t !== -1 && (t >= this.placeholderRowIndex ? this.movePlaceholderToIndex(Math.min(this.count, t + 1)) : this.movePlaceholderToIndex(t));
},
positionReorderNode: function(e) {
var t = this.$.reorderContainer.getBounds(), n = t.left + e.ddx, r = t.top + e.ddy;
r = this.getStrategyKind() == "ScrollStrategy" ? r + (this.getScrollTop() - this.prevScrollTop) : r, this.$.reorderContainer.addStyles("top: " + r + "px ; left: " + n + "px"), this.prevScrollTop = this.getScrollTop();
},
checkForAutoScroll: function(e) {
var t = enyo.dom.calcNodePosition(this.hasNode()), n = this.getBounds(), r;
this.autoscrollPageY = e.pageY, e.pageY - t.top < n.height * this.dragToScrollThreshold ? (r = 100 * (1 - (e.pageY - t.top) / (n.height * this.dragToScrollThreshold)), this.scrollDistance = -1 * r) : e.pageY - t.top > n.height * (1 - this.dragToScrollThreshold) ? (r = 100 * ((e.pageY - t.top - n.height * (1 - this.dragToScrollThreshold)) / (n.height - n.height * (1 - this.dragToScrollThreshold))), this.scrollDistance = 1 * r) : this.scrollDistance = 0, this.scrollDistance === 0 ? this.stopAutoScrolling() : this.autoScrollTimeout || this.startAutoScrolling();
},
stopAutoScrolling: function() {
this.autoScrollTimeout && (clearTimeout(this.autoScrollTimeout), this.autoScrollTimeout = null);
},
startAutoScrolling: function() {
this.autoScrollTimeout = setInterval(enyo.bind(this, this.autoScroll), this.autoScrollTimeoutMS);
},
autoScroll: function() {
this.scrollDistance === 0 ? this.stopAutoScrolling() : this.autoScrollTimeout || this.startAutoScrolling(), this.setScrollPosition(this.getScrollPosition() + this.scrollDistance), this.positionReorderNode({
ddx: 0,
ddy: 0
}), this.updatePlaceholderPosition(this.autoscrollPageY);
},
movePlaceholderToIndex: function(e) {
var t, n;
if (e < 0) return;
e >= this.count ? (t = null, n = this.pageForPageNumber(this.pageForRow(this.count - 1)).hasNode()) : (t = this.$.generator.fetchRowNode(e), n = t.parentNode);
var r = this.pageForRow(e);
r >= this.pageCount && (r = this.currentPageNumber), n.insertBefore(this.placeholderNode, t), this.currentPageNumber !== r && (this.updatePageHeight(this.currentPageNumber), this.updatePageHeight(r), this.updatePagePositions(r)), this.placeholderRowIndex = e, this.currentPageNumber = r, this.itemMoved = !0;
},
finishReordering: function(e, t) {
if (!this.isReordering() || this.pinnedReorderMode || this.completeReorderTimeout) return;
return this.stopAutoScrolling(), this.$.strategy.listReordering = !1, this.moveReorderedContainerToDroppedPosition(t), this.completeReorderTimeout = setTimeout(enyo.bind(this, this.completeFinishReordering, t), 100), t.preventDefault(), !0;
},
moveReorderedContainerToDroppedPosition: function() {
var e = this.getRelativeOffset(this.placeholderNode, this.hasNode()), t = this.getStrategyKind() == "ScrollStrategy" ? e.top : e.top - this.getScrollTop(), n = e.left - this.getScrollLeft();
this.positionReorderContainer(n, t);
},
completeFinishReordering: function(e) {
this.completeReorderTimeout = null, this.placeholderRowIndex > this.draggingRowIndex && (this.placeholderRowIndex = Math.max(0, this.placeholderRowIndex - 1));
if (this.draggingRowIndex == this.placeholderRowIndex && this.pinnedReorderComponents.length && !this.pinnedReorderMode && !this.itemMoved) {
this.beginPinnedReorder(e);
return;
}
this.removeDraggingRowNode(), this.removePlaceholderNode(), this.emptyAndHideReorderContainer(), this.pinnedReorderMode = !1, this.reorderRows(e), this.draggingRowIndex = this.placeholderRowIndex = -1, this.refresh();
},
beginPinnedReorder: function(e) {
this.buildPinnedReorderContainer(), this.doSetupPinnedReorderComponents(enyo.mixin(e, {
index: this.draggingRowIndex
})), this.pinnedReorderMode = !0, this.initialPinPosition = e.pageY;
},
emptyAndHideReorderContainer: function() {
this.$.reorderContainer.destroyComponents(), this.$.reorderContainer.setShowing(!1);
},
buildPinnedReorderContainer: function() {
this.$.reorderContainer.destroyClientControls();
for (var e = 0; e < this.pinnedReorderComponents.length; e++) this.$.reorderContainer.createComponent(this.pinnedReorderComponents[e], {
owner: this.owner
});
this.$.reorderContainer.render();
},
reorderRows: function(e) {
this.doReorder(this.makeReorderEvent(e)), this.positionReorderedNode(), this.updateListIndices();
},
makeReorderEvent: function(e) {
return e.reorderFrom = this.draggingRowIndex, e.reorderTo = this.placeholderRowIndex, e;
},
positionReorderedNode: function() {
if (!this.removedInitialPage) {
var e = this.$.generator.fetchRowNode(this.placeholderRowIndex);
e && (e.parentNode.insertBefore(this.hiddenNode, e), this.showNode(this.hiddenNode)), this.hiddenNode = null;
if (this.currentPageNumber != this.initialPageNumber) {
var t, n, r = this.pageForPageNumber(this.currentPageNumber), i = this.pageForPageNumber(this.currentPageNumber + 1);
this.initialPageNumber < this.currentPageNumber ? (t = r.hasNode().firstChild, i.hasNode().appendChild(t)) : (t = r.hasNode().lastChild, n = i.hasNode().firstChild, i.hasNode().insertBefore(t, n)), this.correctPageHeights(), this.updatePagePositions(this.initialPageNumber);
}
}
},
updateListIndices: function() {
if (this.shouldDoRefresh()) {
this.refresh(), this.correctPageHeights();
return;
}
var e = Math.min(this.draggingRowIndex, this.placeholderRowIndex), t = Math.max(this.draggingRowIndex, this.placeholderRowIndex), n = this.draggingRowIndex - this.placeholderRowIndex > 0 ? 1 : -1, r, i, s, o;
if (n === 1) {
r = this.$.generator.fetchRowNode(this.draggingRowIndex), r && r.setAttribute("data-enyo-index", "reordered");
for (i = t - 1, s = t; i >= e; i--) {
r = this.$.generator.fetchRowNode(i);
if (!r) continue;
o = parseInt(r.getAttribute("data-enyo-index"), 10), s = o + 1, r.setAttribute("data-enyo-index", s);
}
r = this.hasNode().querySelector('[data-enyo-index="reordered"]'), r.setAttribute("data-enyo-index", this.placeholderRowIndex);
} else {
r = this.$.generator.fetchRowNode(this.draggingRowIndex), r && r.setAttribute("data-enyo-index", this.placeholderRowIndex);
for (i = e + 1, s = e; i <= t; i++) {
r = this.$.generator.fetchRowNode(i);
if (!r) continue;
o = parseInt(r.getAttribute("data-enyo-index"), 10), s = o - 1, r.setAttribute("data-enyo-index", s);
}
}
},
shouldDoRefresh: function() {
return Math.abs(this.initialPageNumber - this.currentPageNumber) > 1;
},
getNodeStyle: function(e) {
var t = this.$.generator.fetchRowNode(e);
if (!t) return;
var n = this.getRelativeOffset(t, this.hasNode()), r = enyo.dom.getBounds(t);
return {
h: r.height,
w: r.width,
left: n.left,
top: n.top
};
},
getRelativeOffset: function(e, t) {
var n = {
top: 0,
left: 0
};
if (e !== t && e.parentNode) do n.top += e.offsetTop || 0, n.left += e.offsetLeft || 0, e = e.offsetParent; while (e && e !== t);
return n;
},
replaceNodeWithPlaceholder: function(e) {
var t = this.$.generator.fetchRowNode(e);
if (!t) {
enyo.log("No node - " + e);
return;
}
this.placeholderNode = this.createPlaceholderNode(t), this.hiddenNode = this.hideNode(t);
var n = this.pageForPageNumber(this.currentPageNumber);
n.hasNode().insertBefore(this.placeholderNode, this.hiddenNode);
},
createPlaceholderNode: function(e) {
var t = this.$.placeholder.hasNode().cloneNode(!0), n = enyo.dom.getBounds(e);
return t.style.height = n.height + "px", t.style.width = n.width + "px", t;
},
removePlaceholderNode: function() {
this.removeNode(this.placeholderNode), this.placeholderNode = null;
},
removeDraggingRowNode: function() {
this.draggingRowNode = null;
var e = this.$.holdingarea.hasNode();
e.innerHTML = "";
},
removeNode: function(e) {
if (!e || !e.parentNode) return;
e.parentNode.removeChild(e);
},
updatePageHeight: function(e) {
if (e < 0) return;
var t = this.pageForPageNumber(e, !0);
if (t) {
var n = this.pageHeights[e], r = Math.max(1, t.getBounds().height);
this.pageHeights[e] = r, this.portSize += r - n;
}
},
updatePagePositions: function(e) {
this.positionPage(this.currentPageNumber, this.pageForPageNumber(this.currentPageNumber)), this.positionPage(e, this.pageForPageNumber(e));
},
correctPageHeights: function() {
this.updatePageHeight(this.currentPageNumber), this.initialPageNumber != this.currentPageNumber && this.updatePageHeight(this.initialPageNumber);
},
hideNode: function(e) {
return e.style.display = "none", e;
},
showNode: function(e) {
return e.style.display = "block", e;
},
dropPinnedRow: function(e) {
this.moveReorderedContainerToDroppedPosition(e), this.completeReorderTimeout = setTimeout(enyo.bind(this, this.completeFinishReordering, e), 100);
return;
},
cancelPinnedMode: function(e) {
this.placeholderRowIndex = this.draggingRowIndex, this.dropPinnedRow(e);
},
getRowIndexFromCoordinate: function(e) {
var t = this.getScrollTop() + e - enyo.dom.calcNodePosition(this.hasNode()).top;
if (t < 0) return -1;
var n = this.positionToPageInfo(t), r = n.no == this.p0 ? this.p0RowBounds : this.p1RowBounds;
if (!r) return this.count;
var i = n.pos, s = this.placeholderNode ? enyo.dom.getBounds(this.placeholderNode).height : 0, o = 0;
for (var u = n.startRow; u <= n.endRow; ++u) {
if (u === this.placeholderRowIndex) {
o += s;
if (o >= i) return -1;
}
if (u !== this.draggingRowIndex) {
o += r[u].height;
if (o >= i) return u;
}
}
return u;
},
getIndexPosition: function(e) {
return enyo.dom.calcNodePosition(this.$.generator.fetchRowNode(e));
},
setItemPosition: function(e, t) {
var n = this.getNodeStyle(t), r = this.getStrategyKind() == "ScrollStrategy" ? n.top : n.top - this.getScrollTop(), i = "top:" + r + "px; left:" + n.left + "px;";
e.addStyles(i);
},
setItemBounds: function(e, t) {
var n = this.getNodeStyle(t), r = "width:" + n.w + "px; height:" + n.h + "px;";
e.addStyles(r);
},
reorderScroll: function(e, t) {
this.getStrategyKind() == "ScrollStrategy" && this.$.reorderContainer.addStyles("top:" + (this.initialPinPosition + this.getScrollTop() - this.rowHeight) + "px;"), this.updatePlaceholderPosition(this.initialPinPosition);
},
hideReorderingRow: function() {
var e = this.hasNode().querySelector('[data-enyo-index="' + this.draggingRowIndex + '"]');
e && (this.hiddenNode = this.hideNode(e));
},
isReordering: function() {
return this.draggingRowIndex > -1;
},
isSwiping: function() {
return this.swipeIndex != null && !this.swipeComplete && this.swipeDirection != null;
},
swipeDragStart: function(e, t) {
return t.index == null || t.vertical ? !0 : (this.completeSwipeTimeout && this.completeSwipe(t), this.swipeComplete = !1, this.swipeIndex != t.index && (this.clearSwipeables(), this.swipeIndex = t.index), this.swipeDirection = t.xDirection, this.persistentItemVisible || this.startSwipe(t), this.draggedXDistance = 0, this.draggedYDistance = 0, !0);
},
swipeDrag: function(e, t) {
return this.persistentItemVisible ? (this.dragPersistentItem(t), this.preventDragPropagation) : this.isSwiping() ? (this.dragSwipeableComponents(this.calcNewDragPosition(t.ddx)), this.draggedXDistance = t.dx, this.draggedYDistance = t.dy, !0) : !1;
},
swipeDragFinish: function(e, t) {
if (this.persistentItemVisible) this.dragFinishPersistentItem(t); else {
if (!this.isSwiping()) return !1;
var n = this.calcPercentageDragged(this.draggedXDistance);
n > this.percentageDraggedThreshold && t.xDirection === this.swipeDirection ? this.swipe(this.fastSwipeSpeedMS) : this.backOutSwipe(t);
}
return this.preventDragPropagation;
},
isSwipeable: function() {
return this.enableSwipe && this.$.swipeableComponents.controls.length !== 0 && !this.isReordering() && !this.pinnedReorderMode;
},
positionSwipeableContainer: function(e, t) {
var n = this.$.generator.fetchRowNode(e);
if (!n) return;
var r = this.getRelativeOffset(n, this.hasNode()), i = enyo.dom.getBounds(n), s = t == 1 ? -1 * i.width : i.width;
this.$.swipeableComponents.addStyles("top: " + r.top + "px; left: " + s + "px; height: " + i.height + "px; width: " + i.width + "px;");
},
calcNewDragPosition: function(e) {
var t = this.$.swipeableComponents.getBounds(), n = t.left, r = this.$.swipeableComponents.getBounds(), i = this.swipeDirection == 1 ? 0 : -1 * r.width, s = this.swipeDirection == 1 ? n + e > i ? i : n + e : n + e < i ? i : n + e;
return s;
},
dragSwipeableComponents: function(e) {
this.$.swipeableComponents.applyStyle("left", e + "px");
},
startSwipe: function(e) {
e.index = this.swipeIndex, this.positionSwipeableContainer(this.swipeIndex, e.xDirection), this.$.swipeableComponents.setShowing(!0), this.setPersistentItemOrigin(e.xDirection), this.doSetupSwipeItem(e);
},
dragPersistentItem: function(e) {
var t = 0, n = this.persistentItemOrigin == "right" ? Math.max(t, t + e.dx) : Math.min(t, t + e.dx);
this.$.swipeableComponents.applyStyle("left", n + "px");
},
dragFinishPersistentItem: function(e) {
var t = this.calcPercentageDragged(e.dx) > .2, n = e.dx > 0 ? "right" : e.dx < 0 ? "left" : null;
this.persistentItemOrigin == n ? t ? this.slideAwayItem() : this.bounceItem(e) : this.bounceItem(e);
},
setPersistentItemOrigin: function(e) {
this.persistentItemOrigin = e == 1 ? "left" : "right";
},
calcPercentageDragged: function(e) {
return Math.abs(e / this.$.swipeableComponents.getBounds().width);
},
swipe: function(e) {
this.swipeComplete = !0, this.animateSwipe(0, e);
},
backOutSwipe: function(e) {
var t = this.$.swipeableComponents.getBounds(), n = this.swipeDirection == 1 ? -1 * t.width : t.width;
this.animateSwipe(n, this.fastSwipeSpeedMS), this.swipeDirection = null;
},
bounceItem: function(e) {
var t = this.$.swipeableComponents.getBounds();
t.left != t.width && this.animateSwipe(0, this.normalSwipeSpeedMS);
},
slideAwayItem: function() {
var e = this.$.swipeableComponents, t = e.getBounds().width, n = this.persistentItemOrigin == "left" ? -1 * t : t;
this.animateSwipe(n, this.normalSwipeSpeedMS), this.persistentItemVisible = !1, this.setPersistSwipeableItem(!1);
},
clearSwipeables: function() {
this.$.swipeableComponents.setShowing(!1), this.persistentItemVisible = !1, this.setPersistSwipeableItem(!1);
},
completeSwipe: function(e) {
this.completeSwipeTimeout && (clearTimeout(this.completeSwipeTimeout), this.completeSwipeTimeout = null), this.getPersistSwipeableItem() ? this.persistentItemVisible = !0 : (this.$.swipeableComponents.setShowing(!1), this.swipeComplete && this.doSwipeComplete({
index: this.swipeIndex,
xDirection: this.swipeDirection
})), this.swipeIndex = null, this.swipeDirection = null;
},
animateSwipe: function(e, t) {
var n = enyo.now(), r = 0, i = this.$.swipeableComponents, s = parseInt(i.domStyles.left, 10), o = e - s;
this.stopAnimateSwipe();
var u = enyo.bind(this, function() {
var e = enyo.now() - n, r = e / t, a = s + o * Math.min(r, 1);
i.applyStyle("left", a + "px"), this.job = enyo.requestAnimationFrame(u), e / t >= 1 && (this.stopAnimateSwipe(), this.completeSwipeTimeout = setTimeout(enyo.bind(this, function() {
this.completeSwipe();
}), this.completeSwipeDelayMS));
});
this.job = enyo.requestAnimationFrame(u);
},
stopAnimateSwipe: function() {
this.job && (this.job = enyo.cancelRequestAnimationFrame(this.job));
}
});

// PulldownList.js

enyo.kind({
name: "enyo.PulldownList",
kind: "List",
touch: !0,
pully: null,
pulldownTools: [ {
name: "pulldown",
classes: "enyo-list-pulldown",
components: [ {
name: "puller",
kind: "Puller"
} ]
} ],
events: {
onPullStart: "",
onPullCancel: "",
onPull: "",
onPullRelease: "",
onPullComplete: ""
},
handlers: {
onScrollStart: "scrollStartHandler",
onScrollStop: "scrollStopHandler",
ondragfinish: "dragfinish"
},
pullingMessage: "Pull down to refresh...",
pulledMessage: "Release to refresh...",
loadingMessage: "Loading...",
pullingIconClass: "enyo-puller-arrow enyo-puller-arrow-down",
pulledIconClass: "enyo-puller-arrow enyo-puller-arrow-up",
loadingIconClass: "",
create: function() {
var e = {
kind: "Puller",
showing: !1,
text: this.loadingMessage,
iconClass: this.loadingIconClass,
onCreate: "setPully"
};
this.listTools.splice(0, 0, e), this.inherited(arguments), this.setPulling();
},
initComponents: function() {
this.createChrome(this.pulldownTools), this.accel = enyo.dom.canAccelerate(), this.translation = this.accel ? "translate3d" : "translate", this.strategyKind = this.resetStrategyKind(), this.inherited(arguments);
},
resetStrategyKind: function() {
return enyo.platform.android >= 3 ? "TranslateScrollStrategy" : "TouchScrollStrategy";
},
setPully: function(e, t) {
this.pully = t.originator;
},
scrollStartHandler: function() {
this.firedPullStart = !1, this.firedPull = !1, this.firedPullCancel = !1;
},
scroll: function(e, t) {
var n = this.inherited(arguments);
this.completingPull && this.pully.setShowing(!1);
var r = this.getStrategy().$.scrollMath || this.getStrategy(), i = -1 * this.getScrollTop();
return r.isInOverScroll() && i > 0 && (enyo.dom.transformValue(this.$.pulldown, this.translation, "0," + i + "px" + (this.accel ? ",0" : "")), this.firedPullStart || (this.firedPullStart = !0, this.pullStart(), this.pullHeight = this.$.pulldown.getBounds().height), i > this.pullHeight && !this.firedPull && (this.firedPull = !0, this.firedPullCancel = !1, this.pull()), this.firedPull && !this.firedPullCancel && i < this.pullHeight && (this.firedPullCancel = !0, this.firedPull = !1, this.pullCancel())), n;
},
scrollStopHandler: function() {
this.completingPull && (this.completingPull = !1, this.doPullComplete());
},
dragfinish: function() {
if (this.firedPull) {
var e = this.getStrategy().$.scrollMath || this.getStrategy();
e.setScrollY(-1 * this.getScrollTop() - this.pullHeight), this.pullRelease();
}
},
completePull: function() {
this.completingPull = !0;
var e = this.getStrategy().$.scrollMath || this.getStrategy();
e.setScrollY(this.pullHeight), e.start();
},
pullStart: function() {
this.setPulling(), this.pully.setShowing(!1), this.$.puller.setShowing(!0), this.doPullStart();
},
pull: function() {
this.setPulled(), this.doPull();
},
pullCancel: function() {
this.setPulling(), this.doPullCancel();
},
pullRelease: function() {
this.$.puller.setShowing(!1), this.pully.setShowing(!0), this.doPullRelease();
},
setPulling: function() {
this.$.puller.setText(this.pullingMessage), this.$.puller.setIconClass(this.pullingIconClass);
},
setPulled: function() {
this.$.puller.setText(this.pulledMessage), this.$.puller.setIconClass(this.pulledIconClass);
}
}), enyo.kind({
name: "enyo.Puller",
classes: "enyo-puller",
published: {
text: "",
iconClass: ""
},
events: {
onCreate: ""
},
components: [ {
name: "icon"
}, {
name: "text",
tag: "span",
classes: "enyo-puller-text"
} ],
create: function() {
this.inherited(arguments), this.doCreate(), this.textChanged(), this.iconClassChanged();
},
textChanged: function() {
this.$.text.setContent(this.text);
},
iconClassChanged: function() {
this.$.icon.setClasses(this.iconClass);
}
});

// AroundList.js

enyo.kind({
name: "enyo.AroundList",
kind: "enyo.List",
listTools: [ {
name: "port",
classes: "enyo-list-port enyo-border-box",
components: [ {
name: "aboveClient"
}, {
name: "generator",
kind: "FlyweightRepeater",
canGenerate: !1,
components: [ {
tag: null,
name: "client"
} ]
}, {
name: "holdingarea",
allowHtml: !0,
classes: "enyo-list-holdingarea"
}, {
name: "page0",
allowHtml: !0,
classes: "enyo-list-page"
}, {
name: "page1",
allowHtml: !0,
classes: "enyo-list-page"
}, {
name: "belowClient"
}, {
name: "placeholder"
}, {
name: "swipeableComponents",
style: "position:absolute; display:block; top:-1000px; left:0px;"
} ]
} ],
aboveComponents: null,
initComponents: function() {
this.inherited(arguments), this.aboveComponents && this.$.aboveClient.createComponents(this.aboveComponents, {
owner: this.owner
}), this.belowComponents && this.$.belowClient.createComponents(this.belowComponents, {
owner: this.owner
});
},
updateMetrics: function() {
this.defaultPageHeight = this.rowsPerPage * (this.rowHeight || 100), this.pageCount = Math.ceil(this.count / this.rowsPerPage), this.aboveHeight = this.$.aboveClient.getBounds().height, this.belowHeight = this.$.belowClient.getBounds().height, this.portSize = this.aboveHeight + this.belowHeight;
for (var e = 0; e < this.pageCount; e++) this.portSize += this.getPageHeight(e);
this.adjustPortSize();
},
positionPage: function(e, t) {
t.pageNo = e;
var n = this.pageToPosition(e), r = this.bottomUp ? this.belowHeight : this.aboveHeight;
n += r, t.applyStyle(this.pageBound, n + "px");
},
scrollToContentStart: function() {
var e = this.bottomUp ? this.belowHeight : this.aboveHeight;
this.setScrollPosition(e);
}
});

// Slideable.js

enyo.kind({
name: "enyo.Slideable",
kind: "Control",
published: {
axis: "h",
value: 0,
unit: "px",
min: 0,
max: 0,
accelerated: "auto",
overMoving: !0,
draggable: !0
},
events: {
onAnimateFinish: "",
onChange: ""
},
preventDragPropagation: !1,
tools: [ {
kind: "Animator",
onStep: "animatorStep",
onEnd: "animatorComplete"
} ],
handlers: {
ondragstart: "dragstart",
ondrag: "drag",
ondragfinish: "dragfinish"
},
kDragScalar: 1,
dragEventProp: "dx",
unitModifier: !1,
canTransform: !1,
create: function() {
this.inherited(arguments), this.acceleratedChanged(), this.transformChanged(), this.axisChanged(), this.valueChanged(), this.addClass("enyo-slideable");
},
initComponents: function() {
this.createComponents(this.tools), this.inherited(arguments);
},
rendered: function() {
this.inherited(arguments), this.canModifyUnit(), this.updateDragScalar();
},
resizeHandler: function() {
this.inherited(arguments), this.updateDragScalar();
},
canModifyUnit: function() {
if (!this.canTransform) {
var e = this.getInitialStyleValue(this.hasNode(), this.boundary);
e.match(/px/i) && this.unit === "%" && (this.unitModifier = this.getBounds()[this.dimension]);
}
},
getInitialStyleValue: function(e, t) {
var n = enyo.dom.getComputedStyle(e);
return n ? n.getPropertyValue(t) : e && e.currentStyle ? e.currentStyle[t] : "0";
},
updateBounds: function(e, t) {
var n = {};
n[this.boundary] = e, this.setBounds(n, this.unit), this.setInlineStyles(e, t);
},
updateDragScalar: function() {
if (this.unit == "%") {
var e = this.getBounds()[this.dimension];
this.kDragScalar = e ? 100 / e : 1, this.canTransform || this.updateBounds(this.value, 100);
}
},
transformChanged: function() {
this.canTransform = enyo.dom.canTransform();
},
acceleratedChanged: function() {
enyo.platform.android > 2 || enyo.dom.accelerate(this, this.accelerated);
},
axisChanged: function() {
var e = this.axis == "h";
this.dragMoveProp = e ? "dx" : "dy", this.shouldDragProp = e ? "horizontal" : "vertical", this.transform = e ? "translateX" : "translateY", this.dimension = e ? "width" : "height", this.boundary = e ? "left" : "top";
},
setInlineStyles: function(e, t) {
var n = {};
this.unitModifier ? (n[this.boundary] = this.percentToPixels(e, this.unitModifier), n[this.dimension] = this.unitModifier, this.setBounds(n)) : (t ? n[this.dimension] = t : n[this.boundary] = e, this.setBounds(n, this.unit));
},
valueChanged: function(e) {
var t = this.value;
this.isOob(t) && !this.isAnimating() && (this.value = this.overMoving ? this.dampValue(t) : this.clampValue(t)), enyo.platform.android > 2 && (this.value ? (e === 0 || e === undefined) && enyo.dom.accelerate(this, this.accelerated) : enyo.dom.accelerate(this, !1)), this.canTransform ? enyo.dom.transformValue(this, this.transform, this.value + this.unit) : this.setInlineStyles(this.value, !1), this.doChange();
},
getAnimator: function() {
return this.$.animator;
},
isAtMin: function() {
return this.value <= this.calcMin();
},
isAtMax: function() {
return this.value >= this.calcMax();
},
calcMin: function() {
return this.min;
},
calcMax: function() {
return this.max;
},
clampValue: function(e) {
var t = this.calcMin(), n = this.calcMax();
return Math.max(t, Math.min(e, n));
},
dampValue: function(e) {
return this.dampBound(this.dampBound(e, this.min, 1), this.max, -1);
},
dampBound: function(e, t, n) {
var r = e;
return r * n < t * n && (r = t + (r - t) / 4), r;
},
percentToPixels: function(e, t) {
return Math.floor(t / 100 * e);
},
pixelsToPercent: function(e) {
var t = this.unitModifier ? this.getBounds()[this.dimension] : this.container.getBounds()[this.dimension];
return e / t * 100;
},
shouldDrag: function(e) {
return this.draggable && e[this.shouldDragProp];
},
isOob: function(e) {
return e > this.calcMax() || e < this.calcMin();
},
dragstart: function(e, t) {
if (this.shouldDrag(t)) return t.preventDefault(), this.$.animator.stop(), t.dragInfo = {}, this.dragging = !0, this.drag0 = this.value, this.dragd0 = 0, this.preventDragPropagation;
},
drag: function(e, t) {
if (this.dragging) {
t.preventDefault();
var n = this.canTransform ? t[this.dragMoveProp] * this.kDragScalar : this.pixelsToPercent(t[this.dragMoveProp]), r = this.drag0 + n, i = n - this.dragd0;
return this.dragd0 = n, i && (t.dragInfo.minimizing = i < 0), this.setValue(r), this.preventDragPropagation;
}
},
dragfinish: function(e, t) {
if (this.dragging) return this.dragging = !1, this.completeDrag(t), t.preventTap(), this.preventDragPropagation;
},
completeDrag: function(e) {
this.value !== this.calcMax() && this.value != this.calcMin() && this.animateToMinMax(e.dragInfo.minimizing);
},
isAnimating: function() {
return this.$.animator.isAnimating();
},
play: function(e, t) {
this.$.animator.play({
startValue: e,
endValue: t,
node: this.hasNode()
});
},
animateTo: function(e) {
this.play(this.value, e);
},
animateToMin: function() {
this.animateTo(this.calcMin());
},
animateToMax: function() {
this.animateTo(this.calcMax());
},
animateToMinMax: function(e) {
e ? this.animateToMin() : this.animateToMax();
},
animatorStep: function(e) {
return this.setValue(e.value), !0;
},
animatorComplete: function(e) {
return this.doAnimateFinish(e), !0;
},
toggleMinMax: function() {
this.animateToMinMax(!this.isAtMin());
}
});

// Arranger.js

enyo.kind({
name: "enyo.Arranger",
kind: "Layout",
layoutClass: "enyo-arranger",
accelerated: "auto",
dragProp: "ddx",
dragDirectionProp: "xDirection",
canDragProp: "horizontal",
incrementalPoints: !1,
destroy: function() {
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) n._arranger = null;
this.inherited(arguments);
},
arrange: function(e, t) {},
size: function() {},
start: function() {
var e = this.container.fromIndex, t = this.container.toIndex, n = this.container.transitionPoints = [ e ];
if (this.incrementalPoints) {
var r = Math.abs(t - e) - 2, i = e;
while (r >= 0) i += t < e ? -1 : 1, n.push(i), r--;
}
n.push(this.container.toIndex);
},
finish: function() {},
calcArrangementDifference: function(e, t, n, r) {},
canDragEvent: function(e) {
return e[this.canDragProp];
},
calcDragDirection: function(e) {
return e[this.dragDirectionProp];
},
calcDrag: function(e) {
return e[this.dragProp];
},
drag: function(e, t, n, r, i) {
var s = this.measureArrangementDelta(-e, t, n, r, i);
return s;
},
measureArrangementDelta: function(e, t, n, r, i) {
var s = this.calcArrangementDifference(t, n, r, i), o = s ? e / Math.abs(s) : 0;
return o *= this.container.fromIndex > this.container.toIndex ? -1 : 1, o;
},
_arrange: function(e) {
this.containerBounds || this.reflow();
var t = this.getOrderedControls(e);
this.arrange(t, e);
},
arrangeControl: function(e, t) {
e._arranger = enyo.mixin(e._arranger || {}, t);
},
flow: function() {
this.c$ = [].concat(this.container.getPanels()), this.controlsIndex = 0;
for (var e = 0, t = this.container.getPanels(), n; n = t[e]; e++) {
enyo.dom.accelerate(n, this.accelerated);
if (enyo.platform.safari) {
var r = n.children;
for (var i = 0, s; s = r[i]; i++) enyo.dom.accelerate(s, this.accelerated);
}
}
},
reflow: function() {
var e = this.container.hasNode();
this.containerBounds = e ? {
width: e.clientWidth,
height: e.clientHeight
} : {}, this.size();
},
flowArrangement: function() {
var e = this.container.arrangement;
if (e) for (var t = 0, n = this.container.getPanels(), r; r = n[t]; t++) this.flowControl(r, e[t]);
},
flowControl: function(e, t) {
enyo.Arranger.positionControl(e, t);
var n = t.opacity;
n != null && enyo.Arranger.opacifyControl(e, n);
},
getOrderedControls: function(e) {
var t = Math.floor(e), n = t - this.controlsIndex, r = n > 0, i = this.c$ || [];
for (var s = 0; s < Math.abs(n); s++) r ? i.push(i.shift()) : i.unshift(i.pop());
return this.controlsIndex = t, i;
},
statics: {
positionControl: function(e, t, n) {
var r = n || "px";
if (!this.updating) if (enyo.dom.canTransform() && !enyo.platform.android && enyo.platform.ie !== 10) {
var i = t.left, s = t.top;
i = enyo.isString(i) ? i : i && i + r, s = enyo.isString(s) ? s : s && s + r, enyo.dom.transform(e, {
translateX: i || null,
translateY: s || null
});
} else e.setBounds(t, n);
},
opacifyControl: function(e, t) {
var n = t;
n = n > .99 ? 1 : n < .01 ? 0 : n, enyo.platform.ie < 9 ? e.applyStyle("filter", "progid:DXImageTransform.Microsoft.Alpha(Opacity=" + n * 100 + ")") : e.applyStyle("opacity", n);
}
}
});

// CardArranger.js

enyo.kind({
name: "enyo.CardArranger",
kind: "Arranger",
layoutClass: "enyo-arranger enyo-arranger-fit",
calcArrangementDifference: function(e, t, n, r) {
return this.containerBounds.width;
},
arrange: function(e, t) {
for (var n = 0, r, i, s; r = e[n]; n++) s = n === 0 ? 1 : 0, this.arrangeControl(r, {
opacity: s
});
},
start: function() {
this.inherited(arguments);
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) {
var r = n.showing;
n.setShowing(t == this.container.fromIndex || t == this.container.toIndex), n.showing && !r && n.resized();
}
},
finish: function() {
this.inherited(arguments);
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) n.setShowing(t == this.container.toIndex);
},
destroy: function() {
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) enyo.Arranger.opacifyControl(n, 1), n.showing || n.setShowing(!0);
this.inherited(arguments);
}
});

// CardSlideInArranger.js

enyo.kind({
name: "enyo.CardSlideInArranger",
kind: "CardArranger",
start: function() {
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) {
var r = n.showing;
n.setShowing(t == this.container.fromIndex || t == this.container.toIndex), n.showing && !r && n.resized();
}
var i = this.container.fromIndex;
t = this.container.toIndex, this.container.transitionPoints = [ t + "." + i + ".s", t + "." + i + ".f" ];
},
finish: function() {
this.inherited(arguments);
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) n.setShowing(t == this.container.toIndex);
},
arrange: function(e, t) {
var n = t.split("."), r = n[0], i = n[1], s = n[2] == "s", o = this.containerBounds.width;
for (var u = 0, a = this.container.getPanels(), f, l; f = a[u]; u++) l = o, i == u && (l = s ? 0 : -o), r == u && (l = s ? o : 0), i == u && i == r && (l = 0), this.arrangeControl(f, {
left: l
});
},
destroy: function() {
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) enyo.Arranger.positionControl(n, {
left: null
});
this.inherited(arguments);
}
});

// CarouselArranger.js

enyo.kind({
name: "enyo.CarouselArranger",
kind: "Arranger",
size: function() {
var e = this.container.getPanels(), t = this.containerPadding = this.container.hasNode() ? enyo.dom.calcPaddingExtents(this.container.node) : {}, n = this.containerBounds, r, i, s, o, u;
n.height -= t.top + t.bottom, n.width -= t.left + t.right;
var a;
for (r = 0, s = 0; u = e[r]; r++) o = enyo.dom.calcMarginExtents(u.hasNode()), u.width = u.getBounds().width, u.marginWidth = o.right + o.left, s += (u.fit ? 0 : u.width) + u.marginWidth, u.fit && (a = u);
if (a) {
var f = n.width - s;
a.width = f >= 0 ? f : a.width;
}
for (r = 0, i = t.left; u = e[r]; r++) u.setBounds({
top: t.top,
bottom: t.bottom,
width: u.fit ? u.width : null
});
},
arrange: function(e, t) {
this.container.wrap ? this.arrangeWrap(e, t) : this.arrangeNoWrap(e, t);
},
arrangeNoWrap: function(e, t) {
var n, r, i, s, o = this.container.getPanels(), u = this.container.clamp(t), a = this.containerBounds.width;
for (n = u, i = 0; s = o[n]; n++) {
i += s.width + s.marginWidth;
if (i > a) break;
}
var f = a - i, l = 0;
if (f > 0) {
var c = u;
for (n = u - 1, r = 0; s = o[n]; n--) {
r += s.width + s.marginWidth;
if (f - r <= 0) {
l = f - r, u = n;
break;
}
}
}
var h, p;
for (n = 0, p = this.containerPadding.left + l; s = o[n]; n++) h = s.width + s.marginWidth, n < u ? this.arrangeControl(s, {
left: -h
}) : (this.arrangeControl(s, {
left: Math.floor(p)
}), p += h);
},
arrangeWrap: function(e, t) {
for (var n = 0, r = this.containerPadding.left, i, s; s = e[n]; n++) this.arrangeControl(s, {
left: r
}), r += s.width + s.marginWidth;
},
calcArrangementDifference: function(e, t, n, r) {
var i = Math.abs(e % this.c$.length);
return t[i].left - r[i].left;
},
destroy: function() {
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) enyo.Arranger.positionControl(n, {
left: null,
top: null
}), n.applyStyle("top", null), n.applyStyle("bottom", null), n.applyStyle("left", null), n.applyStyle("width", null);
this.inherited(arguments);
}
});

// CollapsingArranger.js

enyo.kind({
name: "enyo.CollapsingArranger",
kind: "CarouselArranger",
peekWidth: 0,
size: function() {
this.clearLastSize(), this.inherited(arguments);
},
clearLastSize: function() {
for (var e = 0, t = this.container.getPanels(), n; n = t[e]; e++) n._fit && e != t.length - 1 && (n.applyStyle("width", null), n._fit = null);
},
constructor: function() {
this.inherited(arguments), this.peekWidth = this.container.peekWidth != null ? this.container.peekWidth : this.peekWidth;
},
arrange: function(e, t) {
var n = this.container.getPanels();
for (var r = 0, i = this.containerPadding.left, s, o, u = 0; o = n[r]; r++) o.getShowing() ? (this.arrangeControl(o, {
left: i + u * this.peekWidth
}), r >= t && (i += o.width + o.marginWidth - this.peekWidth), u++) : (this.arrangeControl(o, {
left: i
}), r >= t && (i += o.width + o.marginWidth)), r == n.length - 1 && t < 0 && this.arrangeControl(o, {
left: i - t
});
},
calcArrangementDifference: function(e, t, n, r) {
var i = this.container.getPanels().length - 1;
return Math.abs(r[i].left - t[i].left);
},
flowControl: function(e, t) {
this.inherited(arguments);
if (this.container.realtimeFit) {
var n = this.container.getPanels(), r = n.length - 1, i = n[r];
e == i && this.fitControl(e, t.left);
}
},
finish: function() {
this.inherited(arguments);
if (!this.container.realtimeFit && this.containerBounds) {
var e = this.container.getPanels(), t = this.container.arrangement, n = e.length - 1, r = e[n];
this.fitControl(r, t[n].left);
}
},
fitControl: function(e, t) {
e._fit = !0, e.applyStyle("width", this.containerBounds.width - t + "px"), e.resized();
}
});

// DockRightArranger.js

enyo.kind({
name: "enyo.DockRightArranger",
kind: "Arranger",
basePanel: !1,
overlap: 0,
layoutWidth: 0,
constructor: function() {
this.inherited(arguments), this.overlap = this.container.overlap != null ? this.container.overlap : this.overlap, this.layoutWidth = this.container.layoutWidth != null ? this.container.layoutWidth : this.layoutWidth;
},
size: function() {
var e = this.container.getPanels(), t = this.containerPadding = this.container.hasNode() ? enyo.dom.calcPaddingExtents(this.container.node) : {}, n = this.containerBounds, r, i, s;
n.width -= t.left + t.right;
var o = n.width, u = e.length;
this.container.transitionPositions = {};
for (r = 0; s = e[r]; r++) s.width = r === 0 && this.container.basePanel ? o : s.getBounds().width;
for (r = 0; s = e[r]; r++) {
r === 0 && this.container.basePanel && s.setBounds({
width: o
}), s.setBounds({
top: t.top,
bottom: t.bottom
});
for (j = 0; s = e[j]; j++) {
var a;
if (r === 0 && this.container.basePanel) a = 0; else if (j < r) a = o; else {
if (r !== j) break;
var f = o > this.layoutWidth ? this.overlap : 0;
a = o - e[r].width + f;
}
this.container.transitionPositions[r + "." + j] = a;
}
if (j < u) {
var l = !1;
for (k = r + 1; k < u; k++) {
var f = 0;
if (l) f = 0; else if (e[r].width + e[k].width - this.overlap > o) f = 0, l = !0; else {
f = e[r].width - this.overlap;
for (i = r; i < k; i++) {
var c = f + e[i + 1].width - this.overlap;
if (!(c < o)) {
f = o;
break;
}
f = c;
}
f = o - f;
}
this.container.transitionPositions[r + "." + k] = f;
}
}
}
},
arrange: function(e, t) {
var n, r, i = this.container.getPanels(), s = this.container.clamp(t);
for (n = 0; r = i[n]; n++) {
var o = this.container.transitionPositions[n + "." + s];
this.arrangeControl(r, {
left: o
});
}
},
calcArrangementDifference: function(e, t, n, r) {
var i = this.container.getPanels(), s = e < n ? i[n].width : i[e].width;
return s;
},
destroy: function() {
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) enyo.Arranger.positionControl(n, {
left: null,
top: null
}), n.applyStyle("top", null), n.applyStyle("bottom", null), n.applyStyle("left", null), n.applyStyle("width", null);
this.inherited(arguments);
}
});

// OtherArrangers.js

enyo.kind({
name: "enyo.LeftRightArranger",
kind: "Arranger",
margin: 40,
axisSize: "width",
offAxisSize: "height",
axisPosition: "left",
constructor: function() {
this.inherited(arguments), this.margin = this.container.margin != null ? this.container.margin : this.margin;
},
size: function() {
var e = this.container.getPanels(), t = this.containerBounds[this.axisSize], n = t - this.margin - this.margin;
for (var r = 0, i, s; s = e[r]; r++) i = {}, i[this.axisSize] = n, i[this.offAxisSize] = "100%", s.setBounds(i);
},
start: function() {
this.inherited(arguments);
var e = this.container.fromIndex, t = this.container.toIndex, n = this.getOrderedControls(t), r = Math.floor(n.length / 2);
for (var i = 0, s; s = n[i]; i++) e > t ? i == n.length - r ? s.applyStyle("z-index", 0) : s.applyStyle("z-index", 1) : i == n.length - 1 - r ? s.applyStyle("z-index", 0) : s.applyStyle("z-index", 1);
},
arrange: function(e, t) {
var n, r, i, s;
if (this.container.getPanels().length == 1) {
s = {}, s[this.axisPosition] = this.margin, this.arrangeControl(this.container.getPanels()[0], s);
return;
}
var o = Math.floor(this.container.getPanels().length / 2), u = this.getOrderedControls(Math.floor(t) - o), a = this.containerBounds[this.axisSize] - this.margin - this.margin, f = this.margin - a * o;
for (n = 0; r = u[n]; n++) s = {}, s[this.axisPosition] = f, this.arrangeControl(r, s), f += a;
},
calcArrangementDifference: function(e, t, n, r) {
if (this.container.getPanels().length == 1) return 0;
var i = Math.abs(e % this.c$.length);
return t[i][this.axisPosition] - r[i][this.axisPosition];
},
destroy: function() {
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) enyo.Arranger.positionControl(n, {
left: null,
top: null
}), enyo.Arranger.opacifyControl(n, 1), n.applyStyle("left", null), n.applyStyle("top", null), n.applyStyle("height", null), n.applyStyle("width", null);
this.inherited(arguments);
}
}), enyo.kind({
name: "enyo.TopBottomArranger",
kind: "LeftRightArranger",
dragProp: "ddy",
dragDirectionProp: "yDirection",
canDragProp: "vertical",
axisSize: "height",
offAxisSize: "width",
axisPosition: "top"
}), enyo.kind({
name: "enyo.SpiralArranger",
kind: "Arranger",
incrementalPoints: !0,
inc: 20,
size: function() {
var e = this.container.getPanels(), t = this.containerBounds, n = this.controlWidth = t.width / 3, r = this.controlHeight = t.height / 3;
for (var i = 0, s; s = e[i]; i++) s.setBounds({
width: n,
height: r
});
},
arrange: function(e, t) {
var n = this.inc;
for (var r = 0, i = e.length, s; s = e[r]; r++) {
var o = Math.cos(r / i * 2 * Math.PI) * r * n + this.controlWidth, u = Math.sin(r / i * 2 * Math.PI) * r * n + this.controlHeight;
this.arrangeControl(s, {
left: o,
top: u
});
}
},
start: function() {
this.inherited(arguments);
var e = this.getOrderedControls(this.container.toIndex);
for (var t = 0, n; n = e[t]; t++) n.applyStyle("z-index", e.length - t);
},
calcArrangementDifference: function(e, t, n, r) {
return this.controlWidth;
},
destroy: function() {
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) n.applyStyle("z-index", null), enyo.Arranger.positionControl(n, {
left: null,
top: null
}), n.applyStyle("left", null), n.applyStyle("top", null), n.applyStyle("height", null), n.applyStyle("width", null);
this.inherited(arguments);
}
}), enyo.kind({
name: "enyo.GridArranger",
kind: "Arranger",
incrementalPoints: !0,
colWidth: 100,
colHeight: 100,
size: function() {
var e = this.container.getPanels(), t = this.colWidth, n = this.colHeight;
for (var r = 0, i; i = e[r]; r++) i.setBounds({
width: t,
height: n
});
},
arrange: function(e, t) {
var n = this.colWidth, r = this.colHeight, i = Math.max(1, Math.floor(this.containerBounds.width / n)), s;
for (var o = 0, u = 0; u < e.length; o++) for (var a = 0; a < i && (s = e[u]); a++, u++) this.arrangeControl(s, {
left: n * a,
top: r * o
});
},
flowControl: function(e, t) {
this.inherited(arguments), enyo.Arranger.opacifyControl(e, t.top % this.colHeight !== 0 ? .25 : 1);
},
calcArrangementDifference: function(e, t, n, r) {
return this.colWidth;
},
destroy: function() {
var e = this.container.getPanels();
for (var t = 0, n; n = e[t]; t++) enyo.Arranger.positionControl(n, {
left: null,
top: null
}), n.applyStyle("left", null), n.applyStyle("top", null), n.applyStyle("height", null), n.applyStyle("width", null);
this.inherited(arguments);
}
});

// Panels.js

enyo.kind({
name: "enyo.Panels",
classes: "enyo-panels",
published: {
index: 0,
draggable: !0,
animate: !0,
wrap: !1,
arrangerKind: "CardArranger",
narrowFit: !0
},
events: {
onTransitionStart: "",
onTransitionFinish: ""
},
handlers: {
ondragstart: "dragstart",
ondrag: "drag",
ondragfinish: "dragfinish",
onscroll: "domScroll"
},
tools: [ {
kind: "Animator",
onStep: "step",
onEnd: "completed"
} ],
fraction: 0,
create: function() {
this.transitionPoints = [], this.inherited(arguments), this.arrangerKindChanged(), this.narrowFitChanged(), this.indexChanged();
},
rendered: function() {
this.inherited(arguments), enyo.makeBubble(this, "scroll");
},
domScroll: function(e, t) {
this.hasNode() && this.node.scrollLeft > 0 && (this.node.scrollLeft = 0);
},
initComponents: function() {
this.createChrome(this.tools), this.inherited(arguments);
},
arrangerKindChanged: function() {
this.setLayoutKind(this.arrangerKind);
},
narrowFitChanged: function() {
this.addRemoveClass("enyo-panels-fit-narrow", this.narrowFit);
},
destroy: function() {
this.destroying = !0, this.inherited(arguments);
},
removeControl: function(e) {
this.inherited(arguments), this.destroying && this.controls.length > 0 && this.isPanel(e) && (this.setIndex(Math.max(this.index - 1, 0)), this.flow(), this.reflow());
},
isPanel: function() {
return !0;
},
flow: function() {
this.arrangements = [], this.inherited(arguments);
},
reflow: function() {
this.arrangements = [], this.inherited(arguments), this.refresh();
},
getPanels: function() {
var e = this.controlParent || this;
return e.children;
},
getActive: function() {
var e = this.getPanels(), t = this.index % e.length;
return t < 0 && (t += e.length), e[t];
},
getAnimator: function() {
return this.$.animator;
},
setIndex: function(e) {
this.setPropertyValue("index", e, "indexChanged");
},
setIndexDirect: function(e) {
this.setIndex(e), this.completed();
},
previous: function() {
this.setIndex(this.index - 1);
},
next: function() {
this.setIndex(this.index + 1);
},
clamp: function(e) {
var t = this.getPanels().length - 1;
return this.wrap ? e : Math.max(0, Math.min(e, t));
},
indexChanged: function(e) {
this.lastIndex = e, this.index = this.clamp(this.index), !this.dragging && this.$.animator && (this.$.animator.isAnimating() && this.completed(), this.$.animator.stop(), this.hasNode() && (this.animate ? (this.startTransition(), this.$.animator.play({
startValue: this.fraction
})) : this.refresh()));
},
step: function(e) {
this.fraction = e.value, this.stepTransition();
},
completed: function() {
this.$.animator.isAnimating() && this.$.animator.stop(), this.fraction = 1, this.stepTransition(), this.finishTransition();
},
dragstart: function(e, t) {
if (this.draggable && this.layout && this.layout.canDragEvent(t)) return t.preventDefault(), this.dragstartTransition(t), this.dragging = !0, this.$.animator.stop(), !0;
},
drag: function(e, t) {
this.dragging && (t.preventDefault(), this.dragTransition(t));
},
dragfinish: function(e, t) {
this.dragging && (this.dragging = !1, t.preventTap(), this.dragfinishTransition(t));
},
dragstartTransition: function(e) {
if (!this.$.animator.isAnimating()) {
var t = this.fromIndex = this.index;
this.toIndex = t - (this.layout ? this.layout.calcDragDirection(e) : 0);
} else this.verifyDragTransition(e);
this.fromIndex = this.clamp(this.fromIndex), this.toIndex = this.clamp(this.toIndex), this.fireTransitionStart(), this.layout && this.layout.start();
},
dragTransition: function(e) {
var t = this.layout ? this.layout.calcDrag(e) : 0, n = this.transitionPoints, r = n[0], i = n[n.length - 1], s = this.fetchArrangement(r), o = this.fetchArrangement(i), u = this.layout ? this.layout.drag(t, r, s, i, o) : 0, a = t && !u;
a, this.fraction += u;
var f = this.fraction;
if (f > 1 || f < 0 || a) (f > 0 || a) && this.dragfinishTransition(e), this.dragstartTransition(e), this.fraction = 0;
this.stepTransition();
},
dragfinishTransition: function(e) {
this.verifyDragTransition(e), this.setIndex(this.toIndex), this.dragging && this.fireTransitionFinish();
},
verifyDragTransition: function(e) {
var t = this.layout ? this.layout.calcDragDirection(e) : 0, n = Math.min(this.fromIndex, this.toIndex), r = Math.max(this.fromIndex, this.toIndex);
if (t > 0) {
var i = n;
n = r, r = i;
}
n != this.fromIndex && (this.fraction = 1 - this.fraction), this.fromIndex = n, this.toIndex = r;
},
refresh: function() {
this.$.animator && this.$.animator.isAnimating() && this.$.animator.stop(), this.startTransition(), this.fraction = 1, this.stepTransition(), this.finishTransition();
},
startTransition: function() {
this.fromIndex = this.fromIndex != null ? this.fromIndex : this.lastIndex || 0, this.toIndex = this.toIndex != null ? this.toIndex : this.index, this.layout && this.layout.start(), this.fireTransitionStart();
},
finishTransition: function() {
this.layout && this.layout.finish(), this.transitionPoints = [], this.fraction = 0, this.fromIndex = this.toIndex = null, this.fireTransitionFinish();
},
fireTransitionStart: function() {
var e = this.startTransitionInfo;
this.hasNode() && (!e || e.fromIndex != this.fromIndex || e.toIndex != this.toIndex) && (this.startTransitionInfo = {
fromIndex: this.fromIndex,
toIndex: this.toIndex
}, this.doTransitionStart(enyo.clone(this.startTransitionInfo)));
},
fireTransitionFinish: function() {
var e = this.finishTransitionInfo;
this.hasNode() && (!e || e.fromIndex != this.lastIndex || e.toIndex != this.index) && (this.finishTransitionInfo = {
fromIndex: this.lastIndex,
toIndex: this.index
}, this.doTransitionFinish(enyo.clone(this.finishTransitionInfo))), this.lastIndex = this.index;
},
stepTransition: function() {
if (this.hasNode()) {
var e = this.transitionPoints, t = (this.fraction || 0) * (e.length - 1), n = Math.floor(t);
t -= n;
var r = e[n], i = e[n + 1], s = this.fetchArrangement(r), o = this.fetchArrangement(i);
this.arrangement = s && o ? enyo.Panels.lerp(s, o, t) : s || o, this.arrangement && this.layout && this.layout.flowArrangement();
}
},
fetchArrangement: function(e) {
return e != null && !this.arrangements[e] && this.layout && (this.layout._arrange(e), this.arrangements[e] = this.readArrangement(this.getPanels())), this.arrangements[e];
},
readArrangement: function(e) {
var t = [];
for (var n = 0, r = e, i; i = r[n]; n++) t.push(enyo.clone(i._arranger));
return t;
},
statics: {
isScreenNarrow: function() {
return enyo.dom.getWindowWidth() <= 800;
},
lerp: function(e, t, n) {
var r = [];
for (var i = 0, s = enyo.keys(e), o; o = s[i]; i++) r.push(this.lerpObject(e[o], t[o], n));
return r;
},
lerpObject: function(e, t, n) {
var r = enyo.clone(e), i, s;
if (t) for (var o in e) i = e[o], s = t[o], i != s && (r[o] = i - (i - s) * n);
return r;
}
}
});

// Node.js

enyo.kind({
name: "enyo.Node",
published: {
expandable: !1,
expanded: !1,
icon: "",
onlyIconExpands: !1,
selected: !1
},
style: "padding: 0 0 0 16px;",
content: "Node",
defaultKind: "Node",
classes: "enyo-node",
components: [ {
name: "icon",
kind: "Image",
showing: !1
}, {
kind: "Control",
name: "caption",
Xtag: "span",
style: "display: inline-block; padding: 4px;",
allowHtml: !0
}, {
kind: "Control",
name: "extra",
tag: "span",
allowHtml: !0
} ],
childClient: [ {
kind: "Control",
name: "box",
classes: "enyo-node-box",
Xstyle: "border: 1px solid orange;",
components: [ {
kind: "Control",
name: "client",
classes: "enyo-node-client",
Xstyle: "border: 1px solid lightblue;"
} ]
} ],
handlers: {
ondblclick: "dblclick"
},
events: {
onNodeTap: "nodeTap",
onNodeDblClick: "nodeDblClick",
onExpand: "nodeExpand",
onDestroyed: "nodeDestroyed"
},
create: function() {
this.inherited(arguments), this.selectedChanged(), this.iconChanged();
},
destroy: function() {
this.doDestroyed(), this.inherited(arguments);
},
initComponents: function() {
this.expandable && (this.kindComponents = this.kindComponents.concat(this.childClient)), this.inherited(arguments);
},
contentChanged: function() {
this.$.caption.setContent(this.content);
},
iconChanged: function() {
this.$.icon.setSrc(this.icon), this.$.icon.setShowing(Boolean(this.icon));
},
selectedChanged: function() {
this.addRemoveClass("enyo-selected", this.selected);
},
rendered: function() {
this.inherited(arguments), this.expandable && !this.expanded && this.quickCollapse();
},
addNodes: function(e) {
this.destroyClientControls();
for (var t = 0, n; n = e[t]; t++) this.createComponent(n);
this.$.client.render();
},
addTextNodes: function(e) {
this.destroyClientControls();
for (var t = 0, n; n = e[t]; t++) this.createComponent({
content: n
});
this.$.client.render();
},
tap: function(e, t) {
return this.onlyIconExpands ? t.target == this.$.icon.hasNode() ? this.toggleExpanded() : this.doNodeTap() : (this.toggleExpanded(), this.doNodeTap()), !0;
},
dblclick: function(e, t) {
return this.doNodeDblClick(), !0;
},
toggleExpanded: function() {
this.setExpanded(!this.expanded);
},
quickCollapse: function() {
this.removeClass("enyo-animate"), this.$.box.applyStyle("height", "0");
var e = this.$.client.getBounds().height;
this.$.client.setBounds({
top: -e
});
},
_expand: function() {
this.addClass("enyo-animate");
var e = this.$.client.getBounds().height;
this.$.box.setBounds({
height: e
}), this.$.client.setBounds({
top: 0
}), setTimeout(enyo.bind(this, function() {
this.expanded && (this.removeClass("enyo-animate"), this.$.box.applyStyle("height", "auto"));
}), 225);
},
_collapse: function() {
this.removeClass("enyo-animate");
var e = this.$.client.getBounds().height;
this.$.box.setBounds({
height: e
}), setTimeout(enyo.bind(this, function() {
this.addClass("enyo-animate"), this.$.box.applyStyle("height", "0"), this.$.client.setBounds({
top: -e
});
}), 25);
},
expandedChanged: function(e) {
if (!this.expandable) this.expanded = !1; else {
var t = {
expanded: this.expanded
};
this.doExpand(t), t.wait || this.effectExpanded();
}
},
effectExpanded: function() {
this.$.client && (this.expanded ? this._expand() : this._collapse());
}
});

// ImageViewPin.js

enyo.kind({
name: "enyo.ImageViewPin",
kind: "enyo.Control",
published: {
highlightAnchorPoint: !1,
anchor: {
top: 0,
left: 0
},
position: {
top: 0,
left: 0
}
},
style: "position:absolute;z-index:1000;width:0px;height:0px;",
handlers: {
onPositionPin: "reAnchor"
},
create: function() {
this.inherited(arguments), this.styleClientControls(), this.positionClientControls(), this.highlightAnchorPointChanged(), this.anchorChanged();
},
styleClientControls: function() {
var e = this.getClientControls();
for (var t = 0; t < e.length; t++) e[t].applyStyle("position", "absolute");
},
positionClientControls: function() {
var e = this.getClientControls();
for (var t = 0; t < e.length; t++) for (var n in this.position) e[t].applyStyle(n, this.position[n] + "px");
},
highlightAnchorPointChanged: function() {
this.addRemoveClass("pinDebug", this.highlightAnchorPoint);
},
anchorChanged: function() {
var e = null, t = null;
for (t in this.anchor) {
e = this.anchor[t].toString().match(/^(\d+(?:\.\d+)?)(.*)$/);
if (!e) continue;
this.anchor[t + "Coords"] = {
value: e[1],
units: e[2] || "px"
};
}
},
reAnchor: function(e, t) {
var n = t.scale, r = t.bounds, i = this.anchor.right ? this.anchor.rightCoords.units == "px" ? r.width + r.x - this.anchor.rightCoords.value * n : r.width * (100 - this.anchor.rightCoords.value) / 100 + r.x : this.anchor.leftCoords.units == "px" ? this.anchor.leftCoords.value * n + r.x : r.width * this.anchor.leftCoords.value / 100 + r.x, s = this.anchor.bottom ? this.anchor.bottomCoords.units == "px" ? r.height + r.y - this.anchor.bottomCoords.value * n : r.height * (100 - this.anchor.bottomCoords.value) / 100 + r.y : this.anchor.topCoords.units == "px" ? this.anchor.topCoords.value * n + r.y : r.height * this.anchor.topCoords.value / 100 + r.y;
this.applyStyle("left", i + "px"), this.applyStyle("top", s + "px");
}
});

// ImageView.js

enyo.kind({
name: "enyo.ImageView",
kind: enyo.Scroller,
touchOverscroll: !1,
thumb: !1,
animate: !0,
verticalDragPropagation: !0,
horizontalDragPropagation: !0,
published: {
scale: "auto",
disableZoom: !1,
src: undefined
},
events: {
onZoom: ""
},
touch: !0,
preventDragPropagation: !1,
handlers: {
ondragstart: "dragPropagation"
},
components: [ {
name: "animator",
kind: "Animator",
onStep: "zoomAnimationStep",
onEnd: "zoomAnimationEnd"
}, {
name: "viewport",
style: "overflow:hidden;min-height:100%;min-width:100%;",
classes: "enyo-fit",
ongesturechange: "gestureTransform",
ongestureend: "saveState",
ontap: "singleTap",
ondblclick: "doubleClick",
onmousewheel: "mousewheel",
components: [ {
kind: "Image",
ondown: "down"
} ]
} ],
create: function() {
this.inherited(arguments), this.canTransform = enyo.dom.canTransform(), this.canTransform || this.$.image.applyStyle("position", "relative"), this.canAccelerate = enyo.dom.canAccelerate(), this.bufferImage = new Image, this.bufferImage.onload = enyo.bind(this, "imageLoaded"), this.bufferImage.onerror = enyo.bind(this, "imageError"), this.srcChanged(), this.getStrategy().setDragDuringGesture(!1), this.getStrategy().$.scrollMath && this.getStrategy().$.scrollMath.start();
},
down: function(e, t) {
t.preventDefault();
},
dragPropagation: function(e, t) {
var n = this.getStrategy().getScrollBounds(), r = n.top === 0 && t.dy > 0 || n.top >= n.maxTop - 2 && t.dy < 0, i = n.left === 0 && t.dx > 0 || n.left >= n.maxLeft - 2 && t.dx < 0;
return !(r && this.verticalDragPropagation || i && this.horizontalDragPropagation);
},
mousewheel: function(e, t) {
t.pageX |= t.clientX + t.target.scrollLeft, t.pageY |= t.clientY + t.target.scrollTop;
var n = (this.maxScale - this.minScale) / 10, r = this.scale;
if (t.wheelDelta > 0 || t.detail < 0) this.scale = this.limitScale(this.scale + n); else if (t.wheelDelta < 0 || t.detail > 0) this.scale = this.limitScale(this.scale - n);
return this.eventPt = this.calcEventLocation(t), this.transformImage(this.scale), r != this.scale && this.doZoom({
scale: this.scale
}), this.ratioX = this.ratioY = null, t.preventDefault(), !0;
},
srcChanged: function() {
this.src && this.src.length > 0 && this.bufferImage && this.src != this.bufferImage.src && (this.bufferImage.src = this.src);
},
imageLoaded: function(e) {
this.originalWidth = this.bufferImage.width, this.originalHeight = this.bufferImage.height, this.scaleChanged(), this.$.image.setSrc(this.bufferImage.src), enyo.dom.transformValue(this.getStrategy().$.client, "translate3d", "0px, 0px, 0"), this.positionClientControls(this.scale), this.alignImage();
},
resizeHandler: function() {
this.inherited(arguments), this.$.image.src && this.scaleChanged();
},
scaleChanged: function() {
var e = this.hasNode();
if (e) {
this.containerWidth = e.clientWidth, this.containerHeight = e.clientHeight;
var t = this.containerWidth / this.originalWidth, n = this.containerHeight / this.originalHeight;
this.minScale = Math.min(t, n), this.maxScale = this.minScale * 3 < 1 ? 1 : this.minScale * 3, this.scale == "auto" ? this.scale = this.minScale : this.scale == "width" ? this.scale = t : this.scale == "height" ? this.scale = n : this.scale == "fit" ? (this.fitAlignment = "center", this.scale = Math.max(t, n)) : (this.maxScale = Math.max(this.maxScale, this.scale), this.scale = this.limitScale(this.scale));
}
this.eventPt = this.calcEventLocation(), this.transformImage(this.scale);
},
imageError: function(e) {
enyo.error("Error loading image: " + this.src), this.bubble("onerror", e);
},
alignImage: function() {
if (this.fitAlignment && this.fitAlignment === "center") {
var e = this.getScrollBounds();
this.setScrollLeft(e.maxLeft / 2), this.setScrollTop(e.maxTop / 2);
}
},
gestureTransform: function(e, t) {
this.eventPt = this.calcEventLocation(t), this.transformImage(this.limitScale(this.scale * t.scale));
},
calcEventLocation: function(e) {
var t = {
x: 0,
y: 0
};
if (e && this.hasNode()) {
var n = this.node.getBoundingClientRect();
t.x = Math.round(e.pageX - n.left - this.imageBounds.x), t.x = Math.max(0, Math.min(this.imageBounds.width, t.x)), t.y = Math.round(e.pageY - n.top - this.imageBounds.y), t.y = Math.max(0, Math.min(this.imageBounds.height, t.y));
}
return t;
},
transformImage: function(e) {
this.tapped = !1;
var t = this.imageBounds || this.innerImageBounds(e);
this.imageBounds = this.innerImageBounds(e), this.scale > this.minScale ? this.$.viewport.applyStyle("cursor", "move") : this.$.viewport.applyStyle("cursor", null), this.$.viewport.setBounds({
width: this.imageBounds.width + "px",
height: this.imageBounds.height + "px"
}), this.ratioX = this.ratioX || (this.eventPt.x + this.getScrollLeft()) / t.width, this.ratioY = this.ratioY || (this.eventPt.y + this.getScrollTop()) / t.height;
var n, r;
this.$.animator.ratioLock ? (n = this.$.animator.ratioLock.x * this.imageBounds.width - this.containerWidth / 2, r = this.$.animator.ratioLock.y * this.imageBounds.height - this.containerHeight / 2) : (n = this.ratioX * this.imageBounds.width - this.eventPt.x, r = this.ratioY * this.imageBounds.height - this.eventPt.y), n = Math.max(0, Math.min(this.imageBounds.width - this.containerWidth, n)), r = Math.max(0, Math.min(this.imageBounds.height - this.containerHeight, r));
if (this.canTransform) {
var i = {
scale: e
};
this.canAccelerate ? i = enyo.mixin({
translate3d: Math.round(this.imageBounds.left) + "px, " + Math.round(this.imageBounds.top) + "px, 0px"
}, i) : i = enyo.mixin({
translate: this.imageBounds.left + "px, " + this.imageBounds.top + "px"
}, i), enyo.dom.transform(this.$.image, i);
} else this.$.image.setBounds({
width: this.imageBounds.width + "px",
height: this.imageBounds.height + "px",
left: this.imageBounds.left + "px",
top: this.imageBounds.top + "px"
});
this.setScrollLeft(n), this.setScrollTop(r), this.positionClientControls(e);
},
limitScale: function(e) {
return this.disableZoom ? e = this.scale : e > this.maxScale ? e = this.maxScale : e < this.minScale && (e = this.minScale), e;
},
innerImageBounds: function(e) {
var t = this.originalWidth * e, n = this.originalHeight * e, r = {
x: 0,
y: 0,
transX: 0,
transY: 0
};
return t < this.containerWidth && (r.x += (this.containerWidth - t) / 2), n < this.containerHeight && (r.y += (this.containerHeight - n) / 2), this.canTransform && (r.transX -= (this.originalWidth - t) / 2, r.transY -= (this.originalHeight - n) / 2), {
left: r.x + r.transX,
top: r.y + r.transY,
width: t,
height: n,
x: r.x,
y: r.y
};
},
saveState: function(e, t) {
var n = this.scale;
this.scale *= t.scale, this.scale = this.limitScale(this.scale), n != this.scale && this.doZoom({
scale: this.scale
}), this.ratioX = this.ratioY = null;
},
doubleClick: function(e, t) {
enyo.platform.ie == 8 && (this.tapped = !0, t.pageX = t.clientX + t.target.scrollLeft, t.pageY = t.clientY + t.target.scrollTop, this.singleTap(e, t), t.preventDefault());
},
singleTap: function(e, t) {
setTimeout(enyo.bind(this, function() {
this.tapped = !1;
}), 300), this.tapped ? (this.tapped = !1, this.smartZoom(e, t)) : this.tapped = !0;
},
smartZoom: function(e, t) {
var n = this.hasNode(), r = this.$.image.hasNode();
if (n && r && this.hasNode() && !this.disableZoom) {
var i = this.scale;
this.scale != this.minScale ? this.scale = this.minScale : this.scale = this.maxScale, this.eventPt = this.calcEventLocation(t);
if (this.animate) {
var s = {
x: (this.eventPt.x + this.getScrollLeft()) / this.imageBounds.width,
y: (this.eventPt.y + this.getScrollTop()) / this.imageBounds.height
};
this.$.animator.play({
duration: 350,
ratioLock: s,
baseScale: i,
deltaScale: this.scale - i
});
} else this.transformImage(this.scale), this.doZoom({
scale: this.scale
});
}
},
zoomAnimationStep: function(e, t) {
var n = this.$.animator.baseScale + this.$.animator.deltaScale * this.$.animator.value;
this.transformImage(n);
},
zoomAnimationEnd: function(e, t) {
this.doZoom({
scale: this.scale
}), this.$.animator.ratioLock = undefined;
},
positionClientControls: function(e) {
this.waterfallDown("onPositionPin", {
scale: e,
bounds: this.imageBounds
});
}
});

// ImageCarousel.js

enyo.kind({
name: "enyo.ImageCarousel",
kind: enyo.Panels,
arrangerKind: "enyo.CarouselArranger",
defaultScale: "auto",
disableZoom: !1,
lowMemory: !1,
published: {
images: []
},
handlers: {
onTransitionStart: "transitionStart",
onTransitionFinish: "transitionFinish"
},
create: function() {
this.inherited(arguments), this.imageCount = this.images.length, this.images.length > 0 && (this.initContainers(), this.loadNearby());
},
initContainers: function() {
for (var e = 0; e < this.images.length; e++) this.$["container" + e] || (this.createComponent({
name: "container" + e,
style: "height:100%; width:100%;"
}), this.$["container" + e].render());
for (e = this.images.length; e < this.imageCount; e++) this.$["image" + e] && this.$["image" + e].destroy(), this.$["container" + e].destroy();
this.imageCount = this.images.length;
},
loadNearby: function() {
var e = this.getBufferRange();
for (var t in e) this.loadImageView(e[t]);
},
getBufferRange: function() {
var e = [];
if (this.layout.containerBounds) {
var t = 1, n = this.layout.containerBounds, r, i, s, o, u, a;
o = this.index - 1, u = 0, a = n.width * t;
while (o >= 0 && u <= a) s = this.$["container" + o], u += s.width + s.marginWidth, e.unshift(o), o--;
o = this.index, u = 0, a = n.width * (t + 1);
while (o < this.images.length && u <= a) s = this.$["container" + o], u += s.width + s.marginWidth, e.push(o), o++;
}
return e;
},
reflow: function() {
this.inherited(arguments), this.loadNearby();
},
loadImageView: function(e) {
return this.wrap && (e = (e % this.images.length + this.images.length) % this.images.length), e >= 0 && e <= this.images.length - 1 && (this.$["image" + e] ? this.$["image" + e].src != this.images[e] && (this.$["image" + e].setSrc(this.images[e]), this.$["image" + e].setScale(this.defaultScale), this.$["image" + e].setDisableZoom(this.disableZoom)) : (this.$["container" + e].createComponent({
name: "image" + e,
kind: "ImageView",
scale: this.defaultScale,
disableZoom: this.disableZoom,
src: this.images[e],
verticalDragPropagation: !1,
style: "height:100%; width:100%;"
}, {
owner: this
}), this.$["image" + e].render())), this.$["image" + e];
},
setImages: function(e) {
this.setPropertyValue("images", e, "imagesChanged");
},
imagesChanged: function() {
this.initContainers(), this.loadNearby();
},
indexChanged: function() {
this.loadNearby(), this.lowMemory && this.cleanupMemory(), this.inherited(arguments);
},
transitionStart: function(e, t) {
if (t.fromIndex == t.toIndex) return !0;
},
transitionFinish: function(e, t) {
this.loadNearby(), this.lowMemory && this.cleanupMemory();
},
getActiveImage: function() {
return this.getImageByIndex(this.index);
},
getImageByIndex: function(e) {
return this.$["image" + e] || this.loadImageView(e);
},
cleanupMemory: function() {
var e = getBufferRange();
for (var t = 0; t < this.images.length; t++) enyo.indexOf(t, e) === -1 && this.$["image" + t] && this.$["image" + t].destroy();
}
});

// jquery-1.8.3-min.js

(function(e, t) {
function n(e) {
var t = dt[e] = {};
return Y.each(e.split(tt), function(e, n) {
t[n] = !0;
}), t;
}
function r(e, n, r) {
if (r === t && e.nodeType === 1) {
var i = "data-" + n.replace(mt, "-$1").toLowerCase();
r = e.getAttribute(i);
if (typeof r == "string") {
try {
r = r === "true" ? !0 : r === "false" ? !1 : r === "null" ? null : +r + "" === r ? +r : vt.test(r) ? Y.parseJSON(r) : r;
} catch (s) {}
Y.data(e, n, r);
} else r = t;
}
return r;
}
function i(e) {
var t;
for (t in e) {
if (t === "data" && Y.isEmptyObject(e[t])) continue;
if (t !== "toJSON") return !1;
}
return !0;
}
function s() {
return !1;
}
function o() {
return !0;
}
function u(e) {
return !e || !e.parentNode || e.parentNode.nodeType === 11;
}
function a(e, t) {
do e = e[t]; while (e && e.nodeType !== 1);
return e;
}
function f(e, t, n) {
t = t || 0;
if (Y.isFunction(t)) return Y.grep(e, function(e, r) {
var i = !!t.call(e, r, e);
return i === n;
});
if (t.nodeType) return Y.grep(e, function(e, r) {
return e === t === n;
});
if (typeof t == "string") {
var r = Y.grep(e, function(e) {
return e.nodeType === 1;
});
if (Bt.test(t)) return Y.filter(t, r, !n);
t = Y.filter(t, r);
}
return Y.grep(e, function(e, r) {
return Y.inArray(e, t) >= 0 === n;
});
}
function l(e) {
var t = It.split("|"), n = e.createDocumentFragment();
if (n.createElement) while (t.length) n.createElement(t.pop());
return n;
}
function c(e, t) {
return e.getElementsByTagName(t)[0] || e.appendChild(e.ownerDocument.createElement(t));
}
function h(e, t) {
if (t.nodeType !== 1 || !Y.hasData(e)) return;
var n, r, i, s = Y._data(e), o = Y._data(t, s), u = s.events;
if (u) {
delete o.handle, o.events = {};
for (n in u) for (r = 0, i = u[n].length; r < i; r++) Y.event.add(t, n, u[n][r]);
}
o.data && (o.data = Y.extend({}, o.data));
}
function p(e, t) {
var n;
if (t.nodeType !== 1) return;
t.clearAttributes && t.clearAttributes(), t.mergeAttributes && t.mergeAttributes(e), n = t.nodeName.toLowerCase(), n === "object" ? (t.parentNode && (t.outerHTML = e.outerHTML), Y.support.html5Clone && e.innerHTML && !Y.trim(t.innerHTML) && (t.innerHTML = e.innerHTML)) : n === "input" && Kt.test(e.type) ? (t.defaultChecked = t.checked = e.checked, t.value !== e.value && (t.value = e.value)) : n === "option" ? t.selected = e.defaultSelected : n === "input" || n === "textarea" ? t.defaultValue = e.defaultValue : n === "script" && t.text !== e.text && (t.text = e.text), t.removeAttribute(Y.expando);
}
function d(e) {
return typeof e.getElementsByTagName != "undefined" ? e.getElementsByTagName("*") : typeof e.querySelectorAll != "undefined" ? e.querySelectorAll("*") : [];
}
function v(e) {
Kt.test(e.type) && (e.defaultChecked = e.checked);
}
function m(e, t) {
if (t in e) return t;
var n = t.charAt(0).toUpperCase() + t.slice(1), r = t, i = yn.length;
while (i--) {
t = yn[i] + n;
if (t in e) return t;
}
return r;
}
function g(e, t) {
return e = t || e, Y.css(e, "display") === "none" || !Y.contains(e.ownerDocument, e);
}
function y(e, t) {
var n, r, i = [], s = 0, o = e.length;
for (; s < o; s++) {
n = e[s];
if (!n.style) continue;
i[s] = Y._data(n, "olddisplay"), t ? (!i[s] && n.style.display === "none" && (n.style.display = ""), n.style.display === "" && g(n) && (i[s] = Y._data(n, "olddisplay", S(n.nodeName)))) : (r = nn(n, "display"), !i[s] && r !== "none" && Y._data(n, "olddisplay", r));
}
for (s = 0; s < o; s++) {
n = e[s];
if (!n.style) continue;
if (!t || n.style.display === "none" || n.style.display === "") n.style.display = t ? i[s] || "" : "none";
}
return e;
}
function b(e, t, n) {
var r = cn.exec(t);
return r ? Math.max(0, r[1] - (n || 0)) + (r[2] || "px") : t;
}
function w(e, t, n, r) {
var i = n === (r ? "border" : "content") ? 4 : t === "width" ? 1 : 0, s = 0;
for (; i < 4; i += 2) n === "margin" && (s += Y.css(e, n + gn[i], !0)), r ? (n === "content" && (s -= parseFloat(nn(e, "padding" + gn[i])) || 0), n !== "margin" && (s -= parseFloat(nn(e, "border" + gn[i] + "Width")) || 0)) : (s += parseFloat(nn(e, "padding" + gn[i])) || 0, n !== "padding" && (s += parseFloat(nn(e, "border" + gn[i] + "Width")) || 0));
return s;
}
function E(e, t, n) {
var r = t === "width" ? e.offsetWidth : e.offsetHeight, i = !0, s = Y.support.boxSizing && Y.css(e, "boxSizing") === "border-box";
if (r <= 0 || r == null) {
r = nn(e, t);
if (r < 0 || r == null) r = e.style[t];
if (hn.test(r)) return r;
i = s && (Y.support.boxSizingReliable || r === e.style[t]), r = parseFloat(r) || 0;
}
return r + w(e, t, n || (s ? "border" : "content"), i) + "px";
}
function S(e) {
if (dn[e]) return dn[e];
var t = Y("<" + e + ">").appendTo(R.body), n = t.css("display");
t.remove();
if (n === "none" || n === "") {
rn = R.body.appendChild(rn || Y.extend(R.createElement("iframe"), {
frameBorder: 0,
width: 0,
height: 0
}));
if (!sn || !rn.createElement) sn = (rn.contentWindow || rn.contentDocument).document, sn.write("<!doctype html><html><body>"), sn.close();
t = sn.body.appendChild(sn.createElement(e)), n = nn(t, "display"), R.body.removeChild(rn);
}
return dn[e] = n, n;
}
function x(e, t, n, r) {
var i;
if (Y.isArray(t)) Y.each(t, function(t, i) {
n || En.test(e) ? r(e, i) : x(e + "[" + (typeof i == "object" ? t : "") + "]", i, n, r);
}); else if (!n && Y.type(t) === "object") for (i in t) x(e + "[" + i + "]", t[i], n, r); else r(e, t);
}
function T(e) {
return function(t, n) {
typeof t != "string" && (n = t, t = "*");
var r, i, s, o = t.toLowerCase().split(tt), u = 0, a = o.length;
if (Y.isFunction(n)) for (; u < a; u++) r = o[u], s = /^\+/.test(r), s && (r = r.substr(1) || "*"), i = e[r] = e[r] || [], i[s ? "unshift" : "push"](n);
};
}
function N(e, n, r, i, s, o) {
s = s || n.dataTypes[0], o = o || {}, o[s] = !0;
var u, a = e[s], f = 0, l = a ? a.length : 0, c = e === jn;
for (; f < l && (c || !u); f++) u = a[f](n, r, i), typeof u == "string" && (!c || o[u] ? u = t : (n.dataTypes.unshift(u), u = N(e, n, r, i, u, o)));
return (c || !u) && !o["*"] && (u = N(e, n, r, i, "*", o)), u;
}
function C(e, n) {
var r, i, s = Y.ajaxSettings.flatOptions || {};
for (r in n) n[r] !== t && ((s[r] ? e : i || (i = {}))[r] = n[r]);
i && Y.extend(!0, e, i);
}
function k(e, n, r) {
var i, s, o, u, a = e.contents, f = e.dataTypes, l = e.responseFields;
for (s in l) s in r && (n[l[s]] = r[s]);
while (f[0] === "*") f.shift(), i === t && (i = e.mimeType || n.getResponseHeader("content-type"));
if (i) for (s in a) if (a[s] && a[s].test(i)) {
f.unshift(s);
break;
}
if (f[0] in r) o = f[0]; else {
for (s in r) {
if (!f[0] || e.converters[s + " " + f[0]]) {
o = s;
break;
}
u || (u = s);
}
o = o || u;
}
if (o) return o !== f[0] && f.unshift(o), r[o];
}
function L(e, t) {
var n, r, i, s, o = e.dataTypes.slice(), u = o[0], a = {}, f = 0;
e.dataFilter && (t = e.dataFilter(t, e.dataType));
if (o[1]) for (n in e.converters) a[n.toLowerCase()] = e.converters[n];
for (; i = o[++f]; ) if (i !== "*") {
if (u !== "*" && u !== i) {
n = a[u + " " + i] || a["* " + i];
if (!n) for (r in a) {
s = r.split(" ");
if (s[1] === i) {
n = a[u + " " + s[0]] || a["* " + s[0]];
if (n) {
n === !0 ? n = a[r] : a[r] !== !0 && (i = s[0], o.splice(f--, 0, i));
break;
}
}
}
if (n !== !0) if (n && e["throws"]) t = n(t); else try {
t = n(t);
} catch (l) {
return {
state: "parsererror",
error: n ? l : "No conversion from " + u + " to " + i
};
}
}
u = i;
}
return {
state: "success",
data: t
};
}
function A() {
try {
return new e.XMLHttpRequest;
} catch (t) {}
}
function O() {
try {
return new e.ActiveXObject("Microsoft.XMLHTTP");
} catch (t) {}
}
function M() {
return setTimeout(function() {
Jn = t;
}, 0), Jn = Y.now();
}
function _(e, t) {
Y.each(t, function(t, n) {
var r = (er[t] || []).concat(er["*"]), i = 0, s = r.length;
for (; i < s; i++) if (r[i].call(e, t, n)) return;
});
}
function D(e, t, n) {
var r, i = 0, s = 0, o = Zn.length, u = Y.Deferred().always(function() {
delete a.elem;
}), a = function() {
var t = Jn || M(), n = Math.max(0, f.startTime + f.duration - t), r = n / f.duration || 0, i = 1 - r, s = 0, o = f.tweens.length;
for (; s < o; s++) f.tweens[s].run(i);
return u.notifyWith(e, [ f, i, n ]), i < 1 && o ? n : (u.resolveWith(e, [ f ]), !1);
}, f = u.promise({
elem: e,
props: Y.extend({}, t),
opts: Y.extend(!0, {
specialEasing: {}
}, n),
originalProperties: t,
originalOptions: n,
startTime: Jn || M(),
duration: n.duration,
tweens: [],
createTween: function(t, n, r) {
var i = Y.Tween(e, f.opts, t, n, f.opts.specialEasing[t] || f.opts.easing);
return f.tweens.push(i), i;
},
stop: function(t) {
var n = 0, r = t ? f.tweens.length : 0;
for (; n < r; n++) f.tweens[n].run(1);
return t ? u.resolveWith(e, [ f, t ]) : u.rejectWith(e, [ f, t ]), this;
}
}), l = f.props;
P(l, f.opts.specialEasing);
for (; i < o; i++) {
r = Zn[i].call(f, e, l, f.opts);
if (r) return r;
}
return _(f, l), Y.isFunction(f.opts.start) && f.opts.start.call(e, f), Y.fx.timer(Y.extend(a, {
anim: f,
queue: f.opts.queue,
elem: e
})), f.progress(f.opts.progress).done(f.opts.done, f.opts.complete).fail(f.opts.fail).always(f.opts.always);
}
function P(e, t) {
var n, r, i, s, o;
for (n in e) {
r = Y.camelCase(n), i = t[r], s = e[n], Y.isArray(s) && (i = s[1], s = e[n] = s[0]), n !== r && (e[r] = s, delete e[n]), o = Y.cssHooks[r];
if (o && "expand" in o) {
s = o.expand(s), delete e[r];
for (n in s) n in e || (e[n] = s[n], t[n] = i);
} else t[r] = i;
}
}
function H(e, t, n) {
var r, i, s, o, u, a, f, l, c, h = this, p = e.style, d = {}, v = [], m = e.nodeType && g(e);
n.queue || (l = Y._queueHooks(e, "fx"), l.unqueued == null && (l.unqueued = 0, c = l.empty.fire, l.empty.fire = function() {
l.unqueued || c();
}), l.unqueued++, h.always(function() {
h.always(function() {
l.unqueued--, Y.queue(e, "fx").length || l.empty.fire();
});
})), e.nodeType === 1 && ("height" in t || "width" in t) && (n.overflow = [ p.overflow, p.overflowX, p.overflowY ], Y.css(e, "display") === "inline" && Y.css(e, "float") === "none" && (!Y.support.inlineBlockNeedsLayout || S(e.nodeName) === "inline" ? p.display = "inline-block" : p.zoom = 1)), n.overflow && (p.overflow = "hidden", Y.support.shrinkWrapBlocks || h.done(function() {
p.overflow = n.overflow[0], p.overflowX = n.overflow[1], p.overflowY = n.overflow[2];
}));
for (r in t) {
s = t[r];
if (Qn.exec(s)) {
delete t[r], a = a || s === "toggle";
if (s === (m ? "hide" : "show")) continue;
v.push(r);
}
}
o = v.length;
if (o) {
u = Y._data(e, "fxshow") || Y._data(e, "fxshow", {}), "hidden" in u && (m = u.hidden), a && (u.hidden = !m), m ? Y(e).show() : h.done(function() {
Y(e).hide();
}), h.done(function() {
var t;
Y.removeData(e, "fxshow", !0);
for (t in d) Y.style(e, t, d[t]);
});
for (r = 0; r < o; r++) i = v[r], f = h.createTween(i, m ? u[i] : 0), d[i] = u[i] || Y.style(e, i), i in u || (u[i] = f.start, m && (f.end = f.start, f.start = i === "width" || i === "height" ? 1 : 0));
}
}
function B(e, t, n, r, i) {
return new B.prototype.init(e, t, n, r, i);
}
function j(e, t) {
var n, r = {
height: e
}, i = 0;
t = t ? 1 : 0;
for (; i < 4; i += 2 - t) n = gn[i], r["margin" + n] = r["padding" + n] = e;
return t && (r.opacity = r.width = e), r;
}
function F(e) {
return Y.isWindow(e) ? e : e.nodeType === 9 ? e.defaultView || e.parentWindow : !1;
}
var I, q, R = e.document, U = e.location, z = e.navigator, W = e.jQuery, X = e.$, V = Array.prototype.push, $ = Array.prototype.slice, J = Array.prototype.indexOf, K = Object.prototype.toString, Q = Object.prototype.hasOwnProperty, G = String.prototype.trim, Y = function(e, t) {
return new Y.fn.init(e, t, I);
}, Z = /[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source, et = /\S/, tt = /\s+/, nt = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, rt = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/, it = /^<(\w+)\s*\/?>(?:<\/\1>|)$/, st = /^[\],:{}\s]*$/, ot = /(?:^|:|,)(?:\s*\[)+/g, ut = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g, at = /"[^"\\\r\n]*"|true|false|null|-?(?:\d\d*\.|)\d+(?:[eE][\-+]?\d+|)/g, ft = /^-ms-/, lt = /-([\da-z])/gi, ct = function(e, t) {
return (t + "").toUpperCase();
}, ht = function() {
R.addEventListener ? (R.removeEventListener("DOMContentLoaded", ht, !1), Y.ready()) : R.readyState === "complete" && (R.detachEvent("onreadystatechange", ht), Y.ready());
}, pt = {};
Y.fn = Y.prototype = {
constructor: Y,
init: function(e, n, r) {
var i, s, o, u;
if (!e) return this;
if (e.nodeType) return this.context = this[0] = e, this.length = 1, this;
if (typeof e == "string") {
e.charAt(0) === "<" && e.charAt(e.length - 1) === ">" && e.length >= 3 ? i = [ null, e, null ] : i = rt.exec(e);
if (i && (i[1] || !n)) {
if (i[1]) return n = n instanceof Y ? n[0] : n, u = n && n.nodeType ? n.ownerDocument || n : R, e = Y.parseHTML(i[1], u, !0), it.test(i[1]) && Y.isPlainObject(n) && this.attr.call(e, n, !0), Y.merge(this, e);
s = R.getElementById(i[2]);
if (s && s.parentNode) {
if (s.id !== i[2]) return r.find(e);
this.length = 1, this[0] = s;
}
return this.context = R, this.selector = e, this;
}
return !n || n.jquery ? (n || r).find(e) : this.constructor(n).find(e);
}
return Y.isFunction(e) ? r.ready(e) : (e.selector !== t && (this.selector = e.selector, this.context = e.context), Y.makeArray(e, this));
},
selector: "",
jquery: "1.8.3",
length: 0,
size: function() {
return this.length;
},
toArray: function() {
return $.call(this);
},
get: function(e) {
return e == null ? this.toArray() : e < 0 ? this[this.length + e] : this[e];
},
pushStack: function(e, t, n) {
var r = Y.merge(this.constructor(), e);
return r.prevObject = this, r.context = this.context, t === "find" ? r.selector = this.selector + (this.selector ? " " : "") + n : t && (r.selector = this.selector + "." + t + "(" + n + ")"), r;
},
each: function(e, t) {
return Y.each(this, e, t);
},
ready: function(e) {
return Y.ready.promise().done(e), this;
},
eq: function(e) {
return e = +e, e === -1 ? this.slice(e) : this.slice(e, e + 1);
},
first: function() {
return this.eq(0);
},
last: function() {
return this.eq(-1);
},
slice: function() {
return this.pushStack($.apply(this, arguments), "slice", $.call(arguments).join(","));
},
map: function(e) {
return this.pushStack(Y.map(this, function(t, n) {
return e.call(t, n, t);
}));
},
end: function() {
return this.prevObject || this.constructor(null);
},
push: V,
sort: [].sort,
splice: [].splice
}, Y.fn.init.prototype = Y.fn, Y.extend = Y.fn.extend = function() {
var e, n, r, i, s, o, u = arguments[0] || {}, a = 1, f = arguments.length, l = !1;
typeof u == "boolean" && (l = u, u = arguments[1] || {}, a = 2), typeof u != "object" && !Y.isFunction(u) && (u = {}), f === a && (u = this, --a);
for (; a < f; a++) if ((e = arguments[a]) != null) for (n in e) {
r = u[n], i = e[n];
if (u === i) continue;
l && i && (Y.isPlainObject(i) || (s = Y.isArray(i))) ? (s ? (s = !1, o = r && Y.isArray(r) ? r : []) : o = r && Y.isPlainObject(r) ? r : {}, u[n] = Y.extend(l, o, i)) : i !== t && (u[n] = i);
}
return u;
}, Y.extend({
noConflict: function(t) {
return e.$ === Y && (e.$ = X), t && e.jQuery === Y && (e.jQuery = W), Y;
},
isReady: !1,
readyWait: 1,
holdReady: function(e) {
e ? Y.readyWait++ : Y.ready(!0);
},
ready: function(e) {
if (e === !0 ? --Y.readyWait : Y.isReady) return;
if (!R.body) return setTimeout(Y.ready, 1);
Y.isReady = !0;
if (e !== !0 && --Y.readyWait > 0) return;
q.resolveWith(R, [ Y ]), Y.fn.trigger && Y(R).trigger("ready").off("ready");
},
isFunction: function(e) {
return Y.type(e) === "function";
},
isArray: Array.isArray || function(e) {
return Y.type(e) === "array";
},
isWindow: function(e) {
return e != null && e == e.window;
},
isNumeric: function(e) {
return !isNaN(parseFloat(e)) && isFinite(e);
},
type: function(e) {
return e == null ? String(e) : pt[K.call(e)] || "object";
},
isPlainObject: function(e) {
if (!e || Y.type(e) !== "object" || e.nodeType || Y.isWindow(e)) return !1;
try {
if (e.constructor && !Q.call(e, "constructor") && !Q.call(e.constructor.prototype, "isPrototypeOf")) return !1;
} catch (n) {
return !1;
}
var r;
for (r in e) ;
return r === t || Q.call(e, r);
},
isEmptyObject: function(e) {
var t;
for (t in e) return !1;
return !0;
},
error: function(e) {
throw new Error(e);
},
parseHTML: function(e, t, n) {
var r;
return !e || typeof e != "string" ? null : (typeof t == "boolean" && (n = t, t = 0), t = t || R, (r = it.exec(e)) ? [ t.createElement(r[1]) ] : (r = Y.buildFragment([ e ], t, n ? null : []), Y.merge([], (r.cacheable ? Y.clone(r.fragment) : r.fragment).childNodes)));
},
parseJSON: function(t) {
if (!t || typeof t != "string") return null;
t = Y.trim(t);
if (e.JSON && e.JSON.parse) return e.JSON.parse(t);
if (st.test(t.replace(ut, "@").replace(at, "]").replace(ot, ""))) return (new Function("return " + t))();
Y.error("Invalid JSON: " + t);
},
parseXML: function(n) {
var r, i;
if (!n || typeof n != "string") return null;
try {
e.DOMParser ? (i = new DOMParser, r = i.parseFromString(n, "text/xml")) : (r = new ActiveXObject("Microsoft.XMLDOM"), r.async = "false", r.loadXML(n));
} catch (s) {
r = t;
}
return (!r || !r.documentElement || r.getElementsByTagName("parsererror").length) && Y.error("Invalid XML: " + n), r;
},
noop: function() {},
globalEval: function(t) {
t && et.test(t) && (e.execScript || function(t) {
e.eval.call(e, t);
})(t);
},
camelCase: function(e) {
return e.replace(ft, "ms-").replace(lt, ct);
},
nodeName: function(e, t) {
return e.nodeName && e.nodeName.toLowerCase() === t.toLowerCase();
},
each: function(e, n, r) {
var i, s = 0, o = e.length, u = o === t || Y.isFunction(e);
if (r) {
if (u) {
for (i in e) if (n.apply(e[i], r) === !1) break;
} else for (; s < o; ) if (n.apply(e[s++], r) === !1) break;
} else if (u) {
for (i in e) if (n.call(e[i], i, e[i]) === !1) break;
} else for (; s < o; ) if (n.call(e[s], s, e[s++]) === !1) break;
return e;
},
trim: G && !G.call("\ufeff\u00a0") ? function(e) {
return e == null ? "" : G.call(e);
} : function(e) {
return e == null ? "" : (e + "").replace(nt, "");
},
makeArray: function(e, t) {
var n, r = t || [];
return e != null && (n = Y.type(e), e.length == null || n === "string" || n === "function" || n === "regexp" || Y.isWindow(e) ? V.call(r, e) : Y.merge(r, e)), r;
},
inArray: function(e, t, n) {
var r;
if (t) {
if (J) return J.call(t, e, n);
r = t.length, n = n ? n < 0 ? Math.max(0, r + n) : n : 0;
for (; n < r; n++) if (n in t && t[n] === e) return n;
}
return -1;
},
merge: function(e, n) {
var r = n.length, i = e.length, s = 0;
if (typeof r == "number") for (; s < r; s++) e[i++] = n[s]; else while (n[s] !== t) e[i++] = n[s++];
return e.length = i, e;
},
grep: function(e, t, n) {
var r, i = [], s = 0, o = e.length;
n = !!n;
for (; s < o; s++) r = !!t(e[s], s), n !== r && i.push(e[s]);
return i;
},
map: function(e, n, r) {
var i, s, o = [], u = 0, a = e.length, f = e instanceof Y || a !== t && typeof a == "number" && (a > 0 && e[0] && e[a - 1] || a === 0 || Y.isArray(e));
if (f) for (; u < a; u++) i = n(e[u], u, r), i != null && (o[o.length] = i); else for (s in e) i = n(e[s], s, r), i != null && (o[o.length] = i);
return o.concat.apply([], o);
},
guid: 1,
proxy: function(e, n) {
var r, i, s;
return typeof n == "string" && (r = e[n], n = e, e = r), Y.isFunction(e) ? (i = $.call(arguments, 2), s = function() {
return e.apply(n, i.concat($.call(arguments)));
}, s.guid = e.guid = e.guid || Y.guid++, s) : t;
},
access: function(e, n, r, i, s, o, u) {
var a, f = r == null, l = 0, c = e.length;
if (r && typeof r == "object") {
for (l in r) Y.access(e, n, l, r[l], 1, o, i);
s = 1;
} else if (i !== t) {
a = u === t && Y.isFunction(i), f && (a ? (a = n, n = function(e, t, n) {
return a.call(Y(e), n);
}) : (n.call(e, i), n = null));
if (n) for (; l < c; l++) n(e[l], r, a ? i.call(e[l], l, n(e[l], r)) : i, u);
s = 1;
}
return s ? e : f ? n.call(e) : c ? n(e[0], r) : o;
},
now: function() {
return (new Date).getTime();
}
}), Y.ready.promise = function(t) {
if (!q) {
q = Y.Deferred();
if (R.readyState === "complete") setTimeout(Y.ready, 1); else if (R.addEventListener) R.addEventListener("DOMContentLoaded", ht, !1), e.addEventListener("load", Y.ready, !1); else {
R.attachEvent("onreadystatechange", ht), e.attachEvent("onload", Y.ready);
var n = !1;
try {
n = e.frameElement == null && R.documentElement;
} catch (r) {}
n && n.doScroll && function i() {
if (!Y.isReady) {
try {
n.doScroll("left");
} catch (e) {
return setTimeout(i, 50);
}
Y.ready();
}
}();
}
}
return q.promise(t);
}, Y.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(e, t) {
pt["[object " + t + "]"] = t.toLowerCase();
}), I = Y(R);
var dt = {};
Y.Callbacks = function(e) {
e = typeof e == "string" ? dt[e] || n(e) : Y.extend({}, e);
var r, i, s, o, u, a, f = [], l = !e.once && [], c = function(t) {
r = e.memory && t, i = !0, a = o || 0, o = 0, u = f.length, s = !0;
for (; f && a < u; a++) if (f[a].apply(t[0], t[1]) === !1 && e.stopOnFalse) {
r = !1;
break;
}
s = !1, f && (l ? l.length && c(l.shift()) : r ? f = [] : h.disable());
}, h = {
add: function() {
if (f) {
var t = f.length;
(function n(t) {
Y.each(t, function(t, r) {
var i = Y.type(r);
i === "function" ? (!e.unique || !h.has(r)) && f.push(r) : r && r.length && i !== "string" && n(r);
});
})(arguments), s ? u = f.length : r && (o = t, c(r));
}
return this;
},
remove: function() {
return f && Y.each(arguments, function(e, t) {
var n;
while ((n = Y.inArray(t, f, n)) > -1) f.splice(n, 1), s && (n <= u && u--, n <= a && a--);
}), this;
},
has: function(e) {
return Y.inArray(e, f) > -1;
},
empty: function() {
return f = [], this;
},
disable: function() {
return f = l = r = t, this;
},
disabled: function() {
return !f;
},
lock: function() {
return l = t, r || h.disable(), this;
},
locked: function() {
return !l;
},
fireWith: function(e, t) {
return t = t || [], t = [ e, t.slice ? t.slice() : t ], f && (!i || l) && (s ? l.push(t) : c(t)), this;
},
fire: function() {
return h.fireWith(this, arguments), this;
},
fired: function() {
return !!i;
}
};
return h;
}, Y.extend({
Deferred: function(e) {
var t = [ [ "resolve", "done", Y.Callbacks("once memory"), "resolved" ], [ "reject", "fail", Y.Callbacks("once memory"), "rejected" ], [ "notify", "progress", Y.Callbacks("memory") ] ], n = "pending", r = {
state: function() {
return n;
},
always: function() {
return i.done(arguments).fail(arguments), this;
},
then: function() {
var e = arguments;
return Y.Deferred(function(n) {
Y.each(t, function(t, r) {
var s = r[0], o = e[t];
i[r[1]](Y.isFunction(o) ? function() {
var e = o.apply(this, arguments);
e && Y.isFunction(e.promise) ? e.promise().done(n.resolve).fail(n.reject).progress(n.notify) : n[s + "With"](this === i ? n : this, [ e ]);
} : n[s]);
}), e = null;
}).promise();
},
promise: function(e) {
return e != null ? Y.extend(e, r) : r;
}
}, i = {};
return r.pipe = r.then, Y.each(t, function(e, s) {
var o = s[2], u = s[3];
r[s[1]] = o.add, u && o.add(function() {
n = u;
}, t[e ^ 1][2].disable, t[2][2].lock), i[s[0]] = o.fire, i[s[0] + "With"] = o.fireWith;
}), r.promise(i), e && e.call(i, i), i;
},
when: function(e) {
var t = 0, n = $.call(arguments), r = n.length, i = r !== 1 || e && Y.isFunction(e.promise) ? r : 0, s = i === 1 ? e : Y.Deferred(), o = function(e, t, n) {
return function(r) {
t[e] = this, n[e] = arguments.length > 1 ? $.call(arguments) : r, n === u ? s.notifyWith(t, n) : --i || s.resolveWith(t, n);
};
}, u, a, f;
if (r > 1) {
u = new Array(r), a = new Array(r), f = new Array(r);
for (; t < r; t++) n[t] && Y.isFunction(n[t].promise) ? n[t].promise().done(o(t, f, n)).fail(s.reject).progress(o(t, a, u)) : --i;
}
return i || s.resolveWith(f, n), s.promise();
}
}), Y.support = function() {
var t, n, r, i, s, o, u, a, f, l, c, h = R.createElement("div");
h.setAttribute("className", "t"), h.innerHTML = "  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>", n = h.getElementsByTagName("*"), r = h.getElementsByTagName("a")[0];
if (!n || !r || !n.length) return {};
i = R.createElement("select"), s = i.appendChild(R.createElement("option")), o = h.getElementsByTagName("input")[0], r.style.cssText = "top:1px;float:left;opacity:.5", t = {
leadingWhitespace: h.firstChild.nodeType === 3,
tbody: !h.getElementsByTagName("tbody").length,
htmlSerialize: !!h.getElementsByTagName("link").length,
style: /top/.test(r.getAttribute("style")),
hrefNormalized: r.getAttribute("href") === "/a",
opacity: /^0.5/.test(r.style.opacity),
cssFloat: !!r.style.cssFloat,
checkOn: o.value === "on",
optSelected: s.selected,
getSetAttribute: h.className !== "t",
enctype: !!R.createElement("form").enctype,
html5Clone: R.createElement("nav").cloneNode(!0).outerHTML !== "<:nav></:nav>",
boxModel: R.compatMode === "CSS1Compat",
submitBubbles: !0,
changeBubbles: !0,
focusinBubbles: !1,
deleteExpando: !0,
noCloneEvent: !0,
inlineBlockNeedsLayout: !1,
shrinkWrapBlocks: !1,
reliableMarginRight: !0,
boxSizingReliable: !0,
pixelPosition: !1
}, o.checked = !0, t.noCloneChecked = o.cloneNode(!0).checked, i.disabled = !0, t.optDisabled = !s.disabled;
try {
delete h.test;
} catch (p) {
t.deleteExpando = !1;
}
!h.addEventListener && h.attachEvent && h.fireEvent && (h.attachEvent("onclick", c = function() {
t.noCloneEvent = !1;
}), h.cloneNode(!0).fireEvent("onclick"), h.detachEvent("onclick", c)), o = R.createElement("input"), o.value = "t", o.setAttribute("type", "radio"), t.radioValue = o.value === "t", o.setAttribute("checked", "checked"), o.setAttribute("name", "t"), h.appendChild(o), u = R.createDocumentFragment(), u.appendChild(h.lastChild), t.checkClone = u.cloneNode(!0).cloneNode(!0).lastChild.checked, t.appendChecked = o.checked, u.removeChild(o), u.appendChild(h);
if (h.attachEvent) for (f in {
submit: !0,
change: !0,
focusin: !0
}) a = "on" + f, l = a in h, l || (h.setAttribute(a, "return;"), l = typeof h[a] == "function"), t[f + "Bubbles"] = l;
return Y(function() {
var n, r, i, s, o = "padding:0;margin:0;border:0;display:block;overflow:hidden;", u = R.getElementsByTagName("body")[0];
if (!u) return;
n = R.createElement("div"), n.style.cssText = "visibility:hidden;border:0;width:0;height:0;position:static;top:0;margin-top:1px", u.insertBefore(n, u.firstChild), r = R.createElement("div"), n.appendChild(r), r.innerHTML = "<table><tr><td></td><td>t</td></tr></table>", i = r.getElementsByTagName("td"), i[0].style.cssText = "padding:0;margin:0;border:0;display:none", l = i[0].offsetHeight === 0, i[0].style.display = "", i[1].style.display = "none", t.reliableHiddenOffsets = l && i[0].offsetHeight === 0, r.innerHTML = "", r.style.cssText = "box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;", t.boxSizing = r.offsetWidth === 4, t.doesNotIncludeMarginInBodyOffset = u.offsetTop !== 1, e.getComputedStyle && (t.pixelPosition = (e.getComputedStyle(r, null) || {}).top !== "1%", t.boxSizingReliable = (e.getComputedStyle(r, null) || {
width: "4px"
}).width === "4px", s = R.createElement("div"), s.style.cssText = r.style.cssText = o, s.style.marginRight = s.style.width = "0", r.style.width = "1px", r.appendChild(s), t.reliableMarginRight = !parseFloat((e.getComputedStyle(s, null) || {}).marginRight)), typeof r.style.zoom != "undefined" && (r.innerHTML = "", r.style.cssText = o + "width:1px;padding:1px;display:inline;zoom:1", t.inlineBlockNeedsLayout = r.offsetWidth === 3, r.style.display = "block", r.style.overflow = "visible", r.innerHTML = "<div></div>", r.firstChild.style.width = "5px", t.shrinkWrapBlocks = r.offsetWidth !== 3, n.style.zoom = 1), u.removeChild(n), n = r = i = s = null;
}), u.removeChild(h), n = r = i = s = o = u = h = null, t;
}();
var vt = /(?:\{[\s\S]*\}|\[[\s\S]*\])$/, mt = /([A-Z])/g;
Y.extend({
cache: {},
deletedIds: [],
uuid: 0,
expando: "jQuery" + (Y.fn.jquery + Math.random()).replace(/\D/g, ""),
noData: {
embed: !0,
object: "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
applet: !0
},
hasData: function(e) {
return e = e.nodeType ? Y.cache[e[Y.expando]] : e[Y.expando], !!e && !i(e);
},
data: function(e, n, r, i) {
if (!Y.acceptData(e)) return;
var s, o, u = Y.expando, a = typeof n == "string", f = e.nodeType, l = f ? Y.cache : e, c = f ? e[u] : e[u] && u;
if ((!c || !l[c] || !i && !l[c].data) && a && r === t) return;
c || (f ? e[u] = c = Y.deletedIds.pop() || Y.guid++ : c = u), l[c] || (l[c] = {}, f || (l[c].toJSON = Y.noop));
if (typeof n == "object" || typeof n == "function") i ? l[c] = Y.extend(l[c], n) : l[c].data = Y.extend(l[c].data, n);
return s = l[c], i || (s.data || (s.data = {}), s = s.data), r !== t && (s[Y.camelCase(n)] = r), a ? (o = s[n], o == null && (o = s[Y.camelCase(n)])) : o = s, o;
},
removeData: function(e, t, n) {
if (!Y.acceptData(e)) return;
var r, s, o, u = e.nodeType, a = u ? Y.cache : e, f = u ? e[Y.expando] : Y.expando;
if (!a[f]) return;
if (t) {
r = n ? a[f] : a[f].data;
if (r) {
Y.isArray(t) || (t in r ? t = [ t ] : (t = Y.camelCase(t), t in r ? t = [ t ] : t = t.split(" ")));
for (s = 0, o = t.length; s < o; s++) delete r[t[s]];
if (!(n ? i : Y.isEmptyObject)(r)) return;
}
}
if (!n) {
delete a[f].data;
if (!i(a[f])) return;
}
u ? Y.cleanData([ e ], !0) : Y.support.deleteExpando || a != a.window ? delete a[f] : a[f] = null;
},
_data: function(e, t, n) {
return Y.data(e, t, n, !0);
},
acceptData: function(e) {
var t = e.nodeName && Y.noData[e.nodeName.toLowerCase()];
return !t || t !== !0 && e.getAttribute("classid") === t;
}
}), Y.fn.extend({
data: function(e, n) {
var i, s, o, u, a, f = this[0], l = 0, c = null;
if (e === t) {
if (this.length) {
c = Y.data(f);
if (f.nodeType === 1 && !Y._data(f, "parsedAttrs")) {
o = f.attributes;
for (a = o.length; l < a; l++) u = o[l].name, u.indexOf("data-") || (u = Y.camelCase(u.substring(5)), r(f, u, c[u]));
Y._data(f, "parsedAttrs", !0);
}
}
return c;
}
return typeof e == "object" ? this.each(function() {
Y.data(this, e);
}) : (i = e.split(".", 2), i[1] = i[1] ? "." + i[1] : "", s = i[1] + "!", Y.access(this, function(n) {
if (n === t) return c = this.triggerHandler("getData" + s, [ i[0] ]), c === t && f && (c = Y.data(f, e), c = r(f, e, c)), c === t && i[1] ? this.data(i[0]) : c;
i[1] = n, this.each(function() {
var t = Y(this);
t.triggerHandler("setData" + s, i), Y.data(this, e, n), t.triggerHandler("changeData" + s, i);
});
}, null, n, arguments.length > 1, null, !1));
},
removeData: function(e) {
return this.each(function() {
Y.removeData(this, e);
});
}
}), Y.extend({
queue: function(e, t, n) {
var r;
if (e) return t = (t || "fx") + "queue", r = Y._data(e, t), n && (!r || Y.isArray(n) ? r = Y._data(e, t, Y.makeArray(n)) : r.push(n)), r || [];
},
dequeue: function(e, t) {
t = t || "fx";
var n = Y.queue(e, t), r = n.length, i = n.shift(), s = Y._queueHooks(e, t), o = function() {
Y.dequeue(e, t);
};
i === "inprogress" && (i = n.shift(), r--), i && (t === "fx" && n.unshift("inprogress"), delete s.stop, i.call(e, o, s)), !r && s && s.empty.fire();
},
_queueHooks: function(e, t) {
var n = t + "queueHooks";
return Y._data(e, n) || Y._data(e, n, {
empty: Y.Callbacks("once memory").add(function() {
Y.removeData(e, t + "queue", !0), Y.removeData(e, n, !0);
})
});
}
}), Y.fn.extend({
queue: function(e, n) {
var r = 2;
return typeof e != "string" && (n = e, e = "fx", r--), arguments.length < r ? Y.queue(this[0], e) : n === t ? this : this.each(function() {
var t = Y.queue(this, e, n);
Y._queueHooks(this, e), e === "fx" && t[0] !== "inprogress" && Y.dequeue(this, e);
});
},
dequeue: function(e) {
return this.each(function() {
Y.dequeue(this, e);
});
},
delay: function(e, t) {
return e = Y.fx ? Y.fx.speeds[e] || e : e, t = t || "fx", this.queue(t, function(t, n) {
var r = setTimeout(t, e);
n.stop = function() {
clearTimeout(r);
};
});
},
clearQueue: function(e) {
return this.queue(e || "fx", []);
},
promise: function(e, n) {
var r, i = 1, s = Y.Deferred(), o = this, u = this.length, a = function() {
--i || s.resolveWith(o, [ o ]);
};
typeof e != "string" && (n = e, e = t), e = e || "fx";
while (u--) r = Y._data(o[u], e + "queueHooks"), r && r.empty && (i++, r.empty.add(a));
return a(), s.promise(n);
}
});
var gt, yt, bt, wt = /[\t\r\n]/g, Et = /\r/g, St = /^(?:button|input)$/i, xt = /^(?:button|input|object|select|textarea)$/i, Tt = /^a(?:rea|)$/i, Nt = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i, Ct = Y.support.getSetAttribute;
Y.fn.extend({
attr: function(e, t) {
return Y.access(this, Y.attr, e, t, arguments.length > 1);
},
removeAttr: function(e) {
return this.each(function() {
Y.removeAttr(this, e);
});
},
prop: function(e, t) {
return Y.access(this, Y.prop, e, t, arguments.length > 1);
},
removeProp: function(e) {
return e = Y.propFix[e] || e, this.each(function() {
try {
this[e] = t, delete this[e];
} catch (n) {}
});
},
addClass: function(e) {
var t, n, r, i, s, o, u;
if (Y.isFunction(e)) return this.each(function(t) {
Y(this).addClass(e.call(this, t, this.className));
});
if (e && typeof e == "string") {
t = e.split(tt);
for (n = 0, r = this.length; n < r; n++) {
i = this[n];
if (i.nodeType === 1) if (!i.className && t.length === 1) i.className = e; else {
s = " " + i.className + " ";
for (o = 0, u = t.length; o < u; o++) s.indexOf(" " + t[o] + " ") < 0 && (s += t[o] + " ");
i.className = Y.trim(s);
}
}
}
return this;
},
removeClass: function(e) {
var n, r, i, s, o, u, a;
if (Y.isFunction(e)) return this.each(function(t) {
Y(this).removeClass(e.call(this, t, this.className));
});
if (e && typeof e == "string" || e === t) {
n = (e || "").split(tt);
for (u = 0, a = this.length; u < a; u++) {
i = this[u];
if (i.nodeType === 1 && i.className) {
r = (" " + i.className + " ").replace(wt, " ");
for (s = 0, o = n.length; s < o; s++) while (r.indexOf(" " + n[s] + " ") >= 0) r = r.replace(" " + n[s] + " ", " ");
i.className = e ? Y.trim(r) : "";
}
}
}
return this;
},
toggleClass: function(e, t) {
var n = typeof e, r = typeof t == "boolean";
return Y.isFunction(e) ? this.each(function(n) {
Y(this).toggleClass(e.call(this, n, this.className, t), t);
}) : this.each(function() {
if (n === "string") {
var i, s = 0, o = Y(this), u = t, a = e.split(tt);
while (i = a[s++]) u = r ? u : !o.hasClass(i), o[u ? "addClass" : "removeClass"](i);
} else if (n === "undefined" || n === "boolean") this.className && Y._data(this, "__className__", this.className), this.className = this.className || e === !1 ? "" : Y._data(this, "__className__") || "";
});
},
hasClass: function(e) {
var t = " " + e + " ", n = 0, r = this.length;
for (; n < r; n++) if (this[n].nodeType === 1 && (" " + this[n].className + " ").replace(wt, " ").indexOf(t) >= 0) return !0;
return !1;
},
val: function(e) {
var n, r, i, s = this[0];
if (!arguments.length) {
if (s) return n = Y.valHooks[s.type] || Y.valHooks[s.nodeName.toLowerCase()], n && "get" in n && (r = n.get(s, "value")) !== t ? r : (r = s.value, typeof r == "string" ? r.replace(Et, "") : r == null ? "" : r);
return;
}
return i = Y.isFunction(e), this.each(function(r) {
var s, o = Y(this);
if (this.nodeType !== 1) return;
i ? s = e.call(this, r, o.val()) : s = e, s == null ? s = "" : typeof s == "number" ? s += "" : Y.isArray(s) && (s = Y.map(s, function(e) {
return e == null ? "" : e + "";
})), n = Y.valHooks[this.type] || Y.valHooks[this.nodeName.toLowerCase()];
if (!n || !("set" in n) || n.set(this, s, "value") === t) this.value = s;
});
}
}), Y.extend({
valHooks: {
option: {
get: function(e) {
var t = e.attributes.value;
return !t || t.specified ? e.value : e.text;
}
},
select: {
get: function(e) {
var t, n, r = e.options, i = e.selectedIndex, s = e.type === "select-one" || i < 0, o = s ? null : [], u = s ? i + 1 : r.length, a = i < 0 ? u : s ? i : 0;
for (; a < u; a++) {
n = r[a];
if ((n.selected || a === i) && (Y.support.optDisabled ? !n.disabled : n.getAttribute("disabled") === null) && (!n.parentNode.disabled || !Y.nodeName(n.parentNode, "optgroup"))) {
t = Y(n).val();
if (s) return t;
o.push(t);
}
}
return o;
},
set: function(e, t) {
var n = Y.makeArray(t);
return Y(e).find("option").each(function() {
this.selected = Y.inArray(Y(this).val(), n) >= 0;
}), n.length || (e.selectedIndex = -1), n;
}
}
},
attrFn: {},
attr: function(e, n, r, i) {
var s, o, u, a = e.nodeType;
if (!e || a === 3 || a === 8 || a === 2) return;
if (i && Y.isFunction(Y.fn[n])) return Y(e)[n](r);
if (typeof e.getAttribute == "undefined") return Y.prop(e, n, r);
u = a !== 1 || !Y.isXMLDoc(e), u && (n = n.toLowerCase(), o = Y.attrHooks[n] || (Nt.test(n) ? yt : gt));
if (r !== t) {
if (r === null) {
Y.removeAttr(e, n);
return;
}
return o && "set" in o && u && (s = o.set(e, r, n)) !== t ? s : (e.setAttribute(n, r + ""), r);
}
return o && "get" in o && u && (s = o.get(e, n)) !== null ? s : (s = e.getAttribute(n), s === null ? t : s);
},
removeAttr: function(e, t) {
var n, r, i, s, o = 0;
if (t && e.nodeType === 1) {
r = t.split(tt);
for (; o < r.length; o++) i = r[o], i && (n = Y.propFix[i] || i, s = Nt.test(i), s || Y.attr(e, i, ""), e.removeAttribute(Ct ? i : n), s && n in e && (e[n] = !1));
}
},
attrHooks: {
type: {
set: function(e, t) {
if (St.test(e.nodeName) && e.parentNode) Y.error("type property can't be changed"); else if (!Y.support.radioValue && t === "radio" && Y.nodeName(e, "input")) {
var n = e.value;
return e.setAttribute("type", t), n && (e.value = n), t;
}
}
},
value: {
get: function(e, t) {
return gt && Y.nodeName(e, "button") ? gt.get(e, t) : t in e ? e.value : null;
},
set: function(e, t, n) {
if (gt && Y.nodeName(e, "button")) return gt.set(e, t, n);
e.value = t;
}
}
},
propFix: {
tabindex: "tabIndex",
readonly: "readOnly",
"for": "htmlFor",
"class": "className",
maxlength: "maxLength",
cellspacing: "cellSpacing",
cellpadding: "cellPadding",
rowspan: "rowSpan",
colspan: "colSpan",
usemap: "useMap",
frameborder: "frameBorder",
contenteditable: "contentEditable"
},
prop: function(e, n, r) {
var i, s, o, u = e.nodeType;
if (!e || u === 3 || u === 8 || u === 2) return;
return o = u !== 1 || !Y.isXMLDoc(e), o && (n = Y.propFix[n] || n, s = Y.propHooks[n]), r !== t ? s && "set" in s && (i = s.set(e, r, n)) !== t ? i : e[n] = r : s && "get" in s && (i = s.get(e, n)) !== null ? i : e[n];
},
propHooks: {
tabIndex: {
get: function(e) {
var n = e.getAttributeNode("tabindex");
return n && n.specified ? parseInt(n.value, 10) : xt.test(e.nodeName) || Tt.test(e.nodeName) && e.href ? 0 : t;
}
}
}
}), yt = {
get: function(e, n) {
var r, i = Y.prop(e, n);
return i === !0 || typeof i != "boolean" && (r = e.getAttributeNode(n)) && r.nodeValue !== !1 ? n.toLowerCase() : t;
},
set: function(e, t, n) {
var r;
return t === !1 ? Y.removeAttr(e, n) : (r = Y.propFix[n] || n, r in e && (e[r] = !0), e.setAttribute(n, n.toLowerCase())), n;
}
}, Ct || (bt = {
name: !0,
id: !0,
coords: !0
}, gt = Y.valHooks.button = {
get: function(e, n) {
var r;
return r = e.getAttributeNode(n), r && (bt[n] ? r.value !== "" : r.specified) ? r.value : t;
},
set: function(e, t, n) {
var r = e.getAttributeNode(n);
return r || (r = R.createAttribute(n), e.setAttributeNode(r)), r.value = t + "";
}
}, Y.each([ "width", "height" ], function(e, t) {
Y.attrHooks[t] = Y.extend(Y.attrHooks[t], {
set: function(e, n) {
if (n === "") return e.setAttribute(t, "auto"), n;
}
});
}), Y.attrHooks.contenteditable = {
get: gt.get,
set: function(e, t, n) {
t === "" && (t = "false"), gt.set(e, t, n);
}
}), Y.support.hrefNormalized || Y.each([ "href", "src", "width", "height" ], function(e, n) {
Y.attrHooks[n] = Y.extend(Y.attrHooks[n], {
get: function(e) {
var r = e.getAttribute(n, 2);
return r === null ? t : r;
}
});
}), Y.support.style || (Y.attrHooks.style = {
get: function(e) {
return e.style.cssText.toLowerCase() || t;
},
set: function(e, t) {
return e.style.cssText = t + "";
}
}), Y.support.optSelected || (Y.propHooks.selected = Y.extend(Y.propHooks.selected, {
get: function(e) {
var t = e.parentNode;
return t && (t.selectedIndex, t.parentNode && t.parentNode.selectedIndex), null;
}
})), Y.support.enctype || (Y.propFix.enctype = "encoding"), Y.support.checkOn || Y.each([ "radio", "checkbox" ], function() {
Y.valHooks[this] = {
get: function(e) {
return e.getAttribute("value") === null ? "on" : e.value;
}
};
}), Y.each([ "radio", "checkbox" ], function() {
Y.valHooks[this] = Y.extend(Y.valHooks[this], {
set: function(e, t) {
if (Y.isArray(t)) return e.checked = Y.inArray(Y(e).val(), t) >= 0;
}
});
});
var kt = /^(?:textarea|input|select)$/i, Lt = /^([^\.]*|)(?:\.(.+)|)$/, At = /(?:^|\s)hover(\.\S+|)\b/, Ot = /^key/, Mt = /^(?:mouse|contextmenu)|click/, _t = /^(?:focusinfocus|focusoutblur)$/, Dt = function(e) {
return Y.event.special.hover ? e : e.replace(At, "mouseenter$1 mouseleave$1");
};
Y.event = {
add: function(e, n, r, i, s) {
var o, u, a, f, l, c, h, p, d, v, m;
if (e.nodeType === 3 || e.nodeType === 8 || !n || !r || !(o = Y._data(e))) return;
r.handler && (d = r, r = d.handler, s = d.selector), r.guid || (r.guid = Y.guid++), a = o.events, a || (o.events = a = {}), u = o.handle, u || (o.handle = u = function(e) {
return typeof Y == "undefined" || !!e && Y.event.triggered === e.type ? t : Y.event.dispatch.apply(u.elem, arguments);
}, u.elem = e), n = Y.trim(Dt(n)).split(" ");
for (f = 0; f < n.length; f++) {
l = Lt.exec(n[f]) || [], c = l[1], h = (l[2] || "").split(".").sort(), m = Y.event.special[c] || {}, c = (s ? m.delegateType : m.bindType) || c, m = Y.event.special[c] || {}, p = Y.extend({
type: c,
origType: l[1],
data: i,
handler: r,
guid: r.guid,
selector: s,
needsContext: s && Y.expr.match.needsContext.test(s),
namespace: h.join(".")
}, d), v = a[c];
if (!v) {
v = a[c] = [], v.delegateCount = 0;
if (!m.setup || m.setup.call(e, i, h, u) === !1) e.addEventListener ? e.addEventListener(c, u, !1) : e.attachEvent && e.attachEvent("on" + c, u);
}
m.add && (m.add.call(e, p), p.handler.guid || (p.handler.guid = r.guid)), s ? v.splice(v.delegateCount++, 0, p) : v.push(p), Y.event.global[c] = !0;
}
e = null;
},
global: {},
remove: function(e, t, n, r, i) {
var s, o, u, a, f, l, c, h, p, d, v, m = Y.hasData(e) && Y._data(e);
if (!m || !(h = m.events)) return;
t = Y.trim(Dt(t || "")).split(" ");
for (s = 0; s < t.length; s++) {
o = Lt.exec(t[s]) || [], u = a = o[1], f = o[2];
if (!u) {
for (u in h) Y.event.remove(e, u + t[s], n, r, !0);
continue;
}
p = Y.event.special[u] || {}, u = (r ? p.delegateType : p.bindType) || u, d = h[u] || [], l = d.length, f = f ? new RegExp("(^|\\.)" + f.split(".").sort().join("\\.(?:.*\\.|)") + "(\\.|$)") : null;
for (c = 0; c < d.length; c++) v = d[c], (i || a === v.origType) && (!n || n.guid === v.guid) && (!f || f.test(v.namespace)) && (!r || r === v.selector || r === "**" && v.selector) && (d.splice(c--, 1), v.selector && d.delegateCount--, p.remove && p.remove.call(e, v));
d.length === 0 && l !== d.length && ((!p.teardown || p.teardown.call(e, f, m.handle) === !1) && Y.removeEvent(e, u, m.handle), delete h[u]);
}
Y.isEmptyObject(h) && (delete m.handle, Y.removeData(e, "events", !0));
},
customEvent: {
getData: !0,
setData: !0,
changeData: !0
},
trigger: function(n, r, i, s) {
if (!i || i.nodeType !== 3 && i.nodeType !== 8) {
var o, u, a, f, l, c, h, p, d, v, m = n.type || n, g = [];
if (_t.test(m + Y.event.triggered)) return;
m.indexOf("!") >= 0 && (m = m.slice(0, -1), u = !0), m.indexOf(".") >= 0 && (g = m.split("."), m = g.shift(), g.sort());
if ((!i || Y.event.customEvent[m]) && !Y.event.global[m]) return;
n = typeof n == "object" ? n[Y.expando] ? n : new Y.Event(m, n) : new Y.Event(m), n.type = m, n.isTrigger = !0, n.exclusive = u, n.namespace = g.join("."), n.namespace_re = n.namespace ? new RegExp("(^|\\.)" + g.join("\\.(?:.*\\.|)") + "(\\.|$)") : null, c = m.indexOf(":") < 0 ? "on" + m : "";
if (!i) {
o = Y.cache;
for (a in o) o[a].events && o[a].events[m] && Y.event.trigger(n, r, o[a].handle.elem, !0);
return;
}
n.result = t, n.target || (n.target = i), r = r != null ? Y.makeArray(r) : [], r.unshift(n), h = Y.event.special[m] || {};
if (h.trigger && h.trigger.apply(i, r) === !1) return;
d = [ [ i, h.bindType || m ] ];
if (!s && !h.noBubble && !Y.isWindow(i)) {
v = h.delegateType || m, f = _t.test(v + m) ? i : i.parentNode;
for (l = i; f; f = f.parentNode) d.push([ f, v ]), l = f;
l === (i.ownerDocument || R) && d.push([ l.defaultView || l.parentWindow || e, v ]);
}
for (a = 0; a < d.length && !n.isPropagationStopped(); a++) f = d[a][0], n.type = d[a][1], p = (Y._data(f, "events") || {})[n.type] && Y._data(f, "handle"), p && p.apply(f, r), p = c && f[c], p && Y.acceptData(f) && p.apply && p.apply(f, r) === !1 && n.preventDefault();
return n.type = m, !s && !n.isDefaultPrevented() && (!h._default || h._default.apply(i.ownerDocument, r) === !1) && (m !== "click" || !Y.nodeName(i, "a")) && Y.acceptData(i) && c && i[m] && (m !== "focus" && m !== "blur" || n.target.offsetWidth !== 0) && !Y.isWindow(i) && (l = i[c], l && (i[c] = null), Y.event.triggered = m, i[m](), Y.event.triggered = t, l && (i[c] = l)), n.result;
}
return;
},
dispatch: function(n) {
n = Y.event.fix(n || e.event);
var r, i, s, o, u, a, f, l, c, h, p = (Y._data(this, "events") || {})[n.type] || [], d = p.delegateCount, v = $.call(arguments), m = !n.exclusive && !n.namespace, g = Y.event.special[n.type] || {}, y = [];
v[0] = n, n.delegateTarget = this;
if (g.preDispatch && g.preDispatch.call(this, n) === !1) return;
if (d && (!n.button || n.type !== "click")) for (s = n.target; s != this; s = s.parentNode || this) if (s.disabled !== !0 || n.type !== "click") {
u = {}, f = [];
for (r = 0; r < d; r++) l = p[r], c = l.selector, u[c] === t && (u[c] = l.needsContext ? Y(c, this).index(s) >= 0 : Y.find(c, this, null, [ s ]).length), u[c] && f.push(l);
f.length && y.push({
elem: s,
matches: f
});
}
p.length > d && y.push({
elem: this,
matches: p.slice(d)
});
for (r = 0; r < y.length && !n.isPropagationStopped(); r++) {
a = y[r], n.currentTarget = a.elem;
for (i = 0; i < a.matches.length && !n.isImmediatePropagationStopped(); i++) {
l = a.matches[i];
if (m || !n.namespace && !l.namespace || n.namespace_re && n.namespace_re.test(l.namespace)) n.data = l.data, n.handleObj = l, o = ((Y.event.special[l.origType] || {}).handle || l.handler).apply(a.elem, v), o !== t && (n.result = o, o === !1 && (n.preventDefault(), n.stopPropagation()));
}
}
return g.postDispatch && g.postDispatch.call(this, n), n.result;
},
props: "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
fixHooks: {},
keyHooks: {
props: "char charCode key keyCode".split(" "),
filter: function(e, t) {
return e.which == null && (e.which = t.charCode != null ? t.charCode : t.keyCode), e;
}
},
mouseHooks: {
props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
filter: function(e, n) {
var r, i, s, o = n.button, u = n.fromElement;
return e.pageX == null && n.clientX != null && (r = e.target.ownerDocument || R, i = r.documentElement, s = r.body, e.pageX = n.clientX + (i && i.scrollLeft || s && s.scrollLeft || 0) - (i && i.clientLeft || s && s.clientLeft || 0), e.pageY = n.clientY + (i && i.scrollTop || s && s.scrollTop || 0) - (i && i.clientTop || s && s.clientTop || 0)), !e.relatedTarget && u && (e.relatedTarget = u === e.target ? n.toElement : u), !e.which && o !== t && (e.which = o & 1 ? 1 : o & 2 ? 3 : o & 4 ? 2 : 0), e;
}
},
fix: function(e) {
if (e[Y.expando]) return e;
var t, n, r = e, i = Y.event.fixHooks[e.type] || {}, s = i.props ? this.props.concat(i.props) : this.props;
e = Y.Event(r);
for (t = s.length; t; ) n = s[--t], e[n] = r[n];
return e.target || (e.target = r.srcElement || R), e.target.nodeType === 3 && (e.target = e.target.parentNode), e.metaKey = !!e.metaKey, i.filter ? i.filter(e, r) : e;
},
special: {
load: {
noBubble: !0
},
focus: {
delegateType: "focusin"
},
blur: {
delegateType: "focusout"
},
beforeunload: {
setup: function(e, t, n) {
Y.isWindow(this) && (this.onbeforeunload = n);
},
teardown: function(e, t) {
this.onbeforeunload === t && (this.onbeforeunload = null);
}
}
},
simulate: function(e, t, n, r) {
var i = Y.extend(new Y.Event, n, {
type: e,
isSimulated: !0,
originalEvent: {}
});
r ? Y.event.trigger(i, null, t) : Y.event.dispatch.call(t, i), i.isDefaultPrevented() && n.preventDefault();
}
}, Y.event.handle = Y.event.dispatch, Y.removeEvent = R.removeEventListener ? function(e, t, n) {
e.removeEventListener && e.removeEventListener(t, n, !1);
} : function(e, t, n) {
var r = "on" + t;
e.detachEvent && (typeof e[r] == "undefined" && (e[r] = null), e.detachEvent(r, n));
}, Y.Event = function(e, t) {
if (!(this instanceof Y.Event)) return new Y.Event(e, t);
e && e.type ? (this.originalEvent = e, this.type = e.type, this.isDefaultPrevented = e.defaultPrevented || e.returnValue === !1 || e.getPreventDefault && e.getPreventDefault() ? o : s) : this.type = e, t && Y.extend(this, t), this.timeStamp = e && e.timeStamp || Y.now(), this[Y.expando] = !0;
}, Y.Event.prototype = {
preventDefault: function() {
this.isDefaultPrevented = o;
var e = this.originalEvent;
if (!e) return;
e.preventDefault ? e.preventDefault() : e.returnValue = !1;
},
stopPropagation: function() {
this.isPropagationStopped = o;
var e = this.originalEvent;
if (!e) return;
e.stopPropagation && e.stopPropagation(), e.cancelBubble = !0;
},
stopImmediatePropagation: function() {
this.isImmediatePropagationStopped = o, this.stopPropagation();
},
isDefaultPrevented: s,
isPropagationStopped: s,
isImmediatePropagationStopped: s
}, Y.each({
mouseenter: "mouseover",
mouseleave: "mouseout"
}, function(e, t) {
Y.event.special[e] = {
delegateType: t,
bindType: t,
handle: function(e) {
var n, r = this, i = e.relatedTarget, s = e.handleObj, o = s.selector;
if (!i || i !== r && !Y.contains(r, i)) e.type = s.origType, n = s.handler.apply(this, arguments), e.type = t;
return n;
}
};
}), Y.support.submitBubbles || (Y.event.special.submit = {
setup: function() {
if (Y.nodeName(this, "form")) return !1;
Y.event.add(this, "click._submit keypress._submit", function(e) {
var n = e.target, r = Y.nodeName(n, "input") || Y.nodeName(n, "button") ? n.form : t;
r && !Y._data(r, "_submit_attached") && (Y.event.add(r, "submit._submit", function(e) {
e._submit_bubble = !0;
}), Y._data(r, "_submit_attached", !0));
});
},
postDispatch: function(e) {
e._submit_bubble && (delete e._submit_bubble, this.parentNode && !e.isTrigger && Y.event.simulate("submit", this.parentNode, e, !0));
},
teardown: function() {
if (Y.nodeName(this, "form")) return !1;
Y.event.remove(this, "._submit");
}
}), Y.support.changeBubbles || (Y.event.special.change = {
setup: function() {
if (kt.test(this.nodeName)) {
if (this.type === "checkbox" || this.type === "radio") Y.event.add(this, "propertychange._change", function(e) {
e.originalEvent.propertyName === "checked" && (this._just_changed = !0);
}), Y.event.add(this, "click._change", function(e) {
this._just_changed && !e.isTrigger && (this._just_changed = !1), Y.event.simulate("change", this, e, !0);
});
return !1;
}
Y.event.add(this, "beforeactivate._change", function(e) {
var t = e.target;
kt.test(t.nodeName) && !Y._data(t, "_change_attached") && (Y.event.add(t, "change._change", function(e) {
this.parentNode && !e.isSimulated && !e.isTrigger && Y.event.simulate("change", this.parentNode, e, !0);
}), Y._data(t, "_change_attached", !0));
});
},
handle: function(e) {
var t = e.target;
if (this !== t || e.isSimulated || e.isTrigger || t.type !== "radio" && t.type !== "checkbox") return e.handleObj.handler.apply(this, arguments);
},
teardown: function() {
return Y.event.remove(this, "._change"), !kt.test(this.nodeName);
}
}), Y.support.focusinBubbles || Y.each({
focus: "focusin",
blur: "focusout"
}, function(e, t) {
var n = 0, r = function(e) {
Y.event.simulate(t, e.target, Y.event.fix(e), !0);
};
Y.event.special[t] = {
setup: function() {
n++ === 0 && R.addEventListener(e, r, !0);
},
teardown: function() {
--n === 0 && R.removeEventListener(e, r, !0);
}
};
}), Y.fn.extend({
on: function(e, n, r, i, o) {
var u, a;
if (typeof e == "object") {
typeof n != "string" && (r = r || n, n = t);
for (a in e) this.on(a, n, r, e[a], o);
return this;
}
r == null && i == null ? (i = n, r = n = t) : i == null && (typeof n == "string" ? (i = r, r = t) : (i = r, r = n, n = t));
if (i === !1) i = s; else if (!i) return this;
return o === 1 && (u = i, i = function(e) {
return Y().off(e), u.apply(this, arguments);
}, i.guid = u.guid || (u.guid = Y.guid++)), this.each(function() {
Y.event.add(this, e, i, r, n);
});
},
one: function(e, t, n, r) {
return this.on(e, t, n, r, 1);
},
off: function(e, n, r) {
var i, o;
if (e && e.preventDefault && e.handleObj) return i = e.handleObj, Y(e.delegateTarget).off(i.namespace ? i.origType + "." + i.namespace : i.origType, i.selector, i.handler), this;
if (typeof e == "object") {
for (o in e) this.off(o, n, e[o]);
return this;
}
if (n === !1 || typeof n == "function") r = n, n = t;
return r === !1 && (r = s), this.each(function() {
Y.event.remove(this, e, r, n);
});
},
bind: function(e, t, n) {
return this.on(e, null, t, n);
},
unbind: function(e, t) {
return this.off(e, null, t);
},
live: function(e, t, n) {
return Y(this.context).on(e, this.selector, t, n), this;
},
die: function(e, t) {
return Y(this.context).off(e, this.selector || "**", t), this;
},
delegate: function(e, t, n, r) {
return this.on(t, e, n, r);
},
undelegate: function(e, t, n) {
return arguments.length === 1 ? this.off(e, "**") : this.off(t, e || "**", n);
},
trigger: function(e, t) {
return this.each(function() {
Y.event.trigger(e, t, this);
});
},
triggerHandler: function(e, t) {
if (this[0]) return Y.event.trigger(e, t, this[0], !0);
},
toggle: function(e) {
var t = arguments, n = e.guid || Y.guid++, r = 0, i = function(n) {
var i = (Y._data(this, "lastToggle" + e.guid) || 0) % r;
return Y._data(this, "lastToggle" + e.guid, i + 1), n.preventDefault(), t[i].apply(this, arguments) || !1;
};
i.guid = n;
while (r < t.length) t[r++].guid = n;
return this.click(i);
},
hover: function(e, t) {
return this.mouseenter(e).mouseleave(t || e);
}
}), Y.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "), function(e, t) {
Y.fn[t] = function(e, n) {
return n == null && (n = e, e = null), arguments.length > 0 ? this.on(t, null, e, n) : this.trigger(t);
}, Ot.test(t) && (Y.event.fixHooks[t] = Y.event.keyHooks), Mt.test(t) && (Y.event.fixHooks[t] = Y.event.mouseHooks);
}), function(e, t) {
function n(e, t, n, r) {
n = n || [], t = t || M;
var i, s, o, u, a = t.nodeType;
if (!e || typeof e != "string") return n;
if (a !== 1 && a !== 9) return [];
o = E(t);
if (!o && !r) if (i = nt.exec(e)) if (u = i[1]) {
if (a === 9) {
s = t.getElementById(u);
if (!s || !s.parentNode) return n;
if (s.id === u) return n.push(s), n;
} else if (t.ownerDocument && (s = t.ownerDocument.getElementById(u)) && S(t, s) && s.id === u) return n.push(s), n;
} else {
if (i[2]) return B.apply(n, j.call(t.getElementsByTagName(e), 0)), n;
if ((u = i[3]) && dt && t.getElementsByClassName) return B.apply(n, j.call(t.getElementsByClassName(u), 0)), n;
}
return v(e.replace(G, "$1"), t, n, r, o);
}
function r(e) {
return function(t) {
var n = t.nodeName.toLowerCase();
return n === "input" && t.type === e;
};
}
function i(e) {
return function(t) {
var n = t.nodeName.toLowerCase();
return (n === "input" || n === "button") && t.type === e;
};
}
function s(e) {
return I(function(t) {
return t = +t, I(function(n, r) {
var i, s = e([], n.length, t), o = s.length;
while (o--) n[i = s[o]] && (n[i] = !(r[i] = n[i]));
});
});
}
function o(e, t, n) {
if (e === t) return n;
var r = e.nextSibling;
while (r) {
if (r === t) return -1;
r = r.nextSibling;
}
return 1;
}
function u(e, t) {
var r, i, s, o, u, a, f, l = U[A][e + " "];
if (l) return t ? 0 : l.slice(0);
u = e, a = [], f = b.preFilter;
while (u) {
if (!r || (i = Z.exec(u))) i && (u = u.slice(i[0].length) || u), a.push(s = []);
r = !1;
if (i = et.exec(u)) s.push(r = new O(i.shift())), u = u.slice(r.length), r.type = i[0].replace(G, " ");
for (o in b.filter) (i = ft[o].exec(u)) && (!f[o] || (i = f[o](i))) && (s.push(r = new O(i.shift())), u = u.slice(r.length), r.type = o, r.matches = i);
if (!r) break;
}
return t ? u.length : u ? n.error(e) : U(e, a).slice(0);
}
function a(e, t, n) {
var r = t.dir, i = n && t.dir === "parentNode", s = P++;
return t.first ? function(t, n, s) {
while (t = t[r]) if (i || t.nodeType === 1) return e(t, n, s);
} : function(t, n, o) {
if (!o) {
var u, a = D + " " + s + " ", f = a + g;
while (t = t[r]) if (i || t.nodeType === 1) {
if ((u = t[A]) === f) return t.sizset;
if (typeof u == "string" && u.indexOf(a) === 0) {
if (t.sizset) return t;
} else {
t[A] = f;
if (e(t, n, o)) return t.sizset = !0, t;
t.sizset = !1;
}
}
} else while (t = t[r]) if (i || t.nodeType === 1) if (e(t, n, o)) return t;
};
}
function f(e) {
return e.length > 1 ? function(t, n, r) {
var i = e.length;
while (i--) if (!e[i](t, n, r)) return !1;
return !0;
} : e[0];
}
function l(e, t, n, r, i) {
var s, o = [], u = 0, a = e.length, f = t != null;
for (; u < a; u++) if (s = e[u]) if (!n || n(s, r, i)) o.push(s), f && t.push(u);
return o;
}
function c(e, t, n, r, i, s) {
return r && !r[A] && (r = c(r)), i && !i[A] && (i = c(i, s)), I(function(s, o, u, a) {
var f, c, h, p = [], v = [], m = o.length, g = s || d(t || "*", u.nodeType ? [ u ] : u, []), y = e && (s || !t) ? l(g, p, e, u, a) : g, b = n ? i || (s ? e : m || r) ? [] : o : y;
n && n(y, b, u, a);
if (r) {
f = l(b, v), r(f, [], u, a), c = f.length;
while (c--) if (h = f[c]) b[v[c]] = !(y[v[c]] = h);
}
if (s) {
if (i || e) {
if (i) {
f = [], c = b.length;
while (c--) (h = b[c]) && f.push(y[c] = h);
i(null, b = [], f, a);
}
c = b.length;
while (c--) (h = b[c]) && (f = i ? F.call(s, h) : p[c]) > -1 && (s[f] = !(o[f] = h));
}
} else b = l(b === o ? b.splice(m, b.length) : b), i ? i(null, o, b, a) : B.apply(o, b);
});
}
function h(e) {
var t, n, r, i = e.length, s = b.relative[e[0].type], o = s || b.relative[" "], u = s ? 1 : 0, l = a(function(e) {
return e === t;
}, o, !0), p = a(function(e) {
return F.call(t, e) > -1;
}, o, !0), d = [ function(e, n, r) {
return !s && (r || n !== C) || ((t = n).nodeType ? l(e, n, r) : p(e, n, r));
} ];
for (; u < i; u++) if (n = b.relative[e[u].type]) d = [ a(f(d), n) ]; else {
n = b.filter[e[u].type].apply(null, e[u].matches);
if (n[A]) {
r = ++u;
for (; r < i; r++) if (b.relative[e[r].type]) break;
return c(u > 1 && f(d), u > 1 && e.slice(0, u - 1).join("").replace(G, "$1"), n, u < r && h(e.slice(u, r)), r < i && h(e = e.slice(r)), r < i && e.join(""));
}
d.push(n);
}
return f(d);
}
function p(e, t) {
var r = t.length > 0, i = e.length > 0, s = function(o, u, a, f, c) {
var h, p, d, v = [], m = 0, y = "0", w = o && [], E = c != null, S = C, x = o || i && b.find.TAG("*", c && u.parentNode || u), T = D += S == null ? 1 : Math.E;
E && (C = u !== M && u, g = s.el);
for (; (h = x[y]) != null; y++) {
if (i && h) {
for (p = 0; d = e[p]; p++) if (d(h, u, a)) {
f.push(h);
break;
}
E && (D = T, g = ++s.el);
}
r && ((h = !d && h) && m--, o && w.push(h));
}
m += y;
if (r && y !== m) {
for (p = 0; d = t[p]; p++) d(w, v, u, a);
if (o) {
if (m > 0) while (y--) !w[y] && !v[y] && (v[y] = H.call(f));
v = l(v);
}
B.apply(f, v), E && !o && v.length > 0 && m + t.length > 1 && n.uniqueSort(f);
}
return E && (D = T, C = S), w;
};
return s.el = 0, r ? I(s) : s;
}
function d(e, t, r) {
var i = 0, s = t.length;
for (; i < s; i++) n(e, t[i], r);
return r;
}
function v(e, t, n, r, i) {
var s, o, a, f, l, c = u(e), h = c.length;
if (!r && c.length === 1) {
o = c[0] = c[0].slice(0);
if (o.length > 2 && (a = o[0]).type === "ID" && t.nodeType === 9 && !i && b.relative[o[1].type]) {
t = b.find.ID(a.matches[0].replace(at, ""), t, i)[0];
if (!t) return n;
e = e.slice(o.shift().length);
}
for (s = ft.POS.test(e) ? -1 : o.length - 1; s >= 0; s--) {
a = o[s];
if (b.relative[f = a.type]) break;
if (l = b.find[f]) if (r = l(a.matches[0].replace(at, ""), it.test(o[0].type) && t.parentNode || t, i)) {
o.splice(s, 1), e = r.length && o.join("");
if (!e) return B.apply(n, j.call(r, 0)), n;
break;
}
}
}
return x(e, c)(r, t, i, n, it.test(e)), n;
}
function m() {}
var g, y, b, w, E, S, x, T, N, C, k = !0, L = "undefined", A = ("sizcache" + Math.random()).replace(".", ""), O = String, M = e.document, _ = M.documentElement, D = 0, P = 0, H = [].pop, B = [].push, j = [].slice, F = [].indexOf || function(e) {
var t = 0, n = this.length;
for (; t < n; t++) if (this[t] === e) return t;
return -1;
}, I = function(e, t) {
return e[A] = t == null || t, e;
}, q = function() {
var e = {}, t = [];
return I(function(n, r) {
return t.push(n) > b.cacheLength && delete e[t.shift()], e[n + " "] = r;
}, e);
}, R = q(), U = q(), z = q(), W = "[\\x20\\t\\r\\n\\f]", X = "(?:\\\\.|[-\\w]|[^\\x00-\\xa0])+", V = X.replace("w", "w#"), $ = "([*^$|!~]?=)", J = "\\[" + W + "*(" + X + ")" + W + "*(?:" + $ + W + "*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|(" + V + ")|)|)" + W + "*\\]", K = ":(" + X + ")(?:\\((?:(['\"])((?:\\\\.|[^\\\\])*?)\\2|([^()[\\]]*|(?:(?:" + J + ")|[^:]|\\\\.)*|.*))\\)|)", Q = ":(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + W + "*((?:-\\d)?\\d*)" + W + "*\\)|)(?=[^-]|$)", G = new RegExp("^" + W + "+|((?:^|[^\\\\])(?:\\\\.)*)" + W + "+$", "g"), Z = new RegExp("^" + W + "*," + W + "*"), et = new RegExp("^" + W + "*([\\x20\\t\\r\\n\\f>+~])" + W + "*"), tt = new RegExp(K), nt = /^(?:#([\w\-]+)|(\w+)|\.([\w\-]+))$/, rt = /^:not/, it = /[\x20\t\r\n\f]*[+~]/, st = /:not\($/, ot = /h\d/i, ut = /input|select|textarea|button/i, at = /\\(?!\\)/g, ft = {
ID: new RegExp("^#(" + X + ")"),
CLASS: new RegExp("^\\.(" + X + ")"),
NAME: new RegExp("^\\[name=['\"]?(" + X + ")['\"]?\\]"),
TAG: new RegExp("^(" + X.replace("w", "w*") + ")"),
ATTR: new RegExp("^" + J),
PSEUDO: new RegExp("^" + K),
POS: new RegExp(Q, "i"),
CHILD: new RegExp("^:(only|nth|first|last)-child(?:\\(" + W + "*(even|odd|(([+-]|)(\\d*)n|)" + W + "*(?:([+-]|)" + W + "*(\\d+)|))" + W + "*\\)|)", "i"),
needsContext: new RegExp("^" + W + "*[>+~]|" + Q, "i")
}, lt = function(e) {
var t = M.createElement("div");
try {
return e(t);
} catch (n) {
return !1;
} finally {
t = null;
}
}, ct = lt(function(e) {
return e.appendChild(M.createComment("")), !e.getElementsByTagName("*").length;
}), ht = lt(function(e) {
return e.innerHTML = "<a href='#'></a>", e.firstChild && typeof e.firstChild.getAttribute !== L && e.firstChild.getAttribute("href") === "#";
}), pt = lt(function(e) {
e.innerHTML = "<select></select>";
var t = typeof e.lastChild.getAttribute("multiple");
return t !== "boolean" && t !== "string";
}), dt = lt(function(e) {
return e.innerHTML = "<div class='hidden e'></div><div class='hidden'></div>", !e.getElementsByClassName || !e.getElementsByClassName("e").length ? !1 : (e.lastChild.className = "e", e.getElementsByClassName("e").length === 2);
}), vt = lt(function(e) {
e.id = A + 0, e.innerHTML = "<a name='" + A + "'></a><div name='" + A + "'></div>", _.insertBefore(e, _.firstChild);
var t = M.getElementsByName && M.getElementsByName(A).length === 2 + M.getElementsByName(A + 0).length;
return y = !M.getElementById(A), _.removeChild(e), t;
});
try {
j.call(_.childNodes, 0)[0].nodeType;
} catch (mt) {
j = function(e) {
var t, n = [];
for (; t = this[e]; e++) n.push(t);
return n;
};
}
n.matches = function(e, t) {
return n(e, null, null, t);
}, n.matchesSelector = function(e, t) {
return n(t, null, null, [ e ]).length > 0;
}, w = n.getText = function(e) {
var t, n = "", r = 0, i = e.nodeType;
if (i) {
if (i === 1 || i === 9 || i === 11) {
if (typeof e.textContent == "string") return e.textContent;
for (e = e.firstChild; e; e = e.nextSibling) n += w(e);
} else if (i === 3 || i === 4) return e.nodeValue;
} else for (; t = e[r]; r++) n += w(t);
return n;
}, E = n.isXML = function(e) {
var t = e && (e.ownerDocument || e).documentElement;
return t ? t.nodeName !== "HTML" : !1;
}, S = n.contains = _.contains ? function(e, t) {
var n = e.nodeType === 9 ? e.documentElement : e, r = t && t.parentNode;
return e === r || !!(r && r.nodeType === 1 && n.contains && n.contains(r));
} : _.compareDocumentPosition ? function(e, t) {
return t && !!(e.compareDocumentPosition(t) & 16);
} : function(e, t) {
while (t = t.parentNode) if (t === e) return !0;
return !1;
}, n.attr = function(e, t) {
var n, r = E(e);
return r || (t = t.toLowerCase()), (n = b.attrHandle[t]) ? n(e) : r || pt ? e.getAttribute(t) : (n = e.getAttributeNode(t), n ? typeof e[t] == "boolean" ? e[t] ? t : null : n.specified ? n.value : null : null);
}, b = n.selectors = {
cacheLength: 50,
createPseudo: I,
match: ft,
attrHandle: ht ? {} : {
href: function(e) {
return e.getAttribute("href", 2);
},
type: function(e) {
return e.getAttribute("type");
}
},
find: {
ID: y ? function(e, t, n) {
if (typeof t.getElementById !== L && !n) {
var r = t.getElementById(e);
return r && r.parentNode ? [ r ] : [];
}
} : function(e, n, r) {
if (typeof n.getElementById !== L && !r) {
var i = n.getElementById(e);
return i ? i.id === e || typeof i.getAttributeNode !== L && i.getAttributeNode("id").value === e ? [ i ] : t : [];
}
},
TAG: ct ? function(e, t) {
if (typeof t.getElementsByTagName !== L) return t.getElementsByTagName(e);
} : function(e, t) {
var n = t.getElementsByTagName(e);
if (e === "*") {
var r, i = [], s = 0;
for (; r = n[s]; s++) r.nodeType === 1 && i.push(r);
return i;
}
return n;
},
NAME: vt && function(e, t) {
if (typeof t.getElementsByName !== L) return t.getElementsByName(name);
},
CLASS: dt && function(e, t, n) {
if (typeof t.getElementsByClassName !== L && !n) return t.getElementsByClassName(e);
}
},
relative: {
">": {
dir: "parentNode",
first: !0
},
" ": {
dir: "parentNode"
},
"+": {
dir: "previousSibling",
first: !0
},
"~": {
dir: "previousSibling"
}
},
preFilter: {
ATTR: function(e) {
return e[1] = e[1].replace(at, ""), e[3] = (e[4] || e[5] || "").replace(at, ""), e[2] === "~=" && (e[3] = " " + e[3] + " "), e.slice(0, 4);
},
CHILD: function(e) {
return e[1] = e[1].toLowerCase(), e[1] === "nth" ? (e[2] || n.error(e[0]), e[3] = +(e[3] ? e[4] + (e[5] || 1) : 2 * (e[2] === "even" || e[2] === "odd")), e[4] = +(e[6] + e[7] || e[2] === "odd")) : e[2] && n.error(e[0]), e;
},
PSEUDO: function(e) {
var t, n;
if (ft.CHILD.test(e[0])) return null;
if (e[3]) e[2] = e[3]; else if (t = e[4]) tt.test(t) && (n = u(t, !0)) && (n = t.indexOf(")", t.length - n) - t.length) && (t = t.slice(0, n), e[0] = e[0].slice(0, n)), e[2] = t;
return e.slice(0, 3);
}
},
filter: {
ID: y ? function(e) {
return e = e.replace(at, ""), function(t) {
return t.getAttribute("id") === e;
};
} : function(e) {
return e = e.replace(at, ""), function(t) {
var n = typeof t.getAttributeNode !== L && t.getAttributeNode("id");
return n && n.value === e;
};
},
TAG: function(e) {
return e === "*" ? function() {
return !0;
} : (e = e.replace(at, "").toLowerCase(), function(t) {
return t.nodeName && t.nodeName.toLowerCase() === e;
});
},
CLASS: function(e) {
var t = R[A][e + " "];
return t || (t = new RegExp("(^|" + W + ")" + e + "(" + W + "|$)")) && R(e, function(e) {
return t.test(e.className || typeof e.getAttribute !== L && e.getAttribute("class") || "");
});
},
ATTR: function(e, t, r) {
return function(i, s) {
var o = n.attr(i, e);
return o == null ? t === "!=" : t ? (o += "", t === "=" ? o === r : t === "!=" ? o !== r : t === "^=" ? r && o.indexOf(r) === 0 : t === "*=" ? r && o.indexOf(r) > -1 : t === "$=" ? r && o.substr(o.length - r.length) === r : t === "~=" ? (" " + o + " ").indexOf(r) > -1 : t === "|=" ? o === r || o.substr(0, r.length + 1) === r + "-" : !1) : !0;
};
},
CHILD: function(e, t, n, r) {
return e === "nth" ? function(e) {
var t, i, s = e.parentNode;
if (n === 1 && r === 0) return !0;
if (s) {
i = 0;
for (t = s.firstChild; t; t = t.nextSibling) if (t.nodeType === 1) {
i++;
if (e === t) break;
}
}
return i -= r, i === n || i % n === 0 && i / n >= 0;
} : function(t) {
var n = t;
switch (e) {
case "only":
case "first":
while (n = n.previousSibling) if (n.nodeType === 1) return !1;
if (e === "first") return !0;
n = t;
case "last":
while (n = n.nextSibling) if (n.nodeType === 1) return !1;
return !0;
}
};
},
PSEUDO: function(e, t) {
var r, i = b.pseudos[e] || b.setFilters[e.toLowerCase()] || n.error("unsupported pseudo: " + e);
return i[A] ? i(t) : i.length > 1 ? (r = [ e, e, "", t ], b.setFilters.hasOwnProperty(e.toLowerCase()) ? I(function(e, n) {
var r, s = i(e, t), o = s.length;
while (o--) r = F.call(e, s[o]), e[r] = !(n[r] = s[o]);
}) : function(e) {
return i(e, 0, r);
}) : i;
}
},
pseudos: {
not: I(function(e) {
var t = [], n = [], r = x(e.replace(G, "$1"));
return r[A] ? I(function(e, t, n, i) {
var s, o = r(e, null, i, []), u = e.length;
while (u--) if (s = o[u]) e[u] = !(t[u] = s);
}) : function(e, i, s) {
return t[0] = e, r(t, null, s, n), !n.pop();
};
}),
has: I(function(e) {
return function(t) {
return n(e, t).length > 0;
};
}),
contains: I(function(e) {
return function(t) {
return (t.textContent || t.innerText || w(t)).indexOf(e) > -1;
};
}),
enabled: function(e) {
return e.disabled === !1;
},
disabled: function(e) {
return e.disabled === !0;
},
checked: function(e) {
var t = e.nodeName.toLowerCase();
return t === "input" && !!e.checked || t === "option" && !!e.selected;
},
selected: function(e) {
return e.parentNode && e.parentNode.selectedIndex, e.selected === !0;
},
parent: function(e) {
return !b.pseudos.empty(e);
},
empty: function(e) {
var t;
e = e.firstChild;
while (e) {
if (e.nodeName > "@" || (t = e.nodeType) === 3 || t === 4) return !1;
e = e.nextSibling;
}
return !0;
},
header: function(e) {
return ot.test(e.nodeName);
},
text: function(e) {
var t, n;
return e.nodeName.toLowerCase() === "input" && (t = e.type) === "text" && ((n = e.getAttribute("type")) == null || n.toLowerCase() === t);
},
radio: r("radio"),
checkbox: r("checkbox"),
file: r("file"),
password: r("password"),
image: r("image"),
submit: i("submit"),
reset: i("reset"),
button: function(e) {
var t = e.nodeName.toLowerCase();
return t === "input" && e.type === "button" || t === "button";
},
input: function(e) {
return ut.test(e.nodeName);
},
focus: function(e) {
var t = e.ownerDocument;
return e === t.activeElement && (!t.hasFocus || t.hasFocus()) && !!(e.type || e.href || ~e.tabIndex);
},
active: function(e) {
return e === e.ownerDocument.activeElement;
},
first: s(function() {
return [ 0 ];
}),
last: s(function(e, t) {
return [ t - 1 ];
}),
eq: s(function(e, t, n) {
return [ n < 0 ? n + t : n ];
}),
even: s(function(e, t) {
for (var n = 0; n < t; n += 2) e.push(n);
return e;
}),
odd: s(function(e, t) {
for (var n = 1; n < t; n += 2) e.push(n);
return e;
}),
lt: s(function(e, t, n) {
for (var r = n < 0 ? n + t : n; --r >= 0; ) e.push(r);
return e;
}),
gt: s(function(e, t, n) {
for (var r = n < 0 ? n + t : n; ++r < t; ) e.push(r);
return e;
})
}
}, T = _.compareDocumentPosition ? function(e, t) {
return e === t ? (N = !0, 0) : (!e.compareDocumentPosition || !t.compareDocumentPosition ? e.compareDocumentPosition : e.compareDocumentPosition(t) & 4) ? -1 : 1;
} : function(e, t) {
if (e === t) return N = !0, 0;
if (e.sourceIndex && t.sourceIndex) return e.sourceIndex - t.sourceIndex;
var n, r, i = [], s = [], u = e.parentNode, a = t.parentNode, f = u;
if (u === a) return o(e, t);
if (!u) return -1;
if (!a) return 1;
while (f) i.unshift(f), f = f.parentNode;
f = a;
while (f) s.unshift(f), f = f.parentNode;
n = i.length, r = s.length;
for (var l = 0; l < n && l < r; l++) if (i[l] !== s[l]) return o(i[l], s[l]);
return l === n ? o(e, s[l], -1) : o(i[l], t, 1);
}, [ 0, 0 ].sort(T), k = !N, n.uniqueSort = function(e) {
var t, n = [], r = 1, i = 0;
N = k, e.sort(T);
if (N) {
for (; t = e[r]; r++) t === e[r - 1] && (i = n.push(r));
while (i--) e.splice(n[i], 1);
}
return e;
}, n.error = function(e) {
throw new Error("Syntax error, unrecognized expression: " + e);
}, x = n.compile = function(e, t) {
var n, r = [], i = [], s = z[A][e + " "];
if (!s) {
t || (t = u(e)), n = t.length;
while (n--) s = h(t[n]), s[A] ? r.push(s) : i.push(s);
s = z(e, p(i, r));
}
return s;
}, M.querySelectorAll && function() {
var e, t = v, r = /'|\\/g, i = /\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g, s = [ ":focus" ], o = [ ":active" ], a = _.matchesSelector || _.mozMatchesSelector || _.webkitMatchesSelector || _.oMatchesSelector || _.msMatchesSelector;
lt(function(e) {
e.innerHTML = "<select><option selected=''></option></select>", e.querySelectorAll("[selected]").length || s.push("\\[" + W + "*(?:checked|disabled|ismap|multiple|readonly|selected|value)"), e.querySelectorAll(":checked").length || s.push(":checked");
}), lt(function(e) {
e.innerHTML = "<p test=''></p>", e.querySelectorAll("[test^='']").length && s.push("[*^$]=" + W + "*(?:\"\"|'')"), e.innerHTML = "<input type='hidden'/>", e.querySelectorAll(":enabled").length || s.push(":enabled", ":disabled");
}), s = new RegExp(s.join("|")), v = function(e, n, i, o, a) {
if (!o && !a && !s.test(e)) {
var f, l, c = !0, h = A, p = n, d = n.nodeType === 9 && e;
if (n.nodeType === 1 && n.nodeName.toLowerCase() !== "object") {
f = u(e), (c = n.getAttribute("id")) ? h = c.replace(r, "\\$&") : n.setAttribute("id", h), h = "[id='" + h + "'] ", l = f.length;
while (l--) f[l] = h + f[l].join("");
p = it.test(e) && n.parentNode || n, d = f.join(",");
}
if (d) try {
return B.apply(i, j.call(p.querySelectorAll(d), 0)), i;
} catch (v) {} finally {
c || n.removeAttribute("id");
}
}
return t(e, n, i, o, a);
}, a && (lt(function(t) {
e = a.call(t, "div");
try {
a.call(t, "[test!='']:sizzle"), o.push("!=", K);
} catch (n) {}
}), o = new RegExp(o.join("|")), n.matchesSelector = function(t, r) {
r = r.replace(i, "='$1']");
if (!E(t) && !o.test(r) && !s.test(r)) try {
var u = a.call(t, r);
if (u || e || t.document && t.document.nodeType !== 11) return u;
} catch (f) {}
return n(r, null, null, [ t ]).length > 0;
});
}(), b.pseudos.nth = b.pseudos.eq, b.filters = m.prototype = b.pseudos, b.setFilters = new m, n.attr = Y.attr, Y.find = n, Y.expr = n.selectors, Y.expr[":"] = Y.expr.pseudos, Y.unique = n.uniqueSort, Y.text = n.getText, Y.isXMLDoc = n.isXML, Y.contains = n.contains;
}(e);
var Pt = /Until$/, Ht = /^(?:parents|prev(?:Until|All))/, Bt = /^.[^:#\[\.,]*$/, jt = Y.expr.match.needsContext, Ft = {
children: !0,
contents: !0,
next: !0,
prev: !0
};
Y.fn.extend({
find: function(e) {
var t, n, r, i, s, o, u = this;
if (typeof e != "string") return Y(e).filter(function() {
for (t = 0, n = u.length; t < n; t++) if (Y.contains(u[t], this)) return !0;
});
o = this.pushStack("", "find", e);
for (t = 0, n = this.length; t < n; t++) {
r = o.length, Y.find(e, this[t], o);
if (t > 0) for (i = r; i < o.length; i++) for (s = 0; s < r; s++) if (o[s] === o[i]) {
o.splice(i--, 1);
break;
}
}
return o;
},
has: function(e) {
var t, n = Y(e, this), r = n.length;
return this.filter(function() {
for (t = 0; t < r; t++) if (Y.contains(this, n[t])) return !0;
});
},
not: function(e) {
return this.pushStack(f(this, e, !1), "not", e);
},
filter: function(e) {
return this.pushStack(f(this, e, !0), "filter", e);
},
is: function(e) {
return !!e && (typeof e == "string" ? jt.test(e) ? Y(e, this.context).index(this[0]) >= 0 : Y.filter(e, this).length > 0 : this.filter(e).length > 0);
},
closest: function(e, t) {
var n, r = 0, i = this.length, s = [], o = jt.test(e) || typeof e != "string" ? Y(e, t || this.context) : 0;
for (; r < i; r++) {
n = this[r];
while (n && n.ownerDocument && n !== t && n.nodeType !== 11) {
if (o ? o.index(n) > -1 : Y.find.matchesSelector(n, e)) {
s.push(n);
break;
}
n = n.parentNode;
}
}
return s = s.length > 1 ? Y.unique(s) : s, this.pushStack(s, "closest", e);
},
index: function(e) {
return e ? typeof e == "string" ? Y.inArray(this[0], Y(e)) : Y.inArray(e.jquery ? e[0] : e, this) : this[0] && this[0].parentNode ? this.prevAll().length : -1;
},
add: function(e, t) {
var n = typeof e == "string" ? Y(e, t) : Y.makeArray(e && e.nodeType ? [ e ] : e), r = Y.merge(this.get(), n);
return this.pushStack(u(n[0]) || u(r[0]) ? r : Y.unique(r));
},
addBack: function(e) {
return this.add(e == null ? this.prevObject : this.prevObject.filter(e));
}
}), Y.fn.andSelf = Y.fn.addBack, Y.each({
parent: function(e) {
var t = e.parentNode;
return t && t.nodeType !== 11 ? t : null;
},
parents: function(e) {
return Y.dir(e, "parentNode");
},
parentsUntil: function(e, t, n) {
return Y.dir(e, "parentNode", n);
},
next: function(e) {
return a(e, "nextSibling");
},
prev: function(e) {
return a(e, "previousSibling");
},
nextAll: function(e) {
return Y.dir(e, "nextSibling");
},
prevAll: function(e) {
return Y.dir(e, "previousSibling");
},
nextUntil: function(e, t, n) {
return Y.dir(e, "nextSibling", n);
},
prevUntil: function(e, t, n) {
return Y.dir(e, "previousSibling", n);
},
siblings: function(e) {
return Y.sibling((e.parentNode || {}).firstChild, e);
},
children: function(e) {
return Y.sibling(e.firstChild);
},
contents: function(e) {
return Y.nodeName(e, "iframe") ? e.contentDocument || e.contentWindow.document : Y.merge([], e.childNodes);
}
}, function(e, t) {
Y.fn[e] = function(n, r) {
var i = Y.map(this, t, n);
return Pt.test(e) || (r = n), r && typeof r == "string" && (i = Y.filter(r, i)), i = this.length > 1 && !Ft[e] ? Y.unique(i) : i, this.length > 1 && Ht.test(e) && (i = i.reverse()), this.pushStack(i, e, $.call(arguments).join(","));
};
}), Y.extend({
filter: function(e, t, n) {
return n && (e = ":not(" + e + ")"), t.length === 1 ? Y.find.matchesSelector(t[0], e) ? [ t[0] ] : [] : Y.find.matches(e, t);
},
dir: function(e, n, r) {
var i = [], s = e[n];
while (s && s.nodeType !== 9 && (r === t || s.nodeType !== 1 || !Y(s).is(r))) s.nodeType === 1 && i.push(s), s = s[n];
return i;
},
sibling: function(e, t) {
var n = [];
for (; e; e = e.nextSibling) e.nodeType === 1 && e !== t && n.push(e);
return n;
}
});
var It = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video", qt = / jQuery\d+="(?:null|\d+)"/g, Rt = /^\s+/, Ut = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, zt = /<([\w:]+)/, Wt = /<tbody/i, Xt = /<|&#?\w+;/, Vt = /<(?:script|style|link)/i, $t = /<(?:script|object|embed|option|style)/i, Jt = new RegExp("<(?:" + It + ")[\\s/>]", "i"), Kt = /^(?:checkbox|radio)$/, Qt = /checked\s*(?:[^=]|=\s*.checked.)/i, Gt = /\/(java|ecma)script/i, Yt = /^\s*<!(?:\[CDATA\[|\-\-)|[\]\-]{2}>\s*$/g, Zt = {
option: [ 1, "<select multiple='multiple'>", "</select>" ],
legend: [ 1, "<fieldset>", "</fieldset>" ],
thead: [ 1, "<table>", "</table>" ],
tr: [ 2, "<table><tbody>", "</tbody></table>" ],
td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
area: [ 1, "<map>", "</map>" ],
_default: [ 0, "", "" ]
}, en = l(R), tn = en.appendChild(R.createElement("div"));
Zt.optgroup = Zt.option, Zt.tbody = Zt.tfoot = Zt.colgroup = Zt.caption = Zt.thead, Zt.th = Zt.td, Y.support.htmlSerialize || (Zt._default = [ 1, "X<div>", "</div>" ]), Y.fn.extend({
text: function(e) {
return Y.access(this, function(e) {
return e === t ? Y.text(this) : this.empty().append((this[0] && this[0].ownerDocument || R).createTextNode(e));
}, null, e, arguments.length);
},
wrapAll: function(e) {
if (Y.isFunction(e)) return this.each(function(t) {
Y(this).wrapAll(e.call(this, t));
});
if (this[0]) {
var t = Y(e, this[0].ownerDocument).eq(0).clone(!0);
this[0].parentNode && t.insertBefore(this[0]), t.map(function() {
var e = this;
while (e.firstChild && e.firstChild.nodeType === 1) e = e.firstChild;
return e;
}).append(this);
}
return this;
},
wrapInner: function(e) {
return Y.isFunction(e) ? this.each(function(t) {
Y(this).wrapInner(e.call(this, t));
}) : this.each(function() {
var t = Y(this), n = t.contents();
n.length ? n.wrapAll(e) : t.append(e);
});
},
wrap: function(e) {
var t = Y.isFunction(e);
return this.each(function(n) {
Y(this).wrapAll(t ? e.call(this, n) : e);
});
},
unwrap: function() {
return this.parent().each(function() {
Y.nodeName(this, "body") || Y(this).replaceWith(this.childNodes);
}).end();
},
append: function() {
return this.domManip(arguments, !0, function(e) {
(this.nodeType === 1 || this.nodeType === 11) && this.appendChild(e);
});
},
prepend: function() {
return this.domManip(arguments, !0, function(e) {
(this.nodeType === 1 || this.nodeType === 11) && this.insertBefore(e, this.firstChild);
});
},
before: function() {
if (!u(this[0])) return this.domManip(arguments, !1, function(e) {
this.parentNode.insertBefore(e, this);
});
if (arguments.length) {
var e = Y.clean(arguments);
return this.pushStack(Y.merge(e, this), "before", this.selector);
}
},
after: function() {
if (!u(this[0])) return this.domManip(arguments, !1, function(e) {
this.parentNode.insertBefore(e, this.nextSibling);
});
if (arguments.length) {
var e = Y.clean(arguments);
return this.pushStack(Y.merge(this, e), "after", this.selector);
}
},
remove: function(e, t) {
var n, r = 0;
for (; (n = this[r]) != null; r++) if (!e || Y.filter(e, [ n ]).length) !t && n.nodeType === 1 && (Y.cleanData(n.getElementsByTagName("*")), Y.cleanData([ n ])), n.parentNode && n.parentNode.removeChild(n);
return this;
},
empty: function() {
var e, t = 0;
for (; (e = this[t]) != null; t++) {
e.nodeType === 1 && Y.cleanData(e.getElementsByTagName("*"));
while (e.firstChild) e.removeChild(e.firstChild);
}
return this;
},
clone: function(e, t) {
return e = e == null ? !1 : e, t = t == null ? e : t, this.map(function() {
return Y.clone(this, e, t);
});
},
html: function(e) {
return Y.access(this, function(e) {
var n = this[0] || {}, r = 0, i = this.length;
if (e === t) return n.nodeType === 1 ? n.innerHTML.replace(qt, "") : t;
if (typeof e == "string" && !Vt.test(e) && (Y.support.htmlSerialize || !Jt.test(e)) && (Y.support.leadingWhitespace || !Rt.test(e)) && !Zt[(zt.exec(e) || [ "", "" ])[1].toLowerCase()]) {
e = e.replace(Ut, "<$1></$2>");
try {
for (; r < i; r++) n = this[r] || {}, n.nodeType === 1 && (Y.cleanData(n.getElementsByTagName("*")), n.innerHTML = e);
n = 0;
} catch (s) {}
}
n && this.empty().append(e);
}, null, e, arguments.length);
},
replaceWith: function(e) {
return u(this[0]) ? this.length ? this.pushStack(Y(Y.isFunction(e) ? e() : e), "replaceWith", e) : this : Y.isFunction(e) ? this.each(function(t) {
var n = Y(this), r = n.html();
n.replaceWith(e.call(this, t, r));
}) : (typeof e != "string" && (e = Y(e).detach()), this.each(function() {
var t = this.nextSibling, n = this.parentNode;
Y(this).remove(), t ? Y(t).before(e) : Y(n).append(e);
}));
},
detach: function(e) {
return this.remove(e, !0);
},
domManip: function(e, n, r) {
e = [].concat.apply([], e);
var i, s, o, u, a = 0, f = e[0], l = [], h = this.length;
if (!Y.support.checkClone && h > 1 && typeof f == "string" && Qt.test(f)) return this.each(function() {
Y(this).domManip(e, n, r);
});
if (Y.isFunction(f)) return this.each(function(i) {
var s = Y(this);
e[0] = f.call(this, i, n ? s.html() : t), s.domManip(e, n, r);
});
if (this[0]) {
i = Y.buildFragment(e, this, l), o = i.fragment, s = o.firstChild, o.childNodes.length === 1 && (o = s);
if (s) {
n = n && Y.nodeName(s, "tr");
for (u = i.cacheable || h - 1; a < h; a++) r.call(n && Y.nodeName(this[a], "table") ? c(this[a], "tbody") : this[a], a === u ? o : Y.clone(o, !0, !0));
}
o = s = null, l.length && Y.each(l, function(e, t) {
t.src ? Y.ajax ? Y.ajax({
url: t.src,
type: "GET",
dataType: "script",
async: !1,
global: !1,
"throws": !0
}) : Y.error("no ajax") : Y.globalEval((t.text || t.textContent || t.innerHTML || "").replace(Yt, "")), t.parentNode && t.parentNode.removeChild(t);
});
}
return this;
}
}), Y.buildFragment = function(e, n, r) {
var i, s, o, u = e[0];
return n = n || R, n = !n.nodeType && n[0] || n, n = n.ownerDocument || n, e.length === 1 && typeof u == "string" && u.length < 512 && n === R && u.charAt(0) === "<" && !$t.test(u) && (Y.support.checkClone || !Qt.test(u)) && (Y.support.html5Clone || !Jt.test(u)) && (s = !0, i = Y.fragments[u], o = i !== t), i || (i = n.createDocumentFragment(), Y.clean(e, n, i, r), s && (Y.fragments[u] = o && i)), {
fragment: i,
cacheable: s
};
}, Y.fragments = {}, Y.each({
appendTo: "append",
prependTo: "prepend",
insertBefore: "before",
insertAfter: "after",
replaceAll: "replaceWith"
}, function(e, t) {
Y.fn[e] = function(n) {
var r, i = 0, s = [], o = Y(n), u = o.length, a = this.length === 1 && this[0].parentNode;
if ((a == null || a && a.nodeType === 11 && a.childNodes.length === 1) && u === 1) return o[t](this[0]), this;
for (; i < u; i++) r = (i > 0 ? this.clone(!0) : this).get(), Y(o[i])[t](r), s = s.concat(r);
return this.pushStack(s, e, o.selector);
};
}), Y.extend({
clone: function(e, t, n) {
var r, i, s, o;
Y.support.html5Clone || Y.isXMLDoc(e) || !Jt.test("<" + e.nodeName + ">") ? o = e.cloneNode(!0) : (tn.innerHTML = e.outerHTML, tn.removeChild(o = tn.firstChild));
if ((!Y.support.noCloneEvent || !Y.support.noCloneChecked) && (e.nodeType === 1 || e.nodeType === 11) && !Y.isXMLDoc(e)) {
p(e, o), r = d(e), i = d(o);
for (s = 0; r[s]; ++s) i[s] && p(r[s], i[s]);
}
if (t) {
h(e, o);
if (n) {
r = d(e), i = d(o);
for (s = 0; r[s]; ++s) h(r[s], i[s]);
}
}
return r = i = null, o;
},
clean: function(e, t, n, r) {
var i, s, o, u, a, f, c, h, p, d, m, g, y = t === R && en, b = [];
if (!t || typeof t.createDocumentFragment == "undefined") t = R;
for (i = 0; (o = e[i]) != null; i++) {
typeof o == "number" && (o += "");
if (!o) continue;
if (typeof o == "string") if (!Xt.test(o)) o = t.createTextNode(o); else {
y = y || l(t), c = t.createElement("div"), y.appendChild(c), o = o.replace(Ut, "<$1></$2>"), u = (zt.exec(o) || [ "", "" ])[1].toLowerCase(), a = Zt[u] || Zt._default, f = a[0], c.innerHTML = a[1] + o + a[2];
while (f--) c = c.lastChild;
if (!Y.support.tbody) {
h = Wt.test(o), p = u === "table" && !h ? c.firstChild && c.firstChild.childNodes : a[1] === "<table>" && !h ? c.childNodes : [];
for (s = p.length - 1; s >= 0; --s) Y.nodeName(p[s], "tbody") && !p[s].childNodes.length && p[s].parentNode.removeChild(p[s]);
}
!Y.support.leadingWhitespace && Rt.test(o) && c.insertBefore(t.createTextNode(Rt.exec(o)[0]), c.firstChild), o = c.childNodes, c.parentNode.removeChild(c);
}
o.nodeType ? b.push(o) : Y.merge(b, o);
}
c && (o = c = y = null);
if (!Y.support.appendChecked) for (i = 0; (o = b[i]) != null; i++) Y.nodeName(o, "input") ? v(o) : typeof o.getElementsByTagName != "undefined" && Y.grep(o.getElementsByTagName("input"), v);
if (n) {
m = function(e) {
if (!e.type || Gt.test(e.type)) return r ? r.push(e.parentNode ? e.parentNode.removeChild(e) : e) : n.appendChild(e);
};
for (i = 0; (o = b[i]) != null; i++) if (!Y.nodeName(o, "script") || !m(o)) n.appendChild(o), typeof o.getElementsByTagName != "undefined" && (g = Y.grep(Y.merge([], o.getElementsByTagName("script")), m), b.splice.apply(b, [ i + 1, 0 ].concat(g)), i += g.length);
}
return b;
},
cleanData: function(e, t) {
var n, r, i, s, o = 0, u = Y.expando, a = Y.cache, f = Y.support.deleteExpando, l = Y.event.special;
for (; (i = e[o]) != null; o++) if (t || Y.acceptData(i)) {
r = i[u], n = r && a[r];
if (n) {
if (n.events) for (s in n.events) l[s] ? Y.event.remove(i, s) : Y.removeEvent(i, s, n.handle);
a[r] && (delete a[r], f ? delete i[u] : i.removeAttribute ? i.removeAttribute(u) : i[u] = null, Y.deletedIds.push(r));
}
}
}
}), function() {
var e, t;
Y.uaMatch = function(e) {
e = e.toLowerCase();
var t = /(chrome)[ \/]([\w.]+)/.exec(e) || /(webkit)[ \/]([\w.]+)/.exec(e) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(e) || /(msie) ([\w.]+)/.exec(e) || e.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(e) || [];
return {
browser: t[1] || "",
version: t[2] || "0"
};
}, e = Y.uaMatch(z.userAgent), t = {}, e.browser && (t[e.browser] = !0, t.version = e.version), t.chrome ? t.webkit = !0 : t.webkit && (t.safari = !0), Y.browser = t, Y.sub = function() {
function e(t, n) {
return new e.fn.init(t, n);
}
Y.extend(!0, e, this), e.superclass = this, e.fn = e.prototype = this(), e.fn.constructor = e, e.sub = this.sub, e.fn.init = function(n, r) {
return r && r instanceof Y && !(r instanceof e) && (r = e(r)), Y.fn.init.call(this, n, r, t);
}, e.fn.init.prototype = e.fn;
var t = e(R);
return e;
};
}();
var nn, rn, sn, on = /alpha\([^)]*\)/i, un = /opacity=([^)]*)/, an = /^(top|right|bottom|left)$/, fn = /^(none|table(?!-c[ea]).+)/, ln = /^margin/, cn = new RegExp("^(" + Z + ")(.*)$", "i"), hn = new RegExp("^(" + Z + ")(?!px)[a-z%]+$", "i"), pn = new RegExp("^([-+])=(" + Z + ")", "i"), dn = {
BODY: "block"
}, vn = {
position: "absolute",
visibility: "hidden",
display: "block"
}, mn = {
letterSpacing: 0,
fontWeight: 400
}, gn = [ "Top", "Right", "Bottom", "Left" ], yn = [ "Webkit", "O", "Moz", "ms" ], bn = Y.fn.toggle;
Y.fn.extend({
css: function(e, n) {
return Y.access(this, function(e, n, r) {
return r !== t ? Y.style(e, n, r) : Y.css(e, n);
}, e, n, arguments.length > 1);
},
show: function() {
return y(this, !0);
},
hide: function() {
return y(this);
},
toggle: function(e, t) {
var n = typeof e == "boolean";
return Y.isFunction(e) && Y.isFunction(t) ? bn.apply(this, arguments) : this.each(function() {
(n ? e : g(this)) ? Y(this).show() : Y(this).hide();
});
}
}), Y.extend({
cssHooks: {
opacity: {
get: function(e, t) {
if (t) {
var n = nn(e, "opacity");
return n === "" ? "1" : n;
}
}
}
},
cssNumber: {
fillOpacity: !0,
fontWeight: !0,
lineHeight: !0,
opacity: !0,
orphans: !0,
widows: !0,
zIndex: !0,
zoom: !0
},
cssProps: {
"float": Y.support.cssFloat ? "cssFloat" : "styleFloat"
},
style: function(e, n, r, i) {
if (!e || e.nodeType === 3 || e.nodeType === 8 || !e.style) return;
var s, o, u, a = Y.camelCase(n), f = e.style;
n = Y.cssProps[a] || (Y.cssProps[a] = m(f, a)), u = Y.cssHooks[n] || Y.cssHooks[a];
if (r === t) return u && "get" in u && (s = u.get(e, !1, i)) !== t ? s : f[n];
o = typeof r, o === "string" && (s = pn.exec(r)) && (r = (s[1] + 1) * s[2] + parseFloat(Y.css(e, n)), o = "number");
if (r == null || o === "number" && isNaN(r)) return;
o === "number" && !Y.cssNumber[a] && (r += "px");
if (!u || !("set" in u) || (r = u.set(e, r, i)) !== t) try {
f[n] = r;
} catch (l) {}
},
css: function(e, n, r, i) {
var s, o, u, a = Y.camelCase(n);
return n = Y.cssProps[a] || (Y.cssProps[a] = m(e.style, a)), u = Y.cssHooks[n] || Y.cssHooks[a], u && "get" in u && (s = u.get(e, !0, i)), s === t && (s = nn(e, n)), s === "normal" && n in mn && (s = mn[n]), r || i !== t ? (o = parseFloat(s), r || Y.isNumeric(o) ? o || 0 : s) : s;
},
swap: function(e, t, n) {
var r, i, s = {};
for (i in t) s[i] = e.style[i], e.style[i] = t[i];
r = n.call(e);
for (i in t) e.style[i] = s[i];
return r;
}
}), e.getComputedStyle ? nn = function(t, n) {
var r, i, s, o, u = e.getComputedStyle(t, null), a = t.style;
return u && (r = u.getPropertyValue(n) || u[n], r === "" && !Y.contains(t.ownerDocument, t) && (r = Y.style(t, n)), hn.test(r) && ln.test(n) && (i = a.width, s = a.minWidth, o = a.maxWidth, a.minWidth = a.maxWidth = a.width = r, r = u.width, a.width = i, a.minWidth = s, a.maxWidth = o)), r;
} : R.documentElement.currentStyle && (nn = function(e, t) {
var n, r, i = e.currentStyle && e.currentStyle[t], s = e.style;
return i == null && s && s[t] && (i = s[t]), hn.test(i) && !an.test(t) && (n = s.left, r = e.runtimeStyle && e.runtimeStyle.left, r && (e.runtimeStyle.left = e.currentStyle.left), s.left = t === "fontSize" ? "1em" : i, i = s.pixelLeft + "px", s.left = n, r && (e.runtimeStyle.left = r)), i === "" ? "auto" : i;
}), Y.each([ "height", "width" ], function(e, t) {
Y.cssHooks[t] = {
get: function(e, n, r) {
if (n) return e.offsetWidth === 0 && fn.test(nn(e, "display")) ? Y.swap(e, vn, function() {
return E(e, t, r);
}) : E(e, t, r);
},
set: function(e, n, r) {
return b(e, n, r ? w(e, t, r, Y.support.boxSizing && Y.css(e, "boxSizing") === "border-box") : 0);
}
};
}), Y.support.opacity || (Y.cssHooks.opacity = {
get: function(e, t) {
return un.test((t && e.currentStyle ? e.currentStyle.filter : e.style.filter) || "") ? .01 * parseFloat(RegExp.$1) + "" : t ? "1" : "";
},
set: function(e, t) {
var n = e.style, r = e.currentStyle, i = Y.isNumeric(t) ? "alpha(opacity=" + t * 100 + ")" : "", s = r && r.filter || n.filter || "";
n.zoom = 1;
if (t >= 1 && Y.trim(s.replace(on, "")) === "" && n.removeAttribute) {
n.removeAttribute("filter");
if (r && !r.filter) return;
}
n.filter = on.test(s) ? s.replace(on, i) : s + " " + i;
}
}), Y(function() {
Y.support.reliableMarginRight || (Y.cssHooks.marginRight = {
get: function(e, t) {
return Y.swap(e, {
display: "inline-block"
}, function() {
if (t) return nn(e, "marginRight");
});
}
}), !Y.support.pixelPosition && Y.fn.position && Y.each([ "top", "left" ], function(e, t) {
Y.cssHooks[t] = {
get: function(e, n) {
if (n) {
var r = nn(e, t);
return hn.test(r) ? Y(e).position()[t] + "px" : r;
}
}
};
});
}), Y.expr && Y.expr.filters && (Y.expr.filters.hidden = function(e) {
return e.offsetWidth === 0 && e.offsetHeight === 0 || !Y.support.reliableHiddenOffsets && (e.style && e.style.display || nn(e, "display")) === "none";
}, Y.expr.filters.visible = function(e) {
return !Y.expr.filters.hidden(e);
}), Y.each({
margin: "",
padding: "",
border: "Width"
}, function(e, t) {
Y.cssHooks[e + t] = {
expand: function(n) {
var r, i = typeof n == "string" ? n.split(" ") : [ n ], s = {};
for (r = 0; r < 4; r++) s[e + gn[r] + t] = i[r] || i[r - 2] || i[0];
return s;
}
}, ln.test(e) || (Y.cssHooks[e + t].set = b);
});
var wn = /%20/g, En = /\[\]$/, Sn = /\r?\n/g, xn = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i, Tn = /^(?:select|textarea)/i;
Y.fn.extend({
serialize: function() {
return Y.param(this.serializeArray());
},
serializeArray: function() {
return this.map(function() {
return this.elements ? Y.makeArray(this.elements) : this;
}).filter(function() {
return this.name && !this.disabled && (this.checked || Tn.test(this.nodeName) || xn.test(this.type));
}).map(function(e, t) {
var n = Y(this).val();
return n == null ? null : Y.isArray(n) ? Y.map(n, function(e, n) {
return {
name: t.name,
value: e.replace(Sn, "\r\n")
};
}) : {
name: t.name,
value: n.replace(Sn, "\r\n")
};
}).get();
}
}), Y.param = function(e, n) {
var r, i = [], s = function(e, t) {
t = Y.isFunction(t) ? t() : t == null ? "" : t, i[i.length] = encodeURIComponent(e) + "=" + encodeURIComponent(t);
};
n === t && (n = Y.ajaxSettings && Y.ajaxSettings.traditional);
if (Y.isArray(e) || e.jquery && !Y.isPlainObject(e)) Y.each(e, function() {
s(this.name, this.value);
}); else for (r in e) x(r, e[r], n, s);
return i.join("&").replace(wn, "+");
};
var Nn, Cn, kn = /#.*$/, Ln = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, An = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/, On = /^(?:GET|HEAD)$/, Mn = /^\/\//, _n = /\?/, Dn = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, Pn = /([?&])_=[^&]*/, Hn = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/, Bn = Y.fn.load, jn = {}, Fn = {}, In = [ "*/" ] + [ "*" ];
try {
Cn = U.href;
} catch (qn) {
Cn = R.createElement("a"), Cn.href = "", Cn = Cn.href;
}
Nn = Hn.exec(Cn.toLowerCase()) || [], Y.fn.load = function(e, n, r) {
if (typeof e != "string" && Bn) return Bn.apply(this, arguments);
if (!this.length) return this;
var i, s, o, u = this, a = e.indexOf(" ");
return a >= 0 && (i = e.slice(a, e.length), e = e.slice(0, a)), Y.isFunction(n) ? (r = n, n = t) : n && typeof n == "object" && (s = "POST"), Y.ajax({
url: e,
type: s,
dataType: "html",
data: n,
complete: function(e, t) {
r && u.each(r, o || [ e.responseText, t, e ]);
}
}).done(function(e) {
o = arguments, u.html(i ? Y("<div>").append(e.replace(Dn, "")).find(i) : e);
}), this;
}, Y.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "), function(e, t) {
Y.fn[t] = function(e) {
return this.on(t, e);
};
}), Y.each([ "get", "post" ], function(e, n) {
Y[n] = function(e, r, i, s) {
return Y.isFunction(r) && (s = s || i, i = r, r = t), Y.ajax({
type: n,
url: e,
data: r,
success: i,
dataType: s
});
};
}), Y.extend({
getScript: function(e, n) {
return Y.get(e, t, n, "script");
},
getJSON: function(e, t, n) {
return Y.get(e, t, n, "json");
},
ajaxSetup: function(e, t) {
return t ? C(e, Y.ajaxSettings) : (t = e, e = Y.ajaxSettings), C(e, t), e;
},
ajaxSettings: {
url: Cn,
isLocal: An.test(Nn[1]),
global: !0,
type: "GET",
contentType: "application/x-www-form-urlencoded; charset=UTF-8",
processData: !0,
async: !0,
accepts: {
xml: "application/xml, text/xml",
html: "text/html",
text: "text/plain",
json: "application/json, text/javascript",
"*": In
},
contents: {
xml: /xml/,
html: /html/,
json: /json/
},
responseFields: {
xml: "responseXML",
text: "responseText"
},
converters: {
"* text": e.String,
"text html": !0,
"text json": Y.parseJSON,
"text xml": Y.parseXML
},
flatOptions: {
context: !0,
url: !0
}
},
ajaxPrefilter: T(jn),
ajaxTransport: T(Fn),
ajax: function(e, n) {
function r(e, n, r, o) {
var f, c, y, b, E, x = n;
if (w === 2) return;
w = 2, a && clearTimeout(a), u = t, s = o || "", S.readyState = e > 0 ? 4 : 0, r && (b = k(h, S, r));
if (e >= 200 && e < 300 || e === 304) h.ifModified && (E = S.getResponseHeader("Last-Modified"), E && (Y.lastModified[i] = E), E = S.getResponseHeader("Etag"), E && (Y.etag[i] = E)), e === 304 ? (x = "notmodified", f = !0) : (f = L(h, b), x = f.state, c = f.data, y = f.error, f = !y); else {
y = x;
if (!x || e) x = "error", e < 0 && (e = 0);
}
S.status = e, S.statusText = (n || x) + "", f ? v.resolveWith(p, [ c, x, S ]) : v.rejectWith(p, [ S, x, y ]), S.statusCode(g), g = t, l && d.trigger("ajax" + (f ? "Success" : "Error"), [ S, h, f ? c : y ]), m.fireWith(p, [ S, x ]), l && (d.trigger("ajaxComplete", [ S, h ]), --Y.active || Y.event.trigger("ajaxStop"));
}
typeof e == "object" && (n = e, e = t), n = n || {};
var i, s, o, u, a, f, l, c, h = Y.ajaxSetup({}, n), p = h.context || h, d = p !== h && (p.nodeType || p instanceof Y) ? Y(p) : Y.event, v = Y.Deferred(), m = Y.Callbacks("once memory"), g = h.statusCode || {}, y = {}, b = {}, w = 0, E = "canceled", S = {
readyState: 0,
setRequestHeader: function(e, t) {
if (!w) {
var n = e.toLowerCase();
e = b[n] = b[n] || e, y[e] = t;
}
return this;
},
getAllResponseHeaders: function() {
return w === 2 ? s : null;
},
getResponseHeader: function(e) {
var n;
if (w === 2) {
if (!o) {
o = {};
while (n = Ln.exec(s)) o[n[1].toLowerCase()] = n[2];
}
n = o[e.toLowerCase()];
}
return n === t ? null : n;
},
overrideMimeType: function(e) {
return w || (h.mimeType = e), this;
},
abort: function(e) {
return e = e || E, u && u.abort(e), r(0, e), this;
}
};
v.promise(S), S.success = S.done, S.error = S.fail, S.complete = m.add, S.statusCode = function(e) {
if (e) {
var t;
if (w < 2) for (t in e) g[t] = [ g[t], e[t] ]; else t = e[S.status], S.always(t);
}
return this;
}, h.url = ((e || h.url) + "").replace(kn, "").replace(Mn, Nn[1] + "//"), h.dataTypes = Y.trim(h.dataType || "*").toLowerCase().split(tt), h.crossDomain == null && (f = Hn.exec(h.url.toLowerCase()), h.crossDomain = !(!f || f[1] === Nn[1] && f[2] === Nn[2] && (f[3] || (f[1] === "http:" ? 80 : 443)) == (Nn[3] || (Nn[1] === "http:" ? 80 : 443)))), h.data && h.processData && typeof h.data != "string" && (h.data = Y.param(h.data, h.traditional)), N(jn, h, n, S);
if (w === 2) return S;
l = h.global, h.type = h.type.toUpperCase(), h.hasContent = !On.test(h.type), l && Y.active++ === 0 && Y.event.trigger("ajaxStart");
if (!h.hasContent) {
h.data && (h.url += (_n.test(h.url) ? "&" : "?") + h.data, delete h.data), i = h.url;
if (h.cache === !1) {
var x = Y.now(), T = h.url.replace(Pn, "$1_=" + x);
h.url = T + (T === h.url ? (_n.test(h.url) ? "&" : "?") + "_=" + x : "");
}
}
(h.data && h.hasContent && h.contentType !== !1 || n.contentType) && S.setRequestHeader("Content-Type", h.contentType), h.ifModified && (i = i || h.url, Y.lastModified[i] && S.setRequestHeader("If-Modified-Since", Y.lastModified[i]), Y.etag[i] && S.setRequestHeader("If-None-Match", Y.etag[i])), S.setRequestHeader("Accept", h.dataTypes[0] && h.accepts[h.dataTypes[0]] ? h.accepts[h.dataTypes[0]] + (h.dataTypes[0] !== "*" ? ", " + In + "; q=0.01" : "") : h.accepts["*"]);
for (c in h.headers) S.setRequestHeader(c, h.headers[c]);
if (!h.beforeSend || h.beforeSend.call(p, S, h) !== !1 && w !== 2) {
E = "abort";
for (c in {
success: 1,
error: 1,
complete: 1
}) S[c](h[c]);
u = N(Fn, h, n, S);
if (!u) r(-1, "No Transport"); else {
S.readyState = 1, l && d.trigger("ajaxSend", [ S, h ]), h.async && h.timeout > 0 && (a = setTimeout(function() {
S.abort("timeout");
}, h.timeout));
try {
w = 1, u.send(y, r);
} catch (C) {
if (!(w < 2)) throw C;
r(-1, C);
}
}
return S;
}
return S.abort();
},
active: 0,
lastModified: {},
etag: {}
});
var Rn = [], Un = /\?/, zn = /(=)\?(?=&|$)|\?\?/, Wn = Y.now();
Y.ajaxSetup({
jsonp: "callback",
jsonpCallback: function() {
var e = Rn.pop() || Y.expando + "_" + Wn++;
return this[e] = !0, e;
}
}), Y.ajaxPrefilter("json jsonp", function(n, r, i) {
var s, o, u, a = n.data, f = n.url, l = n.jsonp !== !1, c = l && zn.test(f), h = l && !c && typeof a == "string" && !(n.contentType || "").indexOf("application/x-www-form-urlencoded") && zn.test(a);
if (n.dataTypes[0] === "jsonp" || c || h) return s = n.jsonpCallback = Y.isFunction(n.jsonpCallback) ? n.jsonpCallback() : n.jsonpCallback, o = e[s], c ? n.url = f.replace(zn, "$1" + s) : h ? n.data = a.replace(zn, "$1" + s) : l && (n.url += (Un.test(f) ? "&" : "?") + n.jsonp + "=" + s), n.converters["script json"] = function() {
return u || Y.error(s + " was not called"), u[0];
}, n.dataTypes[0] = "json", e[s] = function() {
u = arguments;
}, i.always(function() {
e[s] = o, n[s] && (n.jsonpCallback = r.jsonpCallback, Rn.push(s)), u && Y.isFunction(o) && o(u[0]), u = o = t;
}), "script";
}), Y.ajaxSetup({
accepts: {
script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
},
contents: {
script: /javascript|ecmascript/
},
converters: {
"text script": function(e) {
return Y.globalEval(e), e;
}
}
}), Y.ajaxPrefilter("script", function(e) {
e.cache === t && (e.cache = !1), e.crossDomain && (e.type = "GET", e.global = !1);
}), Y.ajaxTransport("script", function(e) {
if (e.crossDomain) {
var n, r = R.head || R.getElementsByTagName("head")[0] || R.documentElement;
return {
send: function(i, s) {
n = R.createElement("script"), n.async = "async", e.scriptCharset && (n.charset = e.scriptCharset), n.src = e.url, n.onload = n.onreadystatechange = function(e, i) {
if (i || !n.readyState || /loaded|complete/.test(n.readyState)) n.onload = n.onreadystatechange = null, r && n.parentNode && r.removeChild(n), n = t, i || s(200, "success");
}, r.insertBefore(n, r.firstChild);
},
abort: function() {
n && n.onload(0, 1);
}
};
}
});
var Xn, Vn = e.ActiveXObject ? function() {
for (var e in Xn) Xn[e](0, 1);
} : !1, $n = 0;
Y.ajaxSettings.xhr = e.ActiveXObject ? function() {
return !this.isLocal && A() || O();
} : A, function(e) {
Y.extend(Y.support, {
ajax: !!e,
cors: !!e && "withCredentials" in e
});
}(Y.ajaxSettings.xhr()), Y.support.ajax && Y.ajaxTransport(function(n) {
if (!n.crossDomain || Y.support.cors) {
var r;
return {
send: function(i, s) {
var o, u, a = n.xhr();
n.username ? a.open(n.type, n.url, n.async, n.username, n.password) : a.open(n.type, n.url, n.async);
if (n.xhrFields) for (u in n.xhrFields) a[u] = n.xhrFields[u];
n.mimeType && a.overrideMimeType && a.overrideMimeType(n.mimeType), !n.crossDomain && !i["X-Requested-With"] && (i["X-Requested-With"] = "XMLHttpRequest");
try {
for (u in i) a.setRequestHeader(u, i[u]);
} catch (f) {}
a.send(n.hasContent && n.data || null), r = function(e, i) {
var u, f, l, c, h;
try {
if (r && (i || a.readyState === 4)) {
r = t, o && (a.onreadystatechange = Y.noop, Vn && delete Xn[o]);
if (i) a.readyState !== 4 && a.abort(); else {
u = a.status, l = a.getAllResponseHeaders(), c = {}, h = a.responseXML, h && h.documentElement && (c.xml = h);
try {
c.text = a.responseText;
} catch (p) {}
try {
f = a.statusText;
} catch (p) {
f = "";
}
!u && n.isLocal && !n.crossDomain ? u = c.text ? 200 : 404 : u === 1223 && (u = 204);
}
}
} catch (d) {
i || s(-1, d);
}
c && s(u, f, c, l);
}, n.async ? a.readyState === 4 ? setTimeout(r, 0) : (o = ++$n, Vn && (Xn || (Xn = {}, Y(e).unload(Vn)), Xn[o] = r), a.onreadystatechange = r) : r();
},
abort: function() {
r && r(0, 1);
}
};
}
});
var Jn, Kn, Qn = /^(?:toggle|show|hide)$/, Gn = new RegExp("^(?:([-+])=|)(" + Z + ")([a-z%]*)$", "i"), Yn = /queueHooks$/, Zn = [ H ], er = {
"*": [ function(e, t) {
var n, r, i = this.createTween(e, t), s = Gn.exec(t), o = i.cur(), u = +o || 0, a = 1, f = 20;
if (s) {
n = +s[2], r = s[3] || (Y.cssNumber[e] ? "" : "px");
if (r !== "px" && u) {
u = Y.css(i.elem, e, !0) || n || 1;
do a = a || ".5", u /= a, Y.style(i.elem, e, u + r); while (a !== (a = i.cur() / o) && a !== 1 && --f);
}
i.unit = r, i.start = u, i.end = s[1] ? u + (s[1] + 1) * n : n;
}
return i;
} ]
};
Y.Animation = Y.extend(D, {
tweener: function(e, t) {
Y.isFunction(e) ? (t = e, e = [ "*" ]) : e = e.split(" ");
var n, r = 0, i = e.length;
for (; r < i; r++) n = e[r], er[n] = er[n] || [], er[n].unshift(t);
},
prefilter: function(e, t) {
t ? Zn.unshift(e) : Zn.push(e);
}
}), Y.Tween = B, B.prototype = {
constructor: B,
init: function(e, t, n, r, i, s) {
this.elem = e, this.prop = n, this.easing = i || "swing", this.options = t, this.start = this.now = this.cur(), this.end = r, this.unit = s || (Y.cssNumber[n] ? "" : "px");
},
cur: function() {
var e = B.propHooks[this.prop];
return e && e.get ? e.get(this) : B.propHooks._default.get(this);
},
run: function(e) {
var t, n = B.propHooks[this.prop];
return this.options.duration ? this.pos = t = Y.easing[this.easing](e, this.options.duration * e, 0, 1, this.options.duration) : this.pos = t = e, this.now = (this.end - this.start) * t + this.start, this.options.step && this.options.step.call(this.elem, this.now, this), n && n.set ? n.set(this) : B.propHooks._default.set(this), this;
}
}, B.prototype.init.prototype = B.prototype, B.propHooks = {
_default: {
get: function(e) {
var t;
return e.elem[e.prop] == null || !!e.elem.style && e.elem.style[e.prop] != null ? (t = Y.css(e.elem, e.prop, !1, ""), !t || t === "auto" ? 0 : t) : e.elem[e.prop];
},
set: function(e) {
Y.fx.step[e.prop] ? Y.fx.step[e.prop](e) : e.elem.style && (e.elem.style[Y.cssProps[e.prop]] != null || Y.cssHooks[e.prop]) ? Y.style(e.elem, e.prop, e.now + e.unit) : e.elem[e.prop] = e.now;
}
}
}, B.propHooks.scrollTop = B.propHooks.scrollLeft = {
set: function(e) {
e.elem.nodeType && e.elem.parentNode && (e.elem[e.prop] = e.now);
}
}, Y.each([ "toggle", "show", "hide" ], function(e, t) {
var n = Y.fn[t];
Y.fn[t] = function(r, i, s) {
return r == null || typeof r == "boolean" || !e && Y.isFunction(r) && Y.isFunction(i) ? n.apply(this, arguments) : this.animate(j(t, !0), r, i, s);
};
}), Y.fn.extend({
fadeTo: function(e, t, n, r) {
return this.filter(g).css("opacity", 0).show().end().animate({
opacity: t
}, e, n, r);
},
animate: function(e, t, n, r) {
var i = Y.isEmptyObject(e), s = Y.speed(t, n, r), o = function() {
var t = D(this, Y.extend({}, e), s);
i && t.stop(!0);
};
return i || s.queue === !1 ? this.each(o) : this.queue(s.queue, o);
},
stop: function(e, n, r) {
var i = function(e) {
var t = e.stop;
delete e.stop, t(r);
};
return typeof e != "string" && (r = n, n = e, e = t), n && e !== !1 && this.queue(e || "fx", []), this.each(function() {
var t = !0, n = e != null && e + "queueHooks", s = Y.timers, o = Y._data(this);
if (n) o[n] && o[n].stop && i(o[n]); else for (n in o) o[n] && o[n].stop && Yn.test(n) && i(o[n]);
for (n = s.length; n--; ) s[n].elem === this && (e == null || s[n].queue === e) && (s[n].anim.stop(r), t = !1, s.splice(n, 1));
(t || !r) && Y.dequeue(this, e);
});
}
}), Y.each({
slideDown: j("show"),
slideUp: j("hide"),
slideToggle: j("toggle"),
fadeIn: {
opacity: "show"
},
fadeOut: {
opacity: "hide"
},
fadeToggle: {
opacity: "toggle"
}
}, function(e, t) {
Y.fn[e] = function(e, n, r) {
return this.animate(t, e, n, r);
};
}), Y.speed = function(e, t, n) {
var r = e && typeof e == "object" ? Y.extend({}, e) : {
complete: n || !n && t || Y.isFunction(e) && e,
duration: e,
easing: n && t || t && !Y.isFunction(t) && t
};
r.duration = Y.fx.off ? 0 : typeof r.duration == "number" ? r.duration : r.duration in Y.fx.speeds ? Y.fx.speeds[r.duration] : Y.fx.speeds._default;
if (r.queue == null || r.queue === !0) r.queue = "fx";
return r.old = r.complete, r.complete = function() {
Y.isFunction(r.old) && r.old.call(this), r.queue && Y.dequeue(this, r.queue);
}, r;
}, Y.easing = {
linear: function(e) {
return e;
},
swing: function(e) {
return .5 - Math.cos(e * Math.PI) / 2;
}
}, Y.timers = [], Y.fx = B.prototype.init, Y.fx.tick = function() {
var e, n = Y.timers, r = 0;
Jn = Y.now();
for (; r < n.length; r++) e = n[r], !e() && n[r] === e && n.splice(r--, 1);
n.length || Y.fx.stop(), Jn = t;
}, Y.fx.timer = function(e) {
e() && Y.timers.push(e) && !Kn && (Kn = setInterval(Y.fx.tick, Y.fx.interval));
}, Y.fx.interval = 13, Y.fx.stop = function() {
clearInterval(Kn), Kn = null;
}, Y.fx.speeds = {
slow: 600,
fast: 200,
_default: 400
}, Y.fx.step = {}, Y.expr && Y.expr.filters && (Y.expr.filters.animated = function(e) {
return Y.grep(Y.timers, function(t) {
return e === t.elem;
}).length;
});
var tr = /^(?:body|html)$/i;
Y.fn.offset = function(e) {
if (arguments.length) return e === t ? this : this.each(function(t) {
Y.offset.setOffset(this, e, t);
});
var n, r, i, s, o, u, a, f = {
top: 0,
left: 0
}, l = this[0], c = l && l.ownerDocument;
if (!c) return;
return (r = c.body) === l ? Y.offset.bodyOffset(l) : (n = c.documentElement, Y.contains(n, l) ? (typeof l.getBoundingClientRect != "undefined" && (f = l.getBoundingClientRect()), i = F(c), s = n.clientTop || r.clientTop || 0, o = n.clientLeft || r.clientLeft || 0, u = i.pageYOffset || n.scrollTop, a = i.pageXOffset || n.scrollLeft, {
top: f.top + u - s,
left: f.left + a - o
}) : f);
}, Y.offset = {
bodyOffset: function(e) {
var t = e.offsetTop, n = e.offsetLeft;
return Y.support.doesNotIncludeMarginInBodyOffset && (t += parseFloat(Y.css(e, "marginTop")) || 0, n += parseFloat(Y.css(e, "marginLeft")) || 0), {
top: t,
left: n
};
},
setOffset: function(e, t, n) {
var r = Y.css(e, "position");
r === "static" && (e.style.position = "relative");
var i = Y(e), s = i.offset(), o = Y.css(e, "top"), u = Y.css(e, "left"), a = (r === "absolute" || r === "fixed") && Y.inArray("auto", [ o, u ]) > -1, f = {}, l = {}, c, h;
a ? (l = i.position(), c = l.top, h = l.left) : (c = parseFloat(o) || 0, h = parseFloat(u) || 0), Y.isFunction(t) && (t = t.call(e, n, s)), t.top != null && (f.top = t.top - s.top + c), t.left != null && (f.left = t.left - s.left + h), "using" in t ? t.using.call(e, f) : i.css(f);
}
}, Y.fn.extend({
position: function() {
if (!this[0]) return;
var e = this[0], t = this.offsetParent(), n = this.offset(), r = tr.test(t[0].nodeName) ? {
top: 0,
left: 0
} : t.offset();
return n.top -= parseFloat(Y.css(e, "marginTop")) || 0, n.left -= parseFloat(Y.css(e, "marginLeft")) || 0, r.top += parseFloat(Y.css(t[0], "borderTopWidth")) || 0, r.left += parseFloat(Y.css(t[0], "borderLeftWidth")) || 0, {
top: n.top - r.top,
left: n.left - r.left
};
},
offsetParent: function() {
return this.map(function() {
var e = this.offsetParent || R.body;
while (e && !tr.test(e.nodeName) && Y.css(e, "position") === "static") e = e.offsetParent;
return e || R.body;
});
}
}), Y.each({
scrollLeft: "pageXOffset",
scrollTop: "pageYOffset"
}, function(e, n) {
var r = /Y/.test(n);
Y.fn[e] = function(i) {
return Y.access(this, function(e, i, s) {
var o = F(e);
if (s === t) return o ? n in o ? o[n] : o.document.documentElement[i] : e[i];
o ? o.scrollTo(r ? Y(o).scrollLeft() : s, r ? s : Y(o).scrollTop()) : e[i] = s;
}, e, i, arguments.length, null);
};
}), Y.each({
Height: "height",
Width: "width"
}, function(e, n) {
Y.each({
padding: "inner" + e,
content: n,
"": "outer" + e
}, function(r, i) {
Y.fn[i] = function(i, s) {
var o = arguments.length && (r || typeof i != "boolean"), u = r || (i === !0 || s === !0 ? "margin" : "border");
return Y.access(this, function(n, r, i) {
var s;
return Y.isWindow(n) ? n.document.documentElement["client" + e] : n.nodeType === 9 ? (s = n.documentElement, Math.max(n.body["scroll" + e], s["scroll" + e], n.body["offset" + e], s["offset" + e], s["client" + e])) : i === t ? Y.css(n, r, i, u) : Y.style(n, r, i, u);
}, n, o ? i : t, o, null);
};
});
}), e.jQuery = e.$ = Y, typeof define == "function" && define.amd && define.amd.jQuery && define("jquery", [], function() {
return Y;
});
})(window);

// foss/underscore/underscore.js

(function() {
var e = this, t = e._, n = {}, r = Array.prototype, i = Object.prototype, s = Function.prototype, o = r.push, u = r.slice, a = r.concat, f = i.toString, l = i.hasOwnProperty, c = r.forEach, h = r.map, p = r.reduce, d = r.reduceRight, v = r.filter, m = r.every, g = r.some, y = r.indexOf, b = r.lastIndexOf, w = Array.isArray, E = Object.keys, S = s.bind, x = function(e) {
if (e instanceof x) return e;
if (!(this instanceof x)) return new x(e);
this._wrapped = e;
};
typeof exports != "undefined" ? (typeof module != "undefined" && module.exports && (exports = module.exports = x), exports._ = x) : e._ = x, x.VERSION = "1.4.3";
var T = x.each = x.forEach = function(e, t, r) {
if (e == null) return;
if (c && e.forEach === c) e.forEach(t, r); else if (e.length === +e.length) {
for (var i = 0, s = e.length; i < s; i++) if (t.call(r, e[i], i, e) === n) return;
} else for (var o in e) if (x.has(e, o) && t.call(r, e[o], o, e) === n) return;
};
x.map = x.collect = function(e, t, n) {
var r = [];
return e == null ? r : h && e.map === h ? e.map(t, n) : (T(e, function(e, i, s) {
r[r.length] = t.call(n, e, i, s);
}), r);
};
var N = "Reduce of empty array with no initial value";
x.reduce = x.foldl = x.inject = function(e, t, n, r) {
var i = arguments.length > 2;
e == null && (e = []);
if (p && e.reduce === p) return r && (t = x.bind(t, r)), i ? e.reduce(t, n) : e.reduce(t);
T(e, function(e, s, o) {
i ? n = t.call(r, n, e, s, o) : (n = e, i = !0);
});
if (!i) throw new TypeError(N);
return n;
}, x.reduceRight = x.foldr = function(e, t, n, r) {
var i = arguments.length > 2;
e == null && (e = []);
if (d && e.reduceRight === d) return r && (t = x.bind(t, r)), i ? e.reduceRight(t, n) : e.reduceRight(t);
var s = e.length;
if (s !== +s) {
var o = x.keys(e);
s = o.length;
}
T(e, function(u, a, f) {
a = o ? o[--s] : --s, i ? n = t.call(r, n, e[a], a, f) : (n = e[a], i = !0);
});
if (!i) throw new TypeError(N);
return n;
}, x.find = x.detect = function(e, t, n) {
var r;
return C(e, function(e, i, s) {
if (t.call(n, e, i, s)) return r = e, !0;
}), r;
}, x.filter = x.select = function(e, t, n) {
var r = [];
return e == null ? r : v && e.filter === v ? e.filter(t, n) : (T(e, function(e, i, s) {
t.call(n, e, i, s) && (r[r.length] = e);
}), r);
}, x.reject = function(e, t, n) {
return x.filter(e, function(e, r, i) {
return !t.call(n, e, r, i);
}, n);
}, x.every = x.all = function(e, t, r) {
t || (t = x.identity);
var i = !0;
return e == null ? i : m && e.every === m ? e.every(t, r) : (T(e, function(e, s, o) {
if (!(i = i && t.call(r, e, s, o))) return n;
}), !!i);
};
var C = x.some = x.any = function(e, t, r) {
t || (t = x.identity);
var i = !1;
return e == null ? i : g && e.some === g ? e.some(t, r) : (T(e, function(e, s, o) {
if (i || (i = t.call(r, e, s, o))) return n;
}), !!i);
};
x.contains = x.include = function(e, t) {
return e == null ? !1 : y && e.indexOf === y ? e.indexOf(t) != -1 : C(e, function(e) {
return e === t;
});
}, x.invoke = function(e, t) {
var n = u.call(arguments, 2), r = x.isFunction(t);
return x.map(e, function(e) {
return (r ? t : e[t]).apply(e, n);
});
}, x.pluck = function(e, t) {
return x.map(e, function(e) {
return e[t];
});
}, x.where = function(e, t) {
return x.isEmpty(t) ? [] : x.filter(e, function(e) {
for (var n in t) if (t[n] !== e[n]) return !1;
return !0;
});
}, x.max = function(e, t, n) {
if (!t && x.isArray(e) && e[0] === +e[0] && e.length < 65535) return Math.max.apply(Math, e);
if (!t && x.isEmpty(e)) return -Infinity;
var r = {
computed: -Infinity,
value: -Infinity
};
return T(e, function(e, i, s) {
var o = t ? t.call(n, e, i, s) : e;
o >= r.computed && (r = {
value: e,
computed: o
});
}), r.value;
}, x.min = function(e, t, n) {
if (!t && x.isArray(e) && e[0] === +e[0] && e.length < 65535) return Math.min.apply(Math, e);
if (!t && x.isEmpty(e)) return Infinity;
var r = {
computed: Infinity,
value: Infinity
};
return T(e, function(e, i, s) {
var o = t ? t.call(n, e, i, s) : e;
o < r.computed && (r = {
value: e,
computed: o
});
}), r.value;
}, x.shuffle = function(e) {
var t, n = 0, r = [];
return T(e, function(e) {
t = x.random(n++), r[n - 1] = r[t], r[t] = e;
}), r;
};
var k = function(e) {
return x.isFunction(e) ? e : function(t) {
return t[e];
};
};
x.sortBy = function(e, t, n) {
var r = k(t);
return x.pluck(x.map(e, function(e, t, i) {
return {
value: e,
index: t,
criteria: r.call(n, e, t, i)
};
}).sort(function(e, t) {
var n = e.criteria, r = t.criteria;
if (n !== r) {
if (n > r || n === void 0) return 1;
if (n < r || r === void 0) return -1;
}
return e.index < t.index ? -1 : 1;
}), "value");
};
var L = function(e, t, n, r) {
var i = {}, s = k(t || x.identity);
return T(e, function(t, o) {
var u = s.call(n, t, o, e);
r(i, u, t);
}), i;
};
x.groupBy = function(e, t, n) {
return L(e, t, n, function(e, t, n) {
(x.has(e, t) ? e[t] : e[t] = []).push(n);
});
}, x.countBy = function(e, t, n) {
return L(e, t, n, function(e, t) {
x.has(e, t) || (e[t] = 0), e[t]++;
});
}, x.sortedIndex = function(e, t, n, r) {
n = n == null ? x.identity : k(n);
var i = n.call(r, t), s = 0, o = e.length;
while (s < o) {
var u = s + o >>> 1;
n.call(r, e[u]) < i ? s = u + 1 : o = u;
}
return s;
}, x.toArray = function(e) {
return e ? x.isArray(e) ? u.call(e) : e.length === +e.length ? x.map(e, x.identity) : x.values(e) : [];
}, x.size = function(e) {
return e == null ? 0 : e.length === +e.length ? e.length : x.keys(e).length;
}, x.first = x.head = x.take = function(e, t, n) {
return e == null ? void 0 : t != null && !n ? u.call(e, 0, t) : e[0];
}, x.initial = function(e, t, n) {
return u.call(e, 0, e.length - (t == null || n ? 1 : t));
}, x.last = function(e, t, n) {
return e == null ? void 0 : t != null && !n ? u.call(e, Math.max(e.length - t, 0)) : e[e.length - 1];
}, x.rest = x.tail = x.drop = function(e, t, n) {
return u.call(e, t == null || n ? 1 : t);
}, x.compact = function(e) {
return x.filter(e, x.identity);
};
var A = function(e, t, n) {
return T(e, function(e) {
x.isArray(e) ? t ? o.apply(n, e) : A(e, t, n) : n.push(e);
}), n;
};
x.flatten = function(e, t) {
return A(e, t, []);
}, x.without = function(e) {
return x.difference(e, u.call(arguments, 1));
}, x.uniq = x.unique = function(e, t, n, r) {
x.isFunction(t) && (r = n, n = t, t = !1);
var i = n ? x.map(e, n, r) : e, s = [], o = [];
return T(i, function(n, r) {
if (t ? !r || o[o.length - 1] !== n : !x.contains(o, n)) o.push(n), s.push(e[r]);
}), s;
}, x.union = function() {
return x.uniq(a.apply(r, arguments));
}, x.intersection = function(e) {
var t = u.call(arguments, 1);
return x.filter(x.uniq(e), function(e) {
return x.every(t, function(t) {
return x.indexOf(t, e) >= 0;
});
});
}, x.difference = function(e) {
var t = a.apply(r, u.call(arguments, 1));
return x.filter(e, function(e) {
return !x.contains(t, e);
});
}, x.zip = function() {
var e = u.call(arguments), t = x.max(x.pluck(e, "length")), n = new Array(t);
for (var r = 0; r < t; r++) n[r] = x.pluck(e, "" + r);
return n;
}, x.object = function(e, t) {
if (e == null) return {};
var n = {};
for (var r = 0, i = e.length; r < i; r++) t ? n[e[r]] = t[r] : n[e[r][0]] = e[r][1];
return n;
}, x.indexOf = function(e, t, n) {
if (e == null) return -1;
var r = 0, i = e.length;
if (n) {
if (typeof n != "number") return r = x.sortedIndex(e, t), e[r] === t ? r : -1;
r = n < 0 ? Math.max(0, i + n) : n;
}
if (y && e.indexOf === y) return e.indexOf(t, n);
for (; r < i; r++) if (e[r] === t) return r;
return -1;
}, x.lastIndexOf = function(e, t, n) {
if (e == null) return -1;
var r = n != null;
if (b && e.lastIndexOf === b) return r ? e.lastIndexOf(t, n) : e.lastIndexOf(t);
var i = r ? n : e.length;
while (i--) if (e[i] === t) return i;
return -1;
}, x.range = function(e, t, n) {
arguments.length <= 1 && (t = e || 0, e = 0), n = arguments[2] || 1;
var r = Math.max(Math.ceil((t - e) / n), 0), i = 0, s = new Array(r);
while (i < r) s[i++] = e, e += n;
return s;
};
var O = function() {};
x.bind = function(e, t) {
var n, r;
if (e.bind === S && S) return S.apply(e, u.call(arguments, 1));
if (!x.isFunction(e)) throw new TypeError;
return n = u.call(arguments, 2), r = function() {
if (this instanceof r) {
O.prototype = e.prototype;
var i = new O;
O.prototype = null;
var s = e.apply(i, n.concat(u.call(arguments)));
return Object(s) === s ? s : i;
}
return e.apply(t, n.concat(u.call(arguments)));
};
}, x.bindAll = function(e) {
var t = u.call(arguments, 1);
return t.length === 0 && (t = x.functions(e)), T(t, function(t) {
e[t] = x.bind(e[t], e);
}), e;
}, x.memoize = function(e, t) {
var n = {};
return t || (t = x.identity), function() {
var r = t.apply(this, arguments);
return x.has(n, r) ? n[r] : n[r] = e.apply(this, arguments);
};
}, x.delay = function(e, t) {
var n = u.call(arguments, 2);
return setTimeout(function() {
return e.apply(null, n);
}, t);
}, x.defer = function(e) {
return x.delay.apply(x, [ e, 1 ].concat(u.call(arguments, 1)));
}, x.throttle = function(e, t) {
var n, r, i, s, o = 0, u = function() {
o = new Date, i = null, s = e.apply(n, r);
};
return function() {
var a = new Date, f = t - (a - o);
return n = this, r = arguments, f <= 0 ? (clearTimeout(i), i = null, o = a, s = e.apply(n, r)) : i || (i = setTimeout(u, f)), s;
};
}, x.debounce = function(e, t, n) {
var r, i;
return function() {
var s = this, o = arguments, u = function() {
r = null, n || (i = e.apply(s, o));
}, a = n && !r;
return clearTimeout(r), r = setTimeout(u, t), a && (i = e.apply(s, o)), i;
};
}, x.once = function(e) {
var t = !1, n;
return function() {
return t ? n : (t = !0, n = e.apply(this, arguments), e = null, n);
};
}, x.wrap = function(e, t) {
return function() {
var n = [ e ];
return o.apply(n, arguments), t.apply(this, n);
};
}, x.compose = function() {
var e = arguments;
return function() {
var t = arguments;
for (var n = e.length - 1; n >= 0; n--) t = [ e[n].apply(this, t) ];
return t[0];
};
}, x.after = function(e, t) {
return e <= 0 ? t() : function() {
if (--e < 1) return t.apply(this, arguments);
};
}, x.keys = E || function(e) {
if (e !== Object(e)) throw new TypeError("Invalid object");
var t = [];
for (var n in e) x.has(e, n) && (t[t.length] = n);
return t;
}, x.values = function(e) {
var t = [];
for (var n in e) x.has(e, n) && t.push(e[n]);
return t;
}, x.pairs = function(e) {
var t = [];
for (var n in e) x.has(e, n) && t.push([ n, e[n] ]);
return t;
}, x.invert = function(e) {
var t = {};
for (var n in e) x.has(e, n) && (t[e[n]] = n);
return t;
}, x.functions = x.methods = function(e) {
var t = [];
for (var n in e) x.isFunction(e[n]) && t.push(n);
return t.sort();
}, x.extend = function(e) {
return T(u.call(arguments, 1), function(t) {
if (t) for (var n in t) e[n] = t[n];
}), e;
}, x.pick = function(e) {
var t = {}, n = a.apply(r, u.call(arguments, 1));
return T(n, function(n) {
n in e && (t[n] = e[n]);
}), t;
}, x.omit = function(e) {
var t = {}, n = a.apply(r, u.call(arguments, 1));
for (var i in e) x.contains(n, i) || (t[i] = e[i]);
return t;
}, x.defaults = function(e) {
return T(u.call(arguments, 1), function(t) {
if (t) for (var n in t) e[n] == null && (e[n] = t[n]);
}), e;
}, x.clone = function(e) {
return x.isObject(e) ? x.isArray(e) ? e.slice() : x.extend({}, e) : e;
}, x.tap = function(e, t) {
return t(e), e;
};
var M = function(e, t, n, r) {
if (e === t) return e !== 0 || 1 / e == 1 / t;
if (e == null || t == null) return e === t;
e instanceof x && (e = e._wrapped), t instanceof x && (t = t._wrapped);
var i = f.call(e);
if (i != f.call(t)) return !1;
switch (i) {
case "[object String]":
return e == String(t);
case "[object Number]":
return e != +e ? t != +t : e == 0 ? 1 / e == 1 / t : e == +t;
case "[object Date]":
case "[object Boolean]":
return +e == +t;
case "[object RegExp]":
return e.source == t.source && e.global == t.global && e.multiline == t.multiline && e.ignoreCase == t.ignoreCase;
}
if (typeof e != "object" || typeof t != "object") return !1;
var s = n.length;
while (s--) if (n[s] == e) return r[s] == t;
n.push(e), r.push(t);
var o = 0, u = !0;
if (i == "[object Array]") {
o = e.length, u = o == t.length;
if (u) while (o--) if (!(u = M(e[o], t[o], n, r))) break;
} else {
var a = e.constructor, l = t.constructor;
if (a !== l && !(x.isFunction(a) && a instanceof a && x.isFunction(l) && l instanceof l)) return !1;
for (var c in e) if (x.has(e, c)) {
o++;
if (!(u = x.has(t, c) && M(e[c], t[c], n, r))) break;
}
if (u) {
for (c in t) if (x.has(t, c) && !(o--)) break;
u = !o;
}
}
return n.pop(), r.pop(), u;
};
x.isEqual = function(e, t) {
return M(e, t, [], []);
}, x.isEmpty = function(e) {
if (e == null) return !0;
if (x.isArray(e) || x.isString(e)) return e.length === 0;
for (var t in e) if (x.has(e, t)) return !1;
return !0;
}, x.isElement = function(e) {
return !!e && e.nodeType === 1;
}, x.isArray = w || function(e) {
return f.call(e) == "[object Array]";
}, x.isObject = function(e) {
return e === Object(e);
}, T([ "Arguments", "Function", "String", "Number", "Date", "RegExp" ], function(e) {
x["is" + e] = function(t) {
return f.call(t) == "[object " + e + "]";
};
}), x.isArguments(arguments) || (x.isArguments = function(e) {
return !!e && !!x.has(e, "callee");
}), typeof /./ != "function" && (x.isFunction = function(e) {
return typeof e == "function";
}), x.isFinite = function(e) {
return isFinite(e) && !isNaN(parseFloat(e));
}, x.isNaN = function(e) {
return x.isNumber(e) && e != +e;
}, x.isBoolean = function(e) {
return e === !0 || e === !1 || f.call(e) == "[object Boolean]";
}, x.isNull = function(e) {
return e === null;
}, x.isUndefined = function(e) {
return e === void 0;
}, x.has = function(e, t) {
return l.call(e, t);
}, x.noConflict = function() {
return e._ = t, this;
}, x.identity = function(e) {
return e;
}, x.times = function(e, t, n) {
var r = Array(e);
for (var i = 0; i < e; i++) r[i] = t.call(n, i);
return r;
}, x.random = function(e, t) {
return t == null && (t = e, e = 0), e + Math.floor(Math.random() * (t - e + 1));
};
var _ = {
escape: {
"&": "&amp;",
"<": "&lt;",
">": "&gt;",
'"': "&quot;",
"'": "&#x27;",
"/": "&#x2F;"
}
};
_.unescape = x.invert(_.escape);
var D = {
escape: new RegExp("[" + x.keys(_.escape).join("") + "]", "g"),
unescape: new RegExp("(" + x.keys(_.unescape).join("|") + ")", "g")
};
x.each([ "escape", "unescape" ], function(e) {
x[e] = function(t) {
return t == null ? "" : ("" + t).replace(D[e], function(t) {
return _[e][t];
});
};
}), x.result = function(e, t) {
if (e == null) return null;
var n = e[t];
return x.isFunction(n) ? n.call(e) : n;
}, x.mixin = function(e) {
T(x.functions(e), function(t) {
var n = x[t] = e[t];
x.prototype[t] = function() {
var e = [ this._wrapped ];
return o.apply(e, arguments), F.call(this, n.apply(x, e));
};
});
};
var P = 0;
x.uniqueId = function(e) {
var t = ++P + "";
return e ? e + t : t;
}, x.templateSettings = {
evaluate: /<%([\s\S]+?)%>/g,
interpolate: /<%=([\s\S]+?)%>/g,
escape: /<%-([\s\S]+?)%>/g
};
var H = /(.)^/, B = {
"'": "'",
"\\": "\\",
"\r": "r",
"\n": "n",
"	": "t",
"\u2028": "u2028",
"\u2029": "u2029"
}, j = /\\|'|\r|\n|\t|\u2028|\u2029/g;
x.template = function(e, t, n) {
var r;
n = x.defaults({}, n, x.templateSettings);
var i = new RegExp([ (n.escape || H).source, (n.interpolate || H).source, (n.evaluate || H).source ].join("|") + "|$", "g"), s = 0, o = "__p+='";
e.replace(i, function(t, n, r, i, u) {
return o += e.slice(s, u).replace(j, function(e) {
return "\\" + B[e];
}), n && (o += "'+\n((__t=(" + n + "))==null?'':_.escape(__t))+\n'"), r && (o += "'+\n((__t=(" + r + "))==null?'':__t)+\n'"), i && (o += "';\n" + i + "\n__p+='"), s = u + t.length, t;
}), o += "';\n", n.variable || (o = "with(obj||{}){\n" + o + "}\n"), o = "var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n" + o + "return __p;\n";
try {
r = new Function(n.variable || "obj", "_", o);
} catch (u) {
throw u.source = o, u;
}
if (t) return r(t, x);
var a = function(e) {
return r.call(this, e, x);
};
return a.source = "function(" + (n.variable || "obj") + "){\n" + o + "}", a;
}, x.chain = function(e) {
return x(e).chain();
};
var F = function(e) {
return this._chain ? x(e).chain() : e;
};
x.mixin(x), T([ "pop", "push", "reverse", "shift", "sort", "splice", "unshift" ], function(e) {
var t = r[e];
x.prototype[e] = function() {
var n = this._wrapped;
return t.apply(n, arguments), (e == "shift" || e == "splice") && n.length === 0 && delete n[0], F.call(this, n);
};
}), T([ "concat", "join", "slice" ], function(e) {
var t = r[e];
x.prototype[e] = function() {
return F.call(this, t.apply(this._wrapped, arguments));
};
}), x.extend(x.prototype, {
chain: function() {
return this._chain = !0, this;
},
value: function() {
return this._wrapped;
}
});
}).call(this);

// foss/backbone/backbone.js

(function() {
var e = this, t = e.Backbone, n = [], r = n.push, i = n.slice, s = n.splice, o;
typeof exports != "undefined" ? o = exports : o = e.Backbone = {}, o.VERSION = "0.9.9";
var u = e._;
!u && typeof require != "undefined" && (u = require("underscore")), o.$ = e.jQuery || e.Zepto || e.ender, o.noConflict = function() {
return e.Backbone = t, this;
}, o.emulateHTTP = !1, o.emulateJSON = !1;
var a = /\s+/, f = function(e, t, n, r) {
if (!n) return !0;
if (typeof n == "object") for (var i in n) e[t].apply(e, [ i, n[i] ].concat(r)); else {
if (!a.test(n)) return !0;
var s = n.split(a);
for (var o = 0, u = s.length; o < u; o++) e[t].apply(e, [ s[o] ].concat(r));
}
}, l = function(e, t, n) {
var r, i = -1, s = t.length;
switch (n.length) {
case 0:
while (++i < s) (r = t[i]).callback.call(r.ctx);
return;
case 1:
while (++i < s) (r = t[i]).callback.call(r.ctx, n[0]);
return;
case 2:
while (++i < s) (r = t[i]).callback.call(r.ctx, n[0], n[1]);
return;
case 3:
while (++i < s) (r = t[i]).callback.call(r.ctx, n[0], n[1], n[2]);
return;
default:
while (++i < s) (r = t[i]).callback.apply(r.ctx, n);
}
}, c = o.Events = {
on: function(e, t, n) {
if (!f(this, "on", e, [ t, n ]) || !t) return this;
this._events || (this._events = {});
var r = this._events[e] || (this._events[e] = []);
return r.push({
callback: t,
context: n,
ctx: n || this
}), this;
},
once: function(e, t, n) {
if (!f(this, "once", e, [ t, n ]) || !t) return this;
var r = this, i = u.once(function() {
r.off(e, i), t.apply(this, arguments);
});
return i._callback = t, this.on(e, i, n), this;
},
off: function(e, t, n) {
var r, i, s, o, a, l, c, h;
if (!this._events || !f(this, "off", e, [ t, n ])) return this;
if (!e && !t && !n) return this._events = {}, this;
o = e ? [ e ] : u.keys(this._events);
for (a = 0, l = o.length; a < l; a++) {
e = o[a];
if (r = this._events[e]) {
s = [];
if (t || n) for (c = 0, h = r.length; c < h; c++) i = r[c], (t && t !== i.callback && t !== i.callback._callback || n && n !== i.context) && s.push(i);
this._events[e] = s;
}
}
return this;
},
trigger: function(e) {
if (!this._events) return this;
var t = i.call(arguments, 1);
if (!f(this, "trigger", e, t)) return this;
var n = this._events[e], r = this._events.all;
return n && l(this, n, t), r && l(this, r, arguments), this;
},
listenTo: function(e, t, n) {
var r = this._listeners || (this._listeners = {}), i = e._listenerId || (e._listenerId = u.uniqueId("l"));
return r[i] = e, e.on(t, n || this, this), this;
},
stopListening: function(e, t, n) {
var r = this._listeners;
if (!r) return;
if (e) e.off(t, n, this), !t && !n && delete r[e._listenerId]; else {
for (var i in r) r[i].off(null, null, this);
this._listeners = {};
}
return this;
}
};
c.bind = c.on, c.unbind = c.off, u.extend(o, c);
var h = o.Model = function(e, t) {
var n, r = e || {};
this.cid = u.uniqueId("c"), this.attributes = {}, t && t.collection && (this.collection = t.collection), t && t.parse && (r = this.parse(r, t) || {});
if (n = u.result(this, "defaults")) r = u.defaults({}, r, n);
this.set(r, t), this.changed = {}, this.initialize.apply(this, arguments);
};
u.extend(h.prototype, c, {
changed: null,
idAttribute: "id",
initialize: function() {},
toJSON: function(e) {
return u.clone(this.attributes);
},
sync: function() {
return o.sync.apply(this, arguments);
},
get: function(e) {
return this.attributes[e];
},
escape: function(e) {
return u.escape(this.get(e));
},
has: function(e) {
return this.get(e) != null;
},
set: function(e, t, n) {
var r, i, s, o, a, f, l, c;
if (e == null) return this;
typeof e == "object" ? (i = e, n = t) : (i = {})[e] = t, n || (n = {});
if (!this._validate(i, n)) return !1;
s = n.unset, a = n.silent, o = [], f = this._changing, this._changing = !0, f || (this._previousAttributes = u.clone(this.attributes), this.changed = {}), c = this.attributes, l = this._previousAttributes, this.idAttribute in i && (this.id = i[this.idAttribute]);
for (r in i) t = i[r], u.isEqual(c[r], t) || o.push(r), u.isEqual(l[r], t) ? delete this.changed[r] : this.changed[r] = t, s ? delete c[r] : c[r] = t;
if (!a) {
o.length && (this._pending = !0);
for (var h = 0, p = o.length; h < p; h++) this.trigger("change:" + o[h], this, c[o[h]], n);
}
if (f) return this;
if (!a) while (this._pending) this._pending = !1, this.trigger("change", this, n);
return this._pending = !1, this._changing = !1, this;
},
unset: function(e, t) {
return this.set(e, void 0, u.extend({}, t, {
unset: !0
}));
},
clear: function(e) {
var t = {};
for (var n in this.attributes) t[n] = void 0;
return this.set(t, u.extend({}, e, {
unset: !0
}));
},
hasChanged: function(e) {
return e == null ? !u.isEmpty(this.changed) : u.has(this.changed, e);
},
changedAttributes: function(e) {
if (!e) return this.hasChanged() ? u.clone(this.changed) : !1;
var t, n = !1, r = this._changing ? this._previousAttributes : this.attributes;
for (var i in e) {
if (u.isEqual(r[i], t = e[i])) continue;
(n || (n = {}))[i] = t;
}
return n;
},
previous: function(e) {
return e == null || !this._previousAttributes ? null : this._previousAttributes[e];
},
previousAttributes: function() {
return u.clone(this._previousAttributes);
},
fetch: function(e) {
e = e ? u.clone(e) : {}, e.parse === void 0 && (e.parse = !0);
var t = e.success;
return e.success = function(e, n, r) {
if (!e.set(e.parse(n, r), r)) return !1;
t && t(e, n, r);
}, this.sync("read", this, e);
},
save: function(e, t, n) {
var r, i, s, o, a, f = this.attributes;
return e == null || typeof e == "object" ? (r = e, n = t) : (r = {})[e] = t, r && (!n || !n.wait) && !this.set(r, n) ? !1 : (n = u.extend({
validate: !0
}, n), this._validate(r, n) ? (r && n.wait && (this.attributes = u.extend({}, f, r)), s = n.success, n.success = function(e, t, n) {
e.attributes = f;
var i = e.parse(t, n);
n.wait && (i = u.extend(r || {}, i));
if (u.isObject(i) && !e.set(i, n)) return !1;
s && s(e, t, n);
}, o = this.isNew() ? "create" : n.patch ? "patch" : "update", o == "patch" && (n.attrs = r), a = this.sync(o, this, n), r && n.wait && (this.attributes = f), a) : !1);
},
destroy: function(e) {
e = e ? u.clone(e) : {};
var t = this, n = e.success, r = function() {
t.trigger("destroy", t, t.collection, e);
};
e.success = function(e, t, i) {
(i.wait || e.isNew()) && r(), n && n(e, t, i);
};
if (this.isNew()) return e.success(this, null, e), !1;
var i = this.sync("delete", this, e);
return e.wait || r(), i;
},
url: function() {
var e = u.result(this, "urlRoot") || u.result(this.collection, "url") || M();
return this.isNew() ? e : e + (e.charAt(e.length - 1) === "/" ? "" : "/") + encodeURIComponent(this.id);
},
parse: function(e, t) {
return e;
},
clone: function() {
return new this.constructor(this.attributes);
},
isNew: function() {
return this.id == null;
},
isValid: function(e) {
return !this.validate || !this.validate(this.attributes, e);
},
_validate: function(e, t) {
if (!t.validate || !this.validate) return !0;
e = u.extend({}, this.attributes, e);
var n = this.validationError = this.validate(e, t) || null;
return n ? (this.trigger("invalid", this, n, t || {}), !1) : !0;
}
});
var p = o.Collection = function(e, t) {
t || (t = {}), t.model && (this.model = t.model), t.comparator !== void 0 && (this.comparator = t.comparator), this._reset(), this.initialize.apply(this, arguments), e && this.reset(e, u.extend({
silent: !0
}, t));
};
u.extend(p.prototype, c, {
model: h,
initialize: function() {},
toJSON: function(e) {
return this.map(function(t) {
return t.toJSON(e);
});
},
sync: function() {
return o.sync.apply(this, arguments);
},
add: function(e, t) {
e = u.isArray(e) ? e.slice() : [ e ], t || (t = {});
var n, i, o, a, f, l, c, h, p, d;
d = [], p = t.at, l = this.comparator && p == null && (t.sort == null || t.sort), h = u.isString(this.comparator) ? this.comparator : null;
for (n = 0, i = e.length; n < i; n++) {
a = e[n];
if (!(o = this._prepareModel(a, t))) {
this.trigger("invalid", this, a, t);
continue;
}
e[n] = o;
if (f = this.get(o)) {
t.merge && (f.set(a === o ? o.attributes : a, t), l && !c && f.hasChanged(h) && (c = !0));
continue;
}
d.push(o), o.on("all", this._onModelEvent, this), this._byId[o.cid] = o, o.id != null && (this._byId[o.id] = o);
}
d.length && (l && (c = !0), this.length += d.length, p != null ? s.apply(this.models, [ p, 0 ].concat(d)) : r.apply(this.models, d)), c && this.sort({
silent: !0
});
if (t.silent) return this;
for (n = 0, i = d.length; n < i; n++) (o = d[n]).trigger("add", o, this, t);
return c && this.trigger("sort", this, t), this;
},
remove: function(e, t) {
e = u.isArray(e) ? e.slice() : [ e ], t || (t = {});
var n, r, i, s;
for (n = 0, r = e.length; n < r; n++) {
s = this.get(e[n]);
if (!s) continue;
delete this._byId[s.id], delete this._byId[s.cid], i = this.indexOf(s), this.models.splice(i, 1), this.length--, t.silent || (t.index = i, s.trigger("remove", s, this, t)), this._removeReference(s);
}
return this;
},
push: function(e, t) {
return e = this._prepareModel(e, t), this.add(e, u.extend({
at: this.length
}, t)), e;
},
pop: function(e) {
var t = this.at(this.length - 1);
return this.remove(t, e), t;
},
unshift: function(e, t) {
return e = this._prepareModel(e, t), this.add(e, u.extend({
at: 0
}, t)), e;
},
shift: function(e) {
var t = this.at(0);
return this.remove(t, e), t;
},
slice: function(e, t) {
return this.models.slice(e, t);
},
get: function(e) {
return e == null ? void 0 : (this._idAttr || (this._idAttr = this.model.prototype.idAttribute), this._byId[e.id || e.cid || e[this._idAttr] || e]);
},
at: function(e) {
return this.models[e];
},
where: function(e) {
return u.isEmpty(e) ? [] : this.filter(function(t) {
for (var n in e) if (e[n] !== t.get(n)) return !1;
return !0;
});
},
sort: function(e) {
if (!this.comparator) throw new Error("Cannot sort a set without a comparator");
return e || (e = {}), u.isString(this.comparator) || this.comparator.length === 1 ? this.models = this.sortBy(this.comparator, this) : this.models.sort(u.bind(this.comparator, this)), e.silent || this.trigger("sort", this, e), this;
},
pluck: function(e) {
return u.invoke(this.models, "get", e);
},
update: function(e, t) {
t = u.extend({
add: !0,
merge: !0,
remove: !0
}, t), t.parse && (e = this.parse(e, t));
var n, r, i, s, o = [], a = [], f = {};
u.isArray(e) || (e = e ? [ e ] : []);
if (t.add && !t.remove) return this.add(e, t);
for (r = 0, i = e.length; r < i; r++) n = e[r], s = this.get(n), t.remove && s && (f[s.cid] = !0), (t.add && !s || t.merge && s) && o.push(n);
if (t.remove) for (r = 0, i = this.models.length; r < i; r++) n = this.models[r], f[n.cid] || a.push(n);
return a.length && this.remove(a, t), o.length && this.add(o, t), this;
},
reset: function(e, t) {
t || (t = {}), t.parse && (e = this.parse(e, t));
for (var n = 0, r = this.models.length; n < r; n++) this._removeReference(this.models[n]);
return t.previousModels = this.models, this._reset(), e && this.add(e, u.extend({
silent: !0
}, t)), t.silent || this.trigger("reset", this, t), this;
},
fetch: function(e) {
e = e ? u.clone(e) : {}, e.parse === void 0 && (e.parse = !0);
var t = e.success;
return e.success = function(e, n, r) {
var i = r.update ? "update" : "reset";
e[i](n, r), t && t(e, n, r);
}, this.sync("read", this, e);
},
create: function(e, t) {
t = t ? u.clone(t) : {};
if (!(e = this._prepareModel(e, t))) return !1;
t.wait || this.add(e, t);
var n = this, r = t.success;
return t.success = function(e, t, i) {
i.wait && n.add(e, i), r && r(e, t, i);
}, e.save(null, t), e;
},
parse: function(e, t) {
return e;
},
clone: function() {
return new this.constructor(this.models);
},
_reset: function() {
this.length = 0, this.models = [], this._byId = {};
},
_prepareModel: function(e, t) {
if (e instanceof h) return e.collection || (e.collection = this), e;
t || (t = {}), t.collection = this;
var n = new this.model(e, t);
return n._validate(e, t) ? n : !1;
},
_removeReference: function(e) {
this === e.collection && delete e.collection, e.off("all", this._onModelEvent, this);
},
_onModelEvent: function(e, t, n, r) {
if ((e === "add" || e === "remove") && n !== this) return;
e === "destroy" && this.remove(t, r), t && e === "change:" + t.idAttribute && (delete this._byId[t.previous(t.idAttribute)], t.id != null && (this._byId[t.id] = t)), this.trigger.apply(this, arguments);
}
});
var d = [ "forEach", "each", "map", "collect", "reduce", "foldl", "inject", "reduceRight", "foldr", "find", "detect", "filter", "select", "reject", "every", "all", "some", "any", "include", "contains", "invoke", "max", "min", "sortedIndex", "toArray", "size", "first", "head", "take", "initial", "rest", "tail", "drop", "last", "without", "indexOf", "shuffle", "lastIndexOf", "isEmpty", "chain" ];
u.each(d, function(e) {
p.prototype[e] = function() {
var t = i.call(arguments);
return t.unshift(this.models), u[e].apply(u, t);
};
});
var v = [ "groupBy", "countBy", "sortBy" ];
u.each(v, function(e) {
p.prototype[e] = function(t, n) {
var r = u.isFunction(t) ? t : function(e) {
return e.get(t);
};
return u[e](this.models, r, n);
};
});
var m = o.Router = function(e) {
e || (e = {}), e.routes && (this.routes = e.routes), this._bindRoutes(), this.initialize.apply(this, arguments);
}, g = /\((.*?)\)/g, y = /(\(\?)?:\w+/g, b = /\*\w+/g, w = /[\-{}\[\]+?.,\\\^$|#\s]/g;
u.extend(m.prototype, c, {
initialize: function() {},
route: function(e, t, n) {
return u.isRegExp(e) || (e = this._routeToRegExp(e)), n || (n = this[t]), o.history.route(e, u.bind(function(r) {
var i = this._extractParameters(e, r);
n && n.apply(this, i), this.trigger.apply(this, [ "route:" + t ].concat(i)), o.history.trigger("route", this, t, i);
}, this)), this;
},
navigate: function(e, t) {
return o.history.navigate(e, t), this;
},
_bindRoutes: function() {
if (!this.routes) return;
var e, t = u.keys(this.routes);
while ((e = t.pop()) != null) this.route(e, this.routes[e]);
},
_routeToRegExp: function(e) {
return e = e.replace(w, "\\$&").replace(g, "(?:$1)?").replace(y, function(e, t) {
return t ? e : "([^/]+)";
}).replace(b, "(.*?)"), new RegExp("^" + e + "$");
},
_extractParameters: function(e, t) {
return e.exec(t).slice(1);
}
});
var E = o.History = function() {
this.handlers = [], u.bindAll(this, "checkUrl"), typeof window != "undefined" && (this.location = window.location, this.history = window.history);
}, S = /^[#\/]|\s+$/g, x = /^\/+|\/+$/g, T = /msie [\w.]+/, N = /\/$/;
E.started = !1, u.extend(E.prototype, c, {
interval: 50,
getHash: function(e) {
var t = (e || this).location.href.match(/#(.*)$/);
return t ? t[1] : "";
},
getFragment: function(e, t) {
if (e == null) if (this._hasPushState || !this._wantsHashChange || t) {
e = this.location.pathname;
var n = this.root.replace(N, "");
e.indexOf(n) || (e = e.substr(n.length));
} else e = this.getHash();
return e.replace(S, "");
},
start: function(e) {
if (E.started) throw new Error("Backbone.history has already been started");
E.started = !0, this.options = u.extend({}, {
root: "/"
}, this.options, e), this.root = this.options.root, this._wantsHashChange = this.options.hashChange !== !1, this._wantsPushState = !!this.options.pushState, this._hasPushState = !!(this.options.pushState && this.history && this.history.pushState);
var t = this.getFragment(), n = document.documentMode, r = T.exec(navigator.userAgent.toLowerCase()) && (!n || n <= 7);
this.root = ("/" + this.root + "/").replace(x, "/"), r && this._wantsHashChange && (this.iframe = o.$('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo("body")[0].contentWindow, this.navigate(t)), this._hasPushState ? o.$(window).on("popstate", this.checkUrl) : this._wantsHashChange && "onhashchange" in window && !r ? o.$(window).on("hashchange", this.checkUrl) : this._wantsHashChange && (this._checkUrlInterval = setInterval(this.checkUrl, this.interval)), this.fragment = t;
var i = this.location, s = i.pathname.replace(/[^\/]$/, "$&/") === this.root;
if (this._wantsHashChange && this._wantsPushState && !this._hasPushState && !s) return this.fragment = this.getFragment(null, !0), this.location.replace(this.root + this.location.search + "#" + this.fragment), !0;
this._wantsPushState && this._hasPushState && s && i.hash && (this.fragment = this.getHash().replace(S, ""), this.history.replaceState({}, document.title, this.root + this.fragment + i.search));
if (!this.options.silent) return this.loadUrl();
},
stop: function() {
o.$(window).off("popstate", this.checkUrl).off("hashchange", this.checkUrl), clearInterval(this._checkUrlInterval), E.started = !1;
},
route: function(e, t) {
this.handlers.unshift({
route: e,
callback: t
});
},
checkUrl: function(e) {
var t = this.getFragment();
t === this.fragment && this.iframe && (t = this.getFragment(this.getHash(this.iframe)));
if (t === this.fragment) return !1;
this.iframe && this.navigate(t), this.loadUrl() || this.loadUrl(this.getHash());
},
loadUrl: function(e) {
var t = this.fragment = this.getFragment(e), n = u.any(this.handlers, function(e) {
if (e.route.test(t)) return e.callback(t), !0;
});
return n;
},
navigate: function(e, t) {
if (!E.started) return !1;
if (!t || t === !0) t = {
trigger: t
};
e = this.getFragment(e || "");
if (this.fragment === e) return;
this.fragment = e;
var n = this.root + e;
if (this._hasPushState) this.history[t.replace ? "replaceState" : "pushState"]({}, document.title, n); else {
if (!this._wantsHashChange) return this.location.assign(n);
this._updateHash(this.location, e, t.replace), this.iframe && e !== this.getFragment(this.getHash(this.iframe)) && (t.replace || this.iframe.document.open().close(), this._updateHash(this.iframe.location, e, t.replace));
}
t.trigger && this.loadUrl(e);
},
_updateHash: function(e, t, n) {
if (n) {
var r = e.href.replace(/(javascript:|#).*$/, "");
e.replace(r + "#" + t);
} else e.hash = "#" + t;
}
}), o.history = new E;
var C = o.View = function(e) {
this.cid = u.uniqueId("view"), this._configure(e || {}), this._ensureElement(), this.initialize.apply(this, arguments), this.delegateEvents();
}, k = /^(\S+)\s*(.*)$/, L = [ "model", "collection", "el", "id", "attributes", "className", "tagName", "events" ];
u.extend(C.prototype, c, {
tagName: "div",
$: function(e) {
return this.$el.find(e);
},
initialize: function() {},
render: function() {
return this;
},
remove: function() {
return this.$el.remove(), this.stopListening(), this;
},
setElement: function(e, t) {
return this.$el && this.undelegateEvents(), this.$el = e instanceof o.$ ? e : o.$(e), this.el = this.$el[0], t !== !1 && this.delegateEvents(), this;
},
delegateEvents: function(e) {
if (!e && !(e = u.result(this, "events"))) return;
this.undelegateEvents();
for (var t in e) {
var n = e[t];
u.isFunction(n) || (n = this[e[t]]);
if (!n) throw new Error('Method "' + e[t] + '" does not exist');
var r = t.match(k), i = r[1], s = r[2];
n = u.bind(n, this), i += ".delegateEvents" + this.cid, s === "" ? this.$el.on(i, n) : this.$el.on(i, s, n);
}
},
undelegateEvents: function() {
this.$el.off(".delegateEvents" + this.cid);
},
_configure: function(e) {
this.options && (e = u.extend({}, u.result(this, "options"), e)), u.extend(this, u.pick(e, L)), this.options = e;
},
_ensureElement: function() {
if (!this.el) {
var e = u.extend({}, u.result(this, "attributes"));
this.id && (e.id = u.result(this, "id")), this.className && (e["class"] = u.result(this, "className"));
var t = o.$("<" + u.result(this, "tagName") + ">").attr(e);
this.setElement(t, !1);
} else this.setElement(u.result(this, "el"), !1);
}
});
var A = {
create: "POST",
update: "PUT",
patch: "PATCH",
"delete": "DELETE",
read: "GET"
};
o.sync = function(e, t, n) {
var r = A[e];
u.defaults(n || (n = {}), {
emulateHTTP: o.emulateHTTP,
emulateJSON: o.emulateJSON
});
var i = {
type: r,
dataType: "json"
};
n.url || (i.url = u.result(t, "url") || M()), n.data == null && t && (e === "create" || e === "update" || e === "patch") && (i.contentType = "application/json", i.data = JSON.stringify(n.attrs || t.toJSON(n))), n.emulateJSON && (i.contentType = "application/x-www-form-urlencoded", i.data = i.data ? {
model: i.data
} : {});
if (n.emulateHTTP && (r === "PUT" || r === "DELETE" || r === "PATCH")) {
i.type = "POST", n.emulateJSON && (i.data._method = r);
var s = n.beforeSend;
n.beforeSend = function(e) {
e.setRequestHeader("X-HTTP-Method-Override", r);
if (s) return s.apply(this, arguments);
};
}
i.type !== "GET" && !n.emulateJSON && (i.processData = !1);
var a = n.success;
n.success = function(e) {
a && a(t, e, n), t.trigger("sync", t, e, n);
};
var f = n.error;
n.error = function(e) {
f && f(t, e, n), t.trigger("error", t, e, n);
};
var l = n.xhr = o.ajax(u.extend(i, n));
return t.trigger("request", t, l, n), l;
}, o.ajax = function() {
return o.$.ajax.apply(o.$, arguments);
};
var O = function(e, t) {
var n = this, r;
e && u.has(e, "constructor") ? r = e.constructor : r = function() {
return n.apply(this, arguments);
}, u.extend(r, n, t);
var i = function() {
this.constructor = r;
};
return i.prototype = n.prototype, r.prototype = new i, e && u.extend(r.prototype, e), r.__super__ = n.prototype, r;
};
h.extend = p.extend = m.extend = C.extend = E.extend = O;
var M = function() {
throw new Error('A "url" property or function must be specified');
};
}).call(this);

// foss/backbone-relational/backbone-relational.js

(function(e) {
"use strict";
var t, n, r;
typeof window == "undefined" ? (t = require("underscore"), n = require("backbone"), r = module.exports = n) : (t = window._, n = window.Backbone, r = window), n.Relational = {
showWarnings: !0
}, n.Semaphore = {
_permitsAvailable: null,
_permitsUsed: 0,
acquire: function() {
if (this._permitsAvailable && this._permitsUsed >= this._permitsAvailable) throw new Error("Max permits acquired");
this._permitsUsed++;
},
release: function() {
if (this._permitsUsed === 0) throw new Error("All permits released");
this._permitsUsed--;
},
isLocked: function() {
return this._permitsUsed > 0;
},
setAvailablePermits: function(e) {
if (this._permitsUsed > e) throw new Error("Available permits cannot be less than used permits");
this._permitsAvailable = e;
}
}, n.BlockingQueue = function() {
this._queue = [];
}, t.extend(n.BlockingQueue.prototype, n.Semaphore, {
_queue: null,
add: function(e) {
this.isBlocked() ? this._queue.push(e) : e();
},
process: function() {
while (this._queue && this._queue.length) this._queue.shift()();
},
block: function() {
this.acquire();
},
unblock: function() {
this.release(), this.isBlocked() || this.process();
},
isBlocked: function() {
return this.isLocked();
}
}), n.Relational.eventQueue = new n.BlockingQueue, n.Store = function() {
this._collections = [], this._reverseRelations = [], this._subModels = [], this._modelScopes = [ r ];
}, t.extend(n.Store.prototype, n.Events, {
addModelScope: function(e) {
this._modelScopes.push(e);
},
addSubModels: function(e, t) {
this._subModels.push({
superModelType: t,
subModels: e
});
},
setupSuperModel: function(e) {
t.find(this._subModels || [], function(n) {
return t.find(n.subModels || [], function(t, r) {
var i = this.getObjectByName(t);
if (e === i) return n.superModelType._subModels[r] = e, e._superModel = n.superModelType, e._subModelTypeValue = r, e._subModelTypeAttribute = n.superModelType.prototype.subModelTypeAttribute, !0;
}, this);
}, this);
},
addReverseRelation: function(e) {
var n = t.any(this._reverseRelations || [], function(n) {
return t.all(e || [], function(e, t) {
return e === n[t];
});
});
if (!n && e.model && e.type) {
this._reverseRelations.push(e);
var r = function(e, n) {
e.prototype.relations || (e.prototype.relations = []), e.prototype.relations.push(n), t.each(e._subModels || [], function(e) {
r(e, n);
}, this);
};
r(e.model, e), this.retroFitRelation(e);
}
},
retroFitRelation: function(e) {
var t = this.getCollection(e.model);
t.each(function(t) {
if (!(t instanceof e.model)) return;
new e.type(t, e);
}, this);
},
getCollection: function(e) {
e instanceof n.RelationalModel && (e = e.constructor);
var r = e;
while (r._superModel) r = r._superModel;
var i = t.detect(this._collections, function(e) {
return e.model === r;
});
return i || (i = this._createCollection(r)), i;
},
getObjectByName: function(n) {
var r = n.split("."), i = null;
return t.find(this._modelScopes || [], function(n) {
i = t.reduce(r || [], function(t, n) {
return t ? t[n] : e;
}, n);
if (i && i !== n) return !0;
}, this), i;
},
_createCollection: function(e) {
var t;
return e instanceof n.RelationalModel && (e = e.constructor), e.prototype instanceof n.RelationalModel && (t = new n.Collection, t.model = e, this._collections.push(t)), t;
},
resolveIdForItem: function(e, r) {
var i = t.isString(r) || t.isNumber(r) ? r : null;
return i === null && (r instanceof n.RelationalModel ? i = r.id : t.isObject(r) && (i = r[e.prototype.idAttribute])), !i && i !== 0 && (i = null), i;
},
find: function(e, t) {
var n = this.resolveIdForItem(e, t), r = this.getCollection(e);
if (r) {
var i = r.get(n);
if (i instanceof e) return i;
}
return null;
},
register: function(e) {
var t = this.getCollection(e);
if (t) {
if (t.get(e)) throw new Error("Cannot instantiate more than one Backbone.RelationalModel with the same id per type!");
var n = e.collection;
t.add(e), e.bind("destroy", this.unregister, this), e.collection = n;
}
},
update: function(e) {
var t = this.getCollection(e);
t._onModelEvent("change:" + e.idAttribute, e, t);
},
unregister: function(e) {
e.unbind("destroy", this.unregister);
var t = this.getCollection(e);
t && t.remove(e);
}
}), n.Relational.store = new n.Store, n.Relation = function(e, r) {
this.instance = e, r = t.isObject(r) ? r : {}, this.reverseRelation = t.defaults(r.reverseRelation || {}, this.options.reverseRelation), this.reverseRelation.type = t.isString(this.reverseRelation.type) ? n[this.reverseRelation.type] || n.Relational.store.getObjectByName(this.reverseRelation.type) : this.reverseRelation.type, this.model = r.model || this.instance.constructor, this.options = t.defaults(r, this.options, n.Relation.prototype.options), this.key = this.options.key, this.keySource = this.options.keySource || this.key, this.keyDestination = this.options.keyDestination || this.keySource || this.key, this.relatedModel = this.options.relatedModel, t.isString(this.relatedModel) && (this.relatedModel = n.Relational.store.getObjectByName(this.relatedModel));
if (!this.checkPreconditions()) return;
if (e) {
var i = this.keySource;
i !== this.key && typeof this.instance.get(this.key) == "object" && (i = this.key), this.keyContents = this.instance.get(i), this.keySource !== this.key && this.instance.unset(this.keySource, {
silent: !0
}), this.instance._relations.push(this);
}
!this.options.isAutoRelation && this.reverseRelation.type && this.reverseRelation.key && n.Relational.store.addReverseRelation(t.defaults({
isAutoRelation: !0,
model: this.relatedModel,
relatedModel: this.model,
reverseRelation: this.options
}, this.reverseRelation)), t.bindAll(this, "_modelRemovedFromCollection", "_relatedModelAdded", "_relatedModelRemoved"), e && (this.initialize(), r.autoFetch && this.instance.fetchRelated(r.key, t.isObject(r.autoFetch) ? r.autoFetch : {}), n.Relational.store.getCollection(this.instance).bind("relational:remove", this._modelRemovedFromCollection), n.Relational.store.getCollection(this.relatedModel).bind("relational:add", this._relatedModelAdded).bind("relational:remove", this._relatedModelRemoved));
}, n.Relation.extend = n.Model.extend, t.extend(n.Relation.prototype, n.Events, n.Semaphore, {
options: {
createModels: !0,
includeInJSON: !0,
isAutoRelation: !1,
autoFetch: !1
},
instance: null,
key: null,
keyContents: null,
relatedModel: null,
reverseRelation: null,
related: null,
_relatedModelAdded: function(e, t, n) {
var r = this;
e.queue(function() {
r.tryAddRelated(e, n);
});
},
_relatedModelRemoved: function(e, t, n) {
this.removeRelated(e, n);
},
_modelRemovedFromCollection: function(e) {
e === this.instance && this.destroy();
},
checkPreconditions: function() {
var e = this.instance, r = this.key, i = this.model, s = this.relatedModel, o = n.Relational.showWarnings && typeof console != "undefined";
if (!i || !r || !s) return o && console.warn("Relation=%o; no model, key or relatedModel (%o, %o, %o)", this, i, r, s), !1;
if (i.prototype instanceof n.RelationalModel) {
if (s.prototype instanceof n.RelationalModel) {
if (this instanceof n.HasMany && this.reverseRelation.type === n.HasMany) return o && console.warn("Relation=%o; relation is a HasMany, and the reverseRelation is HasMany as well.", this), !1;
if (e && e._relations.length) {
var u = t.any(e._relations || [], function(e) {
var t = this.reverseRelation.key && e.reverseRelation.key;
return e.relatedModel === s && e.key === r && (!t || this.reverseRelation.key === e.reverseRelation.key);
}, this);
if (u) return o && console.warn("Relation=%o between instance=%o.%s and relatedModel=%o.%s already exists", this, e, r, s, this.reverseRelation.key), !1;
}
return !0;
}
return o && console.warn("Relation=%o; relatedModel does not inherit from Backbone.RelationalModel (%o)", this, s), !1;
}
return o && console.warn("Relation=%o; model does not inherit from Backbone.RelationalModel (%o)", this, e), !1;
},
setRelated: function(e, n) {
this.related = e, this.instance.acquire(), this.instance.set(this.key, e, t.defaults(n || {}, {
silent: !0
})), this.instance.release();
},
_isReverseRelation: function(e) {
return e.instance instanceof this.relatedModel && this.reverseRelation.key === e.key && this.key === e.reverseRelation.key ? !0 : !1;
},
getReverseRelations: function(e) {
var n = [], r = t.isUndefined(e) ? this.related && (this.related.models || [ this.related ]) : [ e ];
return t.each(r || [], function(e) {
t.each(e.getRelations() || [], function(e) {
this._isReverseRelation(e) && n.push(e);
}, this);
}, this), n;
},
sanitizeOptions: function(e) {
return e = e ? t.clone(e) : {}, e.silent && (e.silentChange = !0, delete e.silent), e;
},
unsanitizeOptions: function(e) {
return e = e ? t.clone(e) : {}, e.silentChange && (e.silent = !0, delete e.silentChange), e;
},
destroy: function() {
n.Relational.store.getCollection(this.instance).unbind("relational:remove", this._modelRemovedFromCollection), n.Relational.store.getCollection(this.relatedModel).unbind("relational:add", this._relatedModelAdded).unbind("relational:remove", this._relatedModelRemoved), t.each(this.getReverseRelations() || [], function(e) {
e.removeRelated(this.instance);
}, this);
}
}), n.HasOne = n.Relation.extend({
options: {
reverseRelation: {
type: "HasMany"
}
},
initialize: function() {
t.bindAll(this, "onChange"), this.instance.bind("relational:change:" + this.key, this.onChange);
var e = this.findRelated({
silent: !0
});
this.setRelated(e), t.each(this.getReverseRelations() || [], function(e) {
e.addRelated(this.instance);
}, this);
},
findRelated: function(e) {
var t = this.keyContents, n = null;
if (t instanceof this.relatedModel) n = t; else if (t || t === 0) n = this.relatedModel.findOrCreate(t, {
create: this.options.createModels
});
return n;
},
onChange: function(e, r, i) {
if (this.isLocked()) return;
this.acquire(), i = this.sanitizeOptions(i);
var s = t.isUndefined(i._related), o = s ? this.related : i._related;
if (s) {
this.keyContents = r;
if (r instanceof this.relatedModel) this.related = r; else if (r) {
var u = this.findRelated(i);
this.setRelated(u);
} else this.setRelated(null);
}
o && this.related !== o && t.each(this.getReverseRelations(o) || [], function(e) {
e.removeRelated(this.instance, i);
}, this), t.each(this.getReverseRelations() || [], function(e) {
e.addRelated(this.instance, i);
}, this);
if (!i.silentChange && this.related !== o) {
var a = this;
n.Relational.eventQueue.add(function() {
a.instance.trigger("update:" + a.key, a.instance, a.related, i);
});
}
this.release();
},
tryAddRelated: function(e, r) {
if (this.related) return;
r = this.sanitizeOptions(r);
var i = this.keyContents;
if (i || i === 0) {
var s = n.Relational.store.resolveIdForItem(this.relatedModel, i);
!t.isNull(s) && e.id === s && this.addRelated(e, r);
}
},
addRelated: function(e, t) {
if (e !== this.related) {
var n = this.related || null;
this.setRelated(e), this.onChange(this.instance, e, {
_related: n
});
}
},
removeRelated: function(e, t) {
if (!this.related) return;
if (e === this.related) {
var n = this.related || null;
this.setRelated(null), this.onChange(this.instance, e, {
_related: n
});
}
}
}), n.HasMany = n.Relation.extend({
collectionType: null,
options: {
reverseRelation: {
type: "HasOne"
},
collectionType: n.Collection,
collectionKey: !0,
collectionOptions: {}
},
initialize: function() {
t.bindAll(this, "onChange", "handleAddition", "handleRemoval", "handleReset"), this.instance.bind("relational:change:" + this.key, this.onChange), this.collectionType = this.options.collectionType, t.isString(this.collectionType) && (this.collectionType = n.Relational.store.getObjectByName(this.collectionType));
if (!this.collectionType.prototype instanceof n.Collection) throw new Error("collectionType must inherit from Backbone.Collection");
this.keyContents instanceof n.Collection ? this.setRelated(this._prepareCollection(this.keyContents)) : this.setRelated(this._prepareCollection()), this.findRelated({
silent: !0
});
},
_getCollectionOptions: function() {
return t.isFunction(this.options.collectionOptions) ? this.options.collectionOptions(this.instance) : this.options.collectionOptions;
},
_prepareCollection: function(e) {
this.related && this.related.unbind("relational:add", this.handleAddition).unbind("relational:remove", this.handleRemoval).unbind("relational:reset", this.handleReset);
if (!e || !(e instanceof n.Collection)) e = new this.collectionType([], this._getCollectionOptions());
e.model = this.relatedModel;
if (this.options.collectionKey) {
var t = this.options.collectionKey === !0 ? this.options.reverseRelation.key : this.options.collectionKey;
e[t] && e[t] !== this.instance ? n.Relational.showWarnings && typeof console != "undefined" && console.warn("Relation=%o; collectionKey=%s already exists on collection=%o", this, t, this.options.collectionKey) : t && (e[t] = this.instance);
}
return e.bind("relational:add", this.handleAddition).bind("relational:remove", this.handleRemoval).bind("relational:reset", this.handleReset), e;
},
findRelated: function(e) {
if (this.keyContents) {
var r = [];
this.keyContents instanceof n.Collection ? r = this.keyContents.models : (this.keyContents = t.isArray(this.keyContents) ? this.keyContents : [ this.keyContents ], t.each(this.keyContents || [], function(e) {
var t = null;
if (e instanceof this.relatedModel) t = e; else if (e || e === 0) t = this.relatedModel.findOrCreate(e, {
create: this.options.createModels
});
t && !this.related.get(t) && r.push(t);
}, this)), r.length && (e = this.unsanitizeOptions(e), this.related.add(r, e));
}
},
onChange: function(r, i, s) {
s = this.sanitizeOptions(s), this.keyContents = i;
if (i instanceof n.Collection) this._prepareCollection(i), this.related = i; else {
var o = {}, u = {};
!t.isArray(i) && i !== e && (i = [ i ]), t.each(i, function(e) {
u[e.id] = !0;
});
var a = this.related;
a instanceof n.Collection ? t.each(a.models.slice(0), function(e) {
if (!s.keepNewModels || !e.isNew()) o[e.id] = !0, a.remove(e, {
silent: e.id in u
});
}) : a = this._prepareCollection(), t.each(i, function(e) {
var t = this.relatedModel.findOrCreate(e, {
create: this.options.createModels
});
t && a.add(t, {
silent: e.id in o
});
}, this), this.setRelated(a);
}
var f = this;
n.Relational.eventQueue.add(function() {
!s.silentChange && f.instance.trigger("update:" + f.key, f.instance, f.related, s);
});
},
tryAddRelated: function(e, r) {
r = this.sanitizeOptions(r);
if (!this.related.get(e)) {
var i = t.any(this.keyContents || [], function(r) {
var i = n.Relational.store.resolveIdForItem(this.relatedModel, r);
return !t.isNull(i) && i === e.id;
}, this);
i && this.related.add(e, r);
}
},
handleAddition: function(e, r, i) {
if (!(e instanceof n.Model)) return;
i = this.sanitizeOptions(i), t.each(this.getReverseRelations(e) || [], function(e) {
e.addRelated(this.instance, i);
}, this);
var s = this;
n.Relational.eventQueue.add(function() {
!i.silentChange && s.instance.trigger("add:" + s.key, e, s.related, i);
});
},
handleRemoval: function(e, r, i) {
if (!(e instanceof n.Model)) return;
i = this.sanitizeOptions(i), t.each(this.getReverseRelations(e) || [], function(e) {
e.removeRelated(this.instance, i);
}, this);
var s = this;
n.Relational.eventQueue.add(function() {
!i.silentChange && s.instance.trigger("remove:" + s.key, e, s.related, i);
});
},
handleReset: function(e, t) {
t = this.sanitizeOptions(t);
var r = this;
n.Relational.eventQueue.add(function() {
!t.silentChange && r.instance.trigger("reset:" + r.key, r.related, t);
});
},
addRelated: function(e, t) {
var n = this;
t = this.unsanitizeOptions(t), e.queue(function() {
n.related && !n.related.get(e) && n.related.add(e, t);
});
},
removeRelated: function(e, t) {
t = this.unsanitizeOptions(t), this.related.get(e) && this.related.remove(e, t);
}
}), n.RelationalModel = n.Model.extend({
relations: null,
_relations: null,
_isInitialized: !1,
_deferProcessing: !1,
_queue: null,
subModelTypeAttribute: "type",
subModelTypes: null,
constructor: function(e, r) {
var i = this;
if (r && r.collection) {
this._deferProcessing = !0;
var s = function(e) {
e === i && (i._deferProcessing = !1, i.processQueue(), r.collection.unbind("relational:add", s));
};
r.collection.bind("relational:add", s), t.defer(function() {
s(i);
});
}
this._queue = new n.BlockingQueue, this._queue.block(), n.Relational.eventQueue.block(), n.Model.apply(this, arguments), n.Relational.eventQueue.unblock();
},
trigger: function(e) {
if (e.length > 5 && "change" === e.substr(0, 6)) {
var t = this, r = arguments;
n.Relational.eventQueue.add(function() {
n.Model.prototype.trigger.apply(t, r);
});
} else n.Model.prototype.trigger.apply(this, arguments);
return this;
},
initializeRelations: function() {
this.acquire(), this._relations = [], t.each(this.relations || [], function(e) {
var r = t.isString(e.type) ? n[e.type] || n.Relational.store.getObjectByName(e.type) : e.type;
r && r.prototype instanceof n.Relation ? new r(this, e) : n.Relational.showWarnings && typeof console != "undefined" && console.warn("Relation=%o; missing or invalid type!", e);
}, this), this._isInitialized = !0, this.release(), this.processQueue();
},
updateRelations: function(e) {
this._isInitialized && !this.isLocked() && t.each(this._relations || [], function(t) {
var n = this.attributes[t.keySource] || this.attributes[t.key];
t.related !== n && this.trigger("relational:change:" + t.key, this, n, e || {});
}, this);
},
queue: function(e) {
this._queue.add(e);
},
processQueue: function() {
this._isInitialized && !this._deferProcessing && this._queue.isBlocked() && this._queue.unblock();
},
getRelation: function(e) {
return t.detect(this._relations, function(t) {
if (t.key === e) return !0;
}, this);
},
getRelations: function() {
return this._relations;
},
fetchRelated: function(e, r, i) {
r || (r = {});
var s, o = [], u = this.getRelation(e), a = u && u.keyContents, f = a && t.select(t.isArray(a) ? a : [ a ], function(e) {
var r = n.Relational.store.resolveIdForItem(u.relatedModel, e);
return !t.isNull(r) && (i || !n.Relational.store.find(u.relatedModel, r));
}, this);
if (f && f.length) {
var l = t.map(f, function(e) {
var n;
if (t.isObject(e)) n = u.relatedModel.findOrCreate(e); else {
var r = {};
r[u.relatedModel.prototype.idAttribute] = e, n = u.relatedModel.findOrCreate(r);
}
return n;
}, this);
u.related instanceof n.Collection && t.isFunction(u.related.url) && (s = u.related.url(l));
if (s && s !== u.related.url()) {
var c = t.defaults({
error: function() {
var e = arguments;
t.each(l || [], function(t) {
t.trigger("destroy", t, t.collection, r), r.error && r.error.apply(t, e);
});
},
url: s
}, r, {
add: !0
});
o = [ u.related.fetch(c) ];
} else o = t.map(l || [], function(e) {
var n = t.defaults({
error: function() {
e.trigger("destroy", e, e.collection, r), r.error && r.error.apply(e, arguments);
}
}, r);
return e.fetch(n);
}, this);
}
return o;
},
set: function(e, r, i) {
n.Relational.eventQueue.block();
var s;
t.isObject(e) || e == null ? (s = e, i = r) : (s = {}, s[e] = r);
var o = n.Model.prototype.set.apply(this, arguments);
return !this._isInitialized && !this.isLocked() ? (this.constructor.initializeModelHierarchy(), n.Relational.store.register(this), this.initializeRelations()) : s && this.idAttribute in s && n.Relational.store.update(this), s && this.updateRelations(i), n.Relational.eventQueue.unblock(), o;
},
unset: function(e, t) {
n.Relational.eventQueue.block();
var r = n.Model.prototype.unset.apply(this, arguments);
return this.updateRelations(t), n.Relational.eventQueue.unblock(), r;
},
clear: function(e) {
n.Relational.eventQueue.block();
var t = n.Model.prototype.clear.apply(this, arguments);
return this.updateRelations(e), n.Relational.eventQueue.unblock(), t;
},
change: function(e) {
var t = this, r = arguments;
n.Relational.eventQueue.add(function() {
n.Model.prototype.change.apply(t, r);
});
},
clone: function() {
var e = t.clone(this.attributes);
return t.isUndefined(e[this.idAttribute]) || (e[this.idAttribute] = null), t.each(this.getRelations() || [], function(t) {
delete e[t.key];
}), new this.constructor(e);
},
toJSON: function(e) {
if (this.isLocked()) return this.id;
this.acquire();
var r = n.Model.prototype.toJSON.call(this, e);
return this.constructor._superModel && !(this.constructor._subModelTypeAttribute in r) && (r[this.constructor._subModelTypeAttribute] = this.constructor._subModelTypeValue), t.each(this._relations || [], function(i) {
var s = r[i.key];
if (i.options.includeInJSON === !0) s && t.isFunction(s.toJSON) ? r[i.keyDestination] = s.toJSON(e) : r[i.keyDestination] = null; else if (t.isString(i.options.includeInJSON)) s instanceof n.Collection ? r[i.keyDestination] = s.pluck(i.options.includeInJSON) : s instanceof n.Model ? r[i.keyDestination] = s.get(i.options.includeInJSON) : r[i.keyDestination] = null; else if (t.isArray(i.options.includeInJSON)) if (s instanceof n.Collection) {
var o = [];
s.each(function(e) {
var n = {};
t.each(i.options.includeInJSON, function(t) {
n[t] = e.get(t);
}), o.push(n);
}), r[i.keyDestination] = o;
} else if (s instanceof n.Model) {
var o = {};
t.each(i.options.includeInJSON, function(e) {
o[e] = s.get(e);
}), r[i.keyDestination] = o;
} else r[i.keyDestination] = null; else delete r[i.key];
i.keyDestination !== i.key && delete r[i.key];
}), this.release(), r;
}
}, {
setup: function(e) {
return this.prototype.relations = (this.prototype.relations || []).slice(0), this._subModels = {}, this._superModel = null, this.prototype.hasOwnProperty("subModelTypes") ? n.Relational.store.addSubModels(this.prototype.subModelTypes, this) : this.prototype.subModelTypes = null, t.each(this.prototype.relations || [], function(e) {
e.model || (e.model = this);
if (e.reverseRelation && e.model === this) {
var r = !0;
if (t.isString(e.relatedModel)) {
var i = n.Relational.store.getObjectByName(e.relatedModel);
r = i && i.prototype instanceof n.RelationalModel;
}
var s = t.isString(e.type) ? n[e.type] || n.Relational.store.getObjectByName(e.type) : e.type;
r && s && s.prototype instanceof n.Relation && new s(null, e);
}
}, this), this;
},
build: function(e, t) {
var n = this;
this.initializeModelHierarchy();
if (this._subModels && this.prototype.subModelTypeAttribute in e) {
var r = e[this.prototype.subModelTypeAttribute], i = this._subModels[r];
i && (n = i);
}
return new n(e, t);
},
initializeModelHierarchy: function() {
if (t.isUndefined(this._superModel) || t.isNull(this._superModel)) {
n.Relational.store.setupSuperModel(this);
if (this._superModel) {
if (this._superModel.prototype.relations) {
var e = t.any(this.prototype.relations || [], function(e) {
return e.model && e.model !== this;
}, this);
e || (this.prototype.relations = this._superModel.prototype.relations.concat(this.prototype.relations));
}
} else this._superModel = !1;
}
this.prototype.subModelTypes && t.keys(this.prototype.subModelTypes).length !== t.keys(this._subModels).length && t.each(this.prototype.subModelTypes || [], function(e) {
var t = n.Relational.store.getObjectByName(e);
t && t.initializeModelHierarchy();
});
},
findOrCreate: function(e, r) {
var i = t.isObject(e) && this.prototype.parse ? this.prototype.parse(e) : e, s = n.Relational.store.find(this, i);
if (t.isObject(e)) if (s) s.set(i, r); else if (!r || r && r.create !== !1) s = this.build(e, r);
return s;
}
}), t.extend(n.RelationalModel.prototype, n.Semaphore), n.Collection.prototype.__prepareModel = n.Collection.prototype._prepareModel, n.Collection.prototype._prepareModel = function(e, t) {
var r;
return e instanceof n.Model ? (e.collection || (e.collection = this), r = e) : (t || (t = {}), t.collection = this, typeof this.model.findOrCreate != "undefined" ? r = this.model.findOrCreate(e, t) : r = new this.model(e, t), r._validate(e, t) || (r = !1)), r;
};
var i = n.Collection.prototype.__add = n.Collection.prototype.add;
n.Collection.prototype.add = function(e, r) {
r || (r = {}), t.isArray(e) || (e = [ e ]);
var s = [];
return t.each(e || [], function(e) {
e instanceof n.Model || (e = n.Collection.prototype._prepareModel.call(this, e, r)), e instanceof n.Model && !this.get(e) && s.push(e);
}, this), s.length && (i.call(this, s, r), t.each(s || [], function(e) {
this.trigger("relational:add", e, this, r);
}, this)), this;
};
var s = n.Collection.prototype.__remove = n.Collection.prototype.remove;
n.Collection.prototype.remove = function(e, r) {
return r || (r = {}), t.isArray(e) ? e = e.slice(0) : e = [ e ], t.each(e || [], function(e) {
e = this.get(e), e instanceof n.Model && (s.call(this, e, r), this.trigger("relational:remove", e, this, r));
}, this), this;
};
var o = n.Collection.prototype.__reset = n.Collection.prototype.reset;
n.Collection.prototype.reset = function(e, t) {
return o.call(this, e, t), this.trigger("relational:reset", this, t), this;
};
var u = n.Collection.prototype.__sort = n.Collection.prototype.sort;
n.Collection.prototype.sort = function(e) {
return u.call(this, e), this.trigger("relational:reset", this, e), this;
};
var a = n.Collection.prototype.__trigger = n.Collection.prototype.trigger;
n.Collection.prototype.trigger = function(e) {
if (e === "add" || e === "remove" || e === "reset") {
var r = this, i = arguments;
e === "add" && (i = t.toArray(i), t.isObject(i[3]) && (i[3] = t.clone(i[3]))), n.Relational.eventQueue.add(function() {
a.apply(r, i);
});
} else a.apply(this, arguments);
return this;
}, n.RelationalModel.extend = function(e, t) {
var r = n.Model.extend.apply(this, arguments);
return r.setup(this), r;
};
})();

// SelectionSupport.js

enyo.Mixin({
name: "enyo.SelectionSupport",
multiselect: !1,
selection: null,
initMixin: function() {
this.createResponders && this.createResponders();
},
collectionDidChange: function(e) {
var t = e.changedAttributes() || {};
return "selected" in t && this.selectedModelChanged(e), this.inherited(arguments);
},
select: function(e) {
var t;
"number" == typeof e ? (t = e, e = this.at(t)) : t = this.indexOf(e);
if (!e) return !1;
if (this.multiselect === !0) {
if (e.get("selected") === !0) {
this.deselect(e);
return;
}
if (-1 !== this.selection.indexOf(t)) {
this.deselect(t);
return;
}
this.selection.push(t);
} else {
if (this.selection && this.selection === e) return;
this.deselect(), this.selection = e;
}
e.get("selected") || (e.set({
selected: !0
}), this.bubbleUp("onselected", {
model: e,
index: t
}, this)), this.notifyObservers("selection", null, this.selection);
},
deselect: function(e) {
var t = this.selection, n = this.multiselect, r, i;
if (undefined === e) {
if (n === !0) return;
t && (t.get("selected") && t.set({
selected: !1
}), this.selection = null, this.bubbleUp("ondeselected", {
model: e,
index: r
}, this), this.notifyObservers("selection", null, this.selection));
return;
}
"number" == typeof e ? (r = e, e = this.at(r)) : r = this.indexOf(e);
if (!e) return;
if (!t) return;
if (n === !0) {
if (-1 === (i = t.indexOf(r))) return;
t.splice(i, 1), e.get("selected") || e.set({
selected: !1
}), this.bubbleUp("ondeselected", {
model: e,
index: r
}, this), this.notifyObservers("selection", null, this.selection);
} else t === e && (e.get("selected") && e.set({
selected: !1
}), this.selection = null, this.bubbleUp("ondeselected", {
model: e,
index: r
}, this), this.notifyObservers("selection", null, this.selection));
},
collectionDidReset: function(e, t) {
this.deselect(), this.inherited(arguments);
},
selectedModelChanged: function(e) {
var t = e.get("selected"), n = this.multiselect;
if (!0 === n) !0 === t ? this.select(e) : this.deselect(e); else if (!0 === t) {
if (this.selection === e) return;
this.select(e);
} else !1 === t && this.selection === e && this.deselect(e);
return !0;
},
collectionDidRemove: function(e, t, n) {
this.selection && this.selection === e && this.deselect(), this.inherited(arguments);
},
releaseCollection: function(e) {
var t = this.multiselect;
!0 !== t && this.deselect(), this.inherited(arguments);
}
});

// AutoBindingSupport.js

(function() {
var e = {
bindFrom: "from",
bindTo: "to",
bindTransform: "transform",
bindOneWay: "oneWay",
bindAutoSync: "autoSync",
bindDebug: "debug"
}, t = {
to: ".content",
transform: null,
oneWay: !0,
autoSync: !1,
debug: !1
};
enyo.Mixin({
name: "enyo.AutoBindingSupport",
didSetupAutoBindings: !1,
initMixin: function() {
this.autoCache = {}, this.setupAutoBindings();
},
autoBinding: function() {
var e = this.binding.apply(this, arguments);
e.autoBindingId = enyo.uid("autoBinding");
},
autoBindings: enyo.Computed(function() {
return enyo.filter(this.bindings || [], function(e) {
return e && e.autoBindingId;
});
}),
setupAutoBindings: function() {
if (this.didSetupAutoBindings) return;
if (!this.controller) return;
var e = this.get("bindableControls"), t = 0, n = e.length, r = this.controller, i, s;
for (; t < n; ++t) i = e[t], s = this.bindProperties(i), this.autoBinding(s, {
source: r,
target: i
});
this.didSetupAutoBindings = !0;
},
bindProperties: function(n) {
return enyo.mixin(enyo.clone(t), enyo.remap(e, n));
},
bindableControls: enyo.Computed(function(e) {
var t = this.autoCache.bindableControls;
if (t) return enyo.clone(t);
var n = [], e = e || this, r = e.controls || [], i = 0, s = r.length;
for (; i < s; ++i) n = n.concat(this.bindableControls(r[i]));
return "bindFrom" in e && n.push(e), this === e && (this.autoCache.bindableControls = enyo.clone(n)), n;
}),
controllerDidChange: enyo.Observer(function() {
this.inherited(arguments), this.controller && (this.didSetupAutoBindings || this.setupAutoBindings());
}, "controller")
});
})();

// CollectionArraySupport.js

enyo.Mixin({
name: "enyo.CollectionArraySupport",
update: function(e, t) {
return this.collection.update(e, t);
},
push: function(e, t) {
return this.collection.push(e, t);
},
pop: function(e) {
return this.collection.pop(e);
},
shift: function(e) {
return this.collection.shift(e);
},
unshift: function(e, t) {
return this.collection.unshift(e, t);
},
indexOf: function(e, t) {
return this.collection.indexOf(e, t);
},
lastIndexOf: function(e, t) {
return this.collection.lastIndexOf(e, t);
},
splice: function(e, t) {
var n = enyo.toArray(arguments).slice(2), r = n.length, i = this.length, s = i - 1, o = [], u = {
added: {
len: 0
},
removed: {
len: 0
},
changed: {
len: 0
}
}, a = 0, f, l, c, h, p, d = this.collection.models;
e = e < 0 ? 0 : e >= i ? i : e, t = t && !isNaN(t) && t + e <= i ? t : 0;
if (t) {
c = e + t - r;
for (f = e, l = e + t - 1; f <= l; ++f, ++a) o[a] = d[f], r && r >= t ? (u.changed[f] = d[f], u.changed.len++) : r && r < t && f < c && (u.changed[f] = d[f], u.changed.len++), u.removed[f] = d[f], u.removed.len++;
}
if (r && r > t) {
h = r - t, a = s;
for (; a >= e && a < i; --a) d[a + h] = d[a];
this.length += h;
} else {
h = t - (r ? r : 0), a = e + t;
for (; a < i; ++a) d[a - h] = d[a], u.changed[a - h] = d[a - h], u.changed.len++;
f = this.length -= h, d.splice(f, d.length - f);
}
if (r) {
a = 0, f = e, h = t ? t > r ? t - r : r - t : 0;
for (; a < r; ++f, ++a) {
d[f] = n[a], i && f < i && (u.changed[f] = d[f], u.changed.len++);
if (!i || h && a >= h || !t) u.added[i + a - h] = d[i + a - h], u.added.len++;
}
}
return this.collection.update(d, {
add: !1,
remove: !1,
merge: !1
}), u.removed.len && (delete u.removed.len, this.dispatchBubble("didremove", {
values: u.removed
}, this)), u.added.len && (delete u.added.len, this.dispatchBubble("didadd", {
values: u.added
}, this)), u.changed.len && (delete u.changed.len, this.dispatchBubble("didchange", {
values: u.changed
}, this)), o;
},
add: function(e, t) {
this.collection.add(e, t);
},
remove: function(e, t) {
this.collection.remove(e, t);
},
reset: function(e, t) {
return this.collection.reset(e, t);
},
at: function(e) {
return this.collection.at(e);
},
swap: function(e, t) {
var n = this.collection.models, r = n[e], i = n[t], s = {};
s[e] = n[e] = i, s[t] = n[t] = r, this.collection.update(n, {
add: !1,
remove: !1,
merge: !1
}), this.dispatchBubble("didchange", {
values: s
}, this);
},
move: function(e, t) {
var n = this.collection.models, r = n[e], i = {}, s = e > t ? t : e, o = s === e ? t : e, u = this.length;
n.splice(e, 1), n.splice(t, 0, r), this.collection.update(n, {
add: !1,
remove: !1,
merge: !1
});
for (; s <= o; ++s) i[s] = n[s];
this.dispatchBubble("didchange", {
values: i
}, this);
}
});

// CollectionListRowSupport.js

enyo.Mixin({
name: "enyo.CollectionListRowSupport",
initMixin: function() {
this.binding({
from: ".controller.selected",
to: ".selected"
});
},
selectedChanged: function() {
this.addRemoveClass("selected", this.selected);
}
});

// Model.js

(function() {
Backbone.Model.prototype.get = function(e) {
var t = e.split("."), n, r;
return 1 === t.length ? this.attributes[e] : (n = this.get(t.shift()), e = t.join("."), n instanceof Backbone.Model ? r = n.get(e) : n instanceof Backbone.Collection && (r = n[e]), r);
};
})();

// Collection.js



// CollectionController.js

enyo.kind({
name: "enyo.CollectionController",
kind: "enyo.ArrayController",
collection: null,
model: null,
autoLoad: !1,
models: null,
mixins: [ "enyo.SelectionSupport", "enyo.CollectionArraySupport" ],
_last_collection: null,
data: enyo.Computed(function(e) {
return this.models;
}, "models", "model"),
load: function(e) {
var t = this.collection;
return e = e || {}, e.success = enyo.bind(this, this.collectionDidLoad), t ? t.fetch.call(t, e) : !1;
},
fetch: function(e) {
return this.load.apply(this, arguments);
},
on: function(e, t) {
var n = this.collection;
return n ? n.on.apply(n, arguments) : !1;
},
off: function(e, t) {
var n = this.collection;
return n ? n.off.apply(n, arguments) : !1;
},
constructor: function() {
this.inherited(arguments), this.createResponders();
},
create: function() {
this.inherited(arguments), this.collectionChanged(), this.get("autoLoad") === !0 && this.load();
},
collectionChanged: function() {
this.findAndInstance("collection");
},
collectionFindAndInstance: function(e, t) {
var n = this._last_collection, r = this.model;
if (!e && !t) {
if (this.owner) {
if (this.owner.collection) return this.collection = this.owner.collection, this.collectionChanged();
} else if (r) {
t = this.collection = new Backbone.Collection;
if ("string" == typeof r) {
this.model = r = enyo.getPath(r);
if (!r) throw "enyo.CollectionController: cannot find the given model";
}
t.model = r;
}
if (!t) {
n && (this.releaseCollection(n), this.stopNotifications(), this.set("length", 0), this.set("models", []), this.startNotifications());
return;
}
}
n && this.releaseCollection(n), this._last_collection = t, this.stopNotifications(), this.initCollection(t), this.owner ? this.startNotifications() : (enyo.forEach(this.dispatchTargets, function(e) {
e.stopNotifications(), e.refreshBindings(), e.startNotifications();
}, this), this.startNotifications());
},
ownerChanged: function() {
return this.collection || this.collectionChanged(), this.collection && !this.collection.model && this.model && this.collection.set("model", this.model), this.inherited(arguments);
},
createResponders: function() {
var e = this.responders || (this.responders = {}), t = "object" == typeof this.collection && this.collection;
t && e.change && this.releaseCollection(t), e.change = enyo.bind(this, this.collectionDidChange), e.remove = enyo.bind(this, this.collectionDidRemove), e.add = enyo.bind(this, this.collectionDidAdd), e.destroy = enyo.bind(this, this.collectionDidDestroy), e.reset = enyo.bind(this, this.collectionDidReset), t && this.initCollection(t);
},
releaseCollection: function(e) {
var t = this.responders, n;
if (!e) return;
for (n in t) e.off(n, t[n]);
},
initCollection: function(e) {
var t = this.responders, n;
for (n in t) {
if (!t.hasOwnProperty(n)) continue;
e.on(n, t[n]);
}
this.stopNotifications(), this.set("length", e.length), this.set("models", e.models, !0), this.startNotifications();
},
collectionDidLoad: function() {
this.dispatchBubble("didload", {}, this);
},
collectionDidChange: function(e) {
var t = {}, n = this.indexOf(e);
t[n] = e, this.dispatchBubble("didchange", {
values: t
}, this), this.notifyObservers("model", null, e);
},
collectionDidAdd: function(e, t, n) {
var r = {}, i = this.indexOf(e);
r[i] = e, this.stopNotifications(), this.set("length", t.length), this.set("models", t.models, !0), this.startNotifications(), this.dispatchBubble("didadd", {
values: r
}, this);
},
collectionDidRemove: function(e, t, n) {
var r = {
removed: {},
changed: {}
}, i = n.index, s = t.length;
r.removed[i] = e;
for (i += 1; i < s; ++i) r.changed[i] = t.models[i];
this.stopNotifications(), this.set("length", t.length), this.set("models", t.models, !0), this.startNotifications(), this.dispatchBubble("didremove", {
values: r.removed
}, this), i > n.index && this.dispatchBubble("didchange", {
values: r.changed
}, this);
},
collectionDidDestroy: function(e, t, n) {
var r = {}, i = n.index;
r[i] = e, this.stopNotifications(), this.set("length", t.length), this.set("models", t.models, !0), this.startNotifications(), this.dispatchBubble("diddestroy", {
values: r
}, this);
},
collectionDidReset: function(e, t) {
t.values = t.previousModels || [], this.stopNotifications(), this.set("length", e.length), this.set("models", e.models, !0), this.startNotifications(), this.dispatchBubble("didreset", t, this);
},
destroy: function() {
var e = this._last_collection;
e && this.releaseCollection(e), this._last_collection = null, this.collection = null, this.responders = null, this.model = null, this.inherited(arguments);
}
});

// ModelController.js

enyo.kind({
name: "enyo.ModelController",
kind: "enyo.ObjectController",
model: null,
statics: {
modelControllerCount: 0
},
model: enyo.Computed(function(e) {
if (!enyo.exists(e)) return this.get("data");
this.data = e;
}, "data"),
constructor: function() {
this.inherited(arguments), this.createResponders();
},
create: function() {
this.inherited(arguments), enyo.ModelController.modelControllerCount++;
},
createResponders: function() {
var e = this.responders || (this.responders = {}), t = this.get("data");
t && e.change && e.destroy && this.releaseData(t), e.change = enyo.bind(this, this.didUpdate), e.destroy = enyo.bind(this, this.didDestroy), t && this.initData(t);
},
dataFindAndInstance: function(e, t) {
t && t instanceof Backbone.Model && this.initData(t);
},
initData: function(e) {
var e = e || this.get("data"), t = this.responders, n;
if (!e) return;
for (n in t) {
if (!t.hasOwnProperty(n)) continue;
e.on(n, t[n]);
}
this._last = e;
},
releaseData: function(e) {
var t = this.responders, n;
e = e || this.get("data") || this._last;
if (!e) return;
for (n in t) e.off(n, t[n]);
this._last = null;
},
didUpdate: function(e) {
var t = e.attributes, n;
for (n in t) {
if (!t.hasOwnProperty(n)) continue;
this.notifyObservers(n, e.previous(n), e.get(n));
}
},
didDestroy: function() {
this.releaseData(), this._last = null, this.set("data", null);
},
destroy: function() {
this.releaseData(), this.stopNotifications(!0), this.set("data", null), this.startNotifications(!0), this.inherited(arguments), enyo.ModelController.modelControllerCount--;
},
getDataProperty: function(e) {
var t = this.get("data"), n;
return t && enyo.exists(n = t.get(e)) ? n : !1;
},
setDataProperty: function(e, t) {
var n = this.get("data"), r;
return n && ("object" == typeof e || e in n.attributes) ? (n.set(e, t), !0) : !1;
},
isAttribute: function(e) {
var t = this.get("data"), n;
return t ? (n = t.attributes, n.hasOwnProperty(e)) : !1;
},
notifyAll: function() {
this.get("data") ? this.notifyAttributes() : (this.inherited(arguments), this.sync());
},
notifyAttributes: function() {
var e = this.get("data"), t, n;
if (e) {
t = e.attributes;
for (n in t) {
if (!t.hasOwnProperty(n)) continue;
this.notifyObservers(n, null, e.get(n));
}
}
},
dataDidChange: enyo.Observer(function() {
this.inherited(arguments);
}, "data", "model")
});

// Repeater.js

enyo.kind({
name: "wip.Repeater",
kind: "enyo.View",
defaultChildController: "enyo.ObjectController",
childMixins: [ "enyo.AutoBindingSupport" ],
concat: "childMixins",
handlers: {
didadd: "repeaterDidAdd",
didremove: "repeaterDidRemove",
didreset: "repeaterDidReset",
didchange: "repeaterDidChange"
},
bindings: [ {
from: ".controller.data",
to: ".data"
} ],
length: enyo.Computed(function() {
return (this.get("data") || []).length;
}, "data"),
prune: function() {
var e = this.children, t = this.get("length"), n = 0, r = e.slice(t), i = r.length;
for (; n < i; ++n) r[n].destroy();
},
sync: function(e, t) {
var n = e || 0, r = t || this.get("length") - 1, i = this.get("data");
for (; n <= r; ++n) this.update(n, i);
},
update: function(e, t) {
e = parseInt(e);
var n = this.children, t = t ? t.length ? t[e] : t : this.get("data")[e], r = n[e], i = this.get("length");
if (e < 0 || e >= i) return;
!t && r ? this.remove(e) : t && !r ? this.add(e, t) : t && r && r.controller.set("data", t);
},
remove: function(e) {
this.log(e);
},
add: function(e, t) {
var n = this.children, r = n.length, t = t || this.get("data")[e], i = this.child, s;
if (r !== e) throw "add was called for index other than the end";
s = this.createComponent({
kind: i
}), s.controller.set("data", t), s.render();
},
create: function() {
this.inherited(arguments), this.sync();
},
initComponents: function() {
var e = this.kindComponents || this.components || [], t = function(e) {
return e.length > 1 ? {
components: e
} : e[0];
}(e), n = t.mixins || [];
t.mixins = enyo.merge(n, this.childMixins), this.kindComponents = this.components = null, this.inherited(arguments), delete t.name, this.child = enyo.kind(t), this.child.prototype.controller || (this.child.prototype.controller = this.defaultChildController);
},
repeaterDidAdd: function(e, t) {
var n = t.values, r = enyo.keys(n), i = 0, s = r.length, o;
for (; i < s; ++i) o = r[i], this.update(o, n[o]);
},
repeaterDidRemove: function(e, t) {
var n = t.values, r = enyo.keys(n), i = r.length, s = 0, o = this.get("data"), u;
for (; s < i; ++s) u = r[s], this.update(u, o[u]);
this.prune();
},
repeaterDidChange: function(e, t) {
var n = t.values, r = enyo.keys(n), i, s = r.length, o = this.children, u, a = 0;
for (; a < s; ++a) {
i = r[a], u = o[i];
if (!u) continue;
u.controller.set("data", n[i]);
}
},
repeaterDidReset: function(e, t) {
this.sync(), this.prune();
}
});

// CollectionRepeater.js

enyo.kind({
name: "enyo.CollectionRepeater",
kind: "wip.Repeater",
collection: null,
model: null,
defaultChildController: "enyo.ModelController"
});

// CollectionList.js

enyo.kind({
name: "enyo.CollectionList",
kind: "enyo.List",
multiselect: !1,
collection: null,
model: null,
defaultChildController: "enyo.ModelController",
childMixins: [ "enyo.AutoBindingSupport", "enyo.CollectionListRowSupport" ],
concat: "childMixins",
handlers: {
didadd: "repeaterDidAdd",
didremove: "repeaterDidRemove",
didreset: "repeaterDidReset",
didchange: "repeaterDidChange",
onSetupItem: "setupItem"
},
bindings: [ {
from: ".controller.length",
to: ".length"
}, {
from: ".length",
to: ".count"
}, {
from: ".controller.data",
to: ".data"
} ],
initComponents: function() {
var e = this.kindComponents || this.components || [], t = function(e) {
return e.length > 1 ? {
components: e
} : e[0];
}(e), n = t.mixins || [], r;
this.findAndInstance("defaultChildController"), t.controller = this.childController, t.mixins = enyo.merge(n, this.childMixins), this.components = [ t ], this.kindComponents = [], this.inherited(arguments);
},
defaultChildControllerFindAndInstance: function(e, t) {
this.childController = t;
},
decorateEvent: function(e, t, n) {
var r;
this.inherited(arguments), !isNaN(t.index) && this.controller && (r = this.controller.at(t.index), r ? t.model = r : t.model = null);
},
setupItem: function(e, t) {
var n = t.model;
!0 === t.selected && n ? this.controller.select(n) : !t.selected && n && n.set("selected", !1), n && this.childController.set("model", n);
},
lengthChanged: function(e, t) {
t && (0 === e && this.reset(), this.refresh());
},
repeaterDidChange: function(e, t) {
var n = t.values, r = enyo.keys(n), i, s = r.length, o = 0, u = this.get("data"), a;
for (; o < s; ++o) i = r[o], a = u[i], a && a.get("selected") !== this.isSelected(i) ? this.deselect(i) : this.renderRow(parseInt(i));
},
repeaterDidReset: function(e, t) {
this.reset();
},
repeaterDidRemove: function(e, t) {
var n = t.values, r = enyo.keys(n), i, s = 0, o = r.length, u = this.get("data"), a;
for (; s < o; ++s) i = r[s], a = n[i], a && a.changed && !1 === a.changed.selected && this.deselect(i);
}
});

// /Users/cdavis/Devel/experiments/HTML5tx/example1/source/generator.js

(function(e) {
var t = "abcdefghijklmnopqrstuvwxyz", n = "aeiou", r = "bcdfghjklmnpqrstvwxyz", i = function(e, t) {
return Math.round(Math.random() * 1e3 % ((t || 0) - (e || 0) || 1)) + (e || 0);
};
e.generator = {
letter: function() {
return t[i(0, 25)];
},
vowel: function() {
return n[i(0, 4)];
},
name: function() {
var e = i(4, 10), t = "";
while (e > -1) t.length ? ~r.indexOf(t.slice(-1)) ? t += this.vowel() : t += this.letter() : t += this.letter(), --e;
return t[0].toUpperCase() + t.slice(1);
},
person: function() {
var e = {};
return e.first = this.name(), e.last = this.name(), e.age = i(17, 99), e.email = e.first + "." + e.last + "@gmail.com", e;
}
};
})(window);
