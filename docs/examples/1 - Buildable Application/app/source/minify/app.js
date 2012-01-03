
// enyo.js

(function() {
var a = "enyo.js";
enyo = window.enyo || {}, enyo.args = enyo.args || {};
var b = function(a) {
var b = document.getElementsByTagName("script");
for (var d = 0, e, f, g = a.length; e = b[d]; d++) {
f = e.getAttribute("src") || "";
if (f.slice(-g) == a) return c(e), f.slice(0, -g - 1);
}
}, c = function(a) {
for (var b, c = 0, d = a.attributes.length; c < d; c++) b = a.attributes.item(c), enyo.args[b.nodeName] = b.nodeValue;
};
enyo.args.root = enyo.args.root || b(a);
})();

// loader.js

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
return a ? a.charAt(a.length - 1) == "/" ? a : a + "/" : "";
},
rewritePattern: /\$([^\/\\]*)(\/)?/g,
rewrite: function(a) {
var b, c = this.includeTrailingSlash, d = this.paths, e = function(a, e) {
return b = !0, c(d[e]);
}, f = a;
do b = !1, f = f.replace(this.rewritePattern, e); while (b);
return f;
},
unwrite: function(a) {
for (var b in this.paths) {
var c = this.paths[b], d = c.length;
if (a.slice(0, d) == c) return "$" + b + a.slice(d);
}
return a;
}
}, enyo.loaderFactory = function(a) {
this.machine = a, this.packages = [], this.modules = [], this.sheets = [], this.stack = [];
}, enyo.loaderFactory.prototype = {
"package": "",
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
finish: function() {
this.verbose && console.log("-------------- fini");
},
more: function(a) {
if (a && this.continueBlock(a)) return;
var b = this.stack.pop();
b ? (this.verbose && console.groupEnd("* finish package (" + (b.package || "anon") + ")"), this.packageFolder = b.folder, this.package = "", this.more(b)) : this.finish();
},
continueBlock: function(a) {
while (a.index < a.depends.length) {
var b = a.depends[a.index++];
if (b) if (typeof b == "string") {
if (this.require(b, a)) return !0;
} else "paths" in b && enyo.path.addPaths(b.paths);
}
},
require: function(a, b) {
var c = enyo.path.rewrite(a), d = this.getPathPrefix(a);
c = d + c;
if (c.slice(-3) == "css") this.verbose && console.log("+ stylesheet: [" + d + "][" + a + "]"), this.requireStylesheet(c); else if (c.slice(-2) == "js") this.verbose && console.log("+ module: [" + d + "][" + a + "]"), this.requireScript(a, c); else return this.requirePackage(c, b), !0;
},
getPathPrefix: function(a) {
var b = a.slice(0, 1);
return this.packageFolder && b != "/" && b != "\\" && b != "$" && a.slice(0, 5) != "http:" ? this.packageFolder : "";
},
requireStylesheet: function(a) {
this.sheets.push(a), this.loadSheet(a);
},
requireScript: function(a, b) {
this.modules.push({
"package": this.package,
rawPath: a,
path: b
}), this.loadScript(b);
},
requirePackage: function(a, b) {
b.folder = this.packageFolder;
var c = a.split("/"), d = c.pop(), e = c.join("/") + "/";
if (d.slice(-8) == "-depends") var f = e + d + ".js"; else e = e + d + "/", f = e + "depends.js";
var g = enyo.path.unwrite(e).split("/");
g[0] == "$enyo" ? d = g.slice(1).join("/") : g[0] == "$lib" && (d = g.slice(1).join("/"));
for (var h = g.length - 1; h >= 0; h--) if (g[h] == "lib") {
d = g.slice(h + 1).join("/");
break;
}
d = d.replace(/\.\.\//g, "").replace(/\$/g, "").replace(/[\/]/g, "-").slice(0, -1);
var i = enyo.path.paths[d];
i && i != e && console.warn("mapping alias [" + d + "] to [" + e + "] replacing [" + i + "]"), enyo.path.addPath(d, e), this.packageFolder = e, b.package = this.package = d, this.stack.push(b), this.packages.push({
name: d,
folder: e
}), this.report("loading package", d), this.verbose && console.group("* start package [" + d + "]"), this.loadPackage(f);
}
};
})();

// boot.js

enyo.machine = {
sheet: function(a) {
document.write('<link href="' + a + '" media="screen" rel="stylesheet" type="text/css" />');
},
script: function(a, b, c) {
document.write('<script src="' + a + '"' + (c ? ' onerror="' + c + '"' : "") + (b ? ' onload="' + b + '"' : "") + "></scri" + "pt>");
},
inject: function(a) {
document.write('<script type="text/javascript">' + a + "</script>");
}
}, enyo.loader = new enyo.loaderFactory(enyo.machine), enyo.depends = function() {
enyo.loader.load.apply(enyo.loader, arguments);
}, enyo.path.addPaths({
enyo: enyo.args.root,
lib: enyo.args.root + "/../../lib"
});

