(function (enyo, scope) {

	enyo.singleton(
		/** @lends enyo.SystemMonitor */ {

		/**
		* @private
		*/
		name: 'enyo.SystemMonitor',

		/**
		* @private
		*/
		kind: 'enyo.Object',

		/**
		* The threshold of pixel movement per second that must be met before we classify mouse
		* movement as such.
		*
		* @type {Number}
		* @default 10
		* @public
		*/
		moveTolerance: 100,

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
		* @private
		*/
		userEvents: [
			'mousemove',
			'tap'
		],

		/**
		* @private
		*/
		activityHandlers: [],

		/**
		* @private
		*/
		components: [
			{kind: 'enyo.Signals', onkeydown: 'handleUserAction'}
		],

		/**
		* Starts observing the system for idleness.
		*
		* @public
		*/
		trigger: function () {
			enyo.dispatcher.features.push(this.bindSafely(this.checkEvent));
			this.active = true;
		},

		/**
		* Ends observation of the system for idleness.
		*
		* @public
		*/
		stop: function () {
			var idx = enyo.dispatcher.features.indexOf(this.bindSafely(this.checkEvent));
			enyo.dispatcher.features.splice(idx, 1);
			this.active = false;
		},

		/**
		* Determine if the system is idle or not.
		*
		* @return {Boolean} If `true`, the system is idle, `false` otherwise.
		* @public
		*/
		idle: function () {
			// TODO check framerate, mouse movement, etc.
			// check last idle time with some sensible threshold
			return !this.lastActive || enyo.perfNow() - this.lastActive > this.idleThreshold;
		},

		/**
		* @private
		*/
		handleUserAction: function () {
			this._idleCheckJob = scope.setTimeout(function () {
				this.lastActive = enyo.perfNow();
				this._idleCheckJob = null;
			}, 32);
		},

		/**
		* @private
		*/
		checkEvent: function (ev) {
			if (this.userEvents.indexOf(ev.type) >= 0) {
				if (ev.type == 'mousemove') {
					if (!this.lastMouseMove || !this.lastX || !this.lastY ||
						Math.abs((ev.clientX - this.lastX) / (enyo.perfNow() - this.lastMouseMove)) * 1000 > this.moveTolerance) {
						this.lastActive = enyo.perfNow();
					}
					this.lastMouseMove = enyo.perfNow();
					this.lastX = ev.clientX;
					this.lastY = ev.clientY;
				} else {
					this.lastActive = enyo.perfNow();
				}
			}
		}

	});

})(enyo, this);