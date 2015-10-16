require('enyo');

/**
* Contains the declaration for the {@link module:enyo/Collection~Collection} kind.
* @module enyo/Collection
*/

var
	kind = require('./kind'),
	utils = require('./utils');

var
	Component = require('./Component'),
	EventEmitter = require('./EventEmitter'),
	Model = require('./Model'),
	ModelList = require('./ModelList'),
	StateSupport = require('./StateSupport'),
	Source = require('./Source'),
	Store = require('./Store'),
	States = require('./States');

/**
* This is only necessary because of the order in which mixins are applied.
*
* @class
* @private
*/
var BaseCollection = kind({
	kind: Component,
	mixins: [EventEmitter, StateSupport]
});

/**
* Fires when [models]{@link module:enyo/Model~Model} have been [added]{@link module:enyo/Collection~Collection#add}
* to the [collection]{@link module:enyo/Collection~Collection}.
*
* @event module:enyo/Collection~Collection#add
* @type {Object}
* @property {module:enyo/Model~Model[]} models - An [array]{@glossary Array} of
*	[models]{@link module:enyo/Model~Model} that were [added]{@link module:enyo/Collection~Collection#add} to the
*	[collection]{@link module:enyo/Collection~Collection}.
* @property {module:enyo/Collection~Collection} collection - A reference to the
*	collection that [emitted]{@link module:enyo/EventEmitter~EventEmitter#emit} the event.
* @property {Number} index - The index in the given collection where the models were inserted.
* @public
*/

/**
* Fires when [models]{@link module:enyo/Model~Model} have been [removed]{@link module:enyo/Collection~Collection#remove}
* from the [collection]{@link module:enyo/Collection~Collection}.
*
* @event module:enyo/Collection~Collection#remove
* @type {Object}
* @property {module:enyo/Model~Model[]} models - An [array]{@glossary Array} of
*	[models]{@link module:enyo/Model~Model} that were [removed]{@link module:enyo/Collection~Collection#remove} from the
*	[collection]{@link module:enyo/Collection~Collection}.
* @property {module:enyo/Collection~Collection} collection - A reference to the
*	collection that [emitted]{@link module:enyo/EventEmitter~EventEmitter#emit} the event.
* @public
*/

/**
* Fires when the [collection]{@link module:enyo/Collection~Collection} has been
* [sorted]{@link module:enyo/Collection~Collection#sort}.
*
* @event module:enyo/Collection~Collection#sort
* @type {Object}
* @property {module:enyo/Model~Model[]} models - An [array]{@glossary Array} of all
*	[models]{@link module:enyo/Model~Model} in the correct, [sorted]{@link module:enyo/Collection~Collection#sort} order.
* @property {module:enyo/Collection~Collection} collection - A reference to the
*	[collection]{@link module:enyo/Collection~Collection} that [emitted]{@link module:enyo/EventEmitter~EventEmitter#emit} the event.
* @property {Function} comparator - A reference to the
*	[comparator]{@link module:enyo/Collection~Collection#comparator} that was used when
*	sorting the collection.
* @public
*/

/**
* Fires when the [collection]{@link module:enyo/Collection~Collection} has been reset and its
* contents have been updated arbitrarily.
*
* @event module:enyo/Collection~Collection#reset
* @type {Object}
* @property {module:enyo/Model~Model[]} models - An [array]{@glossary Array} of all
*	[models]{@link module:enyo/Model~Model} as they are currently.
* @property {module:enyo/Collection~Collection} collection - A reference to the
*	[collection]{@link module:enyo/Collection~Collection} that [emitted]{@link module:enyo/EventEmitter~EventEmitter#emit} the event.
* @public
*/

/**
* The default configurable [options]{@link module:enyo/Collection~Collection#options} used by certain API
* methods of {@link module:enyo/Collection~Collection}.
*
* @typedef {Object} module:enyo/Collection~Options
* @property {Boolean} merge=true - If `true`, when data is being added to the
*	[collection]{@link module:enyo/Collection~Collection} that already exists (i.e., is matched by
*	[primaryKey]{@link module:enyo/Model~Model#primaryKey}), the new data values will be set
* with the current [model]{@link module:enyo/Model~Model} instance. This means that the
* existing values will be updated with the new ones by calling
* [set()]{@link module:enyo/Model~Model#set} on the model.
* @property {Boolean} silent=false - Many accessor methods of the collection
*	will emit events and/or notifications. This value indicates whether or not
*	those events or notifications will be suppressed at times when that behavior
*	is necessary. Typically, you will not want to modify this value.
* @property {Boolean} purge=false - When [adding]{@link module:enyo/Collection~Collection#add}
*	models, this flag indicates whether or not to [remove]{@link module:enyo/Collection~Collection#remove}
* (purge) the existing models that are not included in the new dataset.
* @property {Boolean} parse=false - The collection's [parse()]{@link module:enyo/Collection~Collection#parse}
*	method can be executed automatically when incoming data is added via the
*	[constructor()]{@link module:enyo/Collection~Collection#constructor} method, or, later, via a
*	[fetch]{@link module:enyo/Collection~Collection#fetch}. You may need to examine the runtime
* configuration options of the method(s) to determine whether parsing is needed.
* In cases where parsing will always be necessary, this may be set to `true`.
* @property {Boolean} create=true - This value determines whether a new
*	model will be created when data being added to the collection cannot be found
* (or the [find]{@link module:enyo/Collection~Collection#options#find} flag is `false`). Models
* that are created by a collection have their [owner]{@link module:enyo/Model~Model#owner}
* property set to the collection that instanced them.
* @property {Boolean} find=true - When data being added to the collection is not
* already a model instance, the collection will attempt to find an existing model
* by its `primaryKey`, if it exists. In most cases, this is the preferred behavior,
* but if the model [kind]{@glossary kind} being  instanced does not have a
* `primaryKey`, it is unnecessary and this value may be set to `false`.
* @property {Boolean} sort=false - When adding models to the collection, the
* collection can also be sorted. If the [comparator]{@link module:enyo/Collection~Collection#comparator}
* is a [function]{@glossary Function} and this value is `true`, the comparator
*	will be used to sort the entire collection. It may also be a function that
* will be used to sort the collection, instead of (or in the place of) a defined
*	comparator.
* @property {Boolean} commit=false - When modifications are made to the
*	collection, this flag ensures that those changes are
*	[committed]{@link module:enyo/Collection~Collection#commit} according to the configuration and
*	availability of a [source]{@link module:enyo/Collection~Collection#source}. This may also be
* configured per-call to methods that use it.
* @property {Boolean} destroy=false - When models are removed from the collection,
*	this flag indicates whether or not they will be [destroyed]{@link module:enyo/Model~Model#destroy}
* as well. Note that this could have a significant impact if the same models are
* used in other collections.
* @property {Boolean} complete=false - When models are removed from the
* collection, this flag indicates whether or not they will also be removed from
* the [store]{@link module:enyo/Collection~Collection#store}. This is rarely necessary and can
* cause problems if the models are used in other collections. In addition, this
* value will be ignored if the [destroy]{@link module:enyo/Collection~Collection#options#destroy}
* flag is `true`.
* @property {Boolean} fetch=false - If `true`, when the collection is initialized,
* it will automatically attempt to fetch data if the
* [source]{@link module:enyo/Collection~Collection#source} and [url]{@link module:enyo/Collection~Collection#url}
*	or [getUrl]{@link module:enyo/Collection~Collection#getUrl} properties are properly configured.
* @property {Boolean} modelEvents=true - If `false`, this will keep the collection from
*	registering with each model for individual model events.
*/

