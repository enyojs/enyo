/**
* Contains the declaration for the {@link module:enyo/FluxStore~FluxStore} kind.
* @wip
* @module enyo/FluxStore
*/

var
	kind = require('./kind'),
	utils = require('enyo/utils'),
	bindSafely = utils.bindSafely,
	CoreObject = require('./CoreObject'),
	EventEmitter = require('./EventEmitter'),
	FluxDispatcher = require('./FluxDispatcher'),
	Source = require('./Source'),
	StateSupport = require('./StateSupport');


function update (node, src) {
	var key, val;

	if (!(node && src)) return;

	// avoid iterating over null/undefined
	for (key in src) {
		// avoid looking this value up over and over
		val = src[key];
		// don't clear current values if one wasn't returned
		if (val != null) {
			// if there isn't a value already we short-circuit the object test for efficiency
			if (!node[key] || !utils.isObject(val)) node[key] = val;
			else update(node[key], val);
		}
	}

	return node;
}

/**
*
* @class FluxStore
* @mixes module:enyo/EventEmitter~EventEmitter
* @extends module:enyo/CoreObject~Object
* @public
*/
module.exports = kind(
	/** @lends module:enyo/FluxStore~FluxStore.prototype */ {
	name: 'enyo.FluxStore',

	/**
	* @private
	*/
	kind: CoreObject,

	/**
	* How a store is identitified to the Flux Dispatcher. This ID is used for
	* subscribing to a store's state notification change.
	*
	* @public
	* @type {Number}
	*
	*/
	id: -1,

	/**
	* @private
	*/
	mixins: [EventEmitter, StateSupport],

	/**
	* The source that this FluxStore should use to fetch new data sets.
	*
	* @public
	* @type {String}
	*
	*/
	source: '',

	/**
	* @private
	* @lends module:enyo/FluxStore~FluxStore.prototype
	*/
	published: {

		/**
		* When a source sends data to the store, determines whether the data root
		* has the new data merged. If `false`, data will be replaced instead.
		*
		* @public
		* @type {Boolean}
		* @default true
		*
		*/
		MergeRoot: true
	},

	/**
	* @private
	*/
	constructor: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			this.reset();
			//id the store with the dispatcher
			this.id = FluxDispatcher.subscribe();

			//if the store has an update method, subscribe to payload updates
			if(this.update) this.updateID = FluxDispatcher.subscribe(this.id, bindSafely(this, this.update));
		};
	}),

	/**
	* Adds data to the store; called from the store's fetch.
	*
	* @param [data] - Object that has the data to be added to store.
	* @param {module:enyo/FluxStore~FluxStore~ActionOptions} [opts] - Optional configuration options.
	* @private
	*/
	add: function (data, opts) {
		if (this.MergeRoot) {
			update(this.data, data);
			return;
		}
		this.data = data;
	},

	/**
	* Clears the store's data.
	*
	* @public
	*/
	reset: function () {
		this.data = {};
	},

	/**
	* Fetches the data from a [Source]{@link module:enyo/Source~Source}
	*
	* @param {module:enyo/FluxStore~FluxStore~ActionOptions} [opts] - Optional configuration options.
	* @public
	*/
	fetch: function (opts) {

		opts = opts || {};

		opts.success = opts.success || this.success.bind(this);
		opts.error = opts.error || this.error.bind(this);

		FluxDispatcher.pending[this.id] = true;
		Source.execute('fetch', this, opts);
		FluxDispatcher.pending[this.id] = false;
	},

	/**
	* Success callback called when the [Source]{@link module:enyo/Source~Source} is successful.
	*
	* @param {module:enyo/Source~Source} [source] - The source that initiated the fetch.
	* @param {module:enyo/Source~Source~Results} [res] - The result of the fetch.
	* @private
	*/
	success: function (source, res) {

		//when the result comes back from
		//the fetch add it to the store
		this.add(res);

		//tell the dispatcher to notify all subscribers
		//that the payload has been updated for this store
		FluxDispatcher.notify(this.id, this.data);
	},

	/**
	* Error callback called when the [Source]{@link module:enyo/Source~Source} has failed.
	*
	* @param {module:enyo/Source~Source~Results} [res] - The result of the fetch.
	* @private
	*/
	error: function (res) {
		//error occured during fetch
		//todo: warn user
	}
});
