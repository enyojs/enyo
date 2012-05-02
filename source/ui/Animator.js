/**
	A basic animation component. Call play to start the animation. The animation will run for
	the period of its duration, measured in milliseconds. The onStep event will fire in quick 
	succession and should be handled to do something based on the value property. The value 
	property will progress from startValue to endValue during the animation based on a 
	the specified function referenced by the easingFunction property. The stop method may
	be called to manually stop an in-progress animation; calling it will fire the onStop event.
	When the animation completes normally, the onEnd event is fired.

	Event handlers may be specified as functions. If so the handler function will be used
	to handle the event directly, without sending the event to its owner or bubbling it.
	The context property can be used to call the supplied event functions in a particular "this" context.
*/
enyo.kind({
	name: "enyo.Animator",
	kind: "Component",
	published: {
		//* Animation duration in milliseconds
		duration: 350, 
		startValue: 0,
		endValue: 1,
		//* node which must be visible in order for the animation to continue
		//* this reference is destroyed when animation ceases
		node: null,
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
	//* Play the animation
	//* inProps {Object} for convenience inProps will be mixed directly into this object.
	play: function(inProps) {
		this.stop();
		if (inProps) {
			enyo.mixin(this, inProps);
		}
		this.t0 = this.t1 = enyo.now();
		this.value = this.startValue;
		this.job = true;
		this.requestNext();
		return this;
	},
	//* Stop the animation; fires the onStop event.
	stop: function() {
		if (this.isAnimating()) {
			this.cancel();
			this.fire("onStop");
			return this;
		}
	},
	//* Returns true if animation is in progress
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
		var f = this.fraction = enyo.easedLerp(this.t0, this.duration, this.easingFunction);
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