/**
* The configuration options for [add()]{@link module:enyo/Collection~Collection#add}. For complete
* descriptions of the options and their default values, see
* {@link module:enyo/Collection~Collection#options}. Note that some properties have different
* meanings in different contexts. Please review the descriptions below to see
* how each property is used in this context.
* 
* @typedef {module:enyo/Collection~Options} module:enyo/Collection~AddOptions
* @property {Boolean} merge - Update existing [models]{@link module:enyo/Model~Model} when found.
* @property {Boolean} purge - Remove existing models not in the new dataset.
* @property {Boolean} silent - Emit [events]{@glossary event} and notifications.
* @property {Boolean} parse - Parse the incoming dataset before evaluating.
* @property {Boolean} find - Look for an existing model.
* @property {(Boolean|Function)} sort - Sort the finalized dataset.
* @property {Boolean} commit - [Commit]{@link module:enyo/Collection~Collection#commit} changes to the
*	{@link module:enyo/Collection~Collection} after completing the [add]{@link module:enyo/Collection~Collection#add}
* operation.
* @property {Boolean} create - When an existing {@link module:enyo/Model~Model} instance cannot be
*	resolved, a new instance should be created.
* @property {number} index - The index at which to add the new dataset. Defaults to the
*	end of the current dataset if not explicitly set or invalid.
* @property {Boolean} destroy - If `purge` is `true`, this will
* [destroy]{@link module:enyo/Model~Model#destroy} any models that are
* [removed]{@link module:enyo/Collection~Collection#remove}.
* @property {Object} modelOptions - When instancing a model, this
*	[object]{@glossary Object} will be passed to the constructor as its `options`
*	parameter.
*/

/**
* The configuration options for [remove()]{@link module:enyo/Collection~Collection#remove}. For
* complete descriptions of the options and their defaults, see
* {@link module:enyo/Collection~Options}. Note that some properties have different
* meanings in different contexts. Please review the descriptions below to see
* how each property is used in this context.
* 
* @typedef {module:enyo/Collection~Options} module:enyo/Collection~RemoveOptions
* @property {Boolean} silent - Emit [events]{@glossary event} and notifications.
* @property {Boolean} commit - [Commit]{@link module:enyo/Collection~Collection#commit} changes to the
*	[collection]{@link module:enyo/Collection~Collection} after completing the
*	[remove]{@link module:enyo/Collection~Collection#remove} operation.
* @property {Boolean} complete - Remove the [model]{@link module:enyo/Model~Model} from the
*	[store]{@link module:enyo/Collection~Collection#store} as well as the collection.
* @property {Boolean} destroy - [Destroy]{@link module:enyo/Model~Model#destroy} models
*	that are removed from the collection.
*/

/**
* The configurable options for [fetch()]{@link module:enyo/Collection~Collection#fetch},
* [commit()]{@link module:enyo/Collection~Collection#commit}, and [destroy()]{@link module:enyo/Collection~Collection#destroy}.
*
* @typedef {module:enyo/Collection~Options} module:enyo/Collection~ActionOptions
* @property {module:enyo/Collection~Collection~Success} success - The callback executed upon successful
*	completion.
* @property {module:enyo/Collection~Collection~Error} error - The callback executed upon a failed attempt.
*/

/**
* @callback module:enyo/Collection~Collection~Success
* @param {module:enyo/Collection~Collection} collection - The [collection]{@link module:enyo/Collection~Collection}
* that is returning successfully.
* @param {module:enyo/Collection~ActionOptions} opts - The original options passed to the action method
*	that is returning successfully.
* @param {*} res - The result, if any, returned by the [source]{@link module:enyo/Source~Source} that
*	executed it.
* @param {String} source - The name of the [source]{@link module:enyo/Collection~Collection#source} that has
*	returned successfully.
*/

/**
* @callback module:enyo/Collection~Collection~Error
* @param {module:enyo/Collection~Collection} collection - The [collection]{@link module:enyo/Collection~Collection}
* that is returning an error.
* @param {String} action - The name of the action that failed, one of `'FETCHING'`,
*	`'COMMITTING'`, or `'DESTROYING'`.
* @param {module:enyo/Collection~ActionOptions} opts - The original options passed to the
*	action method that is returning an error.
* @param {*} res - The result, if any, returned by the [source]{@link module:enyo/Source~Source}
*	that executed it.
* @param {String} source - The name of the [source]{@link module:enyo/Collection~Collection#source}
*	that has returned an error.
*/

/**
* A method used to compare two elements in an {@link module:enyo/Collection~Collection}. Should be
* implemented like callbacks used with [Array.sort()]{@glossary Array.sort}.
*
* @see {@glossary Array.sort}
* @see module:enyo/Collection~Collection#sort
* @see module:enyo/Collection~Collection#comparator
* @callback module:enyo/Collection~Collection~Comparator
* @param {module:enyo/Model~Model} a - The first [model]{@link module:enyo/Model~Model} to compare.
* @param {module:enyo/Model~Model} b - The second model to compare.
* @returns {Number} `-1` if `a` should have the lower index, `0` if they are the same,
* or `1` if `b` should have the lower index.
*/

