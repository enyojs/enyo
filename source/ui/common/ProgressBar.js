/**
	_enyo.common.ProgressBar_ is the base kind for stylized progress-bar controls that live in external
	sources. It contains common properties/methods that are shared between multiple
	libraries.

	It is not intended for an _enyo.common.ProgressBar_ to be used directly. For use cases,
	refer to the implementation in <a href="#onyx.ProgressBar">onyx.ProgressBar</a>.
*/
enyo.kind({
	name: "enyo.common.ProgressBar",
	published: {
		//* Current position of progress bar
		progress: 0,
		//* Minimum progress value (i.e., no progress made)
		min: 0,
		//* Maximum progress value (i.e., process complete)
		max: 100,
		//* CSS classes to apply to progress bar
		barClasses: "",
		//* If true, stripes are shown in progress bar
		showStripes: true,
		//* If true (and _showStripes_ is true), stripes shown in progress bar
		//* are animated
		animateStripes: true,
		//* Value increment that a sliders can be "snapped to" in either direction
		increment: 0
	},
	events: {
		//* Fires when progress bar finishes animating to a position.
		onAnimateProgressFinish: ""
	},
	//* @protected
	_barClasses: "",
	components: [
		{name: "progressAnimator", kind: "enyo.Animator", onStep: "progressAnimatorStep", onEnd: "progressAnimatorComplete"},
		{name: "bar"}
	],
	create: function() {
		this.inherited(arguments);
		this.setInitialBarClasses();
		this.progressChanged();
		this.barClassesChanged();
		this.showStripesChanged();
		this.animateStripesChanged();
	},
	setInitialBarClasses: function() {
		this.$.bar.addClass(this._barClasses);
	},
	barClassesChanged: function(inOld) {
		this.$.bar.removeClass(inOld);
		this.$.bar.addClass(this.barClasses);
	},
	showStripesChanged: function() {
		this.$.bar.addRemoveClass("striped", this.showStripes);
	},
	animateStripesChanged: function() {
		this.$.bar.addRemoveClass("animated", this.animateStripes);
	},
	progressChanged: function() {
		this.progress = this.clampValue(this.min, this.max, this.progress);
		var p = this.calcPercent(this.progress);
		this.updateBarPosition(p);
	},
	calcIncrement: function(inValue) {
		return (Math.round(inValue / this.increment) * this.increment);
	},
	clampValue: function(inMin, inMax, inValue) {
		return Math.max(inMin, Math.min(inValue, inMax));
	},
	calcRatio: function(inValue) {
		return (inValue - this.min) / (this.max - this.min);
	},
	calcPercent: function(inValue) {
		return this.calcRatio(inValue) * 100;
	},
	updateBarPosition: function(inPercent) {
		this.$.bar.applyStyle("width", inPercent + "%");
	},
	//* @public
	//* Animates progress to the given value.
	animateProgressTo: function(inValue) {
		this.$.progressAnimator.play({
			startValue: this.progress,
			endValue: inValue,
			node: this.hasNode()
		});
	},
	//* @protected
	progressAnimatorStep: function(inSender) {
		this.setProgress(inSender.value);
		return true;
	},
	progressAnimatorComplete: function(inSender) {
		this.doAnimateProgressFinish(inSender);
		return true;
	}
});
