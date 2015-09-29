/**
* Exports the {@link module:enyo/TaskManagerSupport~TaskManagerSupport} mixin
* @module enyo/TaskManagerSupport
*/

require('enyo');

var
	kind = require('./kind');

var
	EventEmitter = require('./EventEmitter'),
	PriorityQueue = require('./PriorityQueue'),
	Priorities = PriorityQueue.Priorities,
	BackgroundTaskManager = require('./BackgroundTaskManager');

/** @mixin */
var TaskManagerSupport = {

	/**
	* @private
	*/
	name: 'enyo.TaskManagerSupport',

	/**
	* @private
	*/
	mixins: [EventEmitter],

	/**
	* If `true`, the current task execution is paused, otherwise task execution is ongoing.
	*
	* @type {Boolean}
	* @default false
	* @public
	*/
	paused: false,

	/**
	* If `true`, we are being managed in a management queue, usually the queue for
	* {@link module:enyo/BackgroundTaskManager}; otherwise, we have not yet been
	* added to a management queue.
	*
	* @type {Boolean}
	* @default false
	* @public
	*/
	managed: false,

	/**
	* The default priority for added tasks.
	*
	* @type {Number}
	* @default {@link module:enyo/PriorityQueue~PriorityQueue#Priorities.SOMETIME}
	* @public
	*/
	defaultPriority: Priorities.SOMETIME,

	/**
	* The name of this manager, which can be used to easily retrieve this specific manager from the
	* {@link module:enyo/BackgroundTaskManager}.
	*
	* @type {String}
	* @default ''
	* @public
	*/
	managerName: '',

	/**
	* @method
	* @private
	*/
	create: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			this.tasks = new PriorityQueue();
			this.namedTasks = {};
			this.managerName = this.managerName || this.name;
			BackgroundTaskManager.add(this, this.managerName);
		};
	}),

	/**
	* Adds the given task to the queue.
	*
	* @param {Function} task - The task to be added to the queue.
	* @param {Number|String} priority - The priority of the task.
	* @param {String} nom - The name of the task for later reference.
	* @public
	*/
	addTask: function (task, priority, nom) {
		if (nom && this.namedTasks[nom]) {
			this.removeTask(nom); // remove existing task so that it can be replaced
		}

		this.tasks.add(task, priority);
		if (nom) {
			this.namedTasks[nom] = task;
		}

		if (!this.managed) { // add ourselves if we are not currently being managed
			BackgroundTaskManager.add(this);
		}

		this.emit('priorityChanged', this, priority);
	},

	/**
	* Removes the specified task from the queue.
	*
	* @param {Function} nom - The name of the task to be canceled.
	* @public
	*/
	removeTask: function (nom) {
		var task = this.namedTasks[nom];
		this.tasks.remove(task);
		delete this.namedTasks[nom];
	},


	/**
	* The expectation is that the current task will be canceled - to be implemented by the kind.
	*
	* @public
	*/
	cancelTask: function () {},

	/**
	* The expectation is that the current task will be paused - to be implemented by the kind.
	*
	* @public
	*/
	pauseTask: kind.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.paused = true;
		};
	}),

	/**
	* The expectation is that the current task will be resumed - to be implemented by the kind.
	*
	* @public
	*/
	resumeTask: kind.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.paused = false;
		};
	}),

	/**
	* Update the priority of a given task.
	*
	* @param {Object} nom - The name of the task whose priority we wish to update.
	* @param {Number} priority - The updated priority which we wish to assign to the specified
	*	task.
	* @public
	*/
	updateTask: function (nom, priority) {
		var task = this.namedTasks[nom];
		this.tasks.updatePriority(task, priority);
		this.emit('priorityChanged', this, priority);
	},

	/**
	* Determines whether or not this task manager has tasks.
	*
	* @returns {Boolean} `true` if tasks exist and we are not paused; otherwise, `false`
	*	otherwise.
	* @public
	*/
	hasTasks: function () {
		return this.tasks.length && !this.paused;
	},

	/**
	* Executes the next task in the queue. If the task had previously been paused,
	* it will be resumed.
	*
	* @public
	*/
	runTask: function () {
		if (this.tasks.length) {
			this.task = this.tasks.poll();
			this.task && this.task();

			if (this.tasks.length === 0) { // remove ourselves if we no longer have tasks
				BackgroundTaskManager.remove(this.managerName);
			}
		}
	}

};

module.exports = TaskManagerSupport;
