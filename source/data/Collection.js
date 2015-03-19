(function (enyo, scope) {
	
	var kind = enyo.kind;
	
	var Component = enyo.Component,
		EventEmitter = enyo.EventEmitter,
		Model = enyo.Model,
		ModelList = enyo.ModelList,
		StateSupport = enyo.StateSupport,
		Source = enyo.Source;
	
	var STATES = enyo.States;
	
	/**
	* This is only necessary because of the order in which mixins are applied.
	*
	* @class
	* @private
	*/
	var BaseCollection = enyo.kind({
		kind: Component,
		mixins: [EventEmitter, StateSupport]
	});
	
	/**
	* Fires when [models]{@link enyo.Model} have been [added]{@link enyo.Collection#add}
	* to the [collection]{@link enyo.Collection}.
	*
	* @event enyo.Collection#add
	* @type {Object}
	* @property {enyo.Model[]} models - An [array]{@glossary Array} of
	*	[models]{@link enyo.Model} that were [added]{@link enyo.Collection#add} to the
	*	[collection]{@link enyo.Collection}.
	* @property {enyo.Collection} collection - A reference to the
	*	collection that [emitted]{@link enyo.EventEmitter.emit} the event.
	* @property {Number} index - The index in the given collection where the models were inserted.
	* @public
	*/
	
	/**
	* Fires when [models]{@link enyo.Model} have been [removed]{@link enyo.Collection#remove}
	* from the [collection]{@link enyo.Collection}.
	*
	* @event enyo.Collection#remove
	* @type {Object}
	* @property {enyo.Model[]} models - An [array]{@glossary Array} of
	*	[models]{@link enyo.Model} that were [removed]{@link enyo.Collection#remove} from the
	*	[collection]{@link enyo.Collection}.
	* @property {enyo.Collection} collection - A reference to the
	*	collection that [emitted]{@link enyo.EventEmitter.emit} the event.
	* @public
	*/
	
	/**
	* Fires when the [collection]{@link enyo.Collection} has been
	* [sorted]{@link enyo.Collection#sort}.
	*
	* @event enyo.Collection#sort
	* @type {Object}
	* @property {enyo.Model[]} models - An [array]{@glossary Array} of all
	*	[models]{@link enyo.Model} in the correct, [sorted]{@link enyo.Collection#sort} order.
	* @property {enyo.Collection} collection - A reference to the
	*	[collection]{@link enyo.Collection} that [emitted]{@link enyo.EventEmitter.emit} the event.
	* @property {Function} comparator - A reference to the
	*	[comparator]{@link enyo.Collection#comparator} that was used when
	*	sorting the collection.
	* @public
	*/
	
	/**
	* Fires when the [collection]{@link enyo.Collection} has been reset and its
	* contents have been updated arbitrarily.
	*
	* @event enyo.Collection#reset
	* @type {Object}
	* @property {enyo.Model[]} models - An [array]{@glossary Array} of all
	*	[models]{@link enyo.Model} as they are currently.
	* @property {enyo.Collection} collection - A reference to the
	*	[collection]{@link enyo.Collection} that [emitted]{@link enyo.EventEmitter.emit} the event.
	* @public
	*/
	
	/**
	* The default configurable [options]{@link enyo.Collection#options} used by certain API
	* methods of {@link enyo.Collection}.
	*
	* @typedef {Object} enyo.Collection~Options
	* @property {Boolean} merge=true - If `true`, when data is being added to the
	*	[collection]{@link enyo.Collection} that already exists (i.e., is matched by
	*	[primaryKey]{@link enyo.Model#primaryKey}), the new data values will be set
	* with the current [model]{@link enyo.Model} instance. This means that the
	* existing values will be updated with the new ones by calling
	* [set()]{@link enyo.Model#set} on the model.
	* @property {Boolean} silent=false - Many accessor methods of the collection
	*	will emit events and/or notifications. This value indicates whether or not
	*	those events or notifications will be suppressed at times when that behavior
	*	is necessary. Typically, you will not want to modify this value.
	* @property {Boolean} purge=false - When [adding]{@link enyo.Collection#add}
	*	models, this flag indicates whether or not to [remove]{@link enyo.Collection#remove}
	* (purge) the existing models that are not included in the new dataset.
	* @property {Boolean} parse=false - The collection's [parse()]{@link enyo.Collection#parse}
	*	method can be executed automatically when incoming data is added via the
	*	[constructor()]{@link enyo.Collection#constructor} method, or, later, via a
	*	[fetch]{@link enyo.Collection#fetch}. You may need to examine the runtime
	* configuration options of the method(s) to determine whether parsing is needed.
	* In cases where parsing will always be necessary, this may be set to `true`.
	* @property {Boolean} create=true - This value determines whether a new
	*	model will be created when data being added to the collection cannot be found
	* (or the [find]{@link enyo.Collection#options#find} flag is `false`). Models
	* that are created by a collection have their [owner]{@link enyo.Model#owner}
	* property set to the collection that instanced them.
	* @property {Boolean} find=true - When data being added to the collection is not
	* already a model instance, the collection will attempt to find an existing model
	* by its `primaryKey`, if it exists. In most cases, this is the preferred behavior,
	* but if the model [kind]{@glossary kind} being  instanced does not have a
	* `primaryKey`, it is unnecessary and this value may be set to `false`.
	* @property {Boolean} sort=false - When adding models to the collection, the
	* collection can also be sorted. If the [comparator]{@link enyo.Collection#comparator}
	* is a [function]{@glossary Function} and this value is `true`, the comparator
	*	will be used to sort the entire collection. It may also be a function that
	* will be used to sort the collection, instead of (or in the place of) a defined
	*	comparator.
	* @property {Boolean} commit=false - When modifications are made to the
	*	collection, this flag ensures that those changes are
	*	[committed]{@link enyo.Collection#commit} according to the configuration and
	*	availability of a [source]{@link enyo.Collection#source}. This may also be
	* configured per-call to methods that use it.
	* @property {Boolean} destroy=false - When models are removed from the collection,
	*	this flag indicates whether or not they will be [destroyed]{@link enyo.Model#destroy}
	* as well. Note that this could have a significant impact if the same models are
	* used in other collections.
	* @property {Boolean} complete=false - When models are removed from the
	* collection, this flag indicates whether or not they will also be removed from
	* the [store]{@link enyo.Collection#store}. This is rarely necessary and can
	* cause problems if the models are used in other collections. In addition, this
	* value will be ignored if the [destroy]{@link enyo.Collection#options#destroy}
	* flag is `true`.
	* @property {Boolean} fetch=false - If `true`, when the collection is initialized,
	* it will automatically attempt to fetch data if the
	* [source]{@link enyo.Collection#source} and [url]{@link enyo.Collection#url}
	*	or [getUrl]{@link enyo.Collection#getUrl} properties are properly configured.
	* @property {Boolean} modelEvents=true - If `false`, this will keep the collection from
	*	registering with each model for individual model events.
	*/
	
	/**
	* The configuration options for [add()]{@link enyo.Collection#add}. For complete
	* descriptions of the options and their default values, see
	* {@link enyo.Collection#options}. Note that some properties have different
	* meanings in different contexts. Please review the descriptions below to see
	* how each property is used in this context.
	* 
	* @typedef {enyo.Collection~Options} enyo.Collection~AddOptions
	* @property {Boolean} merge - Update existing [models]{@link enyo.Model} when found.
	* @property {Boolean} purge - Remove existing models not in the new dataset.
	* @property {Boolean} silent - Emit [events]{@glossary event} and notifications.
	* @property {Boolean} parse - Parse the incoming dataset before evaluating.
	* @property {Boolean} find - Look for an existing model.
	* @property {(Boolean|Function)} sort - Sort the finalized dataset.
	* @property {Boolean} commit - [Commit]{@link enyo.Collection#commit} changes to the
	*	{@link enyo.Collection} after completing the [add]{@link enyo.Collection#add}
	* operation.
	* @property {Boolean} create - When an existing {@link enyo.Model} instance cannot be
	*	resolved, a new instance should be created.
	* @property {number} index - The index at which to add the new dataset. Defaults to the
	*	end of the current dataset if not explicitly set or invalid.
	* @property {Boolean} destroy - If `purge` is `true`, this will
	* [destroy]{@link enyo.Model#destroy} any models that are
	* [removed]{@link enyo.Collection#remove}.
	* @property {Object} modelOptions - When instancing a model, this
	*	[object]{@glossary Object} will be passed to the constructor as its `options`
	*	parameter.
	*/
	
	/**
	* The configuration options for [remove()]{@link enyo.Collection#remove}. For
	* complete descriptions of the options and their defaults, see
	* {@link enyo.Collection~Options}. Note that some properties have different
	* meanings in different contexts. Please review the descriptions below to see
	* how each property is used in this context.
	* 
	* @typedef {enyo.Collection~Options} enyo.Collection~RemoveOptions
	* @property {Boolean} silent - Emit [events]{@glossary event} and notifications.
	* @property {Boolean} commit - [Commit]{@link enyo.Collection#commit} changes to the
	*	[collection]{@link enyo.Collection} after completing the
	*	[remove]{@link enyo.Collection#remove} operation.
	* @property {Boolean} complete - Remove the [model]{@link enyo.Model} from the
	*	[store]{@link enyo.Collection#store} as well as the collection.
	* @property {Boolean} destroy - [Destroy]{@link enyo.Model#destroy} models
	*	that are removed from the collection.
	*/
	
	/**
	* The configurable options for [fetch()]{@link enyo.Collection#fetch},
	* [commit()]{@link enyo.Collection#commit}, and [destroy()]{@link enyo.Collection#destroy}.
	*
	* @typedef {enyo.Collection~Options} enyo.Collection~ActionOptions
	* @property {enyo.Collection~Success} success - The callback executed upon successful
	*	completion.
	* @property {enyo.Collection~Error} error - The callback executed upon a failed attempt.
	*/
	
	/**
	* @callback enyo.Collection~Success
	* @param {enyo.Collection} collection - The [collection]{@link enyo.Collection}
	* that is returning successfully.
	* @param {enyo.Collection~ActionOptions} - opts The original options passed to the action method
	*	that is returning successfully.
	* @param {*} - res The result, if any, returned by the [source]{@link enyo.Source} that
	*	executed it.
	* @param {String} source - The name of the [source]{@link enyo.Collection#source} that has
	*	returned successfully.
	*/
	
	/**
	* @callback enyo.Collection~Error
	* @param {enyo.Collection} collection - The [collection]{@link enyo.Collection}
	* that is returning an error.
	* @param {String} action - The name of the action that failed, one of `'FETCHING'`,
	*	`'COMMITTING'`, or `'DESTROYING'`.
	* @param {enyo.Collection~ActionOptions} opts - The original options passed to the
	*	action method that is returning an error.
	* @param {*} res - The result, if any, returned by the [source]{@link enyo.Source}
	*	that executed it.
	* @param {String} source - The name of the [source]{@link enyo.Collection#source}
	*	that has returned an error.
	*/
	
	/**
	* A method used to compare two elements in an {@link enyo.Collection}. Should be
	* implemented like callbacks used with [Array.sort()]{@glossary Array.sort}.
	*
	* @see {@glossary Array.sort}
	* @see enyo.Collection.sort
	* @see enyo.Collection.comparator
	* @callback enyo.Collection~Comparator
	* @param {enyo.Model} a - The first [model]{@link enyo.Model} to compare.
	* @param {enyo.Model} b - The second model to compare.
	* @returns {Number} `-1` if `a` should have the lower index, `0` if they are the same,
	* or `1` if `b` should have the lower index.
	*/
	
	/**
	* An array-like structure designed to store instances of {@link enyo.Model}.
	* 
	* @class enyo.Collection
	* @extends enyo.Component
	* @mixes enyo.StateSupport
	* @mixes enyo.EventEmitter
	* @public
	*/
	var Collection = kind(
		/** @lends enyo.Collection.prototype */ {
		
		/**
		* @private
		*/
		name: 'enyo.Collection',
		
		/**
		* @private
		*/
		kind: BaseCollection,
		
		/**
		* @private
		*/
		noDefer: true,
		
		/**
		* Used by various [sources]{@link enyo.Collection#source} as part of the
		* [URI]{@glossary URI} from which they may be [fetched]{@link enyo.Collection#fetch},
		* [committed]{@link enyo.Collection#commit}, or [destroyed]{@link enyo.Collection#destroy}.
		* Some sources may use this property in other ways.
		*
		* @see enyo.Collection.getUrl
		* @see enyo.Source
		* @see enyo.AjaxSource
		* @see enyo.JsonpSource
		* @type {String}
		* @default ''
		* @public
		*/
		url: '',
		
		/**
		* Implement this method to be used by [sources]{@link enyo.Model#source} to
		* dynamically derive the [URI]{@glossary URI} from which they may be
		* [fetched]{@link enyo.Collection#fetch}, [committed]{@link enyo.Collection#commit},
		* or [destroyed]{@link enyo.Collection#destroy}. Some
		* [sources]{@link enyo.Collection#source} may use this property in other ways.
		* Note that if this method is implemented, the [url]{@link enyo.Collection#url}
		* property will not be used.
		*
		* @see enyo.Collection.url
		* @see enyo.Source
		* @see enyo.AjaxSource
		* @see enyo.JsonpSource
		* @type {Function}
		* @default null
		* @virtual
		* @public
		*/
		getUrl: null,
		
		/**
		* The [kind]{@glossary kind) of {@link enyo.Model} that this
		* [collection]{@link enyo.Collection} will contain. This is important to set properly so
		* that when [fetching]{@link enyo.Collection#fetch}, the returned data will be instanced
		* as the correct model [subkind]{@glossary subkind}.
		* 
		* @type {(enyo.Model|String)}
		* @default enyo.Model
		* @public
		*/
		model: Model,
		
		/**
		* A special type of [array]{@glossary Array} used internally by
		* {@link enyo.Collection}. The array should not be modified directly, nor
		* should the property be set directly. It is used as a container by the
		* collection. If [set]{@link enyo.Collection#set} directly, it will
		* [emit]{@link enyo.EventEmitter.emit} a [reset]{@link enyo.Collection#reset}
		* event.
		*
		* @see enyo.Collection.modelsChanged
		* @type enyo.ModelList
		* @default null
		* @readonly
		* @protected
		*/
		models: null,
		
		/**
		* The current [state]{@link enyo~States} of the [collection]{@link enyo.Collection}.
		* This value changes automatically and may be observed for more complex state
		* monitoring. The default value is [READY]{@link enyo~States.READY}.
		* @type enyo.States
		* @default enyo~States.READY
		* @readonly
		* @public
		* @see enyo.States
		* @see enyo.StateSupport
		*/
		status: STATES.READY,
		
		/**
		* The configurable default [options]{@link enyo.Collection~Options}. These values will be
		* used to modify the behavior of the [collection]{@link enyo.Collection} unless additional
		* options are passed into the methods that use them. When modifying these values in a
		* [subkind]{@glossary subkind} of {@link enyo.Collection}, they will be merged with
		* existing values.
		* 
		* @type {enyo.Collection~Options}
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
		* [add()]{@link enyo.Collection#add} method. This method will only be used
		* during initialization or after a successful [fetch]{@link enyo.Collection#fetch}
		* if the [parse]{@link enyo.Collection~Options.parse} flag is set to `true`.
		* It may be used for simple remapping, renaming, or complex restructuring of
		* data coming from a [source]{@link enyo.Collection#source} that requires
		* modification before it can be added to the [collection]{@link enyo.Collection}.
		* This is a virtual method and must be implemented.
		* 
		* @param {*} data - The incoming data passed to the
		*	[constructor]{@link enyo.Collection#constructor} or returned by a successful
		*	[fetch]{@link enyo.Collection#fetch}.
		* @returns {Array} The properly formatted data to be accepted by the
		*	[add()]{@link enyo.Collection#add} method.
		* @virtual
		* @public
		*/
		parse: function (data) {
			return data;
		},
		
		/**
		* Adds data to the [collection]{@link enyo.Collection}. This method can add an
		* individual [model]{@link enyo.Model} or an [array]{@glossary Array} of models.
		* It can splice them into the dataset at a designated index or remove models
		* from the existing dataset that are not included in the new one.
		* See {@link enyo.Collection~AddOptions} for detailed information on the
		* configuration options available for this method. This method is heavily
		* optimized for batch operations on arrays of models. For better performance,
		* ensure that loops do not consecutively call this method but instead
		* build an array to pass as the first parameter.
		* 
		* @fires enyo.Collection#add
		* @param {(Object|Object[]|enyo.Model|enyo.Model[])} models The data to add to the
		*	{@link enyo.Collection} that can be a [hash]{@glossary Object}, an array of
		*	hashes, an {@link enyo.Model} instance, or and array of `enyo.Model` instances.
		* Note that if the [parse]{@link enyo.Collection#options#parse} configuration
		* option is `true`, it will use the returned value as this parameter.
		* @param {enyo.Collection~AddOptions} [opts] - The configuration options that modify
		*	the behavior of this method. The default values will be merged with these options
		* before evaluating.
		* @returns {enyo.Model[]} The models that were added, if any.
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
			opts = opts? enyo.mixin({}, [options, opts]): options;
			
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
		* Removes data from the [collection]{@link enyo.Collection}. It can take a
		* [model]{@link enyo.Model} or an [array]{@glossary Array} of models.
		* If any of the instances are present in the collection, they will be
		* removed in the order in which they are encountered. Emits the
		* [remove]{@link enyo.Collection#remove} event if any models were found and
		* removed from the collection (and the `silent` option is not `true`).
		* 
		* @fires enyo.Collection#remove
		* @param {(enyo.Model|enyo.Model[])} models The [models]{@link enyo.Model} to remove		
		*	if they exist in the [collection]{@link enyo.Collection}.
		* @param {enyo.Collection~RemoveOptions} [opts] - The configuration options that modify
		*	the behavior of this method.
		* @returns {enyo.Model[]} The models that were removed, if any.
		* @public
		*/
		remove: function (models, opts) {
			var loc = this.models
				, len = loc.length
				, options = this.options
				, removed, model;
			
			// normalize options so we have values
			opts = opts? enyo.mixin({}, [options, opts]): options;
			
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
		* Retrieves a [model]{@link enyo.Model} for the provided index.
		* 
		* @param {Number} idx - The index to return from the [collection]{@link enyo.Collection}.
		* @returns {(enyo.Model|undefined)} The [model]{@link enyo.Model} at the given index or
		*	`undefined` if it cannot be found.
		* @public
		*/
		at: function (idx) {
			return this.models[idx];
		},
		
		/**
		* Returns the JSON serializable [array]{@glossary Array} of [models]{@link enyo.Model}
		* according to their own [raw()]{@link enyo.Model#raw} output.
		*
		* @returns {enyo.Model[]} The [models]{@link enyo.Model} according to their
		*	[raw()]{@link enyo.Model#raw} output.
		* @public
		*/
		raw: function () {
			return this.models.map(function (model) {
				return model.raw();
			});
		},
		
		/**
		* Determines if the specified [model]{@link enyo.Model} is contained by this
		* [collection]{@link enyo.Collection}.
		*
		* @param {enyo.Model} model - The [model]{@link enyo.Model} to check.
		* @returns {Boolean} Whether or not the model belongs to the
		*	[collection]{@link enyo.Collection}.
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
		* Removes all [models]{@link enyo.Model} from the [collection]{@link enyo.Collection}.
		* Optionally, a model (or models) may be provided to replace the removed models.
		* If this operation is not `silent`, it will emit a `reset` event. Returns the
		* removed models, but be aware that, if the `destroy` configuration option is set,
		* the returned models will have limited usefulness.
		* 
		* @param {(enyo.Model|enyo.Model[])} [models] The [model or models]{@link enyo.Model}
		*	to use as a replacement for the current set of models in the
		*	{@link enyo.Collection}.
		* @param {enyo.Collection~Options} [opts] - The options that will modify the behavior
		*	of this method.
		* @returns {enyo.Model[]} The models that were removed from the collection.
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
		* Returns the [JSON]{@glossary JSON} serializable [raw()]{@link enyo.Collection#raw}
		* output of the [collection]{@link enyo.Collection}. Will automatically be executed by
		* [JSON.parse()]{@glossary JSON.parse}.
		*
		* @see enyo.Collection.raw
		* @returns {Object} The return value of [raw()]{@link enyo.Collection#raw}.
		* @public
		*/
		toJSON: function () {
			return this.raw();
		},
		
		/**
		* The default behavior of this method is the same as {@glossary Array.sort}. If the
		* [function]{@glossary Function} parameter is omitted, it will attempt to use the
		* [comparator]{@link enyo.Collection#comparator} (if any) from the
		* [collection]{@link enyo.Collection}. Note that the collection is sorted in-place
		* and returns a reference to itself. The collection
		* [emits]{@link enyo.EventEmitter.emit} the [sort]{@link enyo.Collection#sort}
		* event.
		*
		* @fires enyo.Collection#sort
		* @see {@glossary Array.sort}
		* @param {enyo.Collection~Comparator} [fn] - The [comparator]{@link enyo.Collection#comparator}
		* method.
		* @param {enyo.Collection~Options} [opts] - The configuration options.
		* @returns {this} The callee for chaining.
		* @public
		*/
		sort: function (fn, opts) {
			if (fn || this.comparator) {
				var options = {silent: false}, silent;
			
				opts = opts? enyo.mixin({}, [options, opts]): options;
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
		* Commits the [collection]{@link enyo.Collection} to a
		* [source]{@link enyo.Collection#source} or sources. An {@link enyo.Collection}
		* cannot be committed if it is in an [error]{@link enyo~States.ERROR}
		* ({@link enyo.StateSupport.isError}) or [busy]{@link enyo~States.BUSY}
		* ({@link enyo.StateSupport.isBusy}) [state]{@link enyo.Model#status}. While
		* executing, it will add the [COMMITTING]{@link enyo~States.COMMITTING} flag
		* to the collection's [status]{@link enyo.Collection#status}. Once it has
		* completed execution, it will remove this flag (even if it fails).
		*
		* @see enyo.Collection.committed
		* @see enyo.Collection.status
		* @param {enyo.Collection~ActionOptions} [opts] - Optional configuration options.
		* @returns {this} The callee for chaining.
		* @public
		*/
		commit: function (opts) {
			var options,
				source,
				it = this;
			
			// if the current status is not one of the error states we can continue
			if (!(this.status & (STATES.ERROR | STATES.BUSY))) {
				
				// if there were options passed in we copy them quickly so that we can hijack
				// the success and error methods while preserving the originals to use later
				options = opts ? enyo.clone(opts, true) : {};
				
				// make sure we keep track of how many sources we're requesting
				source = options.source || this.source;
				if (source && ((source instanceof Array) || source === true)) {
					this._waiting = source.length ? source.slice() : Object.keys(enyo.sources);
				}
					
				options.success = function (source, res) {
					it.committed(opts, res, source);
				};
				
				options.error = function (source, res) {
					it.errored('COMMITTING', opts, res, source);
				};
				
				// set the state
				this.set('status', (this.status | STATES.COMMITTING) & ~STATES.READY);
				
				// now pass this on to the source to execute as it sees fit
				Source.execute('commit', this, options);
			} else if (this.status & STATES.ERROR) this.errored(this.status, opts);
			
			return this;
		},
		
		/**
		* Fetches the [collection]{@link enyo.Collection} from a
		* [source]{@link enyo.Collection#source} or sources. An {@link enyo.Collection}
		* cannot be fetched if it is in an [error]{@link enyo~States.ERROR}
		* ({@link enyo.StateSupport.isError}) or [busy]{@link enyo~States.BUSY}
		* ({@link enyo.StateSupport.isBusy}) [state]{@link enyo.Model#status}. While
		* executing, it will add the [FETCHING]{@link enyo~States.FETCHING} flag to
		* the collection's [status]{@link enyo.Collection#status}. Once it has
		* completed execution, it will remove this flag (even if it fails).
		*
		* @see enyo.Collection.fetched
		* @see enyo.Collection.status
		* @param {enyo.Collection~ActionOptions} [opts] - Optional configuration options.
		* @returns {this} The callee for chaining.
		* @public
		*/
		fetch: function (opts) {
			var options,
				source,
				it = this;
				
			// if the current status is not one of the error states we can continue
			if (!(this.status & (STATES.ERROR | STATES.BUSY))) {
				
				// if there were options passed in we copy them quickly so that we can hijack
				// the success and error methods while preserving the originals to use later
				options = opts ? enyo.clone(opts, true) : {};
				
				// make sure we keep track of how many sources we're requesting
				source = options.source || this.source;
				if (source && ((source instanceof Array) || source === true)) {
					this._waiting = source.length ? source.slice() : Object.keys(enyo.sources);
				}
				
				options.success = function (source, res) {
					it.fetched(opts, res, source);
				};
				
				options.error = function (source, res) {
					it.errored('FETCHING', opts, res, source);
				};
				
				// set the state
				this.set('status', (this.status | STATES.FETCHING) & ~STATES.READY);
				
				// now pass this on to the source to execute as it sees fit
				Source.execute('fetch', this, options);
			} else if (this.status & STATES.ERROR) this.errored(this.status, opts);
			
			return this;
		},
		
		/**
		* Destroys the [collection]{@link enyo.Collection}. By default, the
		* collection will only be [destroyed]{@glossary destroy} in the client. To
		* execute with a [source]{@link enyo.Collection#source} or sources, the
		* [commit default option]{@link enyo.Collection#options} must be `true` or a
		* `source` property must be explicitly provided in the `opts` parameter. A
		* collection cannot be destroyed (using a source) if it is in an
		* [error]{@link enyo~States.ERROR} ({@link enyo.StateSupport.isError}) or
		* [busy]{@link enyo~States.BUSY} ({@link enyo.StateSupport.isBusy})
		* [state]{@link enyo.Collection#status}. While executing, it will add the
		* [DESTROYING]{@link enyo~States.DESTROYING} flag to the collection's
		* [status]{@link enyo.Collection#status}. Once it has completed execution,
		* it will remove this flag (even if it fails).
		*
		* @see enyo.Collection.status
		* @param {enyo.Collection~ActionOptions} [opts] - Optional configuration options.
		* @returns {this} The callee for chaining.
		* @method
		* @public
		*/
		destroy: enyo.inherit(function (sup) {
			return function (opts) {
				var options = opts ? enyo.mixin({}, [this.options, opts]) : this.options,
					it = this,
					idx;
							
				// this becomes an (potentially) async operation if we are committing this destroy
				// to a source and its kind of tricky to figure out because there are several ways
				// it could be flagged to do this
							
				if (options.commit || options.source) {
					
					// if the current status is not one of the error states we can continue
					if (!(this.status & (STATES.ERROR | STATES.BUSY))) {
					
						// remap to the originals
						options = opts ? enyo.clone(opts, true) : {};
					
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
					
						this.set('status', (this.status | STATES.DESTROYING) & ~STATES.READY);
				
						Source.execute('destroy', this, options);
					} else if (this.status & STATES.ERROR) this.errored(this.status, opts);
					
					// we don't allow the destroy to take place and we don't forcibly break-down
					// the collection errantly so there is an opportuniy to resolve the issue
					// before we lose access to the collection's content!
					return this;
				}
				
				if (this.length && options.destroy) this.empty(options);
				
				// set the final resting state of this collection
				this.set('status', STATES.DESTROYED);
				
				sup.apply(this, arguments);
			};
		}),
		
		/**
		* This is a virtual method that, when provided, will be used for sorting during
		* [add()]{@link enyo.Collection#add} when the `sort` flag is `true` or when the
		* [sort()]{@link enyo.Collection#sort} method is called without a passed-in
		* [function]{@glossary Function} parameter.
		*
		* @see enyo.Collection~Comparator
		* @type {enyo.Collection~Comparator}
		* @default null
		* @virtual
		* @method
		* @public
		*/
		comparator: null,
		
		/**
		* Used during [add()]{@link enyo.Collection#add} when `create` is `true` and
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
		* When a [commit]{@link enyo.Collection#commit} has completed successfully, it is returned
		* to this method. This method handles special and important behavior; it should not be
		* called directly and, when overloading, care must be taken to ensure that the
		* super-method is called. This correctly sets the [status]{@link enyo.Collection#status}
		* and, in cases where multiple [sources]{@link enyo.Collection#source} were used, it waits
		* until all have responded before clearing the [COMMITTING]{@link enyo~States.COMMITTING}
		* flag. If a [success]{@link enyo.Collection~Success} callback was provided, it will be
		* called once for each source.
		*
		* @param {enyo.Collection~ActionOptions} opts - The original options passed to
		*	[commit()]{@link enyo.Collection#commit}, merged with the defaults.
		* @param {*} [res] - The result provided from the given
		* [source]{@link enyo.Collection#source}, if any. This will vary depending
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
				this.set('status', (this.status | STATES.READY) & ~STATES.COMMITTING);
			}
		},
		
		/**
		* When a [fetch]{@link enyo.Collection#fetch} has completed successfully, it is returned
		* to this method. This method handles special and important behavior; it should not be
		* called directly and, when overloading, care must be taken to ensure that you call the
		* super-method. This correctly sets the [status]{@link enyo.Collection#status} and, in
		* cases where multiple [sources]{@link enyo.Collection#source} were used, it waits until
		* all have responded before clearing the [FETCHING]{@link enyo~States.FETCHING} flag. If
		* a [success]{@link enyo.Collection~Success} callback was provided, it will be called
		* once for each source.
		*
		* @param {enyo.Collection~ActionOptions} opts - The original options passed to
		*	[fetch()]{@link enyo.Collection#fetch}, merged with the defaults.
		* @param {*} [res] - The result provided from the given
		* [source]{@link enyo.Collection#source}, if any. This will vary depending
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
				this.set('status', (this.status | STATES.READY) & ~STATES.FETCHING);
			}
		},
		
		/**
		* If an error is encountered while [fetching]{@link enyo.Collection#fetch},
		* [committing]{@link enyo.Collection#commit}, or [destroying]{@link enyo.Collection#destroy}
		* the [collection]{@link enyo.Collection}, this method will be called. By
		* default, it updates the collection's [status]{@link enyo.Collection#status}
		* property and then checks to see if there is a provided
		* [error handler]{@link enyo.Collection~ErrorCallback}. If the error handler
		* exists, it will be called.
		* 
		* @param {String} action - The name of the action that failed,
		* one of `'FETCHING'` or `'COMMITTING'`.
		* @param {enyo.Collection~ActionOptions} opts - The options hash originally
		* passed along with the original action.
		* @param {*} [res] - The result of the requested `action`; varies depending on the
		*	requested [source]{@link enyo.Collection#source}.
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
				stat = STATES['ERROR_' + action];
			} else stat = action;
			
			if (isNaN(stat) || !(stat & STATES.ERROR)) stat = STATES.ERROR_UNKNOWN;
			
			// if it has changed give observers the opportunity to respond
			this.set('status', (this.status | stat) & ~STATES.READY);
			
			// we need to check to see if there is an options handler for this error
			if (opts && opts.error) opts.error(this, action, opts, res, source);
		},
		
		/**
		* Overloaded version of the method to call [set()]{@link enyo.Collection#set}
		* instead of simply assigning the value. This allows it to
		* [notify observers]{@link enyo.ObserverSupport.notify} and thus update
		* [bindings]{@link enyo.BindingSupport.bindings} as well.
		*
		* @see enyo.StateSupport.clearError
		* @public
		*/
		clearError: function () {
			return this.set('status', STATES.READY);
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
		* Responds to changes to the [models]{@link enyo.Collection#models} property.
		*
		* @see enyo.Collection.models
		* @fires enyo.Collection#reset
		* @type {enyo.ObserverSupport~Observer}
		* @public
		*/
		modelsChanged: function (was, is, prop) {
			var models = this.models.copy(),
				len = models.length;
			
			if (len != this.length) this.set('length', len);
			
			this.emit('reset', {models: models, collection: this});
		},
		
		/**
		* Initializes the [collection]{@link enyo.Collection}.
		*
		* @param {(Object|Object[]|enyo.Model[])} [recs] May be an [array]{@glossary Array}
		*	of either [models]{@link enyo.Model} or [hashes]{@glossary Object} used to
		* initialize the [collection]{@link enyo.Collection}, or an [object]{@glossary Object}
		*	equivalent to the `props` parameter.
		* @param {Object} [props] - A hash of properties to apply directly to the
		* collection.
		* @param {Object} [opts] - A hash.
		* @method
		* @public
		*/
		constructor: enyo.inherit(function (sup) {
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
					this.options = enyo.mixin({}, [this.options, props.options]);
					delete props.options;
				}
				
				opts = opts? enyo.mixin({}, [this.options, opts]): this.options;
				
				// @TODO: For now, while there is only one property we manually check for it
				// if more options arrise that should be configurable this way it may need to
				// be modified
				opts.fetch && (this.options.fetch = opts.fetch);
				
				this.length = this.models.length;
				this.euid = enyo.uid('c');
				
				sup.call(this, props);
				
				typeof this.model == 'string' && (this.model = enyo.constructorForKind(this.model));
				this.store = this.store || enyo.store;
				recs && recs.length && this.add(recs, opts);
			};
		}),
		
		/**
		* @method
		* @private
		*/
		constructed: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				
				// automatically attempt a fetch after initialization is complete
				if (this.options.fetch) this.fetch();
			};
		})
		
	});
	
	/**
	* @name enyo.Collection.concat
	* @static
	* @private
	*/
	Collection.concat = function (ctor, props) {
		var proto = ctor.prototype || ctor;
		
		if (props.options) {
			proto.options = enyo.mixin({}, [proto.options, props.options]);
			delete props.options;
		}
	};
	
})(enyo, this);
