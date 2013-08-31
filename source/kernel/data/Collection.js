(function (enyo) {

	//*@public
	/**
		_enyo.Collection_ is a kind designed to work with arrays of
		[enyo.Model](#enyo.Model) objects. Out of the box, collections
		work with "toMany" relations between models with a defined schema.

		Collections have their own default mechanisms for retrieving arrays of data
		and filtering their content. You may use a collection as an exposed
		controller or as an automatically-generated relational container, depending
		on your needs.  Like the other components of the Enyo data layer,
		_enyo.Collection_ defaults to functioning with typical REST requests.

		For more information, see [enyo.Model](#enyo.Model), [enyo.Store](#enyo.Store),
		and [enyo.Source](#enyo.Source).
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
			A collection uses this property to determine the proper constructor to use
			when it receives data. If an array of records in the form of normal data
			hashes is added, the collection will convert the records into objects
			using the specified kind. The value may be given as a string that will be
			resolved to a constructor, or as a constructor directly.
		*/
		model: "enyo.Model",

		//*@public
		/**
			Like an _enyo.Model_, an _enyo.Collection_ has several possible _status_
			values, which will be set depending on the current action. The following
			values are possible:

			- BUSY.FETCHING
			- BUSY.DESTROYING
			- CLEAN
			- ERROR.SOURCE
			- ERROR.RESPONSE
			- ERROR.TYPE

			See [enyo.Model.status](#enyo.Model::status)
		*/
		status: enyo.Model.CLEAN,

		//*@public
		/**
			The number of elements in the collection.
		*/
		length: 0,

		//*@public
		/**
			Used by the _enyo.Source_ in the application to generate the appropriate
			request. By default, it uses a simple REST scheme. The _url_ property is a
			static string that will be appended to the root domain for the
			_enyo.Source_.

			In more complex setups, see [query()](#enyoCollection::query) for
			overloading implications and adding dynamic _url_ handling possibilities.
		*/
		url: "",

		//*@public
		/**
			An optional relational definition object, which must be of the type
			_enyo.toOne_ as defined in _enyo.Model_. If a _relationKey_ is defined,
			the relation will know to watch for value change notifications from the
			related model and update accordingly.
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

		computed: {
			data: ["length", {cached: true}],
			query: []
		},

		//*@public
		/**
			A computed property representing the underlying array of models.
			Use [add()](#enyo.Collection::add) if you want to extend (not
			replace) the current dataset.

			This computed property may be overloaded in more complex scenarios
			involving filtering and conditionally supplied datasets.
		*/
		data: function (data) {
			if (data) {
				this.removeAll();
				this.add(data);
			} else {
				return this.__store;
			}
		},

		//*@public
		/**
			Used by _enyo.Source_ to generate the appropriate request for
			fetching data. May be overloaded to produce dynamic queries.
		*/
		query: function () {
			return this.url || this.model.prototype.get("query");
		},

		// ...........................
		// PUBLIC METHODS

		//*@public
		/**
			Called by the _enyo.Source_ for the application and used to
			build query parameters that will be applied as a query-string
			to the resulting request. By default, this method does nothing.
			To add or modify parameters already set for the query, use the
			_options.queryParams_ hash (which will always exist). These options
			are key-value pairs that will be serialized according to the
			_requestKind_ of the _enyo.Source_.
		*/
		buildQueryParams: function (model, options) {
			// look at options.queryParams for a hash to add-to or modify
		},

		//*@public
		/**
			Returns an array of all of the raw datasets for any records
			in the collection. May be overloaded to properly supply
			subsets of data on request. The optional parameter _local_ may be
			used to ensure that all models use their local keys (the default is
			to use remote keys if they are defined in the schema).
		*/
		raw: function (local) {
			return this.map(function (model) {
				return model.raw(local);
			});
		},

		//*@public
		/**
			Returns a JSON-stringified version of the _collection_ array.
			The optional parameter _useLocalKeys_ may be used to ensure that
			models use their local keys (the default is to use remote keys if
			they are defined in the schema).
		*/
		toJSON: function (useLocalKeys) {
			return enyo.json.stringify(this.raw(useLocalKeys));
		},

		//*@public
		/**
			Fetches this collection. Accepts an _options_ hash, which may include
			a _success()_ method, an _error()_ method, both, or neither. A fetch
			request with results will add those results to the collection. If you want
			to replace the contents, use the _replace_ options key or call
			[fetchAndReplace()](#enyo.Collection::fetchAndReplace).
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
			By default, [fetch()](#enyo.Collection::fetch) will add data to the
			collection while keeping any existing content. If you wish to replace all
			existing content with the results of the current fetch operation, call
			this method using the same options as _fetch()_.
		*/
		fetchAndReplace: function (options) {
			var $options = options? enyo.clone(options): {};
			$options.replace = true;
			this.fetch($options);
		},

		//*@public
		/**
			This method is not typically called directly, but may be overloaded for
			extensibility.
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
			Overload this method for handling fail-states. The _which_
			parameter will be _"fail"_. Sets the _status_ value to
			_ERROR.RESPONSE_.
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
			Returns the index of the requested value in the collection,
			starting from the optional index _idx_.
		*/
		indexOf: function (value, idx) {
			return enyo.indexOf(value, this.__store, idx);
		},

		//*@public
		/**
			Returns the last index of the value in the collection, starting
			from the optional index _idx_.
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
			Returns a mapped array according to the return value of _fn_ and
			the optional _context_ to execute _fn_ with (default is the collection).

			See [enyo.map](#enyo.map).
		*/
		map: function (fn, context) {
			return enyo.map(this.__store, fn, context || this);
		},

		//*@public
		/**
			Returns a filtered array of models from the collection according
			to the (true or false) return value of _fn_ and the optional _context_
			(default is the collection).

			See [enyo.filter](#enyo.filter).
		*/
		filter: function (fn, context) {
			return enyo.filter(this.__store, fn, context || this);
		},

		//*@public
		/**
			Overload this method in implementations where the result of a fetch may
			not be the array of records and must first be filtered . Returns the array
			of records supplied by a call to [didFetch()](#enyo.Collection::didFetch).
		*/
		filterData: function (data) {
			return data;
		},

		//*@public
		/**
			Returns boolean true or false indicating whether the collection contains
			_record_.
		*/
		contains: function (record) {
			return !!~enyo.indexOf(this.__store, record);
		},

		//*@public
		/**
			Returns the model at index _idx_ in the collection.
		*/
		at: function (idx) {
			return this.__store[idx];
		},

		//*@public
		/**
			Adds a record or an array of records to the existing dataset, starting
			at the end. If adding a single record, it returns the index where the
			record was inserted. Otherwise it returns the value of
			[addMany()](#enyo.Collection::addMany). Note that this method accepts
			_enyo.Model_ instances or native objects that will be converted into the
			kind indicated by the _model_ property. If adding a single record, it will
			emit an _onModelAdded_ event with a reference to the model added in the
			event object's _model_ property, the index at which it was inserted in the
			_index_ property, and a reference to the collection that emitted the event
			(_this_) in the _collection_ property.
		*/
		add: function (record) {
			// this allows us to call add for both a single record or an array
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
			Inserts an array of records into the collection beginning at the
			end of the current dataset. If any records are added successfully,
			it will emit a single event, _onModelsAdded_.  The _models_ property of
			the event object will have a reference to the array	of records that were
			inserted. Also, if records were inserted, the method will return a
			reference to the array passed up by the event.
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
			Removes a record (or array of records) from the collection. Returns
			_undefined_ if the record does not exist within the collection. Otherwise,
			returns the index where the record was removed. When a single record is
			removed, the _onModelRemoved_ event is emitted.  The event object will
			contain a reference to the model in its _model_ property, the index where
			the model was removed in the _index_ property, and a reference to the
			collection the model was removed from (_this_) in the _collection_
			property. In addition, any observers of the collection's _length_ property
			will be triggered. See [removeMany()](#enyo.Collection::removeMany) for
			details of how the collection handles the removal of an array of records.
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
			Removes all models in the collection. Note that these models are not
			destroyed or removed from the _enyo.Store_.
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
			Removes an array of records from the collection. They do not need to be
			in order for this to succeed. A single _onModelsRemoved_ event will
			be emitted when the operation is complete.  The event object will have
			an array of all removed records in its _models_ property. Each individual
			record in the	_models_ array has the same structure as the
			_onModelRemoved_ event object fired by the _remove()_ method (for single
			records).  This method safely ignores models that are not found in this
			collection. If any records are removed, a reference to the array of
			those records is returned.
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
			Overloaded setter that accepts an object literal and
			applies all keys and values to the collection.
		*/
		set: enyo.inherit(function (sup) {
			return function (prop, val) {
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
					return sup.apply(this, arguments);
				}
			};
		}),

		//*@public
		/**
			An overloaded version of _ownerChanged()_ that prevents the normal
			handlers from executing. Overload with care.
		*/
		ownerChanged: function(old) {
			if (old && old.removeComponent) {
				old.removeComponent(this);
			}
			if (this.owner && this.owner.addComponent) {
				this.owner.addComponent(this);
			}
			if (this.owner && true === (this.owner instanceof enyo.Component)) {
				this.set("_dispatchDefaultPath", true);
			}
		},

		//*@public
		/**
			Accepts an array of models to add to the collection at creation.
		*/
		constructor: enyo.inherit(function (sup) {
			return function (props) {
				this.__dirtyModels = [];
				sup.apply(this, arguments);
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
			};
		}),

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
						this.addObserver($k, this.__relationObserver);
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
		__relationChanged: function (prev, val, prop) {
			if (val) {
				this.initRelation();
			}
		},

		//*@protected
		__modelChanged: function (sender, event) {
			var $i = this.indexOf(sender);
			if (!!~$i) {
				this.set("status", enyo.Model.DIRTY);
				this.doModelChanged({model: sender, index: $i, collection: this, changed: event.changed, previous: event.previous});
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
		__statusChanged: function (prev, val, prop) {
			if (prev === enyo.Model.DIRTY && val === enyo.Model.CLEAN) {
				for (var $i=0, r$; (r$=this.__dirtyModels[$i]); ++$i) {
					r$.set("status", enyo.Model.CLEAN);
				}
			}
		},

		observers: {
			__relationChanged: ["relation"],
			__statusChanged: ["status"]
		}

	});

})(enyo);