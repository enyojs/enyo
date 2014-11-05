(function (enyo, scope) {
	/**
	* @private
	*/
	enyo.concatenated = [];

	/**
	* Creates a JavaScript [constructor]{@glossary constructor} function with
	* a prototype defined by `props`. **All constructors must have a unique name.**
	*
	* `enyo.kind()` makes it easy to build a constructor-with-prototype (like a
	* class) that has advanced features like prototype-chaining
	* ([inheritance]{@glossary inheritance}).
	*
	* A plug-in system is included for extending the abilities of the
	* [kind]{@glossary kind} generator, and constructors are allowed to
	* perform custom operations when subclassed.
	*
	* If you make changes to `enyo.kind()`, be sure to add or update the appropriate
	* [unit tests](@link https://github.com/enyojs/enyo/tree/master/tools/test/core/tests).
	*
	* For more information, see the documentation on
	* [Kinds]{@linkplain $dev-guide/key-concepts/kinds.html} in the Enyo Developer Guide.
	*
	* @namespace enyo.kind
	* @param {Object} props - A [hash]{@glossary Object} of properties used to define and create
	*	the [kind]{@glossary kind}
	* @public
	*/
	enyo.kind = function (props) {
		var name = props.name || '';
		// cannot defer unnamed kinds, kinds with static sections, or ones with
		// noDefer flag set
		if (!enyo.options.noDefer && name && !props.noDefer) {
			// make a deferred constructor to avoid a lot of kind
			// processing if we're never used
			var DeferredCtor = function() {
				var FinalCtor;
				// check for cached final constructor first, used mainly when
				// developers directly use kind names in thei r components instead of
				// strings that are resolved at runtime.
				if (DeferredCtor._FinalCtor) {
					FinalCtor = DeferredCtor._FinalCtor;
				} else {
					if (!(this instanceof DeferredCtor)) {
						throw 'enyo.kind: constructor called directly, not using "new"';
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
				var FinalCtor = enyo.kind.finish(props);
				DeferredCtor._FinalCtor = FinalCtor;
				props = null;
				return FinalCtor;
			};
			// copy public statics into DeferredCtor; note, this means
			// public static items will need to be read-only since the
			// deferrred kind constructor will have a different copy of
			// non-object values than the final kind constructor
			if (props.statics) {
				enyo.mixin(DeferredCtor, props.statics);
			}
			// always add the the extend capability for kinds even if they are
			// deferred
			DeferredCtor.extend = enyo.kind.statics.extend;
			// if extend is called on a deferred constructor, it needs to know that
			// so it can resolve it at that time
			DeferredCtor._deferred = true;
			if ((name && !enyo.getPath(name)) || enyo.kind.allowOverride) {
				enyo.setPath(name, DeferredCtor);
			}
			else if (name) {
				enyo.error('enyo.kind: ' + name + ' is already in use by another ' +
					'kind, all kind definitions must have unique names.');
			}
			return DeferredCtor;
		} else {
			// create anonymous kinds immediately
			return enyo.kind.finish(props);
		}
	};

	/**
	* @private
	*/
	enyo.kind.finish = function (props) {
		// kind-name to constructor map could be faulty now that a new kind exists, so we simply destroy the memoizations
		enyo._kindCtors = {};
		// extract 'name' property
		var name = props.name || '';
		delete props.name;
		// extract 'kind' property
		var hasKind = ('kind' in props);
		var kind = props.kind;
		delete props.kind;
		// establish base class reference
		var base = enyo.constructorForKind(kind);
		var isa = base && base.prototype || null;
		// if we have an explicit kind property with value undefined, we probably
		// tried to reference a kind that is not yet in scope
		if (hasKind && kind === undefined || base === undefined) {
			var problem = kind === undefined ? 'undefined kind' : 'unknown kind (' + kind + ')';
			throw 'enyo.kind: Attempt to subclass an ' + problem + '. Check dependencies for [' + (name || '<unnamed>') + '].';
		}
		// make a boilerplate constructor
		var ctor = enyo.kind.makeCtor();
		// semi-reserved word 'constructor' causes problems with Prototype and IE, so we rename it here
		if (props.hasOwnProperty('constructor')) {
			props._constructor = props.constructor;
			delete props.constructor;
		}
		// create our prototype
		//ctor.prototype = isa ? enyo.delegate(isa) : {};
		enyo.setPrototype(ctor, isa ? enyo.delegate(isa) : {});
		// there are special cases where a base class has a property
		// that may need to be concatenated with a subclasses implementation
		// as opposed to completely overwriting it...
		enyo.concatHandler(ctor, props);

		// put in our props
		enyo.mixin(ctor.prototype, props);
		// alias class name as 'kind' in the prototype
		// but we actually only need to set this if a new name was used,
		// not if it is inheriting from a kind anonymously
		if (name) {
			ctor.prototype.kindName = name;
		}
		// this is for anonymous constructors
		else {
			ctor.prototype.kindName = base && base.prototype? base.prototype.kindName: '';
		}
		// cache superclass constructor
		ctor.prototype.base = base;
		// reference our real constructor
		ctor.prototype.ctor = ctor;
		// support pluggable 'features'
		enyo.forEach(enyo.kind.features, function(fn){ fn(ctor, props); });
		// put reference into namespace
		if ((name && !enyo.getPath(name)) || enyo.kind.allowOverride) {
			enyo.setPath(name, ctor);
		}
		else if (name) {
			enyo.error('enyo.kind: ' + name + ' is already in use by another ' +
				'kind, all kind definitions must have unique names.');
		}
		return ctor;
	};

	/**
	* Creates a singleton of a given [kind]{@glossary kind} with a given
	* definition. **The `name` property will be the instance name of the singleton
	* and must be unique.**
	*
	* ```javascript
	*	enyo.singleton({
	*		kind: 'enyo.Control',
	*		name: 'app.MySingleton',
	*		published: {
	*			value: 'foo'
	*		},
	*		makeSomething: function() {
	*			//...
	*		}
	*	});
	*
	*	app.MySingleton.makeSomething();
	*	app.MySingleton.setValue('bar');
	*```
	*
	* @public
	*/
	enyo.singleton = function (conf, context) {
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

	/**
	* @private
	*/
	enyo.kind.makeCtor = function () {
		var enyoConstructor = function () {
			if (!(this instanceof enyoConstructor)) {
				throw 'enyo.kind: constructor called directly, not using "new"';
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

	/**
	* Classes referenced by name may omit this namespace (e.g., "Button" instead of "enyo.Button")
	*
	* @private
	*/
	enyo.kind.defaultNamespace = 'enyo';

	/**
	* Feature hooks for the oop system
	*
	* @private
	*/
	enyo.kind.features = [];

	/**
	* Used internally by several mechanisms to allow safe and normalized handling for extending a
	* [kind's]{@glossary kind} super-methods. It can take a
	* [constructor]{@glossary constructor}, a [prototype]{@glossary Object.prototype}, or an
	* instance.
	*
	* @private
	*/
	enyo.kind.extendMethods = function (ctor, props, add) {
		var proto = ctor.prototype || ctor,
			b = proto.base;
		if (!proto.inherited && b) {
			proto.inherited = enyo.kind.inherited;
		}
		// rename constructor to _constructor to work around IE8/Prototype problems
		if (props.hasOwnProperty('constructor')) {
			props._constructor = props.constructor;
			delete props.constructor;
		}
		// decorate function properties to support inherited (do this ex post facto so that
		// ctor.prototype is known, relies on elements in props being copied by reference)
		for (var n in props) {
			var p = props[n];
			if (enyo.isInherited(p)) {
				// ensure that if there isn't actually a super method to call, it won't
				// fail miserably - while this shouldn't happen often, it is a sanity
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
					p.displayName = n + '()';
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

	/**
	* Called by {@link enyo.Object} instances attempting to access super-methods
	* of a parent class ([kind]{@glossary kind}) by calling
	* `this.inherited(arguments)` from within a kind method. This can only be done
	* safely when there is known to be a super class with the same method.
	*
	* @private
	*/
	enyo.kind.inherited = function (originals, replacements) {
		// one-off methods are the fast track
		var target = originals.callee;
		var fn = target._inherited;

		// regardless of how we got here, just ensure we actually
		// have a function to call or else we throw a console
		// warning to notify developers they are calling a
		// super method that doesn't exist
		if ('function' === typeof fn) {
			var args = originals;
			if (replacements) {
				// combine the two arrays, with the replacements taking the first
				// set of arguments, and originals filling up the rest.
				args = [];
				var i = 0, l = replacements.length;
				for (; i < l; ++i) {
					args[i] = replacements[i];
				}
				l = originals.length;
				for (; i < l; ++i) {
					args[i] = originals[i];
				}
			}
			return fn.apply(this, args);
		} else {
			enyo.warn('enyo.kind.inherited: unable to find requested ' +
				'super-method from -> ' + originals.callee.displayName + ' in ' + this.kindName);
		}
	};

	// dcl inspired super-inheritance
	(function (enyo) {

		/**
		* @private
		*/
		var Inherited = function (fn) {
			this.fn = fn;
		};

		/**
		* When defining a method that overrides an existing method in a [kind]{@glossary kind}, you
		* can wrap the definition in this function and it will decorate it appropriately for inheritance
		* to work.
		*
		* The older `this.inherited(arguments)` method still works, but this version results in much
		* faster code and is the only one supported for kind [mixins]{@glossary mixin}.
		*
		* @param {Function} fn - A [function]{@glossary Function} that takes a single
		*   argument (usually named `sup`) and returns a function where
		*   `sup.apply(this, arguments)` is used as a mechanism to make the
		*   super-call.
		* @public
		*/
		enyo.inherit = function (fn) {
			return new Inherited(fn);
		};

		/**
		* @private
		*/
		enyo.isInherited = function (fn) {
			return fn && (fn instanceof Inherited);
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

	/**
	* @private
	*/
	enyo.kind.statics = {

		/**
		* A [kind]{@glossary kind} may set its own `subclass()` method as a
		* static method for its [constructor]{@glossary constructor}. Whenever
		* it is subclassed, the constructor and properties will be passed through
		* this method for special handling of important features.
		*
		* @param {Function} ctor - The [constructor]{@glossary constructor} of the
		*	[kind]{@glossary kind} being subclassed.
		* @param {Object} props - The properties of the kind being subclassed.
		* @memberof enyo.kind
		* @public
		*/
		subclass: function (ctor, props) {},

		/**
		* Allows for extension of the current [kind]{@glossary kind} without
		* creating a new kind. This method is available on all
		* [constructors]{@glossary constructor}, although calling it on a
		* [deferred]{@glossary deferred} constructor will force it to be
		* resolved at that time. This method does not re-run the
		* {@link enyo.kind.features} against the constructor or instance.
		*
		* @param {Object|Object[]} props A [hash]{@glossary Object} or [array]{@glossary Array}
		*	of [hashes]{@glossary Object}. Properties will override
		*	[prototype]{@glossary Object.prototype} properties. If a
		*	method that is being added already exists, the new method will
		*	supersede the existing one. The method may call
		*	`this.inherited()` or be wrapped with `enyo.inherit()` to call
		*	the original method (this chains multiple methods tied to a
		*	single [kind]{@glossary kind}).
		* @param {Object} [target] - The instance to be extended. If this is not specified, then the
		*	[constructor]{@glossary constructor} of the
		*	[object]{@glossary Object} this method is being called on will
		*	be extended.
		* @returns {Object} The constructor of the class, or specific
		*	instance, that has been extended.
		* @memberof enyo.kind
		* @public
		*/
		extend: function (props, target) {
			var ctor = this
				, exts = enyo.isArray(props)? props: [props]
				, proto, fn;

			fn = function (key, value) {
				return !(typeof value == 'function' || enyo.isInherited(value)) && enyo.concatenated.indexOf(key) === -1;
			};

			if (!target && ctor._deferred) ctor = enyo.checkConstructor(ctor);

			proto = target || ctor.prototype;
			for (var i=0, ext; (ext=exts[i]); ++i) {
				enyo.concatHandler(proto, ext, true);
				enyo.kind.extendMethods(proto, ext, true);
				enyo.mixin(proto, ext, {filter: fn});
			}

			return target || ctor;
		}
	};

	/**
	* @private
	*/
	enyo.concatHandler = function (ctor, props, instance) {
		var proto = ctor.prototype || ctor
			, base = proto.ctor;

		while (base) {
			if (base.concat) base.concat(ctor, props, instance);
			base = base.prototype.base;
		}
	};

	/**
	* Call this with an [enyo.kind()]{@link enyo.kind} [constructor]{@glossary constructor} to
	* make sure it's been [undeferred]{@glossary deferred}.
	*
	* @private
	*/
	enyo.checkConstructor = function (kind) {
		if (enyo.isFunction(kind)) {
			// if a deferred enyo kind, finish that work first
			if (kind._FinalCtor) {
				return kind._FinalCtor;
			}
			if (kind._finishKindCreation) {
				return kind._finishKindCreation();
			}
		}
		return kind;
	};

	/**
	* Factory for [kinds]{@glossary kind} identified by [strings]{@glossary String}.
	*
	* @private
	*/
	enyo._kindCtors = {};

	/**
	* @private
	*/
	enyo.constructorForKind = function (kind) {
		if (kind === null) {
			return kind;
		} else if (kind === undefined) {
			return enyo.defaultCtor;
		}
		else if (enyo.isFunction(kind)) {
			return enyo.checkConstructor(kind);
		}

		// use memoized constructor if available...
		var ctor = enyo._kindCtors[kind];
		if (ctor) {
			return ctor;
		}
		// otherwise look it up and memoize what we find
		//
		// if kind is an object in enyo, say "Control", then ctor = enyo["Control"]
		// if kind is a path under enyo, say "Heritage.Button", then ctor = enyo["Heritage.Button"] || enyo.Heritage.Button
		// if kind is a fully qualified path, say "enyo.Heritage.Button", then ctor = enyo["enyo.Heritage.Button"] || enyo.enyo.Heritage.Button || enyo.Heritage.Button
		//
		// Note that kind "Foo" will resolve to enyo.Foo before resolving to global "Foo".
		// This is important so "Image" will map to built-in Image object, instead of enyo.Image control.
		ctor = enyo.Theme[kind] || enyo[kind] || enyo.getPath('enyo.' + kind) || window[kind] || enyo.getPath(kind);

		// if this is a deferred kind, run the follow-up code then refetch the kind's constructor
		if (ctor && ctor._finishKindCreation) {
			ctor = ctor._finishKindCreation();
		}
		// If what we found at this namespace isn't a function, it's definitely not a kind constructor
		if (!enyo.isFunction(ctor)) {
			throw '[' + kind + '] is not the name of a valid kind.';
		}
		enyo._kindCtors[kind] = ctor;
		return ctor;
	};

	/**
	* Namespace for current theme (`enyo.Theme.Button` references the Button specialization for the
	* current theme).
	*
	* @private
	*/
	enyo.Theme = {};

	/**
	* @private
	*/
	enyo.registerTheme = function (ns) {
		enyo.mixin(enyo.Theme, ns);
	};

})(enyo, this);
