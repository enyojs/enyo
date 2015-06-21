var
	dom = require('../dom'),
	platform = require('../platform'),
	utils = require('../utils');

/**
* Used internally by {@link module:enyo/gesture}
*
* @module enyo/gesture/util
* @private
*/
module.exports = {

	/**
	* @private
	*/
	eventProps: ['target', 'relatedTarget', 'clientX', 'clientY', 'pageX', 'pageY',
		'screenX', 'screenY', 'altKey', 'ctrlKey', 'metaKey', 'shiftKey',
		'detail', 'identifier', 'dispatchTarget', 'which', 'srcEvent'],

	/**
	* Creates an {@glossary event} of type `type` and returns it.
	* `evt` should be an event [object]{@glossary Object}.
	*
	* @param {String} type - The type of {@glossary event} to make.
	* @param {(Event|Object)} evt - The event you'd like to clone or an object that looks like it.
	* @returns {Object} The new event [object]{@glossary Object}.
	* @public
	*/
	makeEvent: function(type, evt) {
		var e = {};
		e.type = type;
		for (var i=0, p; (p=this.eventProps[i]); i++) {
			e[p] = evt[p];
		}
		e.srcEvent = e.srcEvent || evt;
		e.preventDefault = this.preventDefault;
		e.disablePrevention = this.disablePrevention;

		if (dom._bodyScaleFactorX !== 1 || dom._bodyScaleFactorY !== 1) {
			// Intercept only these events, not all events, like: hold, release, tap, etc,
			// to avoid doing the operation again.
			if (e.type == 'move' || e.type == 'up' || e.type == 'down' || e.type == 'enter' || e.type == 'leave') {
				e.clientX *= dom._bodyScaleFactorX;
				e.clientY *= dom._bodyScaleFactorY;
			}
		}
		//
		// normalize event.which and event.pageX/event.pageY
		// Note that while 'which' works in IE9, it is broken for mousemove. Therefore,
		// in IE, use global.event.button
		if (platform.ie < 10) {
			//Fix for IE8, which doesn't include pageX and pageY properties
			if(platform.ie==8 && e.target) {
				e.pageX = e.clientX + e.target.scrollLeft;
				e.pageY = e.clientY + e.target.scrollTop;
			}
			var b = global.event && global.event.button;
			if (b) {
				// multi-button not supported, priority: left, right, middle
				// (note: IE bitmask is 1=left, 2=right, 4=center);
				e.which = b & 1 ? 1 : (b & 2 ? 2 : (b & 4 ? 3 : 0));
			}
		} else if (platform.webos || global.PalmSystem) {
			// Temporary fix for owos: it does not currently supply 'which' on move events
			// and the user agent string doesn't identify itself so we test for PalmSystem
			if (e.which === 0) {
				e.which = 1;
			}
		}
		return e;
	},

	/**
	* Installed on [events]{@glossary event} and called in event context.
	*
	* @private
	*/
	preventDefault: function() {
		if (this.srcEvent) {
			this.srcEvent.preventDefault();
		}
	},

	/**
	* @private
	*/
	disablePrevention: function() {
		this.preventDefault = utils.nop;
		if (this.srcEvent) {
			this.srcEvent.preventDefault = utils.nop;
		}
	}
};
