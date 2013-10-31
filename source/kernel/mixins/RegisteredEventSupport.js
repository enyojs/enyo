(function (enyo) {
	//*@protected
	var _eventMap = {};
	//*@public
	/**
		While _enyo.Component_ employs a bubble/waterfall event scheme this is
		not always desirable for objects that may/may not reside in the normal flow
		or need to emit events in this fashion. For those objects they employ a listener
		event scheme where only objects registered for a specific event on an instance
		of an object will receive notifications.
	
		Objects employing this event scheme may also use the bubble/waterfall event
		system as they do not interfere. An object instance does not need to have this
		mixin applied in order to be able to register a listener for an event on an object
		that does use it.
	*/
	enyo.RegisteredEventSupport = {
		name: "RegisteredEventSupport",
		/**
			Sets a flag that disables event propagation for this component. Also
			increments an internal counter that tracks the number of times the
			_unsilence_ method must be called before event propagation will continue.
		
			Note this method will also silence bubble/waterfall events if applied to
			an _enyo.Component_.
		*/
		silence: function () {
			this._silenced = true;
			this._silenceCount += 1;
		},
		/**
			Allows event propagation for this component if the internal silence counter
			is 0; otherwise, decrements the counter by one.  For event propagation to
			resume, this method must be called one time for each call to _silence_.
		*/
		unsilence: function () {
			if (0 !== this._silenceCount) {
				--this._silenceCount;
			}
			if (0 === this._silenceCount) {
				this._silenced = false;
			}
		},
		/**
			Returns `true` if the object is currently _silenced_ and will not propagate
			events (of any kind) otherwise `false`.
		*/
		isSilenced: function () {
			return this._silenced;
		},
		/**
			Adds a listener for the given event. Callbacks will be executed with two
			parameters of the form _(record, event)_, where _record_ is the record
			that is firing the event and _event_ is the name (string) for the event
			being fired. This method accepts parameters according to the
			_enyo.ObserverSupport_ API, but does not function in the same way.
		*/
		addListener: function (prop, fn, ctx) {
			var _eid  = this.eventId    || (this.eventId = enyo.uid("__eventId__")),
				_emap = _eventMap[_eid] || (_eventMap[_eid] = {}),
				_e    = _emap[prop]     || (_emap[prop] = []);
			// whether or not an entry already existed for this object and the requested
			// property we know we have a valid entry in the map for it so we can
			// add it
			fn = (fn && ctx)? enyo.bindSafely(ctx, fn): fn;
			if (typeof fn != "function") {
				throw "enyo.RegisteredEventSupport.addListener: must supply a valid function " +
					"or if a string must supply a context";
			}
			if (!_e.length || !~enyo.indexOf(fn, _e)) {
				_e.push(fn);
			}
			return fn;
		},
		/**
			Removes a listener. Accepts the name of the event that the listener is
			registered on and the method returned from the _addListener()_ call. Returns
			a reference to the object for chaining.
		*/
		removeListener: function (prop, fn) {
			var ls = this.listeners(prop);
			if (ls.length) {
				var idx = enyo.indexOf(fn, ls);
				if (!!~idx) {
					ls.splice(idx, 1);
				}
			}
			return this;
		},
		/**
			Removes any and all registered event listeners from the object for _event_
			or if no _event_ is provided will remove listeners for any event. Returns
			a reference to the object for chaining.
		*/
		removeAllListeners: function (event) {
			var _eid  = this.eventId,
				_emap = _eventMap[_eid],
				ls;
			if (_emap) {
				if (event) {
					ls = this.listeners(event);
					ls.splice(0, ls.length);
				} else {
					// simply remove them all
					_eventMap[_eid] = {};
				}
			}
			return this;
		},
		/**
			Triggers any listeners for the record's specified event, with optional
			_args_. Returns a reference to the object for chaining.
		*/
		triggerEvent: function (event, args) {
			if (!this.isSilenced()) {
				var ls = this.listeners(event);
				if (ls.length) {
					ls = ls.slice();
					for (var i=0, fn; i<ls.length; ++i) {
						fn = ls[i];
						fn(this, event, args);
					}
				}
			}
			return this;
		},
		/**
			Retrieves the array of listeners registered for this object on _event_.
			Will return an empty array if no listeners are currently registered. This
			will be a reference to the stored listeners array for efficiency purposes -
			changes to this array are not advised and may have undesirable side effects.
		*/
		listeners: function (event) {
			var _eid  = this.eventId,
				_emap = _eventMap[_eid],
				// we are not assigning it here, simply making sure we have a return
				// value
				_e    = (_emap && _emap[event]) || [];
			return _e;
		},
		//*@protected
		_silenced: false,
		_silenceCount: 0
	};
	
})(enyo);
