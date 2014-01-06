/**
	_enyo.common.Slider_ is the base kind for stylized slider controls that live in external
	sources. It contains common properties/methods that are shared between multiple
	libraries.

	It is not intended for an _enyo.common.Slider_ to be used directly. For use cases,
	refer to the implementation in <a href="#onyx.Slider">onyx.Slider</a>.
*/
enyo.kind({
	name: "enyo.common.Slider",
	kind: "enyo.common.ProgressBar",
	published: {
		//* Position of slider, expressed as an integer between 0 and 100,
		//* inclusive
		value: 0,
		//* If true, current progress will be styled differently from rest of bar
		lockBar: true,
		//* If true, tapping on bar will change current position
		tappable: true
	},
	events: {
		//* Fires when bar position is set. The _value_ property contains the
		//* new position.
		onChange: "",
		//* Fires while control knob is being dragged. The _value_ property
		//* contains the current position.
		onChanging: "",
		//* Fires when animation to a position finishes.
		onAnimateFinish: ""
	},
	//* If true, stripes are shown in the slider bar
	showStripes: false,
	//* @protected
	handlers: {
		ondragstart: "dragstart",
		ondrag: "drag",
		ondragfinish: "dragfinish"
	},
	moreComponents: [
		{kind: "Animator", onStep: "animatorStep", onEnd: "animatorComplete"},
		{classes: "enyo-slider-taparea"},
		{name: "knob", classes: "enyo-slider-knob"}
	],
	create: function() {
		this.inherited(arguments);

		// add handlers for up/down events on knob for pressed state (workaround for inconsistent (timing-wise) active:hover styling)
		this.moreComponents[2].ondown = "knobDown";
		this.moreComponents[2].onup = "knobUp";

		this.createComponents(this.moreComponents);
		this.valueChanged();
	},
	valueChanged: function() {
		this.value = this.clampValue(this.min, this.max, this.value);
		var p = this.calcPercent(this.value);
		this.updateKnobPosition(p);
		if (this.lockBar) {
			this.setProgress(this.value);
		}
	},
	updateKnobPosition: function(inPercent) {
		this.$.knob.applyStyle("left", inPercent + "%");
	},
	calcKnobPosition: function(inEvent) {
		var x = inEvent.clientX - this.hasNode().getBoundingClientRect().left;
		return (x / this.getBounds().width) * (this.max - this.min) + this.min;
	},
	dragstart: function(inSender, inEvent) {
		if (inEvent.horizontal) {
			inEvent.preventDefault();
			this.dragging = true;
			inSender.addClass("pressed");
			return true;
		}
	},
	drag: function(inSender, inEvent) {
		if (this.dragging) {
			var v = this.calcKnobPosition(inEvent);
			v = (this.increment) ? this.calcIncrement(v) : v;
			this.setValue(v);
			this.doChanging({value: this.value});
			return true;
		}
	},
	dragfinish: function(inSender, inEvent) {
		this.dragging = false;
		inEvent.preventTap();
		this.doChange({value: this.value});
		inSender.removeClass("pressed");
		return true;
	},
	tap: function(inSender, inEvent) {
		if (this.tappable) {
			var v = this.calcKnobPosition(inEvent);
			v = (this.increment) ? this.calcIncrement(v) : v;
			this.tapped = true;
			this.animateTo(v);
			return true;
		}
	},
	knobDown: function(inSender, inEvent) {
		this.$.knob.addClass("pressed");
	},
	knobUp: function(inSender, inEvent) {
		this.$.knob.removeClass("pressed");
	},
	//* @public
	//* Animates to the given value.
	animateTo: function(inValue) {
		this.$.animator.play({
			startValue: this.value,
			endValue: inValue,
			node: this.hasNode()
		});
	},
	//* @protected
	animatorStep: function(inSender) {
		this.setValue(inSender.value);
		return true;
	},
	animatorComplete: function(inSender) {
		if (this.tapped) {
			this.tapped = false;
			this.doChange({value: this.value});
		}
		this.doAnimateFinish(inSender);
		return true;
	}
});
