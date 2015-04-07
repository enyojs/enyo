enyo.singleton({
	/**
	*
    *
	* @class enyo.FluxDispatcher
	* @extends enyo.Object
	* @protected
	*/
	name: 'enyo.FluxDispatcher',

	kind: enyo.Object,

	/**
	* These subscriptions to a stores state updates
	*
	* @private
	* @type {Object}
	*
	*/
	subscriptions: {},

	/**
	* Pending callbacks that are waiting for other store's callbacks
	*
	* @private
	* @type {Object}
	*
	*/
	pending: {},

	/**
	* The prefix used to generate IDs for registered users.
	*
	* @public
	* @type {String}
	*
	*/
	prefix: 'ID_',

	/**
	* The last ID integer used.
	*
	* @private
	* @type {Number}
	*
	*/
	lastID: 1,

	/**
	* Is dispatching still happening
	*
	* @private
	* @type {Boolean}
	*
	*/
	isDispatching: false,

	/**
	* @name enyo.FluxDispatcher.subscribe
	*
	* Allows a consumer to subscribe to notifications of a store's state changes.
	*
	* @public
	* @type {Method}
	* @param [storeid] {String} - The ID of the store that needs to be subscribed.
	* @param [callback] {Function} - The callback that will be invoked when the notification is called
	* @returns [id]{String}
	*
	*/
	subscribe: function(storeid, callback) {

		//a store, or a view subscribes to be notified of an update
		//to the data
		var id = this.prefix + this.lastID++;

		if(typeof storeid == 'undefined') {
			this.pending[id] = false;
			//send an id back
			return id;
		}

		//subscribe to a store's changes
		this.subscriptions[storeid] = this.subscriptions[storeid] || {};
		this.subscriptions[storeid][id] = callback;

		//send back an id for the subscription
		return id;
	},

	/**
	* @name enyo.FluxDispatcher.unsubscribe
	*
	* Allows a consumer to unsubscribe from notifications
	*
	*
	* @public
	* @type {Method}
	* @param [storeid] {String} - The ID of the store that needs to be subscribed.
	* @param [id] {String} - The ID of the consumer who is unsubscribing.
	*
	*/
	unsubscribe: function(storeid, id){
		//unsubscribe to prevent a store or a view from recieving
		//notifications about a store, keep the notify stack
		//as short as you need, good to unsubscribe during teardown
		delete this.subscriptions[storeid][id];
	},

	/**
	* @name enyo.FluxDispatcher.waitFor
	*
	* Used in a notification callback, the inner function will wait until the ids
	* have been notified about state changes first.
	*
	*
	* @public
	* @type {Method}
	*
	*/
	waitFor: function(ids, callback){
		//wait for any callbacks to resolve
		//before issuing this callback
		for (var i = 0; i < ids.length; i++) {
			if(this.pending[ids[i]]) {
				continue;
			}
			callback();
		}
	},

	/**
	* @name enyo.FluxDispatcher.notify
	*
	* Notifies consumers about state changes to the store, dispatches the full
	* payload. Consumers to not subscribe to events.
	*
	* @private
	* @type {Method}
	*
	*/
	notify: function(storeid, payload) {
		var notifyQue = this.subscriptions[storeid];
		this.pending[storeid] = true;
		if(notifyQue) {
			this.isDispatching = true;

			try {
				for (var key in notifyQue) {
					var callback = notifyQue[key];
					if(callback) {
						callback(payload);
					}
				}
			} finally {
				this.isDispatching = false;
			}
		}
		this.pending[storeid] = false;
	}
});