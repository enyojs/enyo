enyo.singleton({
	/**
	*
    *
	* @class enyo.FluxDispatcher
	* @extends enyo.Object
	* @protected
	*/
	kind(
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
	subscribe: function(storeid, callback) {
		//a store, or a view subscribes to be notified of an update
		//to the data
		var id = this.prefix + this.lastID++;

		if(typeof storeid == 'undefined') {
			this.pending[id] = false;
			console.log(id, this.pending[id]);
			//send an id back
			return id;
		}

		//subscribe to a store's changes
		this.subscriptions[storeid] = this.subscriptions[storeid] || {};
		this.subscriptions[storeid][id] = callback;

		//send back an id for the subscription
		return id;
	},
	unsubscribe: function(storeid, id){
		//unsubscribe to prevent a store or a view from recieving
		//notifications about a store, keep the notify stack
		//as short as you need, good to unsubscribe during teardown
		delete this.subscriptions[storeid][id];
	},
	waitFor: function(ids, callback){
		//wait for any callbacks to resolve
		//before issuing this callback
		for (var i = 0; i < ids.length; i++) {
			console.log(this.pending[ids[i]]);
			if(this.pending[ids[i]]) {
				continue;
			}
			callback();
		}
	},
	notify: function(storeid, payload) {
		var notifyQue = this.subscriptions[storeid];
		if(notifyQue) {
			console.log(this);
			this.isDispatching = true;
			console.log(storeid, this.pending[storeid]);
			this.pending[storeid] = false;
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
			this.pending[storeid] = false;
		}
	}
});