(function (enyo) {
	
	// var forEach = enyo.forEach
	var toArray = enyo.toArray
		// , findIndex = enyo.findIndex
		// , filter = enyo.filter
		, uid = enyo.uid
		, eventTable = {};
	
	/**
	* @private
	*/
	function addListener(obj, e, fn, ctx) {

		obj.listeners().push({
			event: e,
			method: fn,
			ctx: ctx || obj
		});
		
		return obj;
	}
	
	/**
	* @private
	*/
	function removeListener(obj, e, fn, ctx) {
		var listeners = obj.listeners()
			, idx;
			
		if (listeners.length) {
			idx = listeners.findIndex(function (ln) {
				return ln.event == e && ln.method === fn && (ctx? ln.ctx === ctx: true);
			});
			idx >= 0 && listeners.splice(idx, 1);
		}
		
		return obj;
	}
	
	/**
	* @private
	*/
	function emit(obj, args) {
		var len = args.length
			, e = args[0]
			, listeners = obj.listeners(e);
			
		if (listeners.length) {
			if (len > 1) {
				args = toArray(args);
				args.unshift(obj);
			} else {
				args = [obj, e];
			}

			for (var i=0, ln; (ln=listeners[i]); ++i) ln.method.apply(ln.ctx, args);
			
			return true;
		}
		
		return false;
	}
	
	/**
	* This mixin adds support for registered event listeners. These events are different from
	* the bubbled events (e.g. DOM events and [handlers]{@link enyo.Component#handlers}). When
	* [emitted]{@link enyo.EventEmitter.emit} they _do not bubble_ and will only be handled by
	* [registered listeners]{@link enyo.EventEmitter.on}.
	*
	* @mixin enyo.EventEmitter
	* @public
	*/
	enyo.EventEmitter = {
		
		/**
		* @private
		*/
		name: 'EventEmitter',
		
		/**
		* @private
		*/
		_silenced: false,
		
		/**
		* @private
		*/
		_silenceCount: 0,
		
		/**
		* Disallow propagation of events. This is a counting semaphor and
		* [unsilence]{@link enyo.EventEmitter.unsilence} will need to be called the same number of
		* times that this method is called.
		*
		* @see enyo.EventEmitter.unsilence
		* @returns {this} The callee for chaining.
		* @public
		*/
		silence: function () {
			this._silenced = true;
			this._silenceCount++;
			return this;
		},
		
		/**
		* Enable propagation of events. This is a counting semaphor and this method will need to be
		* called the same number of times that [silence]{@link enyo.EventEmitter.silence} was
		* called.
		*
		* @see enyo.EventEmitter.silence
		* @returns {this} The callee for chaining.
		* @public
		*/
		unsilence: function (force) {
			if (force) {
				this._silenceCount = 0;
				this._silenced = false;
			} else {
				this._silenceCount && this._silenceCount--;
				this._silenceCount === 0 && (this._silenced = false);
			}
			return this;
		},
		
		/**
		* Determine if the callee is currently [silenced]{@link enyo.EventEmitter.silence}.
		*
		* @returns {Boolean} Whether or not the callee is
		*	[silenced]{@link enyo.EventEmitter.silence}.
		* @public
		*/
		isSilenced: function () {
			return this._silenced;
		},
		
		/**
		* @alias enyo.EventEmitter.on
		* @deprecated
		* @public
		*/
		addListener: function (e, fn, ctx) {			
			return addListener(this, e, fn, ctx);
		},
		
		/**
		* Add an event listener. Until [removed]{@link enyo.EventEmitter.off} this listener will
		* fire every time the event is [emitted]{@link enyo.EventEmitter.emit}.
		*
		* @param {String} e The event name to register for.
		* @param {Function} fn The listener.
		* @param {Object} [ctx] The optional context under which to execute the listener.
		* @returns {this} The callee for chaining.
		* @public
		*/
		on: function (e, fn, ctx) {
			return addListener(this, e, fn, ctx);
		},
		
		/**
		* @alias enyo.EventEmitter.off
		* @deprecated
		* @public
		*/
		removeListener: function (e, fn, ctx) {
			return removeListener(this, e, fn, ctx);
		},
		
		/**
		* Remove an event listener.
		*
		* @param {String} e The event name.
		* @param {Function} fn The listener to unregister.
		* @param {Object} [ctx] If the listener was registered with a context it should be provided
		*	when unregistered as well.
		* @returns {this} The callee for chaining.
		* @public
		*/
		off: function (e, fn, ctx) {
			return removeListener(this, e, fn, ctx);
		},
		
		/**
		* Remove all listeners or all listeners for a given event.
		*
		* @param {String} [e] The optional target event.
		* @returns {this} The callee for chaining.
		*/
		removeAllListeners: function (e) {
			var euid = this.euid
				, loc = euid && eventTable[euid];
			
			if (loc) {
				if (e) {
					eventTable[euid] = loc.filter(function (ln) {
						return ln.event != e;
					});
				} else {
					eventTable[euid] = null;
				}
			}
			
			return this;
		},
		
		/**
		* Primarily for internal use, returns an immutable copy of all listeners or all listeners
		* for a particular event (if any).
		*
		* @param {String} [e] The targeted event.
		* @returns {Object[]} Event listeners are stored in [hashes]{@link external:Object}. The
		*	returns value will be an [array]{@link external:Array} of these
		*	[hashes]{@link external:Object} if any listeners exist.
		* @public
		*/
		listeners: function (e) {
			var euid = this.euid || (this.euid = uid('e'))
				, loc = eventTable[euid] || (eventTable[euid] = []);
			
			return !e? loc: loc.filter(function (ln) {
				return ln.event == e || ln.event == '*';
			});
		},
		
		/**
		* @alias enyo.EventEmitter.emit
		* @deprecated
		* @public
		*/
		triggerEvent: function () {
			return !this._silenced? emit(this, arguments): false;
		},
		
		/**
		* Emit the named event. All subsequent arguments will be passed to the event listeners.
		*
		* @param {String} e The event to emit.
		* @param {...*} args All subsequent arguments will be passed to the event listeners.
		* @returns {Boolean} Whether or not any listeners were notified.
		* @public
		*/
		emit: function () {
			return !this._silenced? emit(this, arguments): false;
		}
	};
	
	/**
	* @alias enyo.EventEmitter
	* @public
	*/
	enyo.RegisteredEventSupport = enyo.EventEmitter;
	
})(enyo);
