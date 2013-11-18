(function (enyo) {
	//*@protected
	/**
		We create this reusable object for properties passed to the mixin
		method so as not to create and throw away a new object every time
		a new model is created.
	*/
	var _mixinOpts = {ignore: true, filter: function (k, v, s, t) {
		// only use the default value if the attributes value is undefined and the default
		// entry itself is not undefined
		return (typeof t[k] == "undefined") && (typeof v != "undefined");
	}};
	//*@public
	/**
		_enyo.Model_ is a kind used to create data records. For the sake of
		efficiency and simplicity, it has been designed as a special object not
		derived from any other Enyo kind.

		__Getting and Setting enyo.Model values__

		Unlike kinds based on [enyo.Object](#enyo.Object), any call to	_set()_ or
		_get()_ on a model affects only the schema of the model, which is tracked in
		its _attributes_ hash. That is, when you set a property	on a model via
		_set()_, you are setting the property's entry in the model's _attributes_
		hash, not setting the property on the model itself.

		Note that, even though you are changing the contents of the _attributes_
		hash, you should not specify _"attributes"_ as a parameter to _set()_ or
		_get()_. If you do so, you will create a schema object called _"attributes"_
		nested inside the model's _attributes_ hash.

		Also note that the _set()_ method has the ability to accept a hash of keys
		and values to be applied to the model all at once.

		__Computed Properties and enyo.Model__

		Computed properties only exist for attributes of a model. Otherwise, they
		function just as you would expect from the [ComputedSupport
		mixin](#enyo.ComputedSupport) on _enyo.Object_. The only exception is that
		all functions in the attributes schema are considered to be computed
		properties; these are fairly useless, though, unless you declare their
		dependencies.

		__Bindings__

		Bindings may be applied to _enyo.Model_ instances with the understanding
		that they will only be activated via changes to _attributes_.

		__Observers and Notifications__

		The notification system for observers works the same as it does with
		_enyo.Object_, except that observers are only notified of changes made to
		properties in the _attributes_ hash.

		__Events__

		The events in _enyo.Model_ differ from those in
		[enyo.Component](#enyo.Component). Instead of _bubbled_ or _waterfall_
		events, _enyo.Model_ has _change_ and _destroy_ events.	To work with these
		events, use the [addListener()](#enyo.RegisteredEventSupport::addListener),
		[removeListener()](#enyo.RegisteredEventSupport::removeListener), and
		[triggerEvent()](#enyo.RegisteredEventSupport::triggerEvent) methods.
	*/
	enyo.kind({
		name: "enyo.Model",
		//*@protected
		kind: null,
		mixins: [enyo.ObserverSupport, enyo.BindingSupport, enyo.RegisteredEventSupport],
		noDefer: true,
		//*@public
		/**
			A hash of attributes known as the record's schema. This is where the
			values of any attributes are stored for an active record.
		*/
		attributes: null,
		/**
			An optional hash of values and properties to be applied to the attributes
			of the record at initialization. Any value in _defaults_ that already
			exists on the attributes schema will be ignored.
		*/
		defaults: {},
		/**
			Set this flag to true if this model is read-only and will not need to
			commit or destroy any changes via a source. This will cause a _destroy()_
			call to safely execute _destroyLocal()_ by default.
		*/
		readOnly: false,
		/**
			All models have a _store_ reference. You can set this to a specific store
			instance in your application or use the default (the _enyo.store_ global).
		*/
		store: null,
		/**
			This is the fall-back driver to use when fetching, destroying, or
			comitting a model. A driver may always be specified at the time of method
			execution, but when it is not specified, the default will be used. This is
			a string that should be paired with a known driver for this records store.
		*/
		defaultSource: "ajax",
		/**
			An optional array of strings specifying the properties that will be
			included in the return values of _raw()_ and _toJSON()_. By default, all
			properties in the _attributes_ hash will be included.
		*/
		includeKeys: null,
		/**
			Set this property to the URL to be used when generating the request for
			this record from any specified source or the _defaultDriver_ of the
			record. Note that, by default, the _url_ for a _fetch()_ will have the its
			_primaryKey_ appended to the request. Overload the _getUrl()_ method to
			extend this behavior. Also see _urlRoot_.
		*/
		url: "",
		/**
			For models used	outside of collections, an optional base-kind for models
			with the same root but different _url_ values. If no _getUrl()_ method is
			provided and the _url_ property does not contain a protocol identifier for
			the source, it will assume that this value exists and use it as the root
			instead.
		*/
		urlRoot: "",
		/**
			Boolean value indicating whether a change that needs to be committed has
			occurred in the record
		*/
		dirty: false,
		/**
			Attribute that, if present in the model, will be used for reference in
			_enyo.Collections_ and in the _models_ _store_. It will also be used,
			by default, when generating the _url_ for the model. The value of
			_primaryKey_ is stored in the _attributes_ hash.
		*/
		primaryKey: "id",
		/**
			Set this to an array of keys to use for comparative purposes when using
			the _merge_ strategy in the store or any collection.
		*/
		mergeKeys: null,
		/**
			An arbitrary, unique value that is assigned to every model. Models may be
			requested via this property in collections and the store. Unlike
			_primaryKey_, this value is stored on the model and not its _attributes_
			hash.
		*/
		euid: "",
		/**
			Boolean value indicating whether the record was created locally or is
			pulled from a source. You should not modify this value, as this will cause
			the source to change its behavior.
		*/
		isNew: true,
		/**
			Retrieves the requested model attribute, returning the current value or
			undefined. If the attribute is a function, it is assumed to be a computed
			property and will be called in the context of the model, with its return
			value being returned.
		*/
		get: function (prop) {
			if (this.attributes) {
				var fn = this.attributes[prop];
				return (fn && "function" == typeof fn)? fn.call(this): fn;
			}
		},
		//*@public
		/**
			Sets values on specified model attributes. Accepts a single property name
			and value or a single hash of _keys_ and _values_ to be set all at once.
			Returns the model for chaining. If the attribute being set is a function
			in the schema, it will be ignored.
		*/
		set: function (prop, value, force) {
			if (this.attributes) {
				if (enyo.isObject(prop)) { return this.setObject(prop); }
				var rv = this.attributes[prop],
					ch, en;
				this._updated = false;
				if (rv && "function" == typeof rv) { return this; }
				if (force || rv !== value) {
					this.previous[prop] = rv;
					if (this.computedMap) {
						if ((en=this.computedMap[prop])) {
							if (typeof en == "string") {
								en = this.computedMap[prop] = enyo.trim(en).split(" ");
							}
							ch = {};
							for (var i=0, p; (p=en[i]); ++i) {
								this.attributes[prop] = rv;
								this.previous[p] = ch[p] = this.get(p);
								this.attributes[prop] = value;
								this.changed[p] = this.get(p);
								this._updated = true;
							}
						}
					}
					this.changed[prop] = this.attributes[prop] = value;
					this.notifyObservers(prop, rv, value);
					this._updated = true;
					// if this is a dependent of a computed property we mark that
					// as changed as well
					if (ch) {
						for (var k in ch) {
							this.notifyObservers(k, this.previous[k], ch[k]);
						}
					}
					if (!this.isSilenced() && this._updated) {
						// note we only clear this here if we are the ones to fire the
						// changed event
						this._updated = false;
						this.triggerEvent("change");
						this.changed = {};
					}
					this.dirty = true;
				}
			}
			return this;
		},
		/**
			A setter that accepts a hash of key/value pairs. Returns the model for
			chaining (and consistency with _set()_). All keys in _props_ will be added
			to the _attributes_ schema when this method is used.
		*/
		setObject: function (props) {
			if (this.attributes) {
				if (props) {
					this.stopNotifications();
					this.silence();
					var updated = false;
					for (var k in props) {
						this.set(k, props[k]);
						updated = updated || this._updated;
					}
					this.startNotifications();
					this.unsilence();
					if (updated) {
						this._updated = false;
						this.triggerEvent("change");
					}
					this.changed = {};
				}
			}
			return this;
		},
		/**
			While models should normally be instanced using _enyo.store.createRecord()_,
			the same applies to the constructor. The first parameter will be used as
			the attributes of the model; the optional second parameter will be used as
			configuration for the model. Note that _attributes_ being passed into this
			method will be passed to the _parse_ method. The options may include overloaded
			methods for the kind, but note that since it is done at instantiation, it will
			be executed for each new model created this way; it is recommended that you
			subkind the base kind instead.
		*/
		constructor: function (attributes, opts) {
			if (opts) { this.importProps(opts); }
			this.euid = enyo.uuid();
			var a = this.attributes = (this.attributes? enyo.clone(this.attributes): {}),
				d = this.defaults,
				x = attributes;
			if (x) { enyo.mixin(a, this.parse(x)); }
			if (d) { enyo.mixin(a, d, _mixinOpts); }
			this.changed  = {};
			// populate the previous property with the actual values as would be expected
			// for further updates
			this.previous = this.raw();
			this.storeChanged();
		},
		//*@protected
		importProps: function (p) {
			if (p) {
				enyo.kind.statics.extend(p, this);
			}
		},
		//*@public
		/**
			Produces an immutable hash of the known attributes of this record. If the
			_includeKeys_ array exists, it will	determine the keys that are included
			in the return value; otherwise, all known properties will be included.
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
			Returns the JSON-stringified version of the output of _raw()_ for this
			record.
		*/
		toJSON: function () {
			return enyo.json.stringify(this.raw());
		},
		/**
			By default, uses any _urlRoot_ with the _url_ property; if the record	has
			a _primaryKey_ value (_"id"_ by default), it will be added at the end.
		*/
		getUrl: function () {
			var pk = this.primaryKey,
				id = this.get(pk),
				u  = this.urlRoot + "/" + this.url;
			if (id) {
				u += ("/" + id);
			}
			return u;
		},
		/**
			Commits the current state of the record to either the specified source or
			the _records_ default source. The source and any other options may be
			specified in the _opts_ hash. You may provide _success_ and _fail_ methods
			that will be executed on those conditions. The _success_ method will be
			called with the same parameters as the built-in _didCommit()_ method.
		*/
		commit: function (opts) {
			var o = opts? enyo.clone(opts): {};
			o.success = enyo.bindSafely(this, "didCommit", this, opts);
			o.fail = enyo.bindSafely(this, "didFail", "commit", this, opts);
			this.store.commitRecord(this, o);
		},
		/**
			Using the state of the record and any options passed in via the _opts_
			hash, tries to fetch the current model attributes from the specified (or
			default) source for this record. You may provide _success_ and _fail_
			methods that will be executed on those conditions. The _success_ method
			will be called with the same parameters as the built-in _didFetch()_ method.
		*/
		fetch: function (opts) {
			var o = opts? enyo.clone(opts): {};
			o.success = enyo.bindSafely(this, "didFetch", this, opts);
			o.fail = enyo.bindSafely(this, "didFail", "fetch", this, opts);
			this.store.fetchRecord(this, o);
		},
		/**
			Requests a _destroy_ action for the given record and the specified (or
			default) source in the optional _opts_ hash. You may provide _success_ and
			_fail_ methods that will be executed on those conditions. The _success_
			method will be called with the same parameters as the built-in
			_didDestroy()_ method. If the record is read-only or has its _isNew_ flag
			set to true, it will call its synchronous _destroyLocal()_ method instead
			and will not use any callbacks.
		*/
		destroy: function (opts) {
			if (this.readOnly || this.isNew) { return this.destroyLocal(); }
			var o = opts? enyo.clone(opts): {};
			o.success = enyo.bindSafely(this, "didDestroy", this, opts);
			o.fail = enyo.bindSafely(this, "didFail", "destroy", this, opts);
			this.store.destroyRecord(this, o);
		},
		/**
			Completely removes the record locally without sending a destroy request to
			any source. This is the proper method for destroying local-only records.
		*/
		destroyLocal: function () {
			var o = {};
			o.success = enyo.bindSafely(this, "didDestroy", this);
			this.store.destroyRecordLocal(this, o);
		},
		/**
			Overload this method to change the structure of the data as it is returned
			from a _fetch_ or _commit_. By default, just returns the data as it was
			retrieved from the source.
		*/
		parse: function (data) {
			return data;
		},
		/**
			When a record is successfully fetched, this method is called before any
			user-provided callbacks are executed. It properly inserts the incoming
			data into the record and notifies any observers of the properties that
			have changed.
		*/
		didFetch: function (rec, opts, res) {
			// the actual result has to be checked post-parse
			var r = this.parse(res);
			if (r) {
				this.setObject(r);
			}
			// once notifications have taken place we clear the dirty status so the
			// state of the model is now clean
			this.dirty = false;
			// the record can no longer be considered new
			this.isNew = false;
			if (opts) {
				if (opts.success) {
					opts.success(rec, opts, res);
				}
			}
		},
		/**
			When a record is successfully committed, this method is called before any
			user-provided callbacks are executed.
		*/
		didCommit: function (rec, opts, res) {
			// the actual result has to be checked post-parse
			var r = this.parse(res);
			if (r) {
				this.setObject(r);
			}
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
		},
		/**
			When a record is successfully destroyed, this method is called before any
			user-provided callbacks are executed.
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
			this.store._recordDestroyed(this);
			this.previous    = null;
			this.changed     = null;
			this.defaults    = null;
			this.includeKeys = null;
			this.mergeKeys   = null;
			this.store       = null;
			this.destroyed   = true;
			// we don't call the inherited destroy chain so we do our own cleanup
			// to avoid lingering entries
			this.removeAllObservers();
			this.removeAllListeners();

			if (opts && opts.success) {
				opts.success(rec, opts, res);
			}
		},
		/**
			When a record fails during a request, this method is executed with the
			name of the command that failed, followed by a reference to the record,
			the original options, and the result (if any).
		*/
		didFail: function (which, rec, opts, res) {
			if (opts && opts.fail) {
				opts.fail(rec, opts, res);
			}
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
		_attributeSpy: function () {
			var pkey = this.primaryKey,
				prop = arguments[2];
			if (pkey == prop) {
				// we need to let the store know that our id (unique primaryKey value)
				// changed - we do this here so it doesn't need to register a new observer
				// for every record created
				this.store._recordKeyChanged(this, this.previous[this.primaryKey]);
			}
		},
		observers: {
			_attributeSpy: "*"
		}
	});
	//*@protected
	enyo.Model.concat = function (ctor, props) {
		var p = ctor.prototype || ctor;
		if (props.attributes) {
			p.attributes = (p.attributes? enyo.mixin(enyo.clone(p.attributes), props.attributes): props.attributes);
			delete props.attributes;
		}
		if (props.defaults) {
			p.defaults = (p.defaults? enyo.mixin(enyo.clone(p.defaults), props.defaults): props.defaults);
			delete props.defaults;
		}
		if (props.mergeKeys) {
			p.mergeKeys = (p.mergeKeys? enyo.merge(p.mergeKeys, props.mergeKeys): props.mergeKeys.slice());
			delete props.mergeKeys;
		}
	};
})(enyo);
