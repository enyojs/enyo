(function (enyo, scope) {
	
	var kind = enyo.kind;
	
	var Filter = enyo.Filter;
	
	/**
		The {@link enyo.BucketFilter} is designed to expose a convenient API for filtering a
		{@link enyo.Collection} of {@link enyo.Model}s into subsets automatically.
	
		If a child-filter ({@link enyo.Filter}) has its `isDefault` property set to `true` its name
		will automatically be assigned to the {@link enyo.BucketFilter#defaultFilterName} property.
	
		@public
		@class enyo.BucketFilter
		@extends enyo.Filter
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
			The currently selected internal filter to proxy. If the name of a filter is given the
			{@link enyo.BucketFilter} will act as if its content is that of the selected filter.
			Setting this value to `*` will deselect any filter and will proxy its complete dataset
			unless there is a {@link enyo.BucketFilter#defaultFilterName} in which case it will
			automatically be set to and use that filter.
			
			@type String
			@default '*'
			@public
		*/
		filterName: '*',
		
		/**
			The filter to select when the {@link enyo.BucketFilter#filterName} property is set to
			`*`. If this is a valid filter, that filter will be selected instead. Also note that the
			{@link enyo.BucketFilter#defaultFilterName} property will automatically be selected
			after initialization.
		
			@type String
			@default ''
			@public
		*/
		defaultFilterName: '',
		
		/**
			Reset the {@link enyo.BucketFilter#filterName} property to `*`. If there is a value
			assigned to {@link enyo.BucketFilter#defaultFilterName} that will be assigned instead.
		
			@public
			@method
			@param {Object} [opts] The options to be passed to the internal
				{@link enyo.Object#set} method.
			@returns {enyo.BucketFilter} The callee for chaining.
		*/
		reset: function (opts) {
			return this.set('filterName', '*', opts);
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
		bindings: [
			{from: 'filterCollection.length', to: 'length', transform: function (value, dir, binding) {
				return !isNaN(value) ? value : binding.stop();
			}}
		],
		
		/**
			@private
		*/
		observers: [
			{path: 'filterName', method: 'onFilterNameChange'},
			{path: 'filterCollection', method: 'onFilterCollectionChange'}
		],
		
		/**
			@private
		*/
		adjustComponentProps: enyo.inherit(function (sup) {
			return function (props) {
				sup.apply(this, arguments);
				
				// the last component who's property is found will win...
				if (props.isDefault) this.defaultFilterName = props.name;
			};
		}),
		
		/**
			@private
		*/
		constructed: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				
				// we go ahead and let it initialize the current filter however it can
				this.onFilterNameChange();
			};
		}),
		
		/**
			@private
		*/
		onOwnerEvent: function (sender, e, props) {
			// we are listening for particular events to signal that we should update according
			// to its changes if we are a nested filter
			
			var models = props.models,
				filtered;
			
			if (e == 'sync:add' || e == 'sync:reset') {
				filtered = this.method(props.models, sender);
				if (e == 'sync:add') this.add(filtered, {merge: false});
				else if (e == 'sync:reset') this.add(filtered, {merge: false, purge: true});
			} else if (e == 'sync:remove') {
				this.remove(props.models);
			}
		},
		
		/**
			@private
		*/
		onFilterNameChange: function () {
			var nom = this.filterName || '*',
				filter;
			
			// if it is the asterisk catch-all we attempt to use the default filter name if it
			// exists otherwise we will use the complete dataset
			if (nom == '*') {
				if (this.defaultFilterName) nom = this.defaultFilterName;
			}
			
			filter = this[nom] || null;
			
			// if the filter isn't found then it will automatically reset to the complete dataset
			this.set('filterCollection', filter);
		},
		
		/**
			@private
		*/
		onFilterCollectionChange: function (was, is) {
			var collection;
			
			if (was) was.off('*', this.onFilterCollectionEvent, this);
			// if the current filter has been updated it will have caused a set on this property
			// with the correct filtered collection
			if (is) {
				is.on('*', this.onFilterCollectionEvent, this);
				// point all actions on this collection toward this sub-filter collection
				this._collectionProp = 'filterCollection';
				
				// so this is a different scenario than the underlying collection prop in that we
				// don't want to emit a sync event we only need anyone bound to this collection
				// to know we have new content (potentially)
				this.emit('reset', {models: is.models.copy()});
				
				// note that our length binding should already have been updated
			}
			
			// the alternative case is that the this filter instance is supposed to look at itself
			// (or its underlying collection if there is one)
			else {
				// point all actions to the collection knowing it will default to us if there isn't
				// one at this point
				this._collectionProp = 'collection';
				collection = this.collection || this;
				
				// note we don't register for the onFilterCollectionEvent's because if we have
				// an underlying collection its events will already be caught by the base classes
				// built-in handling and also because if it is this instance it will do the same
				// thing
				this.emit('reset', {models: collection.models.copy()});
			}
		},
		
		/**
			@private
		*/
		onFilterCollectionEvent: function (sender, e, props) {
			this.emit(e, props);
		}
	});
	
})(enyo, this);