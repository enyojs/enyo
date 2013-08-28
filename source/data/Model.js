(function (enyo) {
	//*@protected
	/**
		As seen at https://gist.github.com/jcxplorer/823878, by jcxplorer.
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
	
		TODO: add examples
	
		## Computed Properties and _enyo.Model_
	
		A _computed property_ is nothing more than a property whose value is the return value
		of a function. A _computed property_ of a _model_ is slightly different than that of
		_enyo.Object_ in that it cannot be cached or dependent on other properties. You declare
		a _computed property_ for a _model_ simply by setting the _attribute_ to a function. When
		requested as a normal attribute it will be the return value of that function executed in
		the context of the _model_ (the `this` value for that method). You cannot set the value of
		a computed property. When the _raw_ method or _toJSON_ methods are executed, if no _includeKeys_
		are specified that exclude it, any computed properties return value will be included in the payload.

		## Bindings
	
		An _enyo.Model_ can be at the receiving end of a binding but bindings cannot be created
		on the _model_ itself. A _bindings_ array will be ignored.
	
		## Observers and Notifications
		
		## Events
	
		## How Drivers Work With Models
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
			return (fn && "function" == typeof fn && fn.call(this)) || fn;
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
				this.notifyObservers(prop);
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
				this.changed = {};
				this.dirty = true;
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
			if (opts) { this.importProps(opts); }
			this.euid = uuid();
			this.storeChanged();
			var a = this.attributes? enyo.clone(this.attributes): {},
				d = this.defaults,
				x = attributes;
			if (x) {
				enyo.mixin(a, x);
			}
			if (d) {
				enyo.mixin(a, d, _mixinOpts);
			}
			this.attributes = a;
			this.changed = {};
			this.previous = {};
		},
		//*@protected
		importProps: function (props) {
			if (props) {
				if (props.defaults || props.attributes) { enyo.Model.subclass(this, props); }
				for (var k in props) {
					this[k] = props[k];
				}
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
			the same parameters as the build-in method `didDestroy`.
		*/
		destroy: function (opts) {
			var o = opts? enyo.clone(opts): {};
			o.success = enyo.bind(this, "didDestroy", this, opts);
			o.fail = enyo.bind(this, "didFail", "destroy", this, opts);
			this.store.fetchRecord(this, o);
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
			this.setObject(this.parse(res));
			// once notifications have taken place we clear the dirty status so the
			// state of the model is now clean
			this.dirty = false;
			if (opts) {
				if (opts.success) {
					opts.success(rec, opts, res);
				}
			}
		},
		/**
			When a _record_ is successfully committed this method is called before any user
			provided callbacks are executed.
		*/
		didCommit: function (rec, opts, res) {
			this.setObject(this.parse(res));
			// once notifications have taken place we clear the dirty status so the
			// state of the model is now clean
			this.dirty = false;
			if (opts) {
				if (opts.success) {
					opts.success(rec, opts, res);
				}
			}
		},
		/**
			When a _record_ is successfully destroyed this method is called before any user
			provided callbacks are executed.
		*/
		didDestroy: function (rec, opts, res) {
			this.store.removeRecord(this);
			this.previous = null;
			this.changed = null;
			this.attributes = null;
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
			return this.store.addRecordObserver(this, prop, fn, ctx);
		},
		/**
			Removes an observer according to the the _enyo.ObserverSupport_ API.
		*/
		removeObserver: function (prop, fn) {
			return this.store.removeRecordObserver(this, prop, fn);
		},
		/**
			Notifies observers, but, unlike the _enyo.ObserverSupport_ API it accepts
			only one, optional, parameter _prop_, otherwise any _changed_ properties
			will be notified.
		*/
		notifyObservers: function (prop) {
			this.store.notifyRecordObservers(this, prop);
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
			Triggers any _listeners_ for the _event_ of this _record_.
		*/
		triggerEvent: function (event) {
			this.store.triggerEvent(this, event);
		},
		//*@protected
		storeChanged: function () {
			var s = this.store || enyo.store;
			if (s) {
				if (enyo.isString(s)) {
					s = enyo.getPath(s);
					if (!s) {
						this.warn("could not find the requested store -> ", this.store, ", using" +
							"the default store");
					}
				}
			}
			s = this.store = s || enyo.store;
			s.addRecord(this);
		}
	});
	//*@protected
	enyo.Model.subclass = function (ctor, props) {
		var p  = ctor.prototype || ctor,
			ra = props.attributes,
			// only clone when we absolutely need to
			pa = (p.attributes && (ra && enyo.clone(p.attributes)) || p.attributes) || {},
			rd = props.defaults,
			// only clone when we absolutely need to
			pd = (p.defaults && (rd && enyo.clone(p.defaults)) || p.defaults) || {};
			
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
	};
})(enyo);