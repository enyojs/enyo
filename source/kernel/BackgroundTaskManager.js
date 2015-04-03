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

				this.cb = this.bindSafely(function() {
					if (this.customers.length) {
						if (!enyo.SystemMonitor.active) {
							enyo.SystemMonitor.trigger();
						}

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

					} else if (enyo.SystemMonitor.active) {
						enyo.SystemMonitor.stop();
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
			this.customers.push(customer);
			customer.managed = true;
			customer.on('priorityChanged', this.notifyPriority, this);
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
				customer.off('priorityChanged', this.notifyPriority, this);
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
		* Determines whether the priority of the last task added to a given customer is urgent
		* enough to move the customer to the front of the queue.
		*
		* @param {Object} customer - The customer which has had a change in priority for one of its
		*	tasks.
		* @param {Number} priority - The priority that will be checked for urgency.
		* @private
		*/
		notifyPriority: function (customer, priority) {
			var idx;

			if (priority == enyo.Priorities.SOON) {
				idx = this.customers.indexOf(customer);

				if (idx > -1) {
					this.customers.slice(idx, 1);
					this.customers.unshift(customer);
				}
			}
		},

		/**
		* Give the next customer a chance to execute a single task.
		*
		* @private
		*/
		run: function () {
			var item;

			if (!this.customers[0].paused) {
				item = this.customers.shift();
				this.customers.push(item); // move item to back of the queue
				item.runTask();
			}

			this.trigger();
		}

	});

})(enyo, this);