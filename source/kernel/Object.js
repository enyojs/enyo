/**
	@namespace enyo
*/
(function (enyo, scope) {
	
	var kind = enyo.kind
		, getPath = enyo.getPath
		, setPath = enyo.setPath;
	
	var MixinSupport = enyo.MixinSupport
		, ObserverSupport = enyo.ObserverSupport
		, BindingSupport = enyo.BindingSupport;

	/**
		{@link enyo.Object} lies at the heart of the Enyo framework's implementations of
		property publishing, computed properties (via the {@link enyo.ComputedSupport} mixin, and
		data binding via the {@link enyo.BindingSupport} mixin and {@link enyo.Binding} object.
		It also provides several utility functions for its subkinds.
	
		@class enyo.Object
		@mixes enyo.MixinSupport
		@mixes enyo.ObseverSupport
		@mixes enyo.BindingSupport
	*/
	kind(
		/** @lends enyo.Object.prototype */ {
		
		/**
			This defines the kind such that it can be retrieved or inherited from.
		
			@public
			@type {String}
			@readonly
		*/
		name: 'enyo.Object',
		
		/**
			@private
		*/
		kind: null,
		
		/**
			@private
		*/
		noDefer: true,
		
		/**
			If the {@link enyo.Object#destroy destroy} method has been called this property will be `true`,
			otherwise `false`.
			
			@public
			@type {Boolean}
		*/
		destroyed: false,
		
		/**
			An array of strings representing mixins to be applied to this kind at the end of the constructor
			routine. This array is concatenated so sub-kinds can include their own additional {@link mixins}.
			
			@public
			@type {Array}
		*/
		mixins: [
			MixinSupport,
			ObserverSupport,
			BindingSupport
		],
		
		/**
			@private
		*/
		constructor: function(props) {
			enyo._objectCount++;
			this.importProps(props);
		},
		
		/**
			Import the values from the given object. Automatically called from the {@link enyo.Object#constructor constructor}.
		
			@public
			@method
			@param {Object} [props] If provided, the object from which to retrieve keys/values to mix-in.
			@returns {this} The callee for chaining.
		*/
		importProps: function (props) {
			if (props) {
				var key;
				enyo.concatHandler(this, props);
				// if props is a default hash this is significantly faster than
				// requiring the hasOwnProperty check every time
				if (!props.kindName) for (key in props) enyo.concatenated.indexOf(key) === -1 && (this[key] = props[key]);
				else for (key in props) enyo.concatenated.indexOf(key) === -1 && props.hasOwnProperty(key) && (this[key] = props[key]);
			}
			
			return this;
		},
		
		/**
			Call the {@link enyo.Object#destroy destroy} method for the named {@link enyo.Object} property.
		
			@public
			@method
			@param {String} name The name of the property to destroy if possible.
			@returns {this} The callee for chaining.
		*/
		destroyObject: function(name) {
			if (this[name] && this[name].destroy) {
				this[name].destroy();
			}
			this[name] = null;
			
			return this;
		},
		
		/**
			Sends a log message to the console, prepended with the name of the kind
			and method from which _log_ was invoked.  Multiple arguments are coerced
			to String and joined with spaces.
			
			@example
				enyo.kind({
					name: 'MyObject',
					kind: 'enyo.Object',
					hello: function() {
						this.log('says', 'hi');
						// shows in the console: MyObject.hello: says hi
					}
				});
		
			@public
			@method
		*/
		log: function() {
			var acc = arguments.callee.caller;
			var nom = ((acc ? acc.displayName : '') || '(instance method)') + ':';
			enyo.logging.log('log', [nom].concat(enyo.cloneArray(arguments)));
		},
		
		/**
			Same as {@link enyo.Object#log log} except that it uses the console's warn method (if it exists).
		
			@public
			@method
		*/
		warn: function() {
			this._log('warn', arguments);
		},
		
		/**
			Same as {@link enyo.Object#log log} except that it uses the console's error method (if it exists).
			
			@public
			@method
		*/
		error: function() {
			this._log('error', arguments);
		},
		
		/**
			@private
		*/
		_log: function(inMethod, inArgs) {
			if (enyo.logging.shouldLog(inMethod)) {
				try {
					throw new Error();
				} catch(x) {
					enyo.logging._log(inMethod, [inArgs.callee.caller.displayName + ': '].concat(enyo.cloneArray(inArgs)));
					enyo.log(x.stack);
				}
			}
		},

		/**
			Retrieves the value for the given path. The value can be retrieved as long as the
			given path is resolvable relative to the given {@link enyo.Object}. See {@link enyo.getPath}
			for complete details.

			This method is backwards-compatible and will automatically call any
			existing _getter_ method that uses the getProperty naming convention.
			(Moving forward, however, Enyo code should use computed properties
			instead of relying on the getter naming convention.)
		
			@public
			@method
			@param {String} path The path from which to retrieve a value.
			@returns {*} The value for the given path or `undefined` if the path could not be
				completely resolved.
		*/
		get: getPath,
		
		/**
			Updates the value for the given path. The value can be set as long as the
			given path is resolvable relative to the given {@link enyo.Object}. See {@link enyo.setPath}
			for complete details.
		
			@public
			@method
			@param {String} path The path for which to set the given value.
			@param {*} is The value to set.
			@param {Object} [opts] An options hash.
			@returns {this} The callee for chaining.
		*/
		set: setPath,
	
		/**
			Binds a callback to this object. If the object has been destroyed, the
			bound method will be aborted cleanly with no value returned.

			This method should generally be used instead of `enyo.bind` for running
			code in the context of an instance of _enyo.Object_ or one of its
			subkinds.
		
			@public
			@method
			@alias enyo.bindSafely
		*/
		bindSafely: function(method/*, bound arguments*/) {
			var args = Array.prototype.concat.apply([this], arguments);
			return enyo.bindSafely.apply(enyo, args);
		},
		
		/**
			An abstract method (primarily) that sets the {@link enyo.Object#destroyed destroyed} property  to `true`.
		
			@public
			@method
			@returns {this} The callee for chaining.
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
		@private
	*/
	enyo._objectCount = 0;

	/**
		@private
	*/
	enyo.Object.concat = function (ctor, props) {
		var pp = props.published;
		if (pp) {
			var cp = ctor.prototype || ctor;
			for (var n in pp) {
				// need to make sure that even though a property is 'published'
				// it does not overwrite any computed properties
				if (props[n] && enyo.isFunction(props[n])) { continue; }
				enyo.Object.addGetterSetter(n, pp[n], cp);
			}
		}
	};

	/**
		This method creates a getter/setter for a published property of
		an _enyo.Object_, but is deprecated. It is maintained for purposes
		of backwards compatability. The preferred method is to mark public
		and protected (private) methods and properties using documentation or
		other means and rely on the _get_ and _set_ methods of _enyo.Object_
		instances.
	
		@private
	*/
	enyo.Object.addGetterSetter = function (prop, value, proto) {
		var p   = enyo.cap(prop),
			gfx = enyo.getPath.fast,
			sfx = enyo.setPath.fast,
			s   = 'set' + p,
			g   = 'get' + p,
			gs  = (proto._getters || (proto._getters = {})),
			ss  = (proto._setters || (proto._setters = {})), fn;
		proto[prop] = value;
		// if there isn't already a getter we create one using the
		// fast track getter
		if (!(fn = proto[g]) || !enyo.isFunction(fn)) {
			fn = proto[g] = function () { return gfx.call(this, prop); };
			fn.generated = true;
		} else if (fn && 'function' == typeof fn && !fn.generated) { gs[prop] = g; }
		// if there isn't already a setter we create one using the
		// fast track setter
		if (!(fn = proto[s]) || !enyo.isFunction(fn)) {
			fn = proto[s] = function (v) { return sfx.call(this, prop, v); };
			fn.generated = true;
		} else if (fn && 'function' == typeof fn && !fn.generated) { ss[prop] = s; }
	};

})(enyo, this);