enyo.singleton({
	name: 'enyo.FluxDispatcher',
	kind: enyo.Object,
	subscriptions: {},
	prefix: 'ID_',
	lastID: 1,
	isDispatching: false,
	subscribe: function(storeid, callback) {
		//a store, or a view subscribes to be notified of an update
		//to the data
		var id = this.prefix + this.lastID++;

		if(typeof storeid == 'undefined') {
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
	waitFor: function(ids){
		//if something is dependent on

	},
	notify: function(storeid, payload) {
		var notifyQue = this.subscriptions[storeid];
		if(notifyQue) {
			this.isDispatching = true;
			try {
				for (key in notifyQue) {
					var callback = notifyQue[key];
					if(callback) callback(payload);
				}
			} finally {
				this.isDispatching = false;
			}
		}
	}
});