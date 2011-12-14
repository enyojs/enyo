enyo.kind({
	name: "enyo.CarouselPanels",
	kind: "Control",
	published: {
		index: 0,
		axis: "h"
	},
	events: {
		onTransitionEnd: ""
	},
	value: 0,
	tools: [
		{kind: "Transmorph"},
		{kind: "Animator", onAnimate: "stepAnimate", onEnd: "finishAnimate"}
	],
	create: function() {
		this.inherited(arguments);
		this.axisChanged();
	},
	initComponents: function() {
		this.createChrome(this.tools);
		this.inherited(arguments);
	},
	rendered: function() {
		this.inherited(arguments);
		this.refresh();
	},
	refresh: function() {
		this.updateSizes();
		this.applyValue(this.value);
	},
	resizeHandler: function() {
		this.updateSizes();
		this.inherited(arguments);
	},
	updateSizes: function() {
		this.clientSize = this.calcClientSize();
		this.contentSize = this.calcContentSize();
		this.minValue = this.clientSize - this.contentSize;
	},
	axisChanged: function() {
		this.transform = this.axis == "h" ? "translateX" : "translateY";
	},
	getSizeDimension: function() {
		return this.axis == "h" ? "width" : "height";
	},
	calcClientSize: function() {
		return this.hasNode()["client" + enyo.cap(this.getSizeDimension())];
	},
	calcContentSize: function() {
		var d = this.getSizeDimension();
		for (var i=0, s=0, c$=this.getClientControls(), c; c=c$[i]; i++) {
			s += c[d];
		}
		return s;
	},
	//dragging
	dragstartHandler: function(inSender, inEvent) {
		this.dragging = true;
		this.drag0 = 0;
		return this.preventDragPropagation;
	},
	dragHandler: function(inSender, inEvent) {
		if (this.dragging) {
			var d = inEvent[this.axis == "h" ? "dx" : "dy"];
			var c = d - this.drag0;
			this.dragMinimizing = c < 0;
			if (this.shouldOverdrag(c)) {
				 c = c / 4;
			}
			this.value += c;
			this.applyValue(this.value);
			this.drag0 = d;
			return this.preventDragPropagation;
		}
	},
	dragfinishHandler: function(inSender, inEvent) {
		if (this.dragging) {
			this.dragging = false;
			this.completeDrag(this.dragMinimizing);
			return this.preventDragPropagation;
		}
	},
	shouldOverdrag: function(inDelta) {
		return (inDelta + this.value > 0 || inDelta + this.value < this.minValue);
	},
	applyValue: function(inValue) {
		if (this.applier) {
			this.applier.call(this, inValue);
		} else {
			for (var i=0, c$=this.getClientControls(), s, c; c=c$[i]; i++) {
				this.$.transmorph.apply(c, this.transform + "(" + inValue + "px)");
			}
		}
	},
	completeDrag: function(inMinimizing) {
		var i = this.calcIndexForValue(this.value, inMinimizing);
		this.transitionToIndex(i);
	},
	calcIndexForValue: function(inValue, inMinimizing) {
		var d = this.getSizeDimension();
		for (var i=0, s=0, c$=this.getClientControls(), c; c=c$[i]; i++) {
			if (s + inValue > 0) {
				return inMinimizing ? i : Math.max(0, i-1);
			}
			s += c[d];
		}
	},
	calcValueForIndex: function(inIndex) {
		var c = this.getClientControls()[inIndex];
		if (c) {
			return -(c.getBounds()[this.axis == "h" ? "left" : "top"]);
		}
	},
	transitionTo: function(inValue) {
		var v = Math.min(0, Math.max(inValue, this.minValue));
		this.$.animator.play(this.value, v);
	},
	transitionToIndex: function(inIndex) {
		this.index = inIndex;
		this.transitionTo(this.calcValueForIndex(inIndex));
	},
	directToIndex: function(inIndex) {
		var v = this.calcValueForIndex(inIndex);
		this.value = v;
		this.applyValue(v);
	},
	stepAnimate: function(inSender, inValue) {
		this.value = inValue;
		this.applyValue(inValue);
	},
	finishAnimate: function(inSender) {
		this.doTransitionEnd();
	}
});
