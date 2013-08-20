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
					return this.attributes[path];
				}
				return sup.apply(this, arguments);
			};
		}),
		/**
			Overloaded _setter_. Will accept either a _hash_ of properties to be set
			or the default _path_ and _value_ parameters. Note that this _setter_ will
			_only set attribute values_. Any property set via the _setter_ will be considered
			part of the _attributes schema_ of the record.
		*/
		set: enyo.super(function (sup) {
			return function (path, value) {
				
			};
		}),
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