/**
* Contains dispatcher methods
* @module enyo/dispatcher
* @private
*/
require('enyo');

var
	logger = require('./logger'),
	master = require('./master'),
	utils = require('./utils'),
	platform = require('./platform');

var
	Dom = require('./dom');

/**
 * An [object]{@glossary Object} describing the the last known coordinates of the cursor or
 * user-interaction point in touch environments.
 *
 * @typedef {Object} module:enyo/dispatcher~CursorCoordinates
 * @property {Number} clientX - The horizontal coordinate within the application's client area.
 * @property {Number} clientY - The vertical coordinate within the application's client area.
 * @property {Number} pageX - The X coordinate of the cursor relative to the viewport, including any
 *   scroll offset.
 * @property {Number} pageY - The Y coordinate of the cursor relative to the viewport, including any
 *   scroll offset.
 * @property {Number} screenX - The X coordinate of the cursor relative to the screen, not including
 *   any scroll offset.
 * @property {Number} screenY - The Y coordinate of the cursor relative to the screen, not including
 *   any scroll offset.
 */

/**
* @private
*/

/**
* @private
*/
var dispatcher = module.exports = dispatcher = {

	$: {},

	/**
	* These events come from document
	*
	* @private
	*/
	events: ["mousedown", "mouseup", "mouseover", "mouseout", "mousemove", "mousewheel",
		"click", "dblclick", "change", "keydown", "keyup", "keypress", "input",
		"paste", "copy", "cut", "webkitTransitionEnd", "transitionend", "webkitAnimationEnd", "animationend",
		"webkitAnimationStart", "animationstart", "webkitAnimationIteration", "animationiteration"],

	/**
	* These events come from window
	*
	* @private
	*/
	windowEvents: ["resize", "load", "unload", "message", "hashchange", "popstate", "focus", "blur"],

	/**
	* Feature plugins (aka filters)
	*
	* @private
	*/
	features: [],

	/**
	* @private
	*/
	connect: function() {
		var d = dispatcher, i, n;
		for (i=0; (n=d.events[i]); i++) {
			d.listen(document, n);
		}
		for (i=0; (n=d.windowEvents[i]); i++) {
			// Chrome Packaged Apps don't like "unload"
			if(n === "unload" &&
				(typeof global.chrome === "object") &&
				global.chrome.app) {
				continue;
			}

			d.listen(window, n);
		}
	},

	/**
	* @private
	*/
	listen: function(inListener, inEventName, inHandler) {
		if (inListener.addEventListener) {
			this.listen = function(inListener, inEventName, inHandler) {
				inListener.addEventListener(inEventName, inHandler || dispatch, false);
			};
		} else {
			//enyo.log("IE8 COMPAT: using 'attachEvent'");
			this.listen = function(inListener, inEvent, inHandler) {
				inListener.attachEvent("on" + inEvent, function(e) {
					e.target = e.srcElement;
					if (!e.preventDefault) {
						e.preventDefault = this.iePreventDefault;
					}
					return (inHandler || dispatch)(e);
				});
			};
		}
		this.listen(inListener, inEventName, inHandler);
	},

	/**
	* @private
	*/
	stopListening: function(inListener, inEventName, inHandler) {
		if (inListener.addEventListener) {
			this.stopListening = function(inListener, inEventName, inHandler) {
				inListener.removeEventListener(inEventName, inHandler || dispatch, false);
			};
		} else {
			//enyo.log("IE8 COMPAT: using 'detachEvent'");
			this.stopListening = function(inListener, inEvent, inHandler) {
				inListener.detachEvent("on" + inEvent, inHandler || dispatch);
			};
		}
		this.stopListening(inListener, inEventName, inHandler);
	},

	/**
	* Fires an event for Enyo to listen for.
	*
	* @private
	*/
	dispatch: function(e) {
		// Find the control who maps to e.target, or the first control that maps to an ancestor of e.target.
		var c = this.findDispatchTarget(e.target) || this.findDefaultTarget();
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

	/**
	* Takes an event target and finds the corresponding Enyo control.
	*
	* @private
	*/
	findDispatchTarget: function(inNode) {
		var t, n = inNode;
		// FIXME: Mozilla: try/catch is here to squelch "Permission denied to access property xxx from a non-chrome context"
		// which appears to happen for scrollbar nodes in particular. It's unclear why those nodes are valid targets if
		// it is illegal to interrogate them. Would like to trap the bad nodes explicitly rather than using an exception block.
		try {
			while (n) {
				if ((t = this.$[n.id])) {
					// there could be multiple nodes with this id, the relevant node for this event is n
					// we don't push this directly to t.node because sometimes we are just asking what
					// the target 'would be' (aka, calling findDispatchTarget from handleMouseOverOut)
					t.eventNode = n;
					break;
				}
				n = n.parentNode;
			}
		} catch(x) {
			logger.log(x, n);
		}
		return t;
	},

	/**
	* Returns the default Enyo control for events.
	*
	* @private
	*/
	findDefaultTarget: function() {
		return master;
	},

	/**
	* @private
	*/
	dispatchBubble: function(e, c) {
		var type = e.type;
		type = e.customEvent ? type : "on" + type;
		return c.bubble(type, e, c);
	}
};

/**
* Called in the context of an event.
*
* @private
*/
dispatcher.iePreventDefault = function() {
	try {
		this.returnValue = false;
	}
	catch(e) {
		// do nothing
	}
};

/**
* @private
*/
function dispatch (inEvent) {
	return dispatcher.dispatch(inEvent);
}

/**
* @private
*/
dispatcher.bubble = function(inEvent) {
	// '|| window.event' clause needed for IE8
	var e = inEvent || global.event;
	if (e) {
		// We depend on e.target existing for event tracking and dispatching.
		if (!e.target) {
			e.target = e.srcElement;
		}
		dispatcher.dispatch(e);
	}
};

// This string is set on event handlers attributes for DOM elements that
// don't normally bubble (like onscroll) so that they can participate in the
// Enyo event system.
dispatcher.bubbler = "enyo.bubble(arguments[0])";

// The code below helps make Enyo compatible with Google Packaged Apps
// Content Security Policy(http://developer.chrome.com/extensions/contentSecurityPolicy.html),
// which, among other things, forbids the use of inline scripts.
// We replace online scripting with equivalent means, leaving enyo.bubbler
// for backward compatibility.
(function() {
	var bubbleUp = function() {
		dispatcher.bubble(arguments[0]);
	};

	/**
	* Makes given events bubble on a specified Enyo control.
	*
	* @private
	*/
	dispatcher.makeBubble = function() {
		var args = Array.prototype.slice.call(arguments, 0),
			control = args.shift();

		if((typeof control === "object") && (typeof control.hasNode === "function")) {
			utils.forEach(args, function(event) {
				if(this.hasNode()) {
					dispatcher.listen(this.node, event, bubbleUp);
				}
			}, control);
		}
	};

	/**
	* Removes the event listening and bubbling initiated by
	* [enyo.makeBubble()]{@link enyo.makeBubble} on a specific control.
	*
	* @private
	*/
	dispatcher.unmakeBubble = function() {
		var args = Array.prototype.slice.call(arguments, 0),
			control = args.shift();

		if((typeof control === "object") && (typeof control.hasNode === "function")) {
			utils.forEach(args, function(event) {
				if(this.hasNode()) {
					dispatcher.stopListening(this.node, event, bubbleUp);
				}
			}, control);
		}
	};
})();

/**
* @private
*/
// FIXME: we need to create and initialize dispatcher someplace else to allow overrides
Dom.requiresWindow(dispatcher.connect);

/**
* Generates a tapped event for a raw-click event.
*
* @private
*/
dispatcher.features.push(
	function (e) {
		if ("click" === e.type) {
			if (e.clientX === 0 && e.clientY === 0 && !e.detail) {
				// this allows the click to dispatch as well
				// but note the tap event will fire first
				var cp = utils.clone(e);
				cp.type = "tap";
				cp.preventDefault = utils.nop;
				dispatcher.dispatch(cp);
			}
		}
	}
);

/**
* Instead of having multiple `features` pushed and handled in separate methods
* for these events, we handle them uniformly here to expose the last known
* interaction coordinates as accurately as possible.
*
* @private
*/
var _xy = {};
dispatcher.features.push(
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

/**
* Retrieves the last known coordinates of the cursor or user-interaction point
* in touch environments. Returns an immutable object with the `clientX`,
* `clientY`, `pageX`, `pageY`, `screenX`, and `screenY` properties. It is
* important to note that IE8 and Opera have improper reporting for the
* `screenX` and `screenY` properties (they both use CSS pixels as opposed to
* device pixels) and IE8 has no support for the `pageX` and `pageY` properties,
* so they are facaded.
*
* @returns {module:enyo/dispatcher~CursorCoordinates} An [object]{@glossary Object} describing the
*	the last known coordinates of the cursor or user-interaction point in touch environments.
* @public
*/
dispatcher.getPosition = function () {
	var p = utils.clone(_xy);
	// if we are in ie8 we facade the _pageX, pageY_ properties
	if (platform.ie < 9) {
		var d = (document.documentElement || document.body.parentNode || document.body);
		p.pageX = (p.clientX + d.scrollLeft);
		p.pageY = (p.clientY + d.scrollTop);
	}
	return p;
};


/**
* Key mapping feature: Adds a `keySymbol` property to key [events]{@glossary event},
* based on a global key mapping. Use
* [enyo.dispatcher.registerKeyMap()]{@link enyo.dispatcher.registerKeyMap} to add
* keyCode-to-keySymbol mappings via a simple hash. This method may be called
* multiple times from different libraries to mix different maps into the global
* mapping table; if conflicts arise, the last-in wins.
*
* ```
* enyo.dispatcher.registerKeyMap({
* 	415 : 'play',
* 	413 : 'stop',
* 	19  : 'pause',
* 	412 : 'rewind',
* 	417 : 'fastforward'
* });
* ```
* 
* @private
*/
dispatcher.features.push(function(e) {
	if ((e.type === 'keydown') || (e.type === 'keyup') || (e.type === 'keypress')) {
		e.keySymbol = this.keyMap[e.keyCode];
		// Dispatch key events to be sent via Signals
		var c = this.findDefaultTarget();
		if (e.dispatchTarget !== c) {
			this.dispatchBubble(e, c);
		}
	}
});

utils.mixin(dispatcher, {
	keyMap: {},
	registerKeyMap: function(map) {
		utils.mixin(this.keyMap, map);
	}
});


/**
* Event modal capture feature. Capture events to a specific control via
* [enyo.dispatcher.capture(inControl, inShouldForward)]{@linkcode enyo.dispatcher.capture};
* release events via [enyo.dispatcher.release()]{@link enyo.dispatcher.release}.
*
* @private
*/
dispatcher.features.push(function(e) {
	if (this.captureTarget) {
		var c = e.dispatchTarget;
		var eventName = (e.customEvent ? '' : 'on') + e.type;
		var handlerName = this.captureEvents[eventName];
		var handlerScope = this.captureHandlerScope || this.captureTarget;
		var handler = handlerName && handlerScope[handlerName];
		var shouldCapture = handler && !(c && c.isDescendantOf && c.isDescendantOf(this.captureTarget));
		if (shouldCapture) {
			var c1 = e.captureTarget = this.captureTarget;
			// NOTE: We do not want releasing capture while an event is being processed to alter
			// the way the event propagates. Therefore decide if the event should forward
			// before the capture target receives the event (since it may release capture).
			e.preventDispatch = handler && handler.apply(handlerScope, [c1, e]) && !this.autoForwardEvents[e.type];
		}
	}
});

//
//        NOTE: This object is a plug-in; these methods should
//        be called on `enyo.dispatcher`, and not on the plug-in itself.
//
utils.mixin(dispatcher, {

	/**
	* @private
	*/
	autoForwardEvents: {leave: 1, resize: 1},

	/**
	* @private
	*/
	captures: [],

	/** 
	* Captures [events]{@glossary event} for `inTarget`, where `inEvents` is specified as a
	* hash of event names mapped to callback handler names to be called on `inTarget` (or,
	* optionally, `inScope`). The callback is called when any of the captured events are
	* dispatched outside of the capturing control. Returning `true` from the callback stops
	* dispatch of the event to the original `dispatchTarget`.
	*
	* @private
	*/
	capture: function(inTarget, inEvents, inScope) {
		var info = {target: inTarget, events: inEvents, scope: inScope};
		this.captures.push(info);
		this.setCaptureInfo(info);
	},

	/**
	* Removes the specified target from the capture list.
	* 
	* @private
	*/
	release: function(inTarget) {
		for (var i = this.captures.length - 1; i >= 0; i--) {
			if (this.captures[i].target === inTarget) {
				this.captures.splice(i,1);
				this.setCaptureInfo(this.captures[this.captures.length-1]);
				break;
			}
		}
	},

	/**
	* Sets the information for a captured {@glossary event}.
	* 
	* @private
	*/
	setCaptureInfo: function(inInfo) {
		this.captureTarget = inInfo && inInfo.target;
		this.captureEvents = inInfo && inInfo.events;
		this.captureHandlerScope = inInfo && inInfo.scope;
	}
});


(function () {
	/**
	* Dispatcher preview feature
	* 
	* Allows {@link module:enyo/Control~Control} ancestors of the {@glossary event} target
	* a chance (eldest first) to react by implementing `previewDomEvent`.
	*
	* @private
	*/
	var fn = 'previewDomEvent';
	var preview = 
		/** @lends enyo.dispatcher.features */ {

		/**
		* @private
		*/
		feature: function(e) {
			preview.dispatch(e, e.dispatchTarget);
		},

		/**
		* @returns {(Boolean|undefined)} Handlers return `true` to abort preview and prevent default
		*	event processing.
		*
		* @private
		*/
		dispatch: function(evt, control) {
			var i, l,
			lineage = this.buildLineage(control);
			for (i=0; (l=lineage[i]); i++) {
				if (l[fn] && l[fn](evt) === true) {
					evt.preventDispatch = true;
					return;
				}
			}
		},

		/**
		* We ascend, making a list of Enyo [controls]{@link module:enyo/Control~Control}.
		*
		* Note that a control is considered to be its own ancestor.
		*
		* @private
		*/
		buildLineage: function(control) {
			var lineage = [],
				c = control;
			while (c) {
				lineage.unshift(c);
				c = c.parent;
			}
			return lineage;
		}
	};

	dispatcher.features.push(preview.feature);
})();
