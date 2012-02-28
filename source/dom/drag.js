/**
 Enyo supports a cross-platform set of drag events. These events are provide to allow a single set of event handlers to be
 written for all supports platforms, desktop and mobile alike. The following events are provided:
 
 * "dragstart", "dragfinish" - sent for pointer moves that exceed a certain threshhold
 * "drag", "drop" - sent to the original target of the pointer move to inform it about the item being moved over or released over another element
 * "dragover", "dragout" - sent in addition to over and out when there is an active drag
 * 
 * Note: on Android, touchmove event must be prevented via inEvent.preventDefault() or will not fire more than once and enyo dragging system
 * will not function correctly.
 */

//* @protected
enyo.dispatcher.features.push(
	function(e) {
		// NOTE: beware of properties in enyo.gesture inadvertantly mapped to event types
		if (enyo.gesture.drag[e.type]) {
			return enyo.gesture.drag[e.type](e);
		}
	}
);

//* @public
enyo.gesture.drag = {
	//* @protected
	hysteresis: 4,
	down: function(e) {
		// tracking if the mouse is down
		//console.log("tracking ON");
		// Note: 'tracking' flag indicates interest in mousemove, it's turned off
		// on mouseup
		// make sure to stop dragging in case the up event was not received.
		this.stopDragging(e);
		this.tracking = true;
		this.target = e.target;
		this.dispatchTarget = e.dispatchTarget;
		this.targetEvent = e;
		this.px0 = e.pageX;
		this.py0 = e.pageY;
	},
	move: function(e) {
		if (this.tracking) {
			this.dx = e.pageX - this.px0;
			this.dy = e.pageY - this.py0;
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
			} else if (Math.sqrt(this.dy*this.dy + this.dx*this.dx) >= this.hysteresis) {
				this.sendDragStart(e);
			}
		}
	},
	up: function(e) {
		this.tracking = false;
		this.stopDragging(e);
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
	}
};
