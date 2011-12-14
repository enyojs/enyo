/**
A control that combines a <a href="#enyo.Slider">Slider</a> with a
<a href="#enyo.ProgressBar">ProgressBar</a>.

	{kind: "ProgressSlider"}

The lockBar, barPosition, barMinimum, and barMaximum properties can be used
to constrain user input. The barPosition, barMinimum, and barMaximum properties
are only active when lockBar is true.

For example, to make a progress slider that allows dragging between 50 and 70,
do this:

	{kind: "ProgressSlider", lockBar: true, barMinimum: 50, barMaximum: 70}

To make a progress slider that snaps to multiples of 10, do this:

	{kind: "ProgressSlider", lockBar: true, snap: 10}
*/
enyo.kind({
	name: "enyo.ProgressSlider",
	kind: enyo.Slider,
	published: {
		lockBar: false,
		barPosition: 0,
		altBarPosition: 0,
		barMinimum: 0,
		barMaximum: 100
	},
	barChrome: [
		{name: "animator", kind: enyo.Animator, onBegin: "beginAnimation", onAnimate: "stepAnimation", onEnd: "endAnimation", onStop: "stopAnimation"},
		{className: "enyo-progressslider-progress", components: [
			{name: "bar", kind: enyo.ProgressBar, className: "enyo-progress-slider", components: [
				{name: "altBar", className: "enyo-progress-slider-alt-bar"},
				{name: "button", kind: "CustomButton", toggling: true, allowDrag: true, className: "enyo-slider-button"}
			]}
		]},
		{name: "client"}
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.barMinimumChanged();
		this.barMaximumChanged();
		this.barPositionChanged();
		this.altBarPositionChanged();
	},
	barPositionChanged: function() {
		this.$.bar.setPosition(this.lockBar ? this.position : this.barPosition);
	},
	altBarPositionChanged: function() {
		var pct = this.$.bar.calcPercent(this.altBarPosition);
		this.$.altBar.applyStyle("visibility", pct <= 0 ? "hidden" : "visible");
		this.$.altBar.applyStyle("width",  pct + "%");
	},
	barMinimumChanged: function() {
		this.$.bar.setMinimum(this.lockBar ? this.minimum : this.barMinimum);
	},
	barMaximumChanged: function() {
		this.$.bar.setMaximum(this.lockBar ? this.maximum : this.barMaximum);
	},
	renderPosition: function(inPercent) {
		this.inherited(arguments);
		if (this.lockBar) {
			this.$.bar.renderPosition(inPercent);
		}
	},
	positionChanged: function(inOldPosition) {
		this.inherited(arguments);
		if (this.lockBar && inOldPosition !== undefined && !this.$.animator.isAnimating()) {
			this.$.bar.setPositionImmediate(this.position);
		}
	},
	lockBarChanged: function() {
		if (this.lockBar) {
			this.$.bar.setMaximum(this.maximum);
			this.$.bar.setMinimum(this.minimum);
			this.$.bar.setPositionImmediate(this.position);
		}
	},
	canAnimate: function() {
		return this.inherited(arguments) && this.$.bar.canAnimate();
	},
	beginAnimation: function(inSender, inStart, inEnd) {
		this.inherited(arguments);
		if (this.lockBar) {
			this.$.bar.forceBeginAnimation(inStart, inEnd);
		}
	},
	stepAnimation: function(inSender, inValue) {
		this.inherited(arguments);
		if (this.lockBar) {
			this.$.bar.forceStepAnimation(inValue);
		}
	},
	completeAnimation: function(inSender, inValue) {
		this.inherited(arguments);
		if (this.lockBar) {
			this.$.bar.forceCompleteAnimation(inValue);
		}
	}
});
