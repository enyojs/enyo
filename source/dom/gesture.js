// gesture feature
/**
 enyo.gesture is an event filter for enyo dispatcher.
 There are no public methods defined here.
 */

//* @public
enyo.gesture = {
	//* @protected
	holdDelay: 200,
	makeEvent: function(inType, inEvent) {
		var e = enyo.clone(inEvent);
		e.type = inType;
		return e;
	},
	down: function(inEvent) {
		var e = this.makeEvent("down", inEvent);
		enyo.dispatch(e);
		this.dispatchTarget = e.dispatchTarget;
		this.beginHold(e);
	},
	up: function(inEvent) {
		this.cancelHold();
		var e = this.makeEvent("up", inEvent);
		var tapPrevented = false;
		e.preventTap = function() {
			tapPrevented = true;
		};
		enyo.dispatch(e);
		if (!tapPrevented) {
			this.sendTap(e);
		}
	},
	move: function(inEvent) {
		this.cancelHold();
		enyo.dispatch(this.makeEvent("move", inEvent));
	},
	over: function(inEvent) {
		enyo.dispatch(this.makeEvent("enter", inEvent));
	},
	out: function(inEvent) {
		enyo.dispatch(this.makeEvent("leave", inEvent));
	},
	beginHold: function(inEvent) {
		this.holdStart = new Date().getTime();
		this.holdJob = setInterval(enyo.bind(this, "sendHold", inEvent), this.holdDelay);
	},
	cancelHold: function() {
		clearInterval(this.holdJob);
		this.holdJob = null;
	},
	sendHold: function(e) {
		e.holdTime = new Date().getTime() - this.holdStart;
		enyo.dispatch(this.makeEvent("hold", e));
	},
	sendTap: function(e) {
		// The common ancestor for the down/up pair is the origin for the tap event
		var p = this.findCommonAncestor(this.dispatchTarget, e.dispatchTarget);
		var t = p && p.hasNode();
		if (t) {
			enyo.dispatch({type: "tap", target: t});
		}
	},
	findCommonAncestor: function(inA, inB) {
		var p = inB;
		while (p) {
			if (inA.isDescendantOf(p)) {
				return p;
			}
			p = p.parent;
		}
	},
	// FIXME: tbd
	sendFlick: function(inEvent) {
		enyo.dispatch(this.makeEvent("flick", inEvent));
	}
};

//* @protected
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
}