// minifier: path aliases

enyo.path.addPaths({source: "../../../../enyo/source/", fu: "../../../../enyo/../lib/fu/"});

// log.js

enyo.logging = {
level: 99,
levels: {
log: 20,
warn: 10,
error: 0
},
shouldLog: function(a) {
var b = parseInt(enyo.logging.levels[a]);
return b <= enyo.logging.level;
},
_log: function(a, b) {
var c = b;
enyo.dumbConsole && (c = [ c.join(" ") ]), console[a] ? console[a].apply(console, c) : console.log(c);
},
log: function(a, b) {
window.console && enyo.logging.shouldLog(a) && this._log(a, b);
}
}, enyo.setLogLevel = function(a) {
var b = parseInt(a);
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
}, enyo.cap = function(a) {
return a.slice(0, 1).toUpperCase() + a.slice(1);
}, enyo.uncap = function(a) {
return a.slice(0, 1).toLowerCase() + a.slice(1);
}, enyo.format = function(a) {
var b = /\%./g, c = 0, d = a, e = arguments, f = function(a) {
return e[++c];
};
return d.replace(b, f);
}, enyo.isString = function(a) {
return typeof a == "string" || a instanceof String;
}, enyo.isFunction = function(a) {
return typeof a == "function";
}, enyo.isArray = function(a) {
return Object.prototype.toString.apply(a) === "[object Array]";
}, Array.isArray && (enyo.isArray = Array.isArray), enyo.indexOf = function(a, b) {
for (var c = 0, d = b.length, e; (e = b[c]) || c < d; c++) if (e == a) return c;
return -1;
}, enyo.remove = function(a, b) {
var c = enyo.indexOf(a, b);
c >= 0 && b.splice(c, 1);
}, enyo.forEach = function(a, b, c) {
var d = [];
if (a) {
var e = c || this;
for (var f = 0, g = a.length; f < g; f++) d.push(b.call(e, a[f], f, a));
}
return d;
}, enyo.map = enyo.forEach, enyo.cloneArray = function(a, b, c) {
var d = c || [];
for (var e = b || 0, f = a.length; e < f; e++) d.push(a[e]);
return d;
}, enyo.toArray = enyo.cloneArray, enyo.clone = function(a) {
return enyo.isArray(a) ? enyo.cloneArray(a) : enyo.mixin({}, a);
};
var a = {};
enyo.mixin = function(b, c) {
b = b || {};
if (c) {
var d, e, f;
for (d in c) e = c[d], a[d] !== e && (b[d] = e);
}
return b;
}, enyo._hitchArgs = function(a, b) {
var c = enyo.toArray(arguments, 2), d = enyo.isString(b);
return function() {
var e = enyo.toArray(arguments), f = d ? (a || enyo.global)[b] : b;
return f && f.apply(a || this, c.concat(e));
};
}, enyo.bind = function(a, b) {
if (arguments.length > 2) return enyo._hitchArgs.apply(enyo, arguments);
b || (b = a, a = null);
if (enyo.isString(b)) {
a = a || enyo.global;
if (!a[b]) throw [ 'enyo.bind: scope["', b, '"] is null (scope="', a, '")' ].join("");
return function() {
return a[b].apply(a, arguments || []);
};
}
return a ? function() {
return b.apply(a, arguments || []);
} : b;
}, enyo.hitch = enyo.bind, enyo.asyncMethod = function(a, b) {
return setTimeout(enyo.bind.apply(enyo, arguments), 1);
}, enyo.call = function(a, b, c) {
var d = a || this;
if (b) {
var e = d[b] || b;
if (e && e.apply) return e.apply(d, c || []);
}
}, enyo.nop = function() {}, enyo.nob = {}, enyo.instance = function() {}, enyo.setPrototype || (enyo.setPrototype = function(a, b) {
a.prototype = b;
}), enyo.delegate = function(a) {
return enyo.setPrototype(enyo.instance, a), new enyo.instance;
};
})();

// Oop.js

