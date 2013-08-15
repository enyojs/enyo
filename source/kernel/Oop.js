﻿(function (enyo) {
	//*@protected
	/**
		Default properties of enyo kinds to concatenate as opposed to
		overwriting. These are automatically used unless explicitly
		removed.
	*/
	enyo.concat = ["concat"];
	/**
		Internally used to map a concatenated property handler to the
		property.
	*/
	var map = enyo.concatMap = {};
	var forced = {};
	enyo.concatHandler = function (prop, handler, force) {
		if (map[prop]) { map[prop].push(handler); }
		else { map[prop] = [handler]; }
		forced[prop] = force;
	};
	/**
		Concatenated properties are designated properties with special handling
		required between subclassing and extending. Any property that when added
		to a kind (either by subclassing or extending) needs to be manipulated
		or merged with the base kinds value should use this mechanism. Simply add
		the property name to the kinds _concat_ array (it too will be concatenated).
		If the value is an array with no special needs it will be handled automatically.
		If it is not an array or needs inspection a handler should be registered
		for that property via the _enyo.concatHandler_ method.
	
		A special note as to why this is required as opposed to using subclassing
		is due to the nature of _extending_ a kind and _extending_ an instance. These
		special handlers need to be invoked on all occassions not just subclassing. This
		is a normalized and performant handler that does the least amount of work possible.
	*/
	enyo.handleConcatenatedProperties = function (proto, props) {
		var c = enyo.merge(proto.concat, props.concat), fn;
		for (var i=0, p; (p=c[i]); ++i) {
			if (!props[p] && !proto[p] && !forced[p]) { continue; }
			// if there is a registered handler, use it
			if (map[p]) {
				for (var j=0; (fn=map[p][j]); ++j) { fn(proto, props); }
			} else if (enyo.isArray(proto[p])) {
				// if there wasn't a special handler but it was an array on the base
				// we assume it is an array coming in and we merge them
				proto[p] = enyo.merge(proto[p], props[p]);
				delete props[p];
			}
		}
	};
})(enyo);

//* @public
/**
	Creates a JavaScript constructor function with a prototype defined by
	_inProps_. __All constructors must have a unique name__.

	_enyo.kind_ makes it easy to build a constructor-with-prototype (like a
	class) that has advanced features like prototype-chaining (inheritance).

	A plug-in system is included for extending the abilities of the kind
	generator, and constructors are allowed to perform custom operations when
	subclassed.

	If you make changes to _enyo.kind_, be sure to add or update the appropriate
	[unit tests](https://github.com/enyojs/enyo/tree/master/tools/test/core/tests).

	For more information, see the documentation on
	[Creating Kinds](https://github.com/enyojs/enyo/wiki/Creating-Kinds)
	in the Enyo Developer Guide.
*/
enyo.kind = function(inProps) {
	var name = inProps.name || "";
	// cannot defer unnamed kinds, kinds with static sections, or ones with
	// noDefer flag set
	if (name && !inProps.noDefer) {
		// make a deferred constructor to avoid a lot of kind
		// processing if we're never used
		var DeferredCtor = function() {
			var FinalCtor;
			// check for cached final constructor first, used mainly when
			// developers directly use kind names in their components instead of
			// strings that are resolved at runtime.
			if (DeferredCtor._FinalCtor) {
				FinalCtor = DeferredCtor._FinalCtor;
			} else {
				if (!(this instanceof DeferredCtor)) {
					throw "enyo.kind: constructor called directly, not using 'new'";
				}
				FinalCtor = DeferredCtor._finishKindCreation();
			}
			var obj = enyo.delegate(FinalCtor.prototype);
			var retVal = FinalCtor.apply(obj, arguments);
			return retVal? retVal: obj;
		};
		DeferredCtor._finishKindCreation = function() {
			DeferredCtor._finishKindCreation = undefined;
			enyo.setPath(name, undefined);
			var FinalCtor = enyo.kind.finish(inProps);
			DeferredCtor._FinalCtor = FinalCtor;
			inProps = null;
			return FinalCtor;
		};
		// copy public statics into DeferredCtor; note, this means
		// public static items will need to be read-only since the
		// deferrred kind constructor will have a different copy of
		// non-object values than the final kind constructor
		if (inProps.statics) {
			enyo.mixin(DeferredCtor, inProps.statics);
		}
		// always add the the extend capability for kinds even if they are
		// deferred
		DeferredCtor.extend = enyo.kind.statics.extend;
		// if extend is called on a deferred constructor it needs to know that
		// so it can resolve it at that time
		DeferredCtor._deferred = true;
		if ((name && !enyo.getPath(name)) || enyo.kind.allowOverride) {
			enyo.setPath(name, DeferredCtor);
		}
		else if (name) {
			enyo.error("enyo.kind: " + name + " is already in use by another " +
				"kind, all kind definitions must have unique names.");
		}
		return DeferredCtor;
	} else {
		// create anonymous kinds immediately
		return enyo.kind.finish(inProps);
	}
};
//* @protected
enyo.kind.finish = function(inProps) {
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
	// but we actually only need to set this if a new name was used
	// not if it is inheriting from a kind anonymously
	if (name) {
		ctor.prototype.kindName = name;
	}
	// this is for anonymous constructors
	else {
		ctor.prototype.kindName = base && base.prototype? base.prototype.kindName: "";
	}
	// cache superclass constructor
	ctor.prototype.base = base;
	// reference our real constructor
	ctor.prototype.ctor = ctor;
	// support pluggable 'features'
	enyo.forEach(enyo.kind.features, function(fn){ fn(ctor, inProps); });
	// put reference into namespace
	if ((name && !enyo.getPath(name)) || enyo.kind.allowOverride) {
		enyo.setPath(name, ctor);
	}
	else if (name) {
		enyo.error("enyo.kind: " + name + " is already in use by another " +
			"kind, all kind definitions must have unique names.");
	}
	return ctor;
};

