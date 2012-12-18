//* @protected
enyo.$ = {};

enyo.dispatcher = {
	// these events come from document
	events: ["mousedown", "mouseup", "mouseover", "mouseout", "mousemove", "mousewheel", 
		"click", "dblclick", "change", "keydown", "keyup", "keypress", "input"],
	// these events come from window
	windowEvents: ["resize", "load", "unload", "message"],
	// these events come from css
	cssEvents: ["webkitTransitionEnd"],
	// feature plugins (aka filters)
	features: [],
	connect: function() {
		var d = enyo.dispatcher, i, n;
		for (i=0; (n=d.events[i]); i++) {
			d.listen(document, n);
		}
		for (i=0; (n=d.cssEvents[i]); i++) {
			d.listen(document, n);
		}
		for (i=0; (n=d.windowEvents[i]); i++) {
			// Chrome Packaged Apps don't like "unload"
			if(n === "unload" && 
				(typeof window.chrome === "object") &&
				window.chrome.app) {
				continue;
			}

			d.listen(window, n);
		}
		for (i=0; (n=d.cssEvents[i]); i++) {
			d.listen(document, n);
		}
	},
	listen: function(inListener, inEventName, inHandler) {
		var d = enyo.dispatch;
		if (inListener.addEventListener) {
			this.listen = function(inListener, inEventName, inHandler) {
				inListener.addEventListener(inEventName, inHandler || d, false);
			};
		} else {
			//enyo.log("IE8 COMPAT: using 'attachEvent'");
			this.listen = function(inListener, inEvent, inHandler) {
				inListener.attachEvent("on" + inEvent, function(e) {
					e.target = e.srcElement;
					if (!e.preventDefault) {
						e.preventDefault = enyo.iePreventDefault;
					}
					return (inHandler || d)(e);
				});
			};
		}
		this.listen(inListener, inEventName, inHandler);
	},
	//* Fires an event for Enyo to listen for.
	dispatch: function(e) {
		// Find the control who maps to e.target, or the first control that maps to an ancestor of e.target.
		var c = this.findDispatchTarget(e.target) || this.findDefaultTarget(e);
		// Cache the original target
		e.dispatchTarget = c;
		// support pluggable features return true to abort immediately or set e.preventDispatch to avoid processing.
		for (var i=0, fn; (fn=this.features[i]); i++) {
			if (fn.call(this, e) === true) {
				return;
			}
		}
		if (c && !e.preventDispatch) {
			this.dispatchBubble(e, c);
		}
	},
	//* Takes an Event.target and finds the corresponding Enyo control.
	findDispatchTarget: function(inNode) {
		var t, n = inNode;
		// FIXME: Mozilla: try/catch is here to squelch "Permission denied to access property xxx from a non-chrome context"
		// which appears to happen for scrollbar nodes in particular. It's unclear why those nodes are valid targets if
		// it is illegal to interrogate them. Would like to trap the bad nodes explicitly rather than using an exception block.
		try {
			while (n) {
				if ((t = enyo.$[n.id])) {
					// there could be multiple nodes with this id, the relevant node for this event is n
					// we don't push this directly to t.node because sometimes we are just asking what
					// the target 'would be' (aka, calling findDispatchTarget from handleMouseOverOut)
					t.eventNode = n;
					break;
				}
				n = n.parentNode;
			}
		} catch(x) {
			enyo.log(x, n);
		}
		return t;
	},
	//* Returns the default Enyo control for events.
	findDefaultTarget: function(e) {
		return enyo.master;
	},
	dispatchBubble: function(e, c) {
		return c.bubble("on" + e.type, e, c);
	}
};

// called in the context of an event
enyo.iePreventDefault = function() {
	this.returnValue = false;
};

enyo.dispatch = function(inEvent) {
	return enyo.dispatcher.dispatch(inEvent);
};

enyo.bubble = function(inEvent) {
	// '|| window.event' clause needed for IE8
	var e = inEvent || window.event;
	if (e) {
		// We depend on e.target existing for event tracking and dispatching.
		if (!e.target) {
			e.target = e.srcElement;
		}
		enyo.dispatch(e);
	}
};

// This string is set on event handlers attributes for DOM elements that
// don't normally bubble (like onscroll) so that they can participate in the
// Enyo event system.
enyo.bubbler = "enyo.bubble(arguments[0])";

// The code below helps make Enyo compatible with Google Packages Apps
// Content Security Policy(http://developer.chrome.com/extensions/contentSecurityPolicy.html)
// which, among other things forbids use of inline scripts.
// We replace online scripting with equivalent means, leaving enyo.bubbler
// for backward compatibility.
(function() {
	var bubbleUp = function() {
		enyo.bubble(arguments[0]);
	};

	/**
	 * Makes given events bubble on specified enyo contol
	 */
	enyo.makeBubble = function() {
		var args = Array.prototype.slice.call(arguments, 0),
			control = args.shift();

		if((typeof control === "object") && (typeof control.hasNode === "function")) {
			enyo.forEach(args, function(event) {
				if(this.hasNode()) {
					enyo.dispatcher.listen(this.node, event, bubbleUp);
				}
			}, control);
		}
	};
})();

// FIXME: we need to create and initialize dispatcher someplace else to allow overrides
enyo.requiresWindow(enyo.dispatcher.connect);

// generate a tapped event for a raw-click event
enyo.dispatcher.features.push(
    function (e) {
        if ("click" === e.type) {
            if (e.clientX === 0 && e.clientY === 0) {
                // this allows the click to dispatch as well
                // but note the tap event will fire first
                var cp = enyo.clone(e);
                cp.type = "tap";
                enyo.dispatch(cp);
            }
        }
    }
);
