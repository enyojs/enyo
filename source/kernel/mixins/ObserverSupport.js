(function (enyo) {
	//*@protected
	// ensure observers will be handled by the concatenation handler
	enyo.concat.push("changedObservers", "observers");
	/**
		Used because, when cloning objects with arrays, we need to also
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

	// this is called when we need an instance-specific observer table so
	// runtime modifications are unique to the instance and not the kind, also
	// note that once the kind is instanced modifications to the _observers_
	// block will not be registered; they will have to be added via the
	// addObserver method with an anonymous function
	var _instanceMap = function(obj) {
		if (!obj.hasOwnProperty("_observerMap")) {
			obj._observerMap = _clone(obj._observerMap);
		}
		return obj._observerMap;
	};
	//*@public
	/**
		Observers are methods that respond to changes in specific properties
		of an object. Any method on a kind may be an observer for one or more
		properties. Each time a dependent property is modified via the kind's
		_set()_ or _get()_ method, the observer method will be executed. The first
		parameter will be the previous value of the property (when possible),
		followed by the current value of the modified property (when possible), and
		finally the name of the property that changed	and forced the notification
		(this will be redundant if there is only one dependent property).

		To add a method as an observer for a property, simply add the method to the
		kind's _observers_ block using _key: value_ notation, as in the example
		below. The name of the method is the key, while the corresponding value is
		an array containing the names of the properties to be observed.

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

		Note that if you call _set()_ to change the value of a published property
		for which you've defined a _propertyChanged_ method (e.g., _nameChanged()_
		and _moodChanged()_ above), the _propertyChanged_ method will	automatically
		be called without your having to list the method in the _observers_ block.
		However, it is harmless if you do list it there.

		The following methods and properties are used by the public API for
		_ObserverSupport_ in [enyo.Object](#enyo.Object) and all of its subkinds.
	*/
	enyo.ObserverSupport = {
		name: "ObserverSupport",
		/**
			Used to identify observers and map them to dependencies.
		*/
		observers: null,
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
				map = _instanceMap(this);

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
			var map = _instanceMap(this),
				en = map[prop];
			if (en && fn) {
				for (var i=0, id; (id=en[i]); ++i) {
					if (this[id] === fn) {
						en.splice(i, 1);
						// for methods that are anonymously added as an
						// observer we need to remove them from the object completely
						if (fn.observer) {
							delete this[id];
						}
						if (en.length === 0) {
							// we completely remove the entry for the property in the map
							// so we don't do extra work on updates and it isn't enumerable
							delete map[prop];
						}
					}
				}
			}
		},
		/**
			Convenience method to remove all observers on all properties.
			Returns a reference to this object for chaining.

			This will almost never need to be called by anything other than
			the _destroy()_ method.
		*/
		removeAllObservers: function () {
			// we allow this even if we didn't have a local map
			// since it won't be around for long
			this._observerMap = {};
			return this;
		},
		/**
			Notifies any observers for a given property. Accepts the previous
			value and the current value as parameters. Looks for a
			backwards-compatible function of the form _propertyChanged_ and will
			call that, if it exists, while also notifying other observers.
		*/
		notifyObservers: function (prop, prev, value) {
			var map = this._observerMap;
			if (!map) { return; }
			var	en = map[prop],
				a = this._observerNotificationsEnabled, fn, n;
			// special handler case
			if (map["*"]) {
				en = en? en.concat(map["*"]): map["*"];
			}
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
			_startNotifications()_ method to be called an equal number of times
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
			notifications are already enabled; otherwise, decrements the internal
			counter. If the counter reaches 0, will allow notifications and attempt
			to flush the queue (if there is one and it is enabled).

			This method must be called once for each time the _stopNotifications()_
			method was called. Passing a boolean true as the second parameter will
			re-enable the notification queue if it was disabled.
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
			Used internally when a notification is queued.
		*/
		_addObserverToQueue: function (prop, fn, params) {
			if (this._observerNotificationQueueEnabled) {
				var q = this._observerNotificationQueue || (this._observerNotificationQueue = {}),
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
				if (!this._observerNotificationQueue) { return; }
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
		destroy: enyo.inherit(function (sup) {
			return function () {
				this.removeAllObservers();
				sup.apply(this, arguments);
			};
		}),
		_observerStopCount: 0,
		_observerNotificationQueue: null,
		_observerNotificationsEnabled: true,
		_observerNotificationQueueEnabled: true,
		_observerMap: null
	};
	/**
		Used when handling concatenated properties.
	*/
	enyo.concatHandler("observers", function (proto, props) {
		if (props.observers) {
			var po, ro, k, map, a, i, dep;
			// unfortunately there are 2 steps here but it's all for the better
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
							map[dep].push(k);
							map[dep] = enyo.merge(map[dep]);
						} else {
							map[dep] = [k];
						}
					}
				}
				proto._observerMap = map;
			}
			delete props.observers;
		}
	});
	var addObserverForProperty = function (n, fn, proto, props) {
		var po = props.observers || {};
		if (!po[fn]) {
			po[fn] = [n];
		} else {
			po[fn].push(n);
			po[fn] = enyo.merge(po[fn]);
		}
		props.observers = po;

	};
	enyo.concatHandler("changedObservers", function (proto, props) {
		var k, pr;
		for (k in props) {
			pr = k.split("Changed");
			if (pr.length > 1) {
				addObserverForProperty(pr[0], k, proto, props);
			}
		}
	}, true);
})(enyo);
