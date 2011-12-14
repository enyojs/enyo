enyo.kind({
	name: "enyo.LinkedSlideable",
	kind: enyo.SlidingPanel,
	className: "enyo-linkedslideable",
	published: {
		// direction this group collapses to (min == left/top, max == right/bottom)
		collapsesTo: "min",
		fit: false
	},
	overDragging: false,
	create: function() {
		this.inherited(arguments);
		this.collapsesToChanged();
	},
	collapsesToChanged: function() {
		this.collapseSign = this.collapsesTo == "min" ? -1 : 1;
	},
	calcCollapse: function() {
		return this.collapseSign > 0 ? this.calcMax() : this.calcMin();
	},
	isAtCollapse: function() {
		return this.collapseSign > 0 ? this.isAtMax() : this.isAtMin();
	},
	applyDrag: function(inDelta) {
		this.inherited(arguments);
		this.callSiblings("siblingDrag", inDelta);
	},
	siblingDrag: function(inSibling, inDelta) {
		if (this.shouldSiblingDrag(inDelta)) {
			var v = inDelta + this.value;
			v = this.clampValue(v);
			this.setValue(v);
		}
	},
	shouldSiblingDrag: function(inDelta) {
		// always if collapsing
		if (inDelta * this.collapseSign > 0) {
			return true;
		// or if 'older' is moving or 'younger' is dragging
		} else {
			return this.isElderMoving() || this.isYoungerDragging();
		}
	},
	isElderMoving: function() {
		var s = this.findCollapseElder();
		return s && Math.abs(s.value) <= Math.abs(this.calcCollapse());
	},
	isYoungerDragging: function() {
		s = this;
		while (s = s.findCollapseYounger()) {
			if (s.dragging) {
				return true;
			}
		}
	},
	completeDrag: function(inMinimizing) {
		this.dragCollapse(inMinimizing);
		this.callSiblings("siblingCompleteDrag", inMinimizing);
	},
	// FIXME: need to link siblings to animation, not dragging
	siblingCompleteDrag: function(inSibling, inMinimizing) {
		this.dragCollapse(inMinimizing);
	},
	dragCollapse: function(inMinimizing) {
		if ((inMinimizing && this.collapseSign < 0) || (!inMinimizing && this.collapseSign > 0)) {
			this.animateTo(this.findCollapsingSibling().calcCollapse());
		} else if (!this.isAtCollapse()) {
			var s = this.findCollapsingSibling();
			var s = s && s.findCollapseYounger();
			if (s) {
				this.animateTo(s.calcCollapse());
			} else {
				this.animateToExpand();
			}
		}
	},
	findCollapseElder: function() {
		return this.findSibling(-this.collapseSign);
	},
	findCollapseYounger: function() {
		return this.findSibling(this.collapseSign);
	},
	findCollapsingSibling: function() {
		var s = this.findCollapseYounger();
		return !s || s.isAtCollapse() ? this : s.findCollapsingSibling();
	},
	findSibling: function(inDelta) {
		var i = this.parent.indexOfControl(this);
		var c$ = this.parent.children;
		var c = c$[i + inDelta];
		//return c instanceof enyo.LinkedSlideable ? c : null;
		return c;
	},
	callSiblings: function(inMethod /* args */) {
		var m = arguments[0];
		var args = enyo.cloneArray(arguments, 1);
		this._callSiblings(-1, m, args);
		this._callSiblings(1, m, args);
	},
	_callSiblings: function(inDirection, inMethod, inArgs) {
		var s = this.findSibling(inDirection);
		if (s && s.axis == this.axis) {
			enyo.call(s, inMethod, [this].concat(inArgs));
			enyo.call(s, "_callSiblings", arguments);
		}
	},
	animateToExpand: function() {
		if (this.collapseSign > 0) {
			this.animateToMin();
		} else {
			this.animateToMax();
		}
	},
	/*
	rendered: function() {
		this.inherited(arguments);
		this.resized();
	},
	resizeHandler: function() {
		this.fitify();
		this.inherited(arguments);
	},
	finishAnimate: function() {
		this.fitify();
		//this.callSiblings("siblingFinishAnimate");
		this.inherited(arguments);
	},
	// FIXME: experiment in fitting 1 thing
	fitify: function() {
		if (this.fit) {
			var h = this.axis == "h";
			var d = h ? "width" : "height";
			var m = h ? "left" : "top";
			var b = this.getBounds();
			var pb = this.parent.getBounds()
			// note: in opposite land, must reposition
				// works for absolute positioning, but not flexbox or inline-box
			if (this.collapseSign > 0) {
				this.applyStyle(m, -this.value + "px");
				var elb = this.findCollapseYounger();
				var rb = elb ? elb.getBounds()[m] : null;
				if (rb) {
					var e = h ? "right" : "bottom";
					this.applyStyle(e, pb[d] - rb + "px");
				}
			} else {
				var s = pb[d] - b[m];
				s += this.value * this.collapseSign;
				this.applyStyle(d, s +  "px");
			}
		}
	},*/
});