enyo.kind = function(a) {
enyo._kindCtors = {};
var b = a.name || "";
delete a.name;
var c = a.isa || a.kind;
delete a.kind, delete a.isa;
if (c === undefined && "kind" in a) throw "enyo.kind: Attempt to subclass an 'undefined' kind. Check dependencies for [" + b + "].";
var d = c && enyo.constructorForKind(c), e = d && d.prototype || null, f = enyo.kind.makeCtor();
return a.hasOwnProperty("constructor") && (a._constructor = a.constructor, delete a.constructor), enyo.setPrototype(f, e ? enyo.delegate(e) : {}), enyo.mixin(f.prototype, a), f.prototype.kindName = b, f.prototype.base = d, f.prototype.ctor = f, enyo.forEach(enyo.kind.features, function(b) {
b(f, a);
}), enyo.setObject(b, f), f;
}, enyo.kind.makeCtor = function() {
return function() {
this._constructor && this._constructor.apply(this, arguments), this.constructed && this.constructed.apply(this, arguments);
};
}, enyo.kind.defaultNamespace = "enyo", enyo.kind.features = [], enyo.kind.features.push(function(a, b) {
var c = a.prototype;
c.inherited || (c.inherited = enyo.kind.inherited);
if (c.base) for (var d in b) {
var e = b[d];
typeof e == "function" && (e._inherited = c.base.prototype[d], e.nom = c.kindName + "." + d + "()");
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
}
}, enyo._kindCtors = {}, enyo.constructorForKind = function(a) {
if (typeof a == "function") var b = a; else a && (b = enyo._kindCtors[a], b || (enyo._kindCtors[a] = b = enyo.Theme[a] || enyo[a] || enyo.getObject(a, !1, enyo) || window[a] || enyo.getObject(a)));
if (!b) throw "Oop.js: Failed to find a constructor for kind [" + a + "]";
return b;
}, enyo.Theme = {}, enyo.registerTheme = function(a) {
enyo.mixin(enyo.Theme, a);
};

// Object.js

enyo.kind({
name: "enyo.Object",
constructor: function() {
enyo._objectCount++;
},
destroyObject: function(a) {
this[a] && this[a].destroy && this[a].destroy(), this[a] = null;
},
getProperty: function(a) {
return this[a];
},
_setProperty: function(a, b, c) {
if (this[c]) {
var d = this[a];
this[a] = b, this[c](d);
} else this[a] = b;
},
setProperty: function(a, b) {
var c = "set" + enyo.cap(a);
this[c] ? this[c](b) : this._setProperty(a, b, a + "Changed");
},
log: function() {
enyo.logging.log("log", [ arguments.callee.caller.nom + ": " ].concat(enyo.cloneArray(arguments)));
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
return this.getProperty(d);
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
toString: function() {
return this.kindName;
},
constructor: function() {
this._componentNameMap = {}, this.$ = {}, this.inherited(arguments);
},
constructed: function(a) {
this.create(a), this.ready();
},
create: function(a) {
this.importProps(a), this.ownerChanged(), this.initComponents();
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
return !this.owner || this.owner == enyo.master ? this : this.owner;
},
ready: function() {},
destroy: function() {
this.destroyComponents(), this.setOwner(null), this.destroyed = !0;
},
destroyComponents: function() {
enyo.forEach(this.getComponents(), function(a) {
a.destroyed || a.destroy();
});
},
importProps: function(a) {
if (a) for (var b in a) this[b] = a[b];
},
makeId: function() {
var a = "_", b = this.owner && this.owner.getId();
return this.name ? (b ? b + a : "") + this.name : "";
},
ownerChanged: function(a) {
a && a.removeComponent(this), this.owner && this.owner.addComponent(this), this.id = this.makeId();
},
nameComponent: function(a) {
var b = enyo.Component.prefixFromKindName(a.kindName), c = this._componentNameMap[b] || 0;
do var d = b + (++c > 1 ? String(c) : ""); while (this.$[d]);
return this._componentNameMap[b] = Number(c), a.name = d;
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
if (a) for (var c = 0, d; d = a[c]; c++) this._createComponent(d, b);
},
dispatch: function(a, b, c) {
var d = a && b && a[b];
if (d) {
var e = c;
return d._dispatcher || (e = [ this ], c && Array.prototype.push.apply(e, c)), d.apply(a, e || []);
}
},
dispatchIndirectly: function(a, b) {
return this.dispatch(this.owner, this[a], b);
},
dispatchDomEvent: function(a) {
var b = a.type + "Handler";
return this[b] ? this[b](a.dispatchTarget, a) : this.dispatchIndirectly("on" + a.type, arguments);
},
fire: function(a) {
var b = enyo.cloneArray(arguments, 1);
return this.dispatch(this.owner, this[a], b);
}
}), enyo.defaultCtor = enyo.Component, enyo.create = enyo.Component.create = function(a) {
if (!a.kind && "kind" in a) throw "enyo.create: Attempt to create a null kind. Check dependencies.";
var b = a.kind || a.isa || enyo.defaultCtor, c = enyo.constructorForKind(b);
return c || (console.warn('no constructor found for kind "' + b + '"'), c = enyo.Component), new c(a);
}, enyo.Component.subclass = function(a, b) {
b.components && (a.prototype.kindComponents = b.components, delete a.prototype.components), b.events && this.publishEvents(a, b);
}, enyo.Component.publishEvents = function(a, b) {
var c = b.events;
if (c) {
var d = a.prototype;
for (var e in c) this.addEvent(e, c[e], d);
}
}, enyo.Component.addEvent = function(a, b, c) {
var d, e;
enyo.isString(b) ? (a.slice(0, 2) != "on" && (console.warn("enyo.Component.addEvent: event names must start with 'on'. " + c.kindName + " event '" + a + "' was auto-corrected to 'on" + a + "'."), a = "on" + a), d = b, e = "do" + enyo.cap(a.slice(2))) : (d = b.value, e = b.caller), c[a] = d, c[e] || (c[e] = function() {
return this.dispatchIndirectly(a, arguments);
}, c[e]._dispatcher = !0);
}, enyo.Component.prefixFromKindName = function(a) {
var b = enyo.Component._kindPrefixi[a];
if (!b) {
var c = a.lastIndexOf(".");
b = c >= 0 ? a.slice(c + 1) : a, b = b.charAt(0).toLowerCase() + b.slice(1), enyo.Component._kindPrefixi[a] = b;
}
return b;
};

// Containable.js

enyo.kind({
name: "enyo.Containable",
kind: enyo.Component,
published: {
container: null,
parent: null
},
create: function() {
this.inherited(arguments), this.containerChanged();
},
destroy: function() {
this.setContainer(null), this.inherited(arguments);
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
}
});

// Container.js

enyo.kind({
name: "enyo.Container",
kind: enyo.Containable,
published: {
controlParentName: "client",
layoutKind: ""
},
create: function() {
this.controls = [], this.children = [], this.inherited(arguments), this.layoutKindChanged();
},
destroy: function() {
this.destroyClientControls(), this.inherited(arguments);
},
importProps: function(a) {
this.inherited(arguments), this.owner || (this.owner = enyo.master);
},
createComponents: function() {
this.inherited(arguments), this.discoverControlParent();
},
discoverControlParent: function() {
this.controlParent = this.$[this.controlParentName] || this.controlParent;
},
adjustComponentProps: function(a) {
this.inherited(arguments), a.container = a.container || this;
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
this.layout && this.layout.flow(this);
},
broadcastMessage: function(a, b) {
var c = a + "Handler";
if (this[c]) return this[c].apply(this, b);
this.broadcastToControls(a, b);
},
resized: function() {
this.broadcastMessage("resize");
},
resizeHandler: function() {
this.broadcastToControls("resize");
},
broadcastToControls: function(a, b) {
for (var c = 0, d = this.controls, e; e = d[c]; c++) e.broadcastMessage(a, b);
}
}), enyo.createFromKind = function(a, b) {
var c = a && enyo.constructorForKind(a);
if (c) return new c(b);
}, enyo.master = new enyo.Component;

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
(this.failed ? this.fail : this.respond).call(this, d);
}
},
respond: function(a) {
this.failed = !1, this.handle(a, this.responders);
},
fail: function(a) {
this.failed = !0, this.handle(a, this.errorHandlers);
},
recover: function() {
this.failed = !1;
},
go: function(a) {
return this.respond(a), this;
}
}), enyo.kind({
name: "enyo.AsyncWithTimeout",
kind: enyo.Async,
startTimer: function() {
this.startTime = (new Date).getTime(), this.timeout && (this.timeoutJob = setTimeout(enyo.bind(this, "timeoutComplete"), this.timeout));
},
endTimer: function() {
this.timeoutJob && (this.endTime = (new Date).getTime(), clearTimeout(this.timeoutJob), this.timeoutJob = null, this.latency = this.endTime - this.startTime);
},
timeoutComplete: function() {
this.timedout = !0, this.fail("timeout");
},
respond: function() {
this.endTimer(), this.inherited(arguments);
},
fail: function() {
this.endTimer(), this.inherited(arguments);
}
});

