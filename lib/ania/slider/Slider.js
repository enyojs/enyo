/**
A control that presents a range of selection options in the form of a horizontal
slider with a control knob that can be tapped and dragged to the desired
location.

	{kind: "Slider", onChanging: "sliderChanging", onChange: "sliderChange"}

The onChanging event is fired when dragging the control knob. The onChange
event is fired when the position is set, either by finishing a drag or by
tapping the bar.
*/
enyo.kind({
	name: "enyo.Slider",
	kind: enyo.ProgressBar,
	className: "enyo-slider",
	published: {
		/** Controls whether position may be set by tapping
		an arbitrary position on the bar.  If false, position may only be set by dragging the knob. */
		tapPosition: true
	},
	events: {
		onChange: "",
		onChanging: ""
	},
	barLayoutKind: "",
	barChrome: [
		{name: "animator", kind: enyo.Animator, onBegin: "beginAnimation", onAnimate: "stepAnimation", onEnd: "endAnimation", onStop: "stopAnimation"},
		// FIXME: this node exists so our entire height can encompass the margin used for centering this div
		{className: "enyo-slider-progress", components: [
			{name: "bar", className: "enyo-slider-inner", components: [
				// NOTE: using a toggle so that mouseout doesn't abort down state
				// manually setting down/up when dragging and on mouseup.
				{name: "button", kind: "CustomButton", toggle: true, allowDrag: true, className: "enyo-slider-button"}
			]}
		]},
		{name: "client"}
	],
	//* @protected
	positionChanged: function(inOldPosition) {
		// disallow position changes not a result of dragging while control is dragging
		if (this.handlingDrag && !this.dragChange) {
			this.position = inOldPosition;
		} else {
			this.inherited(arguments);
		}
	},
	renderPosition: function(inPercent) {
		this.$.button.applyStyle("left",  inPercent + "%");
	},
	renderPositionDirect: function(inDomStyle, inPercent) {
		inDomStyle.left = inPercent + "%";
	},
	canAnimate: function() {
		return this.$.button.hasNode();
	},
	beginAnimation: function(inSender, inStart, inEnd) {
		this.$.button.domStyles.left = inEnd + "%";
		if (this.$.button.hasNode()) {
			inSender.setNode(this.$.button.node);
			inSender.style = this.$.button.node.style;
		}
		this.doBeginAnimation();
	},
	calcWidth: function() {
		var n = this.$.bar.hasNode();
		return n.offsetWidth;
	},
	calcEventPosition: function(inX) {
		var o = this.$.bar.getOffset();
		var x = inX - o.left;
		return (x / this.calcWidth()) * (this.maximum - this.minimum) + this.minimum;
	},
	flickHandler: function(inSender, inEvent) {
		// we need to squelch flicks if we are dragging to prevent spillover into scrollers
		return this.handlingDrag;
	},
	// drag processing
	dragstartHandler: function(inSender, inEvent) {
		this.handlingDrag = true;
		this._width = this.calcWidth();
		this.$.button.setDown(true);
		return true;
	},
	dragHandler: function(inSender, inEvent) {
		if (this.handlingDrag) {
			var p = this.calcEventPosition(inEvent.pageX);
			this.dragChange = true;
			this.setPositionImmediate(p);
			this.dragChange = false;
			this.doChanging(this.position);
		}
	},
	dragfinishHandler: function(inSender, inEvent) {
		if (this.handlingDrag) {
			this.toggleButtonUp();
			this.doChange(this.position);
			this.handlingDrag = false;
			inEvent.preventClick();
		}
	},
	//
	completeAnimation: function(inSender, inValue) {
		this.inherited(arguments);
		if (this._clicked) {
			this._clicked = false;
			inSender.setNode(null);
			this.doChange(this.position);
		}
	},
	clickHandler: function(inSender, e) {
		if (this.tapPosition && (e.dispatchTarget != this.$.button)) {
			this.$.animator.stop();
			var p = this.calcEventPosition(e.pageX);
			this._clicked = true;
			this.setPosition(p);
			if (!this.animatePosition) {
				this.doChange(this.position);
			}
		}
	},
	mouseupHandler: function() {
		this.toggleButtonUp();
	},
	toggleButtonUp: function() {
		this.$.button.setDown(false);
	}
});
