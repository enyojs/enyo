(function (enyo, scope) {
	
	var kind = enyo.kind;
	
	var Filter = enyo.Filter,
		ModelList = enyo.ModelList;
	
	/**
	* A primarily abstract {@glossary kind} of {@link enyo.Filter}. It serves the simple purpose
	* of taking a [collection]{@link enyo.Collection} of [models]{@link enyo.Model} and
	* progressively filtering its contents each time it is triggered. Because this is primarily
	* an abstract kind, it makes no assumptions about how it is triggered.
	* [Subkinds]{@glossary subkind} may provide a more defined API.
	*
	* @class enyo.ProgressiveFilter
	* @extends enyo.Filter
	* @public
	*/
	kind(
		/** @lends enyo.ProgressiveFilter.prototype */ {
		
		/**
		* @private
		*/
		name: 'enyo.ProgressiveFilter',
		
		/**
		* @private
		*/
		kind: Filter,
		
		/**
		* @private
		*/
		defaultProps: {
			kind: 'enyo.ProgressiveFilter'
		},
		
		/**
		* Whether or not the content is currently filtered.
		*
		* @type Boolean
		* @default false
		* @public
		*/
		filtered: false,
		
		/**
		* Resets the filtered set to the complete set of the proxied
		* [collection]{@link enyo.Collection}, if there is one, and sets the
		* [filtered]{@link enyo.ProgressiveFilter#filtered} property to `false`.
		*
		* @returns {this} The callee for chaining.
		* @public
		*/
		reset: function () {
			if (this.collection) {
				
				// because we can't be certain that the models were completely replaced on the
				// the collection we have to make a new copy each time reset is called
				this._internal.set('models', this.collection.models.copy());
			}
			this.set('filtered', false);
			return this;
		},
		
		/**
		* An overloaded version of the normal [filter()]{@link enyo.Collection#filter} method.
		* This method may be called without parameters to trigger an in-place application of
		* the [_filter()]{@link enyo.ProgressiveFilter#_filter} method against the current set
		* or subset of [models]{@link enyo.Model}.
		*
		* @method
		* @public
		*/
		filter: enyo.inherit(function (sup) {
			return function () {
				if (arguments.length > 0) return sup.apply(this, arguments);
				
				return this._filter();
			};
		}),
		
		/**
		* @method
		* @private
		*/
		collectionChanged: enyo.inherit(function (sup) {
			return function (was, is) {
				sup.apply(this, arguments);
				
				// this ensures we aren't filtered anymore
				this.set('filtered', false);
			};
		}),
		
		/**
		* @method
		* @private
		*/
		constructor: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				
				// we need to always proxy a single targets content so, unlike bucket filters
				// we facade our 'models' as our internal collection
				this.models = this._internal;
			};
		}),
		
		/**
		* Abstracted to allow (internal) subkinds to overload the filter method and still call
		* this method for the same behavior if necessary.
		*
		* @private
		*/
		_filter: function () {
			var internal = this._internal,
				len = internal.length,
				res;
			
			if (len) {
				
				// skip one arbitrary level of abstraction to the lowest level implementation of
				// the filter that we can since we need an array that we can reuse anyway
				res = internal.models.filter(this.method, this);
				
				if (res.length != len) {
					internal.set('models', new ModelList(res.length ? res : null));
					this.set('filtered', true);
				}
			}
			
			return res || [];
		},
		
		/**
		* @private
		*/
		_internalEvent: function (sender, e, props) {
			
			// if our internal collection is what we are currently proxying then we need to
			// propagate the event, otherwise not
			if (this.models === sender) {
				
				if (sender.models.length != this.length) this.set('length', sender.models.length);
				
				this.emit(e, props);
			}
		},
		
		/*
		* See the comments on {@link enyo.Filter#_collectionEvent}.
		* 
		* @private
		*/
		_ownerEvent: function (sender, e, props) {
			this._collectionEvent(sender, e, props);
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
				internal = this._internal,
				filtered = this.get('filtered');
			
			switch (e) {
			case 'add':
				// to preserve the efficacy of the abstracted internal _filter method we need
				// to go ahead and allow all of the models to be added at the correct location
				// and then, if necessary filter but only emit events/changes for those that
				// are actually added
				if (filtered) internal.silence().stopNotifications(true);
				
				internal.add(models, {merge: false, index: props.index});
				
				if (filtered) {
					// here we let it update the filtered set
					internal.unsilence().startNotifications(true);
					this.filter();
					
					// there is the off-chance that the lengths don't get updated correctly
					if (this.length !== internal.length) this.set('length', internal.length);
				}
				break;
			case 'reset':
			case 'sort':
				
				if (filtered) internal.silence().stopNotifications(true);
				
				// will ensure a reset gets propagated
				internal.empty(models);
				
				if (filtered) {
					internal.unsilence().startNotifications(true);
					this.filter();
					
					// there is the off-chance that the lengths don't get updated correctly
					if (this.length !== internal.length) this.set('length', internal.length);
				}
				break;
			case 'remove':
				
				// will ensure a remove gets propagated (assuming something is removed)
				internal.remove(models);
				break;
			case 'change':
				
				// we only want to emit the event if the model exists in the filtered set
				// (if filtered)
				if (filtered && !internal.has(props.model)) break; 
				
				// we need to propagate the change event as our internal collection's own so that
				// child filters and/or subclasses will be able to handle this as they need to
				internal.emit(e, props);
				break;
			}
		}
		
	});
	
})(enyo, this);