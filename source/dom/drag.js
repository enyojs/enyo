/**
 Enyo supports a cross-platform set of drag events. These events are provide to allow a single set of event handlers to be
 written for all supports platforms, desktop and mobile alike. The following events are provided:
 
 * "dragstart", "dragfinish" - sent for pointer moves that exceed a certain threshhold
 * "drag", "drop" - sent to the original target of the pointer move to inform it about the item being moved over or released over another element
 * "dragover", "dragout" - sent in addition to over and out when there is an active drag
 
 * "hold" - generated when the pointer is held down without moving for a short period (about 200ms).
 * "release" - generated when the pointer is released after being held down, or the pointer is moved off of the node while still held down. The target is the same as the hold event.
 * "holdpulse" - generated when the pointer is held down without moving for a short period and periodically thereafter about every 200ms.
 Use this event to trigger an action after an arbitrary period of time. The holdTime property provides the elapsed time.
 * "flick" - generated when the user flicks the pointer quickly. This event provides flick velocity data: xVelocity is the velocity in the horizontal and
 yVelocity is the vertical velocity.

 * Note: on Android, touchmove event must be prevented via inEvent.preventDefault() or will not fire more than once and enyo dragging system
 * will not function correctly.
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
	minFlick: 0.1,
	minTrack: 8,
	down: function(e) {
		// tracking if the mouse is down
		//console.log("tracking ON");
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
				this.tracking = false;
				console.log("enyo.gesture.drag: mouse must be down to drag.");
				return;
			}
			if (this.dragEvent) {
				this.sendDrag(e);
			} else if (this.dy*this.dy + this.dx*this.dx >= this.hysteresisSquared) {
				this.sendDragStart(e);
				e.requireTouchmove = this.dragEvent.requireTouchmove;
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
		e.preventNativeDefault = enyo.gesture.preventNativeDefault;
		return e;
	},
	sendDragStart: function(e) {
		//console.log("dragstart");
		this.dragEvent = this.makeDragEvent("dragstart", this.target, e);
		enyo.dispatch(this.dragEvent);
	},
	sendDrag: function(e) {
		//console.log("sendDrag to " + this.dragEvent.target.id + ", over to " + e.target.id);
		// send dragOver event to the standard event target
		var synth = this.makeDragEvent("dragover", e.target, e, this.dragEvent.dragInfo);
		enyo.dispatch(synth);
		// send drag event to the drag source
		synth.type = "drag";
		synth.target = this.dragEvent.target;
		enyo.dispatch(synth);
	},
	sendDragFinish: function(e) {
		//console.log("dragfinish");
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
		this.flickInfo = {startEvent: e};
		this.track(e);
	},
	track: function(e) {
		this.dx = e.clientX - this.px0;
		this.dy = e.clientY - this.py0;
		//
		var ti = this.flickInfo;
		if (ti.d1) {
			ti.d0 = ti.d1;
		}
		ti.d1 = {
			x: e.clientX, 
			y: e.clientY, 
			t: enyo.now()
		};
	},
	endTracking: function(e) {
		this.tracking = false;
		var ti = this.flickInfo;
		if (ti && ti.d1 && ti.d0) {
			var d1 = ti.d1, d0 = ti.d0;
			// note: important to use up time to reduce flick 
			// velocity based on time between move and up.
			var dt = enyo.now() - d0.t;
			var x = (d1.x - d0.x) / dt;
			var y = (d1.y - d0.y) / dt;
			var v = Math.sqrt(x*x + y*y);
			if (v > this.minFlick) {
				// generate the flick using the start event so it has those coordinates
				this.sendFlick(ti.startEvent, x, y, v);
			}
		}
		this.flickInfo = null;
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
