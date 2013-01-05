/**
	_enyo.Animator_ is a basic animation component.  Call _play_ to start the
	animation. The animation will run for the period (in milliseconds) specified
	by its _duration_ property.  The _onStep_ event will fire in quick
	succession and should be handled to do something based on the _value_
	property.

	The _value_ property will progress from _startValue_ to _endValue_ during
	the animation based on the function referenced by the _easingFunction_
	property.  The _stop_ method may be called to manually stop an in-progress
	animation; calling it will fire the _onStop_ event.  When an animation
	completes normally, the _onEnd_ event is fired.

	Event handlers may be specified as functions.  If specified, the handler
	function will be used to handle the event directly, without sending the
	event to its owner or bubbling it.  The _context_ property can be used to
	call the supplied event functions in a particular "this" context.
*/
enyo.kind({
	name: "enyo.Animator",
	kind: "Component",
	published: {
		//* Animation duration in milliseconds
		duration: 350,
		//* Value of _value_ property at the beginning of an animation
		startValue: 0,
		//* Value of _value_ property at the end of an animation
		endValue: 1,
		//* Node that must be visible in order for the animation to continue.
		//* This reference is destroyed when the animation ceases.
		node: null,
		//* Function that determines how the animation progresses from
		//* _startValue_ to _endValue_
		easingFunction: enyo.easing.cubicOut
	},
	events: {
		//* Fires when an animation step occurs.
		onStep: "",
		//* Fires when the animation finishes normally.
		onEnd: "",
		//* Fires when the animation is prematurely stopped.
		onStop: ""
	},
	//* @protected
	constructed: function() {
		this.inherited(arguments);
		this._next = enyo.bind(this, "next");
	},
	destroy: function() {
		this.stop();
		this.inherited(arguments);
	},
	//* @public
	//* Plays the animation.
	//* For convenience, _inProps_ will be mixed directly into this object.
	play: function(inProps) {
		this.stop();
		this.reversed = false;
		if (inProps) {
			enyo.mixin(this, inProps);
		}
		this.t0 = this.t1 = enyo.now();
		this.value = this.startValue;
		this.job = true;
		this.next();
		return this;
	},
	//* Stops the animation and fires the _onStop_ event.
	stop: function() {
		if (this.isAnimating()) {
			this.cancel();
			this.fire("onStop");
			return this;
		}
	},
	//* Reverses the direction of a running animation; returns self if animating.
	reverse: function() {
		if (this.isAnimating()) {
			this.reversed = !this.reversed;
			var now = this.t1 = enyo.now();
			// adjust start time (t0) to allow for animation done so far to replay
			var elapsed = now - this.t0;
			this.t0 = now + elapsed - this.duration;
			// swap start and end values
			var startValue = this.startValue;
			this.startValue = this.endValue;
			this.endValue = startValue;
			return this;
		}
	},
	//* Returns true if animation is in progress.
	isAnimating: function() {
		return Boolean(this.job);
	},
	//* @protected
	requestNext: function() {
		this.job = enyo.requestAnimationFrame(this._next, this.node);
	},
	cancel: function() {
		enyo.cancelRequestAnimationFrame(this.job);
		this.node = null;
		this.job = null;
	},
	shouldEnd: function() {
		return (this.dt >= this.duration);
	},
	next: function() {
		this.t1 = enyo.now();
		this.dt = this.t1 - this.t0;
		// time independent
		var f = this.fraction = enyo.easedLerp(this.t0, this.duration, this.easingFunction, this.reversed);
		this.value = this.startValue + f * (this.endValue - this.startValue);
		if (f >= 1 || this.shouldEnd()) {
			this.value = this.endValue;
			this.fraction = 1;
			this.fire("onStep");
			this.fire("onEnd");
			this.cancel();
		} else {
			this.fire("onStep");
			this.requestNext();
		}
	},
	fire: function(inEventName) {
		var fn = this[inEventName];
		if (enyo.isString(fn)) {
			this.bubble(inEventName);
		} else if (fn) {
			fn.call(this.context || window, this);
		}
	}
});
