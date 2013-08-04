(function (enyo) {

	//*@public
	/**
		The _enyo.Store_ kind is a singleton (when used) that aids in
		managing localized data records at runtime. It tracks models and
		is an interface for interacting with the data schema for any application.

		An _enyo.Store_ must have an _enyo.Source_ to be fully functional. The
		_store_ is agnostic to how the _source_ retrieves or updates records. It
		provides an abstraction API for finding particular records. It is always
		accessible from the globally available _enyo.store_ variable.

		It is instantiated quite simply and would typically be done before instantiating
		the _enyo.Application_ for your app.

		new enyo.Store({source: "enyo.Source"}); // now available from enyo.store

		NOTE: Much of the public API of _enyo.Store_ needn't be called directly except
		in very complex remote-backend implementations requiring specialized handling.
		Most of the API is called by _enyo.Model_ and _enyo.Collection_ for you.

		TODO: Much of the implementation is working but in some cases is either absent
		or only partially completed. Please bear with us as we complete this moving
		forward.
	*/


	enyo.store = null;
	enyo.models = {
		kinds: [],
		queued: [],
		add: function (ctor) {
			if (!~enyo.indexOf(ctor, this.kinds)) {
				this.kinds.push(ctor);
			}
			if (enyo.store) {
				enyo.store._addModelKind(ctor);
			}
		},
		queue: function (m) {
			if (enyo.store) {
				enyo.store.initModel(m);
			} else {
				this.queued.push(m);
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
		kind: "enyo.MultipleDispatchComponent",
		source: null,
		busy: false,
		handlers: {
			onChange: "_modelChanged",
			onDestroy: "_modelDestroyed"
		},
		bindings: [
			{from: ".source.busy", to: ".busy"}
		],

		// ...........................
		// PROTECTED PROPERTIES

		_records: null,
		__noApplyMixinDestroy: true,

		// ...........................
		// COMPUTED PROPERTIES

		// ...........................
		// PUBLIC METHODS

		uuid: function () {
			return uuid();
		},

		//*@public
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
			If this is a _remote_ request it will return `true`. If it is a
			synchronous _local only_ request it will return `false` if no
			records were found for the type.

			It is important to note that there is no built-in standard for querying
			a remote source. The only default action is that the `options.queryParams`,
			if it exists, will be used as options when making the request via
			the `source`. In custom situations you should add your query parameters
			that the backend needs to this _option_ and handle that accordingly.
			Overload the `queryResolver` method for special handling.
		*/
		find: function (ctor, options) {
			var $o = options? options: {}, $r = this._recordsForType(ctor, $o);
			if ($r.length || $o.remote) {
				return this.queryResolver(enyo.constructorForKind(ctor), $r, $o);
			}
			return false;
		},

		/**
			Pass a constructor and options to this asynchronous method to retrieve
			a single record (will use locally if found) and will execute a fetch
			if needed. If no _success_ method is provided but the record was found
			locally it will be returned synchronously. The _options_ hash can have
			a _success_ method, _error_ method and a _params_ object with the properties
			used to find the correct record.

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
			/* jshint -W055 */
			$ret = new ctor($params);
			/* jshint +W055 */
			$ret.fetch({success: this.bindSafely(function (options, model) {
				if (options.success) {
					options.success(model);
				}
			}, $options, $ret)});
		},
		/**
			TODO: not implemented
		*/
		findRemote: function (ctor, options) {
			// TODO: not implemented yet
			enyo.warn("enyo.Store.findRemote: this method is not implemented yet");
			return false;
		},

		//*@public
		/**
			Overload this method for special handling of query parameters and options
			that need to be communicated to a backend. The default attempts to use
			the `options.queryParams` property, should it exist, as the options to send.
			How the backend interprets them is dependent on the _remotes_ implementation.
			If no `remote` option exists in `options` this will return synchronously an
			array of any models that match the requirements. The `models` parameter
			will contain any local records that were found according to the type. If the
			`queryParams` option exists only records matching the parameters will be returned.
			If this is a `remote` request it is expected that the backend will filter the
			return-set accordingly but local records will be filtered.

			[see enyo.Source.find](#) to implement more specific features depending on the
			driver source.
		*/
		queryResolver: function (ctor, models, options) {
			var $o = options? enyo.clone(options): enyo.pool.claimObject(true);
			var $m = models;
			if ($o.remote) {
				$o.success = this.bindSafely("didFetchQuery", $m, options);
				$o.error = this.bindSafely("didFail", "query", null, options);
				$o.ctor = ctor;
				this.source.find(ctor, $o);
				return true;
			} else if ($o.queryParams) {
				$m = this.filterResults($m, $o.queryParams);
			}
			enyo.pool.releaseObject($o);
			return $m;
		},

		//*@public
		/**
			Filters an array of models by any properties and matching values
			in the `params` parameter. By default to be included in the result set
			a model must match all criteria in the `params` hash. For more complex
			needs overload this method.
		*/
		filterResults: function (models, params) {
			return enyo.filter(models, function (r) {
				for (var $k in params) {
					if (r[$k] != params[$k]) {
						return false;
					}
				}
				return true;
			});
		},

		initModel: function (model) {
			var id = model.euuid = this.uuid();
			if (!model[model.primaryKey] && !model._didAttemptFetchId && !model.noFetchId) {
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
			enyo.forEach(enyo.models.queued, this.initModel, this);
			if (!this.source) {
				this.source = enyo.Source.getDefaultSource();
			}
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

		//*@public
		/**
			This method is called by the source when a query has been submitted
			and results have been retrieved. Here the `models` parameter is an
			array of any _local_ records in the store were found according to the
			requested kind of record. These will be concatenated and reduced across
			the remote result set and then filtered by the `filterResults` method.
		*/
		didFetchQuery: function (models, options, result) {
			var $m = models, $o = options, $r = result, $p = options.ctor.prototype.primaryKey;
			if ($o.queryParams) {
				$m = this.filterResults($m, $o.queryParams);
			}
			$m = enyo.filter($m.concat($r), function (r, i, a) {
				for (; i<a.length; ++i) {
					if (r[$p] == a[i][$p]) {
						return false;
					}
				}
				return true;
			});
			if ($o.success) {
				$o.success($m);
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

		//*@protected
		/**
			Accepts a constructor (name or function) and options and returns an
			array of records if any were found and an empty array otherwise.
			Used internally when looking up records by kind. If the option `subkinds`
			is a truthy value in the optional `options` parameter then it will also
			include records that are subkinds of the requested kind.
		*/
		_recordsForType: function (ctor, options) {
			var $r = this._records;
			var $n = typeof ctor == "string"? ctor: ctor.prototype.kindName;
			var $k = enyo.constructorForKind($n), $s = [], $o = options, $c, c$;
			if ($o && $o.subkinds) {
				// we need to include subkinds as well
				for (var $i in $r) {
					c$ = $r[$i];
					$c = enyo.constructorForKind($i);
					if ($c && $c.prototype && ($c.prototype instanceof $k || $c.prototype == $k.prototype)) {
						$s = $s.concat(c$.all);
					}
				}
				return $s;
			}
			return $r[$n]? $r[$n].all: [];
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