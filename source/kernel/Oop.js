//* @public
/**
	Creates a JavaScript constructor function with a prototype defined by _inProps_.

	_enyo.kind_ makes it easy to build a constructor-with-prototype (like a class) that has advanced
	features like prototype-chaining (inheritance).
	
	A plug-in system is included for extending the abilities of the kind generator, and constructors
	are allowed to perform custom operations when subclassed.

	Special Property Names
	----------------------

	Generally the properties defined in inProps are copied directly to the generated prototype, but certain
	property names trigger special processing.
	
	Examples of special properties are:
	
	* _name_: the _name_ property defines the name of the created constructor in the global namespace 
	(intermediate objects are created automatically). _name_ is not copied directly to the prototype,
	but is instead stored as _kindName_.

			// Creates a function MyNamespace.MyKind with a prototype.
			// MyNamespace.MyKind.prototype.kindName is set to "MyNamespace.MyKind".
			// MyNamespace.MyKind.prototype.plainProperty is set to "foo".
			enyo.kind({
				name: "MyNamespace.MyKind"
				plainProperty: "foo"
			});
			// Make an instance of the new kind
			var myk = new MyNamespace.MyKind();

	* _kind_: the name of or reference to a kind to derive from, like a super-class. The new constructor's prototype is 
	chained to the prototype specified by _kind_, and the _base_ property in the new prototype is set to reference the
	_kind_ constructor.

			// Create a function MyKind with a prototype, derived from enyo.Object.
			// MyKind.prototype.kindName is set to "MyKind".
			// MyKind.prototype.base is set to enyo.Object.
			enyo.kind({
				name: "MyKind",
				kind: enyo.Object
			});

	* _constructor_: a function to call when a new instance is created. Actually stored on the prototype as __constructor_.

			// Create a function MyKind with a prototype, derived from enyo.Object.
			// _constructor_ is called when an instance is created. 
			enyo.kind({
				name: "MyKind",
				kind: enyo.Object,
				constructor: function() {
					this.instanceArray = [];
					// call the constructor inherited from Object
					this.inherited(arguments);
				}
			});

	* _statics_: properties from any _statics_ object are copied onto the constructor directly, instead of the prototype.

			// Create a kind with a static method.
			enyo.kind({
				name: "MyKind",
				statics: {
					info: function() {
						return "MyKind is a kind with statics.";
					}
				}
			});
			// invoke the static info() method of MyKind
			console.log(MyKind.info());

	Certain kinds in the framework define their own special properties. 
	For example, see the _published_ property supported by <a href="#enyo.Object">enyo.Object</a>.

	inherited
	---------

	The _inherited_ feature allows you to easily call the super-kind method for any method that has been overridden.

		enyo.kind({
			name: "MyKind",
			doWork: function() {
				this.work++;
			}
		});

		enyo.kind({
			name: "MyDerivedKind",
			kind: "MyKind",
			doWork: function() {
				if (this.shouldDoWork) {
					this.inherited(arguments);
				}
			}
		});

	The first argument to _inherited_ is required to be the literal _arguments_, which is a special JavaScript variable that contains
	information about the executing function.
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
	// if we have an explicit kind property with value undefined, we probably tried to reference a kind that is not yet in scope
	if (hasKind && (kind !== null) && (base == null)) {
		throw "enyo.kind: Attempt to subclass an undefined kind. Check dependencies for [" + name + "].";
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
	// cache super-class constructor
	ctor.prototype.base = base;
	// reference our real constructor
	ctor.prototype.ctor = ctor;
	// support pluggable 'features'
	enyo.forEach(enyo.kind.features, function(fn){ fn(ctor, inProps); });
	// put reference into namespace
	enyo.setObject(name, ctor);
	return ctor;
};

//* @protected
enyo.kind.makeCtor = function() {
	return function() {
		// two-pass instantiation
		if (this._constructor) {
			// pure construction
			this._constructor.apply(this, arguments);
		}
		// defer initialization until entire constructor chain has finished
		if (this.constructed) {
			// post-constructor initialization
			this.constructed.apply(this, arguments);
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
				p._inherited = proto.base.prototype[n];
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