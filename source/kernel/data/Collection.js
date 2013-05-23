(function (enyo) {

	enyo.kind({

		// ...........................
		// PUBLIC PROPERTIES

		name: "enyo.Collection",

		events: {
			onModelChanged: "",
			onModelAdded: "",
			onModelsAdded: "",
			onModelRemoved: "",
			onModelsRemoved: ""
		},

		length: 0,

		model: "enyo.Model",

		url: "",

		fetching: false,

		autoFetch: true,

		// ...........................
		// PROTECTED PROPERTIES

		kind: "enyo.Controller",

		handlers: {
			onChange: "_model_changed"
		},

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

		// ...........................
		// PUBLIC METHODS

		raw: function () {
			return this.map(function (model) {
				return model.raw();
			});
		},

		toJSON: function () {
			return enyo.json.stringify(this.raw());
		},


		fetch: function () {
			// set our fetching state to true
			this.set("fetching", true);
			var xhr = new enyo.Ajax({url: this.url});
			xhr.response(this, this.didFetch);
			xhr.go();
		},

		didFetch: function (sender, response) {
			this.add(response);
			// all done fetching
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
			record._add_collection(this);
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
				record._remove_collection(this);
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
			this._init_model();
			if (this._store.length) {
				this._store = this.map(function (record) {
					return record instanceof this.model? record: new this.model(record);
				}, this);
			}
		},

		create: function () {
			this.inherited(arguments);
			if (true === this.autoFetch && this.url) {
				enyo.asyncMethod(this, this.fetch);
			}
		},

		_init_model: function () {
			var $model = this.model;
			if ("string" === typeof $model) {
				$model = enyo.getPath($model);
			}
			this.model = $model;
		},

		_model_changed: function (sender, event) {
			var idx = this.indexOf(sender);
			if (!!~idx) {
				this.doModelChanged({
					model: sender,
					index: idx,
					collection: this
				});
			}
		}

		// ...........................
		// OBSERVERS

	});

})(enyo);