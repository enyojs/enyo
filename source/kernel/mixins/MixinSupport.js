(function (enyo) {

	//*@protected
	/**
		When a kind is defined as an _enyo.Mixin_, it is actually
		instantiated immediately as a singleton to be reused by any
		other kinds that care to apply it.
	*/
	var store = enyo.mixins = {};

	//*@protected
	/**
		Used internally to keep a clearer abstraction between mixins'
		knowledge of available features of the framework.
	*/
	var features = enyo.mixins.features = [];

	//*@protected
	var register = function (name, mixin) {
		if (store[name]) {
			enyo.error("enyo.createMixin: cannot create " + name + " because " +
				"it already exists");
		}
		store[name] = mixin;
	};

	//*@public
	/**
		Creates a reusable hash of the properties to be applied for the
		the named mixin wherever it is requested. Returns a reference to
		the new mixin properties.
	*/
	var createMixin = enyo.createMixin = function (props) {
		if (!props) {
			return false;
		}
		// we need to grab the name but make sure it isn't stored as
		// a property on mixin hash
		var name = props.name;
		// if there isn't a name fail early
		// remove the name
		delete props.name;
		if (!name) {
			enyo.error("enyo.createMixin: cannot create mixin without name");
		}
		register(name, props);
		// move any mixin-constructor to a special name
		if ("function" === typeof props.create) {
			props._create = props.create;
			delete props.create;
			props._create.nom = name + ".create()";
		}
		if ("function" === typeof props.destroy) {
			props._destroy = props.destroy;
			delete props.destroy;
			props._destroy.nom = name + ".destroy()";
		}
		return props;
	};
	
	//*@protected
	var _apply_features = function (base, mixin) {
		for (var idx = 0, len = features.length; idx < len; ++idx) {
			features[idx](base, mixin);
		}
	};

	//*@protected
	var _add_mixin = function (proto, mixin, name) {
		
		// for the kind we clone the known mixin constructors
		var ctors = proto._mixin_create = enyo.clone(proto._mixin_create || []);
		// for the kind we clone the known mixin destructors
		var dtors = proto._mixin_destroy = enyo.clone(proto._mixin_destroy || []);
		// for the kind we clone the known applied mixins
		var applied = proto._applied_mixins = enyo.clone(proto._applied_mixins || []);
		
		// if this mixin is already applied, there is nothing we can do
		if (!!~enyo.indexOf(name, applied)) {
			return enyo.warn("enyo.applyMixin: " +
			"attempt to apply mixin " + name + " to " + proto.kindName +
			" multiple times");
		}
		// add the mixin constructor to the queue
		if ("function" === typeof mixin._create) {
			ctors.push(mixin._create);
		}
		// add the mixin destructor to the queue
		if ("function" === typeof mixin._destroy) {
			dtors.push(mixin._destroy);
		}
		// apply all of the properties and methods to the base kind prototype
		_apply_properties(proto, mixin, name);
		// add the name of this mixin to the applied mixins array for the kind
		applied.push(name);
		// give each available mixin feature the opportunity to handle properties
		_apply_features(proto, mixin);
	};

	//*@protected
	var _apply_properties = function (base, props, name) {
		// the name of any concatenatable properties
		var concat = base.concat || [];
		// the name of the property to be applied
		var key;
		// the value for the property that will be applied
		var prop;
		// placeholder for functions if they already exist
		// on the target base
		var fn;
		// the name of the mixin or nothing
		name = name || "unnamed";
		for (key in props) {
			if (!props.hasOwnProperty(key)) {
				continue;
			}
			if ("_create" === key || "_destroy" === key) {
				continue;
			}
			prop = props[key];
			// if the basetype has the property and it is a function, we
			// insert the propss function but allow it to chain the original
			// if it wants
			if (base[key] && "function" === typeof base[key]) {
				fn = base[key];
				prop = base[key] = enyo.proxyMethod(prop);
				prop._inherited = fn;
				prop.nom = name + "." + key + "()";
			} else if (!!~enyo.indexOf(key, concat)) {
				// we need to concatenate instead of blowing away the property
				// if they are both arrays
				if (base[key] instanceof Array && props[key] instanceof Array) {
					base[key] = enyo.merge(base[key], props[key]);
				}
			} else {
				base[key] = prop;
			}
		}
	};
	
	//*@public
	/**
		Used internally but made accessible to arbitrarily apply a mixin
		to a class prototype.
	*/
	var applyMixin = enyo.applyMixin = function (mixin, base) {
		// attempt to determine a name
		var name = "string" === typeof mixin? mixin: mixin.name || "unnamed";
		
		// determine the mixin from whether it is a string or a hash
		// of properties known as a mixin
		mixin = name !== "unnamed"? store[name]: mixin;
		
		// if there isn't a mixin we can't do anything
		if (!mixin || "object" !== typeof mixin) {
			return enyo.warn("enyo.applyMixin: could not find the requested mixin, '" +
				name + "'");
		}
		
		if ("function" === typeof base) {
			_add_mixin(base.prototype, mixin, name);
		} else {
			_add_mixin(base, mixin, name);
			_post_constructor.call(base);
		}
	};

	//*@protected
	var _create_mixins = function () {
		var $mixins = this._mixin_create;
		var len = $mixins.length;
		var idx = 0;
		var fn;
		for (; idx < len; ++idx) {
			fn = $mixins[idx];
			fn.call(this);
		}
	};

	//*@protected
	var _destroy_mixins = function () {
		var $mixins = this._mixin_destroy;
		var len = $mixins.length;
		var idx = 0;
		var fn;
		for (; idx < len; ++idx) {
			fn = $mixins[idx];
			fn.call(this);
		}
	};

	//*@protected
	var _post_constructor = function () {
		if (!this._supports_mixins) {
			return;
		}
		// we need to initialize all of the mixins registered to this
		// kind
		_create_mixins.call(this);
	};

	//*@protected
	/**
		We add a kind feature to snag and handle all mixins for a given
		kind.
	*/
	enyo.kind.features.push(function (ctor, props) {
		// see if there is a mixins array being applied to the kind
		var proto = ctor.prototype;
		var $mixins = proto.mixins || [];
		var len = $mixins.length;
		var idx = 0;
		// remove the array if it existed
		delete proto.mixins;
		for (; idx < len; ++idx) {
			applyMixin($mixins[idx], ctor);
		}
		// inject our special destructor that will enable the
		// other mixins to execute their own when the time is right
		_apply_properties(proto, {destroy: function () {
			if (this._supports_mixins) {
				_destroy_mixins.call(this);
			}
			return this.inherited(arguments);
		}}, "enyo.MixinSupport");
	});

	//*@protected
	enyo.kind.postConstructors.push(_post_constructor);

	//*@public
	/**
		The _enyo.MixinSupport_ mixin allows instances of _enyo.Object_
		and its subkinds to have proper mixin support applied at kind
		initialization time, as well as appropriate cleanup when the
		object is destroyed.
	*/
	createMixin({

		// ...........................
		// PUBLIC PROPERTIES

		//*@public
		name: "enyo.MixinSupport",

		// ...........................
		// PROTECTED PROPERTIES

		//*@protected
		_supports_mixins: true,
		
		// ...........................
		// PUBLIC METHODS
		
		//*@public
		/**
			Apply a mixin to an instance of an enyo.kind that supports
			mixins. This applied mixin will ONLY be applied to this instance
			and not to other instances of the kind. The lone parameter is
			the name of an available mixin or a reference to a mixin type.
			Returns the callee.
		*/
		applyMixin: function (mixin) {
			enyo.applyMixin(mixin, this, true);
			return this;
		}

	});

}(enyo));
