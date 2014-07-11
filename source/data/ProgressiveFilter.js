(function (enyo, scope) {
	
	var kind = enyo.kind;
	
	var Filter = enyo.Filter;
	
	/**
	* Progressively filter a {@link enyo.Collection} by filtering on supplied text. The
	* {@link enyo.ProgressiveFilter} acts as proxy for the content of a {@link enyo.Collection} and
	* can be used as a {@link enyo.Collection} for purposes of {@link enyo.Binding} to a the
	* `collection` property of a {@link enyo.Control}. It implements the abstract interface of
	* {@link enyo.Filter}, thus it only has a subset of normal {@link enyo.Collection} methods
	* and behaviors.
	*
	* @class enyo.ProgressiveFilter
	* @extends enyo.Filter
	* @public
	*/

	/**
	* @typedef {Object} enyo.BucketFilter~Filters
	* @property {String} path - A path to extract the data in the model, usually the name of the
	*	property to extract. May also be `*` to indicate that only the model is needed by the method.
	* @property {Method} method - A {@link enyoProgessiveFilter~Filter} to call that will return
	*	`true` if {@link enyo.ProgressiveFilter#filterText} is found. If not specified it will default
	*	to {@link enyo.ProgressiveFilter.caseInsensitiveFilter}.
	*/

	/**
	* @callback enyo.ProgressiveFilter~Filter
	* @param {enyo.ProgressiveFilter} sender - The filter object that triggered the filter
	* @param {*} value - The value of the specified property or `null` if path was `*`
	* @param {String} text - The text to filter on
	* @param {enyo.Model} model - The current model being examined
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
		* The text to search for in the specified {@link enyo.ProgressiveFilter#modelName}. If empty, no filtering will occur.
		*
		* @type String
		* @default ''
		* @public
		*/
		filterText: '',
		
		/**
		* An array of {@link enyo.ProgressiveFilter~Filters}.
		*
		* @type {enyo.ProgressiveFilter~Filters[]}
		* @default []
		* @public
		*/
		filters: null,
		
		/**
		* Resets {@link enyo.ProgressiveFilter#filterText}, causing the results to be unfiltered
		* @param {Object} [opts] The options to be passed to the internal
		*	{@link enyo.Object#set} method.
		* @returns {enyo.ProgressiveFilter} The callee for chaining.
		* @public
		*/
		reset: function (opts) {
			return this.set('filterText', '', opts);
		},
		
		/**
		* @private TODO: not needed? Maybe needed?
		*/
		constructed: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				
				// Initialize filters when starting up as changed handlers won't fire
				this.applyFilters();
			};
		}),
		
		/**
		* Need to override the addComponent on {@link enyo.Filter} because we're overloading the
		* meaning of {@link enyo.ProgressiveFilter#filters}
		* @private
		*/
		addComponent: function () {
			throw "ProgressiveFilter can not have child components";
		},

		/**
		* @private
		*/
		_filterFunction: function (model) {
			var text = this.filterText,
				filters = this.filters,
				value;
			if(text && filters && filters.length) {
				return filters.findIndex(function (filter) {
					if(filter.path === '*') {
						if(filter.method && filter.method(this, null, text, model)) {
							return true;
						}
					} else {
						if(filter.path && (value = model.get(filter.path))) {
							if(filter.method ? filter.method(this, value, text, model) : enyo.ProgressiveFilter.caseInsensitiveFilter(this, value, text, model)) {
								return true;
							}
						}
					}
				}) !== -1;
			} else {
				return true;
			}
		},

		/**
		* @private
		*/
		applyFilters: function (refine) {
			var filtered,
				collection = refine ? this._internal : this.collection;
			if(collection) {
				filtered = collection.models.filter(this._filterFunction, this);
				this._internal.empty(filtered);
			} else {
				this._internal.empty();
			}
		},

		/**
		* @private
		*/
		collectionChanged: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				
				this.applyFilters();
			};
		}),

		/**
		* See the comments on {@link enyo.Filter#_collectionEvent}.
		*
		* @private
		*/
		_collectionEvent: function (sender, e, props) {
			// we are listening for particular events to signal that we should update according
			// to its changes if we are a nested filter
			var models = props.models,
				owner = this.owner,
				internal = this._internal,
				filtered;

			switch (e) {
			case 'add':
				
				filtered = models.filter(this._filterFunction, this);
				
				// will ensure an add gets propagated if the models are new
				internal.add(filtered, {merge: false});
				break;
			case 'reset':
				
				filtered = models.filter(this._filterFunction, this);
				
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
				filtered = this._filterFunction.call(owner, props.model);
				
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
		 * TODO: Add shortcuts to below methods to prevent filtering when when we know there's not valid filter
		* @private
		*/
		filterTextChanged: function (was, is) {
			var refine = is && is.indexOf(was) >= 0;

			this.applyFilters(refine);
		},

		filtersChanged: function () {
			this.applyFilters(false);
		},
		statics: /** @lends enyo.ProgressiveFilter.prototype */ {
			/**
			* A case-sensitive filter suitable for {@link enyo.ProgressiveFilter#filters} `method`.
			*/
			caseSensitiveFilter: function (sender, value, text, model) {
				return value && (value.indexOf(text) >= 0);
			},
			/**
			* A case-insensitive filter suitable for {@link enyo.ProgressiveFilter#filters} `method`.
			*/
			caseInsensitiveFilter: function (sender, value, text, model) {
				// TODO: Could (should?) optimize the text.toLowerCase outside the loop?
				return value && (value.toLowerCase().indexOf(text.toLowerCase()) >= 0);
			}
		}
	});
})(enyo, this);

