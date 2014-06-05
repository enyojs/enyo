(function (enyo, scope) {
	
	var kind = enyo.kind;
	
	var Collection = enyo.Collection,
		ModelList = enyo.ModelList;
	
	/**
		Used internally (re-use) for filters that do not have a valid filter. This means they will
		always keep a mirrored copy of the entire current dataset of the parent filter.
		
		@private
	*/
	function alwaysTrue () {
		return true;
	}
	
	/**
		This is an abstract class. In principle it can be used as a {@link enyo.Collection} or act
		on a {@link enyo.Collection} as itself ({@see enyo.Filter#collection} property). Since this
		is an abstract class, it is not intended to be used on its own.
	
		All {@link enyo.Component#components} of a {@link enyo.Filter} have their `publish` property
		set to `true` (unless explicitly `false`). They should always have a `name` and additional
		(optional) property `method`. If `method` is not declared explicitly a function by that
		name will be used from the parent {@link enyo.Filter}. If one cannot be found it will use
		a function that will always return `true`. Also note that the `method` can be a `function`.
		
		
		@public
		@class enyo.Filter
	*/
	var Filter = kind(
		/** @lends enyo.Filter.prototype */ {
		
		/**
			@private
		*/
		name: 'enyo.Filter',
		
		/**
			@private
		*/
		kind: Collection,
		
		/**
			@private
		*/
		noDefer: true,
		
		/**
			If the {@link enyo.Filter} is being used as a proxy for swappable
			{@link enyo.Collection} instances then this property should be used noting that all
			related filters will only have access to models in the current collection set here. If
			this property is being used, all {@link enyo.Collection} accessor methods are proxied
			to the underlying collection. If it is not being used, then the {@link enyo.Filter} will
			act on itself according to how it has been configured. This is important since, for
			example, calling {@link enyo.Collection#fetch} on the {@link enyo.Filter} will
			potentially work very differently if it has an underlying collection instance or is
			acting on itself.
			
			@type enyo.Collection
			@default null
			@public
		*/
		collection: null,
		
		/**
			Once all components have been created, those that are {@link enyo.Filter}'s (or sub-
			classes) will be added to this array. This array should not be modified directly and
			is primarily for internal use.
			
			@type Array
			@readonly
			@public
		*/
		filters: null,
		
		/**
			@private
		*/
		defaultProps: {
			kind: 'enyo.Filter'
		},
		
		/**
			@private
		*/
		bindings: [
			{from: 'collection.length', to: 'length', transform: function (value, dir, binding) {
				return !isNaN(value) ? value : binding.stop();
			}}
		],
		
		/**
			@private
		*/
		adjustComponentProps: enyo.inherit(function (sup) {
			return function (props) {
				// all filters are public...always...except when they aren't...
				if (props.publish !== false) props.publish = true;
				
				sup.apply(this, arguments);
				
				// now to ensure that there is the correct kind associated with the child component
				if (typeof props.kind == 'string') props.kind = enyo.constructorForKind(props.kind);
				if (props.kind && props.kind.prototype instanceof Filter) {
					if (!props.name) {
						throw 'enyo.Filter.adjustComponentProps: Child filters must have a name';
					}
					
					// if no method is named explicitly we assume the same name as the filter
					if (!props.method) props.method = props.name;
					
					// most likely it will be a string but it is possible that the filter method
					// be declared inline in the component descriptor block
					if (typeof props.method == 'string') props.method = this[props.method];
					
					// we assign an always true method if none exists just because we assume it was
					// mean to be a mirror filter for the entire dataset
					if (typeof props.method != 'function') props.method = alwaysTrue;
				}
			};
		}),
		
		/**
			@private
		*/
		addComponent: enyo.inherit(function (sup) {
			return function (comp) {
				
				// if the component is a filter we add it to the array
				if (comp instanceof Filter) this.filters.push(comp);
				
				return sup.apply(this, arguments);
			};
		}),
		
		/**
			@private
		*/
		observers: [
			{path: 'collection', method: 'onCollectionChange'}
		],
		
		
		/**
			Should be implemented by subclasses.
		
			@public
			@method
		*/
		reset: enyo.nop,
		
		/**
			@private
		*/
		constructor: enyo.inherit(function (sup) {
			return function () {
				// ensure we have an array to work with
				this.filters = [];
				
				sup.apply(this, arguments);
			};
		}),
		
		/**
			@private
		*/
		constructed: enyo.inherit(function (sup) {
			return function () {
				var fetch = this.options.fetch,
					filters = this.filters,
					collection = this.collection,
					owner;
					
				// we need to ensure that the collection doesn't try to fetch before we create our
				// default collection and finish initializing
				this.options.fetch = false;
				
				sup.apply(this, arguments);
				
				// we allow filters to be nested...so it gets confusing
				if ((owner = this.owner) && owner instanceof Filter) {
					owner.on('sync', this.onOwnerEvent, this);
				}
				
				// figure out if we need to create a collection from what we've been given since it
				// can be a string, constructor, instance or nothing
				if (collection) {
					if (typeof collection == 'string') {
						collection = enyo.constructorForKind(collection);
					}
					if (typeof collection == 'function') {
						collection = this.createComponent({kind: collection});
						
						// in the off-chance that we were handed data initially we should ensure
						// the sub-collection has it
						if (this.models.length) collection.set('models', this.models);
					}
				
					this.set('collection', collection);
				} else this.onCollectionChange();
				
				// if we were supposed to automatically fetch we reassign the correct value and
				// do as we're told
				if (fetch) {
					this.options.fetch = fetch;
					this.fetch();
				}
			};
		}),
		
		/**
			@private
		*/
		destroy: enyo.inherit(function (sup) {
			return function () {
				
				sup.apply(this, arguments);
			};
		}),
		
		/**
			@private
		*/
		onCollectionChange: function (was, is) {
			var models;
			
			if (was) {
				was.off('*', this.onCollectionEvent, this);
			}
			if (is) {
				is.on('*', this.onCollectionEvent, this);
				
				// children filters can't listen for the reset event because their content would
				// incorrectly update according to filter-changes but here we need them to sync
				// to new data so we emit a special event call sync
				this.emit('sync:reset', {models: is.models});
			} else {
				
				models = this.models;
				
				// noting the absolute importance of the force flag here as it will ensure that our
				// length property is set correctly and it will ultimately propagate the sync event
				// that we want to be sent to our child filters (if any)
				this.set('models', models || new ModelList(), {force: true});
			}
		},
		
		/**
			@private
		*/
		_collectionProp: 'collection',
		
		/**
			@private
		*/
		onCollectionEvent: function (sender, e, props) {
			if (this.filters.length) {
				// the child filters need to sync but to maintain ordered sets they
				// must re-scan the entirety of the base
				if (e == 'reset') this.emit('sync:reset', {models: sender.models});
				else if (e == 'add') this.emit('sync:add', {models: props.models});
				else if (e == 'remove') this.emit('sync:remove', {models: props.models});
			}
		
			// we always re-emit the event as our own to ensure that anyone interested
			// is updated accordingly
			this.emit(e, props);
		},
		
		/**
			Should be implemented by subclasses.
		
			@private
		*/
		onOwnerEvent: enyo.nop,
		
		/**
			@private
		*/
		add: enyo.inherit(function (sup) {
			return function (models, opts) {
				var collection = this[this._collectionProp],
					ret;
				
				opts = opts ? enyo.mixin({}, [this.options, opts]) : enyo.clone(this.options);
				opts.source = opts.source || this.source;
				
				if (collection) {
					ret = collection.add.apply(collection, arguments);
					if (opts.commit) this.commit(opts);
				} else {
					ret = sup.apply(this, arguments);
					if (ret.length) this.emit('sync:add', {models: ret});
				}
				return ret;
			};
		}),
		
		/**
			@private
		*/
		remove: enyo.inherit(function (sup) {
			return function () {
				var collection = this[this._collectionProp],
					ret;
					
				opts = opts ? enyo.mixin({}, [this.options, opts]) : enyo.clone(this.options);
				opts.source = opts.source || this.source;
				
				if (collection) {
					ret = collection.remove.apply(collection, arguments);
					if (opts.commit) this.commit(opts);
				} else {
					ret = sup.apply(this, arguments);
					if (ret.length) this.emit('sync:remove', {models: ret});
				}
				return ret;
			};
		}),
		
		/**
			@private
		*/
		fetch: enyo.inherit(function (sup) {
			return function () {
				var collection = this[this._collectionProp];
				
				if (collection) return collection.fetch.apply(collection, arguments);
				else return sup.apply(this, arguments);
			};
		}),
		
		/**
			@private
		*/
		sort: enyo.inherit (function (sup) {
			return function () {
				var collection = this[this._collectionProp];
				
				if (collection) return collection.sort.apply(collection, arguments);
				else return sup.apply(this, arguments);
			};
		}),
		
		/**
			@private
		*/
		commit: enyo.inherit(function (sup) {
			return function () {
				var collection = this[this._collectionProp];
				
				if (collection) {
					// it is possible that the target collection does not have an appropriate
					// url or it was set on the parent bucket alone so we check that here
					if (!collection.url) collection.url = this.url;
					return collection.commit.apply(collection, arguments);
				} else return sup.apply(this, arguments);
			};
		}),
		
		
		/**
			@private
		*/
		at: enyo.inherit(function (sup) {
			return function () {
				var collection = this[this._collectionProp];
				
				if (collection) return collection.at.apply(collection, arguments);
				else return sup.apply(this, arguments);
			};
		}),
		
		/**
			@private
		*/
		raw: enyo.inherit(function (sup) {
			return function () {
				var collection = this[this._collectionProp];
				
				if (collection) return collection.raw.apply(collection, arguments);
				else return sup.apply(this, arguments);
			};
		}),
		
		/**
			@private
		*/
		has: enyo.inherit(function (sup) {
			return function () {
				var collection = this[this._collectionProp];
				
				if (collection) return collection.has.apply(collection, arguments);
				else return sup.apply(this, arguments);
			};
		}),
		
		/**
			@private
		*/
		forEach: enyo.inherit(function (sup) {
			return function () {
				var collection = this[this._collectionProp];
				
				if (collection) return collection.forEach.apply(collection, arguments);
				else return sup.apply(this, arguments);
			};
		}),
		
		/**
			@private
		*/
		filter: enyo.inherit(function (sup) {
			return function () {
				var collection = this[this._collectionProp];
				
				if (collection) return collection.filter.apply(collection, arguments);
				else return sup.apply(this, arguments);
			};
		}),
		
		/**
			@private
		*/
		find: enyo.inherit(function (sup) {
			return function () {
				var collection = this[this._collectionProp];
				
				if (collection) return collection.find.apply(collection, arguments);
				else return sup.apply(this, arguments);
			};
		}),
		
		/**
			@private
		*/
		map: enyo.inherit(function (sup) {
			return function () {
				var collection = this[this._collectionProp];
				
				if (collection) return collection.map.apply(collection, arguments);
				else return sup.apply(this, arguments);
			};
		}),
		
		/**
			@private
		*/
		indexOf: enyo.inherit(function (sup) {
			return function () {
				var collection = this[this._collectionProp];
				
				if (collection) return collection.indexOf.apply(collection, arguments);
				else return sup.apply(this, arguments);
			};
		}),
		
		/**
			@private
		*/
		empty: enyo.inherit(function (sup) {
			return function (opts) {
				var collection = this[this._collectionProp],
					ret;
				
				if (collection) {
					ret = collection.empty.apply(collection, arguments);
					if ((opts && opts.commit) || this.options.commit) {
						this.commit(opts);
					}
				} else {
					ret = sup.apply(this, arguments);
					if (ret.length) this.emit('sync:remove', {models: ret});
				}
				return ret;
			};
		})
	});
	
})(enyo, this);