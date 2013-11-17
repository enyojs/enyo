(function (enyo) {

	//*@protected
	// this is called when we need an instance-specific computed table so
	// runtime modifications are unique to the instance and not the kind, also
	// note that once the kind is instanced modifications to the _computed_
	// block will not be registered
	var _instanceMap = function(obj, prop) {
		if (!obj.hasOwnProperty(prop)) {
			obj[prop] = obj[prop]? enyo.clone(obj[prop]): {};
		}
		return obj[prop];
	};
	//*@public
	/**
		Computed properties are methods of kinds that are designated as being
		dependent upon multiple properties--much like observers, except that
		they themselves are treated as properties (not functions). An
		_enyo.Binding_ cannot be bound to a function directly, but it can be
		bound to a computed property.

		Computed properties have the advantage of being cacheable (meaning that many
		requests for the property won't require pointless recalculations) and will
		notify observers when any of their own dependencies change. Computed
		properties may be called directly, and will accept parameters just like other
		functions, but be aware	that you cannot call any setter method for a
		computed property. Also note that for any observers of a computed property,
		there will never be a _previous_ value unless it is cached.

		Just as with [ObserverSupport](#enyo/source/kernel/mixins/ObserverSupport.js),
		you can specify that a method is a computed property by including it within a
		_computed_ block.

			enyo.kind({
				name: "Sample",
				computed: {
					mood: ["expression", "posture", "volume", {cached: true}],
					maxHours: []
				}
			})

		Another feature of computed properties is the ability to add configurable
		options. Options are found in the computed property's array of dependencies.
		Look at the defaults for options of computed properties to see what options
		are available.
	*/
	enyo.ComputedSupport = {
		name: "ComputedSupport",
		/**
			Used to identify computed methods and their dependencies (if any):
			`computed`
		*/
		//*@protected
		get: enyo.inherit(function (sup) {
			return function (path) {
				if (this._isComputed(path)) {
					return this._getComputed(path);
				}
				return sup.apply(this, arguments);
			};
		}),
		set: enyo.inherit(function (sup) {
			return function (path, value) {
				if (this._isComputed(path)) {
					// there is no support for setting a value for a computed
					// property but this will protected it from getting "obliterated"
					return this;
				}
				return sup.apply(this, arguments);
			};
		}),
		/**
			We hook notifyObservers to determine if the current property is
			a dependency that would trigger an update to a computed property.
			Keep in mind that we do so knowing that multiple properties could
			trigger an update to the same computed property synchronously before
			it has the opportunity to flush the queue, so we will be mindful to
			never allow the same computed property into the queue more than once.
		*/
		notifyObservers: enyo.inherit(function (sup) {
			return function (path, prev, value) {
				var ma = _instanceMap(this, "computedMap"), n;
				if (ma && (n = ma[path])) {
					if (typeof n == "string") {
						n = ma[path] = enyo.trim(n).split(" ");
					}
					for (var i=0, p; (p=n[i]); ++i) {
						// this is a dependency of one of our computed properties
						// so we will flag it as being dirty and queue the notification
						// for any of its dependents, we blow away any other entry for
						// this property already in the queue always setting the _value_
						// in the queue to the known previous value if it was cached or null
						this._markComputed(p);
					}
					// continue with normal notification handling
					sup.apply(this, arguments);
					// now we flush the queue, knowing this could have been recursively
					// executed
					this._flushComputedQueue();
				} else {
					// carry on
					sup.apply(this, arguments);
				}
			};
		}),
		_getComputed: function (path) {
			var ca = _instanceMap(this, "computedCached"), c;
			if ((c = ca[path])) {
				if (typeof c != "object") {
					c = ca[path] = {};
					c.dirty = true;
				}
				// if the cache says the computed property is dirty,
				// we have to fetch a current value
				if (c.dirty) {
					c.value = this[path]();
					c.dirty = false;
				}
				// return the value whether it was cached or
				// the most recent
				return c.value;
			}
			// if it is not a cacheable computed property, we
			// have to execute it to get the current value
			return this[path]();
		},
		/**
			If the property is a cached computed property, we update it
			as dirty, and then place it in the queue. The same method, if
			it is already in the queue, will be blown away so that it will never
			be entered more than once.
		*/
		_markComputed: function (path) {
			var ca = _instanceMap(this, "computedCached"),
				q = this.computedQueue || (this.computedQueue = {}),
				p = null, c;
			if ((c = ca[path])) {
				if (typeof c != "object") {
					c = ca[path] = {};
				}
				// it is cached so we mark it as dirty and use its previous
				// known value as the value entered in the queue
				p = c.value;
				c.dirty = true;
			}
			q[path] = p;
		},
		_isComputed: function (path) {
			var c = _instanceMap(this, "computed");
			return (c && c[path] !== undefined && c[path] !== null);
		},
		_flushComputedQueue: function () {
			if (!this.computedQueue || !this.observerNotificationsEnabled) { return; }
			// forced to throw away old queue object so we don't accidentally
			// use incorrect values later
			// also for immutability of the queue we are forced to clone it
			// since the operation is synchronous and recursive
			var q = this.computedQueue;
			this.computedQueue = {};
			for (var k in q) {
				// where q[k] is the previous value or null and we retrieve (once) the most
				// recent value of the computed property if it was cached this will reset the
				// dirty flag to false
				this.notifyObservers(k, q[k], this._getComputed(k));
			}
		}
		/**
			Meta-properties used:
			`computedMap`
			`computedQueue`
			`computedCached`
		*/
	};
	//*@protected
	var fn = enyo.concatHandler;
	enyo.concatHandler = function (ctor, props) {
		// call the original
		fn.apply(this, arguments);
		// now we have to ensure we properly maintain the computed properties
		// for any kind but we want to do the least amount of work possible
		if (props.computed) {
			var p = ctor.prototype || ctor;
			if (!p.computed) {
				p.computed = {};
				p.computedCached = {};
				p.computedMap = {};
			} else {
				p.computed = enyo.clone(p.computed);
				p.computedCached = enyo.clone(p.computedCached);
				p.computedMap = enyo.clone(p.computedMap);
			}
			for (var k in props.computed) {
				p.computed[k] = (p.computed[k] || "");
				var ss = (typeof props.computed[k] == "string"? enyo.trim(props.computed[k]).split(" "): props.computed[k]);
				for (var i=0, s; (s=ss[i]); ++i) {
					if (typeof s == "object" && s.cached) {
						p.computedCached[k] = true;
					} else {
						if (!~p.computed[k].indexOf(s)) {
							p.computed[k] += (" " + s);
							p.computedMap[s] = enyo.trim((p.computedMap[s] || "") + " " + k).replace(/\s+/g, " ");
						}
					}
				}
				p.computed[k] = enyo.trim(p.computed[k]).replace(/\s+/g, " ");
			}
			delete props.computed;
		}
	};

})(enyo);
