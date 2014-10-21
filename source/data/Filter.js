(function (enyo, scope) {
	
	var kind = enyo.kind;
	
	var Collection = enyo.Collection;
	
	/**
	* Used internally (re-use) for filters that do not have a valid filter. This means they will
	* always keep a mirrored copy of the entire current dataset of the parent filter.
	* 
	* @private
	*/
	function alwaysTrue () {
		return true;
	}
	
	/**
	* This is an abstract [kind]{@glossary kind} used by [subkinds]{@glossary subkind} to
	* implement features relevant to filtered [collections]{@link enyo.Collection}. It does extend
	* {@link enyo.Collection} but only implements a subset of its methods. Unlike a normal
	* collection, which keeps its own set of [model]{@link enyo.Model} instances (and can
	* create, remove, or destroy them), an {@link enyo.Filter} uses another instance of
	* `enyo.Collection` as its dataset and safely proxies its models as a complete set or
	* according to the needs of its subkind. `enyo.Filter` is not intended to communicate
	* with [sources]{@link enyo.Source} (e.g., via [fetch()]{@link enyo.Collection#fetch}).
	* It maintains an implementation-specific API (from its subkinds) and propagates the
	* events and APIs inherited from `enyo.Collection` that are needed to interact with
	* [controls]{@link enyo.Control}.
	* 
	* @class enyo.Filter
	* @extends enyo.Collection
	* @protected
	*/
	var Filter = kind(
		/** @lends enyo.Filter.prototype */ {
		
		/**
		* @private
		*/
		name: 'enyo.Filter',
		
		/**
		* @private
		*/
		kind: Collection,
		
		/**
		* @private
		*/
		noDefer: true,
		
		/**
		* Provide a filter-method that will be applied to each [model]{@link enyo.Model} in the
		* current set of models. This method will accept parameters according to those supplied
		* with the native {@glossary Array.filter} method. If not provided a function that always
		* returns `true` will be used.
		*
		* @virtual
		* @type {Function}
		* @public
		*/
		method: null,
		
		/**
		* The actual {@link enyo.Collection} content to proxy. How the collection is
		* used varies depending on the [subkind]{@glossary subkind} implementing the
		* feature.
		* 
		* @type enyo.Collection
		* @default null
		* @public
		*/
		collection: null,
		
		/**
		* Once all components have been created, those that are [filters]{@link enyo.Filter}
		* (or [subkinds]{@glossary subkind}) will be added to this [array]{@glossary Array}.
		* This array is primarily for internal use and should not be modified directly.
		* 
		* @type Array
		* @default null
		* @readonly
		* @public
		*/
		filters: null,
		
		/**
		* @private
		*/
		defaultProps: {
			kind: 'enyo.Filter'
		},
		
		/**
		* @private
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
					if (typeof props.method != 'function') {
						// check to see if the prototype has one already
						props.method = props.kind.prototype.method || alwaysTrue;
					}
				}
			};
		}),
		
		/**
		* @private
		*/
		addComponent: enyo.inherit(function (sup) {
			return function (comp) {
				
				// if the component is a filter we add it to the array
				if (comp instanceof Filter) this.filters.push(comp);
				
				return sup.apply(this, arguments);
			};
		}),
		
		/**
		* Resets the [filter]{@link enyo.Filter} to its initial state. Behavior will
		* vary depending on the [subkind]{@glossary subkind} implementation.
		* 
		* @virtual
		* @method
		* @public
		*/
		reset: enyo.nop,
		
		/**
		* @private
		*/
		constructor: enyo.inherit(function (sup) {
			return function () {
				// ensure we have an array to work with
				this.filters = [];
				
				// unfortunately we must maintain data structures that need remain out of our
				// proxy path so we each must create a collection instance for internal use
				this._internal = new Collection({options: {modelEvents: false}});
				this._internal.on('*', this._internalEvent, this);
				
				sup.apply(this, arguments);
			};
		}),
		
		/**
		* @private
		*/
		constructed: enyo.inherit(function (sup) {
			return function () {
				var collection,
					owner;
				
				sup.apply(this, arguments);
				
				// we allow filters to be nested so they need to receive events from the
				// parent-filter and do with them as they need
				this.isChildFilter = ((owner = this.owner) && owner instanceof Filter);
				if(this.isChildFilter) {
					
					// if we're a child collection we don't want to monitor our parent's own state
					// we want to monitor their entire dataset
					this.collection = owner._internal;
					
					// register especially for owner events as we will differentiate them from
					// normal collection events
					this.collection.on('*', this._ownerEvent, this);
				}
				
				collection = this.collection;
				
				// if there is a collection instance already we need to initialize it
				if (collection) this.collectionChanged(null, collection);
			};
		}),
		
		/**
		* @private
		*/
		destroy: enyo.inherit(function (sup) {
			return function () {
				var collection = this.collection;
				
				// make sure that we remove our listener if we're being destroyed for some
				// reason (this would seem to be an irregular practice)
				if (collection) {
					if (this.isChildFilter && collection === this.owner._internal) {
						collection.off('*', this._ownerEvent, this);
					} else {
						collection.off('*', this._collectionEvent, this);
					}
					
					collection.unobserve('destroyed', this._collectionDestroyed, this);
				}
				
				sup.apply(this, arguments);
				
				// free our internal collection
				this._internal.destroy();
				this._internal = null;
			};
		}),
		
		/**
		* @private
		*/
		collectionChanged: function (was, is) {
			var internal = this._internal;
			
			if (was) {
				was.off('*', this._collectionEvent, this);
				was.unobserve('destroyed', this._collectionDestroyed, this);
			}
			
			// ensure that child-filters cannot have their internal/external collections reset
			if (is && !(was && this.isChildFilter && was === this.owner._internal)) {
				
				// case of child-filter whose collection is its owner does not need to receive
				// these events since it will receive them in a special handler to differentiate
				// these cases
				if (!this.isChildFilter || (is !== this.owner._internal)) {
					is.on('*', this._collectionEvent, this);
				}
				
				// if for any reason the collection is destroyed we want to know about it
				is.observe('destroyed', this._collectionDestroyed, this);
				
				// reset the models (causing reset to propagate to children or bound parties)
				internal.set('models', is.models.copy());
			} else {
				// it was set to nothing so we should be nothing
				if (internal.length) internal.empty();
			}
		},
		
		/**
		* This method is invoked when events are received from a
		* [collection]{@link enyo.Collection} that is not the owner of this
		* [filter]{@link enyo.Filter} (meaning it is not a child, since all child-filters'
		* owners are also filters and their event handling happens in another method).
		* As long as we are consistent about applying the same action against ourselves,
		* we should remain in sync and propagate the same event again, except that
		* `sort` will end up being a `reset`.
		* 
		* @private
		*/
		_collectionEvent: function (sender, e, props) {
			// we are listening for particular events to signal that we should update according
			// to its changes if we are a nested filter
			
			var models = props.models,
				internal = this._internal;
			
			switch (e) {
			case 'add':
				
				// will ensure an add gets propagated if the models are new
				internal.add(models, {merge: false});
				break;
			case 'reset':
			case 'sort':
				
				// will ensure a reset gets propagated
				internal.empty(models);
				break;
			case 'remove':
				
				// will ensure a remove gets propagated (assuming something is removed)
				internal.remove(models);
				break;
			case 'change':
				
				// we need to propagate the change event as our internal collection's own so that
				// child filters and/or subclasses will be able to handle this as they need to
				internal.emit(e, props);
				break;
			}
		},
		
		/**
		* When the collection is destroyed we can't use it anymore so we need to remove it as our
		* collection to prevent weird things from happening.
		*
		* @private
		*/
		_collectionDestroyed: function () {
			this.set('collection', null);
		},
		
		/**
		* To be implemented by [subkind]{@glossary subkind}; for internal use only.
		*
		* @virtual
		* @private
		*/
		_internalEvent: enyo.nop,
		
		/**
		* To be implemented by [subkind]{@glossary subkind}; for internal use only.
		*
		* @virtual
		* @private
		*/
		_ownerEvent: enyo.nop,
		
		/**
		* Unavailable on {@link enyo.Filter} and [subkinds]{@glossary subkind}.
		*
		* @method
		* @public
		*/
		add: enyo.nop,
		
		/**
		* Unavailable on {@link enyo.Filter} and [subkinds]{@glossary subkind}.
		*
		* @method
		* @public
		*/
		remove: enyo.nop,
		
		/**
		* Unavailable on {@link enyo.Filter} and [subkinds]{@glossary subkind}.
		*
		* @method
		* @public
		*/
		fetch: enyo.nop,
		
		/**
		* Unavailable on {@link enyo.Filter} and [subkinds]{@glossary subkind}.
		*
		* @method
		* @public
		*/
		sort: enyo.nop,
		
		/**
		* Unavailable on {@link enyo.Filter} and [subkinds]{@glossary subkind}.
		*
		* @method
		* @public
		*/
		commit: enyo.nop,
		
		/**
		* Overloaded implementation.
		*
		* @see enyo.Collection.at
		* @method
		* @public
		*/
		at: enyo.inherit(function (sup) {
			return function () {
				return this.models ? sup.apply(this.models.at ? this.models : this, arguments) : undefined;
			};
		}),
		
		/**
		* Unavailable on {@link enyo.Filter} and [subkinds]{@glossary subkind}.
		*
		* @method
		* @public
		*/
		raw: enyo.nop,
		
		/**
		* Unavailable on {@link enyo.Filter} and [subkinds]{@glossary subkind}.
		*
		* @method
		* @public
		*/
		toJSON: enyo.nop,
		
		/**
		* Overloaded implementation.
		*
		* @see enyo.Collection.has
		* @method
		* @public
		*/
		has: enyo.inherit(function (sup) {
			return function () {
				return this.models ? sup.apply(this, arguments) : false;
			};
		}),
		
		/**
		* Overloaded implementation.
		*
		* @see enyo.Collection.forEach
		* @method
		* @public
		*/
		forEach: enyo.inherit(function (sup) {
			return function () {
				return this.models ? sup.apply(this, arguments) : undefined;
			};
		}),
		
		/**
		* Overloaded implementation.
		*
		* @see enyo.Collection.filter
		* @method
		* @public
		*/
		filter: enyo.inherit(function (sup) {
			return function () {
				return this.models ? sup.apply(this, arguments) : [];
			};
		}),
		
		/**
		* Overloaded implementation.
		*
		* @see enyo.Collection.find
		* @method
		* @public
		*/
		find: enyo.inherit(function (sup) {
			return function () {
				return this.models ? sup.apply(this, arguments) : undefined;
			};
		}),
		
		/**
		* Overloaded implementation.
		*
		* @see enyo.Collection.map
		* @method
		* @public
		*/
		map: enyo.inherit(function (sup) {
			return function () {
				return this.models ? sup.apply(this, arguments) : [];
			};
		}),
		
		/**
		* Overloaded implementation.
		*
		* @see enyo.Collection.indexOf
		* @method
		* @public
		*/
		indexOf: enyo.inherit(function (sup) {
			return function () {
				return this.models ? sup.apply(this, arguments) : -1;
			};
		}),
		
		/**
		* Unavailable on {@link enyo.Filter} and [subkinds]{@glossary subkind}.
		*
		* @method
		* @public
		*/
		empty: enyo.nop
	});
	
})(enyo, this);
