(function (enyo) {
	
	var isString = enyo.isString
		// , isObject = enyo.isObject
		, isArray = enyo.isArray
		// , isFunction = enyo.isFunction
		// , where = enyo.where
		, remove = enyo.remove
		// , forEach = enyo.forEach
		// , indexOf = enyo.indexOf
		, clone = enyo.clone
		// , keys = enyo.keys
		// , map = enyo.map
		, nar = enyo.nar
		// , filter = enyo.filter
		, inherit = enyo.inherit
		, extend = enyo.kind.statics.extend;
		
	// var defaultConfig = {};
	var ComputedSupport;
	
	enyo.concatenated.push("computed");
	
	/**
		@private
	*/
	function getComputedValue (obj, path) {
		var cache = obj._getComputedCache(path)
			, isCached = obj._isComputedCached(path);
		
		// in the end, for efficiency and completeness in other situations
		// it is better to know the returned value of all computed properties
		// but in cases where they are set as cached we will sometimes use
		// that value
		if (cache.dirty || cache.dirty === undefined) {
			isCached && (cache.dirty = false);
			cache.previous = cache.value;
			cache.value = obj[path]();
		}
		
		return cache.value;
	}
	
	/**
		@private
	*/
	function queueComputed (obj, path) {
		var queue = obj._computedQueue || (obj._computedQueue = [])
			, deps = obj._computedDependencies[path];
			
		if (deps) for (var i=0, dep; (dep=deps[i]); ++i) {
			if (!queue.length || -1 == queue.indexOf(dep)) queue.push(dep);
		}
	}
	
	/**
		@private
	*/
	function flushComputed (obj) {
		var queue = obj._computedQueue;
		obj._computedQueue = null;
		if (queue && obj.isObserving()) for (var i=0, ln; (ln=queue[i]); ++i) {
			obj.notify(ln, obj._getComputedCache(ln).value, getComputedValue(obj, ln));
		}
	}
	
	/**
		@public
		@mixin
	*/
	ComputedSupport = enyo.ComputedSupport = {
		name: "ComputedSupport",
		
		/**
			@private
		*/
		_computedRecursion: 0,
		
		/**
			@public
			@method
		*/
		isComputed: function (path) {
			// if it exists it will be explicitly one of these cases and it is cheaper than hasOwnProperty
			return this._computed && (this._computed[path] === true || this._computed[path] === false);
		},
		
		/**
			@public
			@method
		*/
		isComputedDependency: function (path) {
			return !! (this._computedDependencies? this._computedDependencies[path]: false);
		},
		
		/**
			@private
			@method
		*/
		get: inherit(function (sup) {
			return function (path) {
				return this.isComputed(path)? getComputedValue(this, path): sup.apply(this, arguments);
			};
		}),
		
		/**
			@private
			@method
		*/
		set: inherit(function (sup) {
			return function (path) {
				// we do not accept parameters for computed properties
				return this.isComputed(path)? this: sup.apply(this, arguments);
			};
		}),
		
		/**
			@private
			@method
		*/
		notifyObservers: function () {
			return this.notify.apply(this, arguments);
		},
		
		/**
			@private
			@method
		*/
		notify: inherit(function (sup) {
			return function (path, was, is) {
				this.isComputedDependency(path) && queueComputed(this, path);
				this._computedRecursion++;
				sup.apply(this, arguments);
				this._computedRecursion--;
				this._computedQueue && this._computedRecursion === 0 && flushComputed(this);
				return this;
			};
		}),
		
		/**
			@private
			@method
		*/
		_isComputedCached: function (path) {
			return this._computed[path];
		},
		
		/**
			@private
			@method
		*/
		_getComputedCache: function (path) {
			var cache = this._computedCache || (this._computedCache = {});
			return cache[path] || (cache[path] = {});
		}
	};
	

	/**
		Hijack the original so we can add additional default behavior.
	*/
	var sup = enyo.concatHandler;

	// @NOTE: It seems like a lot of work but it really won't happen that much and the more
	// we push to kind-time the better for initialization time
	enyo.concatHandler = function (ctor, props) {
	
		sup.call(this, ctor, props);
	
		// only matters if there are computed properties to manage
		if (props.computed) {
			
			var proto = ctor.prototype || ctor
				, computed = proto._computed? Object.create(proto._computed): {}
				, dependencies = proto._computedDependencies? Object.create(proto._computedDependencies): {};
			
			// if it hasn't already been applied we need to ensure that the prototype will
			// actually have the computed support mixin present, it will not apply it more
			// than once to the prototype
			extend(ComputedSupport, proto);
		
			// @NOTE: This is the handling of the original syntax provided for computed properties in 2.3.ish...
			// All we do here is convert it to a structure that can be used for the other scenario and preferred
			// computed declarations format
			if (!isArray(props.computed)) {
				(function () {
					var tmp = [], deps, name, conf;
					// here is the slow iteration over the properties...
					for (name in props.computed) {
						// points to the dependencies of the computed method
						deps = props.computed[name];
						conf = deps && deps.find(function (ln) {
							// we deliberately remove the entry here and forcibly return true to break
							return typeof ln == "object"? (remove(deps, ln) || true): false;
						});
						// create a single entry now for the method/computed with all dependencies
						tmp.push({method: name, path: deps, cached: conf? conf.cached: null});
					}
					
					// note that we only do this one so even for a mixin that is evaluated several
					// times this would only happen once
					props.computed = tmp;
				}());
			}
			
			var addDependency = function (path, dep) {
				// its really an inverse look at the original
				var deps;
				
				if (dependencies[path] && !dependencies.hasOwnProperty(path)) dependencies[path] = dependencies.path.slice();
				deps = dependencies[path] || (dependencies[path] = []);
				deps.push(dep);
			};
			
			// now we handle the new computed properties the way we intended to
			for (var i=0, ln; (ln=props.computed[i]); ++i) {
				// if the entry already exists we are merely updating whether or not it is
				// now cached
				computed[ln.method] = !! ln.cached;
				// we must now look to add an entry for any given dependencies and map them
				// back to the computed property they will trigger
				if (isArray(ln.path)) ln.path.forEach(function (dep) { addDependency(dep, ln.method); });
				else if (ln.path) addDependency(ln.path, ln.method);
			}
			
			// arg, free the key from the properties so it won't be applied later...
			// delete props.computed;
			// make sure to reassign the correct items to the prototype
			proto._computed = computed;
			proto._computedDependencies = dependencies;
		}
	};
	
})(enyo);