(function (enyo, scope) {

	/** @lends TaskManagerSupport.prototype */
	enyo.TaskManagerSupport = {

		/**
		* @method
		* @private
		*/
		name: 'enyo.TaskManagerSupport',

		/**
		* @method
		* @private
		*/
		create: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				enyo.BackgroundTaskManager.add(this);
				this.tasks = new enyo.PriorityQueue();
			};
		}),

		/**
		* Adds the given task to the queue.
		*
		* @param {Function} task - The task to be added to the queue.
		* @param {Number|String} priority - The priority of the task.
		* @public
		*/
		addTask: function (task, priority) {
			this.tasks.add(task, priority);

			// if the priority matches a specific, high-priority value, we let the BTM know
			if (priority == enyo.Priority.SOON) {
				enyo.BackgroundTaskManager.updatePriority(this, priority);
			}
		},

		/**
		* Removes the specified task from the queue.
		*
		* @param {Function} task - The task to be cancelled.
		* @public
		*/
		removeTask: function (task) {
			if (this.task === task) {
				this.task = null;
			}
			this.tasks.remove(task);
		},

		/**
		* Terminates the active task.
		*
		* @public
		*/
		cancelTask: function () {
			if (this.task) {
				this.task.cancel();
				this.task = null;
			}
		},

		/**
		* The expectation is that the current task will be paused - to be implemented by the kind.
		*
		* @public
		*/
		pauseTask: function () {
			this.paused = true;
		},

		/**
		* The expectation is that the current task will be resumed - to be implemented by the kind.
		*
		* @public
		*/
		resumeTask: function () {
			this.paused = false;
		},

		/**
		* Update the priority of a given task.
		*
		* @param {Object} task - The item whose priority we wish to update.
		* @param {Number} priority - The updated priority which we wish to assign to the specified
		*	task.
		* @public
		*/
		updateTaskPriority: function (task, priority) {
			this.tasks.updatePriority(task, priority);
		},

		/**
		* Execute the next task in the queue. If the task had previously been paused, it will be
		* resumed.
		*
		* @public
		*/
		runTask: function () {
			if (this.tasks.length) {
				if (this.paused && this.task) {
					this.resume();
				} else if (!this.isBusy()) {
					this.task = this.tasks.poll();
					this.task({onComplete: this.bindSafely(function () {
						this.task = null;
					})});
				}
			}
		},

		/**
		* Whether or not a task is currently running.
		*
		* @public
		*/
		isBusy: function () {
			return !!this.task;
		}

	};

})(enyo, this);