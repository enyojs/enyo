(function (enyo) {

	enyo.store = null;
	enyo.models = {
		kinds: [],
		add: function (ctor) {
			if (!~enyo.indexOf(ctor, this.kinds)) {
				this.kinds.push(ctor);
			}
			if (enyo.store) {
				enyo.store._addModelKind(ctor);
			}
		}
	};

	/**
		As seen https://gist.github.com/jcxplorer/823878, by jcxplorer.
		TODO: replace with faster implementation
	*/
	var uuid = function () {
		var uuid = "", idx = 0, rand;
		for (; idx < 32; ++idx) {
			rand = Math.random() * 16 | 0;
			if (idx == 8 || idx == 12 || idx == 16 || idx == 20) {
				uuid += "-";
			}
			uuid += (idx == 12? 4: (idx == 16? (rand & 3 | 8): rand)).toString(16);
		}
		return uuid;
	};

	enyo.kind({

		// ...........................
		// PUBLIC PROPERTIES

		name: "enyo.Store",
		kind: "enyo.Controller",
		source: null,
		fetching: false,
		handlers: {
			onChange: "_modelChanged",
			onDestroy: "_modelDestroyed"
		},
		bindings: [
			{from: ".source.fetching", to: ".fetching"}
		],
		
		// ...........................
		// PROTECTED PROPERTIES
		
		_records: null,
		_noApplyMixinDestroy: true,
		
		// ...........................
		// COMPUTED PROPERTIES

		// ...........................
		// PUBLIC METHODS
		
		uuid: function () {
			return uuid();
		},
		/**
			A simple find mechanism to query valid records in the store.
			If the _options_ _remote_ property exists and is true it will
			execute asynchronously and run the query against the combined
			result set of records as returned from the remote source and
			any existing local records. If no _remote_ property exists or
			it is false (default) it will return synchronously resulting in
			an array of records if any were found or false otherwise. The
			first parameter can be either a string or constructor matching
			the name or kind of the model being queried with an optional
			_options_ parameter of an object literal. These options will be
			passed to the _queryResolver_ method. This method can be overridden
			to handle custom implementations for advanced querying needs.
		
			TODO: not implemented as stated
		*/
		find: function (ctor, options) {
			var ret = this._recordsForType(ctor);
			if (!ret) {
				return false;
			}
			return this.queryResolver(enyo.clone(ret.all), options);
		},
		/**
			TODO: not fully implemented
		*/
		findOne: function (ctor, options) {
			var $options = options? enyo.clone(options): {};
			var $params = options.params || {};
			var $models = this._recordsForType(ctor);
			var pk = ("string" === typeof ctor? enyo.getPath(ctor): ctor).prototype.primaryKey;
			var $ret;
			if (pk in $params) {
				if (($ret = $models.byPrimaryKey[$params[pk]])) {
					if (options.success) {
						options.success($ret);
					}
					return $ret;
				}
			}
			$ret = new ctor($params);
			$ret.fetch({success: function () {
				if ($options.success) {
					$options.success($ret);
				}
			}});
		},
		/**
			TODO: not implemented
		*/
		findRemote: function (ctor, options) {
			// TODO: not implemented yet
			enyo.warn("enyo.Store.findRemote: this method is not implemented yet");
			return false;
		},
		/**
			TODO: not implemented
		*/
		queryResolver: function (models, options) {
			return models;
		},
		initModel: function (model) {
			var id = model.euuid = this.uuid();
			if (!model[model.primaryKey] && !model._didAttemptFetchId) {
				model._didAttemptFetchId = true;
				var $options = {
					success: this.bindSafely("initModel", model)
				};
				return this.fetchId(model, $options);
			}
			this._records[id] = model;
			this._records[model.kindName].all.push(model);
			model.addDispatchTarget(this);
			if (model[model.primaryKey]) {
				this._records[model.kindName].byPrimaryKey[model[model.primaryKey]] = model;
			}
		},
		fetch: function (model, options) {
			var $options = options? enyo.clone(options): {};
			$options.success = this.bindSafely("didFetch", model, options);
			$options.error = this.bindSafely("didFail", "fetch", model, options);
			
			// if the model is NEW we generate an id for it only
			if (model.status === "NEW") {
				return this.fetchId(model, options);
			}
			
			this.source.fetch(model, $options);
		},
		commit: function (model, options) {
			var $options = options? enyo.clone(options): {};
			$options.success = this.bindSafely("didCommit", model, options);
			$options.error = this.bindSafely("didFail", "commit", model, options);
			this.source.commit(model, $options);
		},
		destroy: function (model, options) {
			var $options = options? enyo.clone(options): {};
			$options.success = this.bindSafely("didDestroy", model, options);
			$options.error = this.bindSafely("didFail", "destroy", model, options);
			this.source.destroy(model, $options);
		},
		fetchId: function (model, options) {
			var $options = options? enyo.clone(options): {};
			$options.success = this.bindSafely("didFetchId", model, options);
			if (model.fetchId) {
				return model.fetchId($options);
			}
			// TODO: this may not be useful in and of itself since
			// most backends will have their own scheme for generating
			// an id via sequence etc.
			$options.success(model.euuid);
		},
		constructor: function () {
			// there can only be one store executing at a time
			if (enyo.store) {
				throw "There can only be one enyo.Store active";
			}
			enyo.store = this;
			this.inherited(arguments);
			this._records = {};
			enyo.forEach(enyo.models.kinds, this._addModelKind, this);
		},
		constructed: function () {
			this.inherited(arguments);
			this.findAndInstance("source");
		},
		sourceFindAndInstance: function (ctor, inst) {
			if (inst) {
				inst.set("owner", this);
			}
		},
		didFetch: function (model, options, result) {
			// TODO: ...
			if (options.success) {
				options.success(result);
			}
		},
		didCommit: function (model, options, result) {
			// TODO: ...
			if (options.success) {
				options.success(result);
			}
		},
		didDestroy: function (model, options, result) {
			// TODO: ...
			if (options.success) {
				options.success(result);
			}
		},
		didFetchId: function (model, options, result) {
			model.set(model.primaryKey, result);
			if (options.success) {
				options.success(result);
			}
		},
		didFail: function (which, model, options, request, error) {
			// TODO: ...
			if (options.error) {
				options.error(request, error);
			}
		},

		// ...........................
		// PROTECTED METHODS

		_addModelKind: function (ctor) {
			if (!this._records[ctor.prototype.kindName]) {
				this._records[ctor.prototype.kindName] = {
					all: [],
					byPrimaryKey: {}
				};
			}
		},
		_modelChanged: function (sender, event) {
			if (event.model) {
				var $model = event.model;
				var $changed = event.changed;
				var $prev = event.previous;
				var key = $model.primaryKey;
				var kind = $model.kindName;
				if (key in $changed) {
					// we have to remove the entry altogether
					delete this._records[kind].byPrimaryKey[$prev[key]];
					// only re-add it if there is actually a value
					if ($changed[key]) {
						this._records[kind].byPrimaryKey[$changed[key]] = $model;
					}
				}
			}
		},
		_modelDestroyed: function (sender, event) {
			var euuid = sender.euuid;
			var id = sender[sender.primaryKey];
			var kind = sender.kindName;
			var idx = enyo.indexOf(sender, this._records[kind].all);
			delete this._records[euuid];
			delete this._records[kind].byPrimaryKey[id];
			this._records[kind].all.splice(idx, 1);
			return true;
		},
		_recordsForType: function (ctor) {
			return this._records["string" === typeof ctor? ctor: ctor.prototype.kindName];
		},
		
		// ...........................
		// OBSERVERS
		
		_sourceChanged: enyo.observer(function (prop, prev, val) {
			if (val) {
				val.set("owner", this);
				this.rebuildBindings();
			}
		}, "source")

	});


})(enyo);