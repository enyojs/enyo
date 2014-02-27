//*@public
/**
_enyo.Object_ lies at the heart of the Enyo framework's implementations of
property publishing, computed properties (via the
[ComputedSupport](#enyo/source/kernel/mixins/ComputedSupport.js) mixin), and
data binding (via the [BindingSupport](#enyo/source/kernel/mixins/BindingSupport.js)
mixin). It also provides several utility functions for its subkinds.

Published properties are declared in a hash called _published_ within a call
to _enyo.kind_. To get and set values for these properties, call
_get(&lt;propertyName&gt;)_ and _set(&lt;propertyName&gt;, &lt;value&gt;)_,
respectively.

By convention, the setter for a published property will trigger an optional
_&lt;propertyName&gt;Changed_ method when called.

For more information, see the documentation on [Objects and Published
Properties](key-concepts/objects-and-published-properties.html) in the Enyo
Developer Guide.
*/
enyo.kind({
	name: "enyo.Object",
	//* @protected
	// has no base kind
	kind: null,
	noDefer: true,
	//*@public
	/**
		An array of strings representing mixins to be applied
		to this kind at the end of the constructor routine.
	*/
	mixins: [
		enyo.MixinSupport,
		enyo.ObserverSupport,
		enyo.ComputedSupport,
		enyo.BindingSupport
	],

	constructor: function(props) {
		enyo._objectCount++;
		this.importProps(props);
	},

	importProps: function (props) {
		if (props) {
			var k;
			enyo.concatHandler(this, props);
			// if props is a default hash this is significantly faster than
			// requiring the hasOwnProperty check every time
			if (!props.kindName) {
				for (k in props) {
					this[k] = props[k];
				}
			}
			// otherwise we need to do that check since we don't want to include
			// anything in the prototype chain
			else {
				for (k in props) {
					if (props.hasOwnProperty(k)) {
						this[k] = props[k];
					}
				}
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
				kind: "enyo.Object",
				hello: function() {
					this.log("says", "hi");
					// shows in the console: MyObject.hello: says hi
				}
			});
	*/
	log: function() {
		var acc = arguments.callee.caller;
		var nom = ((acc ? acc.displayName : "") || "(instance method)") + ":";
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
				enyo.logging._log(inMethod, [inArgs.callee.caller.displayName + ": "].concat(enyo.cloneArray(inArgs)));
				enyo.log(x.stack);
			}
		}
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
		value, any observers of the property will be automatically notified of
		the change.

		The _force_ parameter is optional; if true, the property's value will be
		updated even if the passed-in value is the same as the current value,
		and observers will be notified of the update.

		The force parameter is optional; if true, the value will be updated
		even if it's the same as the current value, and observers will be
		notified of the update.

		If the property is a computed property, the intended value will be
		passed to the computed property (but will not be returned).

		This method is backwards-compatible and will call any setter that uses
		the setProperty naming convention. (Moving forward, however, Enyo code
		should use computed properties or observers instead of relying on the
		setter naming convention.)
	*/
	set: function (path, value, force) {
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
		var args = Array.prototype.concat.apply([this], arguments);
		return enyo.bindSafely.apply(enyo, args);
	},
	//*@protected
	destroy: function () {
		// Since JS objects are never truly destroyed (GC'd) until all references are
		// gone, we might have some delayed action on this object that needs access
		// to this flag.
		// Using this.set to make the property observable
		this.set("destroyed", true);
	},

	_isObject: true
});

//* @protected
enyo._objectCount = 0;

enyo.Object.concat = function (ctor, props) {
	var pp = props.published;
	if (pp) {
		var cp = ctor.prototype || ctor;
		for (var n in pp) {
			// need to make sure that even though a property is "published"
			// it does not overwrite any computed properties
			if (props[n] && enyo.isFunction(props[n])) { continue; }
			enyo.Object.addGetterSetter(n, pp[n], cp);
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
enyo.Object.addGetterSetter = function (prop, value, proto) {
	var p   = enyo.cap(prop),
		gfx = enyo.getPath.fast,
		sfx = enyo.setPath.fast,
		s   = "set" + p,
		g   = "get" + p,
		gs  = (proto._getters || (proto._getters = {})),
		ss  = (proto._setters || (proto._setters = {})), fn;
	proto[prop] = value;
	// if there isn't already a getter we create one using the
	// fast track getter
	if (!(fn = proto[g]) || !enyo.isFunction(fn)) {
		fn = proto[g] = function () { return gfx.call(this, prop); };
		fn.generated = true;
	} else if (fn && "function" == typeof fn && !fn.generated) { gs[prop] = g; }
	// if there isn't already a setter we create one using the
	// fast track setter
	if (!(fn = proto[s]) || !enyo.isFunction(fn)) {
		fn = proto[s] = function (v) { return sfx.call(this, prop, v); };
		fn.generated = true;
	} else if (fn && "function" == typeof fn && !fn.generated) { ss[prop] = s; }
};
