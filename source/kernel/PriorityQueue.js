(function (enyo, scope) {

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
		* @public
		*/
		priorities: {
			'soon': 1,
			'sometime': 5
		},

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
		defaultPriority: 5,

		/**
		* @private
		*/
		queue: [],

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
				this.compareFn = (opts && opts.compareFn) || this[this.type];
			};
		}),

		/**
		* Inserts a given item into the queue, with an optional priority.
		*
		* @param {Object} item - The item to insert.
		* @param {Number} priority - The priority of the item in the queue.
		* @public
		*/
		add: function (item, priority) {
			priority = this.normalizePriority(priority) || this.defaultPriority;
			var len = this.queue.push({
				item: item,
				priority: priority
			});
			this.bubbleUp(len - 1);
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
			var item = this.queue.shift();

			if (this.queue.length > 1) { // heapify
				this.moveFromEnd(0);
			}

			return item.item;
		},

		/**
		* Removes the given item from the queue.
		*
		* @param {Object} item - The item to be removed.
		* @public
		*/
		remove: function (item) {
			// TODO: explore a more efficient technique
			var idx = this.queue.indexOf(item);

			if (idx > -1) {
				this.moveFromEnd(idx, true);
			}
		},

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
				if (left.priority < current.priority) {
					if (right && this.compareFn(right, left)) {
						swapIdx = rightIdx;
						this.swap(swapIdx, idx);
					} else {
						swapIdx = leftIdx;
						this.swap(swapIdx, idx);
					}
					this.bubbleDown(swapIdx);
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
		* Swap the position of the given elements.
		*
		* @param {Number} idx - The position where we wish to insert the element from the end of the
		*	queue.
		* @param {Boolean} [replace] - If `true`, the element at the specified position will be
		*	replaced by the element from the end of the queue; otherwise, an insertion will occur.
		* @private
		*/
		moveFromEnd: function (idx, replace) {
			var len = this.queue.length,
				deleteCount = replace ? 1 : 0;

			this.queue.splice(idx, deleteCount, this.queue[len - 1]);
			this.queue.splice(len, 1);
			this.bubbleDown(idx);
		},

		/**
		* The comparison {@glossary function} used when the {@link enyo.PriorityQueue} utilizes a
		* min heap. This assumes that we wish to make a comparison utilizing the `priority` property
		* of the given items.
		*
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
		* @return {Boolean} If `true`, the first item has higher priority than the second item.
		* @private
		*/
		maxHeap: function (item1, item2) {
			return item1.priority > item2.priority;
		}

	});

})(enyo, this);