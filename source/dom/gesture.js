//* @public
/**
	Enyo supports a set of normalized events that work similarly across	all
	supported platforms. These events are provided so that users can write a
	single set of event handlers for applications that run on both mobile and
	desktop platforms.  They are needed because desktop and mobile platforms
	handle basic input differently.

	For more information on normalized input events and their associated
	properties,	see	the documentation on [User Input](building-apps/user-input.html)
	in the Enyo Developer Guide.
*/
enyo.gesture = {
	//* @protected
	eventProps: ["target", "relatedTarget", "clientX", "clientY", "pageX", "pageY",
		"screenX", "screenY", "altKey", "ctrlKey", "metaKey", "shiftKey",
		"detail", "identifier", "dispatchTarget", "which", "srcEvent"],
	makeEvent: function(inType, inEvent) {
		var e = {};
		e.type = inType;
		for (var i=0, p; (p=this.eventProps[i]); i++) {
			e[p] = inEvent[p];
		}
		e.srcEvent = e.srcEvent || inEvent;
		e.preventDefault = this.preventDefault;
		e.disablePrevention = this.disablePrevention;
		//
		// normalize event.which and event.pageX/event.pageY
		// Note that while "which" works in IE9, it is broken for mousemove. Therefore,
		// in IE, use window.event.button
		if (enyo.platform.ie < 10) {
			//Fix for IE8, which doesn't include pageX and pageY properties
			if(enyo.platform.ie==8 && e.target) {
				e.pageX = e.clientX + e.target.scrollLeft;
				e.pageY = e.clientY + e.target.scrollTop;
			}
			var b = window.event && window.event.button;
			if (b) {
				// multi-button not supported, priority: left, right, middle
				// (note: IE bitmask is 1=left, 2=right, 4=center);
				e.which = b & 1 ? 1 : (b & 2 ? 2 : (b & 4 ? 3 : 0));
			}
		} else if (enyo.platform.webos || window.PalmSystem) {
			// Temporary fix for owos: it does not currently supply 'which' on move events
			// and the user agent string doesn't identify itself so we test for PalmSystem
			if (e.which === 0) {
				e.which = 1;
			}
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
		var e = this.makeEvent("enter", inEvent);
		enyo.dispatch(e);
	},
	out: function(inEvent) {
		var e = this.makeEvent("leave", inEvent);
		enyo.dispatch(e);
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
	if (document.addEventListener) {
		document.addEventListener("DOMMouseScroll", function(inEvent) {
			var e = enyo.clone(inEvent);
			e.preventDefault = function() {
				inEvent.preventDefault();
			};
			e.type = "mousewheel";
			var p = e.VERTICAL_AXIS == e.axis ? "wheelDeltaY" : "wheelDeltaX";
			e[p] =  e.detail * -40;
			enyo.dispatch(e);
		}, false);
	}
});
