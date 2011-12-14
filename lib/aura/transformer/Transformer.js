/**
	Drags and animates a transform between a min and max value.
*/
enyo.kind({
	name: "enyo.Transformer",
	kind: enyo.Transformable,
	className: "enyo-transformer",
	published: {
		min: 0,
		max: 0,
		overDragging: true,
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
	initComponents: function() {
		this.createChrome(this.tools);
		this.inherited(arguments);
	},
	rendered: function() {
		this.inherited(arguments);
		this.$.animator.setNode(this.hasNode());
	},
	teardownRender: function() {
		this.inherited(arguments);
		this.$.animator.setNode(null);
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
	dragstartHandler: function(inSender, inEvent) {
		if (this.shouldDrag(inEvent)) {
			this.dragging = true;
			this.drag0 = 0;
			return this.preventDragPropagation;
		}
	},
	dragHandler: function(inSender, inEvent) {
		if (this.dragging) {
			var d = inEvent[this.dragEventProp] * this.kDragScalar;
			var c = d - this.drag0;
			this.dragMinimizing = c < 0;
			if (this.shouldOverdrag(c)) {
				 c = c / 4;
			}
			this.applyDrag(c);
			this.drag0 = d;
			return this.preventDragPropagation;
		}
		
	},
	dragfinishHandler: function(inSender, inEvent) {
		if (this.dragging) {
			this.dragging = false;
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
		//this.log(this.id, inValue);
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