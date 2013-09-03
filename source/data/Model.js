(function (enyo) {
	//*@protected
	/**
		We create this reusable object for properties passed to the mixin
		method so as not to create and throw away a new object every time
		a new model is created.
	*/
	var _mixinOpts = {ignore: true};
	//*@public
	/**
		## Getting and Setting _enyo.Model_ values
	
		An _enyo.Model_ is a special object not derived from other enyo _kinds_. This is
		for efficiency and simplicity. That being said, any `set` or `get` call on a _model_
		will work only with the _schema_ of the _model_ and not as you would expect other
		kinds based on _enyo.Object_. Any property set via the `set` method will be assumed
		an `attribute` of the _model schema_. The `set` method also has the ability to accept
		a hash of _keys_ and _values_ to apply at once. Even though the schema is tracked via
		the `attributes` hash of the model it is __not necessary to prefix get/set paths with
		"attributes" as this is assumed and redundant and will cause it to created a nested
		schema object called `attributes`__. 
		
		## Computed Properties and _enyo.Model_
	
		Computed properties only exist for attributes of a _model_. Otherwise, they function
		as you would expect from _ComputedSupport_ on _enyo.Object_. The only other exception
		is that all _functions_ in the _attributes schema_ are considered to be a _computed
		property_, they are fairly useless, however, without a declaration for any dependencies
		they might have.

		## Bindings
	
		An _enyo.Model_ can be at the receiving end of a binding but bindings cannot be created
		on the _model_ itself. A _bindings_ array will be ignored.
	
		## Observers and Notifications
	
		There is no _observers_ block for _enyo.Model_. _Bindings_ can still be applied to _attributes_
		of the _model_. Notifications for _observers_ works the same as with _enyo.Object_ except they
		only apply to changes made on properties in the _attributes_.
		
		## Events
	
		Events are different than those in _enyo.Component_. There are no _bubbled_ or _waterfall_
		events. Instead, you can use the registered listeners for events via the `addListener`,
		`removeListener`, and `triggerEvent` API.
	*/
	enyo.kind({
		name: "enyo.Model",
		//*@protected
		kind: null,
		noDefer: true,
		//*@public
		/**
			This is a hash of attributes known as the record's _schema_. This is where
			the values of any _attributes_ are stored for an active record.
		*/
		attributes: null,
		/**
			An optional hash of values and properties to be applied to the _attributes_
			of the record at initialization. Any values in the _defaults_ that already exists
			on the _attributes schema_ will be ignored.
		*/
		defaults: null,
		/**
			Set this flag to `true` if this model is read-only and will not need to _commit_
			or _destroy_ any changes via a _source_. This will cause a _destroy_ to safely
			execute _destroyLocal_ by default.
		*/
		readOnly: false,
		/**
			All _models_ have a _store_ reference. You can set this to a specific _store_
			instance in your application or use its default (the enyo.store global).
		*/
		store: null,
		/**
			This is the fall-back driver to use when fetching, destroying, or comitting
			a _model_. A driver can always be specified at the time of the method execution
			but in cases where it isn't the default will be used. This is a string that should
			be paired with a known driver for this _records store_.
		*/
		defaultSource: "ajax",
		/**
			An optional array of strings as the only properties to include in
			the _raw_ and _toJSON_ return values. By default it will use any properties
			in the _attributes_ hash.
		*/
		includeKeys: null,
		/**
			Set this property to the correct _url_ to be used when generating the request
			for this _record_ from any specified _source_ or the _defaultDriver_ of the _record_.
			Note that, by default, the url for a _fetch_ will have the its _primaryKey_ appended
			to the request. Overload the _getUrl_ method for extending this behavior. Also see _urlRoot_.
		*/
		url: "",
		/**
			Optionally one could provide a value here for a base-kind of model (for models used
			outside of collections) that share the same root but varying _urls_. If no _getUrl_
			method is provided and the _url_ property does not contain a protocol identifier for
			the _source_ it will assume this value exists and use it as the root instead.
		*/
		urlRoot: "",
		/**
			Boolean value indicating whether or not a change has occurred in the _record_
			that needs to be committed.
		*/
		dirty: false,
		/**
			The `primaryKey` is the attribute that will be used if present in the model for
			reference in _enyo.Collections_ and in the _models_ _store_. It will also be used,
			by default, when generating the _url_ for the _model_. The value and property for
			`primaryKey` is stored on the attributes hash.
		*/
		primaryKey: "id",
		/**
			Set this to an array of _keys_ to use for comparative purposes when using the
			_merge_ strategy in the _store_ or any _collection_.
		*/
		mergeKeys: null,
		/**
			The `euid` is an arbitrarily assigned value that every _model_ has and is unique.
			Models can be requested via this property in _enyo.Collections_ and the _store_. This
			property, unlike the `primaryKey`, is stored on the _model_ and not its attributes hash.
		*/
		euid: "",
		/**
			This is a boolean value that indicates whether the _record_ was created locally
			or is pulled from a _source_. You should not modify this value. This will cause the
			_source_ to change its behavior.
		*/
		isNew: true,
		/**
			Retrieve the requested _model attribute_. Will return the current value or
			undefined. If the attribute is a function it is assumed to be a computed property
			and will be called in the context of the model and its return value will be returned.
		*/
		get: function (prop) {
			var fn = this.attributes[prop];
			return (fn && "function" == typeof fn)? fn.call(this): fn;
		},
		//*@public
		/**
			Will set a property or properties of the _model attribute(s)_. Accepts a property
			name and value or a single hash of _keys_ and _values_ to be set at once. Returns
			the _model_ for chaining. If the attribute being set is a function in the schema
			it will be ignored.
		*/
		set: function (prop, value) {
			if (enyo.isObject(prop)) { return this.setObject(prop); }
			var rv = this.attributes[prop];
			if (rv && "function" == typeof rv) { return this; }
			if (rv !== value) {
				this.previous[prop] = rv;
				this.changed[prop] = this.attributes[prop] = value;
				this.notifyObservers(prop, rv, value);
				// if this is a dependent of a computed property we mark that
				// as changed as well
				if (this._computedMap) {
					if (this._computedMap[prop]) {
						var ps = this._computedMap[prop];
						for (var i=0, p; (p=ps[i]); ++i) {
							this.notifyObservers(p);
						}
					}
				}
				this.triggerEvent("change");
				this.changed = {};
				this.dirty = true;
			}
			return this;
		},
		/**
			A _setter_ that accepts a hash of _key_/_value_ pairs. Returns the _model_
			for chaining (and consistency with `set`). All _keys_ in _props_ will be added
			to the `attributes` schema when this method is used.
		*/
		setObject: function (props) {
			if (props) {
				var ch = false,
					rv, k;
				for (k in props) {
					rv = this.attributes[k];
					if (rv && "function" == typeof rv) { continue; }
					if (rv === props[k]) { continue; }
					this.previous[k] = rv;
					this.changed[k] = this.attributes[k] = props[k];
					ch = true;
				}
				if (ch) {
					this.notifyObservers();
					if (this._computedMap) {
						for (var k in this.changed) {
							// if this is a dependent of a computed property we mark that
							// as changed as well
							if (this._computedMap[k]) {
								var ps = this._computedMap[k];
								for (var i=0, p; (p=ps[i]); ++i) {
									this.notifyObservers(p);
								}
							}
						}
					}
					this.triggerEvent("change");
					this.changed = {};
					this.dirty = true;
				}
			}
			return this;
		},
		/**
			While models should normally be instanced using _enyo.store.createRecord_,
			the same applies to the _constructor_, the first parameter will be used as
			attributes of the model, the second, optional parameter will be used as configuration
			for the _model_.
		*/
		constructor: function (attributes, opts) {
			// collections will supply the parse option to ensure that
			// data has the opportunity to be parsed as if the model had
			// called fetch
			var p = (opts && opts.parse) || false; 
			if (opts) { this.importProps(opts); }
			this.euid = enyo.uuid();
			var a = this.attributes? enyo.clone(this.attributes): {},
				d = this.defaults,
				x = attributes;
			// if we're created by a _collection_ the default behavior is
			// to parse the incoming data as that data was retrieved
			if (p) { x = this.parse(x); }
			if (x) { enyo.mixin(a, x); }
			if (d) { enyo.mixin(a, d, _mixinOpts); }
			this.attributes = a;
			this.changed = {};
			this.previous = {};
			this.storeChanged();
		},
		//*@protected
		importProps: function (p) {
			if (p) {
				if (p.defaults || p.attributes || p.computed) { enyo.Model.subclass(this, p); }
				for (var k in p) { k != "parse" && (this[k] = p[k]); }
			}
		},
		//*@public
		/**
			Produces an immutable hash of the known attributes of this record. Will
			be modified by the existence of the _includeKeys_ array otherwise it will
			use all known properties.
		*/
		raw: function () {
			var i = this.includeKeys,
				a = this.attributes,
				r = i? enyo.only(i, a): enyo.clone(a);
			for (var k in r) {
				if ("function" == typeof r[k]) {
					r[k] = r[k].call(this);
				} else if (r[k] instanceof enyo.Collection) {
					r[k] = r[k].raw();
				}
			}
			return r;
		},
		/**
			Will return the JSON stringified version of the output of _raw_ of this record.
		*/
		toJSON: function () {
			return enyo.json.stringify(this.raw());
		},
		/**
			By default this method will use any _urlRoot_ with the _url_ property and
			if the _record_ has a _primaryKey_ value (id by default) it will be added
			at the end.
		*/
		getUrl: function () {
			var pk = this.primaryKey,
				id = this.get(pk),
				u  = this.urlRoot + "/" + this.url;
			if (id) { u += ("/" + id); }
			return u;
		},
		/**
			Commit the current state of the _record_ to either the specified _source_
			or the _records_ default _source_. The _source_ and any other options may be
			specified in the _opts_ hash. May provied a _success_ and _fail_ method that
			will be executed on those conditions. Its _success_ method will be called with
			the same parameters as the build-in method `didCommit`.
		*/
		commit: function (opts) {
			var o = opts? enyo.clone(opts): {};
			o.success = enyo.bind(this, "didCommit", this, opts);
			o.fail = enyo.bind(this, "didFail", "commit", this, opts);
			this.store.commitRecord(this, o);
		},
		/**
			Using the state of the _record_ and any options passed in via the _opts_ hash
			try and fetch the current model attributes from the specified (or default)
			_source_ for this _record_. May provied a _success_ and _fail_ method that
			will be executed on those conditions. Its _success_ method will be called with
			the same parameters as the build-in method `didFetch`.
		*/
		fetch: function (opts) {
			var o = opts? enyo.clone(opts): {};
			o.success = enyo.bind(this, "didFetch", this, opts);
			o.fail = enyo.bind(this, "didFail", "fetch", this, opts);
			this.store.fetchRecord(this, o);
		},
		/**
			Requests a _destroy_ action for the given _record_ and the specified (or default)
			_source_ in the optional _opts_ hash. May provied a _success_ and _fail_ method that
			will be executed on those conditions. Its _success_ method will be called with
			the same parameters as the built-in method `didDestroy`. If the _record_ is _readOnly_
			or has its _isNew_ flag set to `true` it will call its synchronous _destroyLocal_
			method instead and will not use any callbacks.
		*/
		destroy: function (opts) {
			if (this.readOnly || this.isNew) { return this.destroyLocal(); }
			var o = opts? enyo.clone(opts): {};
			o.success = enyo.bind(this, "didDestroy", this, opts);
			o.fail = enyo.bind(this, "didFail", "destroy", this, opts);
			this.store.destroyRecord(this, o);
		},
		/**
			To destroy the _record_ but only locally (completely remove it locally) without
			sending a request to any _source_ to destroy it you should call this method. This
			is the correct method to destroy local-only _records_.
		*/
		destroyLocal: function () {
			var o = {};
			o.success = enyo.bind(this, "didDestroy", this);
			this.store.destroyRecordLocal(this, o);
		},
		/**
			Overload this method to change the structure of the data as it is returned from
			a _fetch_ or _commit_. By default it just returns the _data_ as it was retrieved
			from the _source_.
		*/
		parse: function (data) {
			return data;
		},
		/**
			When a _record_ is successfully fetched this method is called before any user
			provided callbacks are executed. It will properly insert the incoming data
			to the record and notify any observers of those properties that have changed.
		*/
		didFetch: function (rec, opts, res) {
			// the actual result has to be checked post-parse
			var r = this.parse(res);
			if (r) {
				this.setObject(r);
				// once notifications have taken place we clear the dirty status so the
				// state of the model is now clean
				this.dirty = false;
				if (opts) {
					if (opts.success) {
						opts.success(rec, opts, res);
					}
				}
			}
		},
		/**
			When a _record_ is successfully committed this method is called before any user
			provided callbacks are executed.
		*/
		didCommit: function (rec, opts, res) {
			// the actual result has to be checked post-parse
			var r = this.parse(res);
			if (r) {
				this.setObject(r);
				// once notifications have taken place we clear the dirty status so the
				// state of the model is now clean
				this.dirty = false;
				// since this was successful this can no longer be considered a new record
				this.isNew = false;
				if (opts) {
					if (opts.success) {
						opts.success(rec, opts, res);
					}
				}
			}
		},
		/**
			When a _record_ is successfully destroyed this method is called before any user
			provided callbacks are executed.
		*/
		didDestroy: function (rec, opts, res) {
			for (var k in this.attributes) {
				if (this.attributes[k] instanceof enyo.Model || this.attributes[k] instanceof enyo.Collection) {
					if (this.attributes[k].owner === this) {
						this.attributes[k].destroy();
					}
				}
			}
			this.triggerEvent("destroy");
			this.previous = null;
			this.changed = null;
			this.defaults = null;
			this.includeKeys = null;
			this.destroyed = true;
		},
		/**
			When a _record_ fails during a request this method is executed with the name of
			the command that failed followed by the reference to the record, the original
			options and the result (if any).
		*/
		didFail: function (which, rec, opts, res) {
			if (opts && opts.fail) {
				opts.fail(rec, opts, res);
			}
		},
		/**
			Adds an observer according to the the _enyo.ObserverSupport_ API.
		*/
		addObserver: function (prop, fn, ctx) {
			return this.store._addObserver(this, prop, fn, ctx);
		},
		/**
			Removes an observer according to the the _enyo.ObserverSupport_ API.
		*/
		removeObserver: function (prop, fn) {
			return this.store._removeObserver(this, prop, fn);
		},
		/**
			Will notify any observers for the given property, accepts the previous
			and current values to pass to observers. If no property is provided it
			will notify any observers for any changed properties.
		*/
		notifyObservers: function (prop, prev, val) {
			// if no prop is provided we call it once for each changed attribute
			if (!prop) {
				for (var k in this.changed) {
					this.store._notifyObservers(this, k, this.previous[k], this.attributes[k]);
				}
			} else { this.store._notifyObservers(this, prop, prev, val); }
		},
		/**
			Add a listener for the given _event_. Callbacks will be executed with two
			parameters of the form _record_, _event_ -- where _record_ is the _record_
			that is firing the event and _event_ is the name (string) for the event
			being fired. The _addListener_ method accepts parameters according to the
			_enyo.ObserverSupport_ API but does not function the same way.
		*/
		addListener: function (prop, fn, ctx) {
			return this.store.addListener(this, prop, fn, ctx);
		},
		/**
			Removes a listener. Accepts the name of the _event_ that the listener is
			registered on and the method returned from the _addListener_ call (if a
			_ctx_ was provided otherwise just the method is fine). Returns `true` on
			successful removal and `false` otherwise.
		*/
		removeListener: function (prop, fn) {
			return this.store.removeListener(this, prop, fn);
		},
		/**
			Triggers any _listeners_ for the _event_ of this _record_ with optional
			_args_.
		*/
		triggerEvent: function (event, args) {
			this.store.triggerEvent(this, event, args);
		},
		//*@protected
		storeChanged: function () {
			var s = this.store || enyo.store;
			if (s) {
				if (enyo.isString(s)) {
					s = enyo.getPath(s);
					if (!s) {
						enyo.warn("enyo.Model: could not find the requested store -> ", this.store, ", using" +
							"the default store");
					}
				}
			}
			s = this.store = s || enyo.store;
			s.addRecord(this);
		},
		//*@protected
		concat: ["mergeKeys"]
	});
	//*@protected
	enyo.Model.subclass = function (ctor, props) {
		var p  = ctor.prototype || ctor,
			ra = props.attributes,
			// only clone when we absolutely need to
			pa = (p.attributes && (ra && enyo.clone(p.attributes)) || p.attributes) || {},
			rd = props.defaults,
			// only clone when we absolutely need to
			pd = (p.defaults && (rd && enyo.clone(p.defaults)) || p.defaults) || {},
			rc = props.computed,
			pc = (p.computed && (rc && enyo.clone(p.computed)) || p.computed) || {};
			
		// handle attributes of the kind so all subkinds will accurately
		// have the mixture of the schema
		if (ra) { enyo.mixin(pa, ra) && (delete props.attributes); }
		// always assign the prototype's attributes
		p.attributes = pa;
		// handle defaults of the kind so all subkinds will accurately
		// have the mixture of the defaults
		if (rd) { enyo.mixin(pd, rd) && (delete props.defaults); }
		// always assign the prototype's defaults
		p.defaults = pd;
		if (rc) { enyo.mixin(pc, rc) && (delete props.computed); }
		p.computed = pc;
		// if there are computed properties for this model we need to remap them
		// now for fast access later
		if (rc) {
			// we only want to do this for new computed properties since its
			// already been done for the kind's own
			var m = (p._computedMap && enyo.clone(p._computedMap)) || {};
			for (var k in rc) {
				// this is any of the known dependents of the computed method
				var ds = rc[k];
				// iterate over those and map each of those to any computed methods
				// dependent on it
				for (var i=0, d; (d=ds[i]); ++i) {
					// if we don't already have this in the map we have to create it
					if (!m[d]) { m[d] = []; }
					m[d].push(k);
				}
			}
			p._computedMap = m;
		}
	};
})(enyo);