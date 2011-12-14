/**
	Drags and animates a transform between a min and max value.
*/
enyo.kind({
	name: "enyo.Transmorpher",
	kind: enyo.Component,
	published: {
		control: null,
		accelerated: false,
		transform: "translateX",
		value: 0,
		unit: "px",
		min: 0,
		max: 0,
		overDragging: false,
		draggable: true
	},
	preventDragPropagation: false,
	events: {
		onFinishAnimate: ""
	},
	kDragScalar: 1,
	dragEventProp: "dx",
	//* @protected
	tools: [
		{name: "animator", kind: "Animator", onAnimate: "stepAnimate", onEnd: "finishAnimate"}
	],
	create: function() {
		this.inherited(arguments);
		this.controlChanged();
	},
	initComponents: function() {
		this.createChrome(this.tools);
		this.inherited(arguments);
	},
	controlChanged: function() {
		this.transformChanged();
	},
	acceleratedChanged: function() {
		this.transformChanged();
	},
	transformChanged: function(inOldValue) {
		var t = inOldValue === undefined ? this.value || 0 : this.discoverValue();
		this.prepareTransform();
		this.setValue(t);
	},
	hasNode: function() {
		return this.control && this.control.hasNode();
	},
	applyStyle: function() {
		if (this.control) {
			this.control.applyStyle.apply(this.control, arguments);
		}
	},
	isDescendantEvent: function(inEvent) {
		var t = inEvent.dispatchTarget;
		return t && t.isDescendantOf(this.control);
	},
	getDimensions: function() {
		var c = this.control || {};
		return {height: c.height, width: c.width};
	},
	getDomStyles: function() {
		return this.control ? this.control.domStyles : {};
	},
	valueChanged: function() {
		var t = this.value === null ? null : this.transformPrefix + this.value + this.transformSuffix;
		var ds = this.getDomStyles();
		ds["-webkit-transform"] = ds["-moz-transform"] = ds["-ms-transform"] = ds["transform"] = t;
		if (this.hasNode()) {
			var s = this.control.node.style;
			s.webkitTransform = s.MozTransform = s.msTransform = s.transform = t;
		}
	},
	// determine de facto transform from style data
	// note that transforms can stack so sum them
	discoverValue: function() {
		var s = this.getTransformStyle();
		var r = this.makeTransformRegExp(this.transform);
		var v = 0;
		var m;
		while (m = r.exec(s)) {
			v += parseFloat(m[1]);
		}
		return v;
	},
	prepareTransform: function() {
		this.transformPrefix = this.transform + "(";
		this.transformSuffix = this.unit + ") " + this.calcDomTransform();
	},
	calcDomTransform: function() {
		var s = this.getTransformStyle();
		var r = this.makeTransformRegExp(this.transform);
		s = s.replace(r, "");
		if (this.accelerated) {
			r = this.makeTransformRegExp("translateZ");
			s = s.replace(r, "");
			s += " translateZ(0)";
		}
		return s;
	},
	getTransformStyle: function() {
		var ds = this.getDomStyles();
		return ds["-webkit-transform"] || "";
	},
	makeTransformRegExp: function(inTransform) {
		return new RegExp(inTransform + "[^\\(]*\\(([^\\(]*)\\)", "g")
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
	clampValue: function(inValue) {
		var min = this.calcMin();
		var max = this.calcMax();
		return Math.max(min, Math.min(inValue, max));
	},
	// dragging
	shouldDrag: function(inEvent) {
		return this.draggable;
	},
	shouldOverdrag: function(inDelta) {
		if (this.overDragging) {
			var v = this.value + inDelta;
			return inDelta > this.calcMax() || inDelta < this.calcMin();
		}
	},
	dragStart: function(inEvent) {
		if (this.shouldDrag(inEvent)) {
			this.dragging = true;
			this.drag0 = 0;
			return this.preventDragPropagation;
		}
	},
	drag: function(inEvent) {
		if (this.dragging) {
			var d = inEvent[this.dragEventProp] * this.kDragScalar;
			var c = d - this.drag0;
			this.dragMinimizing = c < 0;
			if (this.shouldOverdrag(c)) {
				 c = c / 4;
			}
			inEvent.delta = c;
			this.applyDrag(c);
			this.drag0 = d;
			return this.preventDragPropagation;
		}
		
	},
	dragFinish: function(inEvent) {
		if (this.dragging) {
			this.dragging = false;
			inEvent.minimizing = this.dragMinimizing;
			this.completeDrag(this.dragMinimizing);
			inEvent.preventTap();
			return this.preventDragPropagation;
		}
	},
	applyDrag: function(inDelta) {
		var v = this.value + inDelta;
		if (!this.overDragging) {
			v = this.clampValue(v);
		}
		this.setValue(v);
	},
	completeDrag: function(inDragMinimizing) {
		if (this.value !== this.calcMax() && this.value != this.calcMin()) {
			this.animateToMinMax(inDragMinimizing);
		}
	},
	// animation
	play: function(inStart, inEnd) {
		this.$.animator.setNode(this.hasNode());
		this.$.animator.play(inStart, inEnd);
	},
	stop: function() {
		this.$.animator.stop();
	},
	stepAnimate: function(inSender, inValue) {
		this.setValue(inValue);
	},
	finishAnimate: function(inSender) {
		this.doFinishAnimate();
	},
	animateTo: function(inValue) {
		this.play(this.value, inValue);
	},
	animateToMin: function() {
		this.animateTo(this.calcMin());
	},
	animateToMax: function() {
		this.animateTo(this.calcMax());
	},
	animateToMinMax: function(inMin) {
		if (inMin) {
			this.animateToMin();
		} else {
			this.animateToMax();
		}
	},
	toggleMinMax: function() {
		this.animateToMinMax(this.isAtMin());
	}
});