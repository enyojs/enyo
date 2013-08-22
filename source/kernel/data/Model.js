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
	//*@public
	/**
		## Getting _enyo.Model_ values
	
		The default `get` method of _enyo.Model_ has been overloaded to handle a few different
		scenarios. While schema _attributes_ are stored on an internal hash (`attributes`) you
		don't need to call `get` with the `attributes` prefix. If the property is defined as part
		of the schema it will be retrieved from the _attributes_ hash otherwise it will be retrieved
		from the model instance.
	
		## Setting _enyo.Model_ values

		The default `set` method of _enyo.Model_ has been overloaded to handle a few different
		scenarios as well. It has the added benefit of accepting an object of keys and values as
		opposed to simply a _path_ and a _value_ (as normal). When you use this new parameter
		configuration, however, it assumes the _keys_ are _attributes_ of the schema - even if
		they don't currently exist as such, and if they do, they will be updated to the new value.
		If the default parameter configuration of _path_ and _value_ is used, it will attempt to
		determine if the _path_ is a defined _attribute_ of the schema, and if so, set it, otherwise
		it will use its default behavior. You can define the schema several ways using the `attributes`
		hash for the model definition, the `defaults` hash for the model definition, passing in
		`attributes` as the first parameter to the constructor of a new model, or by passing the
		`set` method a hash instead of the _path_ and _value_.
		
		## Computed Properties and _enyo.Model_
		
		You can still use computed properties as you normally would for a _model_. The
		difference is, instead of placing the function directly on the model definition
		you place it on the _attributes_ schema hash. Its entry in the _computed_ block
		doesn't need the `attributes` prefix, just name it like you would otherwise. Its
		dependencies can be on the model definition (non-schema properties) and/or schema
		properties (on the _attributes_ schema hash).
	
		```
		computed: {
			myComputed: ["multiplier", "multiplicand"]
		},
		attributes: {
			myComputed: function () {
				return this.get("multiplicand") * this.get("multiplier");
			},
			multiplier: 7
		},
		multiplicand: 8
		```
	*/
	enyo.kind({
		name: "enyo.Model",
		kind: enyo.Object,
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
			An optional array of strings as the only properties to include in
			the _raw_ and _toJSON_ return values. By default it will use any properties
			in the _attributes_ hash.
		*/
		includeKeys: null,
		/**
			Overloaded _getter_ to allow the requested path to be an attribute in the
			_attributes_ hash (without the `.attributes` prefix), otherwise it will return
			the normal value.
		*/
		get: enyo.super(function (sup) {
			return function (path) {
				if (this.isAttribute(path)) {
					if (this._isComputed(path)) { return this._getComputed(path, true); }
					return this.attributes[path];
				}
				return sup.apply(this, arguments);
			};
		}),
		//*@protected
		_getComputed: function (path, attr) {
			var ca = this._computedCached,
				p = (attr || this.isAttribute(path)? ("attributes." + path): path), c;
			if ((c = ca[path])) {
				// if the cache says the computed property is dirty,
				// we have to fetch a current value
				if (c.dirty) {
					c.value = this[p]();
					c.dirty = false;
				}
				// return the value whether it was cached or
				// the most recent
				return c.value;
			}
			// if it is not a cacheable computed property, we
			// have to execute it to get the current value
			return this[p]();
		},
		//*@public
		/**
			Overloaded _setter_. Will accept either a _hash_ of properties to be set
			or the default _path_ and _value_ parameters. Note that this _setter_ will
			_only set attribute values_. Any property set via the _setter_ will be considered
			part of the _attributes schema_ of the record.
		*/
		set: enyo.super(function (sup) {
			return function (path, value) {
				if (enyo.isObject(path)) { return this.setObject(path); }
				if (this.isAttribute(path)) {
					
					var p = this.attributes[path];
					this.attributes[path] = value;
					p === value || this.notifyObservers(path, p, value);
					return this;
				} else { return sup.apply(this, arguments); }
			};
		}),
		/**
			A _setter_ that accepts a hash of _key_/_value_ pairs. Returns the _model_
			for chaining (and consistency with `set`). All _keys_ in _props_ will be added
			to the `attributes` schema when this method is used.
		*/
		setObject: function (props) {
			
			return this;
		},
		/**
			Mostly used internally but can be used to determine if the given property (string)
			is a known _attribute_ of the record.
		*/
		isAttribute: function (p) {
			return !! (p in this.attributes);
		},
		/**
			While models should normally be instanced using _enyo.store.createRecord_,
			the same applies to the _constructor_, the first parameter will be used as
			attributes of the model, the second, optional parameter will be used as configuration
			for the _model_. Note this method deliberately does not call its _super_ method.
		*/
		constructor: function (attributes, opts) {
			if (opts) { this.importProps(opts); }
			this.storeChanged();
			var a = this.attributes? enyo.clone(this.attributes): {},
				d = this.defaults,
				x = attributes;
			if (x) {
				enyo.mixin(a, x);
			}
			if (d) {
				enyo.mixin(a, d, {ignore: true});
			}
			this.attributes = a;
			this.bindings = this.bindings || [];
			enyo._ObjectCount++;
		},
		/**
			Produces an immutable hash of the known attributes of this record. Will
			be modified by the existence of the _includeKeys_ array otherwise it will
			use all known properties.
		*/
		raw: function () {
			var i = this.includeKeys,
				a = this.attributes;
			return i? enyo.only(i, a): enyo.clone(a);
		},
		/**
			Will return the JSON stringified version of the output of _raw_ of this record.
		*/
		toJSON: function () {
			return enyo.json.stringify(this.raw());
		},
		commit: function () {
		
		},
		fetch: function () {
		
		},
		destroy: function () {
		
		},
		didFetch: function () {
		
		},
		didCommit: function () {
		
		},
		didDestroy: function () {
		
		},
		//*@protected
		addObserver: function (prop, fn, ctx) {
			this.store.addModelObserver(this, prop, fn, ctx);
		},
		removeObserver: function () {
			this.store.removeModelObserver(this, prop, fn, ctx);
		},
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
			this.store = s || enyo.store;
		}
	});
})(enyo);