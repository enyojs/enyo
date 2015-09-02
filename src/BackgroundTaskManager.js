require('enyo');

/**
* Returns the BackgroundTaskManager singleton.
* @module enyo/BackgroundTaskManager
*/

var
	kind = require('./kind');

var
	CoreObject = require('./CoreObject'),
	SystemMonitor = require('./SystemMonitor'),
	Loop = require('./Loop'),
	Priorities = require('./PriorityQueue').Priorities;

module.exports = kind.singleton(
	/** @lends module:enyo/BackgroundTaskManager */ {

	/**
	* @private
	*/
	name: 'enyo.BackgroundTaskManager',

	/**
	* @private
	*/
	kind: CoreObject,

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
	namedCustomers: {},

	/**
	* @private
	*/
	currentIndex: 0,

	/**
	* @private
	*/
	constructor: kind.inherit( function (sup) {
		return function () {
			sup.apply(this, arguments);

			SystemMonitor.on('idle', this.notifyIdle, this);

			this.cb = function () {
				SystemMonitor.start();
			};
		};
	}),

	/**
	* @private
	*/
	trigger: function () {
		if (this.hasActiveTasks()) Loop.request(this.cb);
	},

	/**
	* Add a customer to the queue.
	*
	* @param {Object} customer - The item (customer) to add to the queue.
	* @param {String} nom - The name of the customer for later reference.
	* @public
	*/
	add: function (customer, nom) {
		this.namedCustomers[nom] = customer;
		this.customers.push(customer);
		customer.set('managed', true);
		customer.on('priorityChanged', this.notifyPriority, this);

		this.trigger();
	},

	/**
	* Remove a specific customer.
	*
	* @param {String} nom - The name of the customer to remove from the queue.
	* @public
	*/
	remove: function (nom) {
		var customer = this.namedCustomers[nom],
			idx;

		if (customer) {
			customer.off('priorityChanged', this.notifyPriority, this);
			customer.cancelTask(); // TODO: should this pause the task instead?
			customer.set('managed', false);

			idx = this.customers.indexOf(customer);
			if (idx > -1) {
				this.customers.splice(idx, 1);

				if (idx < this.currentIndex || (idx && idx == this.customers.length)) {
					this.currentIndex--;
				}
			}

			delete this.namedCustomers[nom];
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
		this.namedCustomers = {};
		this.currentIndex = 0;
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
	* Retrieves a customer by name.
	*
	* @param {String} nom - The name of the customer.
	* @returns {Object} The customer that was originally added with the passed-in name.
	* @public
	*/
	getCustomer: function (nom) {
		return this.namedCustomers[nom];
	},

	/**
	* Determines whether any of our customers has a task.
	*
	* @returns {Boolean} If `true`, we have at least one customer with a task; `false` otherwise.
	* @private
	*/
	hasActiveTasks: function () {
		for (var idx = 0; idx < this.customers.length; idx++) {
			if (this.customers[idx].hasTasks()) return true;
		}
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

		if (priority == Priorities.SOON) {
			idx = this.customers.indexOf(customer);

			if (idx > -1) {
				this.customers.slice(idx, 1);
				this.customers.unshift(customer);
			}
		}

		this.trigger();
	},

	/**
	* Handler for when the system is idle, whereupon we allow the next customer to run a task.
	*
	* @private
	*/
	notifyIdle: function () {
		this.run();
	},

	/**
	* Give the next customer a chance to execute a single task.
	*
	* @private
	*/
	run: function () {
		var customer = this.customers[this.currentIndex],
			nextIndex = this.currentIndex + 1;

		if (customer.hasTasks()) {
			customer.runTask();
		}

		if (nextIndex >= this.customers.length) {
			this.currentIndex = 0;
		} else {
			this.currentIndex = nextIndex;
		}

		this.trigger();
	}

});
