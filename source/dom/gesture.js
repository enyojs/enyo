//* @public
/**
 Enyo supports a set of cross-platform gesture events that work similarly on all supported platforms. These events are 
 provided so that users can write a single set of event handlers for applications that run on both mobile and 
 desktop platforms. They are needed because desktop and mobile platforms handle basic gestures differently.
 For example, desktop platforms provide mouse events while mobile platforms support touch events and a limited 
 set of mouse events for backward compatibility.
 
 The following events are available:

 * "down" - generated when the pointer is pressed down.
 * "up" - generated when the pointer is released up.
 * "tap" - genereted when the pointer is pressed down and released up. The target is the lowest dom element that received both 
 the related down and up events.
 * "move" - generated when the pointer moves.
 * "enter" - generated when the pointer enters a dom node.
 * "leave" - generated when the pointer leaves a dom node.
 * "hold" - generated when the pointer is held down without moving for a short period (about 200ms).
 * "release" - generated when the pointer is released after being held down. The target is the same as the hold event.
 * "holdpulse" - generated when the pointer is held down without moving for a short period and periodically thereafter about every 200ms.
 Use this event to trigger an action after an arbitrary period of time. The holdTime property provides the elapsed time.
 * "flick" - generated when the user flicks the pointer quickly. This event provides flick velocity data: xVelocity is the velocity in the horizontal and
 yVelocity is the vertical velocity.

 These events are synthesized from the available dom events and contain these common properties, when available: "target", 
 relatedTarget", "clientX", "clientY", "pageX", "pageY", "screenX", "screenY", "altKey", "ctrlKey", "metaKey", "shiftKey",
"detail", "identifier."

 Please note that enyo's gesture events are generated on enyo controls, not dom elements.

 */
