(function (enyo, scope) {

	enyo.kind(
		/** @lends enyo.PriorityQueue */ {

		/**
		* @private
		*/
		name: 'enyo.PriorityQueue',

		/**
		* @private
		*/
		kind: 'enyo.Object',

		/**
		* @public
		*/
		priorities: {
			'soon': 1,
			'sometime': 5
		},

		/**
		* @private
		*/
		defaultPriority: 5,

		/**
		* @private
		*/
		queue: [],

		/**
		* Inserts a given item into the queue, with an optional priority.
		*
		* @param {Object} item - The item to insert.
		* @param {Number} priority - The priority of the item in the queue.
		* @public
		*/
		add: function (item, priority) {
			priority = this.normalizePriority(priority) || this.defaultPriority;
			this.queue.push({
				item: item,
				priority: priority
			});
			// TODO: implement method to adjust queue
			// this.adjustQueue();
		},

		/**
		* Empties all of the items from the queue.
		*
		* @public
		*/
		clear: function () {
			this.queue = [];
		},

		/**
		* Retrives the highest-priority item from the queue, without removing it from the queue.
		*
		* @return {Object} The item in the queue currently with the highest-priority.
		* @public
		*/
		peek: function () {
			return this.queue[0] && this.queue[0].item;
		},

		/**
		* Retrives and removes the highest-priority item from the queue.
		*
		* @return {Object} The item in the queue currently with the highest-priority.
		* @public
		*/
		poll: function () {
			return this.queue.shift().item;
		},

		/**
		* Removes the given item from the queue.
		*
		* @param {Object} item - The item to be removed.
		* @public
		*/
		remove: function (item) {},

		/**
		* The number of items in the queue.
		*
		* @return {Number} The number of items in the queue.
		* @public
		*/
		size: function () {
			return this.queue.length;
		},

		/**
		* Normalizes the priority to a numerical value.
		*
		* @param {String|Number} priority - The priority value to normalize.
		* @private
		*/
		normalizePriority: function (priority) {
			return enyo.isString(priority) ? this.priorities[priority] : priority;
		},

		/**
		* This is our up-heap function.
		*
		* @private
		*/
		adjustQueue: function (addedIdx) {
			var length = this.queue.length,
				added = this.queue[addedIdx],
				parent, parentIdx;

			if (length == 1) {
				return;
			}

			parentIdx = this.getParentIndex(added);
			parent = this.queue[parentIdx];

			if (added.priority < parent.priority) {
				this.swap(addedIdx, parentIdx);
				this.adjustQueue(parentIdx);
			}

			return;
		},

		/**
		* Retrieves the index of the parent of the given item.
		*
		* @private
		*/
		getParentIndex: function (item) {

		},

		/**
		* Swap the position of the given elements.
		*
		* @private
		*/
		swap: function (idx1, idx2) {
			var tmp = this.queue[idx1];
			this.queue[idx1] = this.queue[idx2];
			this.queue[idx2] = tmp;
		}

	});

})(enyo, this);