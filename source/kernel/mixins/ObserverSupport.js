(function (enyo) {
	
	var observerTable = {};
		
	var ObserverChain = enyo.ObserverChain
		, ObserverSupport;
		
	enyo.concatenated.push("observers");
	
	/**
	* A method that responds to changes to one or more properties.
	* [Observers]{@link enyo.ObserverSupport~observer} can be registered several different ways.
	* See the {@link enyo.ObserverSupport} documentation for more details. Also note that
	* [observers]{@link enyo.ObserverSupport~observer} should not be called directly but, if
	* defined on a [kind]{@link external:kind}, they can be overloaded for special behavior.
	*
	* @see enyo.ObserverSupport
	* @see enyo.ObserverSupport.observe
	* @callback enyo.ObserverSupport~Observer
	* @param {*} was The previous value of the property that has changed.
	* @param {*} is The current value of the property that has changed.
	* @param {String} prop The name of the property that has changed.
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
	* Adds support for notifications on property changes. Most [kinds]{@link external:kind} already
	* have this [mixin]{@link external:mixin} applied (any [kind]{@link external:kind} that
	* inherits from {@link enyo.Object}). This allows for
	* [observers]{@link enyo.ObserverSupport~Observer} to be
	* [declared]{@link enyo.ObserverSupport.observers} or _implied_ (see below).
	*
	* _Implied_ [observers]{@link enyo.ObserverSupport~Observer} are not
	* [declared]{@link enyo.ObserverSupport.observers} but derived from their _name_. They take the
	* form _[property]Changed_ where _property_ is the property to
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
	* 		// do something now that it changed
	* 		enyo.log('value was "' + was + '" but now it is "' + is + '"');
	* 	}
	* });
	*
	* var mine = new MyKind();
	* mine.set('value', false); // -> value was "true" but now it is "false"
	* ```
	*
	* Using the [observers property]{@link enyo.ObserverSupport.observers} for its declarative
	* syntax, [observers]{@link enyo.ObserverSupport~Observer} can
	* [observe]{@link enyo.ObserverSupport.observe} any property (or properties) regardless of
	* their _name_. For example:
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
	* 	// now this observer will be notified to changes on both properties
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
	* While [observers]{@link enyo.ObserverSupport~Observer} can be
	* [notified]{@link enyo.ObserverSupport.notify} for more than one property, this is not a
	* typical usecase for _implied_ [observers]{@link enyo.ObserverSupport~Observer} as
	* the convention only registers them for the named property.
	*
	* There is yet another way to use [observers]{@link enyo.ObserverSupport~Observer} if necessary.
	* Using the API methods [observe]{@link enyo.ObserverSupport.observe} and
	* [unobserve]{@link enyo.ObserverSupport.unobserve} you can dynamically register and unregister
	* [observers]{@link enyo.ObserverSupport~Observer} as needed. For example:
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
	* Make sure to read the documentation regarding the use of the API methods as it is important
	* to use it correctly to avoid common pitfalls and memory leaks.
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
		* Determine if _observing_ is enabled. If
		* [stopNotifications]{@link enyo.ObserverSupport.stopNotifications} has been called then
		* this will return `false`.
		*
		* @see enyo.ObserverSupport.stopNotifications
		* @see enyo.ObserverSupport.startNotifications
		* @returns {Boolean} Whether or not the _callee_ is _observing_.
		*/
		isObserving: function () {
			return this._observing;
		},
		
		/**
		* Return an immutable list of [observers]{@link enyo.ObserverSupport~Observer} for the
		* given _path_ or all [observers]{@link enyo.ObserverSupport~Observer} for the _callee_.
		*
		* @param {String} [path] Find [observers]{@link enyo.ObserverSupport~Observer} for this
		*	_property_ or _property path_. If not provided all
		*	[observers]{@link enyo.ObserverSupport~Observer} for the _callee_ will be returned.
		* @returns {enyo.ObserverSupport~Observer[]} The immutable [array]{@link external:Array} of
		*	[observers]{@link enyo.ObserverSupport~Observer}.
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
		* Register an [observer]{@link enyo.ObserverSupport~Observer} to be
		* [notified]{@link enyo.ObserverSupport.notify} when the given property has been changed. It
		* is important to note that it is possible to register the same
		* [observer]{@link enyo.ObserverSupport~Observer} multiple times (this is entirely never the
		* intention) so care should be taken to avoid that scenario. It is also important to
		* understand how they are stored and unregistered
		* ([unobserved]{@link enyo.ObserverSupport.unobserve}). The _ctx_ (context) parameter is
		* stored with the [observer]{@link enyo.ObserverSupport~Observer} reference. If used, it
		* _should always be used_ when [unobserving]{@link enyo.ObserverSupport.unobserve} as well.
		*
		* @see enyo.ObserverSupport.unobserve
		* @param {String} path The _property_ or _property path_ to observe.
		* @param {enyo.ObserverSupport~Observer} fn The
		*	[observer]{@link enyo.ObserverSupport~Observer} method that responds to changes.
		* @param {*} [ctx] The _this_ (context) under which to execute the
		*	[observer]{@link enyo.ObserverSupport~Observer}.
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
		* Unregister an [observer]{@link enyo.ObserverSupport~Observer}. If a _ctx_ (context) was
		* supplied to [observe]{@link enyo.ObserverSupport.observe} it should also be supplied to
		* [unobserve]{@link enyo.ObserverSupport.unobserve}.
		*
		* @see enyo.ObserverSupport.observe
		* @param {String} path The _property_ or _property path_ to unobserve.
		* @param {enyo.ObserverSupport~Observer} fn The
		*	[observer]{@link enyo.ObserverSupport~Observer} method that responds to changes.
		* @param {*} [ctx] The _this_ (context) under which to execute the
		*	[observer]{@link enyo.ObserverSupport~Observer}.
		* @returns {this} The callee for chaining.
		* @public
		*/
		unobserve: function (path, fn, ctx) {
			return removeObserver(this, path, fn, ctx);
		},
		
		/**
		* Remove all [observers]{@link enyo.ObserverSupport~Observer} from the _callee_. If a
		* _path_ parameter is provided it will only remove
		* [observers]{@link enyo.ObserverSupport~Observer} for that _path_ (or property).
		*
		* @param {String} [path] A _property_ or _property path_ from which to remove all
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
		* Trigger any [observers]{@link enyo.ObserverSupport~Observer} for the given _path_. Must
		* supply the previous and current values. Typically this method is called automatically or
		* can forcibly be called when [setting]{@link enyo.Object#set} a value with the _force_
		* option.
		*
		* @param {String} path The _property_ or _property path_ to notify.
		* @param {*} was The previous value.
		* @param {*} is The current value.
		* @returns {this} The callee for chaining.
		*/
		notify: function (path, was, is, opts) {
			return notifyObservers(this, path, was, is, opts);
		},
		
		/**
		* Stop all [notifications]{@link enyo.ObserverSupport.notify} from propagating. By default,
		* all [notifications]{@link enyo.ObserverSupport.notify} will be queued and flushed once
		* [startNotifications]{@link enyo.ObserverSupport.startNotifications} has been called. There
		* is an optional flag here to also disable the queue or you can use the
		* [disableNotificationQueue]{@link enyo.ObserverSupport.disableNotificationQueue} and
		* [enableNotificationQueue]{@link enyo.ObserverSupport.enableNotificationQueue} API methods.
		* The [startNotifications]{@link enyo.ObserverSupport.startNotifications} method will need
		* to be called the same number of times this method has been called.
		*
		* @see enyo.ObserverSupport.startNotifications
		* @see enyo.ObserverSupport.disableNotificationQueue
		* @see enyo.ObserverSupport.enableNotificationQueue
		* @param {Boolean} [noQueue] If `true`, this will also disable the notification queue.
		* @returns {this} The callee for chaining.
		*/
		stopNotifications: function (noQueue) {
			this._observing = false;
			this._observeCount++;
			noQueue && this.disableNotificationQueue();
			return this;
		},
		
		/**
		* Start [notifications]{@link enyo.ObserverSupport.notify} if they have been
		* [disabled]{@link enyo.ObserverSupport.stopNotifications}. If the notification queue was
		* not disabled, this will automatically flush the queue of all notifications that were
		* encountered while stopped. This method needs to be called the same number of times that
		* [stopNotifications]{@link enyo.ObserverSupport.stopNotifications} was called.
		*
		* @see enyo.ObserverSupport.stopNotifications
		* @see enyo.ObserverSupport.disableNotificationQueue
		* @see enyo.ObserverSupport.enableNotificationQueue
		* @param {Boolean} [queue] If `true` and the notification queue is disabled, it will be
		*	re-enabled.
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
		* If the notification queue was disabled, this will re-enable it.
		*
		* @see enyo.ObserverSupport.disableNotificationQueue
		* @returns {this} The callee for chaining.
		*/
		enableNotificationQueue: function () {
			this._notificationQueueEnabled = true;
			return this;
		},
		
		/**
		* If the notification queue is enabled (default), it will be disabled. If there were
		* notifications currently in the queue, they will be removed.
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