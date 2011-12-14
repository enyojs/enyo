//* @protected
enyo.kind({
	name: "enyo.Animation",
	duration: 350,
	tick: 10,
	start: 0,
	end: 100,
	repeat: 0,
	alwaysAnimate: false,
	easingFunc: enyo.easing.linear,
	constructed: function(inProps) {
		enyo.mixin(this, inProps);
		this._stepFunction = enyo.bind(this, "stepFunction");
		this._animate = enyo.bind(this, "animate");
		this._animateTick = enyo.bind(this, "requestFrame");
		this.nextTick = this.tick <= 10 ? this.requestFrame : this.requestDelayedFrame;
	},
	play: function() {
		this.easingFunc = this.easingFunc || enyo.easing.linear;
		this.repeated = 0;
		this.value = this.start;
		if (this.animating) {
			this.stop();
		}
		enyo.call(this, "onBegin", [this.start, this.end]);
		this.t0 = this.t1 = Date.now();
		this.animating = true;
		this.animate();
		return this;
	},
	requestDelayedFrame: function() {
		this.animating = setTimeout(this._animateTick, this.tick);
	},
	requestFrame: function() {
		this.animating = enyo.requestAnimationFrame(this._animate, this.alwaysAnimate ? null : this.node);
	},
	cancelFrame: function() {
		this.animating = enyo.cancelRequestAnimationFrame(this.animating);
	},
	stepFunction: function(inValue) {
		return this.easingFunc(inValue, this);
	},
	stop: function() {
		if (this.animating) {
			clearTimeout(this.animating);
			this.cancelFrame();
			enyo.call(this, "onStop", [this.value, this.start, this.end]);
			return this;
		}
	},
	animate: function() {
		if (!this.animating) {
			// We're already stopped, so return immediately.  This is necessary 
			// because enyo.cancelRequestAnimationFrame() appears to be broken
			// (not enyo's fault, I tried directly using both clearInterval() 
			// and webkitCancelRequestAnimationFrame(), and neither work.
			return;
		}
		var n = Date.now();
		this.dt = n - this.t1;
		this.t1 = n;
		var needsEnd = this.shouldEnd();
		if (needsEnd && this.shouldLoop()) {
			this.loop();
			needsEnd = false;
		}
		// time independent
		var p = enyo.easedLerp(this.t0, this.duration, this._stepFunction);
		this.value = this.start + p * (this.end - this.start);
		if (needsEnd) {
			enyo.call(this, "onAnimate", [this.end, 1]);
			this.stop();
			enyo.call(this, "onEnd", [this.end]);
		} else {
			enyo.call(this, "onAnimate", [this.value, p]);
			this.nextTick();
		}
	},
	shouldEnd: function() {
		return (this.t1 - this.t0 >= this.duration);
	},
	shouldLoop: function() {
		return (this.repeat < 0) || (this.repeated < this.repeat);
	},
	loop: function() {
		this.t0 = this.t1 = Date.now();
		this.repeated++;
	}
});