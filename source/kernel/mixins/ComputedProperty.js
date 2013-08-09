(function (enyo) {

	//*@public
	/**
		The possible/configurable options that may be passed in
		one or more hashes to the computed method when wrapping a
		function as a computed property of an object.
	*/
	var defaults = {

		//*@public
		/**
			If a computed property is marked as volatile, it will
			be executed on every request regardless of its dependencies.
			If both _volatile_ and _cached_ are set to true, the property
			is treated as _cached_, and _volatile_ is ignored.
		*/
		'volatile': true,

		//*@public
		/**
			If a computed property is marked as cached, its value will be
			computed once and then reused, unless one of its dependencies
			has been flagged as being changed prior to the request. If
			there are no dependencies, the value will only ever be computed
			once.

			If this setting is true, it overrides	the value of the _volatile_
			property.
		*/
		cached: false,

		//*@public
		/**
			Most cacheable computed properties will not need to be evaluated
			until the first time their values are requested; however, you can
			force evaluation immediately after the associated object is
			instantiated by setting this flag to false.
		*/
		defer: true,

		//*@protected
		value: null,

		//*@protected
		dirty: 0
	};

	//*@public
	/**
		Wrapping a class method in _enyo.computed_ allows the method to be
		interpreted as a static property, bindable by an instance of
		_enyo.Binding_. The call to _enyo.computed_ accepts a configuration
		hash as an optional parameter, as well as any number of string
		parameters that will be evaluated as dependencies of the property.

		Notifications of changes to any of the dependencies will cause the
		computed property to be flagged as needing reevaluation the next
		time it is requested (if it is cached).

		Computed properties are _volatile_ by default and will be evaluated
		on each request unless marked otherwise.
	*/
	enyo.computed = function (fn /*, arguments */) {
		var deps = enyo.toArray(arguments).slice(1);
		var config;
		var properties;
		if (!enyo.exists(fn) || "function" !== typeof fn) {
			throw "enyo.computed: a computed property must be a function";
		}
		properties = fn.properties || (fn.properties = []);
		config = fn.config || enyo.clone(defaults);
		enyo.forEach(deps, function (dep) {
			if ("string" === typeof dep) {
				properties.push(dep);
			}
			else if ("object" === typeof dep) {
				// the assumption here is it must be a configuration
				// hash
				enyo.mixin(config, dep);
			}
		});
		if (false === config['volatile']) {
			config.cached = true;
		}
		else if (true === config.cached) {
			config['volatile'] = false;
		}
		fn.config = config;
		fn._isProperty = true;
		config.properties = properties;
		return fn;
	};

	//*@protected
	var _isComputed = function (fn) {
		return fn && "function" === typeof fn && true === fn._isProperty;
	};

	//*@protected
	var _addDependent = function (proto, property, dependent) {
		var $map = proto._computedMap;
		if (!$map[dependent]) {
			$map[dependent] = [];
		}
		$map[dependent].push(property);
	};

	//*@protected
	var _addCacheable = function (proto, property) {
		var $cacheable = proto._computedCacheable;
		$cacheable.push(property);
	};

	//*@protected
	/**
		Adds an entry in the computed properties hash of the object so that
		it can be referenced easily later on. Also adds an entry for the
		property name of the computed property for each of its dependent
		properties, so that when they are mapped, the appropriate update
		can be triggered.
	*/
	var _addComputed = function (proto, property, fn) {
		var $computed = proto._computed;
		// TODO: this is assuming the desirable end is to override
		// any previous entry for a newer entry of the same property
		// name
		var $config = $computed[property] = enyo.clone(fn.config);
		// if the property is configured as cacheable and not deferred
		// we add it to a special object to speed up initialization
		if ($config.cached && !$config.defer) {
			_addCacheable(proto, property);
		}
		// for every dependency we need to add it to the object
		enyo.forEach(fn.properties, function (dep) {
			_addDependent(proto, property, dep);
		});
	};

	//*@protected
	var _findComputed = function (proto, props, kind) {
		// no need to bother if this does not support computed properties
		if (!proto._supportsComputed) {
			return;
		}
		// otherwise we know it does and we need to make sure it has some
		// intial storage properties
		proto._computed = kind? enyo.clone(proto._computed || {}): proto._computed || {};
		proto._computedMap = kind? enyo.clone(proto._computedMap || {}) : proto._computedMap || {};
		proto._computedCacheable = kind? enyo.clone(proto._computedCacheable || []): proto._computedCacheable || [];
		// now we iterate over only the properties defined on this new
		// kind definition (or ones being added by a mixin) and check to
		// see if they are computed properties so we only have to do this
		// once and not at instance initialization time
		for (var prop in props) {
			if (props[prop] && _isComputed(props[prop])) {
				_addComputed(proto, prop, props[prop]);
			}
		}
	};

	//*@protected
	/**
		Called by the overloaded getter for objects using the mixin support
		feature; the object provides the context for the call.
	*/
	var _getComputed = function (path) {
		// we grab the current configuration for the computed property
		var $config = this._computed[path];
		// and a reference to the method in case we need it
		var fn = this[path];
		// the fast track is for computed properties that are volatile
		// and do not cache we simply execute them and return the value
		if (true === $config['volatile']) {
			return fn.call(this);
		} else if (true === $config.cached) {
			if ($config.dirty || $config.defer) {
				$config.dirty = 0;
				$config.value = fn.call(this);
				$config.defer = null;
				return $config.value;
			} else {
				return $config.value;
			}
		}
	};

	//*@protected
	/**
		We pass the requested value into the computed property, which
		may or may not handle the value.
	*/
	var _setComputed = function (path, value) {
		// and a reference to the method because we will need it
		var fn = this[path];
		var prev = this.get(path);
		// we merely execute the computed property and pass it the
		// value, if it was capable of setting the value it will
		// handle it otherwise it will recompute
		fn.call(this, value);
		// mark it as dirty and push it to the queue
		_updateComputed.call(this, path, prev, value);
		// flush the queue immediately
		_flushQueue.call(this);
	};

	//*@protected
	var _updateComputed = function (prop, prev, value) {
		var $computed = this._computed;
		var $config = $computed[prop];
		if ($config) {
			// TODO: while not every computed property is cached
			// we have to check for it anyways and rather than
			// cause greater overhead to test whether or not it
			// is cachable and needs updating just do this as it
			// should be harmless otherwise
			++$config.dirty;
			this._computedQueue.push([prop, prev || $config.value, value]);
		}
	};

	//*@protected
	var _flushQueue = function () {
		var $queue = this._computedQueue;
		var values;
		if (!$queue.length) {
			return;
		}
		do {
			values = $queue.shift();
			if (!values[2]) {
				values[2] = _getComputed.call(this, values[0]);
			}
			this.notifyObservers.apply(this, values);
		} while ($queue.length);
	};

	//*@protected
	/**
		Called on every object, this method simply detects whether the
		object supports computed properties; if it does, we execute any
		cacheables that don't have _defer_ set to true.
	*/
	var _postConstructor = function () {
		if (!this._supportsComputed) {
			return;
		}
		// look for the special property created by the feature hook
		// for any cacheable non-deferred computed properties if
		// the kind even supports computed properties
		var $computed = this._computedCacheable;
		var prop;
		var idx;
		var len;
		// for each property that needs updating we arbitrarily flag
		// it as dirty and force it to be evaluated and cached
		for (idx = 0, len = $computed.length; idx < len; ++idx) {
			prop = $computed[idx];
			// mark it as dirty so it will actually be executed
			_updateComputed.call(this, prop);
			// evaluate the cacheable method
			_getComputed.call(this, prop);
		}
	};

	//*@protected
	/**
		Strictly for internal use, as the assumption is the structure of
		these protected properties will be safe and this method is not
		exposed. It should only ever be executed before the computation
		of any cacheable values.
	*/
	var _computedClone = function ($computed, recursing) {
		var copy = {};
		var prop;
		for (prop in $computed) {
			if (!$computed.hasOwnProperty(prop)) {
				continue;
			}
			if ("object" === typeof $computed[prop]	&& null !== $computed[prop]	&& !recursing) {
				copy[prop] = _computedClone($computed[prop], true);
			}
			else {
				copy[prop] = $computed[prop];
			}
		}
		return copy;
	};

	//*@protected
	/**
		Hooks the kind features to automate handling of computations when
		the kind is created.
	*/
	enyo.kind.features.push(function (ctor, props) {
		_findComputed(ctor.prototype, props, true);
	});

	//*@protected
	/**
		Hooks the kind post-initialization routines to make sure we can
		do setup for our cached computed properties that need it.
	*/
	enyo.kind.postConstructors.push(_postConstructor);

	//*@protected
	/**
		Adds a special handler for mixins to be aware of computed properties.
	*/
	enyo.mixins.features.push(_findComputed);

	//*@protected
	enyo.createMixin({

		// ...........................
		// PUBLIC PROPERTIES

		//*@public
		name: "enyo.ComputedSupport",

		// ...........................
		// PROTECTED PROPERTIES

		//*@protected
		_supportsComputed: true,

		// ...........................
		// COMPUTED PROPERTIES

		// ...........................
		// PUBLIC METHODS

		//*@public
		/**
			Overloads the getter so that it can retrieve computed
			property values properly.
		*/
		get: function (path) {
			if (_isComputed(this[path])) {
				return _getComputed.call(this, path);
			} else {
				return this.inherited(arguments);
			}
		},

		//*@public
		/**
			Overloads the setter so that it can attempt to call the
			computed property with the specified parameters. If it doesn't
			accept passed-in parameters, it may do nothing.
		*/
		set: function (path, value) {
			if (_isComputed(this[path])) {
				return _setComputed.call(this, path, value);
			} else {
				return this.inherited(arguments);
			}
		},

		//*@public
		/**
			Overloads the observer support method to hook when notifications
			are sent, so we can handle them the way we need to for computed
			properties.
		*/
		notifyObservers: function (prop, prev, value) {
			// any of the possible notifications we want to map
			// to computed property (by name)
			var $map = this._computedMap;
			var len;
			var idx;
			if ($map[prop]) {
				len = $map[prop].length;
				idx = 0;
				// iterate over each of the dependent properties
				// and mark them as dirty note that the update method
				// will queue the property to notify its own listeners
				// of its state change
				for (; idx < len; ++idx) {
					_updateComputed.call(this, $map[prop][idx]);
				}
			}
			this.inherited(arguments);
			// if there was anything queued lets flush it now
			_flushQueue.call(this);
		},

		// ...........................
		// PROTECTED METHODS

		//*@protected
		_constructor: function () {
			// we need to make sure that we have unique property hashes
			// for each computed property (something we cannot do when
			// applying them to prototypes)
			this._computed = _computedClone(this._computed);
			this._computedQueue = [];
			return this.inherited(arguments);
		},

		//*@protected
		destroy: function () {
			var $computed = this._computed;
			var $config;
			var prop;
			for (prop in $computed) {
				$config = $computed[prop];
				// make sure to fully release any reference this
				// might be holding onto
				delete $config.value;
				// release the entire object when we're done
				delete $computed[prop];
			}
		}

		// ...........................
		// OBSERVERS

	});

})(enyo);
