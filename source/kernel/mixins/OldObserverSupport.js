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
	/**
		This is exposed only for other internals to use should they need to
		do a lookup but is primarily intended for mapping relationships of
		observer-methods to multiple object trees (in case of reuse).
	*/
	var _observerMap = enyo._observerMap = {};
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
		and _moodChanged()_ above), the _propertyChanged_ method will automatically
		be called without your having to list the method in the _observers_ block.
		However, it is harmless if you do list it there.

		The following methods and properties are used by the public API for
		_ObserverSupport_ in [enyo.Object](#enyo.Object) and all of its subkinds.
	*/
	enyo.ObserverSupport = {
		name: "ObserverSupport",
		/**
			Used to identify observers and map them to dependencies:
			`observers`
		*/
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
		addObserver: function (path, fn, ctx) {
				// we want to fast-path single item paths when possible but we can't
				// avoid needing to determine if that is possible so we do it first
			var parts    = (path[0] == "."? path.slice(1): path).split("."),
				// the property that will actually be registered
				prop     = parts.shift(),
				// local reference to original method passed in
				observer = fn,
				// these are internally used variables we check for but don't expose in
				// the method definition
				_id      = arguments[3],
				_ch      = arguments[4],
				// the id for the observer that will be registered is either uniquely
				// generated or inherited for chains or in cases of reuse of the same
				// observer method on multiple instances we _must_ reuse the same id
				id       = _id || fn.observerId || enyo.uid("__observer__"),
				// the instance local map
				map      = _instanceMap(this),
				// the unique observer id for the owner
				_oid     = this.objectObserverId || (this.objectObserverId=enyo.uid("__objectObserverId__")),
				// the entry for this instance in the global observer map
				_omap    = _observerMap[_oid] || (_observerMap[_oid] = {}),
				// the actual entry for this unique observer id (even if passed in...still
				// unique...reused on purpose)
				_e       = _omap[id] || (_omap[id] = {}),
				// the actual entry for the local observer in the map
				e,
				// the next element in chains
				n;
			// we may not be able to determine if this is the last part of a chain registration
			// based on the path but we do know that if the `_ch` entry was passed in then it
			// had to have been prefaced by one
			if (_ch && _ch.chain) {
				_e.chain = _ch.chain;
			}
			if (prop == "$") {
				// there is special handling required for the '$' hash as a special property
				// that by itself is not observable, Component calls notifyObservers for components
				// added via the addComponent method and it passes the name in the form of '$.{name}'
				// so we must register for that combination not just the '$' by itself
				prop = (prop + "." + parts.shift());
			}
			// this path allows us to register observers down a chain, significantly more
			// difficult and more costly in terms of performance
			if (parts.length) {
				// for a path we need to engage observers anywhere in the chain possible
				// so that changes below that point can correctly rebuild
				_e.chain  = _e.chain || [];
				path      = parts.join(".");
				// bind the correct references to the callback so it is reusable in this context
				fn        = enyo.bindSafely(this, "updateObserver", path, observer, ctx, id, _e);
				// we also have to verify that the next piece of the chain does/does not exist, if it does
				// we need to continue down that path
				n = this.get(prop);
			}
			// now we can safely register the observer in the instance map
			if ((e=map[prop])) {
				if (typeof e == "string") {
					e = map[prop] = enyo.trim(e).split(" ");
				}
				e.push(id);
			} else {
				map[prop] = [id];
			}
			// add the entry for the callback
			fn                  = this[id] = (ctx? enyo.bindSafely(ctx, fn): fn);
			fn.observer         = true;
			_e.observerId       = id;
			// now the information that may not be unique to the observer if it is registered on
			// other objects and properties but is unique to this instance
			_e.observerProp     = prop;
			// observer needs to have a reference to this object so that if necessary
			// it could be removed from another source
			_e.observerOwner    = this;
			// the especially unique entry id for this in the dynamic observers map/store
			_e.objectObserverId = _oid;
			// a reference to the actual registered observer
			_e.observer         = fn;
			// if there is a method chain already and we're not the first entry then we need to
			// add the method we are registering
			if (_e.chain) {
				_e.chain.push(_e);
			}
			// if this is a chain and we already have access to the next element then we need to register
			// it now but needed to wait until the method was added to the chain
			if (n && n.addObserver) {
				// ensure we pass down the same id so that it will be referenced the same on each
				// object in the chain
				n.addObserver(path, observer, ctx, id, _e);
			}
			return fn;
		},
		//*@protected
		/**
			When necessary observers will follow a chain/path down and leave a trail that
			it can follow to ensure updates at the appropriate locations in the chain and
			also cleanup when necessary. The _path_ is the remaining path to register for
			(or udpate after a change to _prop_), _fn_ is the originally requested observer
			method to pass on for eventual registration, _ctx_ is any context, _id_ is the
			reusable _id_ to continue passing along so all callbacks in this chain are registered
			as the same property on the various objects, _prop_ is the local property that caused
			this update to fire.
		*/
		updateObserver: function (path, fn, ctx, id, _e, previous, current) {
			// we need to remove all observers below this point in the chain
			// then reapply to new bases
			this.removeChainedObservers(id);
			if (current && current !== previous) {
				// this will add new, correct entries to the original chain
				// and will ultimately register the original method requested on
				// the correct instance
				current.addObserver(path, fn, ctx, id, _e);
			}
		},
		//*@protected
		/**
			Called in order to properly remove observers in a chain on any objects beneath
			this instance.
		*/
		removeChainedObservers: function (id) {
				// we have to lookup the entry for this object and the unique observer id to
				// be able to reduce the chain
			var _omap = _observerMap[this.objectObserverId],
				// the entry for the observer id
				_e    = _omap[id],
				// the index the entry in the chain for this observer method
				idx   = enyo.find(_e.chain, function (e) { return e === _e; }),
				// the subset of the chain we need to clear before reapplying
				sub   = _e.chain.splice(idx+1, _e.chain.length);
			for (var i=0, e; (e=sub[i]); ++i) {
				e.chain = null;
				e.observerOwner.removeObserver(e.observerProp, e.observer);
				// now this entry can be released
				_observerMap[e.objectObserverId][e.observerId] = undefined;
			}
		},
		//*@public
		/**
			Attempts to remove the given listener/observer for the given property,
			if it exists. If no function is supplied, all listeners for the given
			property will be removed.

			Typically, this method will not be called directly.
		*/
		removeObserver: function (prop, fn) {
				// instance local map
			var map   = _instanceMap(this),
				// global entry for this instance
				_omap = _observerMap[this.objectObserverId],
				// entry for the observer id in the global map and instance
				_e,
				// entry in the map
				e;
			if ((e = map[prop])) {
				if (typeof e == "string") {
					e = map[prop] = enyo.trim(e).split(" ");
				}
				// if there is no method we automatically remove ALL entries
				// iterate over the entries until we find the correct method/entry
				// in the map and remove it
				for (var i=0, id, o; (id=e[i]); ++i) {
					if (((o=this[id]) && fn && o === fn) || !fn) {
						e.splice(i, 1);
						_e = _omap && _omap[id];
						if (_e && _e.chain) {
							this.removeChainedObservers(id);
						}
						if (o.observer) {
							// release this entry in the global map as well
							_omap[id] = undefined;
							delete this[id];
						}
					}
				}
				if (e.length === 0 || !fn) {
					delete map[prop];
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
			var map = _instanceMap(this);
			for (var prop in map) {
				// this will cause a proper removal of observers and chains
				// as expected since not providing an actual observer method
				// will remove all entries for the given property
				this.removeObserver(prop);
			}
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
				if (!a) {
					this._addObserverToQueue(prop, [prev, value, prop]);
					return this;
				}
				if (typeof o == "string") {
					o = ma[prop] = enyo.trim(o).split(" ");
				}
				if (ma["*"]) {
					if (typeof ma["*"] == "string") {
						ma["*"] = enyo.trim(ma["*"]).split(" ");
					}
					o = o? o.concat(ma["*"]): ma["*"];
				}
				if (o && o.length) {
					o = o.slice();
					for (var i=0, n, fn; (n=o[i]); ++i) {
						if ((fn = this[n])) {
							fn.call(this, prev, this.get(prop), prop);
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
			return this;
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
			return this;
		},
		/**
			Enables the notification queue. Has no effect if the queue is already
			enabled. If notifications are currently enabled, this method will have
			no effect until they are disabled.
		*/
		enableNotificationQueue: function () {
			this.observerNotificationQueueEnabled = true;
			return this;
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
			return this;
		},
		//*@protected
		/**
			Used internally when a notification is queued.
		*/
		_addObserverToQueue: function (prop, params) {
			if (this.observerNotificationQueueEnabled) {
				var q = this.observerNotificationQueue || (this.observerNotificationQueue = {});
				params || (params = []);
				q[prop] = params;
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
				// because we reassign the queue before iterating over it and because
				// we aren't storing the actual function references, only properties
				// to notify for changes, we do not need to clone this queue
				var q = this.observerNotificationQueue,
					p, props;
				// now we reset before we begin
				this.observerNotificationQueue = {};
				for (p in q) {
					props = q[p];
					props.unshift(p);
					this.notifyObservers.apply(this, props);
				}
			}
		},
		observerStopCount: 0,
		/**
			Meta-properties used:
			`observerNotificationQueue`
			`observerMap`
		*/
		observerNotificationsEnabled: true,
		observerNotificationQueueEnabled: true
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
		// now we have to ensure we properly maintain the observer properties
		// for any kind but we want to do the least amount of work possible
		var p = ctor.prototype || ctor;
		// now we need to make sure we insert any observers that may not have
		// been declared explicitly but find them by the property name convention
		for (var r in props) {
			if (r.slice(-7) == "Changed") {
				addObserverForProperty(r.slice(0, -7), r, p, props);
			}
		}
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
