(function (enyo, scope) {
	
	var kind = enyo.kind;
	
	var Filter = enyo.Filter,
		ModelList = enyo.ModelList;
	
	/**
	*
	
	/**
	* A primarily abstract {@glossary kind} of {@link enyo.Filter}. It serves a simple purpose of
	* taking a {@link enyo.Collection} of [models]{@link enyo.Model} and progressively filtering
	* its contents each time it is triggered. Because this is primarily an abstract {@glossary kind}
	* it makes no assumptions about how it is triggered. [Sub-kinds]{@glossary sub-kind} may
	* provide a more defined API.
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
		* Provide a filter-method that will be applied to each [model]{@link enyo.Model} in the
		* current set of models. This method will accept parameters according to those supplied
		* with the native {@glossary Array.filter} method.
		*
		* @virtual
		* @type {Function}
		* @public
		*/
		method: function () {
			return true;
		},
		
		/**
		*
		*/
		reset: function () {
			if (this.collection) {
				
				// because we can't be certain that the models were completely replaced on the
				// the collection we have to make a new copy each time reset is called
				this._internal.set('models', this.collection.models.copy());
			}
			return this;
		},
		
		/**
		* An overloaded version of the normal [filter]{@link enyo.Collection#filter} method. This
		* method can be called without parameters to trigger an in-place application of the
		* {@link enyo.ProgressiveFilter#filterMethod} against the current set or subset of
		* [models]{@link enyo.Model}.
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
		* Abstracted so that (internal) subkinds could overload the filter method and still call
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
				internal.set('models', new ModelList(res.length ? res : null));
			}
			
			return res || [];
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
		
		// WHERE I LEFT OFF: Without a way to know where models were inserted (for add), they
		// may not be able to remain in order correctly without rescanning/filtering the entire
		// content every time a new model was added
		
		// Below is copied raw from BucketFilter and needs to be reviewed for applicability to
		// this other case.
		
		/*
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
		}
		
	});
	
})(enyo, this);