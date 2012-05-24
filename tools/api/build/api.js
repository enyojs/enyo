
// minifier: path aliases

enyo.path.addPaths({layout: "E://www/enyojs/enyo/tools/../../lib/layout/"});

// FittableLayout.js

enyo.kind({
name: "enyo.FittableLayout",
kind: "Layout",
calcFitIndex: function() {
for (var a = 0, b = this.container.children, c; c = b[a]; a++) if (c.fit && c.showing) return a;
},
getFitControl: function() {
var a = this.container.children, b = a[this.fitIndex];
return b && b.fit && b.showing || (this.fitIndex = this.calcFitIndex(), b = a[this.fitIndex]), b;
},
getLastControl: function() {
var a = this.container.children, b = a.length - 1, c = a[b];
while ((c = a[b]) && !c.showing) b--;
return c;
},
_reflow: function(a, b, c, d) {
this.container.addRemoveClass("enyo-stretch", !this.container.noStretch);
var e = this.getFitControl();
if (!e) return;
var f = 0, g = 0, h = 0, i, j = this.container.hasNode();
j && (i = enyo.FittableLayout.calcPaddingExtents(j), f = j[b] - (i[c] + i[d]));
var k = e.getBounds();
g = k[c] - (i && i[c] || 0);
var l = this.getLastControl();
if (l) {
var m = enyo.FittableLayout.getComputedStyleValue(l.hasNode(), "margin-" + d) || 0;
if (l != e) {
var n = l.getBounds(), o = k[c] + k[a], p = n[c] + n[a] + m;
h = p - o;
} else h = m;
}
var q = f - (g + h);
e.applyStyle(a, q + "px");
},
reflow: function() {
this.orient == "h" ? this._reflow("width", "clientWidth", "left", "right") : this._reflow("height", "clientHeight", "top", "bottom");
},
statics: {
_ieCssToPixelValue: function(a, b) {
var c = b, d = a.style, e = d.left, f = a.runtimeStyle && a.runtimeStyle.left;
return f && (a.runtimeStyle.left = a.currentStyle.left), d.left = c, c = d.pixelLeft, d.left = e, f && (d.runtimeStyle.left = f), c;
},
_pxMatch: /px/i,
getComputedStyleValue: function(a, b, c) {
var d = c || enyo.dom.getComputedStyle(a);
if (d) return parseInt(d.getPropertyValue(b));
if (a && a.currentStyle) {
var e = a.currentStyle[b];
return e.match(this._pxMatch) || (e = this._ieCssToPixelValue(a, e)), parseInt(e);
}
return 0;
},
calcBoxExtents: function(a, b) {
var c = enyo.dom.getComputedStyle(a);
return {
top: this.getComputedStyleValue(a, b + "-top", c),
right: this.getComputedStyleValue(a, b + "-right", c),
bottom: this.getComputedStyleValue(a, b + "-bottom", c),
left: this.getComputedStyleValue(a, b + "-left", c)
};
},
calcPaddingExtents: function(a) {
return this.calcBoxExtents(a, "padding");
},
calcMarginExtents: function(a) {
return this.calcBoxExtents(a, "margin");
}
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
highlander: function(a) {
this.multi || this.deselect(this.lastSelected);
},
clear: function() {
this.selected = [];
},
isSelected: function(a) {
return this.selected[a];
},
setByKey: function(a, b, c) {
if (b) this.selected[a] = c || !0, this.lastSelected = a, this.doSelect({
key: a,
data: this.selected[a]
}); else {
var d = this.isSelected(a);
delete this.selected[a], this.doDeselect({
key: a,
data: d
});
}
this.doChange();
},
deselect: function(a) {
this.isSelected(a) && this.setByKey(a, !1);
},
select: function(a, b) {
this.multi ? this.setByKey(a, !this.isSelected(a), b) : this.isSelected(a) || (this.highlander(), this.setByKey(a, !0, b));
},
toggle: function(a, b) {
!this.multi && this.lastSelected != a && this.deselect(this.lastSelected), this.setByKey(a, !this.isSelected(a), b);
},
getSelected: function() {
return this.selected;
}
});

// FlyweightRepeater.js

enyo.kind({
name: "enyo.FlyweightRepeater",
published: {
count: 0,
multiSelect: !1,
toggleSelected: !1
},
events: {
onSetupItem: ""
},
components: [ {
kind: "Selection",
onSelect: "selectDeselect",
onDeselect: "selectDeselect"
}, {
name: "client"
} ],
rowOffset: 0,
bottomUp: !1,
create: function() {
this.inherited(arguments), this.multiSelectChanged();
},
multiSelectChanged: function() {
this.$.selection.setMulti(this.multiSelect);
},
setupItem: function(a) {
this.doSetupItem({
index: a,
selected: this.isSelected(a)
});
},
generateChildHtml: function() {
var a = "";
this.index = null;
for (var b = 0, c = 0; b < this.count; b++) c = this.rowOffset + (this.bottomUp ? this.count - b - 1 : b), this.setupItem(c), this.$.client.setAttribute("index", c), a += this.inherited(arguments), this.$.client.teardownRender();
return a;
},
previewDomEvent: function(a) {
var b = this.index = this.rowForEvent(a);
a.rowIndex = a.index = b, a.flyweight = this;
},
decorateEvent: function(a, b, c) {
var d = b && b.index != null ? b.index : this.index;
b && d != null && (b.index = d, b.flyweight = this), this.inherited(arguments);
},
tap: function(a, b) {
this.toggleSelected ? this.$.selection.toggle(b.index) : this.$.selection.select(b.index);
},
selectDeselect: function(a, b) {
this.renderRow(b.key);
},
getSelection: function() {
return this.$.selection;
},
isSelected: function(a) {
return this.getSelection().isSelected(a);
},
renderRow: function(a) {
var b = this.fetchRowNode(a);
b && (this.setupItem(a), b.innerHTML = this.$.client.generateChildHtml(), this.$.client.teardownChildren());
},
fetchRowNode: function(a) {
if (this.hasNode()) {
var b = this.node.querySelectorAll('[index="' + a + '"]');
return b && b[0];
}
},
rowForEvent: function(a) {
var b = a.target, c = this.hasNode().id;
while (b && b.parentNode && b.id != c) {
var d = b.getAttribute && b.getAttribute("index");
if (d !== null) return Number(d);
b = b.parentNode;
}
return -1;
},
prepareRow: function(a) {
var b = this.fetchRowNode(a);
enyo.FlyweightRepeater.claimNode(this.$.client, b);
},
lockRow: function() {
this.$.client.teardownChildren();
},
performOnRow: function(a, b, c) {
b && (this.prepareRow(a), enyo.call(c || null, b), this.lockRow());
},
statics: {
claimNode: function(a, b) {
var c = b && b.querySelectorAll("#" + a.id);
c = c && c[0], a.generated = Boolean(c || !a.tag), a.node = c, a.node && a.rendered();
for (var d = 0, e = a.children, f; f = e[d]; d++) this.claimNode(f, b);
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
multiSelect: !1,
toggleSelected: !1,
fixedHeight: !1
},
events: {
onSetupItem: ""
},
handlers: {
onAnimateFinish: "animateFinish"
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
name: "page0",
allowHtml: !0,
classes: "enyo-list-page"
}, {
name: "page1",
allowHtml: !0,
classes: "enyo-list-page"
} ]
} ],
create: function() {
this.pageHeights = [], this.inherited(arguments), this.getStrategy().translateOptimized = !0, this.bottomUpChanged(), this.multiSelectChanged(), this.toggleSelectedChanged();
},
createStrategy: function() {
this.controlParentName = "strategy", this.inherited(arguments), this.createChrome(this.listTools), this.controlParentName = "client", this.discoverControlParent();
},
rendered: function() {
this.inherited(arguments), this.$.generator.node = this.$.port.hasNode(), this.$.generator.generated = !0, this.reset();
},
resizeHandler: function() {
this.inherited(arguments), this.adjustPortSize();
},
bottomUpChanged: function() {
this.$.generator.bottomUp = this.bottomUp, this.$.page0.applyStyle(this.pageBound, null), this.$.page1.applyStyle(this.pageBound, null), this.pageBound = this.bottomUp ? "bottom" : "top", this.hasNode() && this.reset();
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
updateMetrics: function() {
this.defaultPageHeight = this.rowsPerPage * (this.rowHeight || 100), this.pageCount = Math.ceil(this.count / this.rowsPerPage), this.portSize = 0;
for (var a = 0; a < this.pageCount; a++) this.portSize += this.getPageHeight(a);
this.adjustPortSize();
},
generatePage: function(a, b) {
this.page = a;
var c = this.$.generator.rowOffset = this.rowsPerPage * this.page, d = this.$.generator.count = Math.min(this.count - c, this.rowsPerPage), e = this.$.generator.generateChildHtml();
b.setContent(e), this.rowHeight || (this.rowHeight = Math.floor(b.getBounds().height / d), this.updateMetrics());
if (!this.fixedHeight) {
var f = this.getPageHeight(a), g = this.pageHeights[a] = b.getBounds().height;
f != g && (this.portSize += g - f);
}
},
update: function(a) {
var b = !1, c = this.positionToPageInfo(a), d = c.pos + this.scrollerHeight / 2, e = Math.floor(d / Math.max(c.height, this.scrollerHeight) + .5) + c.no, f = e % 2 == 0 ? e : e - 1;
this.p0 != f && this.isPageInRange(f) && (this.generatePage(f, this.$.page0), this.positionPage(f, this.$.page0), this.p0 = f, b = !0), f = e % 2 == 0 ? Math.max(1, e - 1) : e, this.p1 != f && this.isPageInRange(f) && (this.generatePage(f, this.$.page1), this.positionPage(f, this.$.page1), this.p1 = f, b = !0), b && !this.fixedHeight && (this.adjustBottomPage(), this.adjustPortSize());
},
updateForPosition: function(a) {
this.update(this.calcPos(a));
},
calcPos: function(a) {
return this.bottomUp ? this.portSize - this.scrollerHeight - a : a;
},
adjustBottomPage: function() {
var a = this.p0 >= this.p1 ? this.$.page0 : this.$.page1;
this.positionPage(a.pageNo, a);
},
adjustPortSize: function() {
this.scrollerHeight = this.getBounds().height;
var a = Math.max(this.scrollerHeight, this.portSize);
this.$.port.applyStyle("height", a + "px");
},
positionPage: function(a, b) {
b.pageNo = a;
var c = this.pageToPosition(a);
b.applyStyle(this.pageBound, c + "px");
},
pageToPosition: function(a) {
var b = 0, c = a;
while (c > 0) c--, b += this.getPageHeight(c);
return b;
},
positionToPageInfo: function(a) {
var b = -1, c = this.calcPos(a), d = this.defaultPageHeight;
while (c >= 0) b++, d = this.getPageHeight(b), c -= d;
return {
no: b,
height: d,
pos: c + d
};
},
isPageInRange: function(a) {
return a == Math.max(0, Math.min(this.pageCount - 1, a));
},
getPageHeight: function(a) {
return this.pageHeights[a] || this.defaultPageHeight;
},
invalidatePages: function() {
this.p0 = this.p1 = null, this.$.page0.setContent(""), this.$.page1.setContent("");
},
invalidateMetrics: function() {
this.pageHeights = [], this.rowHeight = 0, this.updateMetrics();
},
scroll: function(a, b) {
var c = this.inherited(arguments);
return this.update(this.getScrollTop()), c;
},
scrollToBottom: function() {
this.update(this.getScrollBounds().maxTop), this.inherited(arguments);
},
setScrollTop: function(a) {
this.update(a), this.inherited(arguments), this.twiddle();
},
getScrollPosition: function() {
return this.calcPos(this.getScrollTop());
},
setScrollPosition: function(a) {
this.setScrollTop(this.calcPos(a));
},
scrollToRow: function(a) {
var b = Math.floor(a / this.rowsPerPage), c = a % this.rowsPerPage, d = this.pageToPosition(b);
this.updateForPosition(d), d = this.pageToPosition(b), this.setScrollPosition(d);
if (b == this.p0 || b == this.p1) {
var e = this.$.generator.fetchRowNode(a);
if (e) {
var f = e.offsetTop;
this.bottomUp && (f = this.getPageHeight(b) - e.offsetHeight - f);
var g = this.getScrollPosition() + f;
this.setScrollPosition(g);
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
this.invalidatePages(), this.update(this.getScrollTop()), this.stabilize();
},
reset: function() {
this.getSelection().clear(), this.invalidateMetrics(), this.invalidatePages(), this.stabilize(), this.scrollToStart();
},
getSelection: function() {
return this.$.generator.getSelection();
},
select: function(a, b) {
return this.getSelection().select(a, b);
},
isSelected: function(a) {
return this.$.generator.isSelected(a);
},
renderRow: function(a) {
this.$.generator.renderRow(a);
},
prepareRow: function(a) {
this.$.generator.prepareRow(a);
},
lockRow: function() {
this.$.generator.lockRow();
},
performOnRow: function(a, b, c) {
this.$.generator.performOnRow(a, b, c);
},
animateFinish: function(a) {
return this.twiddle(), !0;
},
twiddle: function() {
var a = this.getStrategy();
enyo.call(a, "twiddle");
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
create: function() {
this.inherited(arguments), this.acceleratedChanged(), this.axisChanged(), this.valueChanged(), this.addClass("enyo-slideable");
},
initComponents: function() {
this.createComponents(this.tools), this.inherited(arguments);
},
rendered: function() {
this.inherited(arguments), this.updateDragScalar();
},
resizeHandler: function() {
this.inherited(arguments), this.updateDragScalar();
},
updateDragScalar: function() {
if (this.unit == "%") {
var a = this.getBounds()[this.dimension];
this.kDragScalar = a ? 100 / a : 1;
}
},
acceleratedChanged: function() {
enyo.platform.android > 2 || enyo.dom.accelerate(this, this.accelerated);
},
axisChanged: function() {
var a = this.axis == "h";
this.dragMoveProp = a ? "dx" : "dy", this.shouldDragProp = a ? "horizontal" : "vertical", this.transform = a ? "translateX" : "translateY", this.dimension = a ? "width" : "height";
},
valueChanged: function(a) {
var b = this.value;
this.isOob(b) && !this.isAnimating() && (this.value = this.overMoving ? this.dampValue(b) : this.clampValue(b)), enyo.platform.android > 2 && (this.value ? (a == 0 || a == undefined) && enyo.dom.accelerate(this, this.accelerated) : enyo.dom.accelerate(this, !1)), enyo.dom.transformValue(this, this.transform, this.value + this.unit), this.doChange();
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
clampValue: function(a) {
var b = this.calcMin(), c = this.calcMax();
return Math.max(b, Math.min(a, c));
},
dampValue: function(a) {
return this.dampBound(this.dampBound(a, this.min, 1), this.max, -1);
},
dampBound: function(a, b, c) {
var d = a;
return d * c < b * c && (d = b + (d - b) / 4), d;
},
shouldDrag: function(a) {
return this.draggable && a[this.shouldDragProp];
},
isOob: function(a) {
return a > this.calcMax() || a < this.calcMin();
},
dragstart: function(a, b) {
if (this.shouldDrag(b)) return b.preventDefault(), this.$.animator.stop(), b.dragInfo = {}, this.dragging = !0, this.drag0 = this.value, this.dragd0 = 0, this.preventDragPropagation;
},
drag: function(a, b) {
if (this.dragging) {
b.preventDefault();
var c = b[this.dragMoveProp] * this.kDragScalar, d = this.drag0 + c, e = c - this.dragd0;
return this.dragd0 = c, e && (b.dragInfo.minimizing = e < 0), this.setValue(d), this.preventDragPropagation;
}
},
dragfinish: function(a, b) {
if (this.dragging) return this.dragging = !1, this.completeDrag(b), b.preventTap(), this.preventDragPropagation;
},
completeDrag: function(a) {
this.value !== this.calcMax() && this.value != this.calcMin() && this.animateToMinMax(a.dragInfo.minimizing);
},
isAnimating: function() {
return this.$.animator.isAnimating();
},
play: function(a, b) {
this.$.animator.play({
startValue: a,
endValue: b,
node: this.hasNode()
});
},
animateTo: function(a) {
this.play(this.value, a);
},
animateToMin: function() {
this.animateTo(this.calcMin());
},
animateToMax: function() {
this.animateTo(this.calcMax());
},
animateToMinMax: function(a) {
a ? this.animateToMin() : this.animateToMax();
},
animatorStep: function(a) {
return this.setValue(a.value), !0;
},
animatorComplete: function(a) {
return this.doAnimateFinish(a), !0;
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
destroy: function() {
var a = this.container.children;
for (var b = 0, c; c = a[b]; b++) c._arranger = null;
this.inherited(arguments);
},
arrange: function(a, b) {},
size: function() {},
start: function() {
var a = this.container.fromIndex, b = this.container.toIndex, c = this.container.transitionPoints = [ a ];
if (this.incrementalPoints) {
var d = Math.abs(b - a) - 2, e = a;
while (d >= 0) e += b < a ? -1 : 1, c.push(e), d--;
}
c.push(this.container.toIndex);
},
finish: function() {},
canDragEvent: function(a) {
return a[this.canDragProp];
},
calcDragDirection: function(a) {
return a[this.dragDirectionProp];
},
calcDrag: function(a) {
return a[this.dragProp];
},
drag: function(a, b, c, d, e) {
var f = this.measureArrangementDelta(-a, b, c, d, e);
return f;
},
measureArrangementDelta: function(a, b, c, d, e) {
var f = this.calcArrangementDifference(b, c, d, e), g = f ? a / Math.abs(f) : 0;
return g *= this.container.fromIndex > this.container.toIndex ? -1 : 1, g;
},
calcArrangementDifference: function(a, b, c, d) {},
_arrange: function(a) {
var b = this.getOrderedControls(a);
this.arrange(b, a);
},
arrangeControl: function(a, b) {
a._arranger = enyo.mixin(a._arranger || {}, b);
},
flow: function() {
this.c$ = [].concat(this.container.children), this.controlsIndex = 0;
for (var a = 0, b = this.container.children, c; c = b[a]; a++) enyo.dom.accelerate(c, this.accelerated);
},
reflow: function() {
var a = this.container.hasNode();
this.containerBounds = a ? {
width: a.clientWidth,
height: a.clientHeight
} : {}, this.size();
},
flowArrangement: function() {
var a = this.container.arrangement;
if (a) for (var b = 0, c = this.container.children, d; d = c[b]; b++) this.flowControl(d, a[b]);
},
flowControl: function(a, b) {
enyo.Arranger.positionControl(a, b);
var c = b.opacity;
c != null && enyo.Arranger.opacifyControl(a, c);
},
getOrderedControls: function(a) {
var b = Math.floor(a), c = b - this.controlsIndex, d = c > 0, e = this.c$ || [];
for (var f = 0; f < Math.abs(c); f++) d ? e.push(e.shift()) : e.unshift(e.pop());
return this.controlsIndex = b, e;
},
statics: {
positionControl: function(a, b, c) {
var d = c || "px";
if (!this.updating) if (enyo.dom.canTransform()) {
var e = b.left, f = b.top, e = enyo.isString(e) ? e : e && e + d, f = enyo.isString(f) ? f : f && f + d;
enyo.dom.transform(a, {
translateX: e || null,
translateY: f || null
});
} else a.setBounds(b, c);
},
opacifyControl: function(a, b) {
var c = b;
c = c > .99 ? 1 : c < .01 ? 0 : c, enyo.platform.ie < 9 ? a.applyStyle("filter", "progid:DXImageTransform.Microsoft.Alpha(Opacity=" + c * 100 + ")") : a.applyStyle("opacity", c);
}
}
});

// CardArranger.js

enyo.kind({
name: "enyo.CardArranger",
kind: "Arranger",
layoutClass: "enyo-arranger enyo-arranger-fit",
calcArrangementDifference: function(a, b, c, d) {
return this.containerBounds.width;
},
destroy: function() {
var a = this.container.children;
for (var b = 0, c; c = a[b]; b++) enyo.Arranger.opacifyControl(c, 1), c.setShowing(!0), c.resized();
this.inherited(arguments);
},
arrange: function(a, b) {
for (var c = 0, d, e, f; d = a[c]; c++) f = c == 0 ? 1 : 0, this.arrangeControl(d, {
opacity: f
});
},
start: function() {
this.inherited(arguments);
var a = this.container.children;
for (var b = 0, c; c = a[b]; b++) c.setShowing(b == this.container.fromIndex || b == this.container.toIndex), c.showing && c.resized();
},
finish: function() {
this.inherited(arguments);
var a = this.container.children;
for (var b = 0, c; c = a[b]; b++) c.setShowing(b == this.container.toIndex);
}
});

// CardSlideInArranger.js

enyo.kind({
name: "enyo.CardSlideInArranger",
kind: "CardArranger",
start: function() {
var a = this.container.children;
for (var b = 0, c; c = a[b]; b++) c.setShowing(b == this.container.fromIndex || b == this.container.toIndex), c.showing && c.resized();
var d = this.container.fromIndex, b = this.container.toIndex;
this.container.transitionPoints = [ b + "." + d + ".s", b + "." + d + ".f" ];
},
finish: function() {
this.inherited(arguments);
var a = this.container.children;
for (var b = 0, c; c = a[b]; b++) c.setShowing(b == this.container.toIndex);
},
arrange: function(a, b) {
var c = b.split("."), d = c[0], e = c[1], f = c[2] == "s", g = this.containerBounds.width;
for (var h = 0, i = this.container.children, j, g, k; j = i[h]; h++) k = g, e == h && (k = f ? 0 : -g), d == h && (k = f ? g : 0), e == h && e == d && (k = 0), this.arrangeControl(j, {
left: k
});
}
});

// CarouselArranger.js

enyo.kind({
name: "enyo.CarouselArranger",
kind: "Arranger",
size: function() {
var a = this.container.children, b = this.containerPadding = this.container.hasNode() ? enyo.FittableLayout.calcPaddingExtents(this.container.node) : {}, c = this.containerBounds;
c.height -= b.top + b.bottom, c.width -= b.left + b.right;
var d;
for (var e = 0, f = 0, g, h; h = a[e]; e++) g = enyo.FittableLayout.calcMarginExtents(h.hasNode()), h.width = h.getBounds().width, h.marginWidth = g.right + g.left, f += (h.fit ? 0 : h.width) + h.marginWidth, h.fit && (d = h);
if (d) {
var i = c.width - f;
d.width = i >= 0 ? i : d.width;
}
for (var e = 0, j = b.left, g, h; h = a[e]; e++) h.setBounds({
top: b.top,
bottom: b.bottom,
width: h.fit ? h.width : null
});
},
arrange: function(a, b) {
this.container.wrap ? this.arrangeWrap(a, b) : this.arrangeNoWrap(a, b);
},
arrangeNoWrap: function(a, b) {
var c = this.container.children, d = this.container.clamp(b), e = this.containerBounds.width;
for (var f = d, g = 0, h; h = c[f]; f++) {
g += h.width + h.marginWidth;
if (g > e) break;
}
var i = e - g, j = 0;
if (i > 0) {
var k = d;
for (var f = d - 1, l = 0, h; h = c[f]; f--) {
l += h.width + h.marginWidth;
if (i - l <= 0) {
j = i - l, d = f;
break;
}
}
}
for (var f = 0, m = this.containerPadding.left + j, n, h; h = c[f]; f++) n = h.width + h.marginWidth, f < d ? this.arrangeControl(h, {
left: -n
}) : (this.arrangeControl(h, {
left: Math.floor(m)
}), m += n);
},
arrangeWrap: function(a, b) {
for (var c = 0, d = this.containerPadding.left, e, f; f = a[c]; c++) this.arrangeControl(f, {
left: d
}), d += f.width + f.marginWidth;
},
calcArrangementDifference: function(a, b, c, d) {
var e = Math.abs(a % this.c$.length);
return b[e].left - d[e].left;
}
});

// CollapsingArranger.js

enyo.kind({
name: "enyo.CollapsingArranger",
kind: "CarouselArranger",
size: function() {
this.clearLastSize(), this.inherited(arguments);
},
clearLastSize: function() {
for (var a = 0, b = this.container.children, c; c = b[a]; a++) c._fit && a != b.length - 1 && (c.applyStyle("width", null), c._fit = null);
},
arrange: function(a, b) {
var c = this.container.children;
for (var d = 0, e = this.containerPadding.left, f, g; g = c[d]; d++) this.arrangeControl(g, {
left: e
}), d >= b && (e += g.width + g.marginWidth), d == c.length - 1 && b < 0 && this.arrangeControl(g, {
left: e - b
});
},
calcArrangementDifference: function(a, b, c, d) {
var e = this.container.children.length - 1;
return Math.abs(d[e].left - b[e].left);
},
flowControl: function(a, b) {
this.inherited(arguments);
if (this.container.realtimeFit) {
var c = this.container.children, d = c.length - 1, e = c[d];
a == e && this.fitControl(a, b.left);
}
},
finish: function() {
this.inherited(arguments);
if (!this.container.realtimeFit && this.containerBounds) {
var a = this.container.children, b = this.container.arrangement, c = a.length - 1, d = a[c];
this.fitControl(d, b[c].left);
}
},
fitControl: function(a, b) {
a._fit = !0, a.applyStyle("width", this.containerBounds.width - b + "px"), a.resized();
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
var a = this.container.children, b = this.containerBounds[this.axisSize], c = b - this.margin - this.margin;
for (var d = 0, e, f; f = a[d]; d++) e = {}, e[this.axisSize] = c, e[this.offAxisSize] = "100%", f.setBounds(e);
},
arrange: function(a, b) {
var c = Math.floor(this.container.children.length / 2), d = this.getOrderedControls(Math.floor(b) - c), e = this.containerBounds[this.axisSize] - this.margin - this.margin, f = this.margin - e * c, g = (d.length - 1) / 2;
for (var h = 0, i, j, k; i = d[h]; h++) j = {}, j[this.axisPosition] = f, j.opacity = h == 0 || h == d.length - 1 ? 0 : 1, this.arrangeControl(i, j), f += e;
},
calcArrangementDifference: function(a, b, c, d) {
var e = Math.abs(a % this.c$.length);
return b[e][this.axisPosition] - d[e][this.axisPosition];
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
var a = this.container.children, b = this.containerBounds, c = this.controlWidth = b.width / 3, d = this.controlHeight = b.height / 3;
for (var e = 0, f; f = a[e]; e++) f.setBounds({
width: c,
height: d
});
},
arrange: function(a, b) {
var c = this.inc;
for (var d = 0, e = a.length, f; f = a[d]; d++) {
var g = Math.cos(d / e * 2 * Math.PI) * d * c + this.controlWidth, h = Math.sin(d / e * 2 * Math.PI) * d * c + this.controlHeight;
this.arrangeControl(f, {
left: g,
top: h
});
}
},
start: function() {
this.inherited(arguments);
var a = this.getOrderedControls(this.container.toIndex);
for (var b = 0, c; c = a[b]; b++) c.applyStyle("z-index", a.length - b);
},
calcArrangementDifference: function(a, b, c, d) {
return this.controlWidth;
}
}), enyo.kind({
name: "enyo.GridArranger",
kind: "Arranger",
incrementalPoints: !0,
colWidth: 100,
colHeight: 100,
size: function() {
var a = this.container.children, b = this.colWidth, c = this.colHeight;
for (var d = 0, e; e = a[d]; d++) e.setBounds({
width: b,
height: c
});
},
arrange: function(a, b) {
var d = this.colWidth, e = this.colHeight, f = Math.floor(this.containerBounds.width / d);
for (var g = 0, h = 0; h < a.length; g++) for (var i = 0; i < f && (c = a[h]); i++, h++) this.arrangeControl(c, {
left: d * i,
top: e * g
});
},
flowControl: function(a, b) {
this.inherited(arguments), enyo.Arranger.opacifyControl(a, b.top % this.colHeight != 0 ? .25 : 1);
},
calcArrangementDifference: function(a, b, c, d) {
return this.colWidth;
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
ondragfinish: "dragfinish"
},
tools: [ {
kind: "Animator",
onStep: "step",
onEnd: "completed"
} ],
fraction: 0,
create: function() {
this.transitionPoints = [], this.inherited(arguments), this.arrangerKindChanged(), this.avoidFitChanged(), this.indexChanged();
},
initComponents: function() {
this.createChrome(this.tools), this.inherited(arguments);
},
arrangerKindChanged: function() {
this.setLayoutKind(this.arrangerKind);
},
avoidFitChanged: function() {
this.addRemoveClass("enyo-panels-fit-narrow", this.narrowFit);
},
removeControl: function(a) {
this.inherited(arguments), this.isPanel(a) && (this.flow(), this.reflow(), this.setIndex(0));
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
var a = this.controlParent || this;
return a.children;
},
getActive: function() {
var a = this.getPanels();
return a[this.index];
},
getAnimator: function() {
return this.$.animator;
},
setIndex: function(a) {
this.setPropertyValue("index", a, "indexChanged");
},
setIndexDirect: function(a) {
this.setIndex(a), this.completed();
},
previous: function() {
this.setIndex(this.index - 1);
},
next: function() {
this.setIndex(this.index + 1);
},
clamp: function(a) {
var b = this.getPanels().length - 1;
return this.wrap ? a : Math.max(0, Math.min(a, b));
},
indexChanged: function(a) {
this.lastIndex = a, this.index = this.clamp(this.index), this.dragging || (this.$.animator.isAnimating() && this.completed(), this.$.animator.stop(), this.hasNode() && (this.animate ? (this.startTransition(), this.$.animator.play({
startValue: this.fraction
})) : this.refresh()));
},
step: function(a) {
this.fraction = a.value, this.stepTransition();
},
completed: function() {
this.$.animator.isAnimating() && this.$.animator.stop(), this.fraction = 1, this.stepTransition(), this.finishTransition();
},
dragstart: function(a, b) {
if (this.draggable && this.layout && this.layout.canDragEvent(b)) return b.preventDefault(), this.dragstartTransition(b), this.dragging = !0, this.$.animator.stop(), !0;
},
drag: function(a, b) {
this.dragging && (b.preventDefault(), this.dragTransition(b));
},
dragfinish: function(a, b) {
this.dragging && (this.dragging = !1, b.preventTap(), this.dragfinishTransition(b));
},
dragstartTransition: function(a) {
if (!this.$.animator.isAnimating()) {
var b = this.fromIndex = this.index;
this.toIndex = b - (this.layout ? this.layout.calcDragDirection(a) : 0);
} else this.verifyDragTransition(a);
this.fromIndex = this.clamp(this.fromIndex), this.toIndex = this.clamp(this.toIndex), this.fireTransitionStart(), this.layout && this.layout.start();
},
dragTransition: function(a) {
var b = this.layout ? this.layout.calcDrag(a) : 0, c = this.transitionPoints, d = c[0], e = c[c.length - 1], f = this.fetchArrangement(d), g = this.fetchArrangement(e), h = this.layout ? this.layout.drag(b, d, f, e, g) : 0, i = b && !h;
!i, this.fraction += h;
var e = this.fraction;
if (e > 1 || e < 0 || i) (e > 0 || i) && this.dragfinishTransition(a), this.dragstartTransition(a), this.fraction = 0;
this.stepTransition();
},
dragfinishTransition: function(a) {
this.verifyDragTransition(a), this.setIndex(this.toIndex);
},
verifyDragTransition: function(a) {
var b = this.layout ? this.layout.calcDragDirection(a) : 0, c = Math.min(this.fromIndex, this.toIndex), d = Math.max(this.fromIndex, this.toIndex);
if (b > 0) {
var e = c;
c = d, d = e;
}
c != this.fromIndex && (this.fraction = 1 - this.fraction), this.fromIndex = c, this.toIndex = d;
},
refresh: function() {
this.startTransition(), this.fraction = 1, this.stepTransition(), this.finishTransition();
},
startTransition: function() {
this.fromIndex = this.fromIndex != null ? this.fromIndex : this.lastIndex || 0, this.toIndex = this.toIndex != null ? this.toIndex : this.index, this.layout && this.layout.start(), this.fireTransitionStart();
},
finishTransition: function() {
this.layout && this.layout.finish(), this.transitionPoints = [], this.fraction = 0, this.fromIndex = this.toIndex = null, this.fireTransitionFinish();
},
fireTransitionStart: function() {
this.hasNode() && this.doTransitionStart({
fromIndex: this.fromIndex,
toIndex: this.toIndex
});
},
fireTransitionFinish: function() {
this.hasNode() && this.doTransitionFinish({
fromIndex: this.lastIndex,
toIndex: this.index
});
},
stepTransition: function() {
if (this.hasNode()) {
var a = this.transitionPoints, b = (this.fraction || 0) * (a.length - 1), c = Math.floor(b);
b -= c;
var d = a[c], e = a[c + 1], f = this.fetchArrangement(d), g = this.fetchArrangement(e);
this.arrangement = f && g ? enyo.Panels.lerp(f, g, b) : f || g, this.arrangement && this.layout && this.layout.flowArrangement();
}
},
fetchArrangement: function(a) {
return a != null && !this.arrangements[a] && this.layout && (this.layout._arrange(a), this.arrangements[a] = this.readArrangement(this.children)), this.arrangements[a];
},
readArrangement: function(a) {
var b = [];
for (var c = 0, d = a, e; e = d[c]; c++) b.push(enyo.clone(e._arranger));
return b;
},
statics: {
isScreenNarrow: function() {
return window.matchMedia && window.matchMedia("all and (max-width: 800px)").matches;
},
lerp: function(a, b, c) {
var d = [];
for (var e = 0, f = enyo.keys(a), g; g = f[e]; e++) d.push(this.lerpObject(a[g], b[g], c));
return d;
},
lerpObject: function(a, b, c) {
var d = enyo.clone(a), e, f;
for (var g in a) e = a[g], f = b[g], e != f && (d[g] = e - (e - f) * c);
return d;
}
}
});

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
walk: function(a) {
this.loader = new enyo.loaderFactory(runtimeMachine), this.loader.loadScript = function() {}, this.loader.loadSheet = function() {}, this.loader.verbose = this.verbose, this.loader.report = enyo.bind(this, "walkReport"), this.loader.finish = enyo.bind(this, "walkFinish"), enyo.loader = this.loader;
var b = enyo.path.rewrite(a);
return enyo.asyncMethod(enyo.loader, "load", b), this.async = new enyo.Async;
},
walkReport: function(a, b) {
this.doProgress({
action: a,
name: b
});
},
walkFinish: function() {
this.modules = this.loader.modules, this.async.respond({
modules: this.modules
}), this.doFinish({
modules: this.modules
});
}
});

// Reader.js

enyo.kind({
name: "Reader",
kind: enyo.Async,
go: function(a) {
return this.modules = a.modules, this.moduleIndex = 0, enyo.asyncMethod(this, "nextModule"), this;
},
nextModule: function() {
var a = this.modules[this.moduleIndex++];
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
b && b.length && (a.code = b);
},
modulesFinished: function() {
this.respond({
modules: this.modules
});
}
});

// Iterator.js

enyo.kind({
name: "Iterator",
kind: null,
i: -1,
nodes: null,
constructor: function(a) {
this.stream = a;
},
next: function() {
return this.i++, this._read();
},
prev: function() {
return this.i--, this._read();
},
_read: function(a) {
return this.past = this.stream[this.i - 1], this.value = this.stream[this.i], this.future = this.stream[this.i + 1], this.value;
}
});

// Lexer.js

enyo.kind({
name: "AbstractLexer",
kind: null,
constructor: function(a) {
if (a) return this.start(a), this.finish(), this.r;
},
p0: 0,
p: 0,
start: function(a) {
this.s = a, this.l = this.s.length, this.r = [], this.d = "", this.p0 = 0, this.p = 0, this.n = 0, this.analyze();
},
search: function(a) {
var b = a.global ? a : new RegExp(a.source, "g");
return b.lastIndex = this.p, this.m = b.exec(this.s), this.p = this.m ? this.m.index : -1, b.lastIndex != this.p0 && (this.d = this.s.charAt(this.p));
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
return this.r.push(f), this.n += e, this.p0 = this.p, f;
},
tossToken: function(a) {
this.tokenize(a), this.p0 = this.p;
},
finish: function() {
this.pushToken("gah");
}
}), enyo.kind({
name: "Lexer",
kind: AbstractLexer,
symbols: "(){}[];,:<>+-=*/&",
operators: [ "++", "--", "+=", "-=", "==", "!=", "<=", ">=", "===", "&&", "||", '"', "'" ],
keywords: [ "function", "new", "return", "if", "else", "while", "do", "break", "continue", "switch", "case", "var" ],
constructor: function(a) {
return this.buildPattern(), this.inherited(arguments);
},
buildPattern: function() {
var a = '"(?:\\\\"|[^"])*?"', b = "'(?:\\\\'|[^'])*?'", c = a + "|" + b, d = "\\b(?:" + this.keywords.join("|") + ")\\b", e = "[\\" + this.symbols.split("").join("\\") + "]", f = [];
for (var g = 0, h; h = this.operators[g]; g++) f.push("\\" + h.split("").join("\\"));
f = f.join("|"), e = f + "|" + e;
var i = [ '\\\\"|\\\\/', c, d, "\\/\\/", "\\/\\*", e, "\\s" ];
this.matchers = [ "doSymbol", "doString", "doKeyword", "doLineComment", "doCComment", "doSymbol", "doWhitespace" ], this.pattern = "(" + i.join(")|(") + ")";
},
analyze: function() {
var a = new RegExp(this.pattern, "gi");
while (this.search(a)) this.pushToken("identifier"), this.process(this.matchers), this.pushToken("identifier");
},
process: function(a) {
for (var b = 0, c; c = a[b]; b++) if (this.m[b + 1] && this[c]) {
this[c].apply(this);
return;
}
this.doSymbol();
},
doWhitespace: function() {
this.tokenize(1), this.search(/\S/g), this.pushToken("ws"), this.r.pop();
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
this.pushToken(this.d == ";" || this.d == "," ? "terminal" : "symbol", this.m[0].length);
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
});

// Parser.js

enyo.kind({
name: "Parser",
kind: null,
constructor: function(a) {
return this.parse(a);
},
parse: function(a) {
var b = [], c = new Iterator(a);
while (c.next()) c.value.kind !== "ws" && b.push(c.value);
var c = new Iterator(b);
return this.walk(c);
},
combine: function(a) {
var b = "";
for (var c = 0, d; d = a[c]; c++) b += d.token;
return b;
},
walk: function(a, b) {
var c = [], d;
try {
while (a.next()) {
d = a.value;
if (d.kind == "ws") continue;
if (d.kind == "comment") d.kind = "comment"; else if (b == "array") {
if (d.kind == "terminal") continue;
a.prev(), d = {
kind: "element",
token: "expr",
children: this.walk(a, "expression")
};
if (a.value && a.value.token == "]") return c.push(d), c;
} else if (d.token == "[") d.kind = "array", d.children = this.walk(a, d.kind); else {
if (b == "expression" && d.token == "]") return c;
if (d.token == "var") d.kind = "var", d.children = this.walk(a, "expression"); else {
if (d.kind == "terminal" && (b == "expression" || b == "var")) return c;
if (d.kind == "terminal") continue;
if (d.token == "{") {
d.kind = "block", d.children = this.walk(a, d.kind);
if (b == "expression" || b == "function") return c.push(d), c;
} else {
if (b == "expression" && (d.token == "}" || d.token == ")")) return a.prev(), c;
if (b == "block" && d.token == "}") return c;
if (d.token == "=" || d.token == ":" && b != "expression") {
var e = c.pop();
e.kind == "identifier" ? (e.op = d.token, e.kind = "assignment", e.children = this.walk(a, "expression"), a.value && a.value.kind == "terminal" && a.prev(), d = e) : c.push(e);
} else if (d.token == "(") d.kind = "association", d.children = this.walk(a, d.kind); else {
if (b == "association" && d.token == ")") return c;
if (d.token == "function") {
d.kind = "function", d.children = this.walk(a, d.kind);
if (b !== "expression" && d.children && d.children.length && d.children[0].kind == "identifier") {
d.name = d.children[0].token, d.children.shift();
var f = {
kind: "assignment",
token: d.name,
children: [ d ]
};
d = f;
}
if (b == "expression" || b == "function") return c.push(d), c;
}
}
}
}
}
c.push(d);
}
} catch (g) {
console.error(g);
}
return c;
}
});

// Documentor.js

enyo.kind({
name: "Documentor",
kind: null,
group: "public",
constructor: function(a) {
return this.comment = [], this.parse(a);
},
parse: function(a) {
var b = new Iterator(a);
return this.walk(b);
},
walk: function(a, b) {
var c = [], d, e;
while (a.next()) {
var d = a.value;
if (d.kind == "comment") this.cook_comment(d.token); else if (d.token == "enyo.kind" && a.future.kind == "association") e = this.cook_kind(a); else if (d.kind == "assignment") e = this.cook_assignment(a); else if (d.kind == "association" && d.children && d.children.length == 1 && d.children[0].kind == "function") {
var f = d.children[0];
if (f.children && f.children.length == 2) {
var g = f.children[1], h = this.walk(new Iterator(g.children));
c = c.concat(h);
}
a.next();
}
e && (c.push(e), e = null);
}
return c;
},
cook_kind: function(a) {
var b = function(a, b) {
var c = Documentor.indexByName(a, b);
if (c >= 0) {
var d = a[c];
a.splice(d, 1);
}
return d && d.value && d.value.length && d.value[0].token;
}, c = this.make("kind", a.value);
a.next();
var d = a.value.children;
return d && d[0] && d[0].kind == "block" && (c.properties = this.cook_block(d[0].children), c.name = Documentor.stripQuotes(b(c.properties, "name") || ""), c.superkind = Documentor.stripQuotes(b(c.properties, "kind") || "enyo.Control"), c.superkind == "null" && (c.superkind = null)), c;
},
cook_block: function(a) {
var b = [];
for (var c = 0, d; d = a[c]; c++) if (d.kind == "comment") this.cook_comment(d.token); else if (d.kind == "assignment") {
var e = this.make("property", d);
d.children && (e.value = [ this.walkValue(new Iterator(d.children)) ]), b.push(e);
}
return b;
},
walkValue: function(a, b) {
while (a.next()) {
var c = a.value;
if (c.kind != "comment") {
if (c.kind == "block") {
var d = this.make("block", c);
return d.properties = this.cook_block(c.children), d;
}
if (c.kind == "array") return this.cook_array(a);
if (c.kind == "function") return this.cook_function(a);
var d = this.make("expression", c), e = c.token;
while (a.next()) e += a.value.token;
return d.token = e, d;
}
this.cook_comment(c.token);
}
},
cook_function: function(a) {
var b = a.value, c = this.make("expression", b);
return c.arguments = enyo.map(b.children[0].children, function(a) {
return a.token;
}), c;
},
cook_array: function(a) {
var b = a.value, c = this.make("array", b), d = b.children;
if (d) {
var e = [];
for (var f = 0, g, h; g = d[f]; f++) h = this.walkValue(new Iterator(g.children)), h && e.push(h);
c.properties = e;
}
return c;
},
cook_assignment: function(a) {
var b = a.value, c = this.make("global", b);
return b.children && (b.children[0] && b.children[0].token == "function" && (c.type = "function"), c.value = [ this.walkValue(new Iterator(b.children)) ]), c;
},
make: function(a, b) {
return {
line: b.line,
start: b.start,
end: b.end,
height: b.height,
token: b.token,
name: b.token,
type: a,
group: this.group,
comment: this.consumeComment()
};
},
commentRx: /\/\*\*([\s\S]*)\*\/|\/\/\*(.*)/m,
cook_comment: function(a) {
var b = a.match(this.commentRx);
if (b) {
b = b[1] ? b[1] : b[2];
var c = this.extractPragmas(b);
this.honorPragmas(c);
}
},
extractPragmas: function(a) {
var b = /^[*\s]*@[\S\s]*/g, c = [], d = a;
return d.length && (d = a.replace(b, function(a) {
var b = a.slice(2);
return c.push(b), "";
}), d.length && this.comment.push(d)), c;
},
honorPragmas: function(a) {
var b = {
"protected": 1,
"public": 1
};
for (var c = 0, d; d = a[c]; c++) b[d] && (this.group = d);
},
consumeComment: function() {
var a = this.comment.join(" ");
this.comment = [];
var b = Documentor.removeIndent(a);
return b;
},
statics: {
indexByProperty: function(a, b, c) {
for (var d = 0, e; e = a[d]; d++) if (e[b] == c) return d;
return -1;
},
findByProperty: function(a, b, c) {
return a[this.indexByProperty(a, b, c)];
},
indexByName: function(a, b) {
return this.indexByProperty(a, "name", b);
},
findByName: function(a, b) {
return a[this.indexByName(a, b)];
},
stripQuotes: function(a) {
var b = a.charAt(0), c = b == '"' || b == "'" ? 1 : 0, d = a.charAt(a.length - 1), e = d == '"' || d == "'" ? -1 : 0;
return c || e ? a.slice(c, e) : a;
},
removeIndent: function(a) {
var b = 0, c = a.split(/\r?\n/);
for (var d = 0, e; (e = c[d]) != null; d++) if (e.length > 0) {
b = e.search(/\S/), b < 0 && (b = e.length);
break;
}
if (b) for (var d = 0, e; (e = c[d]) != null; d++) c[d] = e.slice(b);
return c.join("\n");
}
}
});

// Indexer.js

enyo.kind({
name: "Indexer",
kind: null,
group: "public",
constructor: function() {
this.objects = [];
},
findByName: function(a) {
return Documentor.findByProperty(this.objects, "name", a);
},
findByTopic: function(a) {
return Documentor.findByProperty(this.objects, "topic", a);
},
addModules: function(a) {
enyo.forEach(a, this.addModule, this), this.objects.sort(Indexer.nameCompare);
},
addModule: function(a) {
this.indexModule(a), this.mergeModule(a);
},
mergeModule: function(a) {
this.objects.push(a), this.objects = this.objects.concat(a.objects), enyo.forEach(a.objects, this.mergeProperties, this);
},
mergeProperties: function(a) {
a.properties ? this.objects = this.objects.concat(a.properties) : a.value && a.value[0] && a.value[0].properties && (this.objects = this.objects.concat(a.value[0].properties));
},
indexModule: function(a) {
a.type = "module", a.name = a.name || a.rawPath, a.objects = new Documentor(new Parser(new Lexer(a.code))), this.indexObjects(a);
},
indexObjects: function(a) {
enyo.forEach(a.objects, function(b) {
b.module = a, this.indexObject(b);
}, this);
},
indexObject: function(a) {
switch (a.type) {
case "kind":
this.indexKind(a);
}
this.indexProperties(a);
},
indexProperties: function(a) {
var b = a.properties || a.value && a.value[0] && a.value[0].properties;
enyo.forEach(b, function(b) {
b.object = a, b.topic = b.object.name ? b.object.name + "::" + b.name : b.name;
}, this);
},
indexKind: function(a) {
this.listComponents(a), this.indexInheritance(a);
},
indexInheritance: function(a) {
a.superkinds = this.listSuperkinds(a), a.allProperties = this.listInheritedProperties(a);
},
listSuperkinds: function(a) {
var b = [], c;
while (a && a.superkind) c = a.superkind, a = this.findByName(c), a || (a = this.findByName("enyo." + c), a && (c = "enyo." + c)), b.push(c);
return b;
},
listInheritedProperties: function(a) {
var b = [], c = {};
for (var d = a.superkinds.length - 1, e; e = a.superkinds[d]; d--) {
var f = this.findByName(e);
f && this.mergeInheritedProperties(f.properties, c, b);
}
return this.mergeInheritedProperties(a.properties, c, b), b.sort(Indexer.nameCompare), b;
},
mergeInheritedProperties: function(a, b, c) {
for (var d = 0, e; e = a[d]; d++) {
var f = b.hasOwnProperty(e.name) && b[e.name];
f ? (e.overrides = f, c[enyo.indexOf(f, c)] = e) : c.push(e), b[e.name] = e;
}
},
listComponents: function(a) {
a.components = this._listComponents(a, [], {});
},
_listComponents: function(a, b, c) {
var d = Documentor.findByName(a.properties, "components");
if (d && d.value && d.value.length) {
var e = d.value[0].properties;
for (var f = 0, g; g = e[f]; f++) {
var h = Documentor.findByName(g.properties, "name");
h && (h = Documentor.stripQuotes(h.value[0].token || ""));
var i = Documentor.findByName(g.properties, "kind");
i = Documentor.stripQuotes(i && i.value[0].token || "Control");
if (!h) {
var j = i.split(".").pop();
h = enyo.uncap(j), c[h] ? h += ++c[h] : c[h] = 1;
}
g.kind = i, g.name = h, b.push(g), this._listComponents(g, b, c);
}
}
return b;
},
statics: {
nameCompare: function(a, b) {
var c = a.name.toLowerCase(), d = b.name.toLowerCase();
return c < d ? -1 : c > d ? 1 : 0;
}
}
});

// Analyzer.js

enyo.kind({
name: "Analyzer",
kind: "Component",
events: {
onIndexReady: ""
},
create: function() {
this.index = new Indexer, this.inherited(arguments);
},
analyze: function(a) {
this.walk(a);
},
walk: function(a) {
var b = [], c = function(d, e) {
e && (b = b.concat(e.modules));
var f = a.shift();
f ? (new Walker).walk(f).response(this, c) : this.walkFinished(b);
};
c.call(this);
},
walkFinished: function(a) {
this.read(a);
},
read: function(a) {
(new Reader).go({
modules: a
}).response(this, function(a, b) {
this.indexModules(b.modules);
});
},
indexModules: function(a) {
this.index.addModules(a), this.doIndexReady();
}
});

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
var f = a(b), g = "	", h = "";
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

// Presentor.js

enyo.kind({
name: "Presentor",
kind: null,
showInherited: !1,
showProtected: !1,
getByType: function(a, b) {
var c = [];
for (var d = 0, e; e = a[d]; d++) e.type == b && c.push(e);
return c;
},
presentObject: function(a) {
switch (a.type) {
case "module":
return this.presentObjects(a.objects);
case "kind":
return this.presentKind(a);
case "function":
case "global":
return this.presentProperty(a);
}
},
presentObjects: function(a) {
var b = this.groupFilter(a), c = "", d = this.getByType(b, "kind");
if (d.length) {
c += "<h3>Kinds</h3>";
for (var e = 0, f; f = d[e]; e++) c += "<kind>" + f.name + "</kind><br/>", c += this.presentComment(f.comment);
}
var d = this.getByType(b, "function");
c += "<h3>Functions</h3>";
for (var e = 0, f; f = d[e]; e++) c += this.presentComment(f.comment), f.group && (c += "<" + f.group + ">" + f.group + "</" + f.group + ">"), c += "<i>name:</i> <label>" + f.name + "(<arguments>" + f.value[0].arguments.join(", ") + "</arguments>)</label><br/>";
c += "<h3>Variables</h3>";
var d = this.getByType(b, "global");
for (var e = 0, f; f = d[e]; e++) c += this.presentComment(f.comment), f.group && (c += "<" + f.group + ">" + f.group + "</" + f.group + ">"), c += "<label>" + f.name + "</label> = ", c += this.presentExpression(f.value[0]), c += "<br/>";
return c;
},
presentComment: function(a) {
return a ? "<comment>" + this.markupToHtml(a) + "</comment>" : "";
},
presentKind: function(a) {
return this.presentKindHeader(a) + this.presentKindSummary(a) + this.presentKindProperties(a);
},
presentKindHeader: function(a) {
var b = "<kind>" + a.name + "</kind>";
return a.superkinds.length && (b += '<div style="padding: 4px 0px;">', b += a.name, enyo.forEach(a.superkinds, function(a) {
b += " :: <a href=#" + a + ">" + a + "</a>";
}), b += "</div>"), b;
},
presentKindSummary: function(a) {
var b = "";
return a.comment && (b += "<h3>Summary</h3>" + this.presentComment(a.comment)), b;
},
presentKindProperties: function(a) {
return this.presentProperties(this.showInherited ? a.allProperties : a.properties, a);
},
groupFilter: function(a) {
return enyo.filter(a, function(a) {
return a.name[0] !== "_" && (a.group == "public" || this.showProtected && a.group == "protected");
}, this);
},
presentProperties: function(a, b) {
var c = this.groupFilter(a), d = "";
for (var e = 0, f; f = c[e]; e++) d += this.presentProperty(f, b);
return d;
},
presentProperty: function(a, b) {
var c = "", d = a;
c += '<a name="' + d.name + '"></a>', d.group && (c += "<" + d.group + ">" + d.group + "</" + d.group + ">");
var e = d.name;
return d.object && b && b != d.object && (e = "<prototype>" + d.object.name + "::</prototype>" + e), c += "<label>" + e + "</label>: ", d.value && d.value[0] && d.value[0].token == "function" ? c += "function(<arguments>" + d.value[0].arguments.join(", ") + "</arguments>)<br/>" : c += this.presentValue(d), c += this.presentComment(d.comment), c += "<hr/>", c;
},
presentValue: function(a) {
var b, c = a.value;
return !c || !c[0] ? b = a.token : b = this.presentExpression(c[0]), b += "</br>", b;
},
presentExpression: function(a) {
var b = a;
return b.comment ? this.presentComment(b.comment) : b.type == "block" ? "{<blockquote><br/>" + this.presentBlock(b) + "</blockquote>}" : b.type == "array" ? "[<blockquote>" + this.presentArray(b) + "</blockquote>]" : b.token;
},
presentBlock: function(a) {
return this.presentProperties(a.properties);
},
presentArray: function(a) {
var b = "", c = a.properties;
for (var d = 0, e; e = c[d]; d++) b += "<i>" + d + "</i>: " + this.presentExpression(e);
return b;
},
presentColumns: function(a, b, c) {
var d = this.groupFilter(a), e = "";
b && (e = b.name + "::");
var f = c || 4, g = [], h = "";
for (var i = 0, j = 0, k = 0; p = d[i]; i++) h += '<a href="#' + e + p.name + '">' + p.name + "</a><br/>", ++k == f && (g.push(h), h = "", k = 0);
return h && g.push(h), h = g.length ? "<column>" + g.join("</column><column>") + "</column>" : "", h;
},
markupToHtml: function(a) {
var b = Presentor.showdown.makeHtml(a || "");
return b = b.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/gm, function(a, b) {
return "<pre>" + syntaxHighlight(b) + "</pre>";
}), b;
},
statics: {
showdown: new Showdown.converter
}
});

// PackagesEditor.js

enyo.kind({
name: "PackagesEditor",
kind: "Popup",
classes: "packages-editor",
events: {
onSave: ""
},
components: [ {
kind: "Repeater",
onSetupItem: "setupItem",
components: [ {
components: [ {
name: "name",
kind: "Input"
}, {
name: "path",
kind: "Input"
}, {
kind: "Button",
content: "Delete",
ontap: "deletePkg"
} ]
} ]
}, {
kind: "Button",
content: "New...",
ontap: "newPkg"
}, {
tag: "hr"
}, {
kind: "Button",
content: "Cancel",
ontap: "hide"
}, {
kind: "Button",
content: "Save",
ontap: "save"
} ],
openWithPackages: function(a) {
this.show(), this.pkgs = a, this.load();
},
load: function() {
this.$.repeater.setCount(this.pkgs.length);
},
setupItem: function(a, b) {
var c = this.pkgs[b.index];
return b.item.$.name.setValue(c.name), b.item.$.path.setValue(c.path), !0;
},
newPkg: function() {
this.pkgs.push({
name: "",
path: ""
}), this.load();
},
deletePkg: function(a, b) {
this.pkgs.splice(b.index, 1), this.load();
},
save: function() {
var a = [];
for (var b = 0, c; c = this.$.repeater.getClientControls()[b]; b++) {
var d = c.$.name.getValue(), e = c.$.path.getValue();
d && e && a.push({
name: d,
path: e
});
}
this.doSave({
pkgs: a
}), this.hide();
}
});

// PackageList.js

enyo.kind({
name: "PackageList",
components: [ {
kind: "Repeater",
components: [ {
components: [ {
kind: "Checkbox",
onchange: "cbChange"
} ]
} ]
}, {
kind: "PackagesEditor",
modal: !0,
centered: !0,
floating: !0,
onSave: "savePackages"
} ],
events: {
onPackagesChange: "",
onLoaded: ""
},
handlers: {
onSetupItem: "setupItem"
},
fetchPackageData: function() {
(new enyo.Ajax({
url: "manifest.json"
})).response(this, function(a, b) {
this.gotPackageData(b);
}).go();
},
gotPackageData: function(a) {
this.pkgs = a, this.$.repeater.setCount(this.pkgs.length), this.doLoaded({
packages: this.pkgs
});
},
loadPackageData: function() {
this.pkgs ? this.gotPackageData(this.pkgs) : this.fetchPackageData();
},
savePackageData: function() {},
setupItem: function(a, b) {
var c = this.pkgs[b.index], d = b.item.$.checkbox;
d.setContent(c.name), d.setChecked(!c.disabled);
},
cbChange: function(a, b) {
var c = b.index, d = this.pkgs[c];
d && (d.disabled = !a.getChecked(), this.savePackageData()), this.doPackagesChange({
pkg: d
});
}
});

// TabPanels.js

enyo.kind({
name: "TabPanels",
kind: "FittableRows",
components: [ {
name: "tabs",
kind: "Group",
defaultKind: "Button",
controlClasses: "tab"
}, {
name: "client",
style: "position: relative;",
fit: !0
} ],
create: function() {
this.inherited(arguments), this.selectTab(0);
},
addControl: function(a) {
a.isChrome || (a.addClass("enyo-fit"), a.showing = !1, this.$.tabs.createComponent({
content: a.tabName || a.name,
ontap: "tabTap",
owner: this
})), this.inherited(arguments);
},
selectTab: function(a) {
this.$.tabs.getControls()[a].setActive(!0);
for (var b = 0, c = this.getClientControls(), d; d = c[b]; b++) d.setShowing(b == a);
},
tabTap: function(a) {
this.selectTab(a.indexInContainer());
}
});

// SearchBar.js

enyo.kind({
name: "SearchBar",
events: {
onSearch: ""
},
handlers: {
onkeyup: "search",
onchange: "search"
},
components: [ {
xkind: "InputDecorator",
classes: "enyo-tool-decorator input-decorator",
style: "display: block;",
components: [ {
kind: "Input",
style: "width: 90%;"
}, {
kind: "Image",
src: "assets/search-input-search.png"
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

// App.js

enyo.kind({
name: "App",
kind: "FittableColumns",
components: [ {
kind: "Analyzer",
onIndexReady: "indexReady"
}, {
name: "left",
kind: "TabPanels",
components: [ {
kind: "Scroller",
tabName: "Kinds",
components: [ {
name: "kinds",
allowHtml: !0
} ]
}, {
kind: "Scroller",
tabName: "Modules",
components: [ {
name: "modules",
allowHtml: !0
} ]
}, {
kind: "Scroller",
tabName: "Index",
components: [ {
kind: "SearchBar",
onSearch: "search"
}, {
name: "index",
allowHtml: !0
} ]
}, {
name: "packages",
tabName: "Packages",
kind: "PackageList",
onPackagesChange: "loadPackages",
onLoaded: "packagesLoaded"
} ]
}, {
name: "doc",
kind: "FittableRows",
fit: !0,
components: [ {
name: "scope",
components: [ {
name: "inheritedCb",
kind: "Checkbox",
content: "show inherited",
onchange: "scopeChange"
}, {
name: "accessCb",
kind: "Checkbox",
content: "show protected",
style: "margin-left: 20px;",
onchange: "accessChange"
} ]
}, {
name: "header",
allowHtml: !0
}, {
name: "tocFrame",
kind: "Scroller",
components: [ {
name: "toc",
allowHtml: !0
} ]
}, {
name: "bodyFrame",
kind: "Scroller",
fit: !0,
components: [ {
name: "indexBusy",
kind: "Image",
src: "assets/busy.gif",
style: "padding-left: 8px;",
showing: !1
}, {
name: "body",
allowHtml: !0
} ]
} ]
} ],
create: function() {
this.inherited(arguments), window.onhashchange = enyo.bind(this, "hashChange"), this.presentor = new Presentor, this.loadPackages();
},
loadPackages: function() {
this.index = this.$.analyzer.index = new Indexer, this.$.packages.loadPackageData();
},
packagesLoaded: function(a, b) {
var c = [];
return enyo.forEach(b.packages, function(a) {
a.disabled || c.push(a.path);
}), this.walk(c), !0;
},
walk: function(a) {
this.walking = !0, this.$.indexBusy.show(), this.$.analyzer.walk(a);
},
indexReady: function() {
this.presentKinds(), this.presentModules(), this.presentIndex(), this.$.indexBusy.hide(), this.walking = !1, this.hashChange();
},
indexalize: function(a, b, c) {
var d = a ? enyo.filter(this.index.objects, a, this) : this.index.objects;
d = this.nameFilter(d);
var e = "", f;
for (var g = 0, h; h = d[g]; g++) {
var i = c(h).divider;
i && f != i && (f = i, e += "<divider>" + i + "</divider>"), e += enyo.macroize(b, c(h));
}
return e;
},
nameFilter: function(a) {
return enyo.filter(a, function(a) {
return a.name && a.name[0] !== "_";
});
},
presentFilteredIndex: function(a) {
var b = '<a href="#{$link}"><prototype>{$object}</prototype><topic>{$topic}</topic>{$module}</a><br/>', c = function(a) {
return {
link: a.topic || a.name,
topic: a.name,
divider: a.name[0].toUpperCase(),
object: a.object && a.object.name ? a.object.name + "::" : "",
module: !a.object && a.module && a.module.name ? " [" + a.module.name + "]" : ""
};
};
this.$.index.setContent(this.indexalize(a, b, c));
},
presentIndex: function() {
var a = function(a) {
return a.name !== "published" && (a.group == "public" || a.group == "published");
};
this.presentFilteredIndex(a);
},
presentModules: function() {
var a = function(a) {
return a.type == "module";
}, b = '<a href="#{$link}"><topic>{$topic}</topic></a><br/>', c = function(a) {
return {
link: a.topic || a.name,
topic: a.name,
divider: a.name[0].toUpperCase()
};
};
this.$.modules.setContent(this.indexalize(a, b, c));
},
presentKinds: function() {
var a = function(a) {
return a.type == "kind" && a.group == "public";
}, b = '<a href="#{$link}"><topic>{$topic}</topic></a><br/>', c = function(a) {
return {
link: a.topic || a.name,
topic: a.name,
divider: a.name.split(".")[0]
};
};
this.$.kinds.setContent(this.indexalize(a, b, c));
},
presentObject: function(a) {
switch (a && a.type) {
case "kind":
this.presentKind(a);
break;
default:
this.$.header.setContent(""), this.$.toc.setContent(""), this.$.doc.reflow();
var b = "";
a && (b = this.presentor.presentObject(a)), this.$.body.setContent(b);
}
},
presentKind: function(a) {
this.$.header.setContent(this.presentor.presentKindHeader(a));
var b = this.presentor.showInherited ? a.allProperties : a.properties;
b.sort(Indexer.nameCompare);
var c = this.presentor.presentColumns(b, a);
this.$.toc.setContent(c);
var d = this.presentor.presentKindSummary(a), b = this.presentor.presentKindProperties(a);
b && (d += "<h3>Properties</h3>" + b), this.$.body.setContent(d), this.$.doc.reflow();
},
presentModule: function(a) {
this.presentObject(a);
},
moduleTap: function(a) {
this.presentModule(a.object);
},
objectTap: function(a) {
this.presentObject(a.object);
},
hashChange: function(a) {
this.selectTopic(this.getHashTopic());
},
getHashTopic: function() {
return window.location.hash.slice(1);
},
selectTopic: function(a) {
this.topic = a;
var b = a.split("::"), c = b.shift(), d = b.shift(), e = this.index.findByName(c) || this.index.findByName("enyo." + c);
this.topicObject != e && (this.presentObject(e), this.topicObject = e, this.$.body.container.setScrollTop(0));
if (d) {
var f = document.getElementsByName(d)[0];
f && f.scrollIntoView(!0);
}
},
scopeChange: function() {
this.presentor.showInherited = this.$.inheritedCb.getValue(), this.topicObject = null, this.selectTopic(this.topic);
},
accessChange: function() {
this.presentor.showProtected = this.$.accessCb.getValue(), this.topicObject = null, this.selectTopic(this.topic);
},
search: function(a, b) {
this.setSearchString(b.searchString.toLowerCase());
},
setSearchString: function(a) {
var b = function(b) {
return b.name !== "published" && (b.group == "public" || b.group == "published") && b.name.toLowerCase().indexOf(a) >= 0;
};
this.presentFilteredIndex(b);
}
});
