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
		active: '*',
		
		/**
			This will be the {@link enyo.BucketFilter#active} filter on initialization and anytime
			the {@link enyo.BucketFilter#reset} method is called. It can be set directly or
			implicitly by setting a child-filter's `isDefault` flag to `true`.
		
			@type String
			@default null
			@public
		*/
		defaultFilter: null,
		
		/**
			Removes any active filter. If there is a {@link enyo.BucketFilter#defaultFilter} it will
			automatically set it as the active filter (if it wasn't active already). Otherwise it
			will set the {@link enyo.BucketFilter#active} property to the special `*` character and
			proxy its complete dataset.
		
			@method
			@param {Object} [opts] The options to be passed to the internal
				{@link enyo.Object#set} method.
			@returns {enyo.BucketFilter} The callee for chaining.
			@public
		*/
		reset: function (opts) {
			return this.set('active', this.defaultFilter || '*', opts);
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
		observers: [
			{path: 'active', method: 'onActiveChange'},
			{path: 'activeCollection', method: 'onActiveCollectionChange'}
		],
		
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
				
				// we go ahead and let it initialize the current filter however it can
				this.onActiveChange();
			};
		}),
		
		/**
			See the comments on {@link enyo.Filter#onCollectionEvent}.
			
			@private
		*/
		onOwnerEvent: function (sender, e, props) {
			// we are listening for particular events to signal that we should update according
			// to its changes if we are a nested filter
			
			var models = props.models,
				internal = this._internal,
				filtered;
			
			switch (e) {
			case 'add':
				
				filtered = this.method(models, sender);
				
				// will ensure an add gets propagated if the models are new
				internal.add(filtered, {merge: false});
				break;
			case 'reset':
				
				filtered = this.method(models, sender);
				
				// will ensure a reset gets propagated
				internal.empty(filtered);
				break;
			case 'remove':
				
				// will ensure a remove gets propagated (assuming something is removed)
				internal.remove(this, models);
				break;
			}
		},
		
		/**
			@private
		*/
		onInternalEvent: function (sender, e, props) {
			
			// if our internal collection is what we are currently proxying then we need to
			// propagate the event, otherwise not
			if (this.models === sender.models) this.emit(e, props);
		},
		
		/**
			@private
		*/
		onActiveChange: function () {
			var nom = this.active || '*',
				filter;
			
			filter = this[nom] || null;
			
			// if the filter isn't found then it will automatically reset to the complete dataset
			this.set('activeCollection', filter);
		},
		
		/**
			@private
		*/
		onActiveCollectionChange: function (was, is) {
			var internal = this._internal;
			
			if (was) was.off('*', this.onActiveCollectionEvent, this);
			// if the current filter has been updated it will have caused a set on this property
			// with the correct filtered collection
			if (is) {
				is.on('*', this.onActiveCollectionEvent, this);
				
				// we set our models to be shared with this new active collection so we can
				// proxy its dataset and then we just proxy its events as our own
				// note that we deliberately do not copy the models as they will always be in the
				// same state as our active collection
				this.set('models', is.models);
			}
			
			// if there is no active filter then we need to proxy our complete dataset whatever
			// that may be
			else {
				
				// also note the shared reference such that the onInternalEvent will actually
				// propagate its internal events as our own now
				this.set('models', internal.models);
			}
		},
		
		/**
			@private
		*/
		onActiveCollectionEvent: function (sender, e, props) {
			
			// we share the same reference to our models (ModelList) array so we don't need to
			// try and keep them synchronized as a separate effort we simply emit the event
			// as our own and no one will know the difference!
			this.emit(e, props);
		}
	});
	
})(enyo, this);