/**
* An array-like structure designed to store instances of {@link module:enyo/Model~Model}.
* 
* @class Collection
* @extends module:enyo/Component~Component
* @mixes module:enyo/StateSupport~StateSupport
* @mixes module:enyo/EventEmitter~EventEmitter
* @public
*/
exports = module.exports = kind(
	/** @lends module:enyo/Collection~Collection.prototype */ {
	
	name: 'enyo.Collection',
	
	/**
	* @private
	*/
	kind: BaseCollection,
	
	/**
	* @private
	*/

	
	/**
	* Used by various [sources]{@link module:enyo/Collection~Collection#source} as part of the
	* [URI]{@glossary URI} from which they may be [fetched]{@link module:enyo/Collection~Collection#fetch},
	* [committed]{@link module:enyo/Collection~Collection#commit}, or [destroyed]{@link module:enyo/Collection~Collection#destroy}.
	* Some sources may use this property in other ways.
	*
	* @see module:enyo/Collection~Collection#getUrl
	* @see module:enyo/Source~Source
	* @see module:enyo/AjaxSource~AjaxSource
	* @see module:enyo/JsonpSource~JsonpSource
	* @type {String}
	* @default ''
	* @public
	*/
	url: '',
	
	/**
	* Implement this method to be used by [sources]{@link module:enyo/Model~Model#source} to
	* dynamically derive the [URI]{@glossary URI} from which they may be
	* [fetched]{@link module:enyo/Collection~Collection#fetch}, [committed]{@link module:enyo/Collection~Collection#commit},
	* or [destroyed]{@link module:enyo/Collection~Collection#destroy}. Some
	* [sources]{@link module:enyo/Collection~Collection#source} may use this property in other ways.
	* Note that if this method is implemented, the [url]{@link module:enyo/Collection~Collection#url}
	* property will not be used.
	*
	* @see module:enyo/Collection~Collection#url
	* @see module:enyo/Source~Source
	* @see module:enyo/AjaxSource~AjaxSource
	* @see module:enyo/JsonpSource~JsonpSource
	* @type {Function}
	* @default null
	* @virtual
	* @public
	*/
	getUrl: null,
	
	/**
	* The [kind]{@glossary kind) of {@link module:enyo/Model~Model} that this
	* [collection]{@link module:enyo/Collection~Collection} will contain. This is important to set properly so
	* that when [fetching]{@link module:enyo/Collection~Collection#fetch}, the returned data will be instanced
	* as the correct model [subkind]{@glossary subkind}.
	* 
	* @type {(module:enyo/Model~Model|String)}
	* @default module:enyo/Model~Model
	* @public
	*/
	model: Model,
	
	/**
	* A special type of [array]{@glossary Array} used internally by
	* {@link module:enyo/Collection~Collection}. The array should not be modified directly, nor
	* should the property be set directly. It is used as a container by the
	* collection. If [set]{@link module:enyo/Collection~Collection#set} directly, it will
	* [emit]{@link module:enyo/EventEmitter~EventEmitter#emit} a [reset]{@link module:enyo/Collection~Collection#reset}
	* event.
	*
	* @see module:enyo/Collection~Collection#modelsChanged
	* @type module:enyo/ModelList~ModelList
	* @default null
	* @readonly
	* @protected
	*/
	models: null,
	
	/**
	* The current [state]{@link module:enyo/States} of the [collection]{@link module:enyo/Collection~Collection}.
	* This value changes automatically and may be observed for more complex state
	* monitoring. The default value is [READY]{@link module:enyo/States.READY}.
	* @type module:enyo/States
	* @default module:enyo/States.READY
	* @readonly
	* @public
	* @see module:enyo/States
	* @see module:enyo/StateSupport
	*/
	status: States.READY,
	
	/**
	* The configurable default [options]{@link module:enyo/Collection~Options}. These values will be
	* used to modify the behavior of the [collection]{@link module:enyo/Collection~Collection} unless additional
	* options are passed into the methods that use them. When modifying these values in a
	* [subkind]{@glossary subkind} of {@link module:enyo/Collection~Collection}, they will be merged with
	* existing values.
	* 
	* @type {module:enyo/Collection~Options}
	* @public
	*/
	options: {
		merge: true,
		silent: false,
		purge: false,
		parse: false,
		create: true,
		find: true,
		sort: false,
		commit: false,
		destroy: false,
		complete: false,
		fetch: false,
		modelEvents: true
	},
	
	/**
	* Modifies the structure of data so that it can be used by the
	* [add()]{@link module:enyo/Collection~Collection#add} method. This method will only be used
	* during initialization or after a successful [fetch]{@link module:enyo/Collection~Collection#fetch}
	* if the [parse]{@link module:enyo/Collection~Options#parse} flag is set to `true`.
	* It may be used for simple remapping, renaming, or complex restructuring of
	* data coming from a [source]{@link module:enyo/Collection~Collection#source} that requires
	* modification before it can be added to the [collection]{@link module:enyo/Collection~Collection}.
	* This is a virtual method and must be implemented.
	* 
	* @param {*} data - The incoming data passed to the
	*	[constructor]{@link module:enyo/Collection~Collection#constructor} or returned by a successful
	*	[fetch]{@link module:enyo/Collection~Collection#fetch}.
	* @returns {Array} The properly formatted data to be accepted by the
	*	[add()]{@link module:enyo/Collection~Collection#add} method.
	* @virtual
	* @public
	*/
	parse: function (data) {
		return data;
	},
	
	/**
	* Adds data to the [collection]{@link module:enyo/Collection~Collection}. This method can add an
	* individual [model]{@link module:enyo/Model~Model} or an [array]{@glossary Array} of models.
	* It can splice them into the dataset at a designated index or remove models
	* from the existing dataset that are not included in the new one.
	* See {@link module:enyo/Collection~AddOptions} for detailed information on the
	* configuration options available for this method. This method is heavily
	* optimized for batch operations on arrays of models. For better performance,
	* ensure that loops do not consecutively call this method but instead
	* build an array to pass as the first parameter.
	* 
	* @fires module:enyo/Collection~Collection#add
	* @param {(Object|Object[]|module:enyo/Model~Model|module:enyo/Model~Model[])} models The data to add to the
	*	{@link module:enyo/Collection~Collection} that can be a [hash]{@glossary Object}, an array of
	*	hashes, an {@link module:enyo/Model~Model} instance, or and array of `Model` instances.
	* Note that if the [parse]{@link module:enyo/Collection~Collection#options#parse} configuration
	* option is `true`, it will use the returned value as this parameter.
	* @param {module:enyo/Collection~AddOptions} [opts] - The configuration options that modify
	*	the behavior of this method. The default values will be merged with these options
	* before evaluating.
	* @returns {module:enyo/Model~Model[]} The models that were added, if any.
	* @public
	*/
	add: function (models, opts) {
		var loc = this.models
			, len = this.length
			, ctor = this.model
			, options = this.options
			, pkey = ctor.prototype.primaryKey
			, idx = len
			, removedBeforeIdx = 0
			, added, keep, removed, model, attrs, found, id;
			
		// for backwards compatibility with earlier api standards we allow the
		// second paramter to be the index and third param options when
		// necessary
		!isNaN(opts) && (idx = opts);
		arguments.length > 2 && (opts = arguments[2]);
		
		// normalize options so we have values
		opts = opts? utils.mixin({}, [options, opts]): options;
		
		// our flags
		var merge = opts.merge
			, purge = opts.purge
			, silent = opts.silent
			, parse = opts.parse
			, find = opts.find
			, sort = opts.sort
			, commit = opts.commit
			, create = opts.create !== false
			, modelOpts = opts.modelOptions
			, index = opts.index;
			
		idx = !isNaN(index) ? Math.max(0, Math.min(len, index)) : idx;

		/*jshint -W018 */
		sort && !(typeof sort == 'function') && (sort = this.comparator);
		/*jshint +W018 */
		
		// for a special case purge to remove records that aren't in the current
		// set being added
		
		if (parse) models = this.parse(models);
			
		// we treat all additions as an array of additions
		!(models instanceof Array) && (models = [models]);
		
		for (var i=0, end=models.length; i<end; ++i) {
			model = models[i];
			attrs = null;
			
			if (!model && isNaN(model)) continue;
			
			// first determine if the model is an instance of model since
			// everything else hinges on this
			if (!(model instanceof Model)) {
				// we need to determine how to handle this
				attrs = model;
			}
			
			if (typeof attrs == 'string' || typeof attrs == 'number') {
				id = attrs;
				attrs = {};
				attrs[pkey] = id;
			} else id = attrs? attrs[pkey]: model;
				
			
			// see if we have an existing entry for this model/hash
			if (find) found = loc.has(id);
			
			// if it already existed...
			if (found) {
				
				// we need to ensure we've resolved the model (if necessary)
				found = loc.resolve(id);
				
				if (merge) {
					attrs || (attrs = model.attributes);
					found.set(attrs, opts);
				}
				// with the purge flag we endeavor on the expensive track of removing
				// those models currently in the collection that aren't in the incoming
				// dataset and aren't being created
				if (purge) {
					keep || (keep = {length: 0});
					keep[found.euid] = model;
					keep.length++;
				}
			} else if (attrs && find && (found = this.store.resolve(ctor, id))) {
				// in this case we were asked to search our store for an existing record
				// and we found one but we didn't previously have it so we are technically
				// adding it
				// @NOTE: Setting the _find_ option always assumes _merge_
				attrs || (attrs = model.attributes);
				parse && (attrs = found.parse(attrs));
				added || (added = []);
				added.push(found);
				this.prepareModel(found, opts);
				merge && found.set(attrs, opts);
			} else if (!attrs) {
				added || (added = []);
				added.push(model);
				this.prepareModel(model);
			} else if (create) {
				model = this.prepareModel(attrs || model, modelOpts);
				added || (added = []);
				added.push(model);
				
				// with the purge flag we endeavor on the expensive track of removing
				// those models currently in the collection that aren't in the incoming
				// dataset and aren't being created
				if (purge) {
					keep || (keep = {length: 0});
					keep[model.euid] = model;
					keep.length++;
				}
			}
		}
		
		// here we process those models to be removed if purge was true
		// the other guard is just in case we actually get to keep everything
		// so we don't do this unnecessary pass
		if (purge && (keep && keep.length)) {
			removed || (removed = []);
			keep || (keep = {});
			for (i=0; i<len; ++i) {
				if (!keep[(model = loc[i]).euid]) {
					removed.push(model);
					if (i < idx) removedBeforeIdx++;
				}
			} 
			// if we removed any we process that now
			removed.length && this.remove(removed, opts);
			idx = idx - removedBeforeIdx;
		}
		
		// added && loc.stopNotifications().add(added, idx).startNotifications();
		if (added) {
			loc.add(added, idx);
			sort && this.sort(sort, {silent: true});
			
			// we batch this operation to make use of its ~efficient array operations
			this.store.add(added); 
		}
		this.length = loc.length;
		
		
		if (!silent) {
			// notify observers of the length change
			len != this.length && this.notify('length', len, this.length);
			// notify listeners of the addition of records
			if (added) {
				this.emit('add', {models: added, collection: this, index: idx});
			}
		}
		
		// note that if commit is set but this was called from a successful fetch this will be
		// a nop (as intended)
		commit && added && this.commit(opts);
		
		return added || [];
	},
	
	/**
	* Removes data from the [collection]{@link module:enyo/Collection~Collection}. It can take a
	* [model]{@link module:enyo/Model~Model} or an [array]{@glossary Array} of models.
	* If any of the instances are present in the collection, they will be
	* removed in the order in which they are encountered. Emits the
	* [remove]{@link module:enyo/Collection~Collection#remove} event if any models were found and
	* removed from the collection (and the `silent` option is not `true`).
	* 
	* @fires module:enyo/Collection~Collection#remove
	* @param {(module:enyo/Model~Model|module:enyo/Model~Model[])} models The [models]{@link module:enyo/Model~Model} to remove
	*	if they exist in the [collection]{@link module:enyo/Collection~Collection}.
	* @param {module:enyo/Collection~Collection~RemoveOptions} [opts] - The configuration options that modify
	*	the behavior of this method.
	* @returns {module:enyo/Model~Model[]} The models that were removed, if any.
	* @public
	*/
	remove: function (models, opts) {
		var loc = this.models
			, len = loc.length
			, options = this.options
			, removed, model;
		
		// normalize options so we have values
		opts = opts? utils.mixin({}, [options, opts]): options;
		
		// our flags
		var silent = opts.silent
			, destroy = opts.destroy
			, complete = opts.complete
			, commit = opts.commit;
		
		// we treat all additions as an array of additions
		!(models instanceof Array) && (models = [models]);
		
		removed = loc.remove(models);
		
		if (removed.length) {
			
			// ensure that we can batch remove from the store
			opts.batching = true;
			
			for (var i=0, end=removed.length; i<end; ++i) {
				model = removed[i];
				
				// it is possible but highly, highly unlikely that this would have been set
				// to false by default and true at runtime...so we take our chances for the
				// small performance gain in those situations where it was defaulted to false
				if (options.modelEvents) model.off('*', this._modelEvent, this);
				if (destroy) model.destroy(opts);
			}
			
			// if complete or destroy was set we remove them from the store (batched op)
			if (complete || destroy) this.store.remove(removed);
		}
		
		this.length = loc.length;
		
		if (!silent) {
			len != this.length && this.notify('length', len, this.length);
			if (removed.length) {
				this.emit('remove', {models: removed, collection: this});
			}
		}
		
		// if this is called from an overloaded method (such as fetch or commit) or some 
		// success callback this will be a nop (as intended)
		commit && removed.length && this.commit();
		
		return removed;
	},
	
	/**
	* Retrieves a [model]{@link module:enyo/Model~Model} for the provided index.
	* 
	* @param {Number} idx - The index to return from the [collection]{@link module:enyo/Collection~Collection}.
	* @returns {(module:enyo/Model~Model|undefined)} The [model]{@link module:enyo/Model~Model} at the given index or
	*	`undefined` if it cannot be found.
	* @public
	*/
	at: function (idx) {
		return this.models[idx];
	},
	
	/**
	* Returns the JSON serializable [array]{@glossary Array} of [models]{@link module:enyo/Model~Model}
	* according to their own [raw()]{@link module:enyo/Model~Model#raw} output.
	*
	* @returns {module:enyo/Model~Model[]} The [models]{@link module:enyo/Model~Model} according to their
	*	[raw()]{@link module:enyo/Model~Model#raw} output.
	* @public
	*/
	raw: function () {
		return this.models.map(function (model) {
			return model.raw();
		});
	},
	
	/**
	* Determines if the specified [model]{@link module:enyo/Model~Model} is contained by this
	* [collection]{@link module:enyo/Collection~Collection}.
	*
	* @param {module:enyo/Model~Model} model - The [model]{@link module:enyo/Model~Model} to check.
	* @returns {Boolean} Whether or not the model belongs to the
	*	[collection]{@link module:enyo/Collection~Collection}.
	* @public
	*/
	has: function (model) {
		return this.models.has(model);
	},
	
	/**
	* @see {@glossary Array.forEach}
	* @public
	*/
	forEach: function (fn, ctx) {
		
		// ensure that this is an immutable reference to the models such that changes will
		// not affect the entire loop - e.g. calling destroy on models won't keep this from
		// completing
		return this.models.slice().forEach(fn, ctx || this);
	},
	
	/**
	* @see {@glossary Array.filter}
	* @public
	*/
	filter: function (fn, ctx) {
		
		// ensure that this is an immutable reference to the models such that changes will
		// not affect the entire loop - e.g. calling destroy on models won't keep this from
		// completing
		return this.models.slice().filter(fn, ctx || this);
	},
	
	/**
	* @see {@glossary Array.find}
	* @public
	*/
	find: function (fn, ctx) {
		
		// ensure that this is an immutable reference to the models such that changes will
		// not affect the entire loop - e.g. calling destroy on models won't keep this from
		// completing
		return this.models.slice().find(fn, ctx || this);
	},
	
	/**
	* @see {@glossary Array.map}
	* @public
	*/
	map: function (fn, ctx) {
		
		// ensure that this is an immutable reference to the models such that changes will
		// not affect the entire loop - e.g. calling destroy on models won't keep this from
		// completing
		return this.models.slice().map(fn, ctx || this);
	},
	
	/**
	* @see {@glossary Array.indexOf}
	* @public
	*/
	indexOf: function (model, offset) {
		return this.models.indexOf(model, offset);
	},
	
	/**
	* Removes all [models]{@link module:enyo/Model~Model} from the [collection]{@link module:enyo/Collection~Collection}.
	* Optionally, a model (or models) may be provided to replace the removed models.
	* If this operation is not `silent`, it will emit a `reset` event. Returns the
	* removed models, but be aware that, if the `destroy` configuration option is set,
	* the returned models will have limited usefulness.
	* 
	* @param {(module:enyo/Model~Model|module:enyo/Model~Model[])} [models] The [model or models]{@link module:enyo/Model~Model}
	*	to use as a replacement for the current set of models in the
	*	{@link module:enyo/Collection~Collection}.
	* @param {module:enyo/Collection~Options} [opts] - The options that will modify the behavior
	*	of this method.
	* @returns {module:enyo/Model~Model[]} The models that were removed from the collection.
	* @public
	*/
	empty: function (models, opts) {
		var silent,
			removed,
			len = this.length;
		
		if (models && !(models instanceof Array || models instanceof Model)) {
			// there were no models but instead some options only
			opts = models;
			models = null;
		}
		
		opts = opts || {};
		
		// just in case the entire thing was supposed to be silent
		silent = opts.silent;
		opts.silent = true;
		
		removed = this.remove(this.models, opts);
		
		// if there are models we are going to propagate the remove quietly and instead issue
		// a single reset with the new content
		if (models) this.add(models, opts);
		
		// now if the entire thing wasn't supposed to have been done silently we issue
		// a reset
		if (!silent) {
			if (len != this.length) this.notify('length', len, this.length);
			this.emit('reset', {models: this.models.copy(), collection: this});
		}
		
		return removed;
	},
	
	/**
	* Returns the [JSON]{@glossary JSON} serializable [raw()]{@link module:enyo/Collection~Collection#raw}
	* output of the [collection]{@link module:enyo/Collection~Collection}. Will automatically be executed by
	* [JSON.parse()]{@glossary JSON.parse}.
	*
	* @see module:enyo/Collection~Collection#raw
	* @returns {Object} The return value of [raw()]{@link module:enyo/Collection~Collection#raw}.
	* @public
	*/
	toJSON: function () {
		return this.raw();
	},
	
	/**
	* The default behavior of this method is the same as {@glossary Array.sort}. If the
	* [function]{@glossary Function} parameter is omitted, it will attempt to use the
	* [comparator]{@link module:enyo/Collection~Collection#comparator} (if any) from the
	* [collection]{@link module:enyo/Collection~Collection}. Note that the collection is sorted in-place
	* and returns a reference to itself. The collection
	* [emits]{@link module:enyo/EventEmitter~EventEmitter#emit} the [sort]{@link module:enyo/Collection~Collection#sort}
	* event.
	*
	* @fires module:enyo/Collection~Collection#sort
	* @see {@glossary Array.sort}
	* @param {module:enyo/Collection~Collection~Comparator} [fn] - The [comparator]{@link module:enyo/Collection~Collection#comparator}
	* method.
	* @param {module:enyo/Collection~Options} [opts] - The configuration options.
	* @returns {this} The callee for chaining.
	* @public
	*/
	sort: function (fn, opts) {
		if (fn || this.comparator) {
			var options = {silent: false}, silent;
		
			opts = opts? utils.mixin({}, [options, opts]): options;
			silent = opts.silent;
			this.models.sort(fn || this.comparator);
			!silent && this.emit('sort', {
				comparator: fn || this.comparator,
				models: this.models.copy(),
				collection: this
			});
		}
		return this;
	},
	
	/**
	* Commits the [collection]{@link module:enyo/Collection~Collection} to a
	* [source]{@link module:enyo/Collection~Collection#source} or sources. An {@link module:enyo/Collection~Collection}
	* cannot be committed if it is in an [error]{@link module:enyo/States.ERROR}
	* ({@link module:enyo/StateSupport~StateSupport#isError}) or [busy]{@link module:enyo/States.BUSY}
	* ({@link module:enyo/StateSupport~StateSupport#isBusy}) [state]{@link module:enyo/Model~Model#status}. While
	* executing, it will add the [COMMITTING]{@link module:enyo/States.COMMITTING} flag
	* to the collection's [status]{@link module:enyo/Collection~Collection#status}. Once it has
	* completed execution, it will remove this flag (even if it fails).
	*
	* @see module:enyo/Collection~Collection#committed
	* @see module:enyo/Collection~Collection#status
	* @param {module:enyo/Collection~Collection~ActionOptions} [opts] - Optional configuration options.
	* @returns {this} The callee for chaining.
	* @public
	*/
	commit: function (opts) {
		var options,
			source,
			it = this;
		
		// if the current status is not one of the error states we can continue
		if (!(this.status & (States.ERROR | States.BUSY))) {
			
			// if there were options passed in we copy them quickly so that we can hijack
			// the success and error methods while preserving the originals to use later
			options = opts ? utils.clone(opts, true) : {};
			
			// make sure we keep track of how many sources we're requesting
			source = options.source || this.source;
			if (source && ((source instanceof Array) || source === true)) {
				this._waiting = source.length ? source.slice() : Object.keys(Source.sources);
			}
				
			options.success = function (source, res) {
				it.committed(opts, res, source);
			};
			
			options.error = function (source, res) {
				it.errored('COMMITTING', opts, res, source);
			};
			
			// set the state
			this.set('status', (this.status | States.COMMITTING) & ~States.READY);
			
			// now pass this on to the source to execute as it sees fit
			Source.execute('commit', this, options);
		} else if (this.status & States.ERROR) this.errored(this.status, opts);
		
		return this;
	},
	
	/**
	* Fetches the [collection]{@link module:enyo/Collection~Collection} from a
	* [source]{@link module:enyo/Collection~Collection#source} or sources. An {@link module:enyo/Collection~Collection}
	* cannot be fetched if it is in an [error]{@link module:enyo/States.ERROR}
	* ({@link module:enyo/StateSupport~StateSupport#isError}) or [busy]{@link module:enyo/States.BUSY}
	* ({@link module:enyo/StateSupport~StateSupport#isBusy}) [state]{@link module:enyo/Model~Model#status}. While
	* executing, it will add the [FETCHING]{@link module:enyo/States.FETCHING} flag to
	* the collection's [status]{@link module:enyo/Collection~Collection#status}. Once it has
	* completed execution, it will remove this flag (even if it fails).
	*
	* @see module:enyo/Collection~Collection#fetched
	* @see module:enyo/Collection~Collection#status
	* @param {module:enyo/Collection~Collection~ActionOptions} [opts] - Optional configuration options.
	* @returns {this} The callee for chaining.
	* @public
	*/
	fetch: function (opts) {
		var options,
			source,
			it = this;
			
		// if the current status is not one of the error states we can continue
		if (!(this.status & (States.ERROR | States.BUSY))) {
			
			// if there were options passed in we copy them quickly so that we can hijack
			// the success and error methods while preserving the originals to use later
			options = opts ? utils.clone(opts, true) : {};
			
			// make sure we keep track of how many sources we're requesting
			source = options.source || this.source;
			if (source && ((source instanceof Array) || source === true)) {
				this._waiting = source.length ? source.slice() : Object.keys(Source.sources);
			}
			
			options.success = function (source, res) {
				it.fetched(opts, res, source);
			};
			
			options.error = function (source, res) {
				it.errored('FETCHING', opts, res, source);
			};
			
			// set the state
			this.set('status', (this.status | States.FETCHING) & ~States.READY);
			
			// now pass this on to the source to execute as it sees fit
			Source.execute('fetch', this, options);
		} else if (this.status & States.ERROR) this.errored(this.status, opts);
		
		return this;
	},
	
	/**
	* Destroys the [collection]{@link module:enyo/Collection~Collection}. By default, the
	* collection will only be [destroyed]{@glossary destroy} in the client. To
	* execute with a [source]{@link module:enyo/Collection~Collection#source} or sources, the
	* [commit default option]{@link module:enyo/Collection~Collection#options} must be `true` or a
	* `source` property must be explicitly provided in the `opts` parameter. A
	* collection cannot be destroyed (using a source) if it is in an
	* [error]{@link module:enyo/States.ERROR} ({@link module:enyo/StateSupport~StateSupport#isError}) or
	* [busy]{@link module:enyo/States.BUSY} ({@link module:enyo/StateSupport~StateSupport#isBusy})
	* [state]{@link module:enyo/Collection~Collection#status}. While executing, it will add the
	* [DESTROYING]{@link module:enyo/States.DESTROYING} flag to the collection's
	* [status]{@link module:enyo/Collection~Collection#status}. Once it has completed execution,
	* it will remove this flag (even if it fails).
	*
	* @see module:enyo/Collection~Collection#status
	* @param {module:enyo/Collection~Collection~ActionOptions} [opts] - Optional configuration options.
	* @returns {this} The callee for chaining.
	* @method
	* @public
	*/
	destroy: kind.inherit(function (sup) {
		return function (opts) {
			var options = opts ? utils.mixin({}, [this.options, opts]) : this.options,
				it = this,
				idx;
						
			// this becomes an (potentially) async operation if we are committing this destroy
			// to a source and its kind of tricky to figure out because there are several ways
			// it could be flagged to do this
						
			if (options.commit || options.source) {
				
				// if the current status is not one of the error states we can continue
				if (!(this.status & (States.ERROR | States.BUSY))) {
				
					// remap to the originals
					options = opts ? utils.clone(opts, true) : {};
				
					options.success = function (source, res) {
				
						if (it._waiting) {
							idx = it._waiting.findIndex(function (ln) {
								return (ln instanceof Source ? ln.name : ln) == source;
							});
							if (idx > -1) it._waiting.splice(idx, 1);
							if (!it._waiting.length) it._waiting = null;
						}
				
						// continue the operation this time with commit false explicitly
						if (!it._waiting) {
							options.commit = options.source = null;
							it.destroy(options);
						}
						if (opts && opts.success) opts.success(this, opts, res, source);
					};
			
					options.error = function (source, res) {
				
						if (it._waiting) {
							idx = it._waiting.findIndex(function (ln) {
								return (ln instanceof Source ? ln.name : ln) == source;
							});
							if (idx > -1) it._waiting.splice(idx, 1);
							if (!it._waiting.length) it._waiting = null;
						}
				
						// continue the operation this time with commit false explicitly
						if (!it._waiting) {
							options.commit = options.source = null;
							it.destroy(options);
						}
				
						// we don't bother setting the error state if we aren't waiting because 
						// it will be cleared to DESTROYED and it would be pointless
						else this.errored('DESTROYING', opts, res, source);
					};
				
					this.set('status', (this.status | States.DESTROYING) & ~States.READY);
			
					Source.execute('destroy', this, options);
				} else if (this.status & States.ERROR) this.errored(this.status, opts);
				
				// we don't allow the destroy to take place and we don't forcibly break-down
				// the collection errantly so there is an opportuniy to resolve the issue
				// before we lose access to the collection's content!
				return this;
			}
			
			if (this.length && options.destroy) this.empty(options);
			
			// set the final resting state of this collection
			this.set('status', States.DESTROYED);
			
			sup.apply(this, arguments);
		};
	}),
	
	/**
	* This is a virtual method that, when provided, will be used for sorting during
	* [add()]{@link module:enyo/Collection~Collection#add} when the `sort` flag is `true` or when the
	* [sort()]{@link module:enyo/Collection~Collection#sort} method is called without a passed-in
	* [function]{@glossary Function} parameter.
	*
	* @see module:enyo/Collection~Collection~Comparator
	* @type {module:enyo/Collection~Collection~Comparator}
	* @default null
	* @virtual
	* @method
	* @public
	*/
	comparator: null,
	
	/**
	* Used during [add()]{@link module:enyo/Collection~Collection#add} when `create` is `true` and
	* the data is a [hash]{@glossary Object}.
	*
	* @private
	*/
	prepareModel: function (attrs, opts) {
		var Ctor = this.model
			, options = this.options
			, model;
		
		attrs instanceof Ctor && (model = attrs);
		if (!model) {
			opts = opts || {};
			opts.noAdd = true;
			model = new Ctor(attrs, null, opts);
		}
		
		if (options.modelEvents) model.on('*', this._modelEvent, this);
		
		return model;
	},
	
	/**
	* When a [commit]{@link module:enyo/Collection~Collection#commit} has completed successfully, it is returned
	* to this method. This method handles special and important behavior; it should not be
	* called directly and, when overloading, care must be taken to ensure that the
	* super-method is called. This correctly sets the [status]{@link module:enyo/Collection~Collection#status}
	* and, in cases where multiple [sources]{@link module:enyo/Collection~Collection#source} were used, it waits
	* until all have responded before clearing the [COMMITTING]{@link module:enyo/States.COMMITTING}
	* flag. If a [success]{@link module:enyo/Collection~Collection~Success} callback was provided, it will be
	* called once for each source.
	*
	* @param {module:enyo/Collection~Collection~ActionOptions} opts - The original options passed to
	*	[commit()]{@link module:enyo/Collection~Collection#commit}, merged with the defaults.
	* @param {*} [res] - The result provided from the given
	* [source]{@link module:enyo/Collection~Collection#source}, if any. This will vary depending
	* on the source.
	* @param {String} source - The name of the source that has completed successfully.
	* @public
	*/
	committed: function (opts, res, source) {
		var idx;
		
		if (this._waiting) {
			idx = this._waiting.findIndex(function (ln) {
				return (ln instanceof Source ? ln.name : ln) == source;
			});
			if (idx > -1) this._waiting.splice(idx, 1);
			if (!this._waiting.length) this._waiting = null;
		}
		
		if (opts && opts.success) opts.success(this, opts, res, source);
		
		// clear the state
		if (!this._waiting) {
			this.set('status', (this.status | States.READY) & ~States.COMMITTING);
		}
	},
	
	/**
	* When a [fetch]{@link module:enyo/Collection~Collection#fetch} has completed successfully, it is returned
	* to this method. This method handles special and important behavior; it should not be
	* called directly and, when overloading, care must be taken to ensure that you call the
	* super-method. This correctly sets the [status]{@link module:enyo/Collection~Collection#status} and, in
	* cases where multiple [sources]{@link module:enyo/Collection~Collection#source} were used, it waits until
	* all have responded before clearing the [FETCHING]{@link module:enyo/States.FETCHING} flag. If
	* a [success]{@link module:enyo/Collection~Collection~Success} callback was provided, it will be called
	* once for each source.
	*
	* @param {module:enyo/Collection~Collection~ActionOptions} opts - The original options passed to
	*	[fetch()]{@link module:enyo/Collection~Collection#fetch}, merged with the defaults.
	* @param {*} [res] - The result provided from the given
	* [source]{@link module:enyo/Collection~Collection#source}, if any. This will vary depending
	*	on the source.
	* @param {String} source - The name of the source that has completed successfully.
	* @public
	*/
	fetched: function (opts, res, source) {
		var idx;
		
		if (this._waiting) {
			idx = this._waiting.findIndex(function (ln) {
				return (ln instanceof Source ? ln.name : ln) == source;
			});
			if (idx > -1) this._waiting.splice(idx, 1);
			if (!this._waiting.length) this._waiting = null;
		}
		
		// if there is a result we add it to the collection passing it any per-fetch options
		// that will override the defaults (e.g. parse) we don't do that here as it will
		// be done in the add method -- also note we reassign the result to whatever was
		// actually added and pass that to any other success callback if there is one
		if (res) res = this.add(res, opts);
		
		// now look for an additional success callback
		if (opts && opts.success) opts.success(this, opts, res, source);
		
		// clear the state
		if (!this._waiting) {
			this.set('status', (this.status | States.READY) & ~States.FETCHING);
		}
	},
	
	/**
	* If an error is encountered while [fetching]{@link module:enyo/Collection~Collection#fetch},
	* [committing]{@link module:enyo/Collection~Collection#commit}, or [destroying]{@link module:enyo/Collection~Collection#destroy}
	* the [collection]{@link module:enyo/Collection~Collection}, this method will be called. By
	* default, it updates the collection's [status]{@link module:enyo/Collection~Collection#status}
	* property and then checks to see if there is a provided
	* [error handler]{@link module:enyo/Collection~Collection~Error}. If the error handler
	* exists, it will be called.
	* 
	* @param {String} action - The name of the action that failed,
	* one of `'FETCHING'` or `'COMMITTING'`.
	* @param {module:enyo/Collection~Collection~ActionOptions} opts - The options hash originally
	* passed along with the original action.
	* @param {*} [res] - The result of the requested `action`; varies depending on the
	*	requested [source]{@link module:enyo/Collection~Collection#source}.
	* @param {String} source - The name of the source that has returned an error.
	* @public
	*/
	errored: function (action, opts, res, source) {
		var stat;
		
		// if the error action is a status number then we don't need to update it otherwise
		// we set it to the known state value
		if (typeof action == 'string') {
			
			// all built-in errors will pass this as their values are > 0 but we go ahead and
			// ensure that no developer used the 0x00 for an error code
			stat = States['ERROR_' + action];
		} else stat = action;
		
		if (isNaN(stat) || !(stat & States.ERROR)) stat = States.ERROR_UNKNOWN;
		
		// if it has changed give observers the opportunity to respond
		this.set('status', (this.status | stat) & ~States.READY);
		
		// we need to check to see if there is an options handler for this error
		if (opts && opts.error) opts.error(this, action, opts, res, source);
	},
	
	/**
	* Overloaded version of the method to call [set()]{@link module:enyo/Collection~Collection#set}
	* instead of simply assigning the value. This allows it to
	* [notify observers]{@link module:enyo/ObserverSupport} and thus update
	* [bindings]{@link module:enyo/BindingSupport#binding} as well.
	*
	* @see {@link module:enyo/StateSupport~StateSupport#clearError}
	* @public
	*/
	clearError: function () {
		return this.set('status', States.READY);
	},
	
	/**
	* @private
	*/
	_modelEvent: function (model, e) {
		switch (e) {
		case 'change':
			this.emit('change', {model: model});
			break;
		case 'destroy':
			this.remove(model);
			break;
		}
	},
	
	/**
	* Responds to changes to the [models]{@link module:enyo/Collection~Collection#models} property.
	*
	* @see module:enyo/Collection~Collection#models
	* @fires module:enyo/Collection~Collection#reset
	* @type {module:enyo/ObserverSupport~ObserverSupport~Observer}
	* @public
	*/
	modelsChanged: function (was, is, prop) {
		var models = this.models.copy(),
			len = models.length;
		
		if (len != this.length) this.set('length', len);
		
		this.emit('reset', {models: models, collection: this});
	},
	
	/**
	* Initializes the [collection]{@link module:enyo/Collection~Collection}.
	*
	* @param {(Object|Object[]|module:enyo/Model~Model[])} [recs] May be an [array]{@glossary Array}
	*	of either [models]{@link module:enyo/Model~Model} or [hashes]{@glossary Object} used to
	* initialize the [collection]{@link module:enyo/Collection~Collection}, or an [object]{@glossary Object}
	*	equivalent to the `props` parameter.
	* @param {Object} [props] - A hash of properties to apply directly to the
	* collection.
	* @param {Object} [opts] - A hash.
	* @method
	* @public
	*/
	constructor: kind.inherit(function (sup) {
		return function (recs, props, opts) {
			// opts = opts? (this.options = enyo.mixin({}, [this.options, opts])): this.options;
			
			// if properties were passed in but not a records array
			props = recs && !(recs instanceof Array)? recs: props;
			if (props === recs) recs = null;
			// initialize our core records
			// this.models = this.models || new ModelList();
			!this.models && (this.set('models', new ModelList()));
			
			// this is backwards compatibility
			if (props && props.records) {
				recs = recs? recs.concat(props.records): props.records.slice();
				delete props.records;
			}
			
			if (props && props.models) {
				recs = recs? recs.concat(props.models): props.models.slice();
				delete props.models;
			}
			
			if (props && props.options) {
				this.options = utils.mixin({}, [this.options, props.options]);
				delete props.options;
			}
			
			opts = opts? utils.mixin({}, [this.options, opts]): this.options;
			
			// @TODO: For now, while there is only one property we manually check for it
			// if more options arrise that should be configurable this way it may need to
			// be modified
			opts.fetch && (this.options.fetch = opts.fetch);
			
			this.length = this.models.length;
			this.euid = utils.uid('c');
			
			sup.call(this, props);
			
			typeof this.model == 'string' && (this.model = kind.constructorForKind(this.model));
			this.store = this.store || Store;
			recs && recs.length && this.add(recs, opts);
		};
	}),
	
	/**
	* @method
	* @private
	*/
	constructed: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			
			// automatically attempt a fetch after initialization is complete
			if (this.options.fetch) this.fetch();
		};
	})
	
});

/**
* @name module:enyo/Collection~Collection.concat
* @static
* @private
*/
exports.concat = function (ctor, props) {
	var proto = ctor.prototype || ctor;
	
	if (props.options) {
		proto.options = utils.mixin({}, [proto.options, props.options]);
		delete props.options;
	}
};