//* @public
/**
	Creates a Singleton of a given kind with a given definition.
	__The name property will be the instance name of the singleton
	and must be unique__.

		enyo.singleton({
			kind: "enyo.Control",
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
	var Kind = enyo.kind(conf);
	var inst;
	// create the singleton with the previous name and constructor
	enyo.setPath.call(context || enyo.global, name, (inst = new Kind()));
	return inst;
};

//* @protected
enyo.kind.makeCtor = function() {
	var enyoConstructor = function() {
		if (!(this instanceof enyoConstructor)) {
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
	return enyoConstructor;
};

// classes referenced by name can omit this namespace (e.g. "Button" instead of "enyo.Button")
enyo.kind.defaultNamespace = "enyo";

//
// feature hooks for the oop system
//
enyo.kind.features = [];

//*@protected
/**
	This is used internally by several mechanisms to allow safe and normalized
	handling for extending a kinds super-methods. It can take a constructor,
	a prototype or an instance.
*/
enyo.kind.extendMethods = function(ctor, props, add) {
	var proto = ctor.prototype || ctor,
		b = proto.base;
	if (!proto.inherited) {
		proto.inherited = enyo.kind.inherited;
	}
	// decorate function properties to support inherited (do this ex post facto so that
	// ctor.prototype is known, relies on elements in props being copied by reference)
	for (var n in props) {
		var p = props[n];
		if (enyo.isSuper(p)) {
			// handle special case where the constructor has actually been renamed
			// but mixins or other objects for extending will use the actual name
			if (n == "constructor") {
				n = "_constructor";
			}
			// ensure that if there isn't actually a super method to call it won't
			// fail miserably - while this shouldn't happen often it is a sanity
			// check for mixin-extensions for kinds
			if (add) {
				p = proto[n] = p.fn(proto[n] || enyo.nop);
			} else {
				p = proto[n] = p.fn(b? (b.prototype[n] || enyo.nop): enyo.nop);
			}
		}
		if (enyo.isFunction(p)) {
			if (add) {
				proto[n] = p;
				p.displayName = n + "()";
			} else {
				p._inherited = b? b.prototype[n]: null;
				// FIXME: we used to need some extra values for inherited, then inherited got cleaner
				// but in the meantime we used these values to support logging in Object.
				// For now we support this legacy situation, by suppling logging information here.
				p.displayName = proto.kindName + '.' + n + '()';
			}
		}
	}
};
enyo.kind.features.push(enyo.kind.extendMethods);

//*@protected
/**
	This method is called by enyo.Object's attempting to
	access super-methods of a parent class (kind) by calling
	_this.inherited(arguments)_ from within a kind method. This
	can only be done safely when there is known to be a super
	class with the same method.
*/
enyo.kind.inherited = function (originals, replacements) {
	// one-off methods are the fast track
	var target = originals.callee;
	var fn = target._inherited;

	// regardless of how we got here, just ensure we actually
	// have a function to call or else we throw a console
	// warning to notify developers they are calling a
	// super method that doesn't exist
	if ("function" === typeof fn) {
		return fn.apply(this, replacements? enyo.mixin(originals, replacements): originals);
	} else {
		enyo.warn("enyo.kind.inherited: unable to find requested " +
			"super-method from -> " + originals.callee.displayName + " in " + this.kindName);
	}
};

