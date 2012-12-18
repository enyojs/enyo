/**
	Enyo supports a cross-platform set of drag events.  These events allow users
	to write a single set of event handlers for applications that run on both
	mobile and desktop platforms.

	The following events are provided:

	* "dragstart"
	* "dragfinish"
	* "drag"
	* "drop"
	* "dragover"
	* "dragout"
	* "hold"
	* "release"
	* "holdpulse"
	* "flick"

	For more information on these events, see the documentation on
	[User Input](https://github.com/enyojs/enyo/wiki/User-Input) in the Enyo
	Developer Guide.
*/

//* @protected
enyo.dispatcher.features.push(
	function(e) {
		// NOTE: beware of properties in enyo.gesture inadvertently mapped to event types
		if (enyo.gesture.drag[e.type]) {
			return enyo.gesture.drag[e.type](e);
		}
	}
);

//* @public
enyo.gesture.drag = {
	//* @protected
	hysteresisSquared: 16,
	holdPulseDelay: 200,
	trackCount: 5,
	minFlick: 0.1,
	minTrack: 8,
	down: function(e) {
		// tracking if the mouse is down
		//enyo.log("tracking ON");
		// Note: 'tracking' flag indicates interest in mousemove, it's turned off
		// on mouseup
		// make sure to stop dragging in case the up event was not received.
		this.stopDragging(e);
		this.cancelHold();
		this.target = e.target;
		this.startTracking(e);
		this.beginHold(e);
	},
	move: function(e) {
		if (this.tracking) {
			this.track(e);
			// If the mouse is not down and we're tracking a drag, abort.
			// this error condition can occur on IE/Webkit after interaction with a scrollbar.
			if (!e.which) {
				this.stopDragging(e);
				this.cancelHold();
				this.tracking = false;
				//enyo.log("enyo.gesture.drag: mouse must be down to drag.");
				return;
			}
			if (this.dragEvent) {
				this.sendDrag(e);
			} else if (this.dy*this.dy + this.dx*this.dx >= this.hysteresisSquared) {
				this.sendDragStart(e);
				this.cancelHold();
			}
		}
	},
	up: function(e) {
		this.endTracking(e);
		this.stopDragging(e);
		this.cancelHold();
	},
	leave: function(e) {
		if (this.dragEvent) {
			this.sendDragOut(e);
		}
	},
	stopDragging: function(e) {
		if (this.dragEvent) {
			this.sendDrop(e);
			var handled = this.sendDragFinish(e);
			this.dragEvent = null;
			return handled;
		}
	},
	makeDragEvent: function(inType, inTarget, inEvent, inInfo) {
		var adx = Math.abs(this.dx), ady = Math.abs(this.dy);
		var h = adx > ady;
		// suggest locking if off-axis < 22.5 degrees
		var l = (h ? ady/adx : adx/ady) < 0.414;
		var e = {
			type: inType,
			dx: this.dx,
			dy: this.dy,
			ddx: this.dx - this.lastDx,
			ddy: this.dy - this.lastDy,
			xDirection: this.xDirection,
			yDirection: this.yDirection,
			pageX: inEvent.pageX,
			pageY: inEvent.pageY,
			clientX: inEvent.clientX,
			clientY: inEvent.clientY,
			horizontal: h,
			vertical: !h,
			lockable: l,
			target: inTarget,
			dragInfo: inInfo,
			ctrlKey: inEvent.ctrlKey,
			altKey: inEvent.altKey,
			metaKey: inEvent.metaKey,
			shiftKey: inEvent.shiftKey,
			srcEvent: inEvent.srcEvent
		};
		//Fix for IE8, which doesn't include pageX and pageY properties
		if(enyo.platform.ie==8 && e.target) {
			e.pageX = e.clientX + e.target.scrollLeft;
			e.pageY = e.clientY + e.target.scrollTop;
		}
		e.preventDefault = enyo.gesture.preventDefault;
		e.disablePrevention = enyo.gesture.disablePrevention;
		return e;
	},
	sendDragStart: function(e) {
		//enyo.log("dragstart");
		this.dragEvent = this.makeDragEvent("dragstart", this.target, e);
		enyo.dispatch(this.dragEvent);
	},
	sendDrag: function(e) {
		//enyo.log("sendDrag to " + this.dragEvent.target.id + ", over to " + e.target.id);
		// send dragOver event to the standard event target
		var synth = this.makeDragEvent("dragover", e.target, e, this.dragEvent.dragInfo);
		enyo.dispatch(synth);
		// send drag event to the drag source
		synth.type = "drag";
		synth.target = this.dragEvent.target;
		enyo.dispatch(synth);
	},
	sendDragFinish: function(e) {
		//enyo.log("dragfinish");
		var synth = this.makeDragEvent("dragfinish", this.dragEvent.target, e, this.dragEvent.dragInfo);
		synth.preventTap = function() {
			e.preventTap && e.preventTap();
		};
		enyo.dispatch(synth);
	},
	sendDragOut: function(e) {
		var synth = this.makeDragEvent("dragout", e.target, e, this.dragEvent.dragInfo);
		enyo.dispatch(synth);
	},
	sendDrop: function(e) {
		var synth = this.makeDragEvent("drop", e.target, e, this.dragEvent.dragInfo);
		synth.preventTap = function() {
			e.preventTap && e.preventTap();
		};
		enyo.dispatch(synth);
	},
	startTracking: function(e) {
		this.tracking = true;
		// note: use clientX/Y to be compatible with ie8
		this.px0 = e.clientX;
		this.py0 = e.clientY;
		this.flickInfo = {startEvent: e, moves: []};
		this.track(e);
	},
	track: function(e) {
		this.lastDx = this.dx;
		this.lastDy = this.dy;
		this.dx = e.clientX - this.px0;
		this.dy = e.clientY - this.py0;
		this.xDirection = this.calcDirection(this.dx - this.lastDx, 0);
		this.yDirection = this.calcDirection(this.dy - this.lastDy, 0);
		//
		var ti = this.flickInfo;
		ti.moves.push({
			x: e.clientX, 
			y: e.clientY, 
			t: enyo.now()
		});
		// track specified # of points
		if (ti.moves.length > this.trackCount) {
			ti.moves.shift();
		}
	},
	endTracking: function(e) {
		this.tracking = false;
		var ti = this.flickInfo;
		var moves = ti && ti.moves;
		if (moves && moves.length > 1) {
			// note: important to use up time to reduce flick 
			// velocity based on time between move and up.
			var l = moves[moves.length-1];
			var n = enyo.now();
			// take the greatest of flick between each tracked move and last move
			for (var i=moves.length-2, dt=0, x1=0, y1=0, x=0, y=0, sx=0, sy=0, m; m=moves[i]; i--) {
				// this flick (this move - last move) / (this time - last time)
				dt = n - m.t;
				x1 = (l.x - m.x) / dt;
				y1 = (l.y - m.y) / dt;
				// establish flick direction
				sx = sx || (x1 < 0 ? -1 : (x1 > 0 ? 1 : 0));
				sy = sy || (y1 < 0 ? -1 : (y1 > 0 ? 1 : 0));
				// if either axis is a greater flick than previously recorded use this one
				if ((x1 * sx > x * sx) || (y1 * sy > y * sy)) {
					x = x1;
					y = y1;
				}
			}
			var v = Math.sqrt(x*x + y*y);
			if (v > this.minFlick) {
				// generate the flick using the start event so it has those coordinates
				this.sendFlick(ti.startEvent, x, y, v);
			}
		}
		this.flickInfo = null;
	},
	calcDirection: function(inNum, inDefault) {
		return inNum > 0 ? 1 : (inNum < 0 ? -1 : inDefault);
	},
	beginHold: function(e) {
		this.holdStart = enyo.now();
		this.holdJob = setInterval(enyo.bind(this, "sendHoldPulse", e), this.holdPulseDelay);
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
		var e = enyo.gesture.makeEvent("holdpulse", inEvent);
		e.holdTime = enyo.now() - this.holdStart;
		enyo.dispatch(e);
	},
	sendHold: function(inEvent) {
		this.holdEvent = inEvent;
		var e = enyo.gesture.makeEvent("hold", inEvent);
		enyo.dispatch(e);
	},
	sendRelease: function(inEvent) {
		var e = enyo.gesture.makeEvent("release", inEvent);
		enyo.dispatch(e);
	},
	sendFlick: function(inEvent, inX, inY, inV) {
		var e = enyo.gesture.makeEvent("flick", inEvent);
		e.xVelocity = inX;
		e.yVelocity = inY;
		e.velocity = inV;
		enyo.dispatch(e);
	}
};
