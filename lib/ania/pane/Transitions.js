//* @protected
enyo.transitions = {};

//* @public
/**
	A transition between two controls with no delay and no effect.
*/
enyo.kind({
	name: "enyo.transitions.Simple",
	//* @protected
	kind: enyo.Component,
	viewChanged: function(inFromView, inToView) {
		this.fromView = inFromView;
		this.toView = inToView;
		this.begin();
	},
	isTransitioningView: function(inView) {
		return (inView == this.fromView) || (inView == this.toView);
	},
	begin: function() {
		var t1 = this.pane.transitioneeForView(this.fromView);
		if (t1) {
			t1.hide();
		}
		var t2 = this.pane.transitioneeForView(this.toView);
		if (t2) {
			t2.show();
		}
		this.done();
	},
	done: function() {
		this.pane.transitionDone(this.fromView, this.toView);
	}
});

//* @public
/**
	A transition between two controls that animates the new control sliding in from the right or left.
*/
enyo.kind({
	name: "enyo.transitions.LeftRightFlyin",
	//* @protected
	kind: enyo.transitions.Simple,
	duration: 300,
	begin: function() {
		var style0, style1;
		var c = this.pane.transitioneeForView(this.fromView);
		if (c && c.hasNode()) {
			style1 = c.node.style;
			style1.zIndex = 1;
		}
		var c1 = this.pane.transitioneeForView(this.toView);
		if (c1 && c1.hasNode()) {
			style0 = c1.node.style;
			style0.zIndex = 2;
			style0.display = "";
		}
		var l = this.pane.hasNode().offsetWidth;
		if (style0) {
			this.flyin("left", l, 0, this.duration, style0, style1);
			/*
			if (this.pane.indexOfView(this.toView) > this.pane.indexOfView(this.fromView)) {
				style0.right = "";
				this.flyin("left", l, 0, this.duration, style0, style1);
			} else {
				style0.left = "";
				this.flyin("right", l, 0, this.duration, style0, style1);
			}
			*/
		}
	},
	flyin: function(inCoord, inStart, inEnd, inDuration, inStyle0, inStyle1) {
		var d = inEnd - inStart;
		var self = this;
		var t0 = -1;
		var fn = function() {
			if (t0 == -1) {
				t0 = new Date().getTime();
			}
			var eased = enyo.easedLerp(t0, inDuration, enyo.easing.cubicOut);
			var p = inStart + eased*d;
			inStyle0[inCoord] = Math.max(p, 0) + "px";
			if (eased < 1) {
				self.handle = setTimeout(fn, 30);
			} else {
				if (inStyle1) {
					inStyle1.display = "none";
				}
				self.done();
			}
		};
		inStyle0[inCoord] = Math.max(inStart, 0) + "px";
		// allow browser to adapt to changes above before starting animation timer
		// otherwise (on slower devices) the adaptation time is conflated with the 
		// first frame and the animation is not smooth
		this.handle = setTimeout(fn, 10);
	},
	done: function() {
		clearTimeout(this.handle);
		// in case we had overlapping animations, make sure we end up with the right guy displayed
		var c = this.pane.transitioneeForView(this.fromView);
		if (c && c.hasNode()) {
			var s = c.node.style;
			s.left = "";
			s.right = "0px";
			s.display = "";
			s.zIndex = null;
			s.top = null;
		}
		this.inherited(arguments);
	}
});

//* @public
/**
	A transition between two controls that animates a fade between them.
*/
enyo.kind({
	name: "enyo.transitions.Fade",
	//* @protected
	kind: enyo.transitions.Simple,
	duration: 300,
	begin: function() {
		var c = this.pane.transitioneeForView(this.fromView);
		if (c && c.hasNode()) {
			var style0 = c.node.style;
			style0.zIndex = 1;
		}
		var c1 = this.pane.transitioneeForView(this.toView);
		if (c1 && c1.hasNode()) {
			var style1 = c1.node.style;
			style1.zIndex = 2;
			style1.opacity = 0.0;
			style1.display = "";
		}

		if (style0 && style1) {
			this.fade(this.duration, style0, style1);
		} else {
			this.done();
		}
	},
	fade: function(inDuration, inStyle0, inStyle1) {
		var self = this;
		var t0 = -1;
		var fn = function() {
			if (t0 == -1) {
				t0 = new Date().getTime();
			}
			var eased = enyo.easedLerp(t0, inDuration, enyo.easing.cubicOut);
			inStyle1.opacity = eased;
			if (eased < 1) {
				self.handle = setTimeout(fn, 1);
			} else {
				if (inStyle0) {
					inStyle0.display = "none";
				}
				self.done();
			}
		};
		// allow browser to adapt to changes above before starting animation timer
		// otherwise (on slower devices) the adaptation time is conflated with the 
		// first frame and the animation is not smooth
		this.handle = setTimeout(fn, 10);
	},
	done: function() {
		clearTimeout(this.handle);
		// in case we had overlapping animations, make sure we end up with the right guy displayed
		var c = this.pane.transitioneeForView(this.toView);
		if (c && c.hasNode()) {
			var s = c.node.style;
			s.position = null;
			s.display = "";
			s.zIndex = null;
			s.opacity = null;
			s.top = null;
		}
		this.inherited(arguments);
	}
});