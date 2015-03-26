(function (enyo, scope) {

	var kind = enyo.kind,
		EventEmitter = enyo.EventEmitter,
		StateSupport = enyo.StateSupport;

	function update(node, src) {
		var key, val;

		if (!(node && src)) return;

		// avoid iterating over null/undefined
		for (key in src) {
			// avoid looking this value up over and over
			val = src[key];
			// don't clear current values if one wasn't returned
			if (val != null) {
				// if there isn't a value already we short-circuit the object test for efficiency
				if (!node[key] || !isObject(val)) node[key] = val;
				else update(node[key], val);
			}
		}

		return node;
	}

	/**
	* The configuration options for the [find()]{@link enyo.Store#find} method.
	*
	* @typedef {Object} enyo.Store~FindOptions
	* @property {Boolean} all=true - Whether or not to include more than one match for the
	*	filter method. If `true`, an array of matches is returned; otherwise, a single match.
	* @property {Object} context - If provided, it will be used as the `this` (context) of
	*	the filter method.
	*/

	/**
	* An anonymous kind used internally for the singleton {@link enyo.store}.
    *
	* @class enyo.FluxStore
	* @mixes enyo.EventEmitter
	* @extends enyo.Object
	* @protected
	*/
	kind(
		/** @lends enyo.Store.prototype */ {
		name: 'enyo.FluxStore',

		/**
		* @private
		*/
		kind: enyo.Object,

		data: {},

		id: -1,

		mixins: [EventEmitter],

		source: '',

		/**
		* @private
		*/
		add: function (data, opts) {
			update(this.data, data);
		},

		/**
		* @private
		*/
		reset: function () {
			this.data = {};
		},

		constructor: enyo.inherit(function(sup){
			return function(){
				sup.apply(this, arguments);
				if(enyo.FluxDispatcher) {
					//subscribe the store to the dispatcher
					this.id = enyo.FluxDispatcher.subscribe();
				}
			}
		}),

		fetch: function(opts) {

			var opts = opts || {};

			opts.success = opts.success || this.success;
			opts.error = opts.error || this.error;

			enyo.Source.execute('fetch', this, opts);
		},

		success: function(res) {
			//when the result comes back from
			//the fetch add it to the store
			this.add(res);

			//tell the dispatcher to notify all subscribers
			//that the payload has been updated for this store
			enyo.FluxDispatcher.notify(this.id, this.data);
		},

		error: function(res) {
			//error occured during fetch
			//how is this being handled in models right now?
		}
	});


	enyo.kind({
		name: 'testSource',
		kind: 'enyo.Source',
		fetch: function(model, opts) {
			console.log(model);
		}
	});

})(enyo, this);
