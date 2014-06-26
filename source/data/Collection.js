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
	* [Models]{@link enyo.Model} were added to the [collection]{@link enyo.Collection}.
	*
	* @event enyo.Collection#add
	* @type {Object}
	* @property {enyo.Model[]} models - An [array]{@link external:Array} of
	*	[models]{@link enyo.Model} that were [added]{@link enyo.Collection#add} to the
	*	[collection]{@link enyo.Collection}.
	* @property {enyo.Collection} collection - A reference to the
	*	[collection]{@link enyo.Collection} that [emitted]{@link enyo.EventEmitter.emit} the event.
	* @public
	*/
	
	/**
	* [Models]{@link enyo.Model} were [removed]{@link enyo.Collection#remove} from the
	* [collection]{@link enyo.Collection}.
	*
	* @event enyo.Collection#remove
	* @type {Object}
	* @property {enyo.Model[]} models - An [array]{@link external:Array} of
	*	[models]{@link enyo.Model} that were [removed]{@link enyo.Collection#remove} from the
	*	[collection]{@link enyo.Collection}.
	* @property {enyo.Collection} collection - A reference to the
	*	[collection]{@link enyo.Collection} that [emitted]{@link enyo.EventEmitter.emit} the event.
	* @public
	*/
	
	/**
	* The [collection]{@link enyo.Collection} was [sorted]{@link enyo.Collection#sort}.
	*
	* @event enyo.Collection#sort
	* @type {Object}
	* @property {enyo.Model[]} models - An [array]{@link external:Array} of all
	*	[models]{@link enyo.Model} in the correct, [sorted]{@link enyo.Collection#sort} order.
	* @property {enyo.Collection} collection - A reference to the
	*	[collection]{@link enyo.Collection} that [emitted]{@link enyo.EventEmitter.emit} the event.
	* @property {Function} comparator - A reference to the
	*	[comparator]{@link enyo.Collection#comparator} that was used when
	*	[sorting]{@link enyo.Collection#sort} the [collection]{@link enyo.Collection}.
	* @public
	*/
	
	/**
	* The [collection]{@link enyo.Collection} was reset and its contents have been updated
	* arbitrarily.
	*
	* @event enyo.Collection#reset
	* @type {Object}
	* @property {enyo.Model[]} models - An [array]{@link external:Array} of all
	*	[models]{@link enyo.Model} as they are currently.
	* @property {enyo.Collection} collection - A reference to the
	*	[collection]{@link enyo.Collection} that [emitted]{@link enyo.EventEmitter.emit} the event.
	* @public
	*/
	
	/**
	* The default configurable [options]{@link enyo.Collection#options} used in certain API
	* methods of {@link enyo.Collection}.
	*
	* @typedef {Object} enyo.Collection~Options
	* @property {Boolean} merge=true - When data is being added to the
	*	[collection]{@link enyo.Collection} that already exist (matched by
	*	[primaryKey]{@link enyo.Model#primaryKey}) set the new data values with the current
	*	[model]{@link enyo.Model} instance. This indicates that it will update the existing
	*	values with the new ones by calling [set]{@link enyo.Model#set} on the
	*	[model]{@link enyo.Model}.
	* @property {Boolean} silent=false - Many accessor methods of the
	*	[collection]{@link enyo.Collection} will emit events and/or notifications. This
	*	indicates whether or not to supress those events or notifications at times when that
	*	behavior is necessary. Most often you will not want to modify this value.
	* @property {Boolean} purge=false - When [adding]{@link enyo.Collection#add}
	*	[models]{@link enyo.Model} this flag indicates whether or not to remove (_purge_) the
	*	existing [models]{@link enyo.Model} that are not included in the new dataset.
	* @property {Boolean} parse=false - The collection's [parse]{@link enyo.Collection#parse}
	*	method can automatically be executed for incoming data added via the
	*	[constructor]{@link enyo.Collection#constructor} method or later after having
	*	[fetched]{@link enyo.Collection#fetch} data. It may be necessary to distinguish these
	*	two occassions (one needing to parse and one not) by using the runtime configuration
	*	options of the method(s). In cases where it will always be necessary this can be set to
	*	`true`.
	* @property {Boolean} create=true - When data being added to the
	*	[collection]{@link enyo.Collection} cannot be found (or
	*	[find]{@link enyo.Collection#options#find} is `false`) this determines if a new
	*	[model]{@link enyo.Model} should be created. [Models]{@link enyo.Model} that are created
	*	by a [collection]{@link enyo.Collection} have their [owner]{@link enyo.Model#owner}
	*	property set to the [collection]{@link enyo.Collection} that instanced them.
	* @property {Boolean} find=true - When data being added to the
	*	[collection]{@link enyo.Collection} is not already a [model]{@link enyo.Model} instance
	*	it will attempt to find an existing [model]{@link enyo.Model} by its
	*	[primaryKey]{@link enyo.Model#primaryKey} if it exists. In most cases this is the
	*	prefered behavior but if the {@link enyo.Model} [kind]{@link external:kind} being
	*	instanced does not have a [primaryKey]{@link enyo.Model#primaryKey} it is unnecessary
	*	and this value can be set to `false`.
	* @property {Boolean} sort=false - When [adding]{@link enyo.Collection#add}
	*	[models]{@link enyo.Model} to the [colleciton]{@link enyo.Collection} it can also be
	*	sorted. If the [comparator]{@link enyo.Collection#comparator} is a
	*	[function]{@link external:Function} and this value is `true` it will use the
	*	[comparator]{@link enyo.Collection#comparator} to sort the entire
	*	[collection]{@link enyo.Collection}. It can also be a
	*	[function]{@link external:Function} that will be used to _sort_ the
	*	[collection]{@link enyo.Collection} instead of or in-place of a defined
	*	[comparator]{@link enyo.Collection#comparator}.
	* @property {Boolean} commit=false - When modifications are made to the
	*	[collection]{@link enyo.Collection} this flag will ensure that those changes are
	*	[committed]{@link enyo.Collection#commit} according to the configuration and
	*	availability of a [source]{@link enyo.Collection#source}. This can also be configured
	*	per-call to methods that use it.
	* @property {Boolean} destroy=false - When [models]{@link enyo.Model} are
	*	[removed]{@link enyo.Collection#remove} from the [collection]{@link enyo.Collection}
	*	this flag indicates whether or not to [destroy]{@link enyo.Model#destroy} them as well.
	*	Note that this could have a significant impact if the same [models]{@link enyo.Model}
	*	are used in other [collections]{@link enyo.Collection}.
	* @property {Boolean} complete=false - When [models]{@link enyo.Model} are
	*	[removed]{@link enyo.Collection#remove} from the [collection]{@link enyo.Collection}
	*	this flag indicates whether or not to also _remove_ them from the
	*	[store]{@link enyo.Collection#store}. This is rarely necessary and can cause problems if
	*	the [models]{@link enyo.Model} are used in other [collections]{@link enyo.Collection}.
	*	It is also ignored if the [destroy]{@link enyo.Collection#options#destroy} flag is
	*	`true`.
	* @property {Boolean} fetch=false - When the [collection]{@link enyo.Collection} is
	*	initialized it can automatically attempt to [fetch]{@link enyo.Collection#fetch} data
	*	when the [source]{@link enyo.Collection#source} and [url]{@link enyo.Collection#url}
	*	or {@link enyo.Collection#getUrl} properties are configured properly.
	*/
	
	/**
	* The configuration options for [add]{@link enyo.Collection#add}. For complete descriptions
	* of the options and their defaults see {@link enyo.Collection#options}. Some properties
	* have a different meaning in a specific context. Please review their descriptions below to
	* see how they are used in this context.
	* 
	* @typedef {enyo.Collection~Options} enyo.Collection~AddOptions
	* @property {Boolean} merge - Update existing models when found.
	* @property {Boolean} purge - Remove existing models not in new dataset.
	* @property {Boolean} silent - Emit events and notifications.
	* @property {Boolean} parse - Parse the incoming dataset before evaluating.
	* @property {Boolean} find - Look for an existing model.
	* @property {(Boolean|Function)} sort - Sort the finalized dataset.
	* @property {Boolean} commit - {@link enyo.Collection#commit} changes to the
	*	{@link enyo.Collection} after completing the {@link enyo.Collection#add}.
	* @property {Boolean} create - When an existing {@link enyo.Model} instance cannot be
	*	resolved it should _create_ a new instance.
	* @property {number} index - The index at which to add the new dataset. Defaults to the
	*	end of the current dataset if not explicitly set or valid.
	* @property {Boolean} destroy - If `purge` is `true`, this will {@link enyo.Model#destroy}
	*	any [models]{@link enyo.Model} that were [removed]{@link enyo.Collection#remove}.
	* @property {Object} modelOptions - When instancing a [model]{@link enyo.Model} this
	*	[object]{@link external:Object} will be passed to the constructor as its _options_
	*	parameter.
	*/
	
	/**
	* The configuration options for [remove]{@link enyo.Collection#remove}. For complete
	* descriptions of the options and their defaults see {@link enyo.Collection~Options}. Some
	* properties have a different meaning in a specific context. Please review their
	* descriptions below to see how they are used in this context.
	* 
	* @typedef {enyo.Collection~Options} enyo.Collection~RemoveOptions
	* @property {Boolean} silent - Emit events and notifications.
	* @property {Boolean} commit - [Commit]{@link enyo.Collection#commit} changes to the
	*	[collection]{@link enyo.Collection} after completing the
	*	[remove]{@link enyo.Collection#remove}.
	* @property {Boolean} complete - Remove the [model]{@link enyo.Model} from the
	*	[store]{@link enyo.Collection#store} as well as the [collection]{@link enyo.Collection}.
	* @property {Boolean} destroy - [Destroy]{@link enyo.Model#destroy} the
	*	[model]{@link enyo.Model} as well as remove it from the
	*	[collection]{@link enyo.Collection}.
	*/
	
	/**
	* The configurable options for [fetch]{@link enyo.Collection#fetch},
	* [commit]{@link enyo.Collection#commit} and [destroy]{@link enyo.Collection#destroy}.
	*
	* @typedef {enyo.Collection~Options} enyo.Collection~ActionOptions
	* @property {enyo.Collection~Success} success - The callback executed upon successful
	*	completion.
	* @property {enyo.Collection~Error} error - The callback executed upon a failed attempt.
	*/
	
	/**
	* @callback enyo.Collection~Success
	* @param {enyo.Collection} collection The collection that is returning successfully.
	* @param {enyo.Collection~ActionOptions} opts The original options passed to the action method
	*	that is returning successfully.
	* @param {*} res The result, if any, returned by the [source]{@link enyo.Source} that
	*	executed it.
	* @param {String} source The name of the [source]{@link enyo.Collection#source} that has
	*	returned successfully.
	*/
	
	/**
	* @callback enyo.Collection~Error
	* @param {enyo.Collection} collection The collection that is returning successfully.
	* @param {String} action The name of the action that failed, one of `FETCHING`,
	*	`COMMITTING` or `DESTROYING`.
	* @param {enyo.Collection~ActionOptions} opts The original options passed to the
	*	action method that is returning successfully.
	* @param {*} res The result, if any, returned by the [source]{@link enyo.Source} that
	*	executed it.
	* @param {String} source The name of the [source]{@link enyo.Collection#source} that has
	*	returned successfully.
	*/
	
	/**
	* A method used to compare two elements in a {@link enyo.Collection}. Should be implemented like
	* callbacks used with [Array.sort]{@link external:Array.sort}.
	*
	* @see {@link external:Array.sort}
	* @see enyo.Collection#sort
	* @see enyo.Collection#comparator
	* @callback enyo.Collection~Comparator
	* @param {enyo.Model} a The first [model]{@link enyo.Model} to compare.
	* @param {enyo.Model} b The second [model]{@link enyo.Model} to compare.
	* @returns {Number} `-1` if _a_ should have a lower index, `0` if they are the same and `1`
	*	if _b_ should have the lower index.
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
		* [URI]{@link external:URI} from which it can be [fetched]{@link enyo.Collection#fetch},
		* [committed]{@link enyo.Collection#commit} or [destroyed]{@link enyo.Collection#destroy}.
		* Some [sources]{@link enyo.Collection#source} may use this property in other ways.
		*
		* @see enyo.Collection#getUrl
		* @see enyo.Source
		* @see enyo.AjaxSource
		* @see enyo.JsonpSource
		* @type {String}
		* @default ''
		* @public
		*/
		url: '',
		
		/**
		* Implement this method to be used by [sources]{@link enyo.Model#source} to dynamically
		* derrive the [URI]{@link external:URI} from which it can be
		* [fetched]{@link enyo.Collection#fetch}, [committed]{@link enyo.Collection#commit} or
		* [destroyed]{@link enyo.Collection#destroy}. Some
		* [sources]{@link enyo.Collection#source} may use this property in other ways. Note that
		* implementing this method means the [url]{@link enyo.Collection#url} will not be used.
		*
		* @see enyo.Collection#url
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
		* The [kind]{@link external:kind) of {@link enyo.Model} that this
		* [collection]{@link enyo.Collection} will contain. This is important to set properly so
		* that when [fetching]{@link enyo.Collection#fetch} the returned data will be instanced
		* as the correct [model]{@link enyo.Model} [subkind]{@link external:subkind}.
		* 
		* @type {(enyo.Model|String)}
		* @default enyo.Model
		* @public
		*/
		model: Model,
		
		/**
		* A special type of [array]{@link external:Array} used internally by
		* {@link enyo.Collection}. It should not be modified directly nor should the property be
		* set directly. It is used as a container by the [collection]{@link enyo.Collection}. If
		* it is [set]{@link enyo.Collection#set} directly it will
		* [emit]{@link enyo.EventEmitter.emit} a [reset]{@link enyo.Collection#event:reset} event.
		*
		* @see enyo.Collection#modelsChanged
		* @type enyo.ModelList
		* @default null
		* @readonly
		* @protected
		*/
		models: null,
		
		/**
		* The current [state]{@link enyo.States} of the [collection]{@link enyo.Collection}. This
		* value changes automatically and can be observed for more complex state monitoring. The
		* default is [READY]{@link enyo.States.READY}.
		* 
		* @see enyo.States
		* @see enyo.StateSupport
		* @type enyo.States
		* @default enyo.States.READY
		* @readonly
		* @public
		*/
		status: STATES.READY,
		
		/**
		* The configurable default [options]{@link enyo.Collection~Options}. These values will be
		* used to modify the behavior of the [collection]{@link enyo.Collection} unless additional
		* _options_ are passed into the methods that use them. When modifying these values in a
		* [subkind]{@link external:subkind} of {@link enyo.Collection} they will be merged with
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
			fetch: false
		},
		
		/**
		* Modify the structure of data such that it can be used by the
		* [add]{@link enyo.Collection#add} method. This method will only be used during
		* initialization or after a successful [fetch]{@link enyo.Collection#fetch} if the
		* [parse]{@link enyo.Collection~Options.parse} flag is set to `true`. This can be used for simple
		* remapping, renaming or complex restructuring of data coming from a
		* [source]{@link enyo.Collection#source} that needs to be modified prior to being
		* [added]{@link enyo.Collection#add} to the [collection]{@link enyo.Collection}. This is a
		* virtual method and must be implemented.
		* 
		* @param {*} data The incoming data passed to the
		*	[constructor]{@link enyo.Collection#constructor} or returned by a successful
		*	[fetch]{@link enyo.Collection#fetch}.
		* @returns {Array} The properly formatted data to be accepted by the
		*	[add]{@link enyo.Collection#add} method.
		* @virtual
		* @public
		*/
		parse: function (data) {
			return data;
		},
		
		/**
		* Add data to the [collection]{@link enyo.Collection}. This method can add an individual
		* [model]{@link enyo.Model} or an [array]{@link external:Array} of
		* [models]{@link enyo.Model}. It can splice them into the dataset at a designated index or
		* remove models from the existing dataset that are not included in the new one.
		* See {@link enyo.Collection~AddOptions} for detailed information on the
		* configuration options available for this method. This method is heavily optimized for
		* batch operations on [arrays]{@link external:Array} of [models]{@link enyo.Model}. For
		* better performance ensure that loops do not consecutively call this method but instead
		* build an [array]{@link external:Array} to pass as its first parameter.
		* 
		* @fires enyo.Collection#event:add
		* @param {(Object|Object[]|enyo.Model|enyo.Model[])} models The data to add to the
		*	{@link enyo.Collection} that can be a [hash]{@link external:Object}, an array of
		*	[hashes]{@link external:Object},
		*	an {@link enyo.Model} instance or array of {@link enyo.Model} instances. Note if the
		*	{@link enyo.Collection#options#parse} configuration option is `true` it will use the
		*	returned value as this parameter.
		* @param {enyo.Collection~AddOptions} [opts] The configuration options that modify the
		*	behavior of this method. The [defaults]{@link enyo.Collection~Options} will be
		*	merged with these options before evaluating.
		* @returns {enyo.Model[]} The [models]{@link enyo.Model} that were added, if any.
		* @public
		*/
		add: function (models, opts) {
			var loc = this.models
				, len = this.length
				, ctor = this.model
				, options = this.options
				, pkey = ctor.prototype.primaryKey
				, idx = len
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
				for (i=0; i<len; ++i) !keep[(model = loc[i]).euid] && removed.push(model);
				// if we removed any we process that now
				removed.length && this.remove(removed, opts);
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
					this.emit('add', {models: added, collection: this});
				}
			}
			
			// note that if commit is set but this was called from a successful fetch this will be
			// a nop (as intended)
			commit && added && this.commit(opts);
			
			return added || [];
		},
		
		/**
		* Remove data from the [collection]{@link enyo.Collection}. It can take a
		* [model]{@link enyo.Model} or an [array]{@link external:Array} of
		* [models]{@link enyo.Model}. If any of the instances are present in the
		* [collection]{@link enyo.Collection} they will be removed, in the order in which they are
		* encountered. Emits the {@link enyo.Collection#remove} event if any models were found and
		* removed from the [collection]{@link enyo.Collection} (and the `silent` option is not
		* `true`).
		* 
		* @fires enyo.Collection#remove
		* @param {(enyo.Model|enyo.Model[])} models The [models]{@link enyo.Model} to remove
		* 	if they exist in the [collection]{@link enyo.Collection}.
		* @param {enyo.Collection~RemoveOptions} [opts] The configuration options that modify
		* 	the behavior of this method.
		* @returns {enyo.Model[]} The [models]{@link enyo.Model} that were removed, if any.
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
					model.off('*', this._modelEvent, this);
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
		* Retrieve a [model]{@link enyo.Model} for the provided index.
		* 
		* @param {Number} idx The index to return from the [collection]{@link enyo.Collection}.
		* @returns {(enyo.Model|undefined)} The [model]{@link enyo.Model} at the given index or
		* 	`undefined` if it cannot be found.
		* @public
		*/
		at: function (idx) {
			return this.models[idx];
		},
		
		/**
		* Returns the JSON serializable [array]{@link external:Array} of [models]{@link enyo.Model}
		* according to their own [raw]{@link enyo.Model#raw} output.
		*
		* @returns {enyo.Model[]} The [models]{@link enyo.Model} according to their
		*	[raw]{@link enyo.Model#raw} output.
		* @public
		*/
		raw: function () {
			return this.models.map(function (model) {
				return model.raw();
			});
		},
		
		/**
		* Determine if the [model]{@link enyo.Model} is contained by this
		* [collection]{@link enyo.Collection}.
		*
		* @param {enyo.Model} model The [model]{@link enyo.Model} to check.
		* @returns {Boolean} Whether or not the [model]{@link enyo.Model} belongs to the
		*	[collection]{@link enyo.Collection}.
		* @public
		*/
		has: function (model) {
			return this.models.has(model);
		},
		
		/**
		* @see {@link external:Array.forEach}
		* @public
		*/
		forEach: function (fn, ctx) {
			
			// ensure that this is an immutable reference to the models such that changes will
			// not affect the entire loop - e.g. calling destroy on models won't keep this from
			// completing
			return this.models.slice().forEach(fn, ctx || this);
		},
		
		/**
		* @see {@link external:Array.filter}
		* @public
		*/
		filter: function (fn, ctx) {
			
			// ensure that this is an immutable reference to the models such that changes will
			// not affect the entire loop - e.g. calling destroy on models won't keep this from
			// completing
			return this.models.slice().filter(fn, ctx || this);
		},
		
		/**
		* @see {@link external:Array.find}
		* @public
		*/
		find: function (fn, ctx) {
			
			// ensure that this is an immutable reference to the models such that changes will
			// not affect the entire loop - e.g. calling destroy on models won't keep this from
			// completing
			return this.models.slice().find(fn, ctx || this);
		},
		
		/**
		* @see {@link external:Array.map}
		* @public
		*/
		map: function (fn, ctx) {
			
			// ensure that this is an immutable reference to the models such that changes will
			// not affect the entire loop - e.g. calling destroy on models won't keep this from
			// completing
			return this.models.slice().map(fn, ctx || this);
		},
		
		/**
		* @see {@link external:Array.indexOf}
		* @public
		*/
		indexOf: function (model, offset) {
			return this.models.indexOf(model, offset);
		},
		
		/**
		* Remove all [models]{@link enyo.Model} from the [collection]{@link enyo.Collection}.
		* Optionally a [model or models]{@link enyo.Model} can be provided that will replace the
		* removed [models]{@link enyo.Model}. If this operation is not `silent` it will emit a
		* `reset` event. Returns the removed [models]{@link enyo.Model} but be aware that if the
		* `destroy` configuration option is set then the returned models will have limited
		* usefulness.
	    * 
		* @param {(enyo.Model|enyo.Model[])} [models] The [model or models]{@link enyo.Model} to
		*	use as a replacement for the current set of [models]{@link enyo.Model} in the
		*	{@link enyo.Collection}.
		* @param {enyo.Collection~Options} [opts] The options that will modify the behavior
		*	of this method.
		* @returns {enyo.Model[]} The [models]{@link enyo.Model} that were removed from the
		*	[collection]{@link enyo.Collection}.
		* @public
		*/
		empty: function (models, opts) {
			var silent,
				removed;
			
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
			if (!silent) this.emit('reset', {models: this.models.copy(), collection: this});
			
			return removed;
		},
		
		/**
		* Returns the [JSON]{@link external:JSON} serializable [raw]{@link enyo.Collection#raw}
		* output of the [collection]{@link enyo.Collection}. Will automatically be executed by
		* [JSON.parse]{@link external:JSON.parse}.
		*
		* @see enyo.Collection#raw
		* @returns {Object} The return value of [raw]{@link enyo.Collection#raw}
		* @public
		*/
		toJSON: function () {
			return this.raw();
		},
		
		/**
		* The default behavior of this method is the same as {@link external:Array.sort}. If the
		* [function]{@link external:Function} parameter is ommitted it will attempt to use the
		* [comparator]{@link enyo.Collection} (if any) from the [collection]{@link enyo.Collection}.
		* Note that the [collection]{@link enyo.Collection} is _sorted_ in-place and returns a
		* reference to itself. The [collection]{@link enyo.Collection}
		* [emits]{@link enyo.EventEmitter.emit} the [sort]{@link enyo.Collection#event:sort} event.
		*
		* @fires enyo.Collection#event:sort
		* @see {@link external:Array.sort}
		* @param {enyo.Collection~Comparator} [fn] The _comparator_ method.
		* @param {enyo.Collection~Options} [opts] The configuration options.
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
		* Commit the [collection]{@link enyo.Collection} to a [source]{@link enyo.Collection#source}
		* or [sources]{@link enyo.Collection#source}. A {@link enyo.Collection} cannot be
		* [committed]{@link enyo.Collection#commit} if it is in an
		* [error]{@link enyo.States.ERROR} ({@link enyo.StateSupport.isError}) or
		* [busy]{@link enyo.States.BUSY} ({@link enyo.StateSupport.isBusy})
		* [state]{@link enyo.Model#status}. While executing it will add the
		* [COMMITTING]{@link enyo.States.COMMITTING} flag to [status]{@link enyo.Collection#status}.
		* Once it has completed execution it will remove this flag (even if it fails).
		*
		* @see enyo.Collection#committed
		* @see enyo.Collection#status
		* @param {enyo.Collection~ActionOptions} [opts] Optional configuration options.
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
		* Fetch the [collection]{@link enyo.Collection} from a
		* [source]{@link enyo.Collection#source} or [sources]{@link enyo.Collection#source}. A
		* {@link enyo.Collection} cannot be [fetcheded]{@link enyo.Collection#fetch} if it is in an
		* [error]{@link enyo.States.ERROR} ({@link enyo.StateSupport.isError}) or
		* [busy]{@link enyo.States.BUSY} ({@link enyo.StateSupport.isBusy})
		* [state]{@link enyo.Model#status}. While executing it will add the
		* [FETCHING]{@link enyo.States.FETCHING} flag to [status]{@link enyo.Collection#status}.
		* Once it has completed execution it will remove this flag (even if it fails).
		*
		* @see enyo.Collection#fetched
		* @see enyo.Collection#status
		* @param {enyo.Collection~ActionOptions} [opts] Optional configuration options.
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
		* Destroy the [collection]{@link enyo.Collection}. By default, the
		* [collection]{@link enyo.Collection} will only be [destroyed]{@link external:destroy} in
		* the client. To execute with a [source]{@link enyo.Collection#source} or
		* [sources]{@link enyo.Collection#source} the
		* [commit default option]{@link enyo.Collection#options} must be `true` or a `source`
		* property must be provided in the _opts_ parameter explicitly. A {@link enyo.Collection}
		* cannot be [destroyed]{@link enyo.Collection#destroy} (using a
		* [source]{@link enyo.Collection#source}) if it is in an [error]{@link enyo.States.ERROR}
		* ({@link enyo.StateSupport.isError}) or [busy]{@link enyo.States.BUSY}
		* ({@link enyo.StateSupport.isBusy}) [state]{@link enyo.Collection#status}. While executing
		* it will add the [DESTROYING]{@link enyo.States.DESTROYING} flag to
		* [status]{@link enyo.Collection#status}. Once it has completed execution it will remove
		* this flag (even if it fails).
		*
		* @see enyo.Collection#status
		* @param {enyo.Collection~ActionOptions} [opts] Optional configuration options.
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
		* This method is a virtual method that, when provided, will be used for sorting during
		* [add]{@link enyo.Collection#add} when the `sort` flag is `true` or when the
		* [sort]{@link enyo.Collection#sort} method is called without a
		* [function]{@link external:Function} parameter being passed to it.
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
		* Used during [add]{@link enyo.Collection#add} when `create` is `true` and the data is a
		* [hash]{@link external:Object}.
		*
		* @private
		*/
		prepareModel: function (attrs, opts) {
			var Ctor = this.model
				// , options = {silent: true, noAdd: true}
				, model;
			
			// opts = opts? enyo.mixin({}, [options, opts]): options;
			// opts = opts || {};
			// opts.noAdd = true;
			
			attrs instanceof Ctor && (model = attrs);
			if (!model) {
				opts = opts || {};
				opts.noAdd = true;
				model = new Ctor(attrs, null, opts);
			}
			
			model.on('*', this._modelEvent, this);
			
			return model;
		},
		
		/**
		* When a [commit]{@link enyo.Collection#commit} has completed successfully it is returned
		* to this method. This method handles special and important behavior - it should not be
		* called directly and take care when overloading to ensure you call the super-method. This
		* correctly sets the [status]{@link enyo.Collection#status} and in cases where multiple
		* [sources]{@link enyo.Collection#source} were used it waits until all have responded before
		* clearing the [COMMITTING]{@link enyo.States.COMMITTING} flag. If a
		* [success]{@link enyo.Collection~Success} callback was was provided it will be called once
		* for each [source]{@link enyo.Collection#source}.
		*
		* @param {enyo.Collection~ActionOptions} opts The original options passed to
		*	[commit]{@link enyo.Collection#commit} merged with the defaults.
		* @param {*} [res] The result provided from the given _source_ if any. This will vary
		*	depending on the [source]{@link enyo.Collection#source}.
		* @param {String} source The name of the [source]{@link enyo.Collection#source} that has
		*	completed successfully.
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
		* When a [fetch]{@link enyo.Collection#fetch} has completed successfully it is returned
		* to this method. This method handles special and important behavior - it should not be
		* called directly and take care when overloading to ensure you call the super-method. This
		* correctly sets the [status]{@link enyo.Collection#status} and in cases where multiple
		* [sources]{@link enyo.Collection#source} were used it waits until all have responded before
		* clearing the [FETCHING]{@link enyo.States.FETCHING} flag. If a
		* [success]{@link enyo.Collection~Success} callback was was provided it will be called once
		* for each [source]{@link enyo.Collection#source}.
		*
		* @param {enyo.Collection~ActionOptions} opts The original options passed to
		*	[fetch]{@link enyo.Collection#fetch} merged with the defaults.
		* @param {*} [res] The result provided from the given _source_ if any. This will vary
		*	depending on the [source]{@link enyo.Collection#source}.
		* @param {String} source The name of the [source]{@link enyo.Collection#source} that has
		*	completed successfully.
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
		* If an error is encountered when [fetching]{@link enyo.Collection#fetch},
		* [committing]{@link enyo.Collection#commit} or [destroying]{@link enyo.Collection#destroy}
		* the [collection]{@link enyo.Collection} this method will be called. By default it updates
		* the [collection's]{@link enyo.Collection} [status]{@link enyo.Collection#status} property
		* and then checks to see if there is a provided
		* [error handler]{@link enyo.Collection~ErrorCallback} and, if so, will call that method.
		* 
		* @param {String} action The name of the action that failed, one of `FETCHING` or
		*	`COMMITTING`.
		* @param {enyo.Collection~ActionOptions} opts The options hash originally passed along with
		*	the original action.
		* @param {*} [res] The result of the requested _action_; varies depending on the
		*	requested [source]{@link enyo.Collection#source}.
		* @param {String} source The name of the [source]{@link enyo.Collection#source} that has
		*	returned an error.
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
		* Overloaded version of the method to call [set]{@link enyo.Collection#set} instead of
		* simply assigning the value. This allows it to
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
		* Responds to changes of the [models]{@link enyo.Collection#models} property.
		*
		* @see enyo.Collection#models
		* @fires enyo.Collection#event:reset
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
		* @param {(Object|Object[]|enyo.Model[])} [recs] An [array]{@link external:Array} of either
		*	[models]{@link enyo.Model} or [hashes]{@link external:Object} to initialize the
		*	[collection]{@link enyo.Collection} with or can be an [object]{@link external:Object}
		*	equivalent to the _props_ parameter.
		* @param {Object} [props] A [hash]{@link external:Object} of properties to apply directly
		*	to the [collection]{@link enyo.Collection}.
		* @param {Object} [opts] A [hash]{@link external:Object}
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
				
				if (props && props.records) {
					recs = recs? recs.concat(props.records): props.records.slice();
					delete props.records;
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