enyo.gesture = {
	//* @protected
	// FIXME: we browser sniff to normalize event mouse button information;
	// need a module for browser info.
	isIE: navigator.userAgent.match("MSIE"),
	holdPulseDelay: 200,
	minFlick: 0.1,
	minTrack: 8,
	eventProps: ["target", "relatedTarget", "clientX", "clientY", "pageX", "pageY", "screenX", "screenY", "altKey", "ctrlKey", "metaKey", "shiftKey",
		"detail", "identifier", "dispatchTarget", "which", "srcEvent"],
	makeEvent: function(inType, inEvent) {
		var e = {type: inType};
		for (var i=0, p; p=this.eventProps[i]; i++) {
			e[p] = inEvent[p];
		}
		e.srcEvent = e.srcEvent || inEvent;
		e.preventNativeDefault = this.preventNativeDefault;
		//
		// normalize event.which
		// Note that while "which" works in IE9, it is broken for mousemove. Therefore, 
		// in IE, use window.event.button
		if (this.isIE) {
			var b = window.event && window.event.button;
			// multi-button not supported, priority: left, right, middle
			// (note: IE bitmask is 1=left, 2=right, 4=center);
			e.which = b & 1 ? 1 : (b & 2 ? 2 : (b & 4 ? 3 : 0));
		}
		return e;
	},
	down: function(inEvent) {
		var e = this.makeEvent("down", inEvent);
		enyo.dispatch(e);
		this.startTracking(e);
		this.target = e.target;
		this.dispatchTarget = e.dispatchTarget;
		this.beginHold(e);
	},
	move: function(inEvent) {
		this.cancelHold();
		var e = this.makeEvent("move", inEvent);
		enyo.dispatch(e);
		// ad hoc: propagate setting to source event.
		inEvent.requireTouchmove = e.requireTouchmove;
		if (this.trackInfo) {
			this.track(e);
		}
	},
	up: function(inEvent) {
		this.cancelHold();
		var e = this.makeEvent("up", inEvent);
		var tapPrevented = false;
		e.preventTap = function() {
			tapPrevented = true;
		};
		this.endTracking(e);
		enyo.dispatch(e);
		if (!tapPrevented) {
			this.sendTap(e);
		}
	},
	startTracking: function(e) {
		this.trackInfo = {};
		this.track(e);
	},
	track: function(inEvent) {
		var ti = this.trackInfo;
		if (ti.d1) {
			ti.d0 = ti.d1;
		}
		ti.d1 = {
			x: inEvent.pageX, 
			y: inEvent.pageY, 
			t: new Date().getTime()
		};
	},
	endTracking: function(e) {
		var ti = this.trackInfo;
		if (ti && ti.d1 && ti.d0) {
			var d1 = ti.d1, d0 = ti.d0;
			// note: important to use up time to reduce flick 
			// velocity based on time between move and up.
			var dt = new Date().getTime() - d0.t;
			var x = (d1.x - d0.x) / dt;
			var y = (d1.y - d0.y) / dt;
			var v = Math.sqrt(x*x + y*y);
			if (v > this.minFlick) {
				this.sendFlick(e, x, y, v);
			}
		}
		this.trackInfo = null;
	},
	over: function(inEvent) {
		enyo.dispatch(this.makeEvent("enter", inEvent));
	},
	out: function(inEvent) {
		enyo.dispatch(this.makeEvent("leave", inEvent));
	},
	beginHold: function(inEvent) {
		this.holdStart = new Date().getTime();
		this.holdJob = setInterval(enyo.bind(this, "sendHoldPulse", inEvent), this.holdPulseDelay);
	},
	cancelHold: function() {
		clearInterval(this.holdJob);
		this.holdJob = null;
		if (this.sentHold) {
			this.sentHold = false;
			this.sendRelease(this.holdEvent);
		}
	},
	sendHoldPulse: function(inEvent) {
		if (!this.sentHold) {
			this.sentHold = true;
			this.sendHold(inEvent);
		}
		var e = this.makeEvent("holdpulse", inEvent);
		e.holdTime = new Date().getTime() - this.holdStart;
		enyo.dispatch(e);
	},
	sendHold: function(inEvent) {
		this.holdEvent = inEvent;
		var e = this.makeEvent("hold", inEvent);
		enyo.dispatch(e);
	},
	sendRelease: function(inEvent) {
		var e = this.makeEvent("release", inEvent);
		enyo.dispatch(e);
	},
	sendTap: function(inEvent) {
		// The common ancestor for the down/up pair is the origin for the tap event
		var t = this.findCommonAncestor(this.target, inEvent.target);
		if (t) {
			var e = this.makeEvent("tap", inEvent);
			e.target = t;
			enyo.dispatch(e);
		}
	},
	findCommonAncestor: function(inA, inB) {
		var p = inB;
		while (p) {
			if (this.isTargetDescendantOf(inA, p)) {
				return p;
			}
			p = p.parentNode;
		}
	},
	isTargetDescendantOf: function(inChild, inParent) {
		var c = inChild;
		while(c) {
			if (c == inParent) {
				return true;
			}
			c = c.parentNode;
		}
	},
	sendFlick: function(inEvent, inX, inY, inV) {
		var e = this.makeEvent("flick", inEvent);
		e.xVelocity = inX;
		e.yVelocity = inY;
		e.velocity = inV;
		e.target = this.target;
		enyo.dispatch(e);
	}
};

//* @protected

// installed on events and called in event context
enyo.gesture.preventNativeDefault = function() {
	if (this.srcEvent) {
		this.srcEvent.preventDefault();
	}
}

enyo.dispatcher.features.push(
	function(e) {
		// NOTE: beware of properties in enyo.gesture inadvertantly mapped to event types
		if (enyo.gesture.events[e.type]) {
			return enyo.gesture.events[e.type](e);
		}
	}
);

enyo.gesture.events = {
	mousedown: function(e) {
		enyo.gesture.down(e);
	},
	mouseup: function(e) {
		enyo.gesture.up(e);
	},
	mousemove:  function(e) {
		enyo.gesture.move(e);
	},
	mouseover:  function(e) {
		enyo.gesture.over(e);
	},
	mouseout:  function(e) {
		enyo.gesture.out(e);
	}
};