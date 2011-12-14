//* @public
// This component just runs one animation at a time and exists
// mainly for the ease of setting events.
enyo.kind({
	name: "enyo.Animator",
	kind: enyo.Component,
	published: {
		duration: 350,
		tick: 10,
		repeat: 0,
		easingFunc: enyo.easing.cubicOut,
		//* Always play the animation, even when node is hidden.
		alwaysAnimate: false
	},
	events: {
		onBegin: "",
		onAnimate: "",
		onStop: "",
		onEnd: ""
	},
	//* @protected
	destroy: function() {
		this.stop();
		this.inherited(arguments);
	},
	//* @public
	//* Run animation function, interating from `inStart` to `inEnd` over the animation duration
	play: function(inStart, inEnd) {
		this.stop();
		this._animation = new enyo.Animation({
			duration: this.duration,
			tick: this.tick,
			repeat: this.repeat,
			easingFunc: this.easingFunc,
			start: inStart,
			end: inEnd,
			node: this.node,
			alwaysAnimate: this.alwaysAnimate,
			onBegin: enyo.bind(this, "doBegin"),
			onAnimate: enyo.bind(this, "doAnimate"),
			onStop: enyo.bind(this, "doStop"),
			onEnd: enyo.bind(this, "doEnd")
		});
		this._animation.play();
	},
	//* Stop the animation
	stop: function() {
		if (this._animation) {
			this._animation.stop();
			this._animation = null;
		}
	},
	/** Set the animation to animate over `inNode`
	`InNode` must be visible for the animation to run
	*/
	setNode: function(inNode) {
		this.node = inNode;
		if (this._animation) {
			this._animation.node = inNode;
		}
	},
	//* Return true if the animation is currently playing
	isAnimating: function() {
		return this._animation && this._animation.animating;
	}
});
