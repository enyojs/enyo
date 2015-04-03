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

	/**
	* The default configurable options used by {@link enyo.PriorityQueue}.
	*
	* @typedef {Object} enyo.PriorityQueue~Options
	* @property {Function} [compareFn] - A comparison function to be utilized when comparing two
	*	items to determine prioritization. The function will receive two parameters, and should
	*	return a boolean indicating whether or not the priority of the first item is greater than
	*	the priority of the second time.
	*/

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
		* The type of heap utilized by the {@link enyo.PriorityQueue}. Possible values include
		* 'minHeap' and 'maxHeap', which correspond to overridable functions that are used when
		* comparing values. This value is ignored if a comparison function is provided at
		* initialization time via [configuration options]{@link enyo.PriorityQueue~Options}.
		*
		* @type {String}
		* @default 'minHeap'
		* @public
		*/
		type: 'minHeap',

		/**
		* @private
		*/
		defaultPriority: enyo.Priorities.SOMETIME,

		/**
		* Initializes the {@link enyo.PriorityQueue}.
		*
		* @param {enyo.PriorityQueue~Options} [opts] - The hash of configuration options.
		* @method
		* @public
		*/
		constructor: enyo.inherit( function (sup) {
			return function (opts) {
				sup.apply(this, arguments);
				this.queue = [];
				this.length = 0;
				this.compareFn = (opts && opts.compareFn) || this[this.type];
			};
		}),

		/**
		* Inserts a given item into the queue, with an optional priority.
		*
		* @param {Object} item - The item to insert.
		* @param {Number} [priority] - The priority of the item in the queue.
		* @public
		*/
		add: function (item, priority) {
			priority = this.normalizePriority(priority) || this.defaultPriority;
			this.length = this.queue.push({
				item: item,
				priority: priority
			});
			this.bubbleUp(this.length - 1);
		},

		/**
		* Empties all of the items from the queue.
		*
		* @public
		*/
		clear: function () {
			this.queue = [];
			this.length = 0;
		},

		/**
		* Retrives the highest-priority item from the queue, without removing it from the queue.
		*
		* @return {Object} The highest-priority item in the queue.
		* @public
		*/
		peek: function () {
			return this.queue[0] && this.queue[0].item;
		},

		/**
		* Retrives and removes the highest-priority item from the queue.
		*
		* @return {Object} The highest-priority item in the queue.
		* @public
		*/
		poll: function () {
			var item;
			if (this.length) {
				item = this.queue.shift();

				if (this.queue.length > 1) { // heapify
					this.moveFromEnd(0);
				}

				this.length = this.queue.length;
			}

			return item && item.item;
		},

		/**
		* Removes the given item from the queue.
		*
		* @param {Object} item - The item to be removed.
		* @public
		*/
		remove: function (item) {
			// TODO: explore a more efficient technique
			//var idx = this.queue.indexOf(item);
			var idx = this.findIndexInQueue(item);

			if (idx > -1) {
				this.moveFromEnd(idx, true);
			}

			this.length = this.queue.length;
		},

		/**
		* Updates the priority for the given item.
		*
		* @param {Object} item - The item whose priority is to be updated.
		* @param {Number} priority - The new priority value.
		* @public
		*/
		updatePriority: function (item, priority) {
			var idx = this.findIndexInQueue(item),
				itemInQueue = this.queue[idx];

			itemInQueue.priority = priority;
			this.swap(idx, this.queue.length - 1);
			this.bubbleUp();
		},

		/**
		* Normalizes the priority to a numerical value.
		*
		* @param {String|Number} priority - The priority value to normalize.
		* @private
		*/
		normalizePriority: function (priority) {
			return enyo.isString(priority) ? enyo.Priorities[enyo.toUpperCase(priority)] : priority;
		},

		/**
		* This is our up-heap function.
		*
		* @param {Number} idx - The position from which we want to start bubbling up.
		* @private
		*/
		bubbleUp: function (idx) {
			var length = this.queue.length,
				current = this.queue[idx],
				parent, parentIdx;

			if (length == 1) {
				return;
			}

			parentIdx = Math.floor((idx + 1) / 2) - 1;
			parent = this.queue[parentIdx];

			if (parent && this.compareFn(current, parent)) {
				this.swap(idx, parentIdx);
				this.bubbleUp(parentIdx);
			}
		},

		/**
		* This is our down-heap function.
		*
		* @param {Number} idx - The position from which we want to start bubbling down.
		* @private
		*/
		bubbleDown: function (idx) {
			var current = this.queue[idx],
				leftIdx = (idx + 1) * 2 - 1,
				rightIdx = (idx + 1) * 2,
				left = this.queue[leftIdx],
				right = this.queue[rightIdx],
				swapIdx;

			if (left) {
				if (this.compareFn(left, current)) {
					if (right && this.compareFn(right, left)) {
						swapIdx = rightIdx;
						this.swap(swapIdx, idx);
					} else {
						swapIdx = leftIdx;
						this.swap(swapIdx, idx);
					}
					this.bubbleDown(swapIdx);
				} else {
					if (right && this.compareFn(right, current)) {
						swapIdx = rightIdx;
						this.swap(swapIdx, idx);
					}
				}
			}
		},

		/**
		* Swap the position of the given elements.
		*
		* @param {Number} idx1 - The position of the first element.
		* @param {Number} idx2 - The position of the second element.
		* @private
		*/
		swap: function (idx1, idx2) {
			var tmp = this.queue[idx1];
			this.queue[idx1] = this.queue[idx2];
			this.queue[idx2] = tmp;
		},

		/**
		* Move the last item into a specified position, usually to handle item removal.
		*
		* @param {Number} idx - The position where we wish to insert the element from the end of the
		*	queue.
		* @param {Boolean} [replace] - If `true`, the element at the specified position will be
		*	replaced by the element from the end of the queue; otherwise, an insertion will occur.
		* @private
		*/
		moveFromEnd: function (idx, replace) {
			var len = this.queue.length;

			if (replace) {
				this.queue.splice(idx, 1, this.queue[len - 1]);
				this.queue.splice(len - 1, 1);
			} else {
				this.queue.splice(idx, 0, this.queue[len - 1]);
				this.queue.splice(len, 1);
			}
			this.bubbleDown(idx);
		},

		/**
		* The comparison {@glossary function} used when the {@link enyo.PriorityQueue} utilizes a
		* min heap. This assumes that we wish to make a comparison utilizing the `priority` property
		* of the given items.
		*
		* @param {Object} item1 - The first item whose priority we are comparing.
		* @param {Object} item2 - The second item whose priority we are comparing.
		* @return {Boolean} If `true`, the first item has higher priority than the second item.
		* @private
		*/
		minHeap: function (item1, item2) {
			return item1.priority < item2.priority;
		},

		/**
		* The comparison {@glossary function} used when the {@link enyo.PriorityQueue} utilizes a
		* max heap. This assumes that we wish to make a comparison utilizing the `priority` property
		* of the given items.
		*
		* @param {Object} item1 - The first item whose priority we are comparing.
		* @param {Object} item2 - The second item whose priority we are comparing.
		* @return {Boolean} If `true`, the first item has higher priority than the second item.
		* @private
		*/
		maxHeap: function (item1, item2) {
			return item1.priority > item2.priority;
		},

		/**
		* For a given element, determines its index in our internal queue structure.
		*
		* @param {Object} item - The element whose index in our queue we wish to retrieve.
		* @private
		*/
		findIndexInQueue: function (item) {
			var idx;
			for (idx = 0; idx < this.queue.length; idx++) {
				if (item === this.queue[idx].item) {
					return idx;
				}
			}
		}

	});

})(enyo, this);