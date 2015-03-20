(function (enyo, scope) {

	enyo.singleton(
		/** @lends enyo.BackgroundTaskManager */ {

		/**
		* @private
		*/
		name: 'enyo.BackgroundTaskManager',

		/**
		* @private
		*/
		kind: 'enyo.Object',

		/**
		* @private
		*/
		fpsThreshold: 55,

		/**
		* @private
		*/
		frameThreshold: 4,

		/**
		* @private
		*/
		customers: [],

		/**
		* @private
		*/
		constructor: enyo.inherit( function (sup) {
			return function () {
				var c, p, f = 0, d = 1000 / this.fpsThreshold;

				sup.apply(this, arguments);

				enyo.System.startIdleCheck();
				enyo.System.addActivityHandler(this.bindSafely(this.pause));

				this.cb = this.bindSafely(function() {
					if (!c) {
						c = enyo.perfNow();
					} else {
						p = c;
						c = enyo.perfNow();
						f = ((c - p) < d) ? f + 1 : 0;
					}
					if (f >= this.frameThreshold && enyo.System.isIdle()) {
						this.run();
						c = p = f = 0;
					} else {
						this.trigger();
					}
				});
			};
		}),

		/**
		* @private
		*/
		trigger: function() {
			enyo.Loop.request(this.cb);
		},

		/**
		* Add a customer to the queue.
		*
		* @param {Object} customer - The item (customer) to add to the queue.
		* @public
		*/
		add: function (customer) {
			// TODO: check if TaskManagerSupport has been mixed-in to this customer object
			return this.customers.push(customer);
		},

		/**
		* Remove a specific customer.
		*
		* @param {Object} customer - The item (customer) to remove from the queue.
		* @public
		*/
		remove: function (customer) {
			var idx = this.customers.indexOf(customer);
			if (idx >= 0) {
				this.customers[idx].pause();
				return this.customers.splice(idx, 1);
			}
		},

		/**
		* Clear the queue of customers.
		*
		* @public
		*/
		clear: function () {
			this.pause(); // pauses(?) any currently executing customers
			this.customers = [];
		},

		/**
		* Iterate through customer queue and pause each customer.
		*
		* @public
		*/
		pause: function () {
			this.paused = true;
			for (var idx = 0; idx < this.customers.length; idx++) {
				this.customers[idx].pause();
			}
		},

		/**
		* Iterate through customer queue and resume each customer.
		*
		* @public
		*/
		resume: function () {
			this.paused = false;
			for (var idx = 0; idx < this.customers.length; idx++) {
				this.customers[idx].resume();
			}
		},

		/**
		* Give each customer a chance to execute once, per run.
		*
		* @private
		*/
		run: function () {
			for (var idx = 0; idx < this.customers.length; idx++) {
				this.customers[idx].run();
			}
		}

	});

})(enyo, this);