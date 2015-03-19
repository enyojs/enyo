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
		* @private
		*/
		queue: [],

		/**
		* @public
		*/
		add: function (item, priority) {},

		/**
		* @public
		*/
		clear: function () {},

		/**
		* @public
		*/
		peek: function () {},

		/**
		* @public
		*/
		poll: function () {
			return this.queue.shift();
		},

		/**
		* @public
		*/
		offer: function () {},

		/**
		* @public
		*/
		remove: function (item) {},

		/**
		* @private
		*/
		statics: {

			/**
			* @public
			*/
			priorities: {
				'soon': 1,
				'sometime': 5
			},

			/**
			* @public
			*/
			defaultPriority: this.priorities['sometime']
		}
	});

})(enyo, this);