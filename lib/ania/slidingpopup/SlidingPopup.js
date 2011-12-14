/**
A <a href="#enyo.Popup">Popup</a> that displays a set of controls over other content.
A SlidingPopup attaches to the bottom, left, right, or top of the screen and, when shown, 
slides in from off the screen.

Note, it's typically a good idea to control the vertical position of the SlidingPopup by giving it 
an absolute top and/or bottom position via css.

To show a SlidingPopup asking the user to confirm a choice, try the following:

	components: [
		{kind: "Button", content: "Confirm choice", onclick: "showPopup"},
		{kind: "SlidingPopup", flyInFrom: "right", components: [
			{content: "Are you sure?"},
			{layoutKind: "HFlexLayout", pack: "center", components: [
				{kind: "Button", content: "OK", onclick: "confirmClick"},
				{kind: "Button", content: "Cancel", onclick: "cancelClick"}
			]}
		]}
	],
	showPopup: function() {
		this.$.slidingPopup.open();
	},
	confirmClick: function() {
		// process confirmation
		this.doConfirm();
		// then close dialog
		this.$.slidingPopup.close();
	},
	cancelClick: function() {
		this.$.slidingPopup.close();
	}
*/
enyo.kind({
	name: "enyo.SlidingPopup",
	kind: enyo.Popup,
	className: "enyo-sliding-popup",
	published: {
		/**
		Direction from which the popup should fly in when it is opened.
		One of: "bottom", "top", "left", or "right"
		*/
		flyInFrom: "bottom",
		closedSize: 0,
		animateUnit: "px"
	},
	showHideMode: "manual",
	//* @protected
	toolComponents: [
		{name: "animator", kind: "Animator", onAnimate: "stepAnimate", onEnd: "finishAnimate"}
	],
	create: function() {
		this.inherited(arguments);
		this.closedSizeChanged();
		this.flyInFromChanged();
	},
	componentsReady: function() {
		this.createComponents(this.toolComponents);
		this.inherited(arguments);
	},
	closedSizeChanged: function() {
		if (this.closedSize) {
			this.validateComponents();
			this.setShowing(true);
		}
	},
	flyInFromChanged: function(inOldValue) {
		this.applyStyle(this.flyInFrom, 0);
		this.moveVertical = (this.flyInFrom == "top" || this.flyInFrom == "bottom");
		this.moveSign = (this.flyInFrom == "bottom" || this.flyInFrom == "right") ? 1 : -1;
	},
	getAnimator: function() {
		return this.$.animator;
	},
	close: function() {
		if (this.isOpen) {
			this.inherited(arguments);
		} else if (this.moveValue != this.calcClosedSize()) {
			this.animate(this.moveValue, this.calcClosedSize());
		}
	},
	open: function() {
		if (!this.isOpen) {
			this.inherited(arguments);
		} else if (this.moveValue != 0) {
			this.animate(this.moveValue, 0);
		}
	},
	resizeHandler: function() {
		if (!this.isOpen && this.closedSize) {
			this.applyTransform(this.calcClosedSize());
		}
		this.inherited(arguments);
	},
	calcClosedSize: function() {
		var b = this.getBounds();
		var d = this.moveVertical ? "height" : "width";
		//return 100 - this.closedSize;
		return b[d] - this.closedSize;
	},
	renderOpen: function() {
		this.show();
		if (!this.dragging) {
			this.animate(this.moveValue || this.calcClosedSize(), 0);
		}
	},
	renderClose: function() {
		if (!this.dragging) {
			this.animate(this.moveValue || 0, this.calcClosedSize());
		}
	},
	animate: function(inStart, inEnd) {
		if (this.hasNode()) {
			this.$.animator.setNode(this.node);
			this.$.animator.style = this.node.style;
		}
		this.$.animator.play(inStart, inEnd);
	},
	stepAnimate: function(inSender, inValue) {
		this.applyTransform(inValue, inSender.style);
	},
	finishAnimate: function(inSender, inY) {
		this.$.animator.setNode(null);
		if (this.isOpen) {
			this.finishOpen();
		} else {
			if (!this.closedSize) {
				this.hide();
			}
			this.finishClose();
		}
	},
	applyTransform: function(inValue, inStyle) {
		this.moveValue = inValue;
		var v = (this.moveSign * inValue) + this.animateUnit;
		var x = 0, y = 0;
		if (this.moveVertical) {
			y = v;
		} else {
			x = v;
		}
		// NOTE: need to use translate3d to trigger compositing (preserve-3d creates render order problems in Chrome 14)
		var translate = "translate3d(" + x + "," + y + ",0px)";
		//this.log(translate);
		this.domStyles["-webkit-transform"] = translate;
		var s = inStyle || (this.hasNode() && this.node.style);
		if (s) {
			s.webkitTransform = translate;
		}
	},
	isDraggableEvent: function(inEvent) {
		var c = inEvent.dispatchTarget;
		while (c && c.isDescendantOf(this)) {
			if (c.slidingHandler) {
				return true;
			}
			c = c.parent;
		}
	},
	dragstartHandler: function(inSender, inEvent) {
		if (this.isDraggableEvent(inEvent)) {
			this.dragging = true;
			this.drag0 = 0;
			this.open();
		}
		this.fire("ondragstart", inEvent);
	},
	dragHandler: function(inSender, inEvent) {
		if (this.dragging) {
			var d = this.moveVertical ? inEvent.dy : inEvent.dx;
			var c = this.dragD = (d - this.drag0) * this.moveSign;
			var v = this.moveValue + c;
			v = Math.max(0, Math.min(v, this.calcClosedSize()));
			this.applyTransform(v);
			this.drag0 = d;
		}
		this.fire("ondrag", inEvent);
	},
	dragfinishHandler: function(inSender, inEvent) {
		if (this.dragging) {
			this.dragging = false;
			// argh, catch the corner
			if (this.moveValue == 0) {
				this.finishOpen();
			} else if (this.dragD < 0) {
				this.open();
			} else {
				this.close();
			}
			inEvent.preventClick();
		}
		this.fire("ondragfinish", inEvent);
	}
});
