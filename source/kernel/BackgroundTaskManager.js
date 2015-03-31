(function (enyo, scope) {

	/**
	* @name enyo.Priorities
	* @enum {Number}
	* @public
	*/
	enyo.Priorities = {

		/**
		* This is effectively the probable-need priority. Any customers who have enqueued a task
		* with this priority will automatically be bumped to the front of the queue.
		*
		* @name enyo.Priorities.SOON
		* @default 1
		*/
		SOON: 1,

		/**
		* This is the default priority and is used to indicate that the execution of the task is not
		* required in the near future.
		*
		* @name enyo.Priorities.SOMETIME
		* @default 5
		*/
		SOMETIME: 5
	};

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

				enyo.SystemMonitor.trigger();
				enyo.SystemMonitor.addHandler(this.bindSafely(this.pause));

				this.cb = this.bindSafely(function() {
					if (!c) {
						c = enyo.perfNow();
					} else {
						p = c;
						c = enyo.perfNow();
						f = ((c - p) < d) ? f + 1 : 0;
					}
					if (f == this.frameThreshold && enyo.SystemMonitor.idle()) {
						this.run();
						c = p = f = 0;
					} else {
						// reset fps check if threshold is met but system is not user-idle
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
		trigger: function() {
			if (this.customers.length) {
				enyo.Loop.request(this.cb);
			}
		},

		/**
		* Add a customer to the queue.
		*
		* @param {Object} customer - The item (customer) to add to the queue.
		* @public
		*/
		add: function (customer) {
			// TODO: check if TaskManagerSupport has been mixed-in to this customer object
			this.customers.push(customer);
			customer.managed = true;
			this.trigger();
		},

		/**
		* Remove a specific customer.
		*
		* @param {Object} customer - The item (customer) to remove from the queue.
		* @public
		*/
		remove: function (customer) {
			var idx = this.customers.indexOf(customer);
			if (idx > -1) {
				customer.cancelTask(); // TODO: should this pause the task instead?
				customer.managed = false;
				this.customers.splice(idx, 1);
			}
			this.trigger();
		},

		/**
		* Clear the queue of customers.
		*
		* @public
		*/
		clear: function () {
			var idx;
			for (idx = 0; idx < this.customers.length; idx++) {
				this.customers[idx].cancelTask(); // TODO: should this pause the task instead?
			}
			this.customers = [];
		},

		/**
		* Iterate through customer queue and pause each customer.
		*
		* @public
		*/
		pause: function () {
			this.paused = true;
			var idx;
			for (idx = 0; idx < this.customers.length; idx++) {
				this.customers[idx].pauseTask();
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
				this.customers[idx].resumeTask();
			}
			this.trigger();
		},

		/**
		* Handle high-priority tasks being added to a given customer.
		*
		* @param {Object} customer - The customer to move to the front of the queue.
		* @public
		*/
		notifyHighPriority: function (customer) {
			var idx = this.customers.indexOf(customer);

			if (idx > -1) {
				this.customers.slice(idx, 1);
				this.customers.unshift(customer);
			}
		},

		/**
		* Give each customer a chance to execute once, per run.
		*
		* @private
		*/
		run: function () {
			var item;

			if (this.customers.length && !this.customers[0].paused) {
				item = this.customers.shift();
				this.customers.push(item); // move item to back of the queue
				item.runTask();
			}

			this.trigger();
		}

	});

})(enyo, this);