// json.js

enyo.json = {
stringify: function(a, b, c) {
return JSON.stringify(a, b, c);
},
parse: function(a) {
return a ? JSON.parse(a) : null;
}
};

// xhr.js

enyo.xhr = {
request: function(a) {
var b = this.getXMLHttpRequest(), c = a.method || "GET", d = "sync" in a ? !a.sync : !0;
a.username ? b.open(c, enyo.path.rewrite(a.url), d, a.username, a.password) : b.open(c, enyo.path.rewrite(a.url), d), this.makeReadyStateHandler(b, a.callback);
if (a.headers) for (var e in a.headers) b.setRequestHeader(e, a.headers[e]);
return b.send(a.body || null), d || b.onreadystatechange(b), b;
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
},
makeReadyStateHandler: function(a, b) {
a.onreadystatechange = function() {
a.readyState == 4 && b && b.apply(null, [ a.responseText, a ]);
};
}
}, enyo.xhrGet = function(a) {
a.callback = a.load, enyo.xhr.request(a);
}, enyo.xhrPost = function(a) {
a.callback = a.load, a.method = "POST", enyo.xhr.request(a);
};

// Ajax.js

enyo.kind({
name: "enyo.Ajax",
kind: enyo.AsyncWithTimeout,
published: {
cacheBust: !0,
url: "",
method: "GET",
handleAs: "json",
contentType: "application/x-www-form-urlencoded",
sync: !1,
headers: null,
postBody: "",
username: "",
password: ""
},
constructor: function(a) {
enyo.mixin(this, a), this.inherited(arguments);
},
go: function(a) {
return this.xhr(a), this;
},
xhr: function(a) {
var b = this.url.split("?"), c = b.shift() || "", d = b.join("?").split("&"), e = enyo.isString(a) ? a : enyo.Ajax.objectToQuery(a);
this.method == "GET" && (e && (d.push(e), e = null), this.cacheBust && d.push(Math.random()));
var f = [ c, d.join("&") ].join("?"), g = {
"Content-Type": this.contentType
};
enyo.mixin(g, this.headers), enyo.xhr.request({
url: f,
method: this.method,
callback: enyo.bind(this, "receive"),
body: e,
headers: g,
sync: window.PalmSystem ? !1 : this.sync,
username: this.username,
password: this.password
});
},
receive: function(a, b) {
this.isFailure(b) ? this.fail(b.status) : this.respond(this.xhrToResponse(b));
},
xhrToResponse: function(a) {
if (a) return this[(this.handleAs || "text") + "Handler"](a);
},
isFailure: function(a) {
return a.status < 200 || a.status >= 300;
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

// dom.js

enyo.requiresWindow = function(a) {
a();
}, enyo.dom = {
byId: function(a, b) {
return typeof a == "string" ? (b || document).getElementById(a) : a;
},
escape: function(a) {
return a != null ? String(a).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
},
getComputedStyle: function(a) {
return window.getComputedStyle(a, null);
},
getComputedStyleValue: function(a, b, c) {
var d = c || this.getComputedStyle(a);
return d.getPropertyValue(b);
}
};

// Control.js

enyo.kind({
name: "enyo.Control",
kind: enyo.Container,
events: {
onmousedown: "",
onmouseup: "",
onclick: ""
},
published: {
tagName: "div",
attributes: {},
style: "",
content: "",
showing: !0,
canGenerate: !0,
src: "",
disabled: ""
},
node: null,
generated: !1,
defaultKind: "Control",
constructor: function() {
this.inherited(arguments), this.attributes = enyo.clone(this.attributes), this.domStyles = enyo.clone(this.domStyles);
},
create: function() {
this.inherited(arguments), this.initStyles(), this.addClass(this.className), this.initProps([ "id", "showing", "content", "src", "disabled" ]);
},
destroy: function() {
this.removeNodeFromDom(), this.inherited(arguments);
},
initProps: function(a) {
for (var b = 0, c; c = a[b]; b++) this.ctor.prototype[c] != this[c] && this.setProperty(c, this[c]);
},
hasNode: function() {
return this.generated && (this.node || this.findNodeById());
},
addContent: function(a) {
this.setContent(this.content + a);
},
applyStyle: function(a, b) {
this.domStyles[a] = b, this.domStylesChanged();
},
addStyles: function(a) {
enyo.Control.cssTextToDomStyles(a, this.domStyles), this.domStylesChanged();
},
setAttribute: function(a, b) {
this.attributes[a] = b, this.attributesChanged();
},
setClassName: function(a) {
this.setAttribute("className", a);
},
getClassName: function() {
return this.attributes.className || "";
},
hasClass: function(a) {
return a && (" " + this.getClassName() + " ").indexOf(" " + a + " ") >= 0;
},
addClass: function(a) {
if (a && !this.hasClass(a)) {
var b = this.getClassName();
this.setClassName(b + (b ? " " : "") + a);
}
},
removeClass: function(a) {
if (a && this.hasClass(a)) {
var b = this.getClassName();
b = (" " + b + " ").replace(" " + a + " ", " ").slice(1, -1), this.setClassName(b);
}
},
addRemoveClass: function(a, b) {
this[b ? "addClass" : "removeClass"](a);
},
render: function() {
return this.parent && this.parent.beforeChildRender(this), this.hasNode() || this.renderNode(), this.hasNode() && (this.renderDom(), this.rendered()), this;
},
renderInto: function(a) {
this.teardownRender();
var b = enyo.dom.byId(a);
return b == document.body && this.addClass("enyo-fit"), b.innerHTML = this.generateHtml(), this.rendered(), this;
},
write: function() {
document.write(this.generateHtml()), this.rendered();
},
rendered: function() {
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
var c = this.domStyles, d = [ "width", "height", "left", "top", "right", "bottom" ];
for (var e = 0, f; f = d[e]; e++) if (a[f] || a[f] === 0) c[f] = a[f] + b;
this.domStylesChanged();
},
importProps: function(a) {
a && (a.style && this.addStyles(a.style), a.domStyles && (enyo.mixin(this.domStyles, a.domStyles), delete a.domStyles), a.attributes && (enyo.mixin(this.attributes, a.attributes), delete a.attributes), a.className && this.className && (this.className += " " + a.className, delete a.className)), this.inherited(arguments);
},
initStyles: function() {
this.style ? this.styleChanged() : this.domStylesChanged();
},
findNodeById: function() {
return this.id && (this.node = enyo.dom.byId(this.id));
},
idChanged: function(a) {
a && enyo.Control.unregisterDomEvents(a), this.setAttribute("id", this.id), this.id && enyo.Control.registerDomEvents(this.id, this);
},
styleChanged: function() {
this.domStyles = {}, this.addStyles(this.style);
},
contentChanged: function() {
this.hasNode() && this.renderContent();
},
domStylesChanged: function() {
this.invalidateTags(), this.renderStyles();
},
srcChanged: function(a) {
this.setAttribute("src", a);
},
disabledChanged: function(a) {
this.setAttribute("disabled", a);
},
attributesChanged: function() {
this.invalidateTags(), this.renderAttributes();
},
invalidateTags: function() {
this.tagsValid = !1;
},
prepareTags: function() {
var a = enyo.Control.domStylesToCssText(this.domStyles);
this._openTag = "<" + this.tagName + (a ? ' style="' + a + '"' : "") + enyo.Control.attributesToHtml(this.attributes), enyo.Control.selfClosing[this.tagName] ? (this._openTag += "/>", this._closeTag = "") : (this._openTag += ">", this._closeTag = "</" + this.tagName + ">"), this.tagsValid = !0;
},
generateHtml: function() {
if (this.canGenerate === !1) return "";
var a = this.generateInnerHtml(), b = this.generateOuterHtml(a);
return this.generated = !0, b;
},
generateInnerHtml: function() {
return this.flow(), this.children.length ? this.generateChildHtml() : this.content;
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
return this.tagsValid || this.prepareTags(), this._openTag + a + this._closeTag;
},
attributeToNode: function(a, b) {
a == "className" && (a = "class"), b === null ? this.node.removeAttribute(a) : this.node.setAttribute(a, b);
},
attributesToNode: function() {
for (var a in this.attributes) this.attributeToNode(a, this.attributes[a]);
},
stylesToNode: function() {
this.node.style.cssText = enyo.Control.domStylesToCssText(this.domStyles);
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
a.insertBefore(this.node, b || pn.firstChild);
},
removeNodeFromDom: function() {
this.hasNode() && this.node.parentNode && this.node.parentNode.removeChild(this.node);
},
teardownRender: function() {
this.teardownChildren(), this.node = null, this.generated = !1;
},
teardownChildren: function() {
if (this.generated) for (var a = 0, b; b = this.children[a]; a++) b.teardownRender();
},
renderNode: function() {
this.teardownRender(), this.node = document.createElement(this.tagName), this.addNodeToParent(), this.generated = !0;
},
renderDom: function() {
this.renderAttributes(), this.renderStyles(), this.renderContent();
},
renderContent: function() {
this.teardownChildren(), this.node.innerHTML = this.generateInnerHtml();
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
statics: {
registerDomEvents: function(a, b) {
enyo.$[a] = b;
},
unregisterDomEvents: function(a) {
enyo.$[a] = null;
},
selfClosing: {
img: 1
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
return a != null ? String(a).replace(/&/g, "&amp;").replace(/"/g, "&quot;") : "";
},
attributesToHtml: function(a) {
var b, c, d = "";
for (b in a) c = a[b], c !== null && c !== "" && (b == "className" && (b = "class"), d += " " + b + '="' + enyo.Control.escapeAttribute(c) + '"');
return d;
}
}
});

// Dispatcher.js

enyo.$ = {}, enyo.dispatcher = {
handlerName: "dispatchDomEvent",
captureHandlerName: "captureDomEvent",
mouseOverOutEvents: {
mouseover: 1,
mouseout: 1
},
events: [ "mousedown", "mouseup", "mouseover", "mouseout", "mousemove", "mousewheel", "click", "dblclick", "change", "keydown", "keyup", "keypress", "input" ],
windowEvents: [ "resize", "load", "unload", "message" ],
connect: function() {
if (document.addEventListener) var a = function() {
document.addEventListener.apply(document, arguments);
}; else a = function(a, b) {
document.attachEvent("on" + a, function() {
return event.target = event.srcElement, b(event);
});
};
var b = enyo.dispatcher;
for (var c = 0, d; d = b.events[c]; c++) a(d, enyo.dispatch, !1);
var e = document.addEventListener ? "addEventListener" : "attachEvent";
for (c = 0, d; d = b.windowEvents[c]; c++) window[e](d, enyo.dispatch, !1);
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
return enyo.dispatcher.rootHandler;
},
dispatch: function(a) {
var b = this.findDispatchTarget(a.target) || this.findDefaultTarget(a);
a.dispatchTarget = b;
for (var c = 0, d; d = this.features[c]; c++) if (d.call(this, a)) return !0;
b = a.filterTarget || b;
if (b) {
if (!a.filterTarget || a.forward) if (this.dispatchCapture(a, b) === !0) return !0;
var e = this.dispatchBubble(a, b);
a.forward && (e = this.forward(a));
}
},
forward: function(a) {
var b = a.dispatchTarget;
return b && this.dispatchBubble(a, b);
},
dispatchCapture: function(a, b) {
var c = this.buildAncestorList(a.target);
for (var d = c.length - 1, e; e = c[d]; d--) if (this.dispatchToCaptureTarget(a, e) === !0) return !0;
},
buildAncestorList: function(a) {
var b = [], c = a, d;
while (c) d = enyo.$[c.id], d && b.push(d), c = c.parentNode;
return b;
},
dispatchToCaptureTarget: function(a, b) {
var c = this.captureHandlerName;
if (b[c]) return b[c](a) !== !0 ? !1 : !0;
},
dispatchBubble: function(a, b) {
a.stopPropagation = function() {
this._handled = !0;
};
while (b) {
a.type == "click" && a.ctrlKey && a.altKey && console.log(a.type + ": " + b.name + " [" + b.kindName + "]");
if (this.dispatchToTarget(a, b) === !0) return !0;
b = b.parent || b.container || b.owner;
}
return !1;
},
dispatchToTarget: function(a, b) {
if (this.handleMouseOverOut(a, b)) return !0;
var c = this.handlerName;
if (b[c]) return b[c](a) !== !0 && !a._handled ? !1 : (a.handler = b, !0);
},
handleMouseOverOut: function(a, b) {
if (this.mouseOverOutEvents[a.type] && this.isInternalMouseOverOut(a, b)) return !0;
},
isInternalMouseOverOut: function(a, b) {
var c = b.eventNode, d = this.findDispatchTarget(a.relatedTarget);
return b == d && c != b.eventNode ? (b.eventNode = c, !1) : d && d.isDescendantOf(b);
}
}, enyo.dispatch = function(a) {
return enyo.dispatcher.dispatch(a);
}, enyo.bubble = function(a) {
a && enyo.dispatch(a);
}, enyo.bubbler = "enyo.bubble(arguments[0])", enyo.requiresWindow(enyo.dispatcher.connect), enyo.dispatcher.features = [], enyo.dispatcher.features.push(function(a) {
var b = a.dispatchTarget;
this.captureTarget && b != enyo.dispatcher.rootHandler && !this.noCaptureEvents[a.type] && (!b || !b.isDescendantOf(this.captureTarget)) && (a.filterTarget = this.captureTarget, a.forward = this.autoForwardEvents[a.type] || this.forwardEvents);
}), enyo.mixin(enyo.dispatcher, {
noCaptureEvents: {
load: 1,
unload: 1,
error: 1
},
autoForwardEvents: {
mouseout: 1
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
}), enyo.dispatcher.keyEvents = {
keydown: 1,
keyup: 1,
keypress: 1
}, enyo.dispatcher.features.push(function(a) {
this.keyWatcher && this.keyEvents[a.type] && this.dispatchToTarget(a, this.keyWatcher);
}), enyo.dispatcher.rootHandler = {
requiresDomMousedown: !0,
listeners: [],
addListener: function(a) {
this.listeners.push(a);
},
removeListener: function(a) {
enyo.remove(a, this.listeners);
},
dispatchDomEvent: function(a) {
if (a.type == "resize") {
this.broadcastMessage("resize");
return;
}
(a.type == "windowDeactivated" || a.type == "windowHidden") && this.broadcastMessage("autoHide"), this.broadcastEvent(a);
},
broadcastMessage: function(a) {
for (var b in enyo.master.$) enyo.master.$[b].broadcastMessage(a);
},
broadcastEvent: function(a) {
for (var b = 0, c; c = this.listeners[b]; b++) c.dispatchDomEvent(a);
},
isDescendantOf: function() {
return !1;
}
};

// gesture.js

enyo.dispatcher.features.push(function(a) {
if (enyo.gesture[a.type]) return enyo.gesture[a.type](a);
}), enyo.gesture = {
hysteresis: 4,
holdDelay: 200,
pulseInterval: 100,
mousedown: function(a) {
!a.synthetic && a.dispatchTarget && (this.target = a.target, this.dispatchTarget = a.dispatchTarget, this.targetEvent = a, this.startTracking(a), this.startMousehold(a));
},
mousemove: function(a) {
this.tracking && (this.dx = a.pageX - this.px0, this.dy = a.pageY - this.py0, this.dragEvent ? this.sendDrag(a) : Math.sqrt(this.dy * this.dy + this.dx * this.dx) >= this.hysteresis && (this.sendDragStart(a), this.stopMousehold()));
},
mouseout: function(a) {
this.dragEvent && this.sendDragOut(a);
},
startTracking: function(a) {
this.tracking = !0, this.px0 = a.pageX, this.py0 = a.pageY;
},
stopTracking: function() {
this.tracking = !1;
},
mouseup: function(a) {
this.stopTracking(), this.stopMousehold(), this.stopDragging(a);
},
stopDragging: function(a) {
if (this.dragEvent) {
this.sendDrop(a);
var b = this.sendDragFinish(a);
return this.dragEvent = null, b;
}
},
makeDragEvent: function(a, b, c, d) {
var e = Math.abs(this.dx), f = Math.abs(this.dy), g = e > f, h = (g ? f / e : e / f) < .414;
return {
type: a,
dx: this.dx,
dy: this.dy,
pageX: c.pageX,
pageY: c.pageY,
horizontal: g,
vertical: !g,
lockable: h,
target: b,
dragInfo: d
};
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
return b.preventClick = function() {
this._preventClick = !0;
}, enyo.dispatch(b), b._preventClick;
},
sendDragOut: function(a) {
var b = this.makeDragEvent("dragout", a.target, a, this.dragEvent.dragInfo);
enyo.dispatch(b);
},
sendDrop: function(a) {
var b = this.makeDragEvent("drop", a.target, a, this.dragEvent.dragInfo);
enyo.dispatch(b);
},
startMousehold: function(a) {},
stopMousehold: function(a) {},
sendMouseRelease: function(a) {
this.send("mouserelease", a);
},
send: function(a, b, c) {
var d = {
type: a,
pageX: b && b.pageX,
pageY: b && b.pageY,
target: this.target,
preventDefault: enyo.nop
};
return enyo.mixin(d, c), enyo.dispatch(d), d;
}
};

// HLayout.js

enyo.kind({
name: "enyo.HLayout",
layoutClass: "enyo-hlayout",
flow: function() {},
constructor: function(a) {
this.container = a, a.addClass(this.layoutClass), a.align && (a.domStyles["text-align"] = a.align);
},
destroy: function() {
this.container && this.container.removeClass(this.layoutClass);
}
});

// BoxLayout.js

enyo.kind({
name: "enyo.BoxLayout",
layoutClass: "enyo-box",
unit: "px",
constructor: function(a) {
this.container = a, a.addClass(this.layoutClass);
},
destroy: function() {
this.container && this.container.removeClass(this.layoutClass);
},
_flow: function(a, b, c, d, e, f) {
var g, h = 0, i = {}, j = "pad" in this.container ? Number(this.container.pad) : 0, k;
i[d] = j, i[e] = j;
var l = this.container.children;
for (var m = 0; k = l[m]; m++) {
h += j, k.applyStyle("position", "absolute");
if (k[a] == "fill") break;
i[a] = g = Number(k[a]) || 96, i[b] = h, k.setBounds(i, this.unit), h += g;
}
delete i[b];
if (k) {
var n = k, o = 0;
for (m = l.length - 1; k = l[m]; m--) {
k.applyStyle("position", "absolute"), o += j;
if (k == n) break;
i[a] = g = Number(k[a]) || 96, i[c] = o, k.setBounds(i, this.unit), o += g;
}
delete i[a], i[b] = h, i[c] = o, n.setBounds(i, this.unit);
}
},
flow: function() {
this.orient == "h" ? this._flow("width", "left", "right", "top", "bottom", "enyo-hbox") : this._flow("height", "top", "bottom", "left", "right", "enyo-vbox");
}
}), enyo.kind({
name: "enyo.HBoxLayout",
kind: enyo.BoxLayout,
orient: "h"
}), enyo.kind({
name: "enyo.VBoxLayout",
kind: enyo.BoxLayout,
orient: "v"
}), enyo.kind({
name: "enyo.HBox",
kind: enyo.Control,
layoutKind: "enyo.HBoxLayout"
}), enyo.kind({
name: "enyo.VBox",
kind: enyo.Control,
layoutKind: "enyo.VBoxLayout"
});

// minifier: load css

enyo.machine.sheet("app.css");
