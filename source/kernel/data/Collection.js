(function (enyo) {

	//*@public
	/**
		The `enyo.Collection` _kind_ is designed to work with _arrays_ of `enyo.Models`.
		Out of the box they work with `toMany` _relations_ between _models_ with a _defined schema_.
		They have their own default mechanisms for retrieving arrays of data as well as filtering
		its content. They have the ability of being used as an exposed _controller_ or an automatically
		generated relational container depending on your need. Like the other components of the data
		layer in _enyo_ it defaults to functioning with typical _REST_ requests.
		
		[see enyo.Model](#), [see enyo.Store](#), [see enyo.Source](#)
	*/
	enyo.kind({

		// ...........................
		// PUBLIC PROPERTIES
		
		//*@public
		name: "enyo.Collection",
		
		//*@public
		kind: "enyo.Controller",
		
		//*@public
		/**
			A collection uses the `model` property to know what constructor
			to use when _data_ is handed to it. If an array of records are
			added that are normal data hashes it will convert them using this
			_kind_. It can be a _string_ that will be resolved to a _constructor_
			or a _constructor_ directly.
		*/
		model: "enyo.Model",
		
		//*@public
		/**
			Like `enyo.Model` an `enyo.Collection` has several statuses it will
			set depending on its current action. The following are the available
			options for status.
		
			- BUSY.FETCHING
			- BUSY.DESTROYING
			- CLEAN
			- ERROR.SOURCE
			- ERROR.RESPONSE
			- ERROR.TYPE
		
			[see enyo.Model.status](#)
		*/
		status: enyo.Model.CLEAN,
		
		//*@public
		/**
			The number of elements in the _collection_.
		*/
		length: 0,
		
		//*@public
		/**
			Used by the `enyo.Source` in the application to generate the appropriate
			request. By default it uses a simple _REST_ scheme. The `url` is a static
			_string_ that will be post-fixed to the root domain for the `enyo.Source`.
			In more complex setups [see `query`](#) for overloading implications and
			adding dynamic `url` handling possibilities.
		*/
		url: "",
		
		//*@public
		/**
			A `relation` is an optional _relational_ definition object and must be of
			the type `enyo.toOne` ([see enyo.toOne](#)) as defined in the `enyo.Model`
			documentation. If a `relationKey` is defined it will know to watch for the
			_value change_ notifications from the related _model_ and update accordingly.
		*/
		relation: null,
		
		//*@public
		events: {
			onModelChanged: "",
			onModelAdded: "",
			onModelsAdded: "",
			onModelRemoved: "",
			onModelsRemoved: "",
			onModelDestroyed: ""
		},
		
		//*@public
		handlers: {
			onChange: "_modelChanged",
			onDestroy: "_modelDestroyed"
		},		
		
		// ...........................
		// PROTECTED PROPERTIES

		//*@protected
		_store: null,

		// ...........................
		// COMPUTED PROPERTIES

		//*@public
		/**
			This computed property represents the underlying array of _models_.
			The `data` property may be set directly - but it will automatically
			replace all of the current content (if any). [See add](#) if the
			desire is not to replace but extend the current dataset. This
			_computed property_ may be overloaded in more complex scenarios
			requiring filtering and conditionally supplied datasets.
		*/
		data: enyo.computed(function (data) {
			if (data) {
				this.removeAll();
				this.add(data);
			} else {
				return this._store;
			}
		}, "length", {cached: true, defer: true}),
		
		//*@public
		/**
			Used by `enyo.Source` to generate the appropriate request for
			`fetching`. May be overloaded to produce dynamic _queries_.
		*/
		query: enyo.computed(function () {
			return this.url || this.model.prototype.get("query");
		}),

		// ...........................
		// PUBLIC METHODS

		//*@public
		/**
			Called by the `enyo.Source` for the application and used to
			build query parameters that will be applied as a query-string
			to the resulting request. By default this method does nothing.
			To add or modify parameters already set for the query, use the
			_options.queryParams_ hash (will always exist). These options
			are key-value pairs that will be serialized according to the
			`requestKind` of the `enyo.Source`.
		*/
		buildQueryParams: function (model, options) {
			// look at options.queryParams for a hash to add-to or modify
		},
		
		//*@public
		/**
			Returns an array of all of the raw datasets for any records
			in the _collection_. May be overloaded to propertly supply
			subsets of data on request. Optional parameter `local` will
			ensure that all _models_ use their local keys (default is to
			use remote keys if they are defined in the schema).
		*/
		raw: function (local) {
			return this.map(function (model) {
				return model.raw(local);
			});
		},
		
		//*@public
		/**
			Returns a JSON stringified version of the _collection_ array.
			Optional `local` parameter will ensure that _models_ use their
			local keys (default is to use remote keys if defined in the schema).
		*/
		toJSON: function (useLocalKeys) {
			return enyo.json.stringify(this.raw(useLocalKeys));
		},
		
		//*@public
		/**
			Fetch this _collection_. Accepts an options hash including a
			`success` method and/or an `error` method. A `fetch` request with
			results will _add_ those results to the _collection_. If you want
			to replace the contents use the `replace` options key or call
			`fetchAndReplace`.
		*/
		fetch: function (options) {
			var $options = options? enyo.clone(options): {};
			$options.success = this.bindSafely("didFetch", options || {});
			$options.error = this.bindSafely("didFail", "fetch", options || {});
			this.set("status", enyo.Model.BUSY.FETCHING);
			enyo.store.fetch(this, $options);
		},
		
		//*@public
		/**
			By default `fetch` will add to the _collection_ and keep any existing
			content. If you wish to replace all content with the results call this
			method using the same options.
		*/
		fetchAndReplace: function (options) {
			var $options = options? enyo.clone(options): {};
			$options.replace = true;
			this.fetch($options);
		},
		
		//*@public
		/**
			Not typically called directly but overloadable for extensibility.
		*/
		didFetch: function (options, result) {
			var data = this.filterData(result);

			if (options.replace) {
				this.removeAll();
			}
			this.add(data);
			this.startNotifications();
			if (options.success) {
				options.success(options, result);
			}
			this.set("status", enyo.Model.CLEAN);
		},
		
		//*@public
		/**
			Overload this method for handling fail-states. The `which`
			parameter will be `"fail"`. Sets the `status` to `ERROR.RESPONSE`.
		*/
		didFail: function (which, options) {
			this.set("status", enyo.Model.ERROR.RESPONSE);
		},
		
		//*@public
		/**
			TODO: Not implemented
		*/
		push: function () {
			enyo.warn("enyo.Collection.push: not currently implemented");
		},
		
		//*@public
		/**
			TODO: Not implemented
		*/
		pop: function () {
			enyo.warn("enyo.Collection.pop: not currently implemented");
		},
		
		//*@public
		/**
			TODO: Not implemented
		*/
		shift: function () {
			enyo.warn("enyo.Collection.shift: not currently implemented");
		},
		
		//*@public
		/**
			TODO: Not implemented
		*/
		unshift: function () {
			enyo.warn("enyo.Collection.unshift: not currently implemented");
		},
		
		//*@public
		/**
			Returns the index of the requested `value` in the _collection_
			starting from the optional `idx`.
		*/
		indexOf: function (value, idx) {
			return enyo.indexOf(value, this._store, idx);
		},
		
		//*@public
		/**
			Returns the last index of the `value` in the _collection_ starting
			from the optional `idx`.
		*/
		lastIndexOf: function (value, idx) {
			return enyo.lastIndexOf(value, this._store, idx);
		},
		
		//*@public
		/**
			TODO: Not implemented
		*/
		splice: function () {
			enyo.warn("enyo.Collection.splice: not currently implemented");
		},
		
		//*@public
		/**
			Returns a mapped array according to the return value of `fn` and
			the optional `context` to execute `fn` with (default is the _collection_).
		
			[see enyo.map](#)
		*/
		map: function (fn, context) {
			return enyo.map(this._store, fn, context || this);
		},
		
		//*@public
		/**
			Returns a filtered array of _models_ from the _collection_ according
			to the `true` or `false` return of `fn` and the optional `context`
			(default is the _collection_).
		
			[see enyo.filter](#)
		*/
		filter: function (fn, context) {
			return enyo.filter(this._store, fn, context || this);
		},
		
		//*@public
		/**
			In implementations where the result of a `fetch` may not be the array
			of records and needs to first be filtered overload this method. Return
			the array of records to be supplied during a `didFetch`.
		*/
		filterData: function (data) {
			return data;
		},
		
		//*@public
		/**
			Returns `true` or `false` whether the _collection_ contains `value`.
		*/
		contains: function (value) {
			return !!~enyo.indexOf(this._store, value);
		},
		
		//*@public
		/**
			Returns the _model_ at `idx` in the _collection_.
		*/
		at: function (idx) {
			return this._store[idx];
		},
		
		//*@public
		/**
			Add a single record to the _collection_. The `record` parameter
			may be an instance of `enyo.Model` or an object literal. If it is
			an object literal it will be converted to the _kind_ defined by the
			`model` property of this _collection_.
		*/
		add: function (record) {
			var idx = this._store.length;
			if (enyo.isArray(record)) {
				return this.addMany.apply(this, arguments);
			}
			if (!(record instanceof this.model)) {
				record = new this.model(record);
			}
			record._addCollection(this);
			this._store.push(record);
			this.set("length", this._store.length);
			if (!this._silenced) {
				this.doModelAdded({
					model: record,
					index: idx,
					collection: this
				});
			}
			return idx;
		},
		
		//*@public
		/**
			TODO: Not implemented
		*/
		addAt: function () {
			enyo.warn("enyo.Collection.addAt: not implemented yet");
		},
		
		//*@public
		/**
			Accepts an array of records to be added to the _collection_. If the
			records are object literals they will be converted to the _kind_ defined
			by the `model` property of the _collection_.
		*/
		addMany: function (records) {
			var added = [];
			this.silence();
			enyo.forEach(records, function (record) {
				var idx = this.add(record);
				if (!isNaN(idx)) {
					added.push({
						model: this.at(idx),
						index: idx,
						collection: this
					});
				}
			}, this);
			this.unsilence();
			if (added.length) {
				this.doModelsAdded({models: added});
			}
		},
		
		//*@public
		/**
			Removed `record` from the _collection_ if it exists and emits
			a `onModelRemoved` event.
		*/
		remove: function (record) {
			if (enyo.isArray(record)) {
				return this.removeMany.apply(this, arguments);
			}
			var idx = this.indexOf(record);
			if (!!~idx) {
				this._store.splice(idx, 1);
				this.set("length", this._store.length);
				record._removeCollection(this);
				if (!this._silenced) {
					this.doModelRemoved({
						model: record,
						index: idx,
						collection: this
					});
				}
				return idx;
			}
			return false;
		},
		
		//*@public
		/**
			Removes all models in the _collection_. Note these _models_ are not
			destroyed or removed from the `enyo.Store`.
		*/
		removeAll: function () {
			var $copy = enyo.clone(this._store);
			this.remove($copy);
		},
		
		//*@public
		/**
			TODO: Not implemented
		*/
		removeAt: function () {
			enyo.warn("enyo.Collection.removeAt: not implemented yet");
		},
		
		//*@public
		/**
			Removes all models in the `records` array if they are found in
			the _collection_. Note these _models_ are not destroyed or removed
			from the `enyo.Store`.
		*/
		removeMany: function (records) {
			var removed = [];
			this.silence();
			enyo.forEach(records, function (record) {
				var idx = this.remove(record);
				if (!isNaN(idx)) {
					removed.push({
						model: record,
						index: idx,
						collection: this
					});
				}
			}, this);
			this.unsilence();
			if (removed.length) {
				this.doModelsRemoved({models: removed});
			}
		},
		
		//*@public
		/**
			Overloaded `setter` that accepts an object literal and
			will apply all keys and values to the _collection_ also the
			normal key and value pair combination.
		*/
		set: function (prop, val) {
			if ("object" === typeof prop) {
				this.stopNotifications();
				for (var key in prop) {
					this.set(key, prop[key]);
				}
				this.startNotifications();
				return this;
			} else if (undefined === val) {
				return;
			} else {
				return this.inherited(arguments);
			}
		},
		
		//*@public
		/**
			Overloaded `ownerChanged` to prevent the normal handlers
			from executing. Overload with care.
		*/
		ownerChanged: function(old) {
			if (old && old.removeComponent) {
				old.removeComponent(this);
			}
			if (this.owner && this.owner.addComponent) {
				this.owner.addComponent(this);
			}
		},

		//*@public
		/**
			Accepts an array of models to add to the _collection_ at creation.
		*/
		constructor: function (props) {
			this._dirtyModels = [];
			this.inherited(arguments);
			// if the initial parameter is an array we use that as
			// our starting properties
			if (props && props instanceof Array) {
				this._store = this._store? this._store.concat(props): props;
			}
			// initialize our store
			this._store = this._store || [];
			this.length = this._store.length;
			this._initModel();
			if (this._store.length) {
				this._store = this.map(function (record) {
					var $rec = record instanceof this.model? record: new this.model(record);
					$rec._addCollection(this);
					return $rec;
				}, this);
			}
			this._initRelation();
		},

		// ...........................
		// PROTECTED METHODS

		//*@protected
		_initModel: function () {
			var $model = this.model;
			if ("string" === typeof $model) {
				$model = enyo.getPath($model);
			}
			this.model = $model;
			if ($model && this.relation) {
				$model = $model.prototype;
				if (this.relation.inverseKey) {
					if ($model._relations[this.relation.inverseKey]) {
						enyo.mixin(this.relation, $model._relations[this.relation.inverseKey]);
					}
				}
			}
		},
		
		//*@protected
		_initRelation: function () {
			var key, $rel = this.relation;
			if ($rel) {
				if ((key = $rel.relationKey)) {
					this.addObserver(key, this._relationObserver, this);
				}
			}
		},
		
		//*@protected
		_relationObserver: function (prop, prev, val) {
			var $rel = this.relation, key = $rel.inverseKey;
			if (key === prop && val) {
				this[$rel.relationKey].removeObserver(key, this._relationObserver);
				if ($rel.autoFetch) {
					this.fetch();
				}
			} else if ($rel.relationKey === prop) {
				if (val && $rel.autoFetch) {
					if (val[key]) {
						this.fetch();
					} else {
						val.addObserver(key, this._relationObserver, this);
					}
				}
			}
		},
		
		//*@protected
		_modelChanged: function (sender, event) {
			var idx = this.indexOf(sender);
			this.set("status", enyo.Model.DIRTY);
			if (!!~idx) {
				this.doModelChanged({
					model: sender,
					index: idx,
					collection: this
				});
			}
			return true;
		},
		
		//*@protected
		_modelDestroyed: function (sender, event) {
			var idx = this.indexOf(sender);
			if (!!~idx) {
				this.remove(sender);
				this.doModelDestroyed({
					model: sender,
					index: idx,
					collection: this
				});
			}
			return true;
		},
		
		// ...........................
		// OBSERVERS
		
		_statusChanged: enyo.observer(function (prop, prev, val) {
			if (prev == enyo.Model.DIRTY && val == enyo.Model.CLEAN) {
				enyo.forEach(enyo.clone(this._dirtyModels), function (rec) {
					rec.set("status", enyo.Model.CLEAN);
				});
			}
		}, "status")

	});

})(enyo);