// dcl inspired super-inheritance
(function (enyo) {

	var Super = function (fn) {
		this.fn = fn;
	};
	
	enyo.super = function (fn) {
		return new Super(fn);
	};
	
	enyo.isSuper = function (fn) {
		return fn && (fn instanceof Super);
	};

})(enyo);

//
// 'statics' feature
//
enyo.kind.features.push(function(ctor, props) {
	// install common statics
	if (!ctor.subclass) {
		ctor.subclass = enyo.kind.statics.subclass;
	}
	if (!ctor.extend) {
		ctor.extend = enyo.kind.statics.extend;
	}
	// move props statics to constructor
	if (props.statics) {
		enyo.mixin(ctor, props.statics);
		delete ctor.prototype.statics;
	}
	// also support protectedStatics which won't interfere with defer
	if (props.protectedStatics) {
		enyo.mixin(ctor, props.protectedStatics);
		delete ctor.prototype.protectedStatics;
	}
	// allow superclass customization
	var base = ctor.prototype.base;
	while (base) {
		base.subclass(ctor, props);
		base = base.prototype.base;
	}
});

enyo.kind.statics = {
	//*@public
	/**
		A kind can set its own _subclass_ method as a _static.method_ for its constructor. Whenever
		it is subclassed the constructor and properties will be passed through this method for
		special handling of important features.
	*/
	subclass: function(ctor, props) {},
	//*@public
	/**
		This method is available on all constructors, although calling it on a deferred constructor
		will force it to be resolved at that time. Call with a hash or array of hashes
		to extend the current kind without creating a new kind. Properties will override prototype
		properties. If a method already exists that is being added it will supercede the existing
		method. The method can call this.inherited or be wrapped with enyo.super to call the original
		method (this chains multiple methods tied to a single kind). In cases where an instance is to
		be extended (not the class) it can be passed in as the second parameter. This method does not
		re-run the _enyo.kind.features_ against the constructor or instance. Returns the constructor
		or the instance.
	*/
	extend: function(props, target) {
		var ctor = this,
			exts = enyo.isArray(props)? props: [props],
			proto, fn;
		fn = function (k, v) { return !(enyo.isFunction(v) || enyo.isSuper(v)); };
		if (!target && ctor._deferred) {
			ctor = enyo.checkConstructor(ctor);
		}
		proto = target || ctor.prototype;
		for (var i=0, p; (p=exts[i]); ++i) {
			enyo.handleConcatenatedProperties(proto, p);
			enyo.kind.extendMethods(proto, p, true);
			enyo.mixin(proto, p, {filter: fn});
		}
		return target || ctor;
	}
};

/**
	Call this with a enyo.Kind constructor to make sure it's been undeferred.
*/
enyo.checkConstructor = function(inKind) {
	if (enyo.isFunction(inKind)) {
		// if a deferred enyo kind, finish that work first
		if (inKind._FinalCtor) {
			return inKind._FinalCtor;
		}
		if (inKind._finishKindCreation) {
			return inKind._finishKindCreation();
		}
	}
	return inKind;
};

//
// factory for kinds identified by strings
//
enyo._kindCtors = {};

enyo.constructorForKind = function(inKind) {
	if (inKind === null) {
		return inKind;
	} else if (inKind === undefined) {
		return enyo.defaultCtor;
	}
	else if (enyo.isFunction(inKind)) {
		return enyo.checkConstructor(inKind);
	}

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
	ctor = enyo.Theme[inKind] || enyo[inKind] || enyo.getPath.call(enyo, inKind, true) || window[inKind] || enyo.getPath(inKind);
	// if this is a deferred kind, run the follow-up code then refetch the kind's constructor
	if (ctor && ctor._finishKindCreation) {
		ctor = ctor._finishKindCreation();
	}
	enyo._kindCtors[inKind] = ctor;
	return ctor;
};

//
// namespace for current theme ("enyo.Theme.Button" references the Button specialization for the current theme)
//
enyo.Theme = {};

enyo.registerTheme = function(inNamespace) {
	enyo.mixin(enyo.Theme, inNamespace);
};
