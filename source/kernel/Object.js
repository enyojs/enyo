/**
_enyo.Object_ lies at the heart of the Enyo framework's implementations of
property publishing, computed properties (via the _ComputedPropertySupport_
mixin), and data binding (via the _BindingSupport_ mixin). It also provides
several utility functions for its subkinds.

Published properties are declared in a hash called _published_ within a call
to _enyo.kind_. To get and set values for these properties, call
_get(&lt;propertyName&gt;)_ and _set(&lt;propertyName&gt;, &lt;value&gt;)_,
respectively.

By convention, the setter for a published property will trigger an optional
_&lt;propertyName&gt;Changed_ method when called.

For more information, see the [documentation on Published
Properties](https://github.com/enyojs/enyo/wiki/Published-Properties) in the
Enyo Developer Guide.
*/
enyo.kind({
	name: "enyo.Object",
	//* @protected
	// has no base kind
	kind: null,
	//*@public
	// concatenated properties (default)
	concat: enyo.concat,
	//*@public
	/**
		An array of strings representing mixins to be applied
		to this kind at the end of the constructor routine.
	*/
	mixins: [
		"enyo.MixinSupport",
		"enyo.ObserverSupport",
		"enyo.ComputedSupport",
		"enyo.BindingSupport"
	],

	constructor: function(props) {
		enyo._objectCount++;
		this.importProps(props);
	},

	importProps: function (props) {
		if (props) {
			for (var key in props) {
				if (!props.hasOwnProperty(key)) {
					continue;
				}
				this[key] = props[key];
			}
		}
	},

	//* @public
	//* Destroys object with passed-in name.
	destroyObject: function(inName) {
		if (this[inName] && this[inName].destroy) {
			this[inName].destroy();
		}
		this[inName] = null;
	},
	/**
		Sends a log message to the console, prepended with the name of the kind
		and method from which _log_ was invoked.  Multiple arguments are coerced
		to String and joined with spaces.

			enyo.kind({
				name: "MyObject",
				kind: enyo.Object,
				hello: function() {
					this.log("says", "hi");
					// shows in the console: MyObject.hello: says hi
				}
			});
	*/
	log: function() {
		var acc = arguments.callee.caller;
		var nom = ((acc ? acc.nom : "") || "(instance method)") + ":";
		enyo.logging.log("log", [nom].concat(enyo.cloneArray(arguments)));
	},
	//* Same as _log_, except uses the console's warn method (if it exists).
	warn: function() {
		this._log("warn", arguments);
	},
	//* Same as _log_, except uses the console's error method (if it exists).
	error: function() {
		this._log("error", arguments);
	},
	//* @protected
	_log: function(inMethod, inArgs) {
		if (enyo.logging.shouldLog(inMethod)) {
			try {
				throw new Error();
			} catch(x) {
				enyo.logging._log(inMethod, [inArgs.callee.caller.nom + ": "].concat(enyo.cloneArray(inArgs)));
				enyo.log(x.stack);
			}
		}
	},
	//*@protected
	/**
		Accepts a string property as its only parameter. Evaluates the
		property and, if the value is itself a string, attempts to resolve
		an object from the string. The goal is to determine whether the
		property is a constructor, an instance, or neither. See
		_lang.js#enyo.findAndInstance_ for more information.

		If a method exists of the form `{property}FindAndInstance`, it will
		be used as the callback, with two parameters accepted--the constructor
		(if it was found) and the instance (if it was found or created). This
		allows for those methods to be overloaded by subkinds.
	*/
	findAndInstance: function (property) {
		// if there isn't a property, do nothing
		if (!enyo.exists(property)) {
			return;
		}
		var fn = this[property + "FindAndInstance"];
		// go ahead and call the enyo-scoped version of this method
		return enyo.findAndInstance.call(this, property, fn, this);
	},

	//*@public
	/**
		Retrieves the value of a property or computed property.  Pass in the
		name of (or path to) the desired property or computed property. For
		computed properties, the value of the property is returned, not the
		function. Returns undefined if the requested path relative to the
		object cannot be found or resolved.

		This method is backwards-compatible and will automatically call any
		existing _getter_ method that uses the getProperty naming convention.
		(Moving forward, however, Enyo code should use computed properties
		instead of relying on the getter naming convention.)
	*/
	get: function (path) {
		return enyo.getPath.apply(this, arguments);
	},
	//*@public
	/**
		Sets the value of a property (or path). Pass in the property (or path)
		and the value to be set. If the value is different from the previous
		value, any listeners/observers of the property will be automatically
		notified of the change.

		If the property is a computed property, the intended value will be
		passed to the computed property (but will not be returned).

		This method is backwards-compatible and will call any setter that uses
		the setProperty naming convention. (Moving forward, however, Enyo code
		should use computed properties or observers instead of relying on the
		setter naming convention.)
	*/
	set: function (path, value) {
		return enyo.setPath.apply(this, arguments);
	},

	//*@public
	/**
		Binds a callback to this object. If the object has been destroyed, the
		bound method will be aborted cleanly with no value returned.

		This method should generally be used instead of `enyo.bind` for running
		code in the context of an instance of _enyo.Object_ or one of its
		subkinds.
	*/
	bindSafely: function(method/*, bound arguments*/) {
		var scope = this;
		if (enyo.isString(method)) {
			if (this[method]) {
				method = this[method];
			} else {
				throw(['enyo.Object.bindSafely: this["', method, '"] is null (this="', this, '")'].join(''));
			}
		}
		if (enyo.isFunction(method)) {
			var args = enyo.cloneArray(arguments, 1);
			return function() {
				if (scope.destroyed) {
					return;
				}
				var nargs = enyo.cloneArray(arguments);
				return method.apply(scope, args.concat(nargs));
			};
		} else {
			throw(['enyo.Object.bindSafely: this["', method, '"] is not a function (this="', this, '")'].join(''));
		}
	},
	//*@protected
	destroy: function () {
		// Since JS objects are never truly destroyed (GC'd) until all references are
		// gone, we might have some delayed action on this object that needs access
		// to this flag.
		this.destroyed = true;
	},

	_is_object: true
});

