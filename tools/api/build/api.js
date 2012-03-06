
// foss/showdown-v0.9/compressed/showdown.js

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
if (a[m] != undefined) n = a[m], b[m] != undefined && (o = b[m]); else {
if (!(k.search(/\(\s*\)$/m) > -1)) return k;
n = "";
}
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
if (a[m] == undefined) return k;
n = a[m], b[m] != undefined && (o = b[m]);
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

// foss/syntaxhighlighter_3.0.83_fork/sh-min.js

var XRegExp;

if (XRegExp) throw Error("can't load XRegExp twice in the same frame");

(function() {
function a(a, c) {
if (!XRegExp.isRegExp(a)) throw TypeError("type RegExp expected");
var d = a._xregexp;
return a = XRegExp(a.source, b(a) + (c || "")), d && (a._xregexp = {
source: d.source,
captureNames: d.captureNames ? d.captureNames.slice(0) : null
}), a;
}
function b(a) {
return (a.global ? "g" : "") + (a.ignoreCase ? "i" : "") + (a.multiline ? "m" : "") + (a.extended ? "x" : "") + (a.sticky ? "y" : "");
}
function c(a, b, c, d) {
var e = i.length, f, g, j;
h = !0;
try {
while (e--) {
j = i[e];
if (c & j.scope && (!j.trigger || j.trigger.call(d))) {
j.pattern.lastIndex = b, g = j.pattern.exec(a);
if (g && g.index === b) {
f = {
output: j.handler.call(d, g, c),
match: g
};
break;
}
}
}
} catch (k) {
throw k;
} finally {
h = !1;
}
return f;
}
function d(a, b, c) {
if (Array.prototype.indexOf) return a.indexOf(b, c);
for (var d = c || 0; d < a.length; d++) if (a[d] === b) return d;
return -1;
}
XRegExp = function(b, d) {
var e = [], g = XRegExp.OUTSIDE_CLASS, i = 0, k, l, m, n, p;
if (XRegExp.isRegExp(b)) {
if (d !== undefined) throw TypeError("can't supply flags when constructing one RegExp from another");
return a(b);
}
if (h) throw Error("can't call the XRegExp constructor within token definition functions");
d = d || "", k = {
hasNamedCapture: !1,
captureNames: [],
hasFlag: function(a) {
return d.indexOf(a) > -1;
},
setFlag: function(a) {
d += a;
}
};
while (i < b.length) l = c(b, i, g, k), l ? (e.push(l.output), i += l.match[0].length || 1) : (m = j.exec.call(o[g], b.slice(i))) ? (e.push(m[0]), i += m[0].length) : (n = b.charAt(i), n === "[" ? g = XRegExp.INSIDE_CLASS : n === "]" && (g = XRegExp.OUTSIDE_CLASS), e.push(n), i++);
return p = RegExp(e.join(""), j.replace.call(d, f, "")), p._xregexp = {
source: b,
captureNames: k.hasNamedCapture ? k.captureNames : null
}, p;
}, XRegExp.version = "1.5.0", XRegExp.INSIDE_CLASS = 1, XRegExp.OUTSIDE_CLASS = 2;
var e = /\$(?:(\d\d?|[$&`'])|{([$\w]+)})/g, f = /[^gimy]+|([\s\S])(?=[\s\S]*\1)/g, g = /^(?:[?*+]|{\d+(?:,\d*)?})\??/, h = !1, i = [], j = {
exec: RegExp.prototype.exec,
test: RegExp.prototype.test,
match: String.prototype.match,
replace: String.prototype.replace,
split: String.prototype.split
}, k = j.exec.call(/()??/, "")[1] === undefined, l = function() {
var a = /^/g;
return j.test.call(a, ""), !a.lastIndex;
}(), m = function() {
var a = /x/g;
return j.replace.call("x", a, ""), !a.lastIndex;
}(), n = RegExp.prototype.sticky !== undefined, o = {};
o[XRegExp.INSIDE_CLASS] = /^(?:\\(?:[0-3][0-7]{0,2}|[4-7][0-7]?|x[\dA-Fa-f]{2}|u[\dA-Fa-f]{4}|c[A-Za-z]|[\s\S]))/, o[XRegExp.OUTSIDE_CLASS] = /^(?:\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9]\d*|x[\dA-Fa-f]{2}|u[\dA-Fa-f]{4}|c[A-Za-z]|[\s\S])|\(\?[:=!]|[?*+]\?|{\d+(?:,\d*)?}\??)/, XRegExp.addToken = function(b, c, d, e) {
i.push({
pattern: a(b, "g" + (n ? "y" : "")),
handler: c,
scope: d || XRegExp.OUTSIDE_CLASS,
trigger: e || null
});
}, XRegExp.cache = function(a, b) {
var c = a + "/" + (b || "");
return XRegExp.cache[c] || (XRegExp.cache[c] = XRegExp(a, b));
}, XRegExp.copyAsGlobal = function(b) {
return a(b, "g");
}, XRegExp.escape = function(a) {
return a.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}, XRegExp.execAt = function(b, c, d, e) {
c = a(c, "g" + (e && n ? "y" : "")), c.lastIndex = d = d || 0;
var f = c.exec(b);
return e ? f && f.index === d ? f : null : f;
}, XRegExp.freezeTokens = function() {
XRegExp.addToken = function() {
throw Error("can't run addToken after freezeTokens");
};
}, XRegExp.isRegExp = function(a) {
return Object.prototype.toString.call(a) === "[object RegExp]";
}, XRegExp.iterate = function(b, c, d, e) {
var f = a(c, "g"), g = -1, h;
while (h = f.exec(b)) d.call(e, h, ++g, b, f), f.lastIndex === h.index && f.lastIndex++;
c.global && (c.lastIndex = 0);
}, XRegExp.matchChain = function(b, c) {
return function d(b, e) {
var f = c[e].regex ? c[e] : {
regex: c[e]
}, g = a(f.regex, "g"), h = [], i;
for (i = 0; i < b.length; i++) XRegExp.iterate(b[i], g, function(a) {
h.push(f.backref ? a[f.backref] || "" : a[0]);
});
return e === c.length - 1 || !h.length ? h : d(h, e + 1);
}([ b ], 0);
}, RegExp.prototype.apply = function(a, b) {
return this.exec(b[0]);
}, RegExp.prototype.call = function(a, b) {
return this.exec(b);
}, RegExp.prototype.exec = function(a) {
var c = j.exec.apply(this, arguments), e, f;
if (c) {
!k && c.length > 1 && d(c, "") > -1 && (f = RegExp(this.source, j.replace.call(b(this), "g", "")), j.replace.call(a.slice(c.index), f, function() {
for (var a = 1; a < arguments.length - 2; a++) arguments[a] === undefined && (c[a] = undefined);
}));
if (this._xregexp && this._xregexp.captureNames) for (var g = 1; g < c.length; g++) e = this._xregexp.captureNames[g - 1], e && (c[e] = c[g]);
!l && this.global && !c[0].length && this.lastIndex > c.index && this.lastIndex--;
}
return c;
}, l || (RegExp.prototype.test = function(a) {
var b = j.exec.call(this, a);
return b && this.global && !b[0].length && this.lastIndex > b.index && this.lastIndex--, !!b;
}), String.prototype.match = function(a) {
XRegExp.isRegExp(a) || (a = RegExp(a));
if (a.global) {
var b = j.match.apply(this, arguments);
return a.lastIndex = 0, b;
}
return a.exec(this);
}, String.prototype.replace = function(a, b) {
var c = XRegExp.isRegExp(a), f, g, h;
return c && typeof b.valueOf() == "string" && b.indexOf("${") === -1 && m ? j.replace.apply(this, arguments) : (c ? a._xregexp && (f = a._xregexp.captureNames) : a += "", typeof b == "function" ? g = j.replace.call(this, a, function() {
if (f) {
arguments[0] = new String(arguments[0]);
for (var d = 0; d < f.length; d++) f[d] && (arguments[0][f[d]] = arguments[d + 1]);
}
return c && a.global && (a.lastIndex = arguments[arguments.length - 2] + arguments[0].length), b.apply(null, arguments);
}) : (h = this + "", g = j.replace.call(h, a, function() {
var a = arguments;
return j.replace.call(b, e, function(b, c, e) {
if (!c) {
var g = +e;
return g <= a.length - 3 ? a[g] : (g = f ? d(f, e) : -1, g > -1 ? a[g + 1] : b);
}
switch (c) {
case "$":
return "$";
case "&":
return a[0];
case "`":
return a[a.length - 1].slice(0, a[a.length - 2]);
case "'":
return a[a.length - 1].slice(a[a.length - 2] + a[0].length);
default:
var h = "";
c = +c;
if (!c) return b;
while (c > a.length - 3) h = String.prototype.slice.call(c, -1) + h, c = Math.floor(c / 10);
return (c ? a[c] || "" : "$") + h;
}
});
})), c && a.global && (a.lastIndex = 0), g);
}, String.prototype.split = function(a, b) {
if (!XRegExp.isRegExp(a)) return j.split.apply(this, arguments);
var c = this + "", d = [], e = 0, f, g;
if (b === undefined || +b < 0) b = Infinity; else {
b = Math.floor(+b);
if (!b) return [];
}
a = XRegExp.copyAsGlobal(a);
while (f = a.exec(c)) {
if (a.lastIndex > e) {
d.push(c.slice(e, f.index)), f.length > 1 && f.index < c.length && Array.prototype.push.apply(d, f.slice(1)), g = f[0].length, e = a.lastIndex;
if (d.length >= b) break;
}
a.lastIndex === f.index && a.lastIndex++;
}
return e === c.length ? (!j.test.call(a, "") || g) && d.push("") : d.push(c.slice(e)), d.length > b ? d.slice(0, b) : d;
}, XRegExp.addToken(/\(\?#[^)]*\)/, function(a) {
return j.test.call(g, a.input.slice(a.index + a[0].length)) ? "" : "(?:)";
}), XRegExp.addToken(/\((?!\?)/, function() {
return this.captureNames.push(null), "(";
}), XRegExp.addToken(/\(\?<([$\w]+)>/, function(a) {
return this.captureNames.push(a[1]), this.hasNamedCapture = !0, "(";
}), XRegExp.addToken(/\\k<([\w$]+)>/, function(a) {
var b = d(this.captureNames, a[1]);
return b > -1 ? "\\" + (b + 1) + (isNaN(a.input.charAt(a.index + a[0].length)) ? "" : "(?:)") : a[0];
}), XRegExp.addToken(/\[\^?]/, function(a) {
return a[0] === "[]" ? "\\b\\B" : "[\\s\\S]";
}), XRegExp.addToken(/^\(\?([imsx]+)\)/, function(a) {
return this.setFlag(a[1]), "";
}), XRegExp.addToken(/(?:\s+|#.*)+/, function(a) {
return j.test.call(g, a.input.slice(a.index + a[0].length)) ? "" : "(?:)";
}, XRegExp.OUTSIDE_CLASS, function() {
return this.hasFlag("x");
}), XRegExp.addToken(/\./, function() {
return "[\\s\\S]";
}, XRegExp.OUTSIDE_CLASS, function() {
return this.hasFlag("s");
});
})();

