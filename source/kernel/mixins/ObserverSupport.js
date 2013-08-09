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
		key and the value being an array with the name of the property it should
		respond to.

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
				map[prop].push(id);
			} else {
				map[prop] = [id];
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
				en = map[prop], fn;
			if (en) {
				if (enyo.isArray(en)) {
					var i = enyo.indexOf(fn, en);
					if (!~i) {
						en.splice(i, 1);
						fn = en[prop];
						if (fn.observer) {
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
					for (var i=0, o; (o=map[k]); ++i) {
						this.removeObserver(k, o);
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
				a = this._observerNotificationsEnabled, fn, n;
			if (en) {
				for (var i=0; (n=en[i]); ++i) {
					if ((fn = this[n])) {
						if (!a) {
							this._addObserverToQueue(prop, fn, [prev, value, prop]);
						} else {
							fn.call(this, prev, value, prop);
						}
					}
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
			this._observerNotificationsEnabled = false;
			this._observerStopCount += 1;
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
			if (this._observerStopCount !== 0) {
				this._observerStopCount -= 1;
			}
			if (this._observerStopCount === 0) {
				this._observerNotificationsEnabled = true;
				this._flushObserverQueue();
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
			this._observerNotificationQueueEnabled = true;
		},
		/**
			Disables the notification queue. Has no effect if the queue is
			already disabled, or if notifications are currently enabled. If
			notifications are disabled, future notifications will not be queued
			and any items in the queue will be cleared (not flushed).
		*/
		disableNotificationQueue: function () {
			this._observerNotificationQueueEnabled = false;
			this._observerNotificationQueue = {};
		},
		//*@protected
		/**
			Used internally when a notification is queued
		*/
		_addObserverToQueue: function (prop, fn, params) {
			if (this._observerNotificationQueueEnabled) {
				var q = this._observerNotificationQueue,
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
			Used to flush any queued notifications related to observers. Attempts
			to use the stored parameters when possible. Disposes of the queue when
			the action is complete.
		*/
		_flushObserverQueue: function () {
			if (this._observerStopCount === 0 && this._observerNotificationQueueEnabled) {
				// we clone the queue for immutability since this is a synchronous
				// and recursive method, it does not require a recursive clone however
				var q = enyo.clone(this._observerNotificationQueue),
					fn, p, en, ps, tmp = [];
				// now we reset before we begin
				this._observerNotificationQueue = {};
				for (p in q) {
					en = q[p];
					ps = enyo.isFunction(en[0])? tmp: en.shift();
					for (var i=0; (fn=en[i]); ++i) {
						fn.apply(this, ps);
					}
				}
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
				this._observerNotificationQueue = {};
				return sup.apply(this, arguments);
			};
		}),
		destroy: enyo.super(function (sup) {
			return function () {
				this.removeAllObservers();
				sup.apply(this, arguments);
			};
		}
		_observerStopCount: 0,
		_observerNotificationQueue: null,
		_observerNotificationsEnabled: true,
		_observerNotificationQueueEnabled: true,
		_observerMap: null
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
						po[k] = enyo.merge(po[k], ro[k]);
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
					for (i=0; (dep=a[i]); ++i) {
						if (map[dep]) {
							// ensure we only have unique entries so we don't accidently
							// notify the same handler more than once
							map[dep] = enyo.merge(map[dep].push(k));
						} else {
							map[dep] = [k];
						}
					}
				}
				proto._observerMap = map;
			}
		}
	};
	/**
		We need to hijack the addGetterSetter for enyo.Object so we
		can arbitrarily add entries for possible observers (changed methods
		for published properties) for backwards compatibility. Now they will
		simply be treated as all other observers and not need to be handled
		separately. If there isn't an actual changed handler by the name then
		it will be ignored.
	*/
	var addGetterSetter = enyo.Object.addGetterSetter;
	enyo.Object.addGetterSetter = function (prop, value, proto) {
		var po = proto.observers || {},
			n = prop + "Changed",
			fn = proto[n];
		if (fn) {
			if (!po[n]) {
				po[n] = [prop];
			} else {
				po[n] = enyo.merge(po[n].push(prop));
			}
		}
		proto.observers = po;
		// carry on
		addGetterSetter(prop, value, proto);
	};

})(enyo);
