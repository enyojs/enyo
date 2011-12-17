// gesture feature
/**
 enyo.gesture is an event filter for enyo dispatcher.
 
 This filter monitors DOM events to provide special synthesized events.
 
 * "back" - sent for the back gesture on webOS devices with a gesture area or on the ESC key in browsers
 * "click" - normally, you get the one sent by the system, but you can get a synthetic "click" when a drag has been initiated
 * "dragstart", "dragfinish" - sent for mouse moves that exceed a certain threshhold
 * "drag", "drop" - sent to the original target of the mousemove to inform it about the item being moved over or released over another element
 * "dragover", "dragout" - sent in place of mouseover and mouseout when there is an active drag
 * "mousehold", "mouseholdpulse", and "mouserelease" - sent for mouse moves that stay within the drag threshhold.  Used to implement hold actions.
 
 There are no public methods defined here.
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
		return {
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
			shiftKey: inEvent.shiftKey
		};
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
			e.preventTap();
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
			e.preventTap();
		};
		enyo.dispatch(synth);
	}
};