var SyntaxHighlighter = function() {
function a(a) {
return a.split("\n");
}
function b(a, b, c) {
c = Math.max(c || 0, 0);
for (var d = c; d < a.length; d++) if (a[d] == b) return d;
return -1;
}
function c(a, b) {
var c = {}, d;
for (d in a) c[d] = a[d];
for (d in b) c[d] = b[d];
return c;
}
function d(a) {
var b = {
"true": !0,
"false": !1
}[a];
return b == null ? a : b;
}
function e(b, c) {
var d = a(b);
for (var e = 0; e < d.length; e++) d[e] = c(d[e], e);
return d.join("\n");
}
function f(a) {
return a.replace(/^[ ]*[\n]+|[\n]*[ ]*$/g, "");
}
function g(a, b) {
return a == null || a.length == 0 || a == "\n" ? a : (a = a.replace(/</g, "&lt;"), a = a.replace(/ {2,}/g, function(a) {
var b = "";
for (var c = 0; c < a.length - 1; c++) b += q.config.space;
return b + " ";
}), b != null && (a = e(a, function(a) {
if (a.length == 0) return "";
var c = "";
return a = a.replace(/^(&nbsp;| )+/, function(a) {
return c = a, "";
}), a.length == 0 ? c : c + '<code class="' + b + '">' + a + "</code>";
})), a);
}
function h(a, b) {
var c = a.toString();
while (c.length < b) c = "0" + c;
return c;
}
function i(a, b) {
var c = "";
for (var d = 0; d < b; d++) c += " ";
return a.replace(/\t/g, c);
}
function j(b, c) {
function d(a, b, c) {
return a.substr(0, b) + h.substr(0, c) + a.substr(b + 1, a.length);
}
var f = a(b), g = "\t", h = "";
for (var i = 0; i < 50; i++) h += "                    ";
return b = e(b, function(a) {
if (a.indexOf(g) == -1) return a;
var b = 0;
while ((b = a.indexOf(g)) != -1) {
var e = c - b % c;
a = d(a, b, e);
}
return a;
}), b;
}
function k(a) {
var b = /<br\s*\/?>|&lt;br\s*\/?&gt;/gi;
return a = a.replace(b, "\n"), q.config.stripBrs == 1 && (a = a.replace(b, "")), a;
}
function l(a) {
return a.replace(/^\s+|\s+$/g, "");
}
function m(b) {
var c = a(k(b)), d = new Array, e = /^\s*/, f = 1e3;
for (var g = 0; g < c.length && f > 0; g++) {
var h = c[g];
if (l(h).length == 0) continue;
var i = e.exec(h);
if (i == null) return b;
f = Math.min(i[0].length, f);
}
if (f > 0) for (var g = 0; g < c.length; g++) c[g] = c[g].substr(f);
return c.join("\n");
}
function n(a, b) {
return a.index < b.index ? -1 : a.index > b.index ? 1 : a.length < b.length ? -1 : a.length > b.length ? 1 : 0;
}
function o(a, b) {
function c(a, b) {
return a[0];
}
var d = 0, e = null, f = [], g = b.func ? b.func : c;
while ((e = b.regex.exec(a)) != null) {
var h = g(e, b);
typeof h == "string" && (h = [ new q.Match(h, e.index, b.css) ]), f = f.concat(h);
}
return f;
}
function p(a) {
var b = /(.*)((&gt;|&lt;).*)/;
return a.replace(q.regexLib.url, function(a) {
var c = "", d = null;
if (d = b.exec(a)) a = d[1], c = d[2];
return '<a href="' + a + '">' + a + "</a>" + c;
});
}
var q = {
defaults: {
"class-name": "",
"first-line": 1,
"pad-line-numbers": !1,
highlight: null,
"smart-tabs": !0,
"tab-size": 4,
gutter: !0,
"auto-links": !0
},
config: {
space: "&nbsp;",
stripBrs: !1,
strings: {
alert: "SyntaxHighlighter\n\n",
noBrush: "Can't find brush for: ",
brushNotHtmlScript: "Brush wasn't configured for html-script option: "
}
},
brushes: {},
regexLib: {
multiLineCComments: /\/\*[\s\S]*?\*\//gm,
singleLineCComments: /\/\/.*$/gm,
singleLinePerlComments: /#.*$/gm,
doubleQuotedString: /"([^\\"\n]|\\.)*"/g,
singleQuotedString: /'([^\\'\n]|\\.)*'/g,
multiLineDoubleQuotedString: new XRegExp('"([^\\\\"]|\\\\.)*"', "gs"),
multiLineSingleQuotedString: new XRegExp("'([^\\\\']|\\\\.)*'", "gs"),
xmlComments: /(&lt;|<)!--[\s\S]*?--(&gt;|>)/gm,
url: /\w+:\/\/[\w-.\/?%&=:@;]*/g,
phpScriptTags: {
left: /(&lt;|<)\?=?/g,
right: /\?(&gt;|>)/g
},
aspScriptTags: {
left: /(&lt;|<)%=?/g,
right: /%(&gt;|>)/g
},
scriptScriptTags: {
left: /(&lt;|<)\s*script.*?(&gt;|>)/gi,
right: /(&lt;|<)\/\s*script\s*(&gt;|>)/gi
}
}
};
return q.Match = function(a, b, c) {
this.value = a, this.index = b, this.length = a.length, this.css = c, this.brushName = null;
}, q.Match.prototype.toString = function() {
return this.value;
}, q.Highlighter = function() {}, q.Highlighter.prototype = {
getParam: function(a, b) {
var c = this.params[a];
return d(c == null ? b : c);
},
create: function(a) {
return document.createElement(a);
},
findMatches: function(a, b) {
var c = [];
if (a != null) for (var d = 0; d < a.length; d++) typeof a[d] == "object" && (c = c.concat(o(b, a[d])));
return this.removeNestedMatches(c.sort(n));
},
removeNestedMatches: function(a) {
for (var b = 0; b < a.length; b++) {
if (a[b] === null) continue;
var c = a[b], d = c.index + c.length;
for (var e = b + 1; e < a.length && a[b] !== null; e++) {
var f = a[e];
if (f === null) continue;
if (f.index > d) break;
f.index == c.index && f.length > c.length ? a[b] = null : f.index >= c.index && f.index < d && (a[e] = null);
}
}
return a;
},
figureOutLineNumbers: function(a) {
var b = [], c = parseInt(this.getParam("first-line"));
return e(a, function(a, d) {
b.push(d + c);
}), b;
},
isLineHighlighted: function(a) {
var c = this.getParam("highlight", []);
return typeof c != "object" && c.push == null && (c = [ c ]), b(c, a.toString()) != -1;
},
getLineHtml: function(a, b, c) {
var d = [ "line", "number" + b, "index" + a, "alt" + (b % 2 == 0 ? 1 : 2).toString() ];
return this.isLineHighlighted(b) && d.push("highlighted"), b == 0 && d.push("break"), '<div class="' + d.join(" ") + '">' + c + "</div>";
},
getLineNumbersHtml: function(b, c) {
var d = "", e = a(b).length, f = parseInt(this.getParam("first-line")), g = this.getParam("pad-line-numbers");
g == 1 ? g = (f + e - 1).toString().length : isNaN(g) == 1 && (g = 0);
for (var i = 0; i < e; i++) {
var j = c ? c[i] : f + i, b = j == 0 ? q.config.space : h(j, g);
d += this.getLineHtml(i, j, b);
}
return d;
},
getCodeLinesHtml: function(b, c) {
b = l(b);
var d = a(b), e = this.getParam("pad-line-numbers"), f = parseInt(this.getParam("first-line")), b = "", g = this.getParam("brush");
for (var h = 0; h < d.length; h++) {
var i = d[h], j = /^(&nbsp;|\s)+/.exec(i), k = null, m = c ? c[h] : f + h;
j != null && (k = j[0].toString(), i = i.substr(k.length), k = k.replace(" ", q.config.space)), i = l(i), i.length == 0 && (i = q.config.space), b += this.getLineHtml(h, m, (k != null ? '<code class="' + g + ' spaces">' + k + "</code>" : "") + i);
}
return b;
},
getMatchesHtml: function(a, b) {
function c(a) {
var b = a ? a.brushName || f : f;
return b ? b + " " : "";
}
var d = 0, e = "", f = this.getParam("brush", "");
for (var h = 0; h < b.length; h++) {
var i = b[h], j;
if (i === null || i.length === 0) continue;
j = c(i), e += g(a.substr(d, i.index - d), j + "plain") + g(i.value, j + i.css), d = i.index + i.length + (i.offset || 0);
}
return e += g(a.substr(d), c() + "plain"), e;
},
getHtml: function(a) {
var b = "", c = [ "syntaxhighlighter" ], d, e, g;
return className = "syntaxhighlighter", (gutter = this.getParam("gutter")) == 0 && c.push("nogutter"), c.push(this.getParam("class-name")), c.push(this.getParam("brush")), a = f(a).replace(/\r/g, " "), d = this.getParam("tab-size"), a = this.getParam("smart-tabs") == 1 ? j(a, d) : i(a, d), a = m(a), gutter && (g = this.figureOutLineNumbers(a)), e = this.findMatches(this.regexList, a), b = this.getMatchesHtml(a, e), b = this.getCodeLinesHtml(b, g), this.getParam("auto-links") && (b = p(b)), typeof navigator != "undefined" && navigator.userAgent && navigator.userAgent.match(/MSIE/) && c.push("ie"), b = '<div class="' + c.join(" ") + '">' + '<table border="0" cellpadding="0" cellspacing="0">' + "<tbody>" + "<tr>" + (gutter ? '<td class="gutter">' + this.getLineNumbersHtml(a) + "</td>" : "") + '<td class="code">' + '<div class="container">' + b + "</div>" + "</td>" + "</tr>" + "</tbody>" + "</table>" + "</div>", b;
},
init: function(a) {
this.params = c(q.defaults, a || {});
},
getKeywords: function(a) {
return a = a.replace(/^\s+|\s+$/g, "").replace(/\s+/g, "|"), "\\b(?:" + a + ")\\b";
}
}, q;
}();

