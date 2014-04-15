(function (enyo) {
	
	// var forEach = enyo.forEach
	var toArray = enyo.toArray
		// , findIndex = enyo.findIndex
		// , filter = enyo.filter
		, uid = enyo.uid
		, eventTable = {};
	
	/**
		@private
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
		@private
	*/
	function removeListener(obj, e, fn, ctx) {
		var listeners = obj.listeners()
			, idx;
			
		if (listeners.length) {
			idx = listeners.findIndex(function (ln) {
				return ln.event == e && ln.method === fn && ctx? ln.ctx === ctx: true;
			});
			idx >= 0 && listeners.splice(idx, 1);
		}
		
		return obj;
	}
	
	/**
		@private
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
		@public
		@mixin
	*/
	enyo.EventEmitter = {
		name: "EventEmitter",
		
		/**
			@private
		*/
		_silenced: false,
		
		/**
			@private
		*/
		_silenceCount: 0,
		
		/**
			@public
			@method
		*/
		silence: function () {
			this._silenced = true;
			this._silenceCount++;
			return this;
		},
		
		/**
			@public
			@method
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
			@public
			@method
		*/
		isSilenced: function () {
			return this._silenced;
		},
		
		/**
			@public
			@method
		*/
		addListener: function (e, fn, ctx) {			
			return addListener(this, e, fn, ctx);
		},
		
		/**
			@public
			@method
			@alias addListener
		*/
		on: function (e, fn, ctx) {
			return addListener(this, e, fn, ctx);
		},
		
		/**
			@public
			@method
		*/
		removeListener: function (e, fn, ctx) {
			return removeListener(this, e, fn, ctx);
		},
		
		/**
			@public
			@method
		*/
		off: function (e, fn, ctx) {
			return removeListener(this, e, fn, ctx);
		},
		
		/**
			@public
			@method
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
			@public
			@method
		*/
		listeners: function (e) {
			var euid = this.euid || (this.euid = uid("e"))
				, loc = eventTable[euid] || (eventTable[euid] = []);
			
			return !e? loc: loc.filter(function (ln) {
				return ln.event == e || ln.event == "*";
			});
		},
		
		/**
			@public
			@method
			@alias emit
		*/
		triggerEvent: function () {
			return !this._silenced? emit(this, arguments): false;
		},
		
		/**
			@public
			@method
		*/
		emit: function () {
			return !this._silenced? emit(this, arguments): false;
		}
	};
	
	/**
		For backward compatibility we alias the EventEmitter mixin.
	
		@public
		@alias enyo.EventEmitter
	*/
	enyo.RegisteredEventSupport = enyo.EventEmitter;
	
})(enyo);
