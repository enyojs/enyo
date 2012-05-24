
// enyo.js

(function() {
var a = "enyo.js";
enyo = window.enyo || {}, enyo.locateScript = function(a) {
var b = document.getElementsByTagName("script");
for (var c = b.length - 1, d, e, f = a.length; c >= 0 && (d = b[c]); c--) if (!d.located) {
e = d.getAttribute("src") || "";
if (e.slice(-f) == a) return d.located = !0, {
path: e.slice(0, Math.max(0, e.lastIndexOf("/"))),
node: d
};
}
}, enyo.args = enyo.args || {};
var b = enyo.locateScript(a);
if (b) {
enyo.args.root = (enyo.args.root || b.path).replace("/source", "");
for (var c = 0, d; d = b.node.attributes.item(c); c++) enyo.args[d.nodeName] = d.value;
}
})();

// ../../loader.js

(function() {
enyo = window.enyo || {}, enyo.path = {
paths: {},
addPath: function(a, b) {
return this.paths[a] = b;
},
addPaths: function(a) {
if (a) for (var b in a) this.addPath(b, a[b]);
},
includeTrailingSlash: function(a) {
return a && a.slice(-1) !== "/" ? a + "/" : a;
},
rewritePattern: /\$([^\/\\]*)(\/)?/g,
rewrite: function(a) {
var b, c = this.includeTrailingSlash, d = this.paths, e = function(a, e) {
return b = !0, c(d[e]) || "";
}, f = a;
do b = !1, f = f.replace(this.rewritePattern, e); while (b);
return f;
}
}, enyo.loaderFactory = function(a) {
this.machine = a, this.packages = [], this.modules = [], this.sheets = [], this.stack = [];
}, enyo.loaderFactory.prototype = {
packageName: "",
packageFolder: "",
verbose: !1,
loadScript: function(a) {
this.machine.script(a);
},
loadSheet: function(a) {
this.machine.sheet(a);
},
loadPackage: function(a) {
this.machine.script(a);
},
report: function() {},
load: function() {
this.more({
index: 0,
depends: arguments || []
});
},
more: function(a) {
if (a && this.continueBlock(a)) return;
var b = this.stack.pop();
b ? (this.verbose && console.groupEnd("* finish package (" + (b.packageName || "anon") + ")"), this.packageFolder = b.folder, this.packageName = "", this.more(b)) : this.finish();
},
finish: function() {
this.packageFolder = "", this.verbose && console.log("-------------- fini");
},
continueBlock: function(a) {
while (a.index < a.depends.length) {
var b = a.depends[a.index++];
if (b) if (typeof b == "string") {
if (this.require(b, a)) return !0;
} else enyo.path.addPaths(b);
}
},
require: function(a, b) {
var c = enyo.path.rewrite(a), d = this.getPathPrefix(a);
c = d + c;
if (c.slice(-3) == "css") this.verbose && console.log("+ stylesheet: [" + d + "][" + a + "]"), this.requireStylesheet(c); else {
if (c.slice(-2) != "js" || c.slice(-10) == "package.js") return this.requirePackage(c, b), !0;
this.verbose && console.log("+ module: [" + d + "][" + a + "]"), this.requireScript(a, c);
}
},
getPathPrefix: function(a) {
var b = a.slice(0, 1);
return b != "/" && b != "\\" && b != "$" && a.slice(0, 5) != "http:" ? this.packageFolder : "";
},
requireStylesheet: function(a) {
this.sheets.push(a), this.loadSheet(a);
},
requireScript: function(a, b) {
this.modules.push({
packageName: this.packageName,
rawPath: a,
path: b
}), this.loadScript(b);
},
decodePackagePath: function(a) {
var b = "", c = "", d = "", e = "package.js", f = a.replace(/\\/g, "/").replace(/\/\//g, "/").replace(/:\//, "://").split("/");
if (f.length) {
var g = f.pop() || f.pop() || "";
g.slice(-e.length) !== e ? f.push(g) : e = g, d = f.join("/"), d = d ? d + "/" : "", e = d + e;
for (var h = f.length - 1; h >= 0; h--) if (f[h] == "source") {
f.splice(h, 1);
break;
}
c = f.join("/");
for (var h = f.length - 1, i; i = f[h]; h--) if (i == "lib" || i == "enyo") {
f = f.slice(h + 1);
break;
}
for (var h = f.length - 1, i; i = f[h]; h--) (i == ".." || i == ".") && f.splice(h, 1);
b = f.join("-");
}
return {
alias: b,
target: c,
folder: d,
manifest: e
};
},
aliasPackage: function(a) {
var b = this.decodePackagePath(a);
this.manifest = b.manifest, b.alias && (enyo.path.addPath(b.alias, b.target), this.packageName = b.alias, this.packages.push({
name: b.alias,
folder: b.folder
})), this.packageFolder = b.folder;
},
requirePackage: function(a, b) {
b.folder = this.packageFolder, this.aliasPackage(a), b.packageName = this.packageName, this.stack.push(b), this.report("loading package", this.packageName), this.verbose && console.group("* start package [" + this.packageName + "]"), this.loadPackage(this.manifest);
}
};
})();

// boot.js

enyo.machine = {
sheet: function(a) {
document.write('<link href="' + a + '" media="screen" rel="stylesheet" type="text/css" />');
},
script: function(a, b, c) {
document.write('<script src="' + a + '"' + (b ? ' onload="' + b + '"' : "") + (c ? ' onerror="' + c + '"' : "") + "></scri" + "pt>");
},
inject: function(a) {
document.write('<script type="text/javascript">' + a + "</script>");
}
}, enyo.loader = new enyo.loaderFactory(enyo.machine), enyo.depends = function() {
var a = enyo.loader;
if (!a.packageFolder) {
var b = enyo.locateScript("package.js");
b && b.path && (a.aliasPackage(b.path), a.packageFolder = b.path + "/");
}
a.load.apply(a, arguments);
}, enyo.path.addPaths({
enyo: enyo.args.root,
lib: "$enyo/../lib"
});

// log.js

enyo.logging = {
level: 99,
levels: {
log: 20,
warn: 10,
error: 0
},
shouldLog: function(a) {
var b = parseInt(this.levels[a], 0);
return b <= this.level;
},
_log: function(a, b) {
var c = enyo.isArray(b) ? b : enyo.cloneArray(b);
enyo.dumbConsole && (c = [ c.join(" ") ]);
var d = console[a];
d && d.apply ? d.apply(console, c) : console.log.apply ? console.log.apply(console, c) : console.log(c.join(" "));
},
log: function(a, b) {
window.console && this.shouldLog(a) && this._log(a, b);
}
}, enyo.setLogLevel = function(a) {
var b = parseInt(a, 0);
isFinite(b) && (enyo.logging.level = b);
}, enyo.log = function() {
enyo.logging.log("log", arguments);
}, enyo.warn = function() {
enyo.logging.log("warn", arguments);
}, enyo.error = function() {
enyo.logging.log("error", arguments);
};

// lang.js

(function() {
enyo.global = this, enyo._getProp = function(a, b, c) {
var d = c || enyo.global;
for (var e = 0, f; d && (f = a[e]); e++) d = f in d ? d[f] : b ? d[f] = {} : undefined;
return d;
}, enyo.setObject = function(a, b, c) {
var d = a.split("."), e = d.pop(), f = enyo._getProp(d, !0, c);
return f && e ? f[e] = b : undefined;
}, enyo.getObject = function(a, b, c) {
return enyo._getProp(a.split("."), b, c);
}, enyo.irand = function(a) {
return Math.floor(Math.random() * a);
}, enyo.cap = function(a) {
return a.slice(0, 1).toUpperCase() + a.slice(1);
}, enyo.uncap = function(a) {
return a.slice(0, 1).toLowerCase() + a.slice(1);
}, enyo.format = function(a) {
var b = /\%./g, c = 0, d = a, e = arguments, f = function(a) {
return e[++c];
};
return d.replace(b, f);
};
var a = Object.prototype.toString;
enyo.isString = function(b) {
return a.call(b) === "[object String]";
}, enyo.isFunction = function(b) {
return a.call(b) === "[object Function]";
}, enyo.isArray = Array.isArray || function(b) {
return a.call(b) === "[object Array]";
}, enyo.indexOf = function(a, b, c) {
if (b.indexOf) return b.indexOf(a, c);
if (c) {
c < 0 && (c = 0);
if (c > b.length) return -1;
}
for (var d = c || 0, e = b.length, f; (f = b[d]) || d < e; d++) if (f == a) return d;
return -1;
}, enyo.remove = function(a, b) {
var c = enyo.indexOf(a, b);
c >= 0 && b.splice(c, 1);
}, enyo.forEach = function(a, b, c) {
if (a) {
var d = c || this;
if (enyo.isArray(a) && a.forEach) a.forEach(b, d); else {
var e = Object(a), f = e.length >>> 0;
for (var g = 0; g < f; g++) g in e && b.call(d, e[g], g, e);
}
}
}, enyo.map = function(a, b, c) {
var d = c || this;
if (enyo.isArray(a) && a.map) return a.map(b, d);
var e = [], f = function(a, c, f) {
e.push(b.call(d, a, c, f));
};
return enyo.forEach(a, f, d), e;
}, enyo.filter = function(a, b, c) {
var d = c || this;
if (enyo.isArray(a) && a.filter) return a.filter(b, d);
var e = [], f = function(a, c, f) {
var g = a;
b.call(d, a, c, f) && e.push(g);
};
return enyo.forEach(a, f, d), e;
}, enyo.keys = Object.keys || function(a) {
var b = [], c = Object.prototype.hasOwnProperty;
for (var d in a) c.call(a, d) && b.push(d);
if (!{
toString: null
}.propertyIsEnumerable("toString")) {
var e = [ "toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "constructor" ];
for (var f = 0, g; g = donEnums[f]; f++) c.call(a, g) && b.push(g);
}
return b;
}, enyo.cloneArray = function(a, b, c) {
var d = c || [];
for (var e = b || 0, f = a.length; e < f; e++) d.push(a[e]);
return d;
}, enyo.toArray = enyo.cloneArray, enyo.clone = function(a) {
return enyo.isArray(a) ? enyo.cloneArray(a) : enyo.mixin({}, a);
};
var b = {};
enyo.mixin = function(a, c) {
a = a || {};
if (c) {
var d, e, f;
for (d in c) e = c[d], b[d] !== e && (a[d] = e);
}
return a;
}, enyo.bind = function(a, b) {
b || (b = a, a = null), a = a || enyo.global;
if (enyo.isString(b)) {
if (!a[b]) throw [ 'enyo.bind: scope["', b, '"] is null (scope="', a, '")' ].join("");
b = a[b];
}
if (enyo.isFunction(b)) {
var c = enyo.cloneArray(arguments, 2);
return b.bind ? b.bind.apply(b, [ a ].concat(c)) : function() {
var d = enyo.cloneArray(arguments);
return b.apply(a, c.concat(d));
};
}
throw [ 'enyo.bind: scope["', b, '"] is not a function (scope="', a, '")' ].join("");
}, enyo.asyncMethod = function(a, b) {
return setTimeout(enyo.bind.apply(enyo, arguments), 1);
}, enyo.call = function(a, b, c) {
var d = a || this;
if (b) {
var e = d[b] || b;
if (e && e.apply) return e.apply(d, c || []);
}
}, enyo.now = Date.now || function() {
return (new Date).getTime();
}, enyo.nop = function() {}, enyo.nob = {}, enyo.nar = [], enyo.instance = function() {}, enyo.setPrototype || (enyo.setPrototype = function(a, b) {
a.prototype = b;
}), enyo.delegate = function(a) {
return enyo.setPrototype(enyo.instance, a), new enyo.instance;
};
})();

// job.js

enyo.job = function(a, b, c) {
enyo.job.stop(a), enyo.job._jobs[a] = setTimeout(function() {
enyo.job.stop(a), b();
}, c);
}, enyo.job.stop = function(a) {
enyo.job._jobs[a] && (clearTimeout(enyo.job._jobs[a]), delete enyo.job._jobs[a]);
}, enyo.job._jobs = {};

// macroize.js

enyo.macroize = function(a, b, c) {
var d, e, f = a, g = c || enyo.macroize.pattern, h = function(a, c) {
return d = enyo.getObject(c, !1, b), d === undefined || d === null ? "{$" + c + "}" : (e = !0, d);
}, i = 0;
do {
e = !1, f = f.replace(g, h);
if (++i >= 20) throw "enyo.macroize: recursion too deep";
} while (e);
return f;
}, enyo.quickMacroize = function(a, b, c) {
var d, e, f = a, g = c || enyo.macroize.pattern, h = function(a, c) {
return c in b ? d = b[c] : d = enyo.getObject(c, !1, b), d === undefined || d === null ? "{$" + c + "}" : d;
};
return f = f.replace(g, h), f;
}, enyo.macroize.pattern = /\{\$([^{}]*)\}/g;

// animation.js

(function() {
var a = Math.round(1e3 / 60), b = [ "webkit", "moz", "ms", "o", "" ], c = "requestAnimationFrame", d = "cancel" + enyo.cap(c), e = function(b) {
return window.setTimeout(b, a);
}, f = function(a) {
return window.clearTimeout(a);
};
for (var g = 0, h = b.length, i, j, k; (i = b[g]) || g < h; g++) {
j = i ? i + enyo.cap(d) : d, k = i ? i + enyo.cap(c) : c;
if (window[j]) {
f = window[j], e = window[k], i == "webkit" && f(e(enyo.nop));
break;
}
}
enyo.requestAnimationFrame = function(a, b) {
return e(a, b);
}, enyo.cancelRequestAnimationFrame = function(a) {
return f(a);
};
})(), enyo.easing = {
cubicIn: function(a) {
return Math.pow(a, 3);
},
cubicOut: function(a) {
return Math.pow(a - 1, 3) + 1;
},
expoOut: function(a) {
return a == 1 ? 1 : -1 * Math.pow(2, -10 * a) + 1;
},
quadInOut: function(a) {
return a *= 2, a < 1 ? Math.pow(a, 2) / 2 : -1 * (--a * (a - 2) - 1) / 2;
},
linear: function(a) {
return a;
}
}, enyo.easedLerp = function(a, b, c) {
var d = (enyo.now() - a) / b;
return d >= 1 ? 1 : c(d);
};

// Oop.js

enyo.kind = function(a) {
enyo._kindCtors = {};
var b = a.name || "";
delete a.name;
var c = "kind" in a, d = a.kind;
delete a.kind;
var e = enyo.constructorForKind(d), f = e && e.prototype || null;
if (c && d !== null && e == null) throw "enyo.kind: Attempt to subclass an undefined kind. Check dependencies for [" + b + "].";
var g = enyo.kind.makeCtor();
return a.hasOwnProperty("constructor") && (a._constructor = a.constructor, delete a.constructor), enyo.setPrototype(g, f ? enyo.delegate(f) : {}), enyo.mixin(g.prototype, a), g.prototype.kindName = b, g.prototype.base = e, g.prototype.ctor = g, enyo.forEach(enyo.kind.features, function(b) {
b(g, a);
}), enyo.setObject(b, g), g;
}, enyo.kind.makeCtor = function() {
return function() {
var a;
this._constructor && (a = this._constructor.apply(this, arguments)), this.constructed && this.constructed.apply(this, arguments);
if (a) return a;
};
}, enyo.kind.defaultNamespace = "enyo", enyo.kind.features = [], enyo.kind.features.push(function(a, b) {
var c = a.prototype;
c.inherited || (c.inherited = enyo.kind.inherited);
if (c.base) for (var d in b) {
var e = b[d];
enyo.isFunction(e) && (e._inherited = c.base.prototype[d] || enyo.nop, e.nom = c.kindName + "." + d + "()");
}
}), enyo.kind.inherited = function(a, b) {
return a.callee._inherited.apply(this, b || a);
}, enyo.kind.features.push(function(a, b) {
enyo.mixin(a, enyo.kind.statics), b.statics && (enyo.mixin(a, b.statics), delete a.prototype.statics);
var c = a.prototype.base;
while (c) c.subclass(a, b), c = c.prototype.base;
}), enyo.kind.statics = {
subclass: function(a, b) {},
extend: function(a) {
enyo.mixin(this.prototype, a);
var b = this;
enyo.forEach(enyo.kind.features, function(c) {
c(b, a);
});
}
}, enyo._kindCtors = {}, enyo.constructorForKind = function(a) {
if (a === null || enyo.isFunction(a)) return a;
if (a) {
var b = enyo._kindCtors[a];
return b ? b : enyo._kindCtors[a] = enyo.Theme[a] || enyo[a] || enyo.getObject(a, !1, enyo) || window[a] || enyo.getObject(a);
}
return enyo.defaultCtor;
}, enyo.Theme = {}, enyo.registerTheme = function(a) {
enyo.mixin(enyo.Theme, a);
};

// Object.js

enyo.kind({
name: "enyo.Object",
kind: null,
constructor: function() {
enyo._objectCount++;
},
setPropertyValue: function(a, b, c) {
if (this[c]) {
var d = this[a];
this[a] = b, this[c](d);
} else this[a] = b;
},
_setProperty: function(a, b, c) {
this.setPropertyValue(a, b, this.getProperty(a) !== b && c);
},
destroyObject: function(a) {
this[a] && this[a].destroy && this[a].destroy(), this[a] = null;
},
getProperty: function(a) {
var b = "get" + enyo.cap(a);
return this[b] ? this[b]() : this[a];
},
setProperty: function(a, b) {
var c = "set" + enyo.cap(a);
this[c] ? this[c](b) : this._setProperty(a, b, a + "Changed");
},
log: function() {
var a = arguments.callee.caller, b = ((a ? a.nom : "") || "(instance method)") + ":";
enyo.logging.log("log", [ b ].concat(enyo.cloneArray(arguments)));
},
warn: function() {
this._log("warn", arguments);
},
error: function() {
this._log("error", arguments);
},
_log: function(a, b) {
if (enyo.logging.shouldLog(a)) try {
throw new Error;
} catch (c) {
enyo.logging._log(a, [ b.callee.caller.nom + ": " ].concat(enyo.cloneArray(b))), console.log(c.stack);
}
}
}), enyo._objectCount = 0, enyo.Object.subclass = function(a, b) {
this.publish(a, b);
}, enyo.Object.publish = function(a, b) {
var c = b.published;
if (c) {
var d = a.prototype;
for (var e in c) enyo.Object.addGetterSetter(e, c[e], d);
}
}, enyo.Object.addGetterSetter = function(a, b, c) {
var d = a;
c[d] = b;
var e = enyo.cap(d), f = "get" + e;
c[f] || (c[f] = function() {
return this[d];
});
var g = "set" + e, h = d + "Changed";
c[g] || (c[g] = function(a) {
this._setProperty(d, a, h);
});
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
_kindPrefixi: {}
},
defaultKind: "Component",
handlers: {},
toString: function() {
return this.kindName;
},
constructor: function() {
this._componentNameMap = {}, this.$ = {}, this.inherited(arguments);
},
constructed: function(a) {
this.importProps(a), this.create();
},
importProps: function(a) {
if (a) for (var b in a) this[b] = a[b];
this.handlers = enyo.mixin(enyo.clone(this.kindHandlers), this.handlers);
},
create: function() {
this.ownerChanged(), this.initComponents();
},
initComponents: function() {
this.createChrome(this.kindComponents), this.createClientComponents(this.components);
},
createChrome: function(a) {
this.createComponents(a, {
isChrome: !0
});
},
createClientComponents: function(a) {
this.createComponents(a, {
owner: this.getInstanceOwner()
});
},
getInstanceOwner: function() {
return !this.owner || this.owner.notInstanceOwner ? this : this.owner;
},
destroy: function() {
this.destroyComponents(), this.setOwner(null), this.destroyed = !0;
},
destroyComponents: function() {
enyo.forEach(this.getComponents(), function(a) {
a.destroyed || a.destroy();
});
},
makeId: function() {
var a = "_", b = this.owner && this.owner.getId();
return this.name ? (b ? b + a : "") + this.name : "";
},
ownerChanged: function(a) {
a && a.removeComponent(this), this.owner && this.owner.addComponent(this), this.id || (this.id = this.makeId());
},
nameComponent: function(a) {
var b = enyo.Component.prefixFromKindName(a.kindName), c, d = this._componentNameMap[b] || 0;
do c = b + (++d > 1 ? String(d) : ""); while (this.$[c]);
return this._componentNameMap[b] = Number(d), a.name = c;
},
addComponent: function(a) {
var b = a.getName();
b || (b = this.nameComponent(a)), this.$[b] && this.warn('Duplicate component name "' + b + '" in owner "' + this.id + '" violates unique-name-under-owner rule, replacing existing component in the hash and continuing, but this is an error condition and should be fixed.'), this.$[b] = a;
},
removeComponent: function(a) {
delete this.$[a.getName()];
},
getComponents: function() {
var a = [];
for (var b in this.$) a.push(this.$[b]);
return a;
},
adjustComponentProps: function(a) {
this.defaultProps && enyo.mixin(a, this.defaultProps), a.kind = a.kind || a.isa || this.defaultKind, a.owner = a.owner || this;
},
_createComponent: function(a, b) {
var c = enyo.mixin(enyo.clone(b), a);
return this.adjustComponentProps(c), enyo.Component.create(c);
},
createComponent: function(a, b) {
return this._createComponent(a, b);
},
createComponents: function(a, b) {
if (a) {
var c = [];
for (var d = 0, e; e = a[d]; d++) c.push(this._createComponent(e, b));
return c;
}
},
getBubbleTarget: function() {
return this.owner;
},
bubble: function(a, b, c) {
var d = b || {};
return "originator" in d || (d.originator = c || this), this.dispatchBubble(a, d, c);
},
dispatchBubble: function(a, b, c) {
return this.dispatchEvent(a, b, c) ? !0 : this.bubbleUp(a, b, c);
},
bubbleUp: function(a, b, c) {
var d = this.getBubbleTarget();
return d ? d.dispatchBubble(a, b, this) : !1;
},
dispatchEvent: function(a, b, c) {
this.decorateEvent(a, b, c);
if (this.handlers[a] && this.dispatch(this.handlers[a], b, c)) return !0;
if (this[a]) return this.bubbleDelegation(this.owner, this[a], a, b, this);
},
decorateEvent: function(a, b, c) {},
bubbleDelegation: function(a, b, c, d, e) {
var f = this.getBubbleTarget();
if (f) return f.delegateEvent(a, b, c, d, e);
},
delegateEvent: function(a, b, c, d, e) {
return this.decorateEvent(c, d, e), a == this ? this.dispatch(b, d, e) : this.bubbleDelegation(a, b, c, d, e);
},
dispatch: function(a, b, c) {
var d = a && this[a];
if (d) return d.call(this, c || this, b);
},
waterfall: function(a, b, c) {
if (this.dispatchEvent(a, b, c)) return !0;
this.waterfallDown(a, b, c || this);
},
waterfallDown: function(a, b, c) {
for (var d in this.$) this.$[d].waterfall(a, b, c);
}
}), enyo.defaultCtor = enyo.Component, enyo.create = enyo.Component.create = function(a) {
if (!a.kind && "kind" in a) throw "enyo.create: Attempt to create a null kind. Check dependencies.";
var b = a.kind || a.isa || enyo.defaultCtor, c = enyo.constructorForKind(b);
return c || (console.error('no constructor found for kind "' + b + '"'), c = enyo.Component), new c(a);
}, enyo.Component.subclass = function(a, b) {
var c = a.prototype;
b.components && (c.kindComponents = b.components, delete c.components);
if (b.handlers) {
var d = c.kindHandlers;
c.kindHandlers = enyo.mixin(enyo.clone(d), c.handlers), c.handlers = null;
}
b.events && this.publishEvents(a, b);
}, enyo.Component.publishEvents = function(a, b) {
var c = b.events;
if (c) {
var d = a.prototype;
for (var e in c) this.addEvent(e, c[e], d);
}
}, enyo.Component.addEvent = function(a, b, c) {
var d, e;
enyo.isString(b) ? (a.slice(0, 2) != "on" && (console.warn("enyo.Component.addEvent: event names must start with 'on'. " + c.kindName + " event '" + a + "' was auto-corrected to 'on" + a + "'."), a = "on" + a), d = b, e = "do" + enyo.cap(a.slice(2))) : (d = b.value, e = b.caller), c[a] = d, c[e] || (c[e] = function(b) {
return this.bubble(a, b);
});
}, enyo.Component.prefixFromKindName = function(a) {
var b = enyo.Component._kindPrefixi[a];
if (!b) {
var c = a.lastIndexOf(".");
b = c >= 0 ? a.slice(c + 1) : a, b = b.charAt(0).toLowerCase() + b.slice(1), enyo.Component._kindPrefixi[a] = b;
}
return b;
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
create: function() {
this.controls = [], this.children = [], this.containerChanged(), this.inherited(arguments), this.layoutKindChanged();
},
destroy: function() {
this.destroyClientControls(), this.setContainer(null), this.inherited(arguments);
},
importProps: function(a) {
this.inherited(arguments), this.owner || (this.owner = enyo.master);
},
createComponents: function() {
var a = this.inherited(arguments);
return this.discoverControlParent(), a;
},
discoverControlParent: function() {
this.controlParent = this.$[this.controlParentName] || this.controlParent;
},
adjustComponentProps: function(a) {
a.container = a.container || this, this.inherited(arguments);
},
containerChanged: function(a) {
a && a.removeControl(this), this.container && this.container.addControl(this);
},
parentChanged: function(a) {
a && a != this.parent && a.removeChild(this);
},
isDescendantOf: function(a) {
var b = this;
while (b && b != a) b = b.parent;
return a && b == a;
},
getControls: function() {
return this.controls;
},
getClientControls: function() {
var a = [];
for (var b = 0, c = this.controls, d; d = c[b]; b++) d.isChrome || a.push(d);
return a;
},
destroyClientControls: function() {
var a = this.getClientControls();
for (var b = 0, c; c = a[b]; b++) c.destroy();
},
addControl: function(a) {
this.controls.push(a), this.addChild(a);
},
removeControl: function(a) {
return a.setParent(null), enyo.remove(a, this.controls);
},
indexOfControl: function(a) {
return enyo.indexOf(a, this.controls);
},
indexOfClientControl: function(a) {
return enyo.indexOf(a, this.getClientControls());
},
indexInContainer: function() {
return this.container.indexOfControl(this);
},
clientIndexInContainer: function() {
return this.container.indexOfClientControl(this);
},
controlAtIndex: function(a) {
return this.controls[a];
},
addChild: function(a) {
this.controlParent ? this.controlParent.addChild(a) : (a.setParent(this), this.children[this.prepend ? "unshift" : "push"](a));
},
removeChild: function(a) {
return enyo.remove(a, this.children);
},
indexOfChild: function(a) {
return enyo.indexOf(a, this.children);
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
this.waterfall("onresize"), this.waterfall("onpostresize");
},
resizeHandler: function() {
this.reflow();
},
waterfallDown: function(a, b, c) {
for (var d in this.$) this.$[d] instanceof enyo.UiComponent || this.$[d].waterfall(a, b, c);
for (var e = 0, f = this.children, g; g = f[e]; e++) g.waterfall(a, b, c);
},
getBubbleTarget: function() {
return this.parent;
}
}), enyo.createFromKind = function(a, b) {
var c = a && enyo.constructorForKind(a);
if (c) return new c(b);
}, enyo.master = new enyo.Component({
name: "master",
notInstanceOwner: !0,
getId: function() {
return "";
},
isDescendantOf: enyo.nop,
bubble: function(a, b, c) {
a == "onresize" ? (enyo.master.waterfallDown("onresize"), enyo.master.waterfallDown("onpostresize")) : enyo.Signals.send(a, b);
}
});

