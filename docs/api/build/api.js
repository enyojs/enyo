
// minifier: path aliases

enyo.path.addPaths({fu: "..\..\..\..\enyo/../lib/fu/"});

// lexer.js

enyo.kind({
name: "enyo.lexer.Base",
constructor: function(a) {
a && this.start(a);
},
p0: 0,
p: 0,
ib: function() {
return Boolean(this.m);
},
search: function(a) {
var b = a.global ? a : new RegExp(a.source, "g");
return b.lastIndex = this.p, this.m = b.exec(this.s), this.p = this.m ? this.m.index : -1, this.ib() && (this.d = this.s.charAt(this.p));
},
lookahead: function(a) {
return this.s.charAt(this.p + a);
},
getToken: function() {
return this.s.slice(this.p0, this.p);
},
tokenize: function(a) {
this.p += a || 0;
},
pushToken: function(a, b, c) {
this.tokenize(b);
var d = this.getToken();
if (!d && !c) return {};
var e = (d.match(/\n/g) || []).length, f = {
kind: a,
token: d,
start: this.p0,
end: this.p,
line: this.n,
height: e
};
return this.n += e, this.p0 = this.p, this.r.push(f), f;
},
tossToken: function(a) {
this.tokenize(a), this.p0 = this.p;
},
start: function(a) {
this.s = a, this.l = this.s.length, this.r = [], this.d = "", this.p0 = 0, this.p = 0, this.n = 0, this.analyze(), this.finish();
},
finish: function() {
this.t += this.s, this.pushToken("gah");
}
}), enyo.kind({
name: "enyo.lexer.Code",
kind: enyo.lexer.Base,
symbols: "(){}[];,:<>+-",
operators: [ "++", "--", "+=", "-=", "==", "!=", "&&", "||", '"', "'", "=" ],
keywords: [ "function", "new", "return", "if", "while", "do", "break", "continue", "switch", "case", "var" ],
buildPattern: function() {
var a = '"(?:\\\\"|[^"])*?"', b = "'(?:\\\\'|[^'])*?'", c = "\\b(?:" + this.keywords.join("|") + ")\\b", d = "[\\" + this.symbols.split("").join("\\") + "]", e = [];
for (var f = 0, g; g = this.operators[f]; f++) e.push("\\" + g.split("").join("\\"));
e = e.join("|"), d += "|" + e;
var h = [ a, b, c, "\\/\\/", "\\/\\*", d, "'\"", "\\s" ];
this.matchers = [ "doString", "doString", "doKeyword", "doLineComment", "doCComment", "doSymbol", "doLiteral", "doWhitespace" ], this.pattern = "(" + h.join(")|(") + ")";
},
analyze: function() {
this.buildPattern();
var a = new RegExp(this.pattern, "gi");
while (this.search(a)) this.pushToken("identifier"), this.process(this.matchers), this.pushToken("identifier");
},
process: function(a) {
for (var b = 0, c; c = a[b]; b++) if (this.m[b + 1]) {
this[c].apply(this);
return;
}
this.doSymbol();
},
doWhitespace: function() {
this.tokenize(1), this.search(/\S/g), this.pushToken("ws");
},
doEscape: function() {
this.tokenize(2);
},
doLiteral: function() {
this.tossToken(1);
var a = this.d, b = new RegExp("\\" + a + "|\\\\", "g");
while (this.search(b)) switch (this.d) {
case "\\":
this.doEscape();
break;
default:
this.pushToken("literal", 0, !0).delimiter = a, this.tossToken(1);
return;
}
},
doSymbol: function() {
this.pushToken("symbol", this.m[0].length);
},
doKeyword: function() {
this.pushToken("keyword", this.m[0].length);
},
doLineComment: function() {
this.tokenize(2), this.search(/[\r\n]/g) && this.tokenize(0), this.pushToken("comment");
},
doCComment: function() {
this.tokenize(2);
var a = 1;
while (a && this.search(/\/\*|\*\//g)) a += this.d == "/" ? 1 : this.d == "*" ? -1 : 0, this.tokenize(2);
this.pushToken("comment");
},
doString: function() {
this.pushToken("string", this.m[0].length);
}
}), enyo.lexer.Js = enyo.lexer.Code;

// parser.js

enyo.kind({
name: "enyo.parser.Base",
i: 0,
constructor: function(a) {
this.a = [], this.html = [], this.lastToken = {}, this.nodes = a && this.parse(a);
},
next: function() {
return this.tokens[this.i++];
},
setTokens: function(a) {
this.i = 0, this.tokens = a;
},
pushToken: function(a) {
this.a.push(a);
},
parse: function(a) {
this.setTokens(a.r);
var b = this.processTokens(), c = {
children: []
};
for (var d = 0, e; e = b[d]; d++) e.index = d, e.parent = c, c.children.push(e);
return b;
}
}), enyo.kind({
name: "enyo.parser.Code",
kind: enyo.parser.Base,
pushNode: function(a, b, c, d) {
var e = this.a.map(function(a) {
return a.token;
}).join("");
e += (c ? c.token : "") + (d || ""), arguments.length > 2 && this.a.push(c);
var f, g, h, i;
if (c) f = c.start, g = c.end, h = c.line, i = c.height; else if (this.a.length) {
var j = this.a[0], k = this.a[this.a.length - 1];
f = j.start, g = k.end, h = j.line, i = k.line - j.line;
} else {
var l = this.tokens[this.i - 1];
f = l.start, g = l.end, h = l.line, i = l.height;
}
var m = {
kind: b,
tokens: this.a,
token: e,
start: f,
end: g,
line: h,
height: i
};
return a.push(m), this.a = [], m;
},
identifier: function(a) {
return this.a.length && this.pushNode(a, "identifier"), a;
},
findChildren: function(a) {
var b = this.processTokens();
for (var c = 0, d; d = b[c]; c++) d.parent = a, d.index = c;
a.children = b, a.end = this.lastToken.end, a.height = this.lastToken.line - a.line;
},
processArray: function(a, b) {
this.identifier(a), this.findChildren(this.pushNode(a, "array"));
},
processBlock: function(a, b) {
this.identifier(a), this.findChildren(this.pushNode(a, "block"));
},
processArguments: function(a, b) {
this.identifier(a);
var c = "association";
if (this.lastToken.kind == "identifier" || this.lastToken.token == "function") c = "argument-list";
this.findChildren(this.pushNode(a, c));
},
processTokens: function(a) {
var b, c, d = [];
while (b = this.next()) {
c = b.token;
if (b.kind == "ws") continue;
if (b.kind == "literal") this.pushNode(d, b.kind, b, b.delimiter); else if (b.kind == "string") this.pushNode(d, b.kind, b); else if (b.kind == "comment" || b.kind == "keyword") this.identifier(d), this.pushNode(d, b.kind, b); else if (c == "=" || c == ":") this.identifier(d), this.pushNode(d, "assignment", b); else if (c == ";" || c == ",") this.identifier(d); else if (c == "[") this.processArray(d, b); else {
if (c == "]") return this.lastToken = b, this.identifier(d);
if (c == "{") this.processBlock(d, b); else {
if (c == "}") return this.lastToken = b, this.identifier(d);
if (c == "(") this.processArguments(d, b); else {
if (c == ")") return this.lastToken = b, this.identifier(d);
this.pushToken(b);
}
}
}
this.lastToken = b;
}
return d;
}
}), enyo.kind({
name: "enyo.parser.Text",
kind: enyo.parser.Base,
pushLine: function(a) {
arguments.length && this.a.push(a), this.html.push("<span>", this.a.join("&middot;"), "</span><br />"), this.a = [];
},
processParams: function(a) {
this.lastToken.kind != "symbol" ? this.pushToken("[arguments|params]") : this.pushToken("[ternary op]"), this.pushToken(a), this.processTokens();
},
processTokens: function() {
var a, b;
while (a = this.next()) {
b = a.token;
if (a.kind == "ws") continue;
if (b == ";") this.pushLine(b); else if (b == "{") this.pushLine(b + "<blockquote>"); else if (b == "}") this.pushLine("</blockquote>" + b); else if (b == "(") this.processParams(b); else {
if (b == ")") {
this.pushToken(b);
return;
}
this.pushToken(b);
}
this.lastToken = a;
}
return this.html.join("");
}
}), enyo.parser.Js = enyo.parser.Code;

// runtime-machine.js

runtimeMachine = {
_head: function(a, b, c) {
this._inflight = !0;
var d = document.createElement(a);
for (var e in b) d.setAttribute(e, b[e]);
return c && (d.innerText = c), this._headElt || (this._headElt = document.getElementsByTagName("head")[0]), this._headElt.appendChild(d), d;
},
sheet: function(a) {
this._head("link", {
type: "text/css",
media: "screen",
rel: "stylesheet",
href: a
});
},
inject: function(a) {
this._head("script", {
type: "text/javascript"
}, a);
},
_scripts: [],
script: function(a) {
this._inflight ? this._scripts.push(a) : this._script(a);
},
_require: function(a) {},
_script: function(a) {
this._inflight = !0;
var b = this._head("script", {
type: "text/javascript",
src: a
}), c = this;
b.onload = function() {
c._loaded(a);
}, b.onerror = function() {
c._error(a);
};
},
_continue: function() {
this._inflight = !1;
var a = this._scripts.pop();
a && this._script(a);
},
_loaded: function(a) {
this._continue();
},
_error: function(a) {
this._continue();
}
};

// Documentor.js

enyo.kind({
name: "enyo.Documentor",
commentRx: /\/\*\*([\s\S]*)\*\/|\/\/\*(.*)/m,
constructor: function(a) {
this.translate(new enyo.parser.Js(new enyo.lexer.Js(a)));
},
translate: function(a) {
this.results = this.translateNodes(a.nodes);
},
translateNodes: function(a, b) {
var c = "public", d = b || {
objects: []
};
for (var e = 0, f = [], g; g = a[e]; e++) switch (g.kind) {
case "association":
var h = g.children;
h.length == 3 && h[0].token == "function" && h[2].kind == "block" && this.translateNodes(h[2].children, d);
break;
case "identifier":
a[e + 1] && a[e + 1].kind == "assignment" ? (e++, a[++e].kind == "block" ? (d.objects.push(this.makeObject(g.token, a[e].children, f, c)), f = []) : a[e].token == "function" && (d.objects.push(this.makeFunction(g.token, a[e + 1], f, c)), f = [])) : g.token == "enyo.kind" && (d.objects.push(this.makeKind(a[++e].children, f, c)), f = []);
break;
case "comment":
var i = g.token.match(this.commentRx);
if (i) {
i = i[1] ? i[1] : i[2];
var j = this.extractPragmas(i);
j.result != null && f.push(j.result), c = j.group || c;
}
default:
}
return f.length && (d.comment = f.join(" "), f = []), d;
},
makeFunction: function(a, b, c, d) {
return {
type: "function",
comment: c.join(" "),
group: d,
name: a,
args: this.composeAssociation(b)
};
},
makeKind: function(a, b, c) {
var d = this.makeThing("kind", a[0].children, b, c), e = d.properties.map, f = d.properties.names, g = function(a, b) {
var c = e[a];
c && (typeof c.value == "string" && (c.value = stripQuotes(c.value)), d[b || a] = c), delete e[a];
for (var g = 0, h; h = f[g]; g++) if (h == a) {
f.splice(g, 1);
break;
}
};
return g("name"), g(e.isa ? "isa" : "kind", "kind"), g("published"), g("events"), delete e.chrome, delete e.components, d;
},
makeObject: function(a, b, c, d) {
var e = this.makeThing("object", b, c, d);
return e.name = a, e;
},
makeThing: function(a, b, c, d) {
var e = this.parseProperties(name, b);
return e.type = a, e.comment = c.join(" "), e.group = d, e;
},
extractPragmas: function(a) {
var b = /^[*\s]*@[\S\s]*/g, c = {
"protected": 1,
"public": 1
}, d, e = [], f = a;
return f.length && (f = a.replace(b, function(a) {
var b = a.slice(2);
return e.push(b), c[b] && (d = b), "";
}), f.length || (f = null)), {
result: f,
pragmas: e,
group: d
};
},
parseProperties: function(a, b) {
var c = {
names: [],
map: {}
}, d = {
names: [],
map: {}
}, e = {
properties: c,
methods: d
};
if (!b) return e;
var f = "public", g = [];
for (var h = 0, i, j; i = b[h]; h++) if (i.kind == "comment") {
var k = i.token.match(this.commentRx);
if (k) {
k = k[1] || k[2];
var i = this.extractPragmas(k);
i.result != null && g.push(i.result), f = i.group || f;
}
} else {
var l = i.token;
h++;
var m = b[++h];
if (m && m.token == "function") d.names.push(l), d.map[l] = {
name: l,
args: this.composeAssociation(b[++h]),
comment: g.join(" "),
group: f
}, h++; else {
var n = {
name: l,
comment: g.join(" "),
group: f
};
m && m.kind == "block" ? n.value = this.parseProperties(a, m.children) : m && m.kind == "array" ? n.value = "[]" : (n.value = m && m.token, m = b[h + 1], m && m.kind == "argument-list" && (h++, n.value += "(" + this.composeAssociation(m) + ")")), c.names.push(l), c.map[l] = n;
}
g = [];
}
return e;
},
composeAssociation: function(a) {
if (a.children) {
var b = [];
for (var c = 0, d; d = a.children[c]; c++) d.kind != "comment" && b.push(d.token);
return b.join(", ");
}
return a.token;
}
}), stripQuotes = function(a) {
var b = a.charAt(0);
if (b == '"' || b == "'") a = a.substring(1);
var c = a.length - 1, d = a.charAt(c);
if (d == '"' || d == "'") a = a.substr(0, c);
return a;
};

// Module.js

enyo.kind({
name: "Module",
kind: "Component",
statics: {
topicMap: {},
topicIndex: [],
topicMap2: {},
topicIndex2: []
},
published: {
path: "",
source: ""
},
type: "module",
create: function() {
this.inherited(arguments), this.module = (new enyo.Documentor(this.source)).results, this.group = this.module.group || "public";
var a = "enyo", b = this.path.indexOf(a), c = this.path.slice(b + a.length);
this.addToIndex(c, this), this.indexObjects();
},
addToIndex: function(a, b) {
Module.topicMap2[a] = b, Module.topicIndex2.push(a);
},
indexObjects: function() {
var a = this.module.objects;
for (var b = 0, c, d; c = a[b]; b++) if (c.group == "public" && c.name) {
switch (c.type) {
case "kind":
d = c.name.value;
break;
case "object":
d = c.name;
break;
case "function":
d = c.name;
break;
default:
continue;
}
this.addToIndex(d, c), Module.topicMap[d] = this, Module.topicIndex.push(d);
}
},
kindByName: function(a) {
var b = this.module.objects;
for (var c = 0, d; d = b[c]; c++) if (a == d.name.value) return d;
}
});

// Reader.js

enyo.kind({
name: "Reader",
kind: enyo.Component,
events: {
onFinish: ""
},
moduleIndex: 0,
modules: {},
loadModules: function(a) {
this.loader = a, this.moduleIndex = 0, this.modules = {}, this.nextModule();
},
nextModule: function() {
var a = this.loader.modules[this.moduleIndex++];
a ? this.loadModule(a.path) : this.modulesFinished();
},
loadModule: function(a) {
enyo.xhrGet({
url: a,
load: enyo.bind(this, "moduleLoaded", a)
});
},
moduleLoaded: function(a, b) {
b && b.length && this.addModule(a, b), this.nextModule();
},
addModule: function(a, b) {
this.modules[a] = new Module({
name: a,
path: a,
source: b
});
},
modulesFinished: function() {
this.doFinish();
}
});

// Walker.js

enyo.kind({
name: "Walker",
kind: enyo.Component,
published: {
verbose: !1
},
events: {
onReport: "",
onFinish: ""
},
components: [ {
kind: "Reader",
onFinish: "readerFinish"
} ],
walk: function(a) {
this.loader = new enyo.loaderFactory(runtimeMachine), this.loader.loadScript = function() {}, this.loader.loadSheet = function() {}, this.loader.verbose = this.verbose, this.loader.report = enyo.bind(this, "walkReport"), this.loader.finish = enyo.bind(this, "walkFinish"), enyo.loader = this.loader, enyo.loader.load(a);
},
walkReport: function(a, b) {
this.doReport(a, b);
},
walkFinish: function() {
this.analyzeModules();
},
analyzeModules: function() {
this.$.reader.loadModules(this.loader);
},
readerFinish: function() {
this.modules = this.$.reader.modules, this.doFinish();
}
});

// $lib/extra/utils/macroize.js

enyo.macroize = function(a, b, c) {
var d, e, f = a, g = c || enyo.macroize.pattern, h = function(a, c) {
return e = !0, d = enyo.getObject(c, !1, b), d === undefined || d === null ? "{$" + c + "}" : d;
}, i = 0;
do e = !1, f = f.replace(g, h); while (e && i++ < 100);
return f;
}, enyo.macroize.pattern = /{\$([^{}]*)}/g;

// showdown-v0.9/compressed/showdown.js

var Showdown = {};

Showdown.converter = function() {
var a, b, c, d = 0;
this.makeHtml = function(d) {
return a = new Array, b = new Array, c = new Array, d = d.replace(/~/g, "~T"), d = d.replace(/\$/g, "~D"), d = d.replace(/\r\n/g, "\n"), d = d.replace(/\r/g, "\n"), d = "\n\n" + d + "\n\n", d = E(d), d = d.replace(/^[ \t]+$/mg, ""), d = f(d), d = e(d), d = h(d), d = C(d), d = d.replace(/~D/g, "$$"), d = d.replace(/~T/g, "~"), d;
};
var e = function(c) {
var c = c.replace(/^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?[ \t]*\n?[ \t]*(?:(\n*)["(](.+?)[")][ \t]*)?(?:\n+|\Z)/gm, function(c, d, e, f, g) {
return d = d.toLowerCase(), a[d] = y(e), f ? f + g : (g && (b[d] = g.replace(/"/g, "&quot;")), "");
});
return c;
}, f = function(a) {
a = a.replace(/\n/g, "\n\n");
var b = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del", c = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math";
return a = a.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^\r]*?\n<\/\2>[ \t]*(?=\n+))/gm, g), a = a.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math)\b[^\r]*?.*<\/\2>[ \t]*(?=\n+)\n)/gm, g), a = a.replace(/(\n[ ]{0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g, g), a = a.replace(/(\n\n[ ]{0,3}<!(--[^\r]*?--\s*)+>[ \t]*(?=\n{2,}))/g, g), a = a.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g, g), a = a.replace(/\n\n/g, "\n"), a;
}, g = function(a, b) {
var d = b;
return d = d.replace(/\n\n/g, "\n"), d = d.replace(/^\n/, ""), d = d.replace(/\n+$/g, ""), d = "\n\n~K" + (c.push(d) - 1) + "K\n\n", d;
}, h = function(a) {
a = o(a);
var b = s("<hr />");
return a = a.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm, b), a = a.replace(/^[ ]{0,2}([ ]?\-[ ]?){3,}[ \t]*$/gm, b), a = a.replace(/^[ ]{0,2}([ ]?\_[ ]?){3,}[ \t]*$/gm, b), a = q(a), a = r(a), a = w(a), a = f(a), a = x(a), a;
}, i = function(a) {
return a = t(a), a = j(a), a = z(a), a = m(a), a = k(a), a = A(a), a = y(a), a = v(a), a = a.replace(/  +\n/g, " <br />\n"), a;
}, j = function(a) {
var b = /(<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--.*?--\s*)+>)/gi;
return a = a.replace(b, function(a) {
var b = a.replace(/(.)<\/?code>(?=.)/g, "$1`");
return b = F(b, "\\`*_"), b;
}), a;
}, k = function(a) {
return a = a.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g, l), a = a.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?(.*?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g, l), a = a.replace(/(\[([^\[\]]+)\])()()()()()/g, l), a;
}, l = function(c, d, e, f, g, h, i, j) {
j == undefined && (j = "");
var k = d, l = e, m = f.toLowerCase(), n = g, o = j;
if (n == "") {
m == "" && (m = l.toLowerCase().replace(/ ?\n/g, " ")), n = "#" + m;
if (a[m] != undefined) n = a[m], b[m] != undefined && (o = b[m]); else if (k.search(/\(\s*\)$/m) > -1) n = ""; else return k;
}
n = F(n, "*_");
var p = '<a href="' + n + '"';
return o != "" && (o = o.replace(/"/g, "&quot;"), o = F(o, "*_"), p += ' title="' + o + '"'), p += ">" + l + "</a>", p;
}, m = function(a) {
return a = a.replace(/(!\[(.*?)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g, n), a = a.replace(/(!\[(.*?)\]\s?\([ \t]*()<?(\S+?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g, n), a;
}, n = function(c, d, e, f, g, h, i, j) {
var k = d, l = e, m = f.toLowerCase(), n = g, o = j;
o || (o = "");
if (n == "") {
m == "" && (m = l.toLowerCase().replace(/ ?\n/g, " ")), n = "#" + m;
if (a[m] != undefined) n = a[m], b[m] != undefined && (o = b[m]); else return k;
}
l = l.replace(/"/g, "&quot;"), n = F(n, "*_");
var p = '<img src="' + n + '" alt="' + l + '"';
return o = o.replace(/"/g, "&quot;"), o = F(o, "*_"), p += ' title="' + o + '"', p += " />", p;
}, o = function(a) {
return a = a.replace(/^(.+)[ \t]*\n=+[ \t]*\n+/gm, function(a, b) {
return s("<h1>" + i(b) + "</h1>");
}), a = a.replace(/^(.+)[ \t]*\n-+[ \t]*\n+/gm, function(a, b) {
return s("<h2>" + i(b) + "</h2>");
}), a = a.replace(/^(\#{1,6})[ \t]*(.+?)[ \t]*\#*\n+/gm, function(a, b, c) {
var d = b.length;
return s("<h" + d + ">" + i(c) + "</h" + d + ">");
}), a;
}, p, q = function(a) {
a += "~0";
var b = /^(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm;
return d ? a = a.replace(b, function(a, b, c) {
var d = b, e = c.search(/[*+-]/g) > -1 ? "ul" : "ol";
d = d.replace(/\n{2,}/g, "\n\n\n");
var f = p(d);
return f = f.replace(/\s+$/, ""), f = "<" + e + ">" + f + "</" + e + ">\n", f;
}) : (b = /(\n\n|^\n?)(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/g, a = a.replace(b, function(a, b, c, d) {
var e = b, f = c, g = d.search(/[*+-]/g) > -1 ? "ul" : "ol", f = f.replace(/\n{2,}/g, "\n\n\n"), h = p(f);
return h = e + "<" + g + ">\n" + h + "</" + g + ">\n", h;
})), a = a.replace(/~0/, ""), a;
};
p = function(a) {
return d++, a = a.replace(/\n{2,}$/, "\n"), a += "~0", a = a.replace(/(\n)?(^[ \t]*)([*+-]|\d+[.])[ \t]+([^\r]+?(\n{1,2}))(?=\n*(~0|\2([*+-]|\d+[.])[ \t]+))/gm, function(a, b, c, d, e) {
var f = e, g = b, j = c;
return g || f.search(/\n{2,}/) > -1 ? f = h(D(f)) : (f = q(D(f)), f = f.replace(/\n$/, ""), f = i(f)), "<li>" + f + "</li>\n";
}), a = a.replace(/~0/g, ""), d--, a;
};
var r = function(a) {
return a += "~0", a = a.replace(/(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=~0))/g, function(a, b, c) {
var d = b, e = c;
return d = u(D(d)), d = E(d), d = d.replace(/^\n+/g, ""), d = d.replace(/\n+$/g, ""), d = "<pre><code>" + d + "\n</code></pre>", s(d) + e;
}), a = a.replace(/~0/, ""), a;
}, s = function(a) {
return a = a.replace(/(^\n+|\n+$)/g, ""), "\n\n~K" + (c.push(a) - 1) + "K\n\n";
}, t = function(a) {
return a = a.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm, function(a, b, c, d, e) {
var f = d;
return f = f.replace(/^([ \t]*)/g, ""), f = f.replace(/[ \t]*$/g, ""), f = u(f), b + "<code>" + f + "</code>";
}), a;
}, u = function(a) {
return a = a.replace(/&/g, "&amp;"), a = a.replace(/</g, "&lt;"), a = a.replace(/>/g, "&gt;"), a = F(a, "*_{}[]\\", !1), a;
}, v = function(a) {
return a = a.replace(/(\*\*|__)(?=\S)([^\r]*?\S[*_]*)\1/g, "<strong>$2</strong>"), a = a.replace(/(\*|_)(?=\S)([^\r]*?\S)\1/g, "<em>$2</em>"), a;
}, w = function(a) {
return a = a.replace(/((^[ \t]*>[ \t]?.+\n(.+\n)*\n*)+)/gm, function(a, b) {
var c = b;
return c = c.replace(/^[ \t]*>[ \t]?/gm, "~0"), c = c.replace(/~0/g, ""), c = c.replace(/^[ \t]+$/gm, ""), c = h(c), c = c.replace(/(^|\n)/g, "$1  "), c = c.replace(/(\s*<pre>[^\r]+?<\/pre>)/gm, function(a, b) {
var c = b;
return c = c.replace(/^  /mg, "~0"), c = c.replace(/~0/g, ""), c;
}), s("<blockquote>\n" + c + "\n</blockquote>");
}), a;
}, x = function(a) {
a = a.replace(/^\n+/g, ""), a = a.replace(/\n+$/g, "");
var b = a.split(/\n{2,}/g), d = new Array, e = b.length;
for (var f = 0; f < e; f++) {
var g = b[f];
g.search(/~K(\d+)K/g) >= 0 ? d.push(g) : g.search(/\S/) >= 0 && (g = i(g), g = g.replace(/^([ \t]*)/g, "<p>"), g += "</p>", d.push(g));
}
e = d.length;
for (var f = 0; f < e; f++) while (d[f].search(/~K(\d+)K/) >= 0) {
var h = c[RegExp.$1];
h = h.replace(/\$/g, "$$$$"), d[f] = d[f].replace(/~K\d+K/, h);
}
return d.join("\n\n");
}, y = function(a) {
return a = a.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g, "&amp;"), a = a.replace(/<(?![a-z\/?\$!])/gi, "&lt;"), a;
}, z = function(a) {
return a = a.replace(/\\(\\)/g, G), a = a.replace(/\\([`*_{}\[\]()>#+-.!])/g, G), a;
}, A = function(a) {
return a = a.replace(/<((https?|ftp|dict):[^'">\s]+)>/gi, '<a href="$1">$1</a>'), a = a.replace(/<(?:mailto:)?([-.\w]+\@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi, function(a, b) {
return B(C(b));
}), a;
}, B = function(a) {
function b(a) {
var b = "0123456789ABCDEF", c = a.charCodeAt(0);
return b.charAt(c >> 4) + b.charAt(c & 15);
}
var c = [ function(a) {
return "&#" + a.charCodeAt(0) + ";";
}, function(a) {
return "&#x" + b(a) + ";";
}, function(a) {
return a;
} ];
return a = "mailto:" + a, a = a.replace(/./g, function(a) {
if (a == "@") a = c[Math.floor(Math.random() * 2)](a); else if (a != ":") {
var b = Math.random();
a = b > .9 ? c[2](a) : b > .45 ? c[1](a) : c[0](a);
}
return a;
}), a = '<a href="' + a + '">' + a + "</a>", a = a.replace(/">.+:/g, '">'), a;
}, C = function(a) {
return a = a.replace(/~E(\d+)E/g, function(a, b) {
var c = parseInt(b);
return String.fromCharCode(c);
}), a;
}, D = function(a) {
return a = a.replace(/^(\t|[ ]{1,4})/gm, "~0"), a = a.replace(/~0/g, ""), a;
}, E = function(a) {
return a = a.replace(/\t(?=\t)/g, "    "), a = a.replace(/\t/g, "~A~B"), a = a.replace(/~B(.+?)~A/g, function(a, b, c) {
var d = b, e = 4 - d.length % 4;
for (var f = 0; f < e; f++) d += " ";
return d;
}), a = a.replace(/~A/g, "    "), a = a.replace(/~B/g, ""), a;
}, F = function(a, b, c) {
var d = "([" + b.replace(/([\[\]\\])/g, "\\$1") + "])";
c && (d = "\\\\" + d);
var e = new RegExp(d, "g");
return a = a.replace(e, G), a;
}, G = function(a, b) {
var c = b.charCodeAt(0);
return "~E" + c + "E";
};
};

// Formatter.js

enyo.kind({
name: "Formatter",
kind: "Component",
statics: {
showdown: new Showdown.converter
},
propertyFormat: "<code>{$name}: <literal>{$value}</literal></code>",
methodFormat: "<code>{$name}</code>: <em>function</em>(<code><literal>{$args}</literal></code>)",
format: function(a) {
var b = [];
return this._format(a, b), b.join("");
},
_format: function(a, b) {
if (this.shouldFormat(a)) switch (a.type) {
case "module":
this.formatModule(a, b);
break;
case "function":
this.formatFunction(a, b);
break;
case "kind":
this.formatKind(a, b);
break;
case "object":
this.formatObject(a, b);
}
},
shouldFormat: function(a) {
return a.group == "public";
},
formatModule: function(a, b) {
var c = a.path, d = a.module;
b.push('<blockquote><a name="' + c + '">' + c + "</a></blockquote>"), b.push(this.formatComment(d.comment));
var e = d.objects;
for (var f = 0, g; g = e[f]; f++) this._format(g, b);
},
formatFunction: function(a, b) {
b.push('<h2><a name="' + a.name + '">' + a.name + "</a></h2>"), b.push(enyo.macroize(this.methodFormat, a)), b.push(this.formatComment(a.comment));
},
formatKind: function(a, b) {
b.push('<h1><a name="' + a.name.value + '">' + a.name.value + "</a></h1>"), b.push(this.formatComment(a.comment)), a.kind && (b.push("<h2>Extends</h2>"), b.push("<h4>" + this.formatLinkName(a.kind.value) + "</h4>")), this.addProperties(a.published, "Published Properties", b), this.addProperties(a.events, "Published Events", b), this.addMethods(a.methods, "Methods", b), this.addInherited(a, "Inheritance", b);
},
addProperties: function(a, b, c) {
a && (c.push("<h2>" + b + "</h2>"), c.push(this.formatPropList(a.value.properties, this.propertyFormat)));
},
addMethods: function(a, b, c) {
if (a) {
a.names.sort();
var d = this.formatPropItems(a, this.methodFormat);
d.length && (c.push("<h2>" + b + "</h2>"), c.push(this.formatPropItemList(d)));
}
},
addInherited: function(a, b, c) {
var d = this.formatInherited(a);
d && c.push(d);
},
formatLinkName: function(a) {
return '<a href="#' + a + '"><em>' + a + "</em></a>";
},
formatInherited: function(a) {
var b = [], c = [], d = [], e = a;
while (e && e.kind) {
var f = e.kind.value, g = Module.topicMap[f];
e = g && g.kindByName(f);
if (!e) break;
var f = this.formatLinkName(f);
e.published && e.published.value.properties && this.addSimplePropertyList(e.published.value.properties, "Published properties inherited from " + f, b), e.events && e.events.value.properties && this.addSimplePropertyList(e.events.value.properties, "Events inherited from " + f, c), this.addSimplePropertyList(e.methods, "Methods inherited from " + f, d);
}
return b.join("") + c.join("") + d.join("");
},
addSimplePropertyList: function(a, b, c) {
var d = [];
if (a && a.names) {
var e = [];
for (var f = 0, g; g = a.names[f]; f++) a.map[g].group == "public" && e.push(g);
e.length && (c.push("<h2>" + b + "</h2>"), c.push("<blockquote>" + e.join(", ") + "</blockquote>"));
}
},
formatObject: function(a, b) {
var c = a.name || "<anonymous>";
b.push('<h1><a name="' + c + '">' + c + "</a></h1>"), b.push(this.formatComment(a.comment));
var d = this.formatPropItems(a.properties, "<code>{$name}: <literal>{$value}</literal></code>");
d.length && (b.push("<h2>Properties</h2>"), b.push(this.formatPropItemList(d))), a.methods.names.length && (b.push("<h2>Methods</h2>"), a.methods.names.sort(), b.push(this.formatPropList(a.methods, "<code>{$name}</code>: <em>function</em>(<code><literal>{$args}</literal></code>)")));
},
formatComment: function(a) {
if (!a) return "";
var b = a.split(/\r?\n/), c = 0;
for (var d = 0, e; (e = b[d]) != null; d++) if (e.length > 0) {
c = e.search(/\S/), c < 0 && (c = e.length);
break;
}
if (c) for (var d = 0, e; (e = b[d]) != null; d++) b[d] = e.slice(c);
var f = b.join("\n");
return "<p>" + Formatter.showdown.makeHtml(f) + "</p>";
},
formatPropList: function(a, b) {
var c = a.names, d = a.map, e = [];
e.push("<ul>");
for (var f = 0, g, h, i; g = c[f]; f++) h = d[g], h && h.group == "public" && (e.push("<li>"), i = null, h.value && h.value.properties && (i = h.value, h.value = ""), e.push(enyo.macroize(b, h)), i && (h.value = i, e.push(this.formatPropList(i.properties, "<code>{$name}</code>: <code>{$value}</code>"))), e.push(this.formatComment(h.comment)), e.push("</li>"));
return e.push("</ul>"), e.join("");
},
formatPropItems: function(a, b) {
var c = [], d = a.names, e = a.map;
for (var f = 0, g, h, i; g = d[f]; f++) h = e[g], h && h.group == "public" && (c.push("<li>"), i = null, h.value && h.value.properties && (i = h.value, h.value = ""), c.push(enyo.macroize(b, h)), i && (h.value = i, c.push(this.formatPropList(i.properties, "<code>{$name}</code>: <code>{$value}</code>"))), c.push(this.formatComment(h.comment)), c.push("</li>"));
return c;
},
formatPropItemList: function(a) {
return "<ul>" + a.join("") + "</ul>";
}
});

// Doc.js

enyo.kind({
name: "Doc",
kind: "Component",
events: {
onReport: "",
onFinish: ""
},
components: [ {
name: "walker",
kind: "Walker",
onReport: "walkerReport",
onFinish: "walkerFinish"
} ],
walkerReport: function(a, b, c) {
this.doReport(b, c);
},
walkEnyo: function(a) {
this.$.walker.walk(a);
},
walkerFinish: function() {
this.doFinish();
},
info: function() {
this.$.toc.setContent(this.buildToc()), this.$.index.setContent(this.buildIndex()), this.selectTopic(window.location.hash.slice(1) || "enyo.Component");
},
relativizePath: function(a) {
var b = a.indexOf("source");
return a.slice(b + 7);
},
buildModuleList: function() {
var a = {};
for (var b in this.$.walker.modules) {
var c = this.$.walker.modules[b], d = c.package.toLowerCase();
a[d] || (a[d] = {
"package": c.package,
modules: []
});
var b = c.path.split("/").pop(), e = this.relativizePath(c.path), f = '<a id="toc_' + e + '" href="#' + e + '">' + b + "</a>";
a[d].modules.push(f);
}
return a;
},
buildToc: function() {
var a = this.buildModuleList(), b = Object.keys(a);
for (var c = 0, d, e; d = b[c], e = a[d]; c++) {
var f = "<ul><li>" + e.modules.join("</li><li>") + "</li></ul>";
f = "<li>" + e.package + f + "</li>", b[c] = f;
}
var f = [];
return f.push("<ul>" + b.join("") + "</ul>"), f.join("");
},
buildIndex: function() {
var a = Module.topicIndex2;
a.sort(function(a, b) {
var c = a.toLowerCase(), d = b.toLowerCase();
return c < d ? -1 : c > d ? 1 : 0;
});
var b = {};
for (var c = 0, d; d = a[c]; c++) {
var e = d.split(".");
e = e[0] == "enyo" ? e[1] || e[0] : d, e = e[0].toUpperCase(), b[e] || (b[e] = []), b[e].push(d);
}
var f = [];
for (var c = -1; c < 26; c++) {
var g = c >= 0 ? String.fromCharCode(65 + c) : null, h = b[g];
if (h) {
f.push("<h2>" + g + "</h2><ul>");
for (var i = 0, d; d = h[i]; i++) f.push('<li id="idx_' + d + '"><a href="#' + d + '">' + d + "</a></li>");
f.push("</ul>");
}
}
return f.join("");
}
});

// App.js

enyo.kind({
name: "App",
kind: "Control",
className: "enyo-fit enyo-unselectable",
layoutKind: "VBoxLayout",
target: "../../enyo/source",
components: [ {
kind: "Doc",
onFinish: "info",
onReport: "report"
}, {
kind: "Formatter"
}, {
name: "header",
height: 50,
content: "Enyo API Viewer"
}, {
layoutKind: "HBoxLayout",
height: "fill",
components: [ {
xkind: "SimpleScroller",
width: 300,
style: "overflow: auto;",
components: [ {
name: "index",
allowHtml: !0,
style: "padding: 10px;"
} ]
}, {
width: "fill",
layoutKind: "VBoxLayout",
components: [ {
height: 40,
components: [ {
name: "group",
kind: "SimpleScroller",
className: "tabbar",
style: "overflow: hidden; padding-bottom: 10px; background-color: #fff;",
onmousedown: "tabbarSelect"
}, {
name: "status",
content: "Status",
style: "background-color: black; color: yellow;",
showing: !1
} ]
}, {
xkind: "SimpleScroller",
style: "padding: 10px; overflow: auto;",
height: "fill",
components: [ {
name: "docs",
content: "<b>Loading...</b>",
onclick: "docClick",
allowHtml: !0
} ]
} ]
} ]
} ],
create: function() {
this.inherited(arguments), this.selectViewByIndex(0), window.onhashchange = enyo.bind(this, "hashChange"), enyo.asyncMethod(this.$.doc, "walkEnyo", enyo.path.rewrite(this.target));
},
report: function(a, b, c) {
this.$.docs.setContent("<b>" + b + (c ? "</b>: <span style='color: green;'>" + c + "</span>" : ""));
},
info: function() {
this.$.index.setContent(this.$.doc.buildIndex()), this.selectTopic(window.location.hash.slice(1) || "enyo.Component");
},
hashChange: function(a) {
var b = window.location.hash.slice(1);
b != this.topic && this.selectTopic(b);
},
selectViewByIndex: function(a) {
this.$.docs.setShowing(!1), [ this.$.docs, this.$.index, this.$.toc ][a].setShowing(!0);
},
backClick: function() {
window.history.back();
},
topicClick: function(a) {
var b = a;
b.topic && (window.location.href = "#" + b.topic);
},
closeTopicClick: function(a) {
a.destroy();
},
tocClick: function(a, b) {
try {
this.selectTopic(b.target.hash.slice(1));
} catch (c) {}
},
docClick: function(a, b) {
try {
this.selectTopic(b.target.parentNode.hash.slice(1));
} catch (c) {}
},
selectTopic: function(b) {
this.topic = b;
if (b == "toc") this.selectViewByIndex(0), this.$.docs.setContent(this.$.doc.buildToc()); else if (b == "index") this.selectViewByIndex(1); else {
this.selectViewByIndex(0);
var c = Module.topicMap2[b], d = "(no topic)";
c && (d = this.$.formatter.format(c)), this.$.docs.setContent(d), a = document.anchors[b], !a;
}
var e = null;
enyo.forEach(this.$.group.getClientControls(), function(a) {
a.topic == b && (e = a), a.addRemoveClass("active", a.topic == b);
}), e || (e = this.$.group.createComponent({
kind: "TopicTab",
className: "active",
topic: b,
onclick: "topicClick",
onClose: "closeTopicClick",
owner: this
}).render()), e.hasNode().scrollIntoView();
}
}), enyo.kind({
name: "SimpleScroller",
kind: "Control",
dragstartHandler: function() {
this.x0 = this.hasNode().scrollLeft, this.y0 = this.hasNode().scrollTop;
},
dragoverHandler: function(a, b) {
this.hasNode().scrollLeft = this.x0 - b.dx, this.hasNode().scrollTop = this.y0 - b.dy;
}
}), enyo.kind({
name: "Tabbar",
kind: "Control",
className: "tabbar",
removeControl: function() {
this.inherited(arguments), this.hasNode() && this.overflowAmount() <= 0 && (this.node.style.left = "0");
},
overflowAmount: function() {
var a = this.hasNode();
return a.clientWidth - a.scrollWidth;
},
dragstartHandler: function() {
this.x0 = this.hasNode().offsetLeft;
},
dragoverHandler: function(a, b) {
if (this.hasNode()) {
var c = this.x0 + b.dx, d = this.overflowed();
this.node.style.left = Math.min(0, Math.max(c, d)) + "px";
}
},
dragfinishHandler: function(a, b) {}
}), enyo.kind({
name: "TopicTab",
kind: "Control",
className: "tab",
events: {
onClose: ""
},
components: [ {
tagName: "span",
name: "caption"
}, {
tagName: "img",
style: "margin: 0; padding: 0 0 2px 6px; vertical-align: middle;",
src: "images/close.png",
onmousedown: "closeDown",
onclick: "doClose"
} ],
create: function() {
this.inherited(arguments), this.$.caption.setContent(this.topic);
},
closeDown: function(a, b) {
b.stopPropagation();
}
});

// minifier: load css

enyo.machine.sheet("api.css");