//* @protected

enyo._objectCount = 0;

enyo.Object.subclass = function(ctor, props) {
	this.publish(ctor, props);
	this.overload(ctor, props);
};

enyo.Object.publish = function(ctor, props) {
	var pp = props.published;
	if (pp) {
		var cp = ctor.prototype;
		for (var n in pp) {
			// need to make sure that even though a property is "published"
			// it does not overwrite any computed properties
			if (props[n] && enyo.isFunction(props[n]) && props[n].isProperty) {
				continue;
			}
			enyo.Object.addGetterSetter(n, pp[n], cp);
		}
	}
};

//*@protected
/**
	We need to find special cases and ensure that the overloaded
	getter of a published property of a parent kind is flagged for
	the global getter and setter.
*/
enyo.Object.overload = function (ctor, props) {
	var proto = ctor.prototype.base? ctor.prototype.base.prototype: {};
	var regex = /^(get|set).*/;
	var name;
	var prop;
	for (name in props) {
		if (!regex.test(name)) {
			continue;
		}
		prop = props[name];
		if ("function" === typeof prop) {
			if (proto[name]) {
				prop.overloaded = true;
			}
		}
	}
};

//*@protected
/**
	This method creates a getter/setter for a published property of
	an _enyo.Object_, but is deprecated. It is maintained for purposes
	of backwards compatability. The preferred method is to mark public
	and protected (private) methods and properties using documentation or
	other means and rely on the _get_ and _set_ methods of _enyo.Object_
	instances.
*/
enyo.Object.addGetterSetter = function (property, value, proto) {
	var getter = "get" + enyo.cap(property);
	var setter = "set" + enyo.cap(property);
	var fn;
	// set the initial value for the prototype
	proto[property] = value;
	fn = proto[getter];
	// if there isn't already a getter provided create one
	if ("function" !== typeof fn) {
		fn = proto[getter] = function () {return this.get(property);};
		fn.overloaded = false;
	} else if (false !== fn.overloaded) {
		// otherwise we need to mark it as having been overloaded
		// so the global getter knows not to ignore it
		fn.overloaded = true;
	}
	// if there isn't already a setter provided, create one
	fn = proto[setter];
	if ("function" !== typeof fn) {
		fn = proto[setter] = function () {return this.set(property, arguments[0]);};
		fn.overloaded = false;
	} else if (false !== fn.overloaded) {
		// otherwise we need to mark it as having been overloaded
		// so the global setter knows not to ignore it
		fn.overloaded = true;
	}
};
