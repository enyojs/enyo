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
			onChange: "__modelChanged",
			onDestroy: "__modelDestroyed"
		},

		// ...........................
		// PROTECTED PROPERTIES

		//*@protected
		__store: null,

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
				return this.__store;
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
			var $d = this.filterData(result), $o = options || enyo.pool.claimObject();
			if ($o.replace) {
				this.removeAll();
			}
			this.add($d);
			this.startNotifications();
			if ($o.success) {
				$o.success(options, result);
			}
			this.set("status", enyo.Model.CLEAN);
			enyo.pool.releaseObject($o);
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
			return enyo.indexOf(value, this.__store, idx);
		},

		//*@public
		/**
			Returns the last index of the `value` in the _collection_ starting
			from the optional `idx`.
		*/
		lastIndexOf: function (value, idx) {
			return enyo.lastIndexOf(value, this.__store, idx);
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
			return enyo.map(this.__store, fn, context || this);
		},

		//*@public
		/**
			Returns a filtered array of _models_ from the _collection_ according
			to the `true` or `false` return of `fn` and the optional `context`
			(default is the _collection_).

			[see enyo.filter](#)
		*/
		filter: function (fn, context) {
			return enyo.filter(this.__store, fn, context || this);
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
			Returns `true` or `false` whether the _collection_ contains `record`.
		*/
		contains: function (record) {
			return !!~enyo.indexOf(this.__store, record);
		},

		//*@public
		/**
			Returns the _model_ at `idx` in the _collection_.
		*/
		at: function (idx) {
			return this.__store[idx];
		},

		//*@public
		/**
			Add a record or an array of records to the existing dataset starting
			at the end. If adding a single record it will return the index where the record was inserted
			Otherwise it will return the value of `addMany` ([see addMany](#)). Note that it
			accepts _enyo.Model_ instances or native objects that will be converted into the _kind_ indicated
			by the `model` property. If adding a single record it will emit an `onModelAdded` event
			with a reference to the model added at the `model` property, the index at which it
			was inserted at the `index` property and a reference to the collection that emitted the
			event (this) at the `collection` property of the event object.
		*/
		add: function (record) {
			// this allow us to call add for both a single record or an array
			if (enyo.isArray(record)) {
				return this.addMany(record);
			}
			var $r = record, $i = this.length;
			if ($r) {
				if (!($r instanceof this.model)) {
					$r = new this.model($r);
				}
				$r.addCollection(this);
				this.__store.push($r);
				this.set("length", this.__store.length);
				this.doModelAdded({model: $r, index: $i, collection: this});
				return $i;
			}
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
			Inserts an array of records into the _collection_ beginning at the
			end of the current dataset. If there were any records added successfully
			it will emit a single event `onModelsAdded` with a reference to the array
			of records that were inserted at the property `models` of the event object.
			Also if any records were inserted it will return a reference to the array
			passed up by the event.
		*/
		addMany: function (records) {
			var $t = [], $j;
			this.silence();
			for (var $i=0, r$; (r$=records[$i]); ++$i) {
				$j = this.add(r$);
				if (!isNaN($j)) {
					$t.push({model: this.at($j), index: $j, collection: this});
				}
			}
			this.unsilence();
			if ($t.length) {
				this.doModelsAdded({models: $t});
				return $t;
			}
		},

		//*@public
		/**
			Remove a record or an array of records from the _collection_. If the record
			does not exist within the _collection_ it will return `undefined`. Otherwise
			it will return the index where the record was removed. Removing a single record
			will emit the `onModelRemoved` event with a reference to the model at the `model`
			property, the index where the model was removed at the `index` property and a
			reference to the collection the model was removed from (this) at the `collection`
			property of the event object. This will also trigger any observers of the `length`
			property of the _collection_. [See removeMany](#) for details of how the _collection_
			handles removing an array of records.
		*/
		remove: function (record) {
			if (enyo.isArray(record)) {
				return this.removeMany(record);
			}
			var $r = record, $i = this.indexOf($r);
			if (!!~$i) {
				this.__store.splice($i, 1);
				$r.removeCollection(this);
				this.set("length", this.__store.length);
				this.doModelRemoved({model: $r, index: $i, collection: this});
				return $i;
			}
		},

		//*@public
		/**
			Removes all models in the _collection_. Note these _models_ are not
			destroyed or removed from the `enyo.Store`.
		*/
		removeAll: function () {
			this.removeMany(enyo.clone(this.__store));
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
			Remove an array of records from the _collection_. They do not need to be
			in order for this to be achieved. A single `onModelsRemoved` event will
			be emitted when the operation is complete with an array of all records removed
			at the `models` property of the event object. Each entry of the `models` array
			will be according to the structure of the `onModelRemoved` event emitted by
			the `remove` method (for single records). This method safely ignores models that
			are not found in this _collection_. If any records were removed a reference to the
			array of those records will be returned.
		*/
		removeMany: function (records) {
			var $r = [], $j;
			this.silence();
			for (var $i=records.length-1, r$; (r$=records[$i]); --$i) {
				$j = this.remove(r$);
				if (!isNaN($j)) {
					$r.push({model: r$, index: $j, collection: this});
				}
			}
			this.unsilence();
			if ($r.length) {
				this.doModelsRemoved({models: $r});
				return $r;
			}
		},

		//*@public
		/**
			Overloaded `setter` that accepts an object literal and
			will apply all keys and values to the _collection_ also the
			normal key and value pair combination.
		*/
		set: function (prop, val) {
			if (enyo.isObject(prop)) {
				this.stopNotifications();
				for (var $k in prop) {
					this.set($k, prop[$k]);
				}
				this.startNotifications();
				return this;
			} else if (!enyo.exists(val)) {
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
			if (this.owner && true === (this.owner instanceof enyo.Component)) {
				this.set("_defaultTarget", this.owner);
				this.set("_defaultDispatch", true);
			} else {
				// otherwise we either don't have an owner or they cannot
				// accept events so we remove our bubble target
				this.set("_defaultTarget", null);
			}
		},

		//*@public
		/**
			Accepts an array of models to add to the _collection_ at creation.
		*/
		constructor: function (props) {
			this.__dirtyModels = [];
			this.inherited(arguments);
			// if the initial parameter is an array we use that as
			// our starting properties
			if (props && props instanceof Array) {
				this.__store = this.__store? this.__store.concat(props): props;
			}
			// initialize our store
			this.__store = this.__store || [];
			this.length = this.__store.length;
			this.initModel();
			if (this.__store.length) {
				for (var $i=0, r$; (r$=this.__store[$i]); ++$i) {
					if (!(r$ instanceof this.model)) {
						r$ = new this.model(r$);
					}
					r$.addCollection(this);
					this.__store[$i] = r$;
				}
			}
			this.initRelation();
		},

		// ...........................
		// PROTECTED METHODS

		//*@protected
		initModel: function () {
			var $m = this.model, $r = this.relation;
			if (enyo.isString($m)) {
				$m = enyo.getPath($m);
				this.model = $m;
			}
			if ($m && $r) {
				$m = $m.prototype;
				if ($r.inverseKey) {
					if ($m.__relations[$r.inverseKey]) {
						enyo.mixin($r, $m.__relations[$r.inverseKey]);
					}
				}
			}
		},

		//*@protected
		initRelation: function () {
			if (this.relation) {
				var $r = this.relation, $k;
				if (($k = $r.relationKey)) {
					if (!this[$k]) {
						this.addObserver($k, this.__relationObserver, this);
					} else {
						this.__relationObserver($k, null, this[$k]);
					}
				}
			}
		},
		
		addDirtyModel: function (r) {
			if (!~enyo.indexOf(r, this.__dirtyModels)) {
				this.__dirtyModels.push(r);
			}
		},
		
		removeDirtyModel: function (r) {
			var $i = enyo.indexOf(r, this.__dirtyModels);
			if (!!~$i) {
				this.__dirtyModels.splice($i, 1);
			}
		},

		//*@protected
		__relationObserver: function (prop, prev, val) {
			var $r = this.relation, $k = $r.inverseKey;
			if ($k == prop && val) {
				this[$r.relationKey].removeObserver($k, this.__relationObserver);
				if ($r.autoFetch) {
					this.fetch();
				}
			} else if ($r.relationKey === prop) {
				if (val && $r.autoFetch) {
					if (enyo.exists(val[$k])) {
						this.fetch();
					}
				} else {
					val.addObserver($k, this.__relationObserver, this);
				}
			}
		},

		//*@protected
		__relationChanged: enyo.observer(function (prop, prev, val) {
			if (val) {
				this.initRelation();
			}
		}, "relation"),

		//*@protected
		__modelChanged: function (sender, event) {
			var $i = this.indexOf(sender);
			if (!!~$i) {
				this.set("status", enyo.Model.DIRTY);
				this.doModelChanged({model: sender, index: $i, collection: this});
			}
			return true;
		},

		//*@protected
		__modelDestroyed: function (sender, event) {
			var $i = this.indexOf(sender);
			if (!!~$i) {
				this.remove(sender);
				this.doModelDestroyed({model: sender, index: $i, collection: this});
			}
			return true;
		},

		// ...........................
		// OBSERVERS

		//*@protected
		__statusChanged: enyo.observer(function (prop, prev, val) {
			if (prev === enyo.Model.DIRTY && val === enyo.Model.CLEAN) {
				for (var $i=0, r$; (r$=this.__dirtyModels[$i]); ++$i) {
					r$.set("status", enyo.Model.CLEAN);
				}
			}
		}, "status")

	});

})(enyo);