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

	These events are synthesized from the available dom events and contain these common properties, when available: "target", 
	relatedTarget", "clientX", "clientY", "pageX", "pageY", "screenX", "screenY", "altKey", "ctrlKey", "metaKey", "shiftKey",
	"detail", "identifier."

	Please note that enyo's gesture events are generated on enyo controls, not dom elements.
*/
enyo.gesture = {
	//* @protected
	eventProps: ["target", "relatedTarget", "clientX", "clientY", "pageX", "pageY", "screenX", "screenY", "altKey", "ctrlKey", "metaKey", "shiftKey",
		"detail", "identifier", "dispatchTarget", "which", "srcEvent"],
	makeEvent: function(inType, inEvent) {
		var e = {type: inType};
		for (var i=0, p; p=this.eventProps[i]; i++) {
			e[p] = inEvent[p];
		}
		e.srcEvent = e.srcEvent || inEvent;
		e.preventDefault = this.preventDefault;
		e.disablePrevention = this.disablePrevention;
		//
		// normalize event.which
		// Note that while "which" works in IE9, it is broken for mousemove. Therefore, 
		// in IE, use window.event.button
		if (enyo.platform.ie) {
			var b = window.event && window.event.button;
			// multi-button not supported, priority: left, right, middle
			// (note: IE bitmask is 1=left, 2=right, 4=center);
			e.which = b & 1 ? 1 : (b & 2 ? 2 : (b & 4 ? 3 : 0));
		}
		return e;
	},
	down: function(inEvent) {
		// cancel any hold since it's possible in corner cases to get a down without an up
		var e = this.makeEvent("down", inEvent);
		enyo.dispatch(e);
		this.downEvent = e;
	},
	move: function(inEvent) {
		var e = this.makeEvent("move", inEvent);
		// include delta and direction v. down info in move event
		e.dx = e.dy = e.horizontal = e.vertical = 0;
		if (e.which && this.downEvent) {
			e.dx = inEvent.clientX - this.downEvent.clientX;
			e.dy = inEvent.clientY - this.downEvent.clientY;
			e.horizontal = Math.abs(e.dx) > Math.abs(e.dy);
			e.vertical = !e.horizontal;
		}
		enyo.dispatch(e);
	},
	up: function(inEvent) {
		var e = this.makeEvent("up", inEvent);
		var tapPrevented = false;
		e.preventTap = function() {
			tapPrevented = true;
		};
		enyo.dispatch(e);
		if (!tapPrevented && this.downEvent && this.downEvent.which == 1) {
			this.sendTap(e);
		}
		this.downEvent = null;
	},
	over: function(inEvent) {
		enyo.dispatch(this.makeEvent("enter", inEvent));
	},
	out: function(inEvent) {
		enyo.dispatch(this.makeEvent("leave", inEvent));
	},
	sendTap: function(inEvent) {
		// The common ancestor for the down/up pair is the origin for the tap event
		var t = this.findCommonAncestor(this.downEvent.target, inEvent.target);
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
	}
};

//* @protected

// installed on events and called in event context
enyo.gesture.preventDefault = function() {
	if (this.srcEvent) {
		this.srcEvent.preventDefault();
	}
};

enyo.gesture.disablePrevention = function() {
	this.preventDefault = enyo.nop;
	if (this.srcEvent) {
		this.srcEvent.preventDefault = enyo.nop;
	}
};

enyo.dispatcher.features.push(
	function(e) {
		// NOTE: beware of properties in enyo.gesture inadvertently mapped to event types
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

// Firefox mousewheel handling
enyo.requiresWindow(function() {
	document.addEventListener("DOMMouseScroll", function(inEvent) {
		var e = enyo.clone(inEvent);
		e.preventDefault = function() {
			inEvent.preventDefault();
		};
		e.type = "mousewheel";
		var p = e.VERTICAL_AXIS == e.axis ? "wheelDeltaY" : "wheelDeltaX";
		e[p] =  e.detail * -12;
		enyo.dispatch(e);
	}, false);
});