require('enyo');

/**
* Returns the SystemMonitor singleton
* @module enyo/SystemMonitor
*/

var
	kind = require('./kind'),
	dispatcher = require('./dispatcher'),
	utils = require('./utils');

var
	EventEmitter = require('./EventEmitter'),
	CoreObject = require('./CoreObject'),
	Loop = require('./Loop');

module.exports = kind.singleton(
	/** @lends module:enyo/SystemMonitor */ {

	/**
	* @private
	*/
	name: 'enyo.SystemMonitor',

	/**
	* @private
	*/
	kind: CoreObject,

	/**
	* @private
	*/
	mixins: [EventEmitter],

	/**
	* @private
	*/
	fpsThreshold: 55,

	/**
	* @private
	*/
	frameThreshold: 4,

	/**
	* The threshold of pixel movement per second that must be met before we classify mouse
	* movement as such.
	*
	* @type {Number}
	* @default 10
	* @public
	*/
	moveTolerance: 1000,

	/**
	* The threshold amount of time, in ms, for determining if we are in an idle state.
	*
	* @type {Number}
	* @default 2000
	* @public
	*/
	idleThreshold: 2000,

	/**
	* When `true`, we are actively monitoring the system.
	*
	* @type {Boolean}
	* @default false
	* @public
	*/
	active: false,

	/**
	* @method
	* @private
	*/
	constructor: kind.inherit( function (sup) {
		return function () {
			var c, p, f = 0, d = 1000 / this.fpsThreshold;

			this.cb = this.bindSafely(function() {
				if (!c) {
					c = utils.perfNow();
				} else {
					p = c;
					c = utils.perfNow();
					f = ((c - p) < d) ? f + 1 : 0;
				}

				if (f == this.frameThreshold && this.idle()) {
					this.active = false;
					this.emit('idle');
					if (this.listeners('idle').length === 0) {
						var idx = dispatcher.features.indexOf(this.bindSafely(this.checkEvent));
						if (idx > -1) dispatcher.features.splice(idx, 1);
						this.listening = false;
					}
					c = p = f = 0;
				} else {
					if (f == this.frameThreshold) {
						c = p = f = 0;
					}
					this.trigger();
				}
			});
		};
	}),

	/**
	* @private
	*/
	trigger: function () {
		Loop.request(this.cb);
	},

	/**
	* Starts observing the system for idleness.
	*
	* @public
	*/
	start: function () {
		if (!this.listening) {
			this.listening = true;
			dispatcher.features.push(this.bindSafely(this.checkEvent));
		}
		if (!this.active) {
			this.active = true;
			this.trigger();
		}
	},

	/**
	* Determine if the system is idle or not.
	*
	* @return {Boolean} If `true`, the system is idle, `false` otherwise.
	* @public
	*/
	idle: function () {
		// check last idle time with some sensible threshold
		return !this.lastActive || utils.perfNow() - this.lastActive > this.idleThreshold;
	},

	/**
	* Each event is passed through this check to determine if the event corresponds to a
	* pre-defined set of events corresponding to user action.
	*
	* @private
	*/
	checkEvent: function (ev) {
		switch (ev.type) {
			case 'mousemove':
				if (!this.lastMouseMove || !this.lastX || !this.lastY ||
					Math.abs((ev.clientX - this.lastX) / (utils.perfNow() - this.lastMouseMove)) * 1000 > this.moveTolerance) {
					this.lastActive = utils.perfNow();
				}
				this.lastMouseMove = utils.perfNow();
				this.lastX = ev.clientX;
				this.lastY = ev.clientY;

				break;
			case 'keydown':
				this._idleCheckJob = setTimeout(function () {
					this.lastActive = utils.perfNow();
					this._idleCheckJob = null;
				}, 32);

				break;
			case 'mousedown':
				this.lastActive = utils.perfNow();

				break;
		}
	}

});
