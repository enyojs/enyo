(function (enyo) {

	enyo.kind({

		// ...........................
		// PUBLIC PROPERTIES

		name: "enyo.Collection",
		kind: "enyo.Controller",
		model: "enyo.Model",
		fetching: false,
		length: 0,
		url: "",
		dataKey: "",
		events: {
			onModelChanged: "",
			onModelAdded: "",
			onModelsAdded: "",
			onModelRemoved: "",
			onModelsRemoved: "",
			onModelDestroyed: ""
		},
		handlers: {
			onChange: "_modelChanged",
			onDestroy: "_modelDestroyed"
		},		
		// ...........................
		// PROTECTED PROPERTIES

		_store: null,

		// ...........................
		// COMPUTED PROPERTIES

		data: enyo.computed(function (data) {
			if (data) {
				this.removeAll();
				this.add(data);
			} else {
				return this._store;
			}
		}, "length", {cached: true, defer: true}),
		query: enyo.computed(function () {
			return this.url || this.model.prototype.get("query");
		}),

		// ...........................
		// PUBLIC METHODS

		buildQueryParams: function (model, options) {
		},
		raw: function (useLocalKeys) {
			return this.map(function (model) {
				return model.raw(useLocalKeys);
			});
		},
		toJSON: function (useLocalKeys) {
			return enyo.json.stringify(this.raw(useLocalKeys));
		},
		fetch: function (options) {
			var $options = options? enyo.clone(options): {};
			$options.success = this.bindSafely("didFetch", options || {});
			$options.error = this.bindSafely("didFail", "fetch", options || {});
			this.set("fetching", true);
			enyo.store.fetch(this, $options);
		},
		didFetch: function (options, result) {
			var data = result;
			if (!enyo.isArray(result)) {
				data = enyo.getPath.call(result, this.dataKey);
				// since this is an object we remove the dataset key so as
				// not to store it twice but will automatically apply the
				// extraneous properties to the collection for reference if
				// necessary
				enyo.setPath.call(result, this.dataKey, undefined);
				this.set(result);
			}
			this.add(data);
			if (options.success) {
				options.success(options, result);
			}
			this.set("fetching", false);
		},
		didFail: function (which, options) {
			this.set("fetching", false);
		},
		push: function () {
			enyo.warn("enyo.Collection.push: not currently implemented");
		},
		pop: function () {
			enyo.warn("enyo.Collection.pop: not currently implemented");
		},
		shift: function () {
			enyo.warn("enyo.Collection.shift: not currently implemented");
		},
		unshift: function () {
			enyo.warn("enyo.Collection.unshift: not currently implemented");
		},
		indexOf: function (value, idx) {
			return enyo.indexOf(value, this._store, idx);
		},
		lastIndexOf: function (value, idx) {
			return enyo.lastIndexOf(value, this._store, idx);
		},
		splice: function () {
			enyo.warn("enyo.Collection.splice: not currently implemented");
		},
		map: function (fn, context) {
			return enyo.map(this._store, fn, context || this);
		},
		filter: function (fn, context) {
			return enyo.filter(this._store, fn, context || this);
		},
		contains: function (value) {
			return !!~enyo.indexOf(this._store, value);
		},
		at: function (index) {
			return this._store[index];
		},
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
		addAt: function () {
			enyo.warn("enyo.Collection.addAt: not implemented yet");
		},
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
		removeAll: function () {
			var $copy = enyo.clone(this._store);
			this.remove($copy);
		},
		removeAt: function () {
			enyo.warn("enyo.Collection.removeAt: not implemented yet");
		},
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
		ownerChanged: function(inOldOwner) {
			if (inOldOwner && inOldOwner.removeComponent) {
				inOldOwner.removeComponent(this);
			}
			if (this.owner && this.owner.addComponent) {
				this.owner.addComponent(this);
			}
		},

		// ...........................
		// PROTECTED METHODS

		constructor: function (props) {
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
					return record instanceof this.model? record: new this.model(record);
				}, this);
			}
		},
		_initModel: function () {
			var $model = this.model;
			if ("string" === typeof $model) {
				$model = enyo.getPath($model);
			}
			this.model = $model;
		},
		_modelChanged: function (sender, event) {
			var idx = this.indexOf(sender);
			if (!!~idx) {
				this.doModelChanged({
					model: sender,
					index: idx,
					collection: this
				});
			}
			return true;
		},
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
		}

		// ...........................
		// OBSERVERS

	});

})(enyo);