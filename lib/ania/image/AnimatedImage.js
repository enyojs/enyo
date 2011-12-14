/**
A control that animates based on its CSS background image.
The className property should refer to a valid CSS class that defines a background image.

The background image should be constructed so that it contains a series of animation
frames stacked vertically.
The imageHeight property should be set to the height of an animation frame, and 
imageCount should be set to the number of frames.

The tick property changes animation speed by controlling the number of
milliseconds between frames. Use the repeat property to set the number of times
the animation should repeat. The default value of 0 indicates that the animation
should repeat indefinitely.

Here's an example:

	{kind: "AnimatedImage", className: "snoopyAnimation", imageHeight: "200", imageCount: "10"}

Call the start method to start the animation and the stop method to stop it:

	startButtonClick: function() {
		this.$.animatedImage.start();
	},
	stopButtonClick: function() {
		this.$.animatedImage.stop();
	}
*/

enyo.kind({
	name: "enyo.AnimatedImage",
	kind: enyo.Control,
	published: {
		imageCount: 0,
		imageHeight: 32,
		tick: 0,
		duration: 350,
		repeat: -1,
		easingFunc: enyo.easing.linear
	},
	//* @protected
	// flyweight safe animation
	playAnimation: function() {
		//this.log();
		if (this.hasNode()) {
			this.stop();
			//
			var a = this.createComponent({
				kind: "Animator",
				repeat: this.repeat,
				easingFunc: this.easingFunc,
				onAnimate: "stepAnimation",
				onStop: "stopAnimation",
				node: this.node,
				tick: this.tick,
				duration: this.duration,
				style: this.node.style
			});
			a.play();
			this.node.animation = a;
		}
	},
	stopAnimation: function(inSender) {
		inSender.node.animation = null;
		inSender.destroy();
	},
	stepAnimation: function(inSender, inValue, inProgress) {
		var i = Math.round(inProgress * (this.imageCount-1));
		var ypos = -i * this.imageHeight;
		var v = "0px " + ypos + "px";
		var ds = this.domStyles;
		ds["background-position"] = inSender.style.backgroundPosition = v;
	},
	//* @public
	//* Start the animation
	start: function() {
		this.playAnimation();
	},
	//* Stop the animation
	stop: function() {
		if (this.hasNode()) {
			var a = this.node.animation;
			if (a) {
				a.stop();
			}
		}
	}
});
