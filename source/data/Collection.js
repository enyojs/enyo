(function (enyo) {
	
	var kind = enyo.kind
		, inherit = enyo.inherit
		, isArray = enyo.isArray
		, isObject = enyo.isObject
		, isString = enyo.isString
		, constructorForKind = enyo.constructorForKind
		, store = enyo.store
		, uid = enyo.uid
		, mixin = enyo.mixin
		, json = enyo.json
		, clone = enyo.clone;
	
	var Component = enyo.Component
		, EventEmitter = enyo.EventEmitter
		, Model = enyo.Model
		, ModelList = enyo.ModelList
		, Source = enyo.Source;
	
	/**
		@public
		@class enyo.Collection
	*/
	var Collection = kind(
		/** @lends enyo.Collection.prototype */ {
		name: 'enyo.Collection',
		kind: Component,
		noDefer: true,
		
		/**
			@public
		*/
		model: Model,
		
		/**
			These are the default options used by the {@link Collection} in various routines. See their individual
			definitions. There are multiple ways to use these or overload them...
		
			@public
		*/
		options: {
			
			/**
				Merge datasets that are added when an instance of the record is already found in this
				collection or in the store.
				
				@public
			*/
			merge: true,
			silent: false,
			purge: false,
			parse: false,
			create: true,
			find: true,
			sort: false,
			commit: false,
			
			/**
				Used in {@link #remove} to indicate whether or not to destroy models that are removed from
				the {@link Collection}.
			
				@public
			*/
			destroy: false,
			
			/**
				Used in {@link #remove} to indicate whether or not to remove models from the {@link #store}
				as well as the {@link Collection}. This flag is ignored is {@link #options.destroy} is `true`.
				
				@public
			*/
			complete: false,
			
			/**
				Automatically fetch after initialization.
				
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
			@public
			@method
		*/
		parse: function (data) {
			return data;
		},
		
		/**
			@public
			@method
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
			opts = opts? mixin({}, [options, opts]): options;
			
			// our flags
			var merge = opts.merge
				, purge = opts.purge
				, silent = opts.silent
				, parse = opts.parse
				, find = opts.find
				, sort = opts.sort
				, commit = opts.commit
				, create = opts.create !== false;
			
			sort && !(typeof sort == 'function') && (sort = this.comparator);
			
			// for a special case purge to remove records that aren't in the current
			// set being added
				
			// we treat all additions as an array of additions
			!(models instanceof Array) && (models = [models]);
			
			for (var i=0, end=models.length; i<end; ++i) {
				model = models[i];
				
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
				found = loc.resolve(id);
				
				// if it already existed...
				if (found) {
					if (merge) {
						attrs || (attrs = model.attributes);
						parse && (attrs = found.parse(attrs));
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
					model = this.prepareModel(attrs || model, opts);
					added || (added = []);
					added.push(model);
				}
			}
			
			// here we process those models to be removed if purge was true
			// the other guard is just in case we actually get to keep everything
			// so we don't do this unnecessary pass
			if (purge && ((keep && keep.length < len) || models.length === 0)) {
				removed || (removed = []);
				keep || (keep = {});
				for (i=0; i<len; ++i) !keep[(model = loc[i]).euid] && removed.push(model);
				// if we removed any we process that now
				removed.length && this.remove(removed, options);
			}
			
			// added && loc.stopNotifications().add(added, idx).startNotifications();
			if (added) {
				loc.add(added, idx);
				sort && this.sort(sort, {silent: true});
				
				// we batch this operation to make use of its ~efficient array opereations
				this.store.add(added); 
			}
			this.length = loc.length;
			
			
			if (!silent) {
				// notify observers of the length change
				len != this.length && this.notify('length', len, this.length);
				// notify listeners of the addition of records
				added && this.emit('add', {/* for backward compatibility */ records: added, /* prefered */ models: added});
			}
			
			commit && added && this.commit(opts);
			
			return added;
		},
		
		/**
			@public
			@method
		*/
		remove: function (models, opts) {
			var loc = this.models
				, len = loc.length
				, ctor = this.model
				, options = this.options
				, removed, model, idx;
			
			// normalize options so we have values
			opts = opts? mixin({}, [options, opts]): options;
			
			// our flags
			var silent = opts.silent
				, destroy = opts.destroy
				, complete = opts.complete
				, commit = opts.commit;
			
			// we treat all additions as an array of additions
			!(models instanceof Array) && (models = [models]);
			
			removed = loc.remove(models);
			
			if (removed) {
				for (var i=0, end=removed.length; i<end; ++i) {
					model = removed[i];
					model.off('*', this.onModelEvent, this);
					if (destroy) model.destroy(opts);
					else if (complete) model.store.remove(ctor, model);
				}
			}
			
			this.length = loc.length;
			
			// most features dependent on notification of this action can and should
			// avoid needing the original indices of the models being removed
			// for (var i=0, end=models.length; i<end; ++i) {
			// 	model = models[i];
			// 	loc.remove(model/*, {silent: true}*/);
			// 	// we know if it successfully removed the model because the length was
			// 	// updated accordingly
			// 	if (loc.length != len) {
			// 		removed || (removed = []);
			// 		removed.push(model);
			// 		model.off('*', this.onModelEvent, this);
			// 		// if destroy is true then we call that now and it won't have duplicate remove
			// 		// requests because the event responder only calls remove if the model isn't
			// 		// destroyed and we can ignore the complete flag because it will automatically
			// 		// be removed from the store when it is destroyed
			// 		if (destroy) model.destroy(opts);
			// 		// we need to also remove it from the store if we can
			// 		else if (complete) this.store.remove(ctor, model);
			// 		// update our internal length because it was decremented
			// 		len = loc.length;
			// 	}
			// }
			
			if (!silent) {
				len != this.length && this.notify('length', len, this.length);
				removed && this.emit('remove', {/* for partial backward compatibility */records: removed, /* prefered */models: removed});
			}
			
			commit && removed && this.commit();
			
			return removed;
		},
		
		/**
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
			return this.models.forEach(fn, ctx || this);
		},
		
		/**
			@public
			@method
		*/
		filter: function (fn, ctx) {
			return this.models.filter(fn, ctx || this);
		},
		
		/**
			@public
			@method
		*/
		find: function (fn, ctx) {
			return this.models.find(fn, ctx || this);
		},
		
		/**
			@public
			@method
		*/
		map: function (fn, ctx) {
			return this.models.map(fn, ctx || this);
		},
		
		/**
			@public
			@method
		*/
		indexOf: function (model, offset) {
			return this.models.indexOf(model, offset);
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
			
				opts = opts? mixin({}, [options, opts]): options;
				silent = opts.silent;
				this.models.sort(fn || this.comparator);
				!silent && this.emit('sort', {comparator: fn || this.comparator, models: this.models.slice()});
			}
			return this;
		},
		
		/**
			@public
		*/
		commit: function (opts) {
			var options = opts? clone(opts): {}
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
			var options = opts? clone(opts): {}
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
		destroy: inherit(function (sup) {
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
			var ctor = this.model
				// , options = {silent: true, noAdd: true}
				, model;
			
			// opts = opts? mixin({}, [options, opts]): options;
			// opts = opts || {};
			// opts.noAdd = true;
			
			attrs instanceof ctor && (model = attrs);
			if (!model) {
				opts = opts || {};
				opts.noAdd = true;
				model = new ctor(attrs, null, opts);
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
			
			opts = opts? mixin({}, [options, opts]): options;
			
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
				// this.emit('change', {models: [model]});
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
			var models = this.models.slice();
			
			// if (was) was.destroy();
			
			this.emit('reset', {/* for partial backward compatibility */records: models, /* prefered */models: models});
		},
		
		/**
			@private
			@method
		*/
		constructor: inherit(function (sup) {
			return function (recs, props, opts) {
				// opts = opts? (this.options = mixin({}, [this.options, opts])): this.options;
				
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
					this.options = mixin({}, [this.options, props.options]);
					delete props.options;
				}
				
				opts = opts? mixin({}, [this.options, opts]): this.options;
				
				// @TODO: For now, while there is only one property we manually check for it
				// if more options arrise that should be configurable this way it may need to
				// be modified
				opts.fetch && (this.options.fetch = opts.fetch);
				
				this.length = this.models.length;
				this.euid = uid('c');
				
				sup.call(this, props);
				
				typeof this.model == 'string' && (this.model = constructorForKind(this.model));
				this.store = this.store || store;
				recs && recs.length && this.add(recs, opts);
			};
		}),
		
		/**
			@private
		*/
		constructed: inherit(function (sup) {
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
			proto.options = mixin({}, [proto.options, props.options]);
			delete props.options;
		}
	};
	
})(enyo);
