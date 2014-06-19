(function (enyo, scope) {
	
	var kind = enyo.kind;
	
	var Filter = enyo.Filter;
	
	/**
		Maintain the filtered state of a {@link enyo.Collection} with pre-defined filters. The
		{@link enyo.BucketFilter} acts as proxy for the content of a {@link enyo.Collection} and
		can be used as a {@link enyo.Collection} for purposes of {@link enyo.Binding} to a the
		`collection` property of a {@link enyo.Control}. It implements the abstract interface of
		{@link enyo.Filter}, thus is only has a subset of normal {@link enyo.Collection} methods
		and behaviors.
		
		@class enyo.BucketFilter
		@extends enyo.Filter
		@public
	*/
	kind(
		/** @lends enyo.BucketFilter.prototype */ {
		
		/**
			@private
		*/
		name: 'enyo.BucketFilter',
		
		/**
			@private
		*/
		kind: Filter,
		
		/**
			@private
		*/
		noDefer: true,
		
		/**
			The currently activated internal filter to proxy. If the name of a filter is given the
			{@link enyo.BucketFilter} will act as if its content is that of the selected filter.
			Setting this value to `*` will deselect any filter and will proxy its complete dataset.
			If this is set to any _falsy_ value it will be coerced to `*`. During initialization,
			if any child-filter has the `isDefault` flag set to `true` it will become the active
			filter instead.
			
			@type String
			@default '*'
			@public
		*/
		activeFilter: '*',
		
		/**
			This will be the {@link enyo.BucketFilter#activeFilter} filter on initialization and
			anytime the {@link enyo.BucketFilter#reset} method is called. It can be set directly or
			implicitly by setting a child-filter's `isDefault` flag to `true`.
		
			@type String
			@default null
			@public
		*/
		defaultFilter: null,
		
		/**
			Removes any active filter. If there is a {@link enyo.BucketFilter#defaultFilter} it will
			automatically set it as the active filter (if it wasn't active already). Otherwise it
			will set the {@link enyo.BucketFilter#activeFilter} property to the special `*`
			character and proxy its complete dataset.
		
			@method
			@param {Object} [opts] The options to be passed to the internal
				{@link enyo.Object#set} method.
			@returns {enyo.BucketFilter} The callee for chaining.
			@public
		*/
		reset: function (opts) {
			return this.set('activeFilter', this.defaultFilter || '*', opts);
		},
		
		/**
			@private
		*/
		defaultProps: {
			kind: 'enyo.BucketFilter'
		},
		
		/**
			@private
		*/
		adjustComponentProps: enyo.inherit(function (sup) {
			return function (props) {
				sup.apply(this, arguments);
				
				// the last component who's property is found will win...
				if (props.isDefault) this.defaultFilter = props.name;
			};
		}),
		
		/**
			@private
		*/
		constructed: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				
				// TODO: Invoking changed handlers during initialization seems wrong
				// but its used everywhere...
				
				// we go ahead and let it initialize the current filter however it can
				this.activeFilterChanged();
			};
		}),
		
		/**
			See the comments on {@link enyo.Filter#_collectionEvent}.
			
			@private
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
			@private
		*/
		_internalEvent: function (sender, e, props) {
			
			// if our internal collection is what we are currently proxying then we need to
			// propagate the event, otherwise not
			if (this.models === sender.models) {
				
				if (sender.models.length != this.length) this.set('length', sender.models.length);
				
				this.emit(e, props);
			}
		},
		
		/**
			@private
		*/
		activeFilterChanged: function () {
			var nom = this.activeFilter || '*',
				filter;
			
			filter = this[nom] || null;
			
			// if the filter isn't found then it will automatically reset to the complete dataset
			this.set('activeFilterCollection', filter);
		},
		
		/**
			@private
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
			@private
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