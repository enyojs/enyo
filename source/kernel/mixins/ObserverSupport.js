(function (enyo) {
	
	var observerTable = {};
		
	var ObserverChain = enyo.ObserverChain
		, ObserverSupport;
		
	enyo.concatenated.push("observers");
	
	/**
	* Responds to changes in one or more properties.
	* [Observers]{@link enyo.ObserverSupport~observer} may be registered in
	* several different ways. See the {@link enyo.ObserverSupport} documentation
	* for more details. Also note that, while observers should not be called
	* directly, if defined on a [kind]{@glossary kind}, they may be
	* overloaded for special behavior.
	*
	* @see enyo.ObserverSupport
	* @see enyo.ObserverSupport.observe
	* @callback enyo.ObserverSupport~Observer
	* @param {*} was - The previous value of the property that has changed.
	* @param {*} is - The current value of the property that has changed.
	* @param {String} prop - The name of the property that has changed.
	* @public
	*/
	
	/**
	* @private
	*/
	function addObserver (path, fn, ctx, opts) {
		
		var observers = this.getObservers(),
			chains = this.getChains(),
			parts = path.split('.'),
			prio = opts && opts.priority,
			entries,
			noChain;
			
		noChain = (opts && opts.noChain) ||
				chains[path] ||
				parts.length < 2 ||
				(parts.length === 2 && path[0] == '$');
		
		if (observers[path] && !observers.hasOwnProperty(path)) {
			observers[path] = observers[path].slice();
		}
		
		entries = observers[path] || (observers[path] = []);
		entries[prio ? 'unshift' : 'push']({method: fn, ctx: ctx || this});
		
		if (!noChain) {
			this.getChains()[path] = new ObserverChain(path, this);
		}
		
		return this;
	}
	
	/**
	* @private
	*/
	function removeObserver (obj, path, fn, ctx) {
		var observers = obj.getObservers(path)
			, chains = obj.getChains()
			, idx, chain;
			
		if (observers && observers.length) {
			idx = observers.findIndex(function (ln) {
				return ln.method === fn && (ctx? ln.ctx === ctx: true);
			});
			idx > -1 && observers.splice(idx, 1);
		}
		
		if ((chain = chains[path]) && !observers.length) {
			chain.destroy();
		}
		
		return obj;
	}
	
	/**
	* @private
	*/
	function notifyObservers (obj, path, was, is, opts) {
		if (obj.isObserving()) {
			var observers = obj.getObservers(path);
			
			if (observers && observers.length) {
				for (var i=0, ln; (ln=observers[i]); ++i) {
					if (typeof ln.method == "string") obj[ln.method](was, is, path, opts);
					else ln.method.call(ln.ctx || obj, was, is, path, opts);
				}
			}
		} else enqueue(obj, path, was, is, opts);
		
		return obj;
	}
	
	/**
	* @private
	*/
	function enqueue (obj, path, was, is, opts) {
		if (obj._notificationQueueEnabled) {
			var queue = obj._notificationQueue || (obj._notificationQueue = {})
				, ln = queue[path] || (queue[path] = {});
		
			ln.was = was;
			ln.is = is;
			ln.opts = opts;
		}
	}
	
	/**
	* @private
	*/
	function flushQueue (obj) {
		var queue = obj._notificationQueue
			, path, ln;
		
		if (queue) {
			obj._notificationQueue = null;
			
			for (path in queue) {
				ln = queue[path];
				obj.notify(path, ln.was, ln.is, ln.opts);
			}
		}
	}
		
	/**
	* Adds support for notifications on property changes. Most
	* [kinds]{@glossary kind} (including all kinds that inherit from
	* {@link enyo.Object}) already have this {@glossary mixin} applied.
	* This allows for
	* [observers]{@link enyo.ObserverSupport~Observer} to be
	* [declared]{@link enyo.ObserverSupport.observers} or "implied" (see below).
	*
	* Implied observers are not declared, but derived from their `name`. They take
	* the form `<property>Changed`, where `<property>` is the property to
	* [observe]{@link enyo.ObserverSupport.observe}. For example:
	*
	* ```javascript
	* enyo.kind({
	* 	name: 'MyKind',
	*
	* 	// some local property
	* 	value: true,
	*
	* 	// and the implied observer of that property
	* 	valueChanged: function (was, is) {
	* 		// do something now that it has changed
	* 		enyo.log('value was "' + was + '" but now it is "' + is + '"');
	* 	}
	* });
	*
	* var mine = new MyKind();
	* mine.set('value', false); // -> value was "true" but now it is "false"
	* ```
	*
	* Using the `observers` property for its declarative syntax, an observer may
	* observe any property (or properties), regardless of its `name`. For example:
	*
	* ```javascript
	* enyo.kind({
	* 	name: 'MyKind',
	*
	* 	// some local property
	* 	value: true,
	*
	* 	// another local property
	* 	count: 1,
	*
	* 	// declaring the observer
	* 	observers: [
	* 		// the path can be a single string or an array of strings
	* 		{method: 'myObserver', path: ['value', 'count']}
	* 	],
	*
	* 	// now this observer will be notified of changes to both properties
	* 	myObserver: function (was, is, prop) {
	* 		// do something now that it changed
	* 		enyo.log(prop + ' was "' + was + '" but now it is "' + is + '"');
	* 	}
	* });
	*
	* var mine = new MyKind();
	* mine.set('value', false); // -> value was "true" but now it is "false"
	* mine.set('count', 2); // -> count was "1" but now it is "2"
	* ```
	*
	* While observers may be [notified]{@link enyo.ObserverSupport.notify} of
	* changes to multiple properties, this is not a typical use case for implied
	* observers, since, by convention, they are only registered for the named
	* property.
	*
	* There is one additional way to use observers, if necessary. You may use the
	* API methods [observe()]{@link enyo.ObserverSupport.observe} and
	* [unobserve()]{@link enyo.ObserverSupport.unobserve} to dynamically
	* register and unregister observers as needed. For example:
	*
	* ```javascript
	* var object = new enyo.Object({value: true});
	* var observer = function (was, is) {
	* 	enyo.log('value was "' + was + '" but now it is "' + is + '"');
	* };
	*
	* object.observe('value', observer);
	* object.set('value', false); // -> value was "true" but now it is "false"
	* object.unobserve('value', observer);
	* object.set('value', true); // no output because there is no observer
	* ```
	*
	* Be sure to read the documentation for these API methods; proper usage of
	* these methods is important for avoiding common pitfalls and memory leaks.
	*
	* @mixin enyo.ObserverSupport
	* @public
	*/
	ObserverSupport = enyo.ObserverSupport = /** @lends enyo.ObserverSupport */ {
		
		/**
		* @private
		*/
		name: "ObserverSupport",
		
		/**
		* @private
		*/
		_observing: true,
		
		/**
		* @private
		*/
		_observeCount: 0,
		
		/**
		* @private
		*/
		_notificationQueue: null,
		
		/**
		* @private
		*/
		_notificationQueueEnabled: true,
		
		/**
		* Determines whether `_observing` is enabled. If
		* [stopNotifications()]{@link enyo.ObserverSupport.stopNotifications} has
		* been called, then this will return `false`.
		*
		* @see enyo.ObserverSupport.stopNotifications
		* @see enyo.ObserverSupport.startNotifications
		* @returns {Boolean} Whether or not the callee is observing.
		*/
		isObserving: function () {
			return this._observing;
		},
		
		/**
		* Returns an immutable list of [observers]{@link enyo.ObserverSupport~Observer}
		* for the given `path`, or all observers for the callee.
		*
		* @param {String} [path] - Path or property path for which
		* [observers]{@link enyo.ObserverSupport~Observer} will be returned. If not
		* specified, all observers for the callee will be returned.
		*
		* @returns {enyo.ObserverSupport~Observer[]} The immutable
		* [array]{@glossary Array} of observers.
		* @public
		*/
		getObservers: function (path) {
			var euid = this.euid || (this.euid = enyo.uid('o')),
				ret,
				loc;
				
			loc = observerTable[euid] || (observerTable[euid] = (
				this._observers? Object.create(this._observers): {}
			));
			
			if (!path) return loc;
			
			ret = loc[path];
			
			// if the special property exists...
			if (loc['*']) ret = ret ? ret.concat(loc['*']) : loc['*'].slice();
			return ret;
		},
		
		/**
		* @private
		*/
		getChains: function () {
			return this._observerChains || (this._observerChains = {});
		},
		
		/**
		* @deprecated
		* @alias enyo.ObserverSupport.observe
		* @public
		*/
		addObserver: function () {
			// @NOTE: In this case we use apply because of internal variable use of parameters
			return addObserver.apply(this, arguments);
		},
		
		/**
		* Registers an [observer]{@link enyo.ObserverSupport~Observer} to be
		* [notified]{@link enyo.ObserverSupport.notify} when the given property has
		* been changed. It is important to note that it is possible to register the
		* same observer multiple times (although this is never the intention), so
		* care should be taken to avoid that scenario. It is also important to
		* understand how observers are stored and unregistered
		* ([unobserved]{@link enyo.ObserverSupport.unobserve}). The `ctx` (context)
		* parameter is stored with the observer reference. **If used when
		* registering, it should also be used when unregistering.**
		*
		* @see enyo.ObserverSupport.unobserve
		* @param {String} path - The property or property path to observe.
		* @param {enyo.ObserverSupport~Observer} fn - The
		*	[observer]{@link enyo.ObserverSupport~Observer} method that responds to changes.
		* @param {*} [ctx] - The `this` (context) under which to execute the observer.
		*
		* @returns {this} The callee for chaining.
		* @public
		*/
		observe: function () {
			// @NOTE: In this case we use apply because of internal variable use of parameters
			return addObserver.apply(this, arguments);
		},
		
		/**
		* @deprecated
		* @alias enyo.ObserverSupport.unobserve
		* @public
		*/
		removeObserver: function (path, fn, ctx) {
			return removeObserver(this, path, fn);
		},
		
		/**
		* Unregisters an [observer]{@link enyo.ObserverSupport~Observer}. If a `ctx`
		* (context) was supplied to [observe()]{@link enyo.ObserverSupport.observe},
		* then it should also be supplied to this method.
		*
		* @see enyo.ObserverSupport.observe
		* @param {String} path - The property or property path to unobserve.
		* @param {enyo.ObserverSupport~Observer} fn - The
		*	[observer]{@link enyo.ObserverSupport~Observer} method that responds to changes.
		* @param {*} [ctx] - The `this` (context) under which to execute the observer.
		*
		* @returns {this} The callee for chaining.
		* @public
		*/
		unobserve: function (path, fn, ctx) {
			return removeObserver(this, path, fn, ctx);
		},
		
		/**
		* Removes all [observers]{@link enyo.ObserverSupport~Observer} from the
		* callee. If a `path` parameter is provided, observers will only be removed
		* from that path (or property).
		*
		* @param {String} [path] - A property or property path from which to remove all
		*	[observers]{@link enyo.ObserverSupport~Observer}.
		* @returns {this} The callee for chaining.
		*/
		removeAllObservers: function (path) {
			var euid = this.euid
				, loc = euid && observerTable[euid];
			
			if (loc) {
				if (path) {
					loc[path] = null;
				} else {
					observerTable[euid] = null;
				}
			}
			
			return this;
		},
		
		/**
		* @deprecated
		* @alias enyo.ObserverSupport.notify
		* @public
		*/
		notifyObservers: function (path, was, is, opts) {
			return notifyObservers(this, path, was, is, opts);
		},
		
		/**
		* Triggers any [observers]{@link enyo.ObserverSupport~Observer} for the
		* given `path`. The previous and current values must be supplied. This
		* method is typically called automatically, but it may also be called
		* forcibly by [setting]{@link enyo.Object#set} a value with the
		* `force` option.
		*
		* @param {String} path - The property or property path to notify.
		* @param {*} was - The previous value.
		* @param {*} is - The current value.
		* @returns {this} The callee for chaining.
		*/
		notify: function (path, was, is, opts) {
			return notifyObservers(this, path, was, is, opts);
		},
		
		/**
		* Stops all [notifications]{@link enyo.ObserverSupport.notify} from
		* propagating. By default, all notifications will be queued and flushed once
		* [startNotifications()]{@link enyo.ObserverSupport.startNotifications}
		* has been called. Setting the optional `noQueue` flag will also disable the
		* queue, or you can use the
		* [disableNotificationQueue()]{@link enyo.ObserverSupport.disableNotificationQueue} and
		* [enableNotificationQueue()]{@link enyo.ObserverSupport.enableNotificationQueue}
		* API methods. `startNotifications()` will need to be called the same number
		* of times that this method has been called.
		*
		* @see enyo.ObserverSupport.startNotifications
		* @see enyo.ObserverSupport.disableNotificationQueue
		* @see enyo.ObserverSupport.enableNotificationQueue
		* @param {Boolean} [noQueue] - If `true`, this will also disable the notification queue.
		* @returns {this} The callee for chaining.
		*/
		stopNotifications: function (noQueue) {
			this._observing = false;
			this._observeCount++;
			noQueue && this.disableNotificationQueue();
			return this;
		},
		
		/**
		* Starts [notifications]{@link enyo.ObserverSupport.notify} if they have
		* been [disabled]{@link enyo.ObserverSupport.stopNotifications}. If the
		* notification queue was not disabled, this will automatically flush the
		* queue of all notifications that were encountered while stopped. This
		* method must be called the same number of times that
		* [stopNotifications()]{@link enyo.ObserverSupport.stopNotifications} was
		* called.
		*
		* @see enyo.ObserverSupport.stopNotifications
		* @see enyo.ObserverSupport.disableNotificationQueue
		* @see enyo.ObserverSupport.enableNotificationQueue
		* @param {Boolean} [queue] - If `true` and the notification queue is disabled,
		* the queue will be re-enabled.
		* @returns {this} The callee for chaining.
		*/
		startNotifications: function (queue) {
			this._observeCount && this._observeCount--;
			this._observeCount === 0 && (this._observing = true);
			queue && this.enableNotificationQueue();
			this.isObserving() && flushQueue(this);
			return this;
		},
		
		/**
		* Re-enables the notification queue, if it was disabled.
		*
		* @see enyo.ObserverSupport.disableNotificationQueue
		* @returns {this} The callee for chaining.
		*/
		enableNotificationQueue: function () {
			this._notificationQueueEnabled = true;
			return this;
		},
		
		/**
		* If the notification queue is enabled (the default), it will be disabled
		* and any notifications in the queue will be removed.
		*
		* @see enyo.ObserverSupport.enableNotificationQueue
		* @returns {this} The callee for chaining.
		*/
		disableNotificationQueue: function () {
			this._notificationQueueEnabled = false;
			this._notificationQueue = null;
			return this;
		},
		
		/**
		* @private
		*/
		constructor: enyo.inherit(function (sup) {
			return function () {
				var chains, chain, path, entries, i;
				
				// if there are any observers that need to create dynamic chains
				// we look for and instance those now
				if (this._observerChains) {
					chains = this._observerChains;
					this._observerChains = {};
					for (path in chains) {
						entries = chains[path];
						for (i = 0; (chain = entries[i]); ++i) this.observe(path, chain.method);
					}
				}
				
				sup.apply(this, arguments);
			};
		}),
		
		/**
		* @private
		*/
		destroy: enyo.inherit(function (sup) {
			return function () {
				var chains = this._observerChains,
					path,
					chain;
				
				sup.apply(this, arguments);
				
				if (chains) {
					for (path in chains) {
						chain = chains[path];
						chain.destroy();
					}
					
					this._observerChains = null;
				}
			};
		})
		
	};
	
	/**
	* Hijack the original so we can add additional default behavior.
	*
	* @private
	*/
	var sup = enyo.concatHandler;
	
	// @NOTE: It seems like a lot of work but it really won't happen that much and the more
	// we push to kind-time the better for initialization time
	
	/** @private */
	enyo.concatHandler = function (ctor, props, instance) {
		
		sup.call(this, ctor, props, instance);
		
		if (props === ObserverSupport) return;

		var proto = ctor.prototype || ctor
			, observers = proto._observers? Object.create(proto._observers): null
			, incoming = props.observers
			, chains = proto._observerChains && Object.create(proto._observerChains);
			
		if (!observers) {
			if (proto.kindName) observers = {};
			else return;
		}
			
		if (incoming && !(incoming instanceof Array)) {
			(function () {
				var tmp = [], deps, name;
				// here is the slow iteration over the properties...
				for (name in props.observers) {
					// points to the dependencies of the computed method
					deps = props.observers[name];
					// create a single entry now for the method/computed with all dependencies
					tmp.push({method: name, path: deps});
				}
				incoming = tmp;
			}());
			// we need to ensure we don't modify the fixed array of a mixin or reused object
			// because it could wind up inadvertantly adding the same entry multiple times
		} else if (incoming) incoming = incoming.slice();
		
		// this scan is required to figure out what auto-observers might be present
		for (var key in props) {
			if (key.slice(-7) == "Changed") {
				incoming || (incoming = []);
				incoming.push({method: key, path: key.slice(0, -7)});
			}
		}
		
		var addObserverEntry = function (path, method) {
			var obs;
			// we have to make sure that the path isn't a chain because if it is we add it
			// to the chains instead
			if (path.indexOf(".") > -1) {
				if (!chains) chains = {};
				obs = chains[path] || (chains[path] = []);
				obs.push({method: method});
			} else {
				if (observers[path] && !observers.hasOwnProperty(path)) observers[path] = observers[path].slice();
				obs = observers[path] || (observers[path] = []);
				if (!obs.find(function (ln) { return ln.method == method; })) obs.push({method: method});
			}
		};
		
		if (incoming) {
			incoming.forEach(function (ln) {
				// first we determine if the path itself is an array of paths to observe
				if (ln.path && ln.path instanceof Array) ln.path.forEach(function (en) { addObserverEntry(en, ln.method); });
				else addObserverEntry(ln.path, ln.method);
			});
		}
		
		// we clear the key so it will not be added to the prototype
		// delete props.observers;
		// we update the properties to whatever their new values may be
		proto._observers = observers;
		proto._observerChains = chains;
	};
	
})(enyo);