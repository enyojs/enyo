(function (enyo) {
	//*@protected
	// this is called when we need an instance-specific observer table so
	// runtime modifications are unique to the instance and not the kind, also
	// note that once the kind is instanced modifications to the _observers_
	// block will not be registered; they will have to be added via the
	// addObserver method with an anonymous function
	var _instanceMap = function(obj) {
		if (!obj.hasOwnProperty("observerMap")) {
			obj.observerMap = enyo.clone(obj.observerMap);
		}
		return obj.observerMap;
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
			var ma = _instanceMap(this),
				i  = enyo.uid("__observer__"), o;
			if ((o = ma[prop])) {
				if (typeof o == "string") {
					o = ma[prop] = enyo.trim(o).split(" ");
				}
				o.push(i);
			} else {
				ma[prop] = [i];
			}
			this[i] = ctx? enyo.bindSafely(ctx, fn): fn;
			this[i].observer = true;
			this[i].observerId = i;
			return this[i];
		},
		/**
			Attempts to remove the given listener/observer for the given property,
			if it exists. If no function is supplied, all listeners for the given
			property will be removed.

			Typically, this method will not be called directly.
		*/
		removeObserver: function (prop, fn) {
			var ma = _instanceMap(this), o;
			if ((o = ma[prop])) {
				if (typeof o == "string") {
					o = ma[prop] = enyo.trim(o).split(" ");
				}
				for (var i=0, i$; (i$=o[i]); ++i) {
					if (this[i$] === fn) {
						o.splice(i, 1);
						if (fn.observer) {
							delete this[i$];
						}
						if (o.length === 0) {
							delete ma[prop];
						}
						return;
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
			this.observerMap = {};
			return this;
		},
		/**
			Notifies any observers for a given property. Accepts the previous
			value and the current value as parameters. Looks for a
			backwards-compatible function of the form _propertyChanged_ and will
			call that, if it exists, while also notifying other observers.
		*/
		notifyObservers: function (prop, prev, value) {
			var ma = _instanceMap(this);
			if (ma) {
				var o = ma[prop],
					a = this.observerNotificationsEnabled;
				if (typeof o == "string") {
					o = ma[prop] = enyo.trim(o).split(" ");
				}
				if (ma["*"]) {
					if (typeof ma["*"] == "string") {
						ma["*"] = enyo.trim(ma["*"]).split(" ");
					}
					o = o? o.concat(ma["*"]): ma["*"];
				}
				if (o) {
					for (var i=0, n, fn; (n=o[i]); ++i) {
						if ((fn = this[n])) {
							if (!a) {
								this._addObserverToQueue(prop, fn, [prev, value, prop]);
							} else {
								fn.call(this, prev, value, prop);
							}
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
			this.observerNotificationsEnabled = false;
			this.observerStopCount += 1;
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
			if (this.observerStopCount !== 0) {
				this.observerStopCount -= 1;
			}
			if (this.observerStopCount === 0) {
				this.observerNotificationsEnabled = true;
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
			this.observerNotificationQueueEnabled = true;
		},
		/**
			Disables the notification queue. Has no effect if the queue is
			already disabled, or if notifications are currently enabled. If
			notifications are disabled, future notifications will not be queued
			and any items in the queue will be cleared (not flushed).
		*/
		disableNotificationQueue: function () {
			this.observerNotificationQueueEnabled = false;
			this.observerNotificationQueue = {};
		},
		//*@protected
		/**
			Used internally when a notification is queued.
		*/
		_addObserverToQueue: function (prop, fn, params) {
			if (this.observerNotificationQueueEnabled) {
				var q = this.observerNotificationQueue || (this.observerNotificationQueue = {}),
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
			if (this.observerStopCount === 0 && this.observerNotificationQueueEnabled) {
				if (!this.observerNotificationQueue) { return; }
				// we clone the queue for immutability since this is a synchronous
				// and recursive method, it does not require a recursive clone however
				var q = enyo.clone(this.observerNotificationQueue),
					fn, p, en, ps, tmp = [];
				// now we reset before we begin
				this.observerNotificationQueue = {};
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
		observerStopCount: 0,
		observerNotificationQueue: null,
		observerNotificationsEnabled: true,
		observerNotificationQueueEnabled: true,
		observerMap: null
	};
	//*@protected
	var addObserverForProperty = function (n, fn, proto, props) {
		var po = props.observers || (props.observers = {});
		(po[fn]=(po[fn] || [])).push(n);
	};
	var fn = enyo.concatHandler;
	enyo.concatHandler = function (ctor, props) {
		// call the original
		fn.apply(this, arguments);
		// now we need to make sure we insert any observers that may not have
		// been declared explicitly but find them by the property name convention
		for (var r in props) {
			if (r.slice(-7) == "Changed") {
				addObserverForProperty(r.slice(0, -7), r, p, props);
			}
		}
		// now we have to ensure we properly maintain the observer properties
		// for any kind but we want to do the least amount of work possible
		var p = ctor.prototype || ctor;
		if (props.observers) {
			if (!p.observers) {
				p.observers = {};
				p.observerMap = {};
			} else {
				p.observers = enyo.clone(p.observers);
				p.observerMap = enyo.clone(p.observerMap);
			}
			for (var k in props.observers) {
				p.observers[k] = (p.observers[k] || "");
				var ss = (typeof props.observers[k] == "string"? enyo.trim(props.observers[k]).split(" "): props.observers[k]);
				for (var i=0, s; (s=ss[i]); ++i) {
					// if we have not seen this entry before we will add it
					if (!~p.observers[k].indexOf(s)) {
						p.observers[k] += (" " + s);
						p.observerMap[s] = enyo.trim((p.observerMap[s] || "") + " " + k).replace(/\s+/g, " ");
					}
				}
				p.observers[k] = enyo.trim(p.observers[k]).replace(/\s+/g, " ");
			}
			delete props.observers;
		}
	};

})(enyo);
