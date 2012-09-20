//* @public
/**
	Creates a JavaScript constructor function with a prototype defined by
	_inProps_.

	_enyo.kind_ makes it easy to build a constructor-with-prototype (like a
	class) that has advanced features like prototype-chaining (inheritance).
	
	A plug-in system is included for extending the abilities of the kind
	generator, and constructors	are allowed to perform custom operations when
	subclassed.

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
		throw "enyo.kind: Attempt to subclass an undefined kind. Check dependencies for [" + (name || "<unnamed>") + "].";
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
	enyo.setObject(name, ctor);
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
	// create the singleton with the previous name and constructor
	enyo.setObject(name, new kind(), context);
};

//* @protected
enyo.kind.makeCtor = function() {
	return function() {
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
		// decorate function properties to support inherited (do this ex post facto so that ctor.prototype is known, relies on elements in props being copied by reference)
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
	return args.callee._inherited.apply(this, newArgs || args);
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
		//console.log("subclassing [" + ctor.prototype.kind + "] from [", this.prototype.kind + "]");
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
		return enyo._kindCtors[inKind] = enyo.Theme[inKind] || enyo[inKind] || enyo.getObject(inKind, false, enyo) || window[inKind] || enyo.getObject(inKind);
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