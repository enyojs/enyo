(function (enyo, scope) {

	var kind = enyo.kind
		, logging = enyo.logging;

	var MixinSupport = enyo.MixinSupport
		, ObserverSupport = enyo.ObserverSupport
		, BindingSupport = enyo.BindingSupport;
		
	/**
	* Used by all [objects]{@link enyo.Object} and [subkinds]{@glossary subkind} when using the
	* {@link enyo.Object#log}, {@link enyo.Object#warn} and {@link enyo.Object#error} methods.
	*
	* @private
	*/
	function log (method, args) {
		if (logging.shouldLog(method)) {
			try {
				throw new Error();
			} catch(err) {
				logging._log(method, [args.callee.caller.displayName + ': ']
					.concat(enyo.cloneArray(args)));
				enyo.log(err.stack);
			}
		}
	}

	/**
	* {@link enyo.Object} lies at the heart of the Enyo framework's implementations of property
	* publishing, computed properties (via the {@link enyo.ComputedSupport} {@glossary mixin}),
	* and data binding (via the {@link enyo.BindingSupport} mixin and {@link enyo.Binding}
	* object). It also provides several utility [functions]{@glossary Function} for its
	* [subkinds]{@glossary subkind}.
	*
	* @class enyo.Object
	* @mixes enyo.MixinSupport
	* @mixes enyo.ObserverSupport
	* @mixes enyo.BindingSupport
	* @public
	*/
	kind(
		/** @lends enyo.Object.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.Object',

		/**
		* @private
		*/
		kind: null,

		/**
		* @private
		*/
		noDefer: true,

		/**
		* Will be `true` if the [destroy()]{@link enyo.Object#destroy} method has been called;
		* otherwise, `false`.
		*
		* @readonly
		* @type {Boolean}
		* @default false
		* @public
		*/
		destroyed: false,

		/**
		* @private
		*/
		mixins: [MixinSupport, ObserverSupport, BindingSupport],

		/**
		* @private
		*/
		constructor: function (props) {
			enyo._objectCount++;
			this.importProps(props);
		},

		/**
		* Imports the values from the given [object]{@glossary Object}. Automatically called
		* from the [constructor]{@link enyo.Object#constructor}.
		*
		* @param {Object} props - If provided, the [object]{@glossary Object} from which to
		*	retrieve [keys/values]{@glossary Object.keys} to mix in.
		* @returns {this} The callee for chaining.
		* @public
		*/
		importProps: function (props) {
			var key;

			if (props) {
				enyo.concatHandler(this, props, true);
				// if props is a default hash this is significantly faster than
				// requiring the hasOwnProperty check every time
				if (!props.kindName) {
					for (key in props) {
						enyo.concatenated.indexOf(key) === -1 && (this[key] = props[key]);
					}
				} else {
					for (key in props) {
						if (enyo.concatenated.indexOf(key) === -1 && props.hasOwnProperty(key)) {
							this[key] = props[key];
						}
					}
				}
			}
			
			return this;
		},
		
		/**
		* Calls the [destroy()]{@link enyo.Object#destroy} method for the named {@link enyo.Object} 
		* property.
		*
		* @param {String} name - The name of the property to destroy, if possible.
		* @returns {this} The callee for chaining.
		* @public
		*/
		destroyObject: function (name) {
			if (this[name] && this[name].destroy) {
				this[name].destroy();
			}
			this[name] = null;
			
			return this;
		},
		
		/**
		* Sends a log message to the [console]{@glossary console}, prepended with the name
		* of the {@glossary kind} and method from which `log()` was invoked. Multiple
		* {@glossary arguments} are coerced to {@glossary String} and
		* [joined with spaces]{@glossary Array.join}.
		*
		* ```javascript
		* enyo.kind({
		*	name: 'MyObject',
		*	kind: 'enyo.Object',
		*	hello: function() {
		*		this.log('says', 'hi');
		*		// shows in the console: MyObject.hello: says hi
		*	}
		* });
		* ```
		* @public
		*/
		log: function () {
			var acc = arguments.callee.caller,
				nom = ((acc ? acc.displayName : '') || '(instance method)') + ':';
			logging.log('log', [nom].concat(enyo.cloneArray(arguments)));
		},
		
		/**
		* Same as [log()]{@link enyo.Object#log}, except that it uses the 
		* console's [warn()]{@glossary console.warn} method (if it exists).
		*
		* @public
		*/
		warn: function () {
			log('warn', arguments);
		},
		
		/**
		* Same as [log()]{@link enyo.Object#log}, except that it uses the 
		* console's [error()]{@glossary console.error} method (if it exists).
		*
		* @public
		*/
		error: function () {
			log('error', arguments);
		},

		/**
		* Retrieves the value for the given path. The value may be retrieved as long as the given 
		* path is resolvable relative to the given {@link enyo.Object}. See
		* [enyo.getPath()]{@link enyo.getPath} for complete details.
		*
		* This method is backwards-compatible and will automatically call any existing getter
		* method that uses the "getProperty" naming convention. (Moving forward, however, Enyo code
		* should use [computed properties]{@link enyo.ComputedSupport} instead of relying on the 
		* getter naming convention.)
		*
		* @param {String} path - The path from which to retrieve a value.
		* @returns {*} The value for the given path or [undefined]{@glossary undefined} if 
		*	the path could not be completely resolved.
		* @public
		*/
		get: enyo.getPath,
		
		/**
		* Updates the value for the given path. The value may be set as long as the
		* given path is resolvable relative to the given {@link enyo.Object}. See
		* [enyo.setPath()]{@link enyo.setPath} for complete details.
		*
		* @param {String} path - The path for which to set the given value.
		* @param {*} value - The value to set.
		* @param {Object} [opts] - An options hash.
		* @returns {this} The callee for chaining.
		* @public
		*/
		set: enyo.setPath,
	
		/**
		* Binds a [callback]{@glossary callback} to this [object]{@link enyo.Object}.
		* If the object has been destroyed, the bound method will be aborted cleanly,
		* with no value returned.
		*
		* This method should generally be used instead of {@link enyo.bind} for running
		* code in the context of an instance of {@link enyo.Object} or one of its
		* [subkinds]{@glossary subkind}.
		*
		* @alias enyo.bindSafely
		* @public
		*/
		bindSafely: function (method) {
			var args = Array.prototype.concat.apply([this], arguments);
			return enyo.bindSafely.apply(enyo, args);
		},
		
		/**
		* An abstract method (primarily) that sets the [destroyed]{@link enyo.Object#destroyed} 
		* property to `true`.
		*
		* @returns {this} The callee for chaining.
		* @public
		*/
		destroy: function () {
			
			// Since JS objects are never truly destroyed (GC'd) until all references are
			// gone, we might have some delayed action on this object that needs access
			// to this flag.
			// Using this.set to make the property observable
			return this.set('destroyed', true);
		}
	});

	/**
	* @private
	*/
	enyo._objectCount = 0;

	/**
	* @private
	*/
	enyo.Object.concat = function (ctor, props) {
		var pubs = props.published,
			cpy,
			prop;
			
		if (pubs) {
			cpy = ctor.prototype || ctor;
			for (prop in pubs) {
				// need to make sure that even though a property is 'published'
				// it does not overwrite any computed properties
				if (props[prop] && typeof props[prop] == 'function') continue;
				addGetterSetter(prop, pubs[prop], cpy);
			}
		}
	};

	/**
	* This method creates a getter/setter for a published property of an {@link enyo.Object}, but is
	* deprecated. It is maintained for purposes of backwards compatibility. The preferred method is 
	* to mark public and protected (private) methods and properties using documentation or other 
	* means and rely on the [get]{@link enyo.Object#get} and [set]{@link enyo.Object#set} methods of
	* {@link enyo.Object} instances.
	*
	* @private
	*/
	function addGetterSetter (prop, value, proto) {
		
		// so we don't need to re-execute this over and over and over...
		var cap = enyo.cap(prop),
			getName = 'get' + cap,
			setName = 'set' + cap,
			getters = proto._getters || (proto._getters = {}),
			setters = proto._setters || (proto._setters = {}),
			fn;
		
		// we assign the default value from the published block to the prototype
		// so it will be initialized properly
		proto[prop] = value;
		
		// check for a supplied getter and if there isn't one we create one otherwise
		// we mark the supplied getter in the tracking object so the global getPath will
		// know about it
		if (!(fn = proto[getName]) || typeof fn != 'function') {
			fn = proto[getName] = function () {
				return enyo.getPath.fast.call(this, prop);
			};
			
			// and we mark it as generated
			fn.generated = true;
		} else if (fn && typeof fn == 'function' && !fn.generated) getters[prop] = getName;
		
		// we need to do the same thing for the setters
		if (!(fn = proto[setName]) || typeof fn != 'function') {
			fn = proto[setName] = function (val) {
				return enyo.setPath.fast.call(this, prop, val);
			};
			
			// and we mark it as generated
			fn.generated = true;
		} else if (fn && typeof fn == 'function' && !fn.generated) setters[prop] = setName;
	}

})(enyo, this);