// Layout.js

enyo.kind({
name: "enyo.Layout",
kind: null,
layoutClass: "",
constructor: function(a) {
this.container = a, a && a.addClass(this.layoutClass);
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
notify: function(a, b) {
this.dispatchEvent(a, b);
},
statics: {
listeners: [],
addListener: function(a) {
this.listeners.push(a);
},
removeListener: function(a) {
enyo.remove(a, this.listeners);
},
send: function(a, b) {
enyo.forEach(this.listeners, function(c) {
c.notify(a, b);
});
}
}
});

// Async.js

enyo.kind({
name: "enyo.Async",
kind: enyo.Object,
failed: !1,
context: null,
constructor: function() {
this.responders = [], this.errorHandlers = [];
},
accumulate: function(a, b) {
var c = b.length < 2 ? b[0] : enyo.bind(b[0], b[1]);
a.push(c);
},
response: function() {
return this.accumulate(this.responders, arguments), this;
},
error: function() {
return this.accumulate(this.errorHandlers, arguments), this;
},
route: function(a, b) {
var c = enyo.bind(this, "respond");
a.response(function(a, b) {
c(b);
});
var d = enyo.bind(this, "fail");
a.error(function(a, b) {
d(b);
}), a.go(b);
},
handle: function(a, b) {
var c = b.shift();
if (c) if (c instanceof enyo.Async) this.route(c, a); else {
var d = enyo.call(this.context || this, c, [ this, a ]);
d = d !== undefined ? d : a, (this.failed ? this.fail : this.respond).call(this, d);
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
respond: function(a) {
this.failed = !1, this.endTimer(), this.handle(a, this.responders);
},
fail: function(a) {
this.failed = !0, this.endTimer(), this.handle(a, this.errorHandlers);
},
recover: function() {
this.failed = !1;
},
go: function(a) {
return enyo.asyncMethod(this, function() {
this.respond(a);
}), this;
}
});

// json.js

enyo.json = {
stringify: function(a, b, c) {
return JSON.stringify(a, b, c);
},
parse: function(a, b) {
return a ? JSON.parse(a, b) : null;
}
};

// cookie.js

enyo.getCookie = function(a) {
var b = document.cookie.match(new RegExp("(?:^|; )" + a + "=([^;]*)"));
return b ? decodeURIComponent(b[1]) : undefined;
}, enyo.setCookie = function(a, b, c) {
var d = a + "=" + encodeURIComponent(b), e = c || {}, f = e.expires;
if (typeof f == "number") {
var g = new Date;
g.setTime(g.getTime() + f * 24 * 60 * 60 * 1e3), f = g;
}
f && f.toUTCString && (e.expires = f.toUTCString());
var h, i;
for (h in e) d += "; " + h, i = e[h], i !== !0 && (d += "=" + i);
document.cookie = d;
};

// xhr.js

enyo.xhr = {
request: function(a) {
var b = this.getXMLHttpRequest(), c = a.method || "GET", d = "sync" in a ? !a.sync : !0;
a.username ? b.open(c, enyo.path.rewrite(a.url), d, a.username, a.password) : b.open(c, enyo.path.rewrite(a.url), d), enyo.mixin(b, a.xhrFields), this.makeReadyStateHandler(b, a.callback);
if (a.headers) for (var e in a.headers) b.setRequestHeader(e, a.headers[e]);
return b.send(a.body || null), d || b.onreadystatechange(b), b;
},
makeReadyStateHandler: function(a, b) {
a.onreadystatechange = function() {
a.readyState == 4 && b && b.apply(null, [ a.responseText, a ]);
};
},
getXMLHttpRequest: function() {
try {
return new XMLHttpRequest;
} catch (a) {}
try {
return new ActiveXObject("Msxml2.XMLHTTP");
} catch (a) {}
try {
return new ActiveXObject("Microsoft.XMLHTTP");
} catch (a) {}
return null;
}
};

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
xhrFields: null
};

// Ajax.js

enyo.kind({
name: "enyo.Ajax",
kind: enyo.Async,
published: enyo.AjaxProperties,
constructor: function(a) {
enyo.mixin(this, a), this.inherited(arguments);
},
go: function(a) {
return this.startTimer(), this.request(a), this;
},
request: function(a) {
var b = this.url.split("?"), c = b.shift() || "", d = b.join("?").split("&"), e = enyo.isString(a) ? a : enyo.Ajax.objectToQuery(a);
this.method == "GET" && (e && (d.push(e), e = null), this.cacheBust && d.push(Math.random()));
var f = [ c, d.join("&") ].join("?"), g = {
"Content-Type": this.contentType
};
enyo.mixin(g, this.headers), this.xhr = enyo.xhr.request({
url: f,
method: this.method,
callback: enyo.bind(this, "receive"),
body: this.postBody || e,
headers: g,
sync: window.PalmSystem ? !1 : this.sync,
username: this.username,
password: this.password,
xhrFields: this.xhrFields
});
},
receive: function(a, b) {
this.destroyed || (this.isFailure(b) ? this.fail(b.status) : this.respond(this.xhrToResponse(b)));
},
xhrToResponse: function(a) {
if (a) return this[(this.handleAs || "text") + "Handler"](a);
},
isFailure: function(a) {
return a.status !== 0 && (a.status < 200 || a.status >= 300);
},
xmlHandler: function(a) {
return a.responseXML;
},
textHandler: function(a) {
return a.responseText;
},
jsonHandler: function(a) {
var b = a.responseText;
try {
return b && enyo.json.parse(b);
} catch (c) {
return console.warn("Ajax request set to handleAs JSON but data was not in JSON format"), b;
}
},
statics: {
objectToQuery: function(a) {
var b = encodeURIComponent, c = [], d = {};
for (var e in a) {
var f = a[e];
if (f != d[e]) {
var g = b(e) + "=";
if (enyo.isArray(f)) for (var h = 0; h < f.length; h++) c.push(g + b(f[h])); else c.push(g + b(f));
}
}
return c.join("&");
}
}
});

// Jsonp.js

enyo.kind({
name: "enyo.JsonpRequest",
kind: enyo.Async,
published: {
url: "",
callbackName: "callback"
},
statics: {
nextCallbackID: 0,
addScriptElement: function(a) {
var b = document.createElement("script");
b.src = a;
var c = document.getElementsByTagName("script")[0];
return c.parentNode.insertBefore(b, c), b;
},
removeElement: function(a) {
a.parentNode.removeChild(a);
}
},
constructor: function(a) {
enyo.mixin(this, a), this.inherited(arguments);
},
go: function(a) {
return this.startTimer(), this.jsonp(a), this;
},
jsonp: function(a) {
var b = "enyo_jsonp_callback_" + enyo.JsonpRequest.nextCallbackID++, c = this.buildUrl(a, b), d = enyo.JsonpRequest.addScriptElement(c);
window[b] = enyo.bind(this, this.respond);
var e = function() {
enyo.JsonpRequest.removeElement(d), window[b] = null;
};
this.response(e), this.error(e);
},
buildUrl: function(a, b) {
var c = this.url.split("?"), d = c.shift() || "", e = c.join("?").split("&"), f = this.bodyArgsFromParams(a, b);
return e.push(f), [ d, e.join("&") ].join("?");
},
bodyArgsFromParams: function(a, b) {
if (enyo.isString(a)) return a.replace("=?", "=" + b);
var c = enyo.mixin({}, a);
return c[this.callbackName] = b, enyo.Ajax.objectToQuery(c);
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
callback: "callback"
},
events: {
onResponse: "",
onError: ""
},
constructor: function(a) {
this.inherited(arguments);
},
send: function(a) {
return this.jsonp ? this.sendJsonp(a) : this.sendAjax(a);
},
sendJsonp: function(a) {
var b = new enyo.JsonpRequest;
for (var c in [ "url", "callback" ]) b[c] = this[c];
return this.sendAsync(ajax, a);
},
sendAjax: function(a) {
var b = new enyo.Ajax;
for (var c in enyo.AjaxProperties) b[c] = this[c];
return this.sendAsync(b, a);
},
sendAsync: function(a, b) {
return a.go(b).response(this, "response").error(this, "error");
},
response: function(a, b) {
this.doResponse({
ajax: a,
data: b
});
},
error: function(a, b) {
this.doError({
ajax: a,
data: b
});
}
});

// dom.js

enyo.requiresWindow = function(a) {
a();
}, enyo.dom = {
byId: function(a, b) {
return typeof a == "string" ? (b || document).getElementById(a) : a;
},
escape: function(a) {
return a !== null ? String(a).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
},
getComputedStyle: function(a) {
return window.getComputedStyle && window.getComputedStyle(a, null);
},
getComputedStyleValue: function(a, b, c) {
var d = c || this.getComputedStyle(a);
return d.getPropertyValue(b);
},
getFirstElementByTagName: function(a) {
var b = document.getElementsByTagName(a);
return b && b[0];
},
applyBodyFit: function() {
var a = this.getFirstElementByTagName("html");
a && (a.className += " enyo-document-fit");
var b = this.getFirstElementByTagName("body");
b && (b.className += " enyo-body-fit"), enyo.bodyIsFitting = !0;
}
};

// transform.js

enyo.mixin(enyo.dom, {
canAccelerate: function() {
return this.accelerando !== undefined ? this.accelerando : document.body && (this.accelerando = this.calcCanAccelerate());
},
calcCanAccelerate: function() {
if (enyo.platform.android <= 2) return !1;
var a = [ "perspective", "msPerspective", "MozPerspective", "WebkitPerspective", "OPerspective" ];
for (var b = 0, c; c = a[b]; b++) if (typeof document.body.style[c] != "undefined") return !0;
return !1;
},
cssTransformProps: [ "-webkit-transform", "-moz-transform", "-ms-transform", "-o-transform", "transform" ],
styleTransformProps: [ "webkitTransform", "MozTransform", "msTransform", "OTransform", "transform" ],
getCssTransformProp: function() {
if (this._cssTransformProp) return this._cssTransformProp;
var a = enyo.indexOf(this.getStyleTransformProp(), this.styleTransformProps);
return this._cssTransformProp = this.cssTransformProps[a];
},
getStyleTransformProp: function() {
if (this._styleTransformProp || !document.body) return this._styleTransformProp;
for (var a = 0, b; b = this.styleTransformProps[a]; a++) if (typeof document.body.style[b] != "undefined") return this._styleTransformProp = b;
},
transformValue: function(a, b, c) {
var d = a.domTransforms = a.domTransforms || {};
d[b] = c, this.transformsToDom(a);
},
accelerate: function(a, b) {
var c = b == "auto" ? this.canAccelerate() : b;
this.transformValue(a, "translateZ", c ? 0 : null);
},
transform: function(a, b) {
var c = a.domTransforms = a.domTransforms || {};
enyo.mixin(c, b), this.transformsToDom(a);
},
domTransformsToCss: function(a) {
var b, c, d = "";
for (b in a) c = a[b], c !== null && c !== undefined && c !== "" && (d += b + "(" + c + ") ");
return d;
},
transformsToDom: function(a) {
var b = this.domTransformsToCss(a.domTransforms), c = a.hasNode() ? a.node.style : null, d = a.domStyles, e = this.getStyleTransformProp(), f = this.getCssTransformProp();
e && f && (d[f] = b, c ? c[e] = b : a.domStylesChanged());
}
});

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
fit: !1,
isContainer: !1
},
handlers: {
ontap: "tap"
},
defaultKind: "Control",
controlClasses: "",
node: null,
generated: !1,
create: function() {
this.initStyles(), this.inherited(arguments), this.showingChanged(), this.addClass(this.kindClasses), this.addClass(this.classes), this.initProps([ "id", "content", "src" ]);
},
destroy: function() {
this.removeNodeFromDom(), this.inherited(arguments);
},
importProps: function(a) {
this.inherited(arguments), this.attributes = enyo.mixin(enyo.clone(this.kindAttributes), this.attributes);
},
initProps: function(a) {
for (var b = 0, c, d; c = a[b]; b++) this[c] && (d = c + "Changed", this[d] && this[d]());
},
classesChanged: function(a) {
this.removeClass(a), this.addClass(this.classes);
},
addChild: function(a) {
a.addClass(this.controlClasses), this.inherited(arguments);
},
removeChild: function(a) {
this.inherited(arguments), a.removeClass(this.controlClasses);
},
strictlyInternalEvents: {
onenter: 1,
onleave: 1
},
dispatchEvent: function(a, b, c) {
return this.strictlyInternalEvents[a] && this.isInternalEvent(b) ? !0 : this.inherited(arguments);
},
isInternalEvent: function(a) {
var b = enyo.dispatcher.findDispatchTarget(a.relatedTarget);
return b && b.isDescendantOf(this);
},
hasNode: function() {
return this.generated && (this.node || this.findNodeById());
},
addContent: function(a) {
this.setContent(this.content + a);
},
getAttribute: function(a) {
return this.hasNode() ? this.node.getAttribute(a) : this.attributes[a];
},
setAttribute: function(a, b) {
this.attributes[a] = b, this.hasNode() && this.attributeToNode(a, b), this.invalidateTags();
},
getNodeProperty: function(a, b) {
return this.hasNode() ? this.node[a] : b;
},
setNodeProperty: function(a, b) {
this.hasNode() && (this.node[a] = b);
},
setClassAttribute: function(a) {
this.setAttribute("class", a);
},
getClassAttribute: function() {
return this.attributes["class"] || "";
},
hasClass: function(a) {
return a && (" " + this.getClassAttribute() + " ").indexOf(" " + a + " ") >= 0;
},
addClass: function(a) {
if (a && !this.hasClass(a)) {
var b = this.getClassAttribute();
this.setClassAttribute(b + (b ? " " : "") + a);
}
},
removeClass: function(a) {
if (a && this.hasClass(a)) {
var b = this.getClassAttribute();
b = (" " + b + " ").replace(" " + a + " ", " ").slice(1, -1), this.setClassAttribute(b);
}
},
addRemoveClass: function(a, b) {
this[b ? "addClass" : "removeClass"](a);
},
initStyles: function() {
this.domStyles = this.domStyles || {}, enyo.Control.cssTextToDomStyles(this.kindStyle, this.domStyles), this.domCssText = enyo.Control.domStylesToCssText(this.domStyles);
},
styleChanged: function() {
this.invalidateTags(), this.renderStyles();
},
applyStyle: function(a, b) {
this.domStyles[a] = b, this.domStylesChanged();
},
addStyles: function(a) {
enyo.Control.cssTextToDomStyles(a, this.domStyles), this.domStylesChanged();
},
getComputedStyleValue: function(a, b) {
return this.hasNode() ? enyo.dom.getComputedStyleValue(this.node, a) : b;
},
domStylesChanged: function() {
this.domCssText = enyo.Control.domStylesToCssText(this.domStyles), this.invalidateTags(), this.renderStyles();
},
stylesToNode: function() {
this.node.style.cssText = this.style + (this.style[this.style.length - 1] == ";" ? " " : "; ") + this.domCssText;
},
render: function() {
if (this.parent) {
this.parent.beforeChildRender(this);
if (!this.parent.generated) return this;
}
return this.hasNode() || this.renderNode(), this.hasNode() && (this.renderDom(), this.rendered()), this;
},
renderInto: function(a) {
this.teardownRender();
var b = enyo.dom.byId(a);
return b == document.body ? this.setupBodyFitting() : this.fit && this.addClass("enyo-fit enyo-clip"), b.innerHTML = this.generateHtml(), this.rendered(), this;
},
write: function() {
return this.fit && this.setupBodyFitting(), document.write(this.generateHtml()), this.rendered(), this;
},
setupBodyFitting: function() {
enyo.dom.applyBodyFit(), this.addClass("enyo-fit enyo-clip");
},
rendered: function() {
this.reflow();
for (var a = 0, b; b = this.children[a]; a++) b.rendered();
},
show: function() {
this.setShowing(!0);
},
hide: function() {
this.setShowing(!1);
},
getBounds: function() {
var a = this.node || this.hasNode() || 0;
return {
left: a.offsetLeft,
top: a.offsetTop,
width: a.offsetWidth,
height: a.offsetHeight
};
},
setBounds: function(a, b) {
var c = this.domStyles, d = b || "px", e = [ "width", "height", "left", "top", "right", "bottom" ];
for (var f = 0, g, h; h = e[f]; f++) {
g = a[h];
if (g || g === 0) c[h] = g + (enyo.isString(g) ? "" : d);
}
this.domStylesChanged();
},
findNodeById: function() {
return this.id && (this.node = enyo.dom.byId(this.id));
},
idChanged: function(a) {
a && enyo.Control.unregisterDomEvents(a), this.setAttribute("id", this.id), this.id && enyo.Control.registerDomEvents(this.id, this);
},
contentChanged: function() {
this.hasNode() && this.renderContent();
},
getSrc: function() {
return this.getAttribute("src");
},
srcChanged: function() {
this.setAttribute("src", enyo.path.rewrite(this.src));
},
attributesChanged: function() {
this.invalidateTags(), this.renderAttributes();
},
generateHtml: function() {
if (this.canGenerate === !1) return "";
var a = this.generateInnerHtml(), b = this.generateOuterHtml(a);
return this.generated = !0, b;
},
generateInnerHtml: function() {
return this.flow(), this.children.length ? this.generateChildHtml() : this.allowHtml ? this.content : enyo.Control.escapeHtml(this.content);
},
generateChildHtml: function() {
var a = "";
for (var b = 0, c; c = this.children[b]; b++) {
var d = c.generateHtml();
c.prepend ? a = d + a : a += d;
}
return a;
},
generateOuterHtml: function(a) {
return this.tag ? (this.tagsValid || this.prepareTags(), this._openTag + a + this._closeTag) : a;
},
invalidateTags: function() {
this.tagsValid = !1;
},
prepareTags: function() {
var a = this.domCssText + this.style;
this._openTag = "<" + this.tag + (a ? ' style="' + a + '"' : "") + enyo.Control.attributesToHtml(this.attributes), enyo.Control.selfClosing[this.tag] ? (this._openTag += "/>", this._closeTag = "") : (this._openTag += ">", this._closeTag = "</" + this.tag + ">"), this.tagsValid = !0;
},
attributeToNode: function(a, b) {
b === null || b === !1 || b === "" ? this.node.removeAttribute(a) : this.node.setAttribute(a, b);
},
attributesToNode: function() {
for (var a in this.attributes) this.attributeToNode(a, this.attributes[a]);
},
getParentNode: function() {
return this.parentNode || this.parent && this.parent.hasNode();
},
addNodeToParent: function() {
if (this.node) {
var a = this.getParentNode();
a && this[this.prepend ? "insertNodeInParent" : "appendNodeToParent"](a);
}
},
appendNodeToParent: function(a) {
a.appendChild(this.node);
},
insertNodeInParent: function(a, b) {
a.insertBefore(this.node, b || a.firstChild);
},
removeNodeFromDom: function() {
this.hasNode() && this.node.parentNode && this.node.parentNode.removeChild(this.node);
},
teardownRender: function() {
this.generated && this.teardownChildren(), this.node = null, this.generated = !1;
},
teardownChildren: function() {
for (var a = 0, b; b = this.children[a]; a++) b.teardownRender();
},
renderNode: function() {
this.teardownRender(), this.node = document.createElement(this.tag), this.addNodeToParent(), this.generated = !0;
},
renderDom: function() {
this.renderAttributes(), this.renderStyles(), this.renderContent();
},
renderContent: function() {
this.generated && this.teardownChildren(), this.node.innerHTML = this.generateInnerHtml();
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
var a = this.domStyles;
this.showing ? a.display == "none" && this.applyStyle("display", this._displayStyle || "") : (this._displayStyle = a.display == "none" ? "" : a.display, this.applyStyle("display", "none"));
},
showingChanged: function() {
this.syncDisplayToShowing();
},
getShowing: function() {
return this.showing = this.domStyles.display != "none";
},
fitChanged: function(a) {
this.parent.reflow();
},
statics: {
escapeHtml: function(a) {
return a != null ? String(a).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
},
registerDomEvents: function(a, b) {
enyo.$[a] = b;
},
unregisterDomEvents: function(a) {
enyo.$[a] = null;
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
cssTextToDomStyles: function(a, b) {
if (a) {
var c = a.replace(/; /g, ";").split(";");
for (var d = 0, e, f, g, h; h = c[d]; d++) e = h.split(":"), f = e.shift(), g = e.join(":"), b[f] = g;
}
},
domStylesToCssText: function(a) {
var b, c, d = "";
for (b in a) c = a[b], c !== null && c !== undefined && c !== "" && (d += b + ":" + c + ";");
return d;
},
stylesToHtml: function(a) {
var b = enyo.Control.domStylesToCssText(a);
return b ? ' style="' + b + '"' : "";
},
escapeAttribute: function(a) {
return enyo.isString(a) ? String(a).replace(/&/g, "&amp;").replace(/\"/g, "&quot;") : a;
},
attributesToHtml: function(a) {
var b, c, d = "";
for (b in a) c = a[b], c !== null && c !== !1 && c !== "" && (d += " " + b + '="' + enyo.Control.escapeAttribute(c) + '"');
return d;
}
}
}), enyo.defaultCtor = enyo.Control, enyo.Control.subclass = function(a, b) {
var c = a.prototype;
if (c.classes) {
var d = c.kindClasses;
c.kindClasses = (d ? d + " " : "") + c.classes, c.classes = "";
}
if (c.style) {
var e = c.kindStyle;
c.kindStyle = (e ? e + ";" : "") + c.style, c.style = "";
}
if (b.attributes) {
var f = c.kindAttributes;
c.kindAttributes = enyo.mixin(enyo.clone(f), c.attributes), c.attributes = null;
}
};

// platform.js

enyo.platform = {
touch: Boolean("ontouchstart" in window || window.navigator.msPointerEnabled),
gesture: Boolean("ongesturestart" in window || window.navigator.msPointerEnabled)
}, function() {
var a = navigator.userAgent, b = enyo.platform, c = [ {
platform: "android",
regex: /Android (\d+)/
}, {
platform: "android",
regex: /Silk\//,
forceVersion: 2
}, {
platform: "ie",
regex: /MSIE (\d+)/
}, {
platform: "ios",
regex: /iP(?:hone|ad;(?: U;)? CPU) OS (\d+)/
}, {
platform: "webos",
regex: /(?:web|hpw)OS\/(\d+)/
} ];
for (var d = 0, e, f, g; e = c[d]; d++) {
f = e.regex.exec(a);
if (f) {
e.forceVersion ? g = e.forceVersion : g = Number(f[1]), b[e.platform] = g;
break;
}
}
enyo.dumbConsole = Boolean(b.android || b.ios || b.webos);
}();

// phonegap.js

(function() {
if (window.cordova || window.PhoneGap) {
var a = [ "deviceready", "pause", "resume", "online", "offline", "backbutton", "batterycritical", "batterylow", "batterystatus", "menubutton", "searchbutton", "startcallbutton", "endcallbutton", "volumedownbutton", "volumeupbutton" ];
for (var b = 0, c; c = a[b]; b++) document.addEventListener(c, enyo.bind(enyo.Signals, "send", "on" + c), !1);
}
})();

// dispatcher.js

enyo.$ = {}, enyo.dispatcher = {
events: [ "mousedown", "mouseup", "mouseover", "mouseout", "mousemove", "mousewheel", "click", "dblclick", "change", "keydown", "keyup", "keypress", "input" ],
windowEvents: [ "resize", "load", "unload", "message" ],
features: [],
connect: function() {
var a = enyo.dispatcher;
for (var b = 0, c; c = a.events[b]; b++) a.listen(document, c);
for (b = 0, c; c = a.windowEvents[b]; b++) a.listen(window, c);
},
listen: function(a, b) {
var c = enyo.dispatch;
a.addEventListener ? this.listen = function(a, b) {
a.addEventListener(b, c, !1);
} : this.listen = function(a, b, e) {
a.attachEvent("on" + b, function(a) {
return a.target = a.srcElement, a.preventDefault || (a.preventDefault = enyo.iePreventDefault), c(a);
});
}, this.listen(a, b);
},
dispatch: function(a) {
var b = this.findDispatchTarget(a.target) || this.findDefaultTarget(a);
a.dispatchTarget = b;
for (var c = 0, d; d = this.features[c]; c++) if (d.call(this, a) === !0) return;
b && !a.preventDispatch && this.dispatchBubble(a, b);
},
findDispatchTarget: function(a) {
var b, c = a;
try {
while (c) {
if (b = enyo.$[c.id]) {
b.eventNode = c;
break;
}
c = c.parentNode;
}
} catch (d) {
console.log(d, c);
}
return b;
},
findDefaultTarget: function(a) {
return enyo.master;
},
dispatchBubble: function(a, b) {
return b.bubble("on" + a.type, a, b);
}
}, enyo.iePreventDefault = function() {
this.returnValue = !1;
}, enyo.dispatch = function(a) {
return enyo.dispatcher.dispatch(a);
}, enyo.bubble = function(a) {
var b = a || window.event;
b && (b.target || (b.target = b.srcElement), enyo.dispatch(b));
}, enyo.bubbler = "enyo.bubble(arguments[0])", enyo.requiresWindow(enyo.dispatcher.connect);

// preview.js

(function() {
var a = "previewDomEvent", b = {
feature: function(a) {
b.dispatch(a, a.dispatchTarget);
},
dispatch: function(b, c) {
var d = this.buildLineage(c);
for (var e = 0, f; f = d[e]; e++) if (f[a] && f[a](b) === !0) {
b.preventDispatch = !0;
return;
}
},
buildLineage: function(a) {
var b = [], c = a;
while (c) b.unshift(c), c = c.parent;
return b;
}
};
enyo.dispatcher.features.push(b.feature);
})();

// modal.js

enyo.dispatcher.features.push(function(a) {
var b = a.dispatchTarget, c = this.captureTarget && !this.noCaptureEvents[a.type], d = c && !(b && b.isDescendantOf && b.isDescendantOf(this.captureTarget));
if (d) {
var e = a.captureTarget = this.captureTarget, f = this.autoForwardEvents[a.type] || this.forwardEvents;
this.dispatchBubble(a, e), f || (a.preventDispatch = !0);
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
capture: function(a, b) {
var c = {
target: a,
forward: b
};
this.captures.push(c), this.setCaptureInfo(c);
},
release: function() {
this.captures.pop(), this.setCaptureInfo(this.captures[this.captures.length - 1]);
},
setCaptureInfo: function(a) {
this.captureTarget = a && a.target, this.forwardEvents = a && a.forward;
}
});

// gesture.js

enyo.gesture = {
eventProps: [ "target", "relatedTarget", "clientX", "clientY", "pageX", "pageY", "screenX", "screenY", "altKey", "ctrlKey", "metaKey", "shiftKey", "detail", "identifier", "dispatchTarget", "which", "srcEvent" ],
makeEvent: function(a, b) {
var c = {
type: a
};
for (var d = 0, e; e = this.eventProps[d]; d++) c[e] = b[e];
c.srcEvent = c.srcEvent || b, c.preventDefault = this.preventDefault, c.disablePrevention = this.disablePrevention;
if (enyo.platform.ie) {
var f = window.event && window.event.button;
c.which = f & 1 ? 1 : f & 2 ? 2 : f & 4 ? 3 : 0;
}
return c;
},
down: function(a) {
var b = this.makeEvent("down", a);
enyo.dispatch(b), this.downEvent = b;
},
move: function(a) {
var b = this.makeEvent("move", a);
b.dx = b.dy = b.horizontal = b.vertical = 0, b.which && this.downEvent && (b.dx = a.clientX - this.downEvent.clientX, b.dy = a.clientY - this.downEvent.clientY, b.horizontal = Math.abs(b.dx) > Math.abs(b.dy), b.vertical = !b.horizontal), enyo.dispatch(b);
},
up: function(a) {
var b = this.makeEvent("up", a), c = !1;
b.preventTap = function() {
c = !0;
}, enyo.dispatch(b), !c && this.downEvent && this.downEvent.which == 1 && this.sendTap(b), this.downEvent = null;
},
over: function(a) {
enyo.dispatch(this.makeEvent("enter", a));
},
out: function(a) {
enyo.dispatch(this.makeEvent("leave", a));
},
sendTap: function(a) {
var b = this.findCommonAncestor(this.downEvent.target, a.target);
if (b) {
var c = this.makeEvent("tap", a);
c.target = b, enyo.dispatch(c);
}
},
findCommonAncestor: function(a, b) {
var c = b;
while (c) {
if (this.isTargetDescendantOf(a, c)) return c;
c = c.parentNode;
}
},
isTargetDescendantOf: function(a, b) {
var c = a;
while (c) {
if (c == b) return !0;
c = c.parentNode;
}
}
}, enyo.gesture.preventDefault = function() {
this.srcEvent && this.srcEvent.preventDefault();
}, enyo.gesture.disablePrevention = function() {
this.preventDefault = enyo.nop, this.srcEvent && (this.srcEvent.preventDefault = enyo.nop);
}, enyo.dispatcher.features.push(function(a) {
if (enyo.gesture.events[a.type]) return enyo.gesture.events[a.type](a);
}), enyo.gesture.events = {
mousedown: function(a) {
enyo.gesture.down(a);
},
mouseup: function(a) {
enyo.gesture.up(a);
},
mousemove: function(a) {
enyo.gesture.move(a);
},
mouseover: function(a) {
enyo.gesture.over(a);
},
mouseout: function(a) {
enyo.gesture.out(a);
}
}, enyo.requiresWindow(function() {
document.addEventListener && document.addEventListener("DOMMouseScroll", function(a) {
var b = enyo.clone(a);
b.preventDefault = function() {
a.preventDefault();
}, b.type = "mousewheel";
var c = b.VERTICAL_AXIS == b.axis ? "wheelDeltaY" : "wheelDeltaX";
b[c] = b.detail * -12, enyo.dispatch(b);
}, !1);
});

// drag.js

enyo.dispatcher.features.push(function(a) {
if (enyo.gesture.drag[a.type]) return enyo.gesture.drag[a.type](a);
}), enyo.gesture.drag = {
hysteresisSquared: 16,
holdPulseDelay: 200,
trackCount: 5,
minFlick: .1,
minTrack: 8,
down: function(a) {
this.stopDragging(a), this.cancelHold(), this.target = a.target, this.startTracking(a), this.beginHold(a);
},
move: function(a) {
if (this.tracking) {
this.track(a);
if (!a.which) {
this.stopDragging(a), this.tracking = !1;
return;
}
this.dragEvent ? this.sendDrag(a) : this.dy * this.dy + this.dx * this.dx >= this.hysteresisSquared && (this.sendDragStart(a), this.cancelHold());
}
},
up: function(a) {
this.endTracking(a), this.stopDragging(a), this.cancelHold();
},
leave: function(a) {
this.dragEvent && this.sendDragOut(a);
},
stopDragging: function(a) {
if (this.dragEvent) {
this.sendDrop(a);
var b = this.sendDragFinish(a);
return this.dragEvent = null, b;
}
},
makeDragEvent: function(a, b, c, d) {
var e = Math.abs(this.dx), f = Math.abs(this.dy), g = e > f, h = (g ? f / e : e / f) < .414, i = {
type: a,
dx: this.dx,
dy: this.dy,
ddx: this.dx - this.lastDx,
ddy: this.dy - this.lastDy,
xDirection: this.xDirection,
yDirection: this.yDirection,
pageX: c.pageX,
pageY: c.pageY,
clientX: c.clientX,
clientY: c.clientY,
horizontal: g,
vertical: !g,
lockable: h,
target: b,
dragInfo: d,
ctrlKey: c.ctrlKey,
altKey: c.altKey,
metaKey: c.metaKey,
shiftKey: c.shiftKey,
srcEvent: c.srcEvent
};
return i.preventDefault = enyo.gesture.preventDefault, i.disablePrevention = enyo.gesture.disablePrevention, i;
},
sendDragStart: function(a) {
this.dragEvent = this.makeDragEvent("dragstart", this.target, a), enyo.dispatch(this.dragEvent);
},
sendDrag: function(a) {
var b = this.makeDragEvent("dragover", a.target, a, this.dragEvent.dragInfo);
enyo.dispatch(b), b.type = "drag", b.target = this.dragEvent.target, enyo.dispatch(b);
},
sendDragFinish: function(a) {
var b = this.makeDragEvent("dragfinish", this.dragEvent.target, a, this.dragEvent.dragInfo);
b.preventTap = function() {
a.preventTap && a.preventTap();
}, enyo.dispatch(b);
},
sendDragOut: function(a) {
var b = this.makeDragEvent("dragout", a.target, a, this.dragEvent.dragInfo);
enyo.dispatch(b);
},
sendDrop: function(a) {
var b = this.makeDragEvent("drop", a.target, a, this.dragEvent.dragInfo);
b.preventTap = function() {
a.preventTap && a.preventTap();
}, enyo.dispatch(b);
},
startTracking: function(a) {
this.tracking = !0, this.px0 = a.clientX, this.py0 = a.clientY, this.flickInfo = {
startEvent: a,
moves: []
}, this.track(a);
},
track: function(a) {
this.lastDx = this.dx, this.lastDy = this.dy, this.dx = a.clientX - this.px0, this.dy = a.clientY - this.py0, this.xDirection = this.calcDirection(this.dx - this.lastDx, 0), this.yDirection = this.calcDirection(this.dy - this.lastDy, 0);
var b = this.flickInfo;
b.moves.push({
x: a.clientX,
y: a.clientY,
t: enyo.now()
}), b.moves.length > this.trackCount && b.moves.shift();
},
endTracking: function(a) {
this.tracking = !1;
var b = this.flickInfo, c = b && b.moves;
if (c && c.length > 1) {
var d = c[c.length - 1], e = enyo.now();
for (var f = c.length - 2, g = 0, h = 0, i = 0, j = 0, k = 0, l = 0, m = 0, n; n = c[f]; f--) {
g = e - n.t, h = (d.x - n.x) / g, i = (d.y - n.y) / g, l = l || (h < 0 ? -1 : h > 0 ? 1 : 0), m = m || (i < 0 ? -1 : i > 0 ? 1 : 0);
if (h * l > j * l || i * m > k * m) j = h, k = i;
}
var o = Math.sqrt(j * j + k * k);
o > this.minFlick && this.sendFlick(b.startEvent, j, k, o);
}
this.flickInfo = null;
},
calcDirection: function(a, b) {
return a > 0 ? 1 : a < 0 ? -1 : b;
},
beginHold: function(a) {
this.holdStart = enyo.now(), this.holdJob = setInterval(enyo.bind(this, "sendHoldPulse", a), this.holdPulseDelay);
},
cancelHold: function() {
clearInterval(this.holdJob), this.holdJob = null, this.sentHold && (this.sentHold = !1, this.sendRelease(this.holdEvent));
},
sendHoldPulse: function(a) {
this.sentHold || (this.sentHold = !0, this.sendHold(a));
var b = enyo.gesture.makeEvent("holdpulse", a);
b.holdTime = enyo.now() - this.holdStart, enyo.dispatch(b);
},
sendHold: function(a) {
this.holdEvent = a;
var b = enyo.gesture.makeEvent("hold", a);
enyo.dispatch(b);
},
sendRelease: function(a) {
var b = enyo.gesture.makeEvent("release", a);
enyo.dispatch(b);
},
sendFlick: function(a, b, c, d) {
var e = enyo.gesture.makeEvent("flick", a);
e.xVelocity = b, e.yVelocity = c, e.velocity = d, enyo.dispatch(e);
}
};

// touch.js

enyo.requiresWindow(function() {
var a = enyo.gesture;
a.events.touchstart = function(c) {
a.events = b, a.events.touchstart(c);
};
var b = {
touchstart: function(b) {
this.excludedTarget = null;
var c = this.makeEvent(b);
a.down(c), c = this.makeEvent(b), this.overEvent = c, a.over(c);
},
touchmove: function(b) {
var c = a.drag.dragEvent;
this.excludedTarget = c && c.dragInfo && c.dragInfo.node;
var d = this.makeEvent(b);
a.move(d), enyo.bodyIsFitting && b.preventDefault(), this.overEvent && this.overEvent.target != d.target && (this.overEvent.relatedTarget = d.target, d.relatedTarget = this.overEvent.target, a.out(this.overEvent), a.over(d)), this.overEvent = d;
},
touchend: function(b) {
a.up(this.makeEvent(b)), a.out(this.overEvent);
},
makeEvent: function(a) {
var b = enyo.clone(a.changedTouches[0]);
return b.srcEvent = a, b.target = this.findTarget(b.clientX, b.clientY), b.which = 1, b;
},
calcNodeOffset: function(a) {
if (a.getBoundingClientRect) {
var b = a.getBoundingClientRect();
return {
left: b.left,
top: b.top,
width: b.width,
height: b.height
};
}
},
findTarget: function(a, b) {
return document.elementFromPoint(a, b);
},
findTargetTraverse: function(a, b, c) {
var d = a || document.body, e = this.calcNodeOffset(d);
if (e && d != this.excludedTarget) {
var f = b - e.left, g = c - e.top;
if (f > 0 && g > 0 && f <= e.width && g <= e.height) {
var h;
for (var i = d.childNodes, j = i.length - 1, k; k = i[j]; j--) {
h = this.findTargetTraverse(k, b, c);
if (h) return h;
}
return d;
}
}
},
connect: function() {
enyo.forEach([ "ontouchstart", "ontouchmove", "ontouchend", "ongesturestart", "ongesturechange", "ongestureend" ], function(a) {
document[a] = enyo.dispatch;
}), document.elementFromPoint || (this.findTarget = function(a, b) {
return this.findTargetTraverse(null, a, b);
});
}
};
b.connect();
});

// msevents.js

(function() {
if (window.navigator.msPointerEnabled) {
var a = [ "MSPointerDown", "MSPointerUp", "MSPointerMove", "MSPointerOver", "MSPointerOut", "MSPointerCancel", "MSGestureTap", "MSGestureDoubleTap", "MSGestureHold", "MSGestureStart", "MSGestureChange", "MSGestureEnd" ];
enyo.forEach(a, function(a) {
enyo.dispatcher.listen(document, a);
}), enyo.dispatcher.features.push(function(a) {
c[a.type] && c[a.type](a);
});
}
var b = function(a, b) {
var c = enyo.clone(b);
return enyo.mixin(c, {
pageX: b.translationX || 0,
pageY: b.translationY || 0,
rotation: b.rotation * (180 / Math.PI) || 0,
type: a,
srcEvent: b,
preventDefault: enyo.gesture.preventDefault,
disablePrevention: enyo.gesture.disablePrevention
});
}, c = {
MSGestureStart: function(a) {
enyo.dispatch(b("gesturestart", a));
},
MSGestureChange: function(a) {
enyo.dispatch(b("gesturechange", a));
},
MSGestureEnd: function(a) {
enyo.dispatch(b("gestureend", a));
}
};
})();

// gesture.js

(function() {
!enyo.platform.gesture && enyo.platform.touch && enyo.dispatcher.features.push(function(c) {
a[c.type] && b[c.type](c);
});
var a = {
touchstart: !0,
touchmove: !0,
touchend: !0
}, b = {
orderedTouches: [],
gesture: null,
touchstart: function(a) {
enyo.forEach(a.changedTouches, function(a) {
var b = a.identifier;
enyo.indexOf(b, this.orderedTouches) < 0 && this.orderedTouches.push(b);
}, this);
if (a.touches.length >= 2 && !this.gesture) {
var b = this.gesturePositions(a);
this.gesture = this.gestureVector(b), this.gesture.angle = this.gestureAngle(b), this.gesture.scale = 1, this.gesture.rotation = 0;
var c = this.makeGesture("gesturestart", a, {
vector: this.gesture,
scale: 1,
rotation: 0
});
enyo.dispatch(c);
}
},
touchend: function(a) {
enyo.forEach(a.changedTouches, function(a) {
enyo.remove(a.identifier, this.orderedTouches);
}, this);
if (a.touches.length <= 1 && this.gesture) {
var b = a.touches[0] || a.changedTouches[a.changedTouches.length - 1];
enyo.dispatch(this.makeGesture("gestureend", a, {
vector: {
xcenter: b.pageX,
ycenter: b.pageY
},
scale: this.gesture.scale,
rotation: this.gesture.rotation
})), this.gesture = null;
}
},
touchmove: function(a) {
if (this.gesture) {
var b = this.makeGesture("gesturechange", a);
this.gesture.scale = b.scale, this.gesture.rotation = b.rotation, enyo.dispatch(b);
}
},
findIdentifiedTouch: function(a, b) {
for (var c = 0, d; d = a[c]; c++) if (d.identifier === b) return d;
},
gesturePositions: function(a) {
var b = this.findIdentifiedTouch(a.touches, this.orderedTouches[0]), c = this.findIdentifiedTouch(a.touches, this.orderedTouches[this.orderedTouches.length - 1]), d = b.pageX, e = c.pageX, f = b.pageY, g = c.pageY, h = e - d, i = g - f, j = Math.sqrt(h * h + i * i);
return {
x: h,
y: i,
h: j,
fx: d,
lx: e,
fy: f,
ly: g
};
},
gestureAngle: function(a) {
var b = a, c = Math.asin(b.y / b.h) * (180 / Math.PI);
return b.x < 0 && (c = 180 - c), b.x > 0 && b.y < 0 && (c += 360), c;
},
gestureVector: function(a) {
var b = a;
return {
magnitude: b.h,
xcenter: Math.abs(Math.round(b.fx + b.x / 2)),
ycenter: Math.abs(Math.round(b.fy + b.y / 2))
};
},
makeGesture: function(a, b, c) {
var d, e, f;
if (c) d = c.vector, e = c.scale, f = c.rotation; else {
var g = this.gesturePositions(b);
d = this.gestureVector(g), e = d.magnitude / this.gesture.magnitude, f = (360 + this.gestureAngle(g) - this.gesture.angle) % 360;
}
var h = enyo.clone(b);
return enyo.mixin(h, {
type: a,
scale: e,
pageX: d.xcenter,
pageY: d.ycenter,
rotation: f
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
verlet: function(a) {
var b = this.x;
this.x += b - this.x0, this.x0 = b;
var c = this.y;
this.y += c - this.y0, this.y0 = c;
},
damping: function(a, b, c, d) {
var e = .5, f = a - b;
return Math.abs(f) < e ? b : a * d > b * d ? c * f + b : a;
},
boundaryDamping: function(a, b, c, d) {
return this.damping(this.damping(a, b, d, 1), c, d, -1);
},
constrain: function() {
var a = this.boundaryDamping(this.y, this.topBoundary, this.bottomBoundary, this.kSpringDamping);
a != this.y && (this.y0 = a - (this.y - this.y0) * this.kSnapFriction, this.y = a);
var b = this.boundaryDamping(this.x, this.leftBoundary, this.rightBoundary, this.kSpringDamping);
b != this.x && (this.x0 = b - (this.x - this.x0) * this.kSnapFriction, this.x = b);
},
friction: function(a, b, c) {
var d = this[a] - this[b], e = Math.abs(d) > this.kFrictionEpsilon ? c : 0;
this[a] = this[b] + e * d;
},
frame: 10,
simulate: function(a) {
while (a >= this.frame) a -= this.frame, this.dragging || this.constrain(), this.verlet(), this.friction("y", "y0", this.kFrictionDamping), this.friction("x", "x0", this.kFrictionDamping);
return a;
},
animate: function() {
this.stop();
var a = enyo.now(), b = 0, c, d, e = enyo.bind(this, function() {
var f = enyo.now();
this.job = enyo.requestAnimationFrame(e);
var g = f - a;
a = f, this.dragging && (this.y0 = this.y = this.uy, this.x0 = this.x = this.ux), b += Math.max(16, g), this.fixedTime && !this.isInOverScroll() && (b = this.interval), b = this.simulate(b), d != this.y || c != this.x ? this.scroll() : this.dragging || (this.stop(!0), this.scroll()), d = this.y, c = this.x;
});
this.job = enyo.requestAnimationFrame(e);
},
start: function() {
this.job || (this.animate(), this.doScrollStart());
},
stop: function(a) {
this.job = enyo.cancelRequestAnimationFrame(this.job), a && this.doScrollStop();
},
stabilize: function() {
this.start();
var a = Math.min(this.topBoundary, Math.max(this.bottomBoundary, this.y)), b = Math.min(this.leftBoundary, Math.max(this.rightBoundary, this.x));
this.y = this.y0 = a, this.x = this.x0 = b, this.scroll(), this.stop(!0);
},
startDrag: function(a) {
this.dragging = !0, this.my = a.pageY, this.py = this.uy = this.y, this.mx = a.pageX, this.px = this.ux = this.x;
},
drag: function(a) {
if (this.dragging) {
var b = this.vertical ? a.pageY - this.my : 0;
this.uy = b + this.py, this.uy = this.boundaryDamping(this.uy, this.topBoundary, this.bottomBoundary, this.kDragDamping);
var c = this.horizontal ? a.pageX - this.mx : 0;
return this.ux = c + this.px, this.ux = this.boundaryDamping(this.ux, this.leftBoundary, this.rightBoundary, this.kDragDamping), this.start(), !0;
}
},
dragDrop: function(a) {
if (this.dragging && !window.PalmSystem) {
var b = .5;
this.y = this.uy, this.y0 = this.y - (this.y - this.y0) * b, this.x = this.ux, this.x0 = this.x - (this.x - this.x0) * b;
}
this.dragFinish();
},
dragFinish: function() {
this.dragging = !1;
},
flick: function(a) {
var b;
this.vertical && (b = a.yVelocity > 0 ? Math.min(this.kMaxFlick, a.yVelocity) : Math.max(-this.kMaxFlick, a.yVelocity), this.y = this.y0 + b * this.kFlickScalar), this.horizontal && (b = a.xVelocity > 0 ? Math.min(this.kMaxFlick, a.xVelocity) : Math.max(-this.kMaxFlick, a.xVelocity), this.x = this.x0 + b * this.kFlickScalar), this.start();
},
mousewheel: function(a) {
var b = this.vertical ? a.wheelDeltaY || a.wheelDelta : 0;
if (b > 0 && this.y < this.topBoundary || b < 0 && this.y > this.bottomBoundary) return this.stop(!0), this.y = this.y0 = this.y0 + b, this.start(), !0;
},
scroll: function() {
this.doScroll();
},
scrollTo: function(a, b) {
a !== null && (this.y = this.y0 - (a + this.y0) * (1 - this.kFrictionDamping)), b !== null && (this.x = this.x0 - (b + this.x0) * (1 - this.kFrictionDamping)), this.start();
},
setScrollX: function(a) {
this.x = this.x0 = a;
},
setScrollY: function(a) {
this.y = this.y0 = a;
},
setScrollPosition: function(a) {
this.setScrollY(a);
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
this.inherited(arguments), this.horizontalChanged(), this.verticalChanged(), this.maxHeightChanged(), this.container.setAttribute("onscroll", enyo.bubbler);
},
rendered: function() {
this.inherited(arguments), this.scrollNode = this.calcScrollNode();
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
scrollTo: function(a, b) {
this.scrollNode && (this.setScrollLeft(a), this.setScrollTop(b));
},
scrollToNode: function(a, b) {
if (this.scrollNode) {
var c = this.getScrollBounds(), d = a, e = {
height: d.offsetHeight,
width: d.offsetWidth,
top: 0,
left: 0
};
while (d && d.parentNode && d.id != this.scrollNode.id) e.top += d.offsetTop, e.left += d.offsetLeft, d = d.parentNode;
this.setScrollTop(Math.min(c.maxTop, b === !1 ? e.top - c.clientHeight + e.height : e.top)), this.setScrollLeft(Math.min(c.maxLeft, b === !1 ? e.left - c.clientWidth + e.width : e.left));
}
},
scrollIntoView: function(a, b) {
a.hasNode() && a.node.scrollIntoView(b);
},
isInView: function(a) {
var b = this.getScrollBounds(), c = a.offsetTop, d = a.offsetHeight, e = a.offsetLeft, f = a.offsetWidth;
return c >= b.top && c + d <= b.top + b.clientHeight && e >= b.left && e + f <= b.left + b.clientWidth;
},
setScrollTop: function(a) {
this.scrollTop = a, this.scrollNode && (this.scrollNode.scrollTop = this.scrollTop);
},
setScrollLeft: function(a) {
this.scrollLeft = a, this.scrollNode && (this.scrollNode.scrollLeft = this.scrollLeft);
},
getScrollLeft: function() {
return this.scrollNode ? this.scrollNode.scrollLeft : this.scrollLeft;
},
getScrollTop: function() {
return this.scrollNode ? this.scrollNode.scrollTop : this.scrollTop;
},
_getScrollBounds: function() {
var a = this.getScrollSize(), b = this.container.hasNode(), c = {
left: this.getScrollLeft(),
top: this.getScrollTop(),
clientHeight: b ? b.clientHeight : 0,
clientWidth: b ? b.clientWidth : 0,
height: a.height,
width: a.width
};
return c.maxLeft = Math.max(0, c.width - c.clientWidth), c.maxTop = Math.max(0, c.height - c.clientHeight), c;
},
getScrollSize: function() {
var a = this.scrollNode;
return {
width: a ? a.scrollWidth : 0,
height: a ? a.scrollHeight : 0
};
},
getScrollBounds: function() {
return this._getScrollBounds();
},
calcStartInfo: function() {
var a = this.getScrollBounds(), b = this.getScrollTop(), c = this.getScrollLeft();
this.canVertical = a.maxTop > 0 && this.vertical != "hidden", this.canHorizontal = a.maxLeft > 0 && this.horizontal != "hidden", this.startEdges = {
top: b === 0,
bottom: b === a.maxTop,
left: c === 0,
right: c === a.maxLeft
};
},
shouldDrag: function(a) {
var b = a.vertical;
return b && this.canVertical || !b && this.canHorizontal;
},
dragstart: function(a, b) {
this.dragging = this.shouldDrag(b);
if (this.dragging) return this.preventDragPropagation;
},
dragfinish: function(a, b) {
this.dragging && (this.dragging = !1, b.preventTap());
},
down: function(a, b) {
this.calcStartInfo();
},
move: function(a, b) {
b.which && (this.canVertical && b.vertical || this.canHorizontal && b.horizontal) && b.disablePrevention();
}
});

// Thumb.js

enyo.kind({
name: "enyo.ScrollThumb",
minSize: 4,
cornerSize: 6,
classes: "enyo-thumb",
axis: "v",
create: function() {
this.inherited(arguments);
var a = this.axis == "v";
this.dimension = a ? "height" : "width", this.offset = a ? "top" : "left", this.translation = a ? "translateY" : "translateX", this.positionMethod = a ? "getScrollTop" : "getScrollLeft", this.sizeDimension = a ? "clientHeight" : "clientWidth", this.addClass("enyo-" + this.axis + "thumb"), enyo.dom.canAccelerate() && enyo.dom.transformValue(this, "translateZ", 0);
},
sync: function(a) {
this.scrollBounds = a._getScrollBounds(), this.update(a);
},
update: function(a) {
var b = this.dimension, c = this.offset, d = this.scrollBounds[this.sizeDimension], e = this.scrollBounds[b], f = 0, g = 0, h = 0;
if (d >= e) {
this.hide();
return;
}
a.isOverscrolling() && (h = a.getOverScrollBounds()["over" + c], f = Math.abs(h), g = Math.max(h, 0));
var i = a[this.positionMethod]() - h, j = d - this.cornerSize, k = Math.floor(d * d / e - f);
k = Math.max(this.minSize, k);
var l = Math.floor(j * i / e + g);
l = Math.max(0, Math.min(j - this.minSize, l)), this.needed = k < d, this.needed && this.hasNode() ? (this._pos !== l && (this._pos = l, enyo.dom.transformValue(this, this.translation, l + "px")), this._size !== k && (this._size = k, this.node.style[b] = this.domStyles[b] = k + "px")) : this.hide();
},
setShowing: function(a) {
if (a && a != this.showing && this.scrollBounds[this.sizeDimension] >= this.scrollBounds[this.dimension]) return;
this.hasNode() && this.cancelDelayHide();
if (a != this.showing) {
var b = this.showing;
this.showing = a, this.showingChanged(b);
}
},
delayHide: function(a) {
this.showing && enyo.job(this.id + "hide", enyo.bind(this, "hide"), a || 0);
},
cancelDelayHide: function() {
enyo.job.stop(this.id + "hide");
}
});

// TouchScrollStrategy.js

enyo.kind({
name: "enyo.TouchScrollStrategy",
kind: "ScrollStrategy",
preventDragPropagation: !0,
published: {
vertical: "default",
horizontal: "default",
thumb: !0,
scrim: !1
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
attributes: {
onscroll: enyo.bubbler
},
classes: "enyo-touch-scroller"
} ],
create: function() {
this.inherited(arguments), this.accel = enyo.dom.canAccelerate();
var a = "enyo-touch-strategy-container";
enyo.platform.ios && this.accel && (a += " enyo-composite"), this.scrimChanged(), this.container.addClass(a), this.translation = this.accel ? "translate3d" : "translate";
},
initComponents: function() {
this.createChrome(this.tools), this.inherited(arguments);
},
destroy: function() {
this.container.removeClass("enyo-touch-strategy-container"), this.inherited(arguments);
},
rendered: function() {
this.inherited(arguments), this.calcBoundaries(), this.syncScrollMath(), this.thumb && this.alertThumbs();
},
scrimChanged: function() {
this.scrim && !this.$.scrim && this.makeScrim(), !this.scrim && this.$.scrim && this.$.scrim.destroy();
},
makeScrim: function() {
var a = this.controlParent;
this.controlParent = null, this.createChrome(this.scrimTools), this.controlParent = a;
var b = this.container.hasNode();
b && (this.$.scrim.parentNode = b, this.$.scrim.render());
},
isScrolling: function() {
return this.$.scrollMath.isScrolling();
},
isOverscrolling: function() {
return this.$.scrollMath.isInOverScroll();
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
this.$.scrollMath.stabilize();
},
scrollTo: function(a, b) {
this.stop(), this.$.scrollMath.scrollTo(b || b === 0 ? b : null, a);
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
var a = this.vertical == "auto", b = this.horizontal == "auto" || this.horizontal == "default";
if ((a || b) && this.scrollNode) {
var c = this.getScrollBounds();
a && (this.$.scrollMath.vertical = c.height > c.clientHeight), b && (this.$.scrollMath.horizontal = c.width > c.clientWidth);
}
},
shouldDrag: function(a, b) {
this.calcAutoScrolling();
var c = b.vertical, d = this.$.scrollMath.horizontal && !c, e = this.$.scrollMath.vertical && c, f = b.dy < 0, g = b.dx < 0, h = !f && this.startEdges.top || f && this.startEdges.bottom, i = !g && this.startEdges.left || g && this.startEdges.right;
!b.boundaryDragger && (d || e) && (b.boundaryDragger = this);
if (!h && e || !i && d) return b.dragger = this, !0;
},
flick: function(a, b) {
var c = Math.abs(b.xVelocity) > Math.abs(b.yVelocity) ? this.$.scrollMath.horizontal : this.$.scrollMath.vertical;
if (c && this.dragging) return this.$.scrollMath.flick(b), this.preventDragPropagation;
},
hold: function(a, b) {
if (this.isScrolling() && !this.isOverscrolling()) return this.$.scrollMath.stop(b), !0;
},
move: function(a, b) {},
dragstart: function(a, b) {
this.doShouldDrag(b), this.dragging = b.dragger == this || !b.dragger && b.boundaryDragger == this;
if (this.dragging) {
b.preventDefault(), this.syncScrollMath(), this.$.scrollMath.startDrag(b);
if (this.preventDragPropagation) return !0;
}
},
drag: function(a, b) {
this.dragging && (b.preventDefault(), this.$.scrollMath.drag(b), this.scrim && this.$.scrim.show());
},
dragfinish: function(a, b) {
this.dragging && (b.preventTap(), this.$.scrollMath.dragFinish(), this.dragging = !1, this.scrim && this.$.scrim.hide());
},
mousewheel: function(a, b) {
if (!this.dragging && this.$.scrollMath.mousewheel(b)) return b.preventDefault(), !0;
},
scrollMathStart: function(a) {
this.scrollNode && (this.calcBoundaries(), this.thumb && this.showThumbs());
},
scrollMathScroll: function(a) {
this.effectScroll(-a.x, -a.y), this.thumb && this.updateThumbs();
},
scrollMathStop: function(a) {
this.effectScrollStop(), this.thumb && this.delayHideThumbs(100);
},
calcBoundaries: function() {
var a = this.$.scrollMath, b = this._getScrollBounds();
a.bottomBoundary = b.clientHeight - b.height, a.rightBoundary = b.clientWidth - b.width;
},
syncScrollMath: function() {
var a = this.$.scrollMath;
a.setScrollX(-this.getScrollLeft()), a.setScrollY(-this.getScrollTop());
},
effectScroll: function(a, b) {
this.scrollNode && (this.scrollLeft = this.scrollNode.scrollLeft = a, this.scrollTop = this.scrollNode.scrollTop = b, this.effectOverscroll(Math.round(a), Math.round(b)));
},
effectScrollStop: function() {
this.effectOverscroll(null, null);
},
effectOverscroll: function(a, b) {
var c = this.scrollNode, d = "0,", e = "0", f = this.accel ? ",0" : "";
b !== null && Math.abs(b - c.scrollTop) > 1 && (e = c.scrollTop - b + "px"), a !== null && Math.abs(a - c.scrollLeft) > 1 && (d = c.scrollLeft - a + "px,"), enyo.dom.transformValue(this.$.client, this.translation, d + e + f);
},
getOverScrollBounds: function() {
var a = this.$.scrollMath;
return {
overleft: Math.min(a.leftBoundary - a.x, 0) || Math.max(a.rightBoundary - a.x, 0),
overtop: Math.min(a.topBoundary - a.y, 0) || Math.max(a.bottomBoundary - a.y, 0)
};
},
_getScrollBounds: function() {
var a = this.inherited(arguments);
return enyo.mixin(a, this.getOverScrollBounds()), a;
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
this.syncThumbs(), this.$.vthumb.show(), this.$.hthumb.show();
},
hideThumbs: function() {
this.$.vthumb.hide(), this.$.hthumb.hide();
},
delayHideThumbs: function(a) {
this.$.vthumb.delayHide(a), this.$.hthumb.delayHide(a);
}
});

// TranslateScrollStrategy.js

enyo.kind({
name: "enyo.TranslateScrollStrategy",
kind: "TouchScrollStrategy",
components: [ {
name: "clientContainer",
classes: "enyo-touch-scroller",
attributes: {
onscroll: enyo.bubbler
},
components: [ {
name: "client"
} ]
} ],
translateOptimized: !1,
getScrollSize: function() {
var a = this.$.client.hasNode();
return {
width: a ? a.scrollWidth : 0,
height: a ? a.scrollHeight : 0
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
shouldDrag: function(a, b) {
return this.stop(), this.calcStartInfo(), this.inherited(arguments);
},
syncScrollMath: function() {
this.translateOptimized || this.inherited(arguments);
},
setScrollLeft: function(a) {
this.stop();
if (this.translateOptimized) {
var b = this.$.scrollMath;
b.setScrollX(-a), b.stabilize();
} else this.inherited(arguments);
},
setScrollTop: function(a) {
this.stop();
if (this.translateOptimized) {
var b = this.$.scrollMath;
b.setScrollY(-a), b.stabilize();
} else this.inherited(arguments);
},
getScrollLeft: function() {
return this.translateOptimized ? this.scrollLeft : this.inherited(arguments);
},
getScrollTop: function() {
return this.translateOptimized ? this.scrollTop : this.inherited(arguments);
},
scrollMathStart: function(a) {
this.inherited(arguments), this.scrollStarting = !0, this.startX = 0, this.startY = 0, !this.translateOptimized && this.scrollNode && (this.startX = this.getScrollLeft(), this.startY = this.getScrollTop());
},
scrollMathScroll: function(a) {
this.scrollLeft = -a.x, this.scrollTop = -a.y, this.isScrolling() && (this.$.scrollMath.isScrolling() && this.effectScroll(this.startX - this.scrollLeft, this.startY - this.scrollTop), this.thumb && this.updateThumbs());
},
effectScroll: function(a, b) {
var c = a + "px, " + b + "px" + (this.accel ? ",0" : "");
enyo.dom.transformValue(this.$.client, this.translation, c);
},
effectScrollStop: function() {
if (!this.translateOptimized) {
var a = "0,0" + (this.accel ? ",0" : ""), b = this.$.scrollMath, c = this._getScrollBounds(), d = Boolean(c.maxTop + b.bottomBoundary || c.maxLeft + b.rightBoundary);
enyo.dom.transformValue(this.$.client, this.translation, d ? null : a), this.setScrollLeft(this.scrollLeft), this.setScrollTop(this.scrollTop), d && enyo.dom.transformValue(this.$.client, this.translation, a);
}
},
twiddle: function() {
this.translateOptimized && (this.scrollNode.scrollTop = 1, this.scrollNode.scrollTop = 0);
},
down: enyo.nop
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
handlers: {
onscroll: "domScroll",
onScrollStart: "scrollStart",
onScroll: "scroll",
onScrollStop: "scrollStop"
},
classes: "enyo-scroller",
preventDragPropagation: !0,
preventScrollPropagation: !0,
statics: {
osInfo: [ {
os: "android",
version: 3
}, {
os: "ios",
version: 5
}, {
os: "webos",
version: 1e9
} ],
hasTouchScrolling: function() {
for (var a = 0, b, c; b = this.osInfo[a]; a++) if (enyo.platform[b.os]) return !0;
},
hasNativeScrolling: function() {
for (var a = 0, b, c; b = this.osInfo[a]; a++) if (enyo.platform[b.os] < b.version) return !1;
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
importProps: function(a) {
this.inherited(arguments), a && a.strategyKind === undefined && (enyo.Scroller.touchScrolling || this.touch) && (this.strategyKind = enyo.Scroller.getTouchStrategy());
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
setScrollLeft: function(a) {
this.scrollLeft = a, this.$.strategy.setScrollLeft(this.scrollLeft);
},
setScrollTop: function(a) {
this.scrollTop = a, this.$.strategy.setScrollTop(a);
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
scrollIntoView: function(a, b) {
this.$.strategy.scrollIntoView(a, b);
},
scrollTo: function(a, b) {
this.$.strategy.scrollTo(a, b);
},
scrollToControl: function(a, b) {
this.scrollToNode(a.hasNode(), b);
},
scrollToNode: function(a, b) {
this.$.strategy.scrollToNode(a, b);
},
domScroll: function(a, b) {
return this.$.strategy.domScroll && b.originator == this && this.$.strategy.scroll(a, b), this.doScroll(b), !0;
},
shouldStopScrollEvent: function(a) {
return this.preventScrollPropagation && a.originator.owner != this.$.strategy;
},
scrollStart: function(a, b) {
return this.shouldStopScrollEvent(b);
},
scroll: function(a, b) {
return b.dispatchTarget ? this.preventScrollPropagation && b.originator != this && b.originator.owner != this.$.strategy : this.shouldStopScrollEvent(b);
},
scrollStop: function(a, b) {
return this.shouldStopScrollEvent(b);
},
scrollToTop: function() {
this.setScrollTop(0);
},
scrollToBottom: function() {
this.setScrollTop(this.getScrollBounds().maxTop);
},
scrollToRight: function() {
this.setScrollTop(this.getScrollBounds().maxLeft);
},
scrollToLeft: function() {
this.setScrollLeft(0);
},
stabilize: function() {
var a = this.getStrategy();
a.stabilize && a.stabilize();
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
play: function(a) {
return this.stop(), a && enyo.mixin(this, a), this.t0 = this.t1 = enyo.now(), this.value = this.startValue, this.job = !0, this.requestNext(), this;
},
stop: function() {
if (this.isAnimating()) return this.cancel(), this.fire("onStop"), this;
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
var a = this.fraction = enyo.easedLerp(this.t0, this.duration, this.easingFunction);
this.value = this.startValue + a * (this.endValue - this.startValue), a >= 1 || this.shouldEnd() ? (this.value = this.endValue, this.fraction = 1, this.fire("onStep"), this.fire("onEnd"), this.cancel()) : (this.fire("onStep"), this.requestNext());
},
fire: function(a) {
var b = this[a];
enyo.isString(b) ? this.bubble(a) : b && b.call(this.context || window, this);
}
});

// BaseLayout.js

enyo.kind({
name: "enyo.BaseLayout",
kind: enyo.Layout,
layoutClass: "enyo-positioned",
reflow: function() {
enyo.forEach(this.container.children, function(a) {
a.fit !== null && a.addRemoveClass("enyo-fit", a.fit);
}, this);
}
});

// Image.js

enyo.kind({
name: "enyo.Image",
tag: "img",
attributes: {
onload: enyo.bubbler,
onerror: enyo.bubbler,
draggable: "false"
}
});

// Input.js

enyo.kind({
name: "enyo.Input",
published: {
value: "",
placeholder: "",
type: "",
disabled: !1
},
events: {
onDisabledChange: ""
},
defaultFocus: !1,
tag: "input",
classes: "enyo-input",
attributes: {
onfocus: enyo.bubbler,
onblur: enyo.bubbler
},
handlers: {
oninput: "input",
onclear: "clear",
ondragstart: "dragstart"
},
create: function() {
enyo.platform.ie && (this.handlers.onkeyup = "iekeyup"), this.inherited(arguments), this.placeholderChanged(), this.type && this.typeChanged(), this.valueChanged();
},
rendered: function() {
this.inherited(arguments), this.disabledChanged(), this.defaultFocus && this.focus();
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
getValue: function() {
return this.getNodeProperty("value", this.value);
},
valueChanged: function() {
this.setAttribute("value", this.value), this.setNodeProperty("value", this.value);
},
iekeyup: function(a, b) {
var c = enyo.platform.ie, d = b.keyCode;
(c <= 8 || c == 9 && (d == 8 || d == 46)) && this.bubble("oninput", b);
},
clear: function() {
this.setValue("");
},
focus: function() {
this.hasNode() && this.node.focus();
},
dragstart: function() {
return !0;
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
kind: enyo.Input,
tag: "div",
attributes: {
contenteditable: !0
},
handlers: {
onfocus: "focusHandler",
onblur: "blurHandler"
},
focusHandler: function() {
this._value = this.getValue();
},
blurHandler: function() {
this._value !== this.getValue() && this.bubble("onchange");
},
valueChanged: function() {
this.hasFocus() ? (this.selectAll(), this.insertAtCursor(this.value)) : this.setPropertyValue("content", this.value, "contentChanged");
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
removeSelection: function(a) {
var b = this.getSelection();
b && b[a ? "collapseToStart" : "collapseToEnd"]();
},
modifySelection: function(a, b, c) {
var d = this.getSelection();
d && d.modify(a || "move", b, c);
},
moveCursor: function(a, b) {
this.modifySelection("move", a, b);
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
insertAtCursor: function(a) {
if (this.hasFocus()) {
var b = this.allowHtml ? a : enyo.Control.escapeHtml(a).replace(/\n/g, "<br/>");
document.execCommand("insertHTML", !1, b);
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
this.inherited(arguments), this.selectedChanged();
},
getSelected: function() {
return Number(this.getNodeProperty("selectedIndex", this.selected));
},
setSelected: function(a) {
this.setPropertyValue("selected", Number(a), "selectedChanged");
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
activate: function(a, b) {
this.highlander && (b.originator.active ? this.setActive(b.originator) : b.originator == this.active && this.active.setActive(!0));
},
activeChanged: function(a) {
a && (a.setActive(!1), a.removeClass("active")), this.active && this.active.addClass("active");
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
tag: "Button",
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
getChecked: function() {
return Boolean(this.getNodeProperty("checked", this.checked));
},
checkedChanged: function() {
this.setNodeProperty("checked", this.checked), this.setAttribute("checked", this.checked ? "checked" : ""), this.setActive(this.checked);
},
activeChanged: function() {
this.active = Boolean(this.active), this.setChecked(this.active), this.bubble("onActivate");
},
setValue: function(a) {
this.setChecked(Boolean(a));
},
getValue: function() {
return this.getChecked();
},
valueChanged: function() {},
change: function() {
this.setActive(this.getChecked());
},
click: function(a, b) {
enyo.platform.ie <= 8 && this.bubble("onchange", b);
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
setCount: function(a) {
this.setPropertyValue("count", a, "countChanged");
},
countChanged: function() {
this.build();
},
itemAtIndex: function(a) {
return this.controlAtIndex(a);
},
build: function() {
this.destroyClientControls();
for (var a = 0, b; a < this.count; a++) b = this.createComponent({
kind: "enyo.OwnerProxy",
index: a
}), b.createComponents(this.itemComponents), this.doSetupItem({
index: a,
item: b
});
this.render();
}
}), enyo.kind({
name: "enyo.OwnerProxy",
tag: null,
decorateEvent: function(a, b, c) {
b && (b.index = this.index), this.inherited(arguments);
},
delegateEvent: function(a, b, c, d, e) {
a == this && (a = this.owner.owner), this.inherited(arguments, [ a, b, c, d, e ]);
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
drag: function(a) {
this.requireAvatar(), this.avatar.setBounds({
top: a.pageY - this.offsetY,
left: a.pageX + this.offsetX
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
classes: "enyo-popup",
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
this.inherited(arguments), this.floating && this.setParent(enyo.floatingLayer);
},
destroy: function() {
this.showing && this.release(), this.inherited(arguments);
},
getBubbleTarget: function() {
return this.floating ? this.owner : this.inherited(arguments);
},
reflow: function() {
this.updatePosition(), this.inherited(arguments);
},
calcViewportSize: function() {
if (window.innerWidth) return {
width: window.innerWidth,
height: window.innerHeight
};
var a = document.documentElement;
return {
width: a.offsetWidth,
height: a.offsetHeight
};
},
updatePosition: function() {
if (this.centered) {
var a = this.calcViewportSize(), b = this.getBounds();
this.addStyles("top: " + Math.max((a.height - b.height) / 2, 0) + "px; left: " + Math.max((a.width - b.width) / 2, 0) + "px;");
}
},
showingChanged: function() {
this.floating && this.showing && !this.hasNode() && this.render(), this.centered && this.applyStyle("visibility", "hidden"), this.inherited(arguments), this.showing ? (this.resized(), this.captureEvents && this.capture()) : this.captureEvents && this.release(), this.centered && this.applyStyle("visibility", null), this.hasNode() && this[this.showing ? "doShow" : "doHide"]();
},
capture: function() {
enyo.dispatcher.capture(this, !this.modal);
},
release: function() {
enyo.dispatcher.release();
},
down: function(a, b) {
this.modal && !b.dispatchTarget.isDescendantOf(this) && b.preventDefault();
},
tap: function(a, b) {
if (this.autoDismiss && !b.dispatchTarget.isDescendantOf(this)) return this.hide(), !0;
},
keydown: function(a, b) {
this.showing && this.autoDismiss && b.keyCode == 27 && this.hide();
},
blur: function(a, b) {
b.dispatchTarget.isDescendantOf(this) && (this.lastFocus = b.originator);
},
focus: function(a, b) {
var c = b.dispatchTarget;
if (this.modal && !c.isDescendantOf(this)) {
c.hasNode() && c.node.blur();
var d = this.lastFocus && this.lastFocus.hasNode() || this.hasNode();
d && d.focus();
}
},
requestShow: function(a, b) {
return this.show(), !0;
},
requestHide: function(a, b) {
return this.hide(), !0;
}
});
