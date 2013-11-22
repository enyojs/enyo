(function (enyo) {

	//* @protected
	enyo.$ = {};

	enyo.dispatcher = {
		// these events come from document
		events: ["mousedown", "mouseup", "mouseover", "mouseout", "mousemove", "mousewheel",
			"click", "dblclick", "change", "keydown", "keyup", "keypress", "input",
			"paste", "copy", "cut", "webkitTransitionEnd", "transitionend", "webkitAnimationEnd", "animationEnd"],
		// these events come from window
		windowEvents: ["resize", "load", "unload", "message", "hashchange"],
		// feature plugins (aka filters)
		features: [],
		connect: function() {
			var d = enyo.dispatcher, i, n;
			for (i=0; (n=d.events[i]); i++) {
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
		stopListening: function(inListener, inEventName, inHandler) {
			var d = enyo.dispatch;
			if (inListener.addEventListener) {
				this.stopListening = function(inListener, inEventName, inHandler) {
					inListener.removeEventListener(inEventName, inHandler || d, false);
				};
			} else {
				//enyo.log("IE8 COMPAT: using 'detachEvent'");
				this.stopListening = function(inListener, inEvent, inHandler) {
					inListener.detachEvent("on" + inEvent, inHandler || d);
				};
			}
			this.stopListening(inListener, inEventName, inHandler);
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
				return this.dispatchBubble(e, c);
			}
		},
		//* Takes an event target and finds the corresponding Enyo control.
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
		findDefaultTarget: function() {
			return enyo.master;
		},
		dispatchBubble: function(e, c) {
			var type = e.type;
			type = e.customEvent ? type : "on" + type;
			return c.bubble(type, e, c);
		}
	};

	// Called in the context of an event
	enyo.iePreventDefault = function() {
		try {
			this.returnValue = false;
		}
		catch(e) {
			// do nothing
		}
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

	// The code below helps make Enyo compatible with Google Packaged Apps
	// Content Security Policy(http://developer.chrome.com/extensions/contentSecurityPolicy.html),
	// which, among other things, forbids the use of inline scripts.
	// We replace online scripting with equivalent means, leaving enyo.bubbler
	// for backward compatibility.
	(function() {
		var bubbleUp = function() {
			enyo.bubble(arguments[0]);
		};

		/**
			Makes given events bubble on a specified Enyo control.
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
		/**
			Removes the event listening and bubbling initiated by _enyo.makeBubble()_
			on a specific control.
		 */
		enyo.unmakeBubble = function() {
			var args = Array.prototype.slice.call(arguments, 0),
				control = args.shift();

			if((typeof control === "object") && (typeof control.hasNode === "function")) {
				enyo.forEach(args, function(event) {
					if(this.hasNode()) {
						enyo.dispatcher.stopListening(this.node, event, bubbleUp);
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
					cp.preventDefault = enyo.nop;
					enyo.dispatch(cp);
				}
			}
		}
	);

	/**
		Instead of having multiple _features_ pushed and handled in separate methods
		for these events we will handle them uniformly here to expose as accurate as
		possible the last known interaction coordinates.
	*/
	var _xy = {};
	enyo.dispatcher.features.push(
		function (e) {
			if (
				(e.type == "mousemove")  ||
				(e.type == "tap")        ||
				(e.type == "click")      ||
				(e.type == "touchmove")
			) {
				_xy.clientX = e.clientX;
				_xy.clientY = e.clientY;
				// note only ie8 does not support pageX/pageY
				_xy.pageX   = e.pageX;
				_xy.pageY   = e.pageY;
				// note ie8 and opera report these values incorrectly
				_xy.screenX = e.screenX;
				_xy.screenY = e.screenY;
			}
		}
	);
	//*@public
	/**
		Retrieve the last known coordinates of the cursor or user-interaction point
		in _touch_ environments. Returns an immutable object with the _clientX, clientY_,
		_pageX, pageY_ and _screenX, screenY_ properties. It is important to note that
		IE 8 and Opera have improper reporting for the _screenX, screenY_
		properties (they both use CSS pixels as opposed to device pixels) and IE8 has no
		support for the _pageX, pageY_ properties so they are facaded.
	*/
	enyo.getPosition = function () {
		var p = enyo.clone(_xy);
		// if we are in ie8 we facade the _pageX, pageY_ properties
		if (enyo.platform.ie < 9) {
			var d = (document.documentElement || document.body.parentNode || document.body);
			p.pageX = (p.clientX + d.scrollLeft);
			p.pageY = (p.clientY + d.scrollTop);
		}
		return p;
	};
	
})(enyo);
