(function (enyo, scope) {
	
	var kind = enyo.kind;
	
	var Filter = enyo.Filter;
	
	/**
	* A [filter]{@link enyo.Filter} designed to maintain multiple filtered sets based on one
	* [collection]{@link enyo.Collection} of [models]{@link enyo.Model}.
	* {@link enyo.BucketFilter} and all of its [filters]{@link enyo.BucketFilter#filters} may
	* be used in conjunction with [controls]{@link enyo.Control} that support usage with
	* {@link enyo.Collection}.
	*
	* @class enyo.BucketFilter
	* @extends enyo.Filter
	* @public
	*/
	kind(
		/** @lends enyo.BucketFilter.prototype */ {
		
		/**
		* @private
		*/
		name: 'enyo.BucketFilter',
		
		/**
		* @private
		*/
		kind: Filter,
		
		/**
		* @private
		*/
		noDefer: true,
		
		/**
		* The currently activated internal filter to proxy. If the name of a filter is given, the
		* {@link enyo.BucketFilter} will act as if its content is that of the selected filter.
		* Setting this value to `'*'` will deselect any filter and will proxy its complete dataset.
		* If this is set to any **falsy** value, it will be coerced to `'*'`. During initialization,
		* if any child-filter has the `isDefault` flag set to `true`, it will become the active
		* filter instead.
		* 
		* @type String
		* @default '*'
		* @public
		*/
		activeFilter: '*',
		
		/**
		* This will be the [activeFilter]{@link enyo.BucketFilter#activeFilter} on initialization and
		* anytime the [reset()]{@link enyo.BucketFilter#reset} method is called. It can be set directly or
		* implicitly by setting a child-filter's `isDefault` flag to `true`.
		* 
		* @type String
		* @default null
		* @public
		*/
		defaultFilter: null,
		
		/**
		* Removes any [activeFilter]{@link enyo.BucketFilter#activeFilter}. If there is a
		* [defaultFilter]{@link enyo.BucketFilter#defaultFilter}, this method will automatically
		* set it as the active filter (if it wasn't already active). Otherwise, it will set the
		* `activeFilter` property to the special `'*'` character and proxy its complete dataset.
		* 
		* @param {Object} [opts] - The options to be passed to the internal
		* 	{@link enyo.Object#set} method.
		* @returns {this} The callee for chaining.
		* @public
		*/
		reset: function (opts) {
			return this.set('activeFilter', this.defaultFilter || '*', opts);
		},
		
		/**
		* @private
		*/
		defaultProps: {
			kind: 'enyo.BucketFilter'
		},
		
		/**
		* @private
		*/
		adjustComponentProps: enyo.inherit(function (sup) {
			return function (props) {
				sup.apply(this, arguments);
				
				// the last component whose property is found will win...
				if (props.isDefault) this.defaultFilter = props.name;
			};
		}),
		
		/**
		* @private
		*/
		constructed: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				
				// TODO: Invoking changed handlers during initialization seems wrong
				// but it's used everywhere...
				
				// we go ahead and let it initialize the current filter however it can
				this.reset({force: true});
			};
		}),
		
		/**
		* See the comments on {@link enyo.Filter#_collectionEvent}.
		* 
		* @private
		*/
		_ownerEvent: function (sender, e, props) {
			// we are listening for particular events to signal that we should update according
			// to its changes if we are a nested filter
			var models = props.models,
				owner = this.owner,
				internal = this._internal,
				filtered;
			
			switch (e) {
			case 'add':
				
				filtered = models.filter(this.method, owner);
				
				// will ensure an add gets propagated if the models are new
				internal.add(filtered, {merge: false});
				break;
			case 'reset':
				
				filtered = models.filter(this.method, owner);
				
				// will ensure a reset gets propagated
				internal.empty(filtered);
				break;
			case 'remove':
				
				// will ensure a remove gets propagated (assuming something is removed)
				internal.remove(models);
				break;
			case 'change':
				// the change event being emitted from a collection only stems from internal
				// model changes so the property is model not models
				filtered = this.method.call(owner, props.model);
				
				// if it should be included we add it otherwise we attempt to remove it
				if (filtered) internal.add(props.model, {merge: false});
				else if (internal.has(props.model)) internal.remove(props.model);
				break;
			}
		},
		
		/**
		* @private
		*/
		_internalEvent: function (sender, e, props) {
			
			// if our internal collection is what we are currently proxying then we need to
			// propagate the event, otherwise not
			if (this.models === sender.models) {
				
				if (sender.models.length != this.length) this.set('length', sender.models.length);
				
				this.emit(e, props);
			} else if ((!this.isChildFilter) && (e === 'reset')) {
				this.set('models', this._internal.models);
			}
		},
		
		/**
		* Observes changes to the [activeFilter]{@link enyo.BucketFilter#activeFilter} property.
		*
		* @type {enyo.ObserverSupport~Observer}
		* @private
		*/
		activeFilterChanged: function () {
			var nom = this.activeFilter || '*',
				filter;
			
			filter = this[nom] || null;
			
			// if the filter isn't found then it will automatically reset to the complete dataset
			this.set('activeFilterCollection', filter);
		},
		
		/**
		* Observes changes to the
		* [activeFilterCollection]{@link enyo.BucketFilter#activeFilterCollection} property.
		*
		* @type {enyo.ObserverSupport~Observer}
		* @private
		*/
		activeFilterCollectionChanged: function (was, is) {
			var internal = this._internal;
			
			if (was) was.off('*', this._activeFilterCollectionEvent, this);
			// if the current filter has been updated it will have caused a set on this property
			// with the correct filtered collection
			if (is) {
				is.on('*', this._activeFilterCollectionEvent, this);
				
				// we set our models to be shared with this new active collection so we can
				// proxy its dataset and then we just proxy its events as our own
				// note that we deliberately do not copy the models as they will always be in the
				// same state as our active collection
				this.set('models', is.models);
			}
			
			// if there is no active filter then we need to proxy our complete dataset whatever
			// that may be
			else {
				
				// also note the shared reference such that the _internalEvent will actually
				// propagate its internal events as our own now
				this.set('models', internal.models);
			}
		},
		
		/**
		* @private
		*/
		_activeFilterCollectionEvent: function (sender, e, props) {
			
			if (sender.models.length != this.length) this.set('length', sender.models.length);
			
			// we share the same reference to our models (ModelList) array so we don't need to
			// try and keep them synchronized as a separate effort we simply emit the event
			// as our own and no one will know the difference!
			this.emit(e, props);
		}
	});
	
})(enyo, this);