(function() {
function a() {
var a = "break case catch continue default delete do else false  for function if in instanceof new null return super switch this throw true try typeof var while with", b = SyntaxHighlighter.regexLib;
this.regexList = [ {
regex: b.multiLineDoubleQuotedString,
css: "string"
}, {
regex: b.multiLineSingleQuotedString,
css: "string"
}, {
regex: b.singleLineCComments,
css: "comments"
}, {
regex: b.multiLineCComments,
css: "comments"
}, {
regex: /\s*#.*/gm,
css: "preprocessor"
}, {
regex: new RegExp(this.getKeywords(a), "gm"),
css: "keyword"
} ];
}
a.prototype = new SyntaxHighlighter.Highlighter, a.aliases = [ "js", "jscript", "javascript" ], SyntaxHighlighter.brushes.JScript = a;
})(), function() {
var a = new SyntaxHighlighter.brushes.JScript;
a.init({}), syntaxHighlight = function(b) {
return a.getHtml(b);
};
}();

// lexer.js

enyo.kind({
name: "enyo.lexer.Base",
kind: null,
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
kind: null,
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
kind: null,
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
return f.length && (d.comment = this.joinComment(f), f = []), d;
},
joinComment: function(a) {
if (!a || !a.length) return "";
var b = a.join(" "), c = 0, d = b.split(/\r?\n/);
for (var e = 0, f; (f = d[e]) != null; e++) if (f.length > 0) {
c = f.search(/\S/), c < 0 && (c = f.length);
break;
}
if (c) for (var e = 0, f; (f = d[e]) != null; e++) d[e] = f.slice(c);
return d.join("\n");
},
makeFunction: function(a, b, c, d) {
return {
type: "function",
comment: this.joinComment(c),
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
return e.type = a, e.comment = this.joinComment(c), e.group = d, e;
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
comment: this.joinComment(g),
group: f
}, h++; else {
var n = {
name: l,
comment: this.joinComment(g),
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
a ? this.loadModule(a) : this.modulesFinished();
},
loadModule: function(a) {
enyo.xhr.request({
url: a.path,
callback: enyo.bind(this, "moduleLoaded", a)
});
},
moduleLoaded: function(a, b) {
this.addModule(a, b), this.nextModule();
},
addModule: function(a, b) {
if (b && b.length) {
var c = (new enyo.Documentor(b)).results;
this.modules[a.path] = c, enyo.mixin(c, a);
}
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
onProgress: "",
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
this.doProgress({
action: a,
name: b
});
},
walkFinish: function() {
return this.analyzeModules(), !0;
},
analyzeModules: function() {
this.$.reader.loadModules(this.loader);
},
readerFinish: function() {
this.modules = this.$.reader.modules;
}
});

// InfoDb.js

enyo.kind({
name: "InfoDb",
kind: "Component",
dbify: function(a) {
this.objects = [], this.modules = this.buildModuleList(a), this.packages = this.buildPackageList(this.modules), this.indexModuleObjects(), this.cookObjects(), this.indexInheritance(), this.indexAllProperties(), this.objects.sort(this.nameCompare);
},
listByType: function(a) {
var b = [];
for (var c = 0, d; d = this.objects[c]; c++) d.type == a && b.push(d);
return b;
},
filter: function(a) {
return enyo.forEach(this.objects, a);
},
findByProperty: function(a, b, c) {
for (var d = 0, e; e = a[d]; d++) if (e[b] == c) return e;
},
findByName: function(a) {
return this.findByProperty(this.objects, "name", a);
},
findByTopic: function(a) {
return this.findByProperty(this.objects, "topic", a);
},
unmap: function(a, b) {
var c = [];
for (var d in a) {
var e = a[d];
e.key = d, b && (e[b] = !0), c.push(e);
}
return c;
},
buildModuleList: function(a) {
return this.unmap(a);
},
buildPackageList: function(a) {
var b = {};
for (var c = 0, d, e, f, g; d = a[c]; c++) e = d.packageName || "unknown", f = e.toLowerCase(), b[f] || (b[f] = {
packageName: e,
modules: []
}), g = b[f], g.modules.push(d);
return this.unmap(b);
},
indexModuleObjects: function() {
this.raw = [];
for (var a = 0, b; b = this.modules[a]; a++) this.indexModule(b);
},
indexModule: function(a) {
a.type = "module", this.raw.push(a);
for (var b = 0, c = a.objects, d; d = c[b]; b++) d.name && d.type && (d.module = a, this.raw.push(d));
a.objects = [];
},
cookObjects: function() {
for (var a = 0, b, c; b = this.raw[a]; a++) c = this.cookObject(b), b.group && (c[b.group] = !0), c.module = b.module, c.topic || (c.topic = c.name), this.objects[a] = c, c.module && c.module.objects.push(c);
},
cookObject: function(a) {
var b = "cook_" + a.type;
return this[b] ? this[b](a) : a;
},
cook_kind: function(a) {
return this.processKind(a);
},
cook_object: function(a) {
return this.processObject(a);
},
cook_function: function(a) {
return this.processFunction(a);
},
cook_module: function(a) {
return this.processModule(a);
},
processModule: function(a) {
return a.topic = a.rawPath, a.name = a.rawPath, a;
},
processFunction: function(a) {
return a;
},
processObject: function(a) {
var b = {
name: a.name,
comment: a.comment,
type: a.type,
object: !0
};
return b.properties = this.listKindProperties(a, b), b;
},
processKind: function(a) {
var b = "enyo.Control", c = {
name: a.name.value,
comment: a.comment,
type: a.type,
kind: !0,
superKind: a.kind ? a.kind.value != "null" && a.kind.value : b
};
return c.properties = this.listKindProperties(a, c), c;
},
listSuperkinds: function(a) {
var b = [], c = a;
while (c && c.superKind) b.push(c.superKind), c = this.findByName(c.superKind);
return b;
},
listKindProperties: function(a, b) {
var c = this.unmap(a.methods.map, "method");
c = c.concat(this.unmap(a.properties.map, "property")), a.published && a.published.value.properties && (c = c.concat(this.unmap(a.published.value.properties.map, "published")));
for (var d = 0, e; e = c[d]; d++) e[e.group] = !0, e.kind = b, e.topic = e.kind.name + "::" + e.name, e.type = e.method ? "method" : "property";
return c.sort(this.nameCompare), c;
},
nameCompare: function(a, b) {
return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
},
indexInheritance: function() {
for (var a = 0, b; b = this.objects[a]; a++) b.type == "kind" && (b.superkinds = this.listSuperkinds(b), b.allProperties = this.listInheritedProperties(b));
},
listInheritedProperties: function(a) {
var b = [], c = {};
mergeProperties = function(a) {
for (var d = 0, e; e = a[d]; d++) {
var f = c.hasOwnProperty(e.name) && c[e.name];
f ? (e.overrides = f, b[enyo.indexOf(f, b)] = e) : b.push(e), c[e.name] = e;
}
};
for (var d = a.superkinds.length - 1, e; e = a.superkinds[d]; d--) {
var f = this.findByName(e);
f && mergeProperties(f.properties);
}
return mergeProperties(a.properties), b.sort(this.nameCompare), b;
},
indexAllProperties: function() {
for (var a = 0, b; b = this.objects[a]; a++) b.properties && enyo.forEach(b.properties, function(a) {
this.objects.push(a);
}, this);
}
});

// PackageDb.js

enyo.kind({
name: "PackageDb",
kind: "InfoDb",
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
walk: function(a) {
this.$.walker.walk(enyo.path.rewrite(a));
},
walkerReport: function(a, b, c) {
this.doReport(b, c);
},
walkerFinish: function() {
this.dbify(this.$.walker.modules);
}
});

// PackageDb.js

enyo.kind({
name: "PackageDb",
kind: "InfoDb",
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
walk: function(a) {
this.$.walker.walk(a);
},
walkerReport: function(a, b, c) {
this.doReport(b, c);
},
walkerFinish: function() {
this.dbify(this.$.walker.modules);
}
});

// CustomFormatter.js

enyo.kind({
name: "CustomFormatter",
kind: enyo.Component,
statics: {
showdown: new Showdown.converter
},
formatLink: function(a, b) {
return '<a href="#' + a + '">' + (b || a) + "</a>";
},
filterProperties: function(a, b) {
var c = [];
for (var d = 0, e; e = a[d]; d++) {
for (var f = 0, g; g = b[f]; f++) if (!e[g]) break;
g || c.push(e);
}
return c;
},
formatKindProperties: function(a, b) {},
markupToHtml: function(a) {
var b = CustomFormatter.showdown.makeHtml(a || "");
return b = b.replace(/<code>([\s\S]*?)<\/code>/gm, function(a, b) {
return syntaxHighlight(b);
}), b;
}
});

// Formatter.js

enyo.kind({
name: "Formatter",
kind: CustomFormatter,
collate: function(a) {
var b = {};
for (var c = 0, d; d = a[c]; c++) {
var e = d.name.toLowerCase(), f = e.split(".");
e = f[0] == "enyo" ? f[1] || f[0] : e;
for (var g = 0, h; (h = e[g]) && (h < "a" || h > "z"); g++) ;
b[h] || (b[h] = []), b[h].push(d);
}
return b;
},
formatSmallTypeIcon: function(a) {
return '<span class="small-type small-' + a.type + '-type" title="' + a.type + '"></span>';
},
formatTypeIcon: function(a) {
return '<span class="type ' + a.type + '-type" title="' + a.type + '"></span>';
},
formatObjectIndex: function(a) {
var b = this.collate(a), c = "";
for (var d = 0; d < 26; d++) {
var e = d >= 0 ? String.fromCharCode(97 + d) : null, f = b[e];
if (f) {
c += '<div class="index-divider">' + e.toUpperCase() + "</div>";
for (var g = 0, h; h = f[g]; g++) c += this.formatIndexItem(h);
}
}
return c;
},
formatIndexItem: function(a, b) {
var c = a.name;
b || (c = c.replace(/enyo[.]/g, ""));
var d = a.kind && a.kind.name;
return c = (d ? d + "::" : "") + "<b>" + c + "</b>", '<div class="index-item">' + this.formatSmallTypeIcon(a) + '<span><a href="#' + a.topic + '">' + c + "</a></span>" + (a.protected ? '<span class="protected" title="protected"></span>' : "") + "</div>";
},
formatPackages: function(a) {
var b = "";
for (var c = 0, d; d = a.packages[c]; c++) {
b += '<div class="index-divider">' + this.formatSmallTypeIcon(d) + d.packageName + "</div>";
for (var e = 0, f; f = d.modules[e]; e++) b += this.formatIndexItem(f);
}
return b;
},
format: function(a, b, c, d) {
switch (a && a.type) {
case "kind":
return this.formatKind(a, b, c, d);
case "object":
return this.formatObject(a, b, d);
case "module":
return this.formatModule(a, d);
case "method":
return this.formatMethod(a);
case "function":
return this.formatFunction(a);
case "property":
return this.formatProperty(a);
}
return "Unknown Object";
},
formatTitle: function(a, b) {
return "" + this.formatTypeIcon(a) + '<span class="name">' + a.name + "</span>";
},
formatKind: function(a, b, c, d) {
var e = this.formatKindTree(a), f = d ? [] : [ "public" ], g = c ? a.allProperties : a.properties;
return "" + this.formatTitle(a) + '<div class="path">' + this.formatLink(a.module.rawPath) + "</div>" + (e == "" ? "" : "<h2>Extends</h2>" + e) + "<h2>Published</h2>" + this.formatKindProperties(a, this.filterProperties(g, [ "published" ].concat(f))) + "<h2>Properties</h2>" + this.formatKindProperties(a, this.filterProperties(g, [ "property" ].concat(f))) + "<h2>Methods</h2>" + this.formatKindProperties(a, this.filterProperties(g, [ "method" ].concat(f))) + (a.comment ? "<h2>Summary</h2><p>" + this.markupToHtml(a.comment) + "</p>" : "");
},
formatKindTree: function(a) {
var b = "", c = "";
for (var d = 0, e; e = a.superkinds[d]; d++) c += "<ul><li>" + this.formatLink(e) + "</li>", b += "</ul>";
return c + b;
},
formatKindProperties: function(a, b) {
var c = "";
for (var d = 0, e; e = b[d]; d++) c += this[e.method ? "formatKindMethod" : "formatKindProperty"](a, e);
return c || "(none)";
},
formatKindMethod: function(a, b) {
return "<div>" + this.formatSmallTypeIcon(b) + '<a href="#' + b.topic + '">' + b.name + enyo.macroize(': <em style="color: black;">function</em>(<code>{$args}</code>)', b) + "</a>" + (b.protected ? '<span class="protected" title="protected"></span>' : "") + (b.kind && b.kind !== a ? '<span style="color:#6070FF; font-size: 80%; padding-left: 4px;">' + this.formatLink(b.kind.name) + "</span>" : "") + (b.kind == a && b.overrides ? '<span style="color:#FF7060; font-size: 80%;"> ' + this.formatLink(b.overrides.kind.name) + " override</span>" : "") + "</div>";
},
formatKindProperty: function(a, b) {
return "<div>" + this.formatSmallTypeIcon(b) + '<a href="#' + b.topic + '">' + b.name + (!b.property && !b.published ? "" : ': <span style="color: black;">' + b.value + "</span>") + "</a>" + (!b.kind || b.kind == a ? "" : '<span style="color:#6070FF; font-size: 80%; padding-left: 8px;">' + this.formatLink(b.kind.name) + "</span >") + (b.protected ? '<span class="protected" title="protected"></span>' : "") + "</div>";
},
formatObject: function(a, b, c) {
var d = c ? [] : [ "public" ], e = a.properties;
return "" + this.formatTitle(a) + '<div class="path">' + this.formatLink(a.module.rawPath) + "</div>" + "<p>" + this.markupToHtml(a.comment || "") + "</p>" + "<h2>Properties</h2>" + this.formatKindProperties(a, this.filterProperties(e, [ "property" ].concat(d))) + "<h2>Methods</h2>" + this.formatKindProperties(a, this.filterProperties(e, [ "method" ].concat(d)));
},
formatFunction: function(a) {
return "" + this.formatTitle(a) + '<div class="path">' + this.formatLink(a.module.rawPath) + "</div>" + "<br/>" + this.formatKindMethod(null, a) + (a.comment ? '<div style="padding-left: 16px">' + this.markupToHtml(a.comment) + "</div>" : "");
},
formatMethod: function(a) {
return '<span class="type ' + a.type + '-type">' + a.type + "</span>" + '<span class="name">' + this.formatLink(a.kind.name) + "::" + a.name + "</span>" + "<br/><br/>" + "<b>" + a.name + "</b>" + enyo.macroize(": <Xem>function</Xem>(<code><literal>{$args}</literal></code>)", a) + (a.protected ? '<span class="protected" title="protected"></span>' : "") + (a.overrides ? '<div style="color:#FF7060;">overrides ' + this.formatLink(a.overrides.kind.name + "::" + a.name) + "</div>" : "") + (a.comment ? '<div style="padding-left: 16px">' + this.markupToHtml(a.comment) + "</div>" : "");
},
formatProperty: function(a) {
return '<span class="type kind-property">property</span><span class="name">' + this.formatLink(a.kind.name) + "::" + a.name + "</span>" + "<br/><br/>" + "<b>" + a.name + "</b>" + ": " + a.value + (a.protected ? '<span class="protected" title="protected"></span>' : "") + (a.comment ? '<div style="padding-left: 16px">' + this.markupToHtml(a.comment) + "</div>" : "");
},
formatModule: function(a, b) {
var c = "" + this.formatTitle(a) + "<br/><br/>", d = b ? a.objects : this.filterProperties(a.objects, [ "public" ]);
for (var e = 0, f; f = d[e]; e++) c += this.formatIndexItem(f, !0);
return c;
}
});

// IndexTabs.js

enyo.kind({
name: "IndexTabs",
kind: "Control",
classes: "enyo-fit tabbar",
published: {
index: 0
},
events: {
onSelect: ""
},
components: [ {
classes: "active tab",
ontap: "indexSelectorTap",
components: [ {
classes: "tab-icon api-tab-icon"
}, {
style: "display:inline-block;",
content: "Api"
} ]
}, {
classes: "tab",
ontap: "indexSelectorTap",
components: [ {
classes: "tab-icon modules-tab-icon"
}, {
style: "display:inline-block;",
content: "Modules"
} ]
}, {
classes: "tab",
ontap: "indexSelectorTap",
components: [ {
classes: "tab-icon index-tab-icon"
}, {
style: "display:inline-block;",
content: "Index"
} ]
} ],
indexSelectorTap: function(a) {
enyo.forEach(this.controls, function(b) {
b.addRemoveClass("active", b == a);
}), this.setIndex(a.indexInContainer());
},
indexChanged: function() {
this.doSelect({
index: this.index
});
}
});

// SearchBar.js

enyo.kind({
name: "SearchBar",
kind: "Control",
events: {
onSearch: ""
},
handlers: {
onkeyup: "search",
onchange: "search"
},
components: [ {
name: "search",
classes: "enyo-fit",
style: "height: 36px; top: 4px;",
components: [ {
classes: "enyo-fit",
style: "display: inline-block; width: 36px; background: url(images/search-24.png) center no-repeat;"
}, {
name: "input",
tag: "input",
classes: "enyo-fit",
style: "outline: none; border: none; left: 36px; right: 4px; background-color: inherit;"
} ]
} ],
getValue: function() {
if (this.$.input.hasNode()) return this.$.input.node.value;
},
search: function() {
this.doSearch({
searchString: this.getValue()
});
}
});

// DocPanel.js

enyo.kind({
name: "DocPanel",
kind: "Control",
events: {
onSelect: "",
onFilterChange: ""
},
components: [ {
kind: "Formatter"
}, {
classes: "enyo-fit",
style: "height: 92px; border-bottom: 1px dotted silver; box-sizing: border-box;",
components: [ {
name: "tabs",
kind: "Scroller",
classes: "tabbar",
vertical: !1,
strategyKind: "TouchScrollStrategy"
}, {
style: "padding: 4px",
onchange: "filterChange",
components: [ {
tag: "label",
style: "margin-right: 16px;",
components: [ {
tag: "span",
content: "inherited"
}, {
name: "inheritedOption",
tag: "input",
attributes: {
type: "checkbox"
}
} ]
}, {
tag: "label",
components: [ {
tag: "span",
content: "protected"
}, {
name: "protectedOption",
tag: "input",
attributes: {
type: "checkbox"
}
} ]
} ]
} ]
}, {
name: "main",
kind: "Scroller",
classes: "enyo-fit enyo-selectable",
style: "top: 92px;",
components: [ {
name: "body",
onclick: "docClick",
allowHtml: !0
} ]
} ],
filterChange: function() {
this.doFilterChange({
showInherited: this.$.inheritedOption.hasNode().checked,
showProtected: this.$.protectedOption.hasNode().checked
});
},
setTopic: function(a) {
if (!a) return;
var b = null;
enyo.forEach(this.$.tabs.getControls(), function(c) {
c.topic == a && (b = c), c.addRemoveClass("active", c.topic == a);
}), b || (b = this.createComponent({
kind: "TopicTab",
classes: "active",
topic: a,
ontap: "topicSelect",
onClose: "tabClose",
container: this.$.tabs
}).render()), b.hasNode().scrollIntoView();
},
tabClose: function(a) {
var b = a.clientIndexInContainer();
a.destroy();
var c = this.$.tabs.getClientControls();
c[b] || b--, this.topicSelect(c[b] || 0);
},
topicSelect: function(a) {
this.doSelect(a.topic);
}
}), enyo.kind({
name: "TopicTab",
kind: "Control",
events: {
onClose: ""
},
components: [ {
tag: "span",
name: "caption"
}, {
tag: "img",
classes: "close-tab-img",
src: "images/close.png",
ondown: "closeDown",
onclick: "doClose"
} ],
create: function() {
this.inherited(arguments), this.addClass("tab"), this.$.caption.setContent(this.topic);
},
closeDown: function(a, b) {
return !0;
}
});

// App.js

enyo.kind({
name: "App",
kind: "Control",
target: "$enyo/source",
topic: "enyo.Component",
classes: "enyo-unselectable",
components: [ {
name: "db",
kind: "PackageDb",
onFinish: "dbReady",
onProgress: "dbProgress"
}, {
kind: "Formatter"
}, {
name: "header"
}, {
name: "body",
classes: "enyo-fit",
components: [ {
name: "leftPanel",
classes: "enyo-fit",
components: [ {
kind: "IndexTabs",
classes: "enyo-fit",
onSelect: "indexTabsSelect"
}, {
name: "indexTabPanels",
classes: "enyo-fit",
components: [ {
name: "indexPanel",
kind: "Scroller",
classes: "enyo-fit",
components: [ {
name: "indexBody",
allowHtml: !0
} ]
}, {
name: "searchPanel",
showing: !1,
components: [ {
kind: "SearchBar",
classes: "enyo-fit",
onSearch: "search"
}, {
name: "searchScroller",
kind: "Scroller",
classes: "enyo-fit",
components: [ {
name: "searchBody",
allowHtml: !0
} ]
} ]
} ]
} ]
}, {
kind: "DocPanel",
classes: "enyo-fit",
onSelect: "docPanelSelect",
onFilterChange: "filterChange"
} ]
} ],
create: function() {
this.inherited(arguments), this.topic = this.getHashTopic() || this.topic, window.onhashchange = enyo.bind(this, "hashChange"), this.$.db.walk(enyo.path.rewrite(this.target));
},
dbReady: function() {
this.refresh();
},
refresh: function() {
this.selectIndex(this.$.indexTabs.index), this.selectTopic(this.topic), this.selectSearchString(this.searchString);
},
filterChange: function(a, b) {
this.showInherited = b.showInherited, this.showProtected = b.showProtected, this.refresh();
},
indexTabsSelect: function(a, b) {
this.selectIndex(b.index);
},
selectIndex: function(a) {
var b = this.showProtected, c = this.$.db.objects;
this.showProtected || (c = this.$.formatter.filterProperties(c, [ "public" ]));
switch (a) {
case 0:
var d = {
kind: 1,
object: 1,
"function": 1
}, b = this.showProtected, c = this.$.db.filter(function(a) {
return d[a.type] && (b || a.public) ? a : undefined;
});
index = this.$.formatter.formatObjectIndex(c);
break;
case 1:
index = this.$.formatter.formatPackages(this.$.db);
break;
case 2:
}
this.$.indexBody.setContent(index), this.$.indexPanel.setShowing(a != 2), this.$.searchPanel.setShowing(a == 2);
},
search: function(a, b) {
this.selectSearchString(b.searchString.toLowerCase());
},
selectSearchString: function(a) {
this.searchString = a;
var b = this.$.db.objects;
this.showProtected || (b = this.$.formatter.filterProperties(b, [ "public" ]));
if (!a) var c = b; else {
c = [];
for (var d = 0, e; e = b[d]; d++) e.name.toLowerCase().indexOf(a) >= 0 && c.push(e);
}
this.$.searchBody.setContent(c.length ? this.$.formatter.formatObjectIndex(c) : "no results");
},
getHashTopic: function() {
return window.location.hash.slice(1);
},
hashChange: function() {
this.selectTopic(this.getHashTopic());
},
docPanelSelect: function(a, b) {
this.selectTopic(b);
},
selectTopic: function(a) {
this.topic = a, this.$.docPanel.setTopic(a);
var b = this.$.db.findByTopic(this.topic);
if (b) var c = this.$.formatter.format(b, this.$.db, this.showInherited, this.showProtected); else c = "no topic";
this.$.docPanel.$.body.setContent(c);
}
});
