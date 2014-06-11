(function (enyo, scope) {
	
	var kind = enyo.kind;
	
	var Component = enyo.Component,
		EventEmitter = enyo.EventEmitter,
		Model = enyo.Model,
		ModelList = enyo.ModelList,
		Source = enyo.Source;
	
	/**
		An array-like structure designed to house a _collection_ of {@link enyo.Model} instances.
	
		@public
		@class enyo.Collection
		@extends enyo.Component
	*/
	var Collection = kind(
		/** @lends enyo.Collection.prototype */ {
		
		/**
			@private
		*/
		name: 'enyo.Collection',
		
		/**
			@private
		*/
		kind: Component,
		
		/**
			@private
		*/
		noDefer: true,
		
		/**
			The {@link enyo~kind) of {@link enyo.Model} that this {@link enyo.Collection} will be
			implementing or housing. This is important to set properly so that when
			[fetching]{@link enyo.Collection#fetch} the returned data will correctly be instanced
			as the correct {@link enyo.Model} subclass.
			
			@type {(enyo.Model|string)}
			@default enyo.Model
			@public
		*/
		model: Model,
		
		/**
			The configurable default {@link enyo.Collection#options}. These values will be used to
			modify the behavior of the {@link enyo.Collection} unless additional _options_ are
			passed into the methods that use them. When modifying these values in a
			[subclass]{@link enyo~kind} of {@link enyo.Collection} they will be merged with existing
			values.
			
			@type {object}
			@public
		*/
		options: /** @lends enyo.Collection#options */ {
			
			/**
				When data is being added to the {@link enyo.Collection} that already exist
				(matched by {@link enyo.Model#primaryKey}) set the new data values with the current
				{@link enyo.Model} instance. This indicates that it will update the existing values
				with the new ones by calling {@link enyo.Model#set} on the
				[model instance]{@link enyo.Model}.
				
				@type {boolean}
				@default true
				@public
			*/
			merge: true,
			
			/**
				Many accessor methods of the {@link enyo.Collection} will emit events and/or
				notifications. This indicates whether or not to supress those events or
				notifications in times when that behavior is necessary. Most often you will not
				want to modify this value.
			
				@type {boolean}
				@default false
				@public
			*/
			silent: false,
			
			/**
				When [adding]{@link enyo.Collection#add} [models]{@link enyo.Model} this flag
				indicates whether or not to remove (_purge_) the existing [models]{@link enyo.Model}
				that are not included in the new dataset.
			
				@type {boolean}
				@default false
				@public
			*/
			purge: false,
			
			/**
				The collection's [parse]{@link enyo.Collection#parse} method can automatically be
				executed for incoming data added via the {@link enyo.Collection#constructor} method
				or later after having [fetched]{@link enyo.Collection#fetch} data. It may be
				necessary to distinguish these two occassions (one needing to parse and one not) by
				using the runtime configuration options of the methods. In cases where it will
				always be necessary this can be set to `true`.
			
				@type {boolean}
				@default false
				@public
			*/
			parse: false,
			
			/**
				When data being added to the {@link enyo.Collection} cannot be found (or 
				{@link enyo.Collection#options#find} is `false`) this descides if a new
				{@link enyo.Model} should be created. [Models]{@link enyo.Model} that are created
				by an {@link enyo.Collection} have their {@link enyo.Model#owner} property set to
				the {@link enyo.Collection} that instanced them. This is important because if the
				{@link enyo.Collection} is [destroyed]{@link enyo.Collection#destroy} it will also
				[destroy]{@link enyo.Model#destroy} [models]{@link enyo.Model} that it owns.
			
				@type {boolean}
				@default true
				@public
			*/
			create: true,
			
			/**
				When data being added to the {@link enyo.Collection} is not already an
				{@link enyo.Model} instance it will attempt to find an existing model by its
				{@link enyo.Model#primaryKey} if it exists. In most cases this is the prefered
				behavior but if the {@link enyo.Model} class being instanced does not have a
				{@link enyo.Model#primaryKey} it is unnecessary and this value can be set to
				`false`.
				
				@type {boolean}
				@default true
				@public
			*/
			find: true,
			
			/**
				When [adding]{@link enyo.Collection#add} [models]{@link enyo.Model} to the
				{@link enyo.Collection} it can also be sorted. If the
				{@link enyo.Collection#comparator} is a _function_ and this value is `true` it will
				use the _comparator_ to sort the entire {@link enyo.Collection}. It can also be
				a _function_ that will be used to sort the {@link enyo.Collection} instead of or in-
				place of a {@link enyo.Collection#comparator}.
			
				@type {(boolean|function)}
				@default false
				@public
			*/
			sort: false,
			
			/**
				When modifications are made to the {@link enyo.Collection} this flag will ensure
				that those changes are [committed]{@link enyo.Collection#commit} according to the
				configuration and {@link enyo.Collection#source}. This can also be configured per-
				call to methods that use it.
			
				@type {boolean}
				@default false
				@public
			*/
			commit: false,
			
			/**
				When [models]{@link enyo.Model} are [removed]{@link enyo.Collection#remove} from the
				dataset this flag indicates whether or not to {@link enyo.Model#destroy} them as
				well. Note that this could have a significant impact if the same
				[models]{@link enyo.Model} are used in other [collections]{@link enyo.Collection}.
			
				@type {boolean}
				@default false
				@public
			*/
			destroy: false,
			
			/**
				When [models]{@link enyo.Model} are [removed]{@link enyo.Collection#remove} from the
				dataset this flag indicates whether or not to also _remove_ them from the
				{@link enyo.Collection#store}. This is rarely necessary and can cause problems if
				the [models]{@link enyo.Model} are used in other
				[collections]{@link enyo.Collection}. It is also ignored if the
				{@link enyo.Collection#options#destroy} flag is `true`.
			
				@type {boolean}
				@default false
				@public
			*/
			complete: false,
			
			/**
				When the {@link enyo.Collection} is initialized it can automatically attempt to
				{@link enyo.Collection#fetch} data when the {@link enyo.Collection#source} and
				{@link enyo.Collection#url} or {@link enyo.Collection#buildUrl} properties are
				configured properly.
				
				@type {boolean}
				@default false
				@public
			*/
			fetch: false
		},
		
		/**
			@private
		*/
		mixins: [EventEmitter],
		
		/**
			@private
		*/
		observers: [
			{path: 'models', method: 'onModelsChange'}
		],
		
		/**
			Modify the structure of data such that it can be used by the {@link enyo.Collection#add}
			method. This method will only be used during initialization or after a successful
			{@link enyo.Collection#fetch} if the {@link enyo.Collection#options#parse} flag is set
			to `true`. This can be used for simple remapping, renaming or complex restructuring of
			data coming from a {@link enyo.Collection#source} that needs to be modified prior to
			being [added]{@link enyo.Collection#add} to the dataset.
		
			@param {*} data The incoming data passed to the {@link enyo.Collection#constructor} or
				returned by a successful {@link enyo.Collection#fetch}.
			@returns {array} The properly formatted data to be accepted by
				{@link enyo.Collection#add} method.
			@method
			@public
		*/
		parse: function (data) {
			return data;
		},
		
		/**
			The configuration options for {@link enyo.Collection#add}. For complete descriptions of
			the options and their defaults {@see enyo.Collection#options}. Some properties have a
			different meaning in a specific context. Please review their descriptions below to see
			how they are used in this context.
		
			@typedef {object} enyo.Collection#add~options
			@property {boolean} merge - Update existing models when found.
			@property {boolean} purge - Remove existing models not in new dataset.
			@property {boolean} silent - Emit events and notifications.
			@property {boolean} parse - Parse the incoming dataset before evaluating.
			@property {boolean} find - Look for an existing model.
			@property {(boolean|function)} sort - Sort the finalized dataset.
			@property {boolean} commit - {@link enyo.Collection#commit} changes to the
				{@link enyo.Collection} after completing the {@link enyo.Collection#add}.
			@property {boolean} create - When an existing {@link enyo.Model} instance cannot be
				resolved it should _create_ a new instance.
			@property {number} index - The index at which to add the new dataset. Defaults to the
				end of the current dataset if not explicitly set or valid.
			@property {boolean} destroy - If `purge` is `true`, this will {@link enyo.Model#destroy}
				any [models]{@link enyo.Model} that were [removed]{@link enyo.Collection#remove}.
			@property {object} modelOptions - When instancing a model this object will be passed
				to the constructor as its {@link enyo.Model#constructor} options parameter.
		*/
		
		/**
			Add data to the dataset. This method can add an individual [model]{@link enyo.Model} or
			an array of [models]{@link enyo.Model}. It can splice them into the dataset at a
			designated index or remove models from the existing dataset that are not included in the
			new one. {@see enyo.Collection#add~options} for detailed information on the
			configuration options available for this method. This method is heavily optimized for
			batch operations on _arrays_ of data. For better performance ensure that loops do not
			consecutively call this method but instead build an array to pass to it as its first
			parameter.
			
			@fires enyo.Collection#add
			@param {(object|object[]|enyo.Model|enyo.Model[])} models The data to add to the
			 	{@link enyo.Collection} that can be an object-literal, an array of object-literals,
				an {@link enyo.Model} instance or array of {@link enyo.Model} instances. Note if the
				{@link enyo.Collection#options#parse} configuration option is `true` it will use the
				returned value as this parameter.
			@param {enyo.Collection#add~options} [opts] The configuration options that modify the
				behavior of this method. The [defaults]{@link enyo.Collection#options} will be
				merged with these options before evaluating.
			@returns {enyo.Model[]} The [models]{@link enyo.Model} that were added, if any.
			@method
			@public
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
					this.emit('add', {/* for backward compatibility */ records: added, /* prefered */ models: added});
				}
			}
			
			commit && added && this.commit(opts);
			
			return added || [];
		},
		
		/**
			The configuration options for {@link enyo.Collection#remove}. For complete descriptions
			of the options and their defaults {@see enyo.Collection#options}. Some properties have a
			different meaning in a specific context. Please review their descriptions below to see
			how they are used in this context.
		
			@typedef {object} enyo.Collection#remove~options
			@property {boolean} silent - Emit events and notifications.
			@property {boolean} commit - {@link enyo.Collection#commit} changes to the
				{@link enyo.Collection} after completing the {@link enyo.Collection#add}.
			@property {boolean} complete - Remove the {@link enyo.Model} from the
				{@link enyo.Collection#store} as well as the {@link enyo.Collection}.
			@property {boolean} destroy - {@link enyo.Model#destroy} the {@link enyo.Model} as well
				as remove it from the {@link enyo.Collection}.
		*/
		
		/**
			Remove data from the dataset. It can take a [model]{@link enyo.Model} or an array of
			[models]{@link enyo.Model}. If any of the instances are present in the
			{@link enyo.Collection} they will be removed, in the order in which they are
			encountered. Emits the {@link enyo.Collection#remove} event if any models were found and
			removed from the dataset (and the `silent` option is not `true`).
		
			@fires enyo.Collection#remove
			@param {(enyo.Model|enyo.Model[])} models The [models]{@link enyo.Model} to remove
				if they exist in the {@link enyo.Collection}.
			@param {enyo.Collection#remove~options} [opts] The configuration options that modify
				the behavior of this method.
			@returns {enyo.Model[]} The [models]{@link enyo.Model} that were removed, if any.
			@method
			@public
		*/
		remove: function (models, opts) {
			var loc = this.models
				, len = loc.length
				, ctor = this.model
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
				for (var i=0, end=removed.length; i<end; ++i) {
					model = removed[i];
					model.off('*', this.onModelEvent, this);
					if (destroy) model.destroy(opts);
				}
				
				// no need to remove them from the store if they were destroyed as they have already
				// been removed
				if (complete && !destroy) this.store.remove(removed);
			}
			
			this.length = loc.length;
			
			if (!silent) {
				len != this.length && this.notify('length', len, this.length);
				if (removed.length) {
					this.emit('remove', {/* for partial backward compatibility */records: removed, /* prefered */models: removed});
				}
			}
			
			commit && removed.length && this.commit();
			
			return removed;
		},
		
		/**
			Retrieve a {@link enyo.Model} for the provided index.
		
			@param {number} idx The index to return from the {@link enyo.Collection}.
			@returns {(enyo.Model|undefined)} The {@link enyo.Model} at the given index or
				`undefined`.
			@public
			@method
		*/
		at: function (idx) {
			return this.models[idx];
		},
		
		/**
			@public
			@method
		*/
		raw: function () {
			return this.models.map(function (model) {
				return model.raw();
			});
		},
		
		/**
			@public
			@method
		*/
		has: function (model) {
			return this.models.has(model);
		},
		
		/**
			@public
			@method
		*/
		forEach: function (fn, ctx) {
			
			// ensure that this is an immutable reference to the models such that changes will
			// not affect the entire loop - e.g. calling destroy on models won't keep this from
			// completing
			return this.models.slice().forEach(fn, ctx || this);
		},
		
		/**
			@public
			@method
		*/
		filter: function (fn, ctx) {
			
			// ensure that this is an immutable reference to the models such that changes will
			// not affect the entire loop - e.g. calling destroy on models won't keep this from
			// completing
			return this.models.slice().filter(fn, ctx || this);
		},
		
		/**
			@public
			@method
		*/
		find: function (fn, ctx) {
			
			// ensure that this is an immutable reference to the models such that changes will
			// not affect the entire loop - e.g. calling destroy on models won't keep this from
			// completing
			return this.models.slice().find(fn, ctx || this);
		},
		
		/**
			@public
			@method
		*/
		map: function (fn, ctx) {
			
			// ensure that this is an immutable reference to the models such that changes will
			// not affect the entire loop - e.g. calling destroy on models won't keep this from
			// completing
			return this.models.slice().map(fn, ctx || this);
		},
		
		/**
			@public
			@method
		*/
		indexOf: function (model, offset) {
			
			// ensure that this is an immutable reference to the models such that changes will
			// not affect the entire loop - e.g. calling destroy on models won't keep this from
			// completing
			return this.models.slice().indexOf(model, offset);
		},
		
		/**
			@public
			@method
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
			if (!silent) this.emit('reset', {models: this.models.copy()});
			
			return removed;
		},
		
		/**
			@public
			@method
		*/
		toJSON: function () {
			// @NOTE: Needs to be the JSON parse-able object...
			// return json.stringify(this.raw());
			return this.raw();
		},
		
		/**
			@public
			@method
		*/
		sort: function (fn, opts) {
			if (fn || this.comparator) {
				var options = {silent: false}, silent;
			
				opts = opts? enyo.mixin({}, [options, opts]): options;
				silent = opts.silent;
				this.models.sort(fn || this.comparator);
				!silent && this.emit('sort', {comparator: fn || this.comparator, models: this.models.copy()});
			}
			return this;
		},
		
		/**
			@public
		*/
		commit: function (opts) {
			var options = opts? enyo.clone(opts): {}
				, dit = this;
			
			options.success = function (res) {
				dit.onCommit(opts, res);
			};
			
			options.error = function (res) {
				dit.onError('commit', opts, res);
			};
			
			Source.execute('commit', this, options);
			return this;
		},
		
		/**
			@public
		*/
		fetch: function (opts) {
			var options = opts? enyo.clone(opts): {}
				, dit = this;
			
			options.success = function (res) {
				dit.onFetch(opts, res);
			};
			
			options.error = function (res) {
				dit.onError('fetch', opts, res);
			};
			
			Source.execute('fetch', this, options);
			return this;
		},
		
		/**
			@public
		*/
		destroy: enyo.inherit(function (sup) {
			return function (opts) {
				// @TODO: ...
				
				sup.apply(this, arguments);
			};
		}),
		
		/**
			@public
			@method
		*/
		comparator: null,
		
		/**
			@private
			@method
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
			
			model.on('*', this.onModelEvent, this);
			
			return model;
		},
		
		/**
			@private
		*/
		onCommit: function (opts, res) {
			this.log(opts, res);
			
			if (opts && opts.success) opts.success(opts, res);
		},
		
		/**
			@private
		*/
		onFetch: function (opts, res) {
			var options = this.options;
			
			opts = opts? enyo.mixin({}, [options, opts]): options;
			
			var parse = opts.parse;
			
			if (res) {
				parse && (res = this.parse(res));
				this.add(res, opts);
			}
			
			if (opts.success) opts.success(this, opts, res);
		},
		
		/**
			@private
		*/
		onError: function (action, opts, res) {
			this.log(action, opts, res);
		},
		
		/**
			@private
			@method
		*/
		onModelEvent: function (model, e) {
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
			@private
			@method
		*/
		onModelsChange: function (was, is, prop, opts) {
			var models = this.models.copy(),
				len = models.length;
			
			if (len != this.length) this.set('length', len);
			
			this.emit('reset', {/* for partial backward compatibility */records: models, /* prefered */models: models});
		},
		
		/**
			@private
			@method
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
			@private
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
		@private
		@static
	*/
	Collection.concat = function (ctor, props) {
		var proto = ctor.prototype || ctor;
		
		if (props.options) {
			proto.options = enyo.mixin({}, [proto.options, props.options]);
			delete props.options;
		}
	};
	
})(enyo, this);