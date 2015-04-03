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
			if (idx > -1) {
				enyo.dispatcher.features.splice(idx, 1);
				this.active = false;
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
			return !this.lastActive || enyo.perfNow() - this.lastActive > this.idleThreshold;
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
						Math.abs((ev.clientX - this.lastX) / (enyo.perfNow() - this.lastMouseMove)) * 1000 > this.moveTolerance) {
						this.lastActive = enyo.perfNow();
					}
					this.lastMouseMove = enyo.perfNow();
					this.lastX = ev.clientX;
					this.lastY = ev.clientY;

					break;
				case 'keydown':
					this._idleCheckJob = scope.setTimeout(function () {
						this.lastActive = enyo.perfNow();
						this._idleCheckJob = null;
					}, 32);

					break;
				case 'mousedown':
					this.lastActive = enyo.perfNow();

					break;
			}
		}

	});

})(enyo, this);