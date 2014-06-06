(function (enyo, scope) {
	
	/* @namespace enyo */
	
	var kind = enyo.kind;
	
	var Collection = enyo.Collection;
	
	/**
		Used internally (re-use) for filters that do not have a valid filter. This means they will
		always keep a mirrored copy of the entire current dataset of the parent filter.
		
		@private
	*/
	function alwaysTrue () {
		return true;
	}
	
	/**
		This is an abstract class used by subclasses to implement features relevant to filtered
		[collections]{@link enyo.Collection}. It does extend {@link enyo.Collection} but only
		implements a subset of its methods. Unlike a normal {@link enyo.Collection} that keeps its
		own set of [models]{@link enyo.Model} instances (and can create, remove or destroy them), a
		{@link enyo.Filter} uses another instance of {@link enyo.Collection} as its dataset and
		safely proxies its [models]{@link enyo.Model} as a complete set or according to the needs
		of its subclass. {@link enyo.Filter} is not intended to communicate with
		[sources]{@link enyo.Source} (e.g. via {@link enyo.Collection#fetch}). It maintains an
		implementation specific API (from its subclass) and propagates the events and API's
		inherited from {@link enyo.Collection} required to interact with
		[controls]{@link enyo.Control}.
		
		@protected
		@class enyo.Filter
		@extends enyo.Collection
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
			The actual {@link enyo.Collection} content to proxy. How the {@link enyo.Collection} is
			used varies by the subclass implementing the feature.
			
			@type enyo.Collection
			@default null
			@public
		*/
		collection: null,
		
		/**
			Once all components have been created, those that are [filters]{@link enyo.Filter} (or
			subclasses) will be added to this array. This array should not be modified directly and
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
			Reset the filter to its initial state. Will vary by subclass implementation.
		
			@abstract
			@method
			@public
		*/
		reset: enyo.nop,
		
		/**
			@private
		*/
		constructor: enyo.inherit(function (sup) {
			return function () {
				// ensure we have an array to work with
				this.filters = [];
				
				// unfortunately we must maintain data structures that need remain out of our
				// proxy path so we each must create a collection instance for internal use
				this._internal = new Collection();
				this._internal.on('*', this.onInternalEvent, this);
				
				sup.apply(this, arguments);
			};
		}),
		
		/**
			@private
		*/
		constructed: enyo.inherit(function (sup) {
			return function () {
				var collection,
					owner;
				
				sup.apply(this, arguments);
				
				// we allow filters to be nested so they need to receive events from the
				// parent-filter and do with them as they need
				if ((owner = this.owner) && owner instanceof Filter) {
					
					// if we're a child collection we don't want to monitor our parent's own state
					// we want to monitor their entire dataset
					this.collection = owner._internal;
					
					// register especially for owner events as we will differentiate them from
					// normal collection events
					this.collection.on('*', this.onOwnerEvent, this);
				}
				
				collection = this.collection;
				
				// if there is a collection instance already we need to initialize it
				if (collection) this.onCollectionChange(null, collection);
			};
		}),
		
		/**
			@private
		*/
		destroy: enyo.inherit(function (sup) {
			return function () {
				var collection = this.collection;
				
				// make sure that we remove our listener if we're being destroyed for some
				// reason (this would seem to be an irregular practice)
				if (collection) {
					if (collection === this.owner._internal) {
						collection.off('*', this.onOwnerEvent, this);
					} else {
						collection.off('*', this.onCollectionEvent, this);
					}
				}
				
				sup.apply(this, arguments);
				
				// free our internal collection
				this._internal.destroy();
				this._internal = null;
			};
		}),
		
		/**
			@private
		*/
		onCollectionChange: function (was, is) {
			var internal = this._internal;
			
			if (was) was.off('*', this.onCollectionEvent, this);
			
			// ensure that child-filters cannot have their internal/external collection's reset
			if (is && !(was && was === this.owner._internal)) {
				
				// case of child-filter who's collection is its owner does not need to receive
				// these events since it will receive them in a special handler to differentiate
				// these cases
				if (is !== this.owner._internal) is.on('*', this.onCollectionEvent, this);
				
				// reset the models (causing reset to propagate to children or bound parties)
				internal.set('models', is.models.copy());
			} else {
				// it was set to nothing so we should be nothing
				if (internal.length) internal.empty();
			}
		},
		
		/**
			This method is invoked when events are received from a `collection` that is not the
			owner of this filter (meaning it is not a child since all child-filters owners are
			also filters and their event handling happens in another method). As long as we are
			consistent about applying the same action against ourselves we should remain in-sync as
			well as propagate the same event again with the exception of `sort` that will wind up
			being a `reset`.
			
			@private
		*/
		onCollectionEvent: function (sender, e, props) {
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
			@abstract
			@private
		*/
		onInternalEvent: enyo.nop,
		
		/**
			Subclasses are responsible for handling all owner related events.
		
			@abstract
			@private
		*/
		onOwnerEvent: enyo.nop,
		
		/**
			@private
		*/
		add: enyo.nop,
		
		/**
			@private
		*/
		remove: enyo.nop,
		
		/**
			@private
		*/
		fetch: enyo.nop,
		
		/**
			@private
		*/
		sort: enyo.nop,
		
		/**
			@private
		*/
		commit: enyo.nop,
		
		/**
			@private
		*/
		at: enyo.inherit(function (sup) {
			return function () {
				return this.models ? sup.apply(this, arguments) : undefined;
			};
		}),
		
		/**
			@private
		*/
		raw: enyo.nop,
		
		/**
			@private
		*/
		toJSON: enyo.nop,
		
		/**
			@private
		*/
		has: enyo.inherit(function (sup) {
			return function () {
				return this.models ? sup.apply(this, arguments) : false;
			};
		}),
		
		/**
			@private
		*/
		forEach: enyo.inherit(function (sup) {
			return function () {
				return this.models ? sup.apply(this, arguments) : undefined;
			};
		}),
		
		/**
			@private
		*/
		filter: enyo.inherit(function (sup) {
			return function () {
				return this.models ? sup.apply(this, arguments) : [];
			};
		}),
		
		/**
			@private
		*/
		find: enyo.inherit(function (sup) {
			return function () {
				return this.models ? sup.apply(this, arguments) : undefined;
			};
		}),
		
		/**
			@private
		*/
		map: enyo.inherit(function (sup) {
			return function () {
				return this.models ? sup.apply(this, arguments) : [];
			};
		}),
		
		/**
			@private
		*/
		indexOf: enyo.inherit(function (sup) {
			return function () {
				return this.models ? sup.apply(this, arguments) : -1;
			};
		}),
		
		/**
			@private
		*/
		empty: enyo.nop
	});
	
})(enyo, this);