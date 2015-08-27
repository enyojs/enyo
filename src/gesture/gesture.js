require('enyo');
/**
 * @module enyo/gesture
 */


var
	dispatcher = require('../dispatcher'),
	dom = require('../dom'),
	platform = require('../platform'),
	utils = require('../utils');

var
	drag = require('./drag'),
	touchGestures = require('./touchGestures'),
	gestureUtil = require('./util');


/**
* Enyo supports a set of normalized events that work similarly across all supported platforms.
* These events are provided so that users can write a single set of event handlers for
* applications that run on both mobile and desktop platforms. They are needed because desktop
* and mobile platforms handle basic input differently.
*
* For more information on normalized input events and their associated properties, see the
* documentation on [Event Handling]{@linkplain $dev-guide/key-concepts/event-handling.html}
* in the Enyo Developer Guide.
*
* @module enyo/gesture
* @public
*/
var gesture = module.exports = {
	/**
	* Handles "down" [events]{@glossary event}, including `mousedown` and `keydown`. This is
	* responsible for the press-and-hold key repeater.
	*
	* @param {Event} evt - The standard {@glossary event} [object]{glossary Object}.
	* @public
	*/
	down: function(evt) {
		var e = gestureUtil.makeEvent('down', evt);

		// prepare for hold
		drag.prepareHold(e);

		// enable prevention of tap event
		e.preventTap = function() {
			e._tapPrevented = true;
		};

		dispatcher.dispatch(e);
		this.downEvent = e;

		// start hold, now that control has had a chance
		// to override the holdPulse configuration
		drag.beginHold(e);
	},

	/**
	* Handles `mousemove` [events]{@glossary event}.
	*
	* @param {Event} evt - The standard {@glossary event} [object]{glossary Object}.
	* @public
	*/
	move: function(evt) {
		var e = gestureUtil.makeEvent('move', evt);
		// include delta and direction v. down info in move event
		e.dx = e.dy = e.horizontal = e.vertical = 0;
		if (e.which && this.downEvent) {
			e.dx = evt.clientX - this.downEvent.clientX;
			e.dy = evt.clientY - this.downEvent.clientY;
			e.horizontal = Math.abs(e.dx) > Math.abs(e.dy);
			e.vertical = !e.horizontal;
		}
		dispatcher.dispatch(e);
	},

	/**
	* Handles "up" [events]{@glossary event}, including `mouseup` and `keyup`.
	*
	* @param {Event} evt - The standard {@glossary event} [object]{glossary Object}.
	* @public
	*/
	up: function(evt) {
		var e = gestureUtil.makeEvent('up', evt);

		// We have added some logic to synchronize up and down events in certain scenarios (i.e.
		// clicking multiple buttons with a mouse) and to generally guard against any potential
		// asymmetry, but a full solution would be to maintain a map of up/down events as an 
		// ideal solution, for future work.
		e._tapPrevented = this.downEvent && this.downEvent._tapPrevented && this.downEvent.which == e.which;
		e.preventTap = function() {
			e._tapPrevented = true;
		};

		dispatcher.dispatch(e);
		if (!e._tapPrevented && this.downEvent && this.downEvent.which == 1) {
			var target = this.findCommonAncestor(this.downEvent.target, evt.target);

			// the common ancestor of the down/up events is the target of the tap
			if(target) {
				if(this.supportsDoubleTap(target)) {
					this.doubleTap(e, target);
				} else {
					this.sendTap(e, target);
				}
			}
		}
		if (this.downEvent && this.downEvent.which == e.which) {
			this.downEvent = null;
		}
	},

	/**
	* Handles `mouseover` [events]{@glossary event}.
	*
	* @param {Event} evt - The standard {@glossary event} [object]{glossary Object}.
	* @public
	*/
	over: function(evt) {
		var e = gestureUtil.makeEvent('enter', evt);
		dispatcher.dispatch(e);
	},

	/**
	* Handles `mouseout` [events]{@glossary event}.
	*
	* @param {Event} evt - The standard {@glossary event} [object]{glossary Object}.
	* @public
	*/
	out: function(evt) {
		var e = gestureUtil.makeEvent('leave', evt);
		dispatcher.dispatch(e);
	},

	/**
	* Generates `tap` [events]{@glossary event}.
	*
	* @param {Event} evt - The standard {@glossary event} [object]{glossary Object}.
	* @public
	*/
	sendTap: function(evt, target) {
		var e = gestureUtil.makeEvent('tap', evt);
		e.target = target;
		dispatcher.dispatch(e);
	},

	/**
	* @private
	*/
	tapData: {
		id: null,
		timer: null,
		start: 0
	},

	/**
	* Global configuration for double tap support. If this is true, all tap events for Controls
	* that do not have {@link module:enyo/Control~Control#doubleTapEnabled} explicitly set to false will be
	* delayed by the {@link module:enyo/Control~Control#doubleTapInterval}.
	*
	* @type {Boolean}
	* @default  false
	* @public
	*/
	doubleTapEnabled: false,

	/**
	* Determines if the provided target node supports double tap events
	*
	* @param {Node} target
	* @return {Boolean}
	* @private
	*/
	supportsDoubleTap: function(target) {
		var obj = dispatcher.findDispatchTarget(target);

		if(obj) {
			// Control.doubleTapEnabled is a tri-value property. The default is 'inherit'
			// which takes its cue from gesture's doubleTapEnabled. Values of true or false
			// override the default. So, if the global is true, any truthy value on Control
			// results in true. If the global is false, only an explicit true on Control
			// results in true.
			return this.doubleTapEnabled? !!obj.doubleTapEnabled : obj.doubleTapEnabled === true;
		} else {
			return false;
		}
	},

	/**
	* @private
	*/
	doubleTap: function(evt, t) {
		var obj = dispatcher.findDispatchTarget(t);

		if(this.tapData.id !== obj.id) {	// this is the first tap
			this.resetTapData(true);

			this.tapData.id = obj.id;
			this.tapData.event = evt;
			this.tapData.target = t;
			this.tapData.timer = setTimeout(utils.bind(this, "resetTapData", true), obj.doubleTapInterval);
			this.tapData.start = utils.perfNow();
		} else {							// this is the double tap
			var e2 = gestureUtil.makeEvent('doubletap', evt);
			e2.target = t;
			e2.tapInterval = utils.perfNow() - this.tapData.start;
			this.resetTapData(false);
			dispatcher.dispatch(e2);
		}
	},

	resetTapData: function(sendTap) {
		var data = this.tapData;

		if(sendTap && data.id) {
			this.sendTap(data.event, data.target);
		}

		clearTimeout(data.timer);
		data.id = data.start = data.event = data.target = data.timer = null;
	},

	/**
	* Given two [DOM nodes]{@glossary Node}, searches for a shared ancestor (looks up
	* the hierarchic [DOM]{@glossary DOM} tree of [nodes]{@glossary Node}). The shared
	* ancestor node is returned.
	*
	* @param {Node} controlA - Control one.
	* @param {Node} controlB - Control two.
	* @returns {(Node|undefined)} The shared ancestor.
	* @public
	*/
	findCommonAncestor: function(controlA, controlB) {
		var p = controlB;
		while (p) {
			if (this.isTargetDescendantOf(controlA, p)) {
				return p;
			}
			p = p.parentNode;
		}
	},

	/**
	* Given two controls, returns `true` if the `child` is inside the `parent`.
	*
	* @param {Node} child - The child to search for.
	* @param {Node} parent - The expected parent.
	* @returns {(Boolean|undefined)} `true` if the `child` is actually a child of `parent`.
	*/
	isTargetDescendantOf: function(child, parent) {
		var c = child;
		while(c) {
			if (c == parent) {
				return true;
			}
			c = c.parentNode;
		}
	},

	/**
	* @todo I'd rather refine the public API of gesture rather than simply forwarding the internal
	*   drag module but this will work in the interim. - ryanjduffy
	* 
	* Known Consumers:
	*  - Spotlight.onAcceleratedKey - (prepare|begin|end)Hold()
	*  - Moonstone - configureHoldPulse()
	*/
	drag: drag
};

