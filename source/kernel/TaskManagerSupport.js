(function (enyo, scope) {

	/** @lends TaskManagerSupport.prototype */
	enyo.TaskManagerSupport = {

		/**
		* @method
		* @private
		*/
		create: enyo.inherit(function (sup) {
			return function () {
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
		add: function (task, priority) {
			priority = this.normalizePriority(priority) || enyo.PriorityQueue.defaultPriority;
			this.tasks.add(task, priority);
		},

		/**
		* Removes the specified task from the queue.
		*
		* @param {Function} task - The task to be cancelled.
		* @public
		*/
		cancel: function (task) {
			if (this.task === task) {
				this.task = null;
			}
			this.tasks.remove(task);
		},

		/**
		* The expectation is that the current task will be paused - to be implemented by the kind.
		*
		* @public
		*/
		pause: function () {
			this.paused = true;
		},

		/**
		* The expectation is that the current task will be resumed - To be implemented by the kind.
		*
		* @public
		*/
		resume: function () {
			this.paused = false;
		},

		/**
		* Execute the next task in the queue. If the task had previously been paused, it will be
		* resumed.
		*
		* @public
		*/
		run: function () {
			if (this.paused && this.task) {
				this.resume();
			} else if (!this.isBusy()) {
				this.task = this.tasks.poll();
				this.task({onComplete: this.bindSafely(function () {
					this.task = null;
				})});
			}
		},

		/**
		* Whether or not a task is currently running.
		*
		* @public
		*/
		isBusy: function () {
			return !!this.task;
		},

		/**
		* @private
		*/
		normalizePriority: function (priority) {
			return enyo.isString(priority) ? this.priorities[priority] : priority;
		}

	};

})(enyo, this);