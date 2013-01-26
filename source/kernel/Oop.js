
//*@public
/**
    Takes a function followed by 1 or more string parameters that are
    targets for the observer. Returns a method with the appropriate properties
    to allow the system to notify it when the named properites have been
    modified.
*/
enyo.Observer = function (fn /* arguments */) {
    var events = enyo.toArray(arguments).slice(1);
    if (!enyo.exists(fn) || "function" !== typeof fn) {
        // this is a necessary assert
        throw "enyo.Observer: invalid observer, must have a function";
    }
    fn.isObserver = true;
    fn.events = (fn.events? fn.events: []).concat(events);
    return fn;
};

//*@public
/**
    Takes a function followed by 0 or more string parameters that
    are dependencies of the computed property. Returns the method
    with the appropriate properties to allow the system to use it
    as a normal property.
*/
enyo.Computed = function (fn /* arguments */) {
    var dependencies = enyo.toArray(arguments).slice(1);
    if (!enyo.exists(fn) || "function" !== typeof fn) {
        // this is a necessary assert
        throw "enyo.Computed: invalid computed property, must have a function";
    }
    fn.isProperty = true;
    fn.properties = (fn.properties? fn.properties: []).concat(dependencies);
    return fn;
};


//*@protected
/**
    Default properties of enyo kinds to concatenate as opposed to
    overwriting. These are automatically used unless explicitly
    removed.
*/
enyo.concat = ["concat", "bindings", "mixins"];

//*@protected
/**
    Is called during kind-initialization to make sure that any property
    noted to be concatenated will be (must be an array) so that those values
    will not be lost by subclasses overriding that property.
*/
enyo.handleConcatenatedProperties = function (ctor, proto) {
    var properties = enyo.merge(ctor.concat || [], proto.concat || []);
    var prop;
    var right;
    var left;
    while (properties.length) {
        prop = properties.shift();
        left = ctor[prop];
        right = proto[prop];
        if ((left instanceof Array) && (right instanceof Array)) {
            ctor[prop] = enyo.merge(left, right);
            // remove the reference to the property to it will not
            // conflict later
            delete proto[prop];
        }
    }
};

//* @public
/**
	Creates a JavaScript constructor function with a prototype defined by
	_inProps_.

	_enyo.kind_ makes it easy to build a constructor-with-prototype (like a
	class) that has advanced features like prototype-chaining (inheritance).

	A plug-in system is included for extending the abilities of the kind
	generator, and constructors	are allowed to perform custom operations when
	subclassed.

	If you make changes to _enyo.kind_, be sure to add or update the appropriate
	[unit tests](https://github.com/enyojs/enyo/tree/master/tools/test/core/tests).

	For more information, see the documentation on
	[Creating Kinds](https://github.com/enyojs/enyo/wiki/Creating-Kinds)
	in the Enyo	Developer Guide.
*/
enyo.kind = function(inProps) {
	// kind-name to constructor map could be faulty now that a new kind exists, so we simply destroy the memoizations
	enyo._kindCtors = {};
	// extract 'name' property
	var name = inProps.name || "";
	delete inProps.name;
	// extract 'kind' property
	var hasKind = ("kind" in inProps);
	var kind = inProps.kind;
	delete inProps.kind;
	// establish base class reference
	var base = enyo.constructorForKind(kind);
	var isa = base && base.prototype || null;
	// if we have an explicit kind property with value undefined, we probably
	// tried to reference  a kind that is not yet in scope
	if (hasKind && kind === undefined || base === undefined) {
		var problem = kind === undefined ? 'undefined kind' : 'unknown kind (' + kind + ')';
		throw "enyo.kind: Attempt to subclass an " + problem + ". Check dependencies for [" + (name || "<unnamed>") + "].";
	}
	// make a boilerplate constructor
	var ctor = enyo.kind.makeCtor();
	// semi-reserved word 'constructor' causes problems with Prototype and IE, so we rename it here
	if (inProps.hasOwnProperty("constructor")) {
		inProps._constructor = inProps.constructor;
		delete inProps.constructor;
	}
	// create our prototype
	//ctor.prototype = isa ? enyo.delegate(isa) : {};
	enyo.setPrototype(ctor, isa ? enyo.delegate(isa) : {});
	
	// there are special cases where a base class has a property
	// that may need to be concatenated with a subclasses implementation
	// as opposed to completely overwriting it...
	enyo.handleConcatenatedProperties(ctor.prototype, inProps);
	
	// put in our props
	enyo.mixin(ctor.prototype, inProps);
	// alias class name as 'kind' in the prototype
	ctor.prototype.kindName = name;
	// cache superclass constructor
	ctor.prototype.base = base;
	// reference our real constructor
	ctor.prototype.ctor = ctor;
	// support pluggable 'features'
	enyo.forEach(enyo.kind.features, function(fn){ fn(ctor, inProps); });
	// put reference into namespace
	enyo.setPath(name, ctor);
	return ctor;
};

