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
		fn.isObserver = true;
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
		if (fn._inherited && fn._inherited.isObserver) {
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
				if (false === base._allow_notifications) {
					base.addNotificationToQueue(property, fn, [property, prev, value]);
				} else {
					fn.call(base, property, prev, value);
				}
			}
		}

		if (enyo.exists(base[ch]) && "function" === typeof base[ch]) {
			if (false === base._allow_notifications) {
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
		var queue = base._notification_queue || (base._notification_queue = {});
		var handlers = queue[property];
		params = params || [];
		if (false === base._allow_notification_queue) {
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
		base._allow_notifications = false;
		base._stop_count += 1;
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
		if (0 !== base._stop_count) {
			--base._stop_count;
		}
		if (0 === base._stop_count) {
			base._allow_notifications = true;
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
		base._allow_notification_queue = true;
	};

	//*@protected
	/**
		Used internally; flushes any notifications that have been queued.
	*/
	var flushNotifications = function (base) {
		if (0 !== base._stop_count) {
			return;
		}
		var queue = base._notification_queue;
		var fn;
		var property;
		var handlers;
		var params;
		if (!enyo.exists(queue) || false === base._allow_notification_queue) {
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
		base._allow_notification_queue = false;
		base._notification_queue = {};
	};

	//*@protected
	var _find_observers = function (proto, props, kind) {
		proto._observers = kind? _observer_clone(proto._observers || {}): proto._observers || {};
		function addPropObserver(event) {
			addObserver(proto, event, props[prop]);
		}
		for (var prop in props) {
			if ("function" === typeof props[prop] && true === props[prop].isObserver) {
				enyo.forEach(props[prop].events, addPropObserver);
			}
		}
	};

	//*@protected
	/**
		Strictly for internal use; copies observer hashes for kinds.
	*/
	var _observer_clone = function ($observed, recursing) {
		var array_copy = function (orig) {
			return [].concat(orig);
		};
		var copy = {};
		for (var prop in $observed) {
			copy[prop] = array_copy($observed[prop]);
		}
		return copy;
	};

	enyo.kind.features.push(function (ctor, props) {
		_find_observers(ctor.prototype, props, true);
	});

	//*@protected
	/**
		Adds a special handler for mixins to be aware of how to handle
		observer properties of a kind.
	*/
	enyo.mixins.features.push(_find_observers);

	//*@protected
	enyo.createMixin({
		// ...........................
		// PUBLIC PROPERTIES

		//*@public
		name: "enyo.ObserverSupport",

		// ...........................
		// PROTECTED PROPERTIES

		//*@protected
		_supports_observers: true,

		//*@protected
		_stop_count: 0,

		//*@protected
		_notification_queue: null,

		//*@protected
		_allow_notifications: true,

		//*@protected
		_allow_notification_queue: true,

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
		addObserver: function (property, fn, context) {
			return addObserver(this, property, fn, context);
		},

		//*@public
		/**
			Attempts to remove the given listener/observer for the given property,
			if it exists. If no function is supplied, all listeners for the given
			property will be removed.

			Typically, this method will not be called directly.
		*/
		removeObserver: function (property, fn) {
			return removeObserver(this, property, fn);
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
		notifyObservers: function (property, prev, value) {
			return notifyObservers(this, property, prev, value);
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
		addNotificationToQueue: function (property, fn, params) {
			return addNotificationToQueue(this, property, fn, params);
		},

		//*@protected
		/**
			Used internally; flushes any notifications that have been queued.
		*/
		flushNotifications: function () {
			return flushNotifications(this);
		},

		//*@protected
		create: function () {
			// it is unfortunate, but we cannot share the observers block we inherited
			// from the kind since as an instance we can modify it at runtime so we're
			// forced to deep copy it
			this._observers = _observer_clone(this._observers);
		},

		//*protected
		destroy: function () {
			this.removeAllObservers();
		}

	});

}());
