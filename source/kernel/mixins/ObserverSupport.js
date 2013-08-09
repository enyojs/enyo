(function (enyo) {
	
	//*@protected
	// ensure observers will be handled by the concatenation handler
	enyo.concat.push("observers");
	/**
		Used because when cloning objects with arrays we need to also
		clone the arrays.
	*/
	var _clone = function (obj) {
		var c = {};
		for (var k in obj) {
			if (enyo.isArray(obj[k])) {
				c[k] = enyo.cloneArray(obj[k]);
			} else {
				c[k] = obj[k];
			}
		}
		return c;
	};
	//*@public
	/**
		Observers are methods that respond to changes in specific properties
		of an object. Any method on a _kind_ can be an _observer_ and it can
		be an _observer_ for multiple properties. Each time a dependent property
		is modified via the `set` or `get` method of the kind with the _observer_
		that method will be executed. The first parameter will be the previous value of
		the property (when possible) followed by the current value of the modified
		property (when possible) and finally the name of the property that changed
		and forced the notification (this will be redundant if only one property
		was a dependency).

		To add a method as an observer for a property simply create or add to an
		existing `observers` block for the kind with the name of the method as the
		key and the value being the name of the property it should respond to. If
		the method should respond to multiple events the value should be an array
		of those property names.

		Note that if you call `set` or have a published property and call its
		_setter_ method and have a method of the form _propertyChanged_ the changed
		method will automatically be called and the entry does not need to be made
		in the `observers` block. It is harmless if you name it explicitly.

		enyo.kind({
			name: "Sample",
			observers: {
				nameChanged: ["firstName", "lastName"],
				moodChanged: ["expression", "posture", "volume"]
			},
			nameChanged: function (previous, current, property) {
				// handle the change notification
			},
			moodChanged: function (previous, current, property) {
				// handle the change notification
			}
		})

		The following methods and properties are used by the public API for
		_ObserverSupport_ in _enyo.Object_ and all of its subkinds.
	*/
	enyo.ObserverSupport = {
		/**
			Registers an observer for the passed-in property, returning a
			reference to the handler function being registered, so that it
			can be stored (and, later, removed). In addition to the property
			that should trigger the observer/handler when changed, this
			method accepts an optional context, under which the handler
			function will be executed when triggered.

			An observer may be added for any property of the object, but an
			observer may not be added for the same event more than once.
		*/
		addObserver: function (prop, fn, ctx) {
			var id = enyo.uid("__observer__"),
				map = this._observerMap;
			if (map[prop]) {
				if (!enyo.isArray(map[prop])) {
					map[prop] = [map[prop]];
				}
				map[prop].push(id);
			} else {
				map[prop] = id;
			}
			this[id] = ctx? enyo.bind(ctx, fn): fn;
			this[id].observer = true;
			return this[id];
		},
		/**
			Attempts to remove the given listener/observer for the given property,
			if it exists. If no function is supplied, all listeners for the given
			property will be removed.

			Typically, this method will not be called directly.
		*/
		removeObserver: function (prop, fn) {
			var map = this._observerMap,
				en = map[prop];
			if (en) {
				if (enyo.isArray(en)) {
					var i = enyo.indexOf(fn, en);
					if (!~i) {
						en.splice(i, 1);
					}
				} else {
					if (en === fn) {
						delete map[prop];
						if (en.observer) {
							delete this[prop];
						}
					}
				}
			}
		},
		/**
			Convenience method to remove all observers on all properties.
			Returns a reference to this object for chaining.

			This will almost never need to be called by anything other than
			the _destroy_ method.
		*/
		removeAllObservers: function () {
			var map = this._observerMap;
			if (map) {
				for (var k in map) {
					if (enyo.isArray(map[k])) {
						for (var i=0, o; (o=map[k]); ++i) {
							this.removeObserver(k, o);
						}
					} else {
						this.removeObserver(k, map[k]);
					}
				}
			}
			return this;
		},
		/**
			Notifies any observers for a given property. Accepts the previous
			value and the current value as parameters. Looks for a
			backwards-compatible function of the _propertyChanged_ form and will
			call that, if it exists, while also notifying other observers.
		*/
		notifyObservers: function (prop, prev, value) {
			var map = this._observerMap,
				en = map[prop],
				ch = prop + "Changed",
				a = this._allowNotifications, fn;
			if (en) {
				if (enyo.isArray(en)) {
					for (var i=0; (fn=en[i]); ++i) {
						if (!a) {
							this.addNotificationToQueue(prop, fn, [prev, value, prop]);
						} else {
							fn.call(this, prev, value, prop);
						}
					}
				} else {
					if (!a) {
						this.addNotificationToQueue(prop, en, [prev, value, prop]);
					} else {
						en.call(this, prev, value, prop);
					}
				}
			}
			// now check for the backwards compatible changed handler
			fn = this[ch];
			if (fn && enyo.isFunction(fn)) {
				if (!a) {
					this.addNotificationToQueue(prop, fn, [prev, value, prop]);
				} else {
					fn.call(this, prev, value, prop);
				}
			}
			return this;
		},
		/**
			Prevents all notifications on this object from firing. Does not
			clear or flush the queue. Any new notifications fired while
			notifications are disabled will be added to the queue, which may be
			arbitrarily flushed or cleared when ready. To disable the queue, pass
			a boolean true as the second argument. Note that disabling the queue
			will immediately clear (but not flush) the queue.

			Also increments an internal counter that requires the
			_startNotifications_ method to be called an equal number of times
			before notifications will be enabled again. The queue cannot be
			flushed until the counter reaches 0.
		*/
		stopNotifications: function (disableQueue) {
			this._allowNotifications = false;
			this._stopCount += 1;
			if (disableQueue) {
				this.disableNotificationQueue();
			}
		},
		/**
			Enables notifications for this object and immediately flushes the
			notification queue if the internal counter is 0. Has no effect if
			notifications are already enabled; otherwise, decrements the
			internal counter. If the counter reaches 0, will allow
			notifications and attempt to flush the queue (if there is one and
			it is enabled).

			This method must be called once for each time the _stopNotifications_
			method was called. Passing a boolean true as the second parameter
			will reenable the notification queue if it was disabled.
		*/
		startNotifications: function (enableQueue) {
			if (this._stopCount !== 0) {
				this._stopCount -= 1;
			}
			if (this._stopCount === 0) {
				this._allowNotifications = true;
				this.flushNotifications();
			}
			if (enableQueue) {
				this.enableNotificationQueue();
			}
		},
		/**
			Enables the notification queue. Has no effect if the queue is already
			enabled. If notifications are currently enabled, this method will have
			no effect until they are disabled.
		*/
		enableNotificationQueue: function () {
			this._allowNotificationQueue = true;
		},
		/**
			Disables the notification queue. Has no effect if the queue is
			already disabled, or if notifications are currently enabled. If
			notifications are disabled, future notifications will not be queued
			and any items in the queue will be cleared (not flushed).
		*/
		disableNotificationQueue: function () {
			this._allowNotificationQueue = false;
			this._notificationQueue = {};
		},
		//*@protected
		/**
			Used internally when a notification is queued
		*/
		addNotificationToQueue: function (prop, fn, params) {
			if (this._allowNotificationQueue) {
				var q = this._notificationQueue,
					en = q[prop];
				params || (params = []);
				if (!en) {
					q[prop] = [params, fn];
				} else {
					en.splice(0, 1, params);
					if (enyo.indexOf(fn, en) < 0) {
						en.push(fn);
					}
				}
			}
		},
		/**
			Used internally; flushes any notifications that have been queued.
		*/
		flushNotifications: function () {
			var q = this._notificationQueue, fn, p, en, ps, tmp = [];
			if (!q || !this._allowNotificationQueue || 0 !== this._stopCount) {
				return;
			}
			for (p in q) {
				en = q[p];
				ps = enyo.isFunction(en[0])? tmp: en.shift();
				for (var i=0, fn; (fn=en[i]); ++i) {
					fn.apply(this, ps);
				} 
				q[p] = null;
			}
		},
		constructor: enyo.super(function (sup) {
			return function () {
				// we need an instance-specific observer table so runtime modifications
				// are unique to the instance and not the kind, also note that once the
				// kind is instanced modifications to the _observers_ block will not be
				// registered they will have to be added via the addObserver method with
				// an anonymous function
				this._observerMap = this._observerMap? _clone(this._observerMap): {};
				this._notificationQueue = {};
				return sup.apply(this, arguments);
			};
		}),
		destroy: enyo.super(function (sup) {
			return function () {
				this.removeAllObservers();
				sup.apply(this, arguments);
			};
		}
		_stopCount: 0,
		_notificationQueue: null,
		_allowNotifications: true,
		_allowNotificationQueue: true,
	};
	/**
		This method use used when handling concatenated properties.
	*/
	enyo.observersConcat = function (proto, props) {
		if (props.observers) {
			var po, ro, k, map, a, i, dep;
			// unfortunately there are 2 steps here but its all for the better
			// good in terms of overall performance, we take this hit once per kind
			// call and only if there are any observers to mess with anyways
			// first step is to maintain the user-friendly observer declarations
			if (!proto.observers) {
				proto.observers = props.observers;
			} else {
				po = _clone(proto.observers),
				ro = props.observers;
				for (k in ro) {
					if (po[k]) {
						if (!enyo.isArray(po[k])) {
							po[k] = [po[k]];
						}
						if (enyo.isArray(ro[k])) {
							po[k] = enyo.merge(po[k], ro[k]);
						} else {
							po[k].push(ro[k]);
						}
					} else {
						po[k] = ro[k];
					}
				}
				proto.observers = po;
			}
			// second step is to maintain the implementation-friendly mapping
			// of dependencies to their respective handlers so that we don't spend
			// runtime always trying to determine who handles what and the lookup
			// penalty is very small
			if (proto.observers) {
				map = proto._observerMap? _clone(proto._observerMap): {};
				po = proto.observers;
				for (k in po) {
					a = po[k];
					if (enyo.isArray(a)) {
						for (i=0; (dep=a[i]); ++i) {
							if (map[dep]) {
								if (!enyo.isArray(map[dep])) {
									map[dep] = [map[dep]];
								}
								// ensure we only have unique entries so we don't accidently
								// notify the same handler more than once
								map[dep] = enyo.merge(map[dep].push(k));
							} else {
								map[dep] = k;
							}
						}
					} else {
						if (map[a]) {
							if (!enyo.isArray(map[a])) {
								map[a] = [map[a]];
							}
							// ensure we only have unique entries so we don't accidently
							// notify the same handler more than once
							map[a] = enyo.merge(map[a].push(k));
						} else {
							map[a] = k;
						}
					}
				}
				proto._observerMap = map;
			}
		}
	};

})(enyo);





(function () {

	//*@public
	/**
		Accepts a function followed by one or more string parameters that are
		targets for the observer; returns a method with the appropriate
		properties to allow the system to notify it when the named properites
		have been modified.
	*/
	enyo.observer = function (fn /* arguments */) {
		var events = enyo.toArray(arguments).slice(1);
		if (!enyo.exists(fn) || "function" !== typeof fn) {
			// this is a necessary assert
			throw "enyo.observer: invalid observer, must have a function";
		}
		fn._isObserver = true;
		fn.events = (fn.events? fn.events: []).concat(events);
		return fn;
	};

	//*@public
	/**
		Registers an observer for the passed-in property, returning a reference
		to the handler function being registered, so that it can be stored (and,
		later, removed). In addition to the property that should trigger the
		observer/handler when changed, this method accepts an optional context,
		under which the handler function will be executed when triggered.

		An observer may be added for any property on the passed-in object
		_(base)_, but an observer may not be added for the same event more
		than once.
	*/
	var addObserver = function (base, property, fn, context) {
		var observers = base._observers || (base._observers = {});
		var handlers;
		// when there is name collision in an observer where one class
		// subclasses another while overloaded an observer method
		// it can call this.inherited as usual but we need to remove the
		// previous version of the method from observing the notifications
		// so it won't be handled twice
		if (fn._inherited && fn._inherited._isObserver) {
			removeObserver(base, property, fn._inherited);
		}
		// if a context is provided for the listener, we bind it
		// to that context now
		fn = context? enyo.bind(context, fn): fn;
		// if there are no registered handlers for this event
		// go ahead and create an array for them
		if (!enyo.exists(observers[property])) {
			handlers = observers[property] = [];
		}
		else {
			handlers = observers[property];
		}
		// only add it if it isn't already in the array
		if (!~enyo.indexOf(fn, handlers)) {
			handlers.push(fn);
		}
		// allow chaining
		return fn;
	};

	//*@public
	/**
		Attempts to remove the given listener/observer for the given property,
		if it exists. If no function is supplied, all listeners for the given
		property will be removed.

		Typically, this method will not be called directly.
	*/
	var removeObserver = function (base, property, fn) {
		var observers = base._observers;
		var idx;
		var handlers;
		if (!(handlers = observers[property])) {
			return this;
		}
		if (enyo.exists(fn) && "function" === typeof fn) {
			idx = enyo.indexOf(fn, handlers);
			if (!!~idx) {
				// remove it from the array
				handlers.splice(idx, 1);
			}
		} else {
			// we need to remove ALL the observers of this property
			delete observers[property];
		}
	};

	//*@public
	/**
		Convenience method to remove all observers on all properties.
		Returns a reference to this object for chaining.

		This will almost never need to be called by anything other than
		the _destroy_ method.
	*/
	var removeAllObservers = function (base) {
		var observers = base._observers;
		var handlers;
		var observer;
		var prop;
		var idx;
		var len;
		for (prop in observers) {
			if (!observers.hasOwnProperty(prop)) {
				continue;
			}
			handlers = observers[prop];
			// orphan the array so it will be cleaned up by the GC
			observers[prop] = null;
			for (idx = 0, len = handlers.length; idx < len; ++idx) {
				observer = handlers[idx];
			}
		}
		// reset our observers hash
		base._observers = {};
		base._notificationQueue = {};
		return base;
	};

	//*@public
	/**
		Notifies any observers for a given property. Accepts the previous
		value and the current value as parameters. Looks for a
		backwards-compatible function of the _propertyChanged_ form and
		will call that function, if it exists, while also notifying other
		observers.
	*/
	var notifyObservers = function (base, property, prev, value) {
		var observers = base._observers || {};
		var handlers = (observers[property] || []);
		var idx = 0;
		var fn;
		var ch = enyo.uncap(property) + "Changed";
		if ("*" !== property) {
			handlers = enyo.merge(handlers, observers["*"] || []);
		}
		if (handlers) {
			for (; idx < handlers.length; ++idx) {
				fn = handlers[idx];
				if (!enyo.exists(fn) || "function" !== typeof fn) {
					continue;
				}
				if (false === base._allowNotifications) {
					base.addNotificationToQueue(property, fn, [property, prev, value]);
				} else {
					fn.call(base, property, prev, value);
				}
			}
		}

		if (enyo.exists(base[ch]) && "function" === typeof base[ch]) {
			if (false === base._allowNotifications) {
				base.addNotificationToQueue(property, base[ch], [prev, value]);
			} else {
				base[ch].call(base, prev, value);
			}
		}
		return base;
	};

	//*@protected
	/**
		Used internally when a notification is queued.
	*/
	var addNotificationToQueue = function (base, property, fn, params) {
		var queue = base._notificationQueue || (base._notificationQueue = {});
		var handlers = queue[property];
		params = params || [];
		if (false === base._allowNotificationQueue) {
			return;
		}
		if (!enyo.exists(handlers)) {
			// create an entry for base property note that the queue for
			// every property uses the first array index as the parameters
			queue[property] = [params, fn];
		} else {
			// update the properties for base entry so if the value has
			// been updated before the queue is flushed it uses the most
			// recent values
			// TODO: replace me with something that will actually work!
			if (handlers[0] !== params) {
				handlers.splice(0, 1, params);
			}
			if (!~enyo.indexOf(fn, handlers)) {
				handlers.push(fn);
			}
		}
	};

	//*@public
	/**
		Prevents all notifications on this object from firing. Does not
		clear or flush the queue. Any new notifications fired while
		notifications are disabled will be added to the queue, which may be
		arbitrarily flushed or cleared when ready. To disable the queue, pass
		a boolean true as the second argument. Note that disabling the queue
		will immediately clear (but not flush) the queue.

		Also increments an internal counter that requires the
		_startNotifications_ method to be called an equal number of times
		before notifications will be enabled again. The queue cannot be flushed
		until the counter reaches 0.
	*/
	var stopNotifications = function (base, disableQueue) {
		base._allowNotifications = false;
		base._stopCount += 1;
		if (true === disableQueue) {
			base.disableNotificationQueue();
		}
	};

	//*@public
	/**
		Enables notifications for this object and immediately flushes the
		notification queue if the internal counter is 0. Has no effect if
		notifications are already enabled; otherwise, decrements the
		internal counter. If the counter reaches 0, will allow notifications
		and attempt to flush the queue (if there is one and it is enabled).

		This method must be called once for each time the _stopNotifications_
		method was called. Passing a boolean true as the second parameter
		will reenable the notification queue if it was disabled.
	*/
	var startNotifications = function (base, enableQueue) {
		if (0 !== base._stopCount) {
			--base._stopCount;
		}
		if (0 === base._stopCount) {
			base._allowNotifications = true;
			base.flushNotifications();
		}
		if (true === enableQueue) {
			base.enableNotificationQueue();
		}
	};

	//*@public
	/**
		Enables the notification queue. Has no effect if the queue is already
		enabled. If notifications are currently enabled, this method will have
		no effect until they are disabled.
	*/
	var enableNotificationQueue = function (base) {
		base._allowNotificationQueue = true;
	};

	//*@protected
	/**
		Used internally; flushes any notifications that have been queued.
	*/
	var flushNotifications = function (base) {
		if (0 !== base._stopCount) {
			return;
		}
		var queue = base._notificationQueue;
		var fn;
		var property;
		var handlers;
		var params;
		if (!enyo.exists(queue) || false === base._allowNotificationQueue) {
			return;
		}
		for (property in queue) {
			if (!queue.hasOwnProperty(property)) {
				continue;
			}
			handlers = queue[property];
			params = handlers.shift();
			// if an entry just so happens to be added improperly by someone
			// trying to bypass the default means by which to add something to
			// the queue...
			if ("function" === typeof params) {
				handlers.unshift(params);
				params = [];
			}
			while (handlers.length) {
				fn = handlers.shift();
				fn.apply(base, params);
			}
		}
	};

	//*@public
	/**
		Disables the notification queue. Has no effect if the queue is already
		disabled, or if notifications are currently enabled. If notifications
		are disabled, future notifications will not be queued and any items in
		the queue will be cleared (not flushed).
	*/
	var disableNotificationQueue = function (base) {
		base._allowNotificationQueue = false;
		base._notificationQueue = {};
	};

	//*@protected
	var _findObservers = function (proto, props, kind) {
		proto._observers = kind? _observerClone(proto._observers || {}): proto._observers || {};
		var addPropObserver = function (event, fn) {
			addObserver(proto, event, fn);
		};
		var prop;
		var idx;
		for (prop in props) {
			if ("function" === typeof props[prop] && true === props[prop]._isObserver) {
				for (idx = 0; idx < props[prop].events.length; ++idx) {
					// key note here, we use the function on the proto here
					// because it might have been proxied already
					addPropObserver(props[prop].events[idx], proto[prop]);
				}
			}
		}
	};

	//*@protected
	/**
		Strictly for internal use; copies observer hashes for kinds.
	*/
	var _observerClone = function ($observed, recursing) {
		var arrayCopy = function (orig) {
			return [].concat(orig);
		};
		var copy = {};
		for (var prop in $observed) {
			copy[prop] = arrayCopy($observed[prop]);
		}
		return copy;
	};

	enyo.kind.features.push(function (ctor, props) {
		_findObservers(ctor.prototype, props, true);
	});

	//*@protected
	/**
		Adds a special handler for mixins to be aware of how to handle
		observer properties of a kind.
	*/
	enyo.mixins.features.push(_findObservers);

	//*@protected
	enyo.createMixin({
		// ...........................
		// PUBLIC PROPERTIES

		//*@public
		name: "enyo.ObserverSupport",

		// ...........................
		// PROTECTED PROPERTIES

		//*@protected
		_supportsObservers: true,

		//*@protected
		_stopCount: 0,

		//*@protected
		_notificationQueue: null,

		//*@protected
		_allowNotifications: true,

		//*@protected
		_allowNotificationQueue: true,

		// ...........................
		// PUBLIC METHODS

		//*@public
		/**
			Registers an observer for the passed-in property, returning a
			reference to the handler function being registered, so that it
			can be stored (and, later, removed). In addition to the property
			that should trigger the observer/handler when changed, this
			method accepts an optional context, under which the handler
			function will be executed when triggered.

			An observer may be added for any property of the object, but an
			observer may not be added for the same event more than once.
		*/
		addObserver: function (prop, fn, ctx) {
			var $p = prop[0] == "."? prop.slice(1): prop;
			return addObserver(this, $p, fn, ctx);
		},

		//*@public
		/**
			Attempts to remove the given listener/observer for the given property,
			if it exists. If no function is supplied, all listeners for the given
			property will be removed.

			Typically, this method will not be called directly.
		*/
		removeObserver: function (prop, fn) {
			var $p = prop[0] == "."? prop.slice(1): prop;
			return removeObserver(this, $p, fn);
		},

		//*@public
		/**
			Convenience method to remove all observers on all properties.
			Returns a reference to this object for chaining.

			This will almost never need to be called by anything other than
			the _destroy_ method.
		*/
		removeAllObservers: function () {
			return removeAllObservers(this);
		},

		//*@public
		/**
			Notifies any observers for a given property. Accepts the previous
			value and the current value as parameters. Looks for a
			backwards-compatible function of the _propertyChanged_ form and will
			call that, if it exists, while also notifying other observers.
		*/
		notifyObservers: function (prop, prev, value) {
			var $p = prop[0] == "."? prop.slice(1): prop;
			return notifyObservers(this, $p, prev, value);
		},

		//*@public
		/**
			Prevents all notifications on this object from firing. Does not
			clear or flush the queue. Any new notifications fired while
			notifications are disabled will be added to the queue, which may be
			arbitrarily flushed or cleared when ready. To disable the queue, pass
			a boolean true as the second argument. Note that disabling the queue
			will immediately clear (but not flush) the queue.

			Also increments an internal counter that requires the
			_startNotifications_ method to be called an equal number of times
			before notifications will be enabled again. The queue cannot be
			flushed until the counter reaches 0.
		*/
		stopNotifications: function (disableQueue) {
			return stopNotifications(this, disableQueue);
		},

		//*@public
		/**
			Enables notifications for this object and immediately flushes the
			notification queue if the internal counter is 0. Has no effect if
			notifications are already enabled; otherwise, decrements the
			internal counter. If the counter reaches 0, will allow
			notifications and attempt to flush the queue (if there is one and
			it is enabled).

			This method must be called once for each time the _stopNotifications_
			method was called. Passing a boolean true as the second parameter
			will reenable the notification queue if it was disabled.
		*/
		startNotifications: function (enableQueue) {
			return startNotifications(this, enableQueue);
		},

		//*@public
		/**
			Enables the notification queue. Has no effect if the queue is already
			enabled. If notifications are currently enabled, this method will have
			no effect until they are disabled.
		*/
		enableNotificationQueue: function () {
			return enableNotificationQueue(this);
		},

		//*@public
		/**
			Disables the notification queue. Has no effect if the queue is
			already disabled, or if notifications are currently enabled. If
			notifications are disabled, future notifications will not be queued
			and any items in the queue will be cleared (not flushed).
		*/
		disableNotificationQueue: function () {
			return disableNotificationQueue(this);
		},

		// ...........................
		// PROTECTED METHODS

		//*@protected
		/**
			Used internally when a notification is queued
		*/
		addNotificationToQueue: function (prop, fn, params) {
			return addNotificationToQueue(this, prop, fn, params);
		},

		//*@protected
		/**
			Used internally; flushes any notifications that have been queued.
		*/
		flushNotifications: function () {
			return flushNotifications(this);
		},

		//*@protected
		_constructor: function () {
			// it is unfortunate, but we cannot share the observers block we inherited
			// from the kind since as an instance we can modify it at runtime so we're
			// forced to deep copy it
			this._observers = _observerClone(this._observers);
			this.inherited(arguments);
		},

		//*protected
		destroy: function () {
			this.removeAllObservers();
		}

	});

}());