/**
	Creates a Singleton

		enyo.singleton({
			kind: Control,
			name: "app.MySingleton",
			published: {
				value: "foo"
			},
			makeSomething: function() {
				//...
			}
		});

		app.MySingleton.makeSomething();
		app.MySingleton.setValue("bar");
*/
enyo.singleton = function(conf, context) {
	// extract 'name' property (the name of our singleton)
	var name = conf.name;
	delete(conf.name);
	// create an unnamed kind and save its constructor's function
	var kind = enyo.kind(conf);
    var inst;
	// create the singleton with the previous name and constructor
	enyo.setPath.call(context || enyo.global, name, (inst = new kind()));
    return inst;
};

//* @protected
enyo.kind.makeCtor = function() {
  return function() {;
		if (!(this instanceof arguments.callee)) {
			throw "enyo.kind: constructor called directly, not using 'new'";
		}

		// two-pass instantiation
		var result;
		if (this._constructor) {
			// pure construction
			result = this._constructor.apply(this, arguments);
		}
		// defer initialization until entire constructor chain has finished
		if (this.constructed) {
			// post-constructor initialization
			this.constructed.apply(this, arguments);
		}
		if (result) {
			return result;
		}
	};
};

// classes referenced by name can omit this namespace (e.g. "Button" instead of "enyo.Button")
enyo.kind.defaultNamespace = "enyo";

//
// feature hooks for the oop system
//
enyo.kind.features = [];

//
// 'inherited' feature
//
enyo.kind.features.push(function(ctor, props) {
	var proto = ctor.prototype;
	if (!proto.inherited) {
		proto.inherited = enyo.kind.inherited;
	}
	if (proto.base) {
		// decorate function properties to support inherited (do this ex post facto so that
		// ctor.prototype is known, relies on elements in props being copied by reference)
		for (var n in props) {
			var p = props[n];
			if (enyo.isFunction(p)) {
				p._inherited = proto.base.prototype[n] || enyo.nop;
				// FIXME: we used to need some extra values for inherited, then inherited got cleaner
				// but in the meantime we used these values to support logging in Object.
				// For now we support this legacy situation, by suppling logging information here.
				p.nom = proto.kindName + '.' + n + '()';
			}
		}
	}
});

enyo.kind.inherited = function(args, newArgs) {
	var cur = args.callee;
	var fn = cur._inherited;
	if (!fn || "function" !== typeof fn) {
	    cur = cur.caller;
	    fn = cur? cur._inherited: undefined;
	}
    if ("function" === typeof fn) return fn.apply(this, newArgs || args);
};

//
// 'statics' feature
//
enyo.kind.features.push(function(ctor, props) {
	// install common statics
	enyo.mixin(ctor, enyo.kind.statics);
	// move props statics to constructor
	if (props.statics) {
		enyo.mixin(ctor, props.statics);
		delete ctor.prototype.statics;
	}
	// allow superclass customization
	var base = ctor.prototype.base;
	while (base) {
		base.subclass(ctor, props);
		base = base.prototype.base;
	}
});

enyo.kind.statics = {
	subclass: function(ctor, props) {
		//enyo.log("subclassing [" + ctor.prototype.kind + "] from [", this.prototype.kind + "]");
	},
	extend: function(props) {
		enyo.mixin(this.prototype, props);
		// support pluggable 'features'
		var ctor = this;
		enyo.forEach(enyo.kind.features, function(fn){ fn(ctor, props); });
	}
};

//
// factory for kinds identified by strings
//
enyo._kindCtors = {};

enyo.constructorForKind = function(inKind) {
	if (inKind === null || enyo.isFunction(inKind)) {
		// in inKind is a function or explicitly null, then that's ctor, full stop.
		return inKind;
	}
	if (inKind) {
		// use memoized constructor if available...
		var ctor = enyo._kindCtors[inKind];
		if (ctor) {
			return ctor;
		}
		// otherwise look it up and memoize what we find
		//
		// if inKind is an object in enyo, say "Control", then ctor = enyo["Control"]
		// if inKind is a path under enyo, say "Heritage.Button", then ctor = enyo["Heritage.Button"] || enyo.Heritage.Button
		// if inKind is a fully qualified path, say "enyo.Heritage.Button", then ctor = enyo["enyo.Heritage.Button"] || enyo.enyo.Heritage.Button || enyo.Heritage.Button
		//
		// Note that kind "Foo" will resolve to enyo.Foo before resolving to global "Foo".
		// This is important so "Image" will map to built-in Image object, instead of enyo.Image control.
		return enyo._kindCtors[inKind] = enyo.Theme[inKind] || enyo[inKind] || enyo.getPath.call(enyo, inKind) || window[inKind] || enyo.getPath(inKind);
	}
	return enyo.defaultCtor;
};

//
// namespace for current theme ("enyo.Theme.Button" references the Button specialization for the current theme)
//
enyo.Theme = {};

enyo.registerTheme = function(inNamespace) {
	enyo.mixin(enyo.Theme, inNamespace);
};