/**
* Contains various methods for gesture events.
*
* @type {object}
* @public
*/
module.exports.events = {
	/**
	* Shortcut to [gesture.down()]{@link module:enyo/gesture#down}.
	*
	* @memberof! module:enyo/gesture#
	* @method events.mousedown
	* @public
	*/
	mousedown: function(e) {
		gesture.down(e);
	},

	/**
	* Shortcut to [gesture.up()]{@link module:enyo/gesture#up}.
	*
	* @memberof! module:enyo/gesture#
	* @method events.mouseup
	* @public
	*/
	mouseup: function(e) {
		gesture.up(e);
	},

	/**
	* Shortcut to [gesture.move()]{@link module:enyo/gesture#move}.
	*
	* @memberof! module:enyo/gesture#
	* @method events.mousemove
	* @public
	*/
	mousemove:  function(e) {
		gesture.move(e);
	},

	/**
	* Shortcut to [gesture.over()]{@link module:enyo/gesture#over}.
	*
	* @memberof! module:enyo/gesture#
	* @method events.mouseover
	* @public
	*/
	mouseover:  function(e) {
		gesture.over(e);
	},

	/**
	* Shortcut to [gesture.out()]{@link module:enyo/gesture#out}.
	*
	* @memberof! module:enyo/gesture#
	* @method events.mouseout
	* @public
	*/
	mouseout:  function(e) {
		gesture.out(e);
	}
};

// Firefox mousewheel handling
dom.requiresWindow(function() {
	if (document.addEventListener) {
		document.addEventListener('DOMMouseScroll', function(inEvent) {
			var e = utils.clone(inEvent);
			e.preventDefault = function() {
				inEvent.preventDefault();
			};
			e.type = 'mousewheel';
			var p = e.VERTICAL_AXIS == e.axis ? 'wheelDeltaY' : 'wheelDeltaX';
			e[p] =  e.detail * -40;
			dispatcher.dispatch(e);
		}, false);
	}
});

/**
* @private
*/
var handlers = {
	touchstart: true,
	touchmove: true,
	touchend: true
};

/**
* @private
*/
dispatcher.features.push(function (e) {
	var type = e.type;

	// NOTE: beware of properties in gesture.events and drag inadvertently mapped to event types
	if (gesture.events[type]) {
		gesture.events[type](e);
	}
	if (!platform.gesture && platform.touch && handlers[type]) {
		touchGestures[type](e);
	}
	if (drag[type]) {
		drag[type](e);
	}
});
