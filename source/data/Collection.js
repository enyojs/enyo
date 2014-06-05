(function (enyo, scope) {
	
	var kind = enyo.kind;
	
	var Component = enyo.Component,
		EventEmitter = enyo.EventEmitter,
		Model = enyo.Model,
		ModelList = enyo.ModelList,
		Source = enyo.Source;
	
	/**
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
			opts = opts? enyo.mixin({}, [options, opts]): options;
			
			// our flags
			var merge = opts.merge
				, purge = opts.purge
				, silent = opts.silent
				, parse = opts.parse
				, find = opts.find
				, sort = opts.sort
				, commit = opts.commit
				, create = opts.create !== false;

			/*jshint -W018 */
			sort && !(typeof sort == 'function') && (sort = this.comparator);
			/*jshint +W018 */
			
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
				found = loc.has(id);
				
				// if it already existed...
				if (found) {
					
					// we need to ensure we've resolved the model (if necessary)
					found = loc.resolve(id);
					
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
				if (added) {
					this.emit('add', {/* for backward compatibility */ records: added, /* prefered */ models: added});
				}
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
				if (complete) this.store.remove(ctor, removed);
			}
			
			this.length = loc.length;
			
			if (!silent) {
				len != this.length && this.notify('length', len, this.length);
				if (removed.length) {
					this.emit('remove', {/* for partial backward compatibility */records: removed, /* prefered */models: removed});
				}
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