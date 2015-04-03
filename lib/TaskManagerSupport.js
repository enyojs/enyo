(function (enyo, scope) {

	/** @lends TaskManagerSupport.prototype */
	enyo.TaskManagerSupport = {

		/**
		* @private
		*/
		name: 'enyo.TaskManagerSupport',

		/**
		* @private
		*/
		mixins: ['enyo.EventEmitter'],

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
		* {@link enyo.BackgroundTaskManager}, otherwise we have not yet been added to a management
		* queue.
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		managed: false,

		/**
		* @method
		* @private
		*/
		create: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				this.tasks = new enyo.PriorityQueue();
				this._namedTasks = {};
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
			if (this._namedTasks[nom]) {
				this.removeTask(nom); // remove existing task so that it can be replaced
			}

			this.tasks.add(task, priority);
			this._namedTasks[nom] = task;

			if (!this.managed) { // add ourselves if we are not currently being managed
				enyo.BackgroundTaskManager.add(this);
			}

			this.emit('priorityChanged', this, priority);
		},

		/**
		* Removes the specified task from the queue.
		*
		* @param {Function} nom - The name of the task to be cancelled.
		* @public
		*/
		removeTask: function (nom) {
			var task = this._namedTasks[nom];
			this.tasks.remove(task);
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
		pauseTask: enyo.inherit(function (sup) {
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
		resumeTask: enyo.inherit(function (sup) {
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
			var task = this._namedTasks[nom];
			this.tasks.updatePriority(task, priority);
			this.emit('priorityChanged', this, priority);
		},

		/**
		* Execute the next task in the queue. If the task had previously been paused, it will be
		* resumed.
		*
		* @public
		*/
		runTask: function () {
			if (this.tasks.length) {
				this.task = this.tasks.poll();
				this.task && this.task();

				if (this.tasks.length === 0) { // remove ourselves if we no longer have tasks
					enyo.BackgroundTaskManager.remove(this);
				}
			}
		}

	};

})(enyo, this);