(function (enyo, scope) {

	/**
	* An abstract [kind]{@glossary kind} designed to aid in handling asynchronous operations.
	* It represents a task that has not yet completed. Callback functions may be registered to be
	* notified when the task is complete.
	*
	* For more information, see the documentation on [Consuming Web
	* Services]{@linkplain $dev-guide/building-apps/managing-data/consuming-web-services.html}
	* in the Enyo Developer Guide.
	*
	* @class enyo.Async
	* @extends enyo.Object
	* @public
	*/
	enyo.kind(
		/** @lends enyo.Async.prototype */ {
		
		/**
		* @private
		*/
		name: 'enyo.Async',
		
		/**
		* @private
		*/
		kind: 'enyo.Object',
		
		/**
		* @private
		*/
		published: {
			
			/**
			* The number of milliseconds to wait after [execution]{@link enyo.Async#go} begins
			* before failing with a timeout error. If set to `0` (the default), will not
			* automatically throw a timeout error.
			*
			* @type {Number}
			* @default 0
			* @memberof enyo.Aysnc.prototype
			* @public
			*/
			timeout: 0
		},
		
		/**
		* Will be `true` if an error has occurred and a handler calls the
		* [fail()]{@link enyo.Async#fail} method. Can be cleared using
		* [recover()]{@link enyo.Async#recover}.
		*
		* @readonly
		* @type {Boolean}
		* @default false
		* @public
		*/
		failed: false,
		
		/**
		* @private
		*/
		context: null,
		
		/**
		* @method
		* @private
		*/
		constructor: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				this.responders = [];
				this.errorHandlers = [];
				this.progressHandlers = [];
			};
		}),
		
		/**
		* @method
		* @private
		*/
		destroy: enyo.inherit(function (sup) {
			return function () {
				if (this.timeoutJob) {
					this.clearTimeout();
				}
				sup.apply(this, arguments);
			};
		}),
		
		/**
		* @private
		*/
		accumulate: function (array, fn, ctx) {
			var tmp;
			
			// to preserve backward compatibility we have to accept that the order of the arguments
			// might be different
			if (ctx && typeof ctx == 'function') {
				tmp = fn;
				fn = ctx;
				ctx = tmp;
			}
			
			// we go ahead and bind the method to its context to preserve the original
			// implementation
			if (ctx) {
				if (typeof ctx == "string") {
					fn = enyo.bind(fn, ctx);
				} else {
					fn = fn.bind(ctx);
				}
			}
			
			// now store it for use later
			array.push(fn);
		},
		
		/**
		* Registers a [function]{@glossary Function} to be fired when
		* [execution]{@link enyo.Async#go} is completed successfully. Parameters may be
		* in any order, to preserve backward compatibility.
		*
		* @param {Function} fn - The callback to register.
		* @param {Object} [ctx] - The optional context under which to execute the callback.
		* @returns {this} The callee for chaining.
		* @public
		*/
		response: function (fn, ctx) {
			this.accumulate(this.responders, fn, ctx);
			return this;
		},
		
		/**
		* Registers a [function]{@glossary Function} to be fired when
		* [execution]{@link enyo.Async#go} completes with an error. Parameters may be
		* in any order, to preserve backward compatibility.
		*
		* @param {Function} fn - The callback to register.
		* @param {Object} [ctx] - The optional context under which to execute the callback.
		* @returns {this} The callee for chaining.
		* @public
		*/
		error: function (fn, ctx) {
			this.accumulate(this.errorHandlers, fn, ctx);
			return this;
		},
		
		/**
		* Registers a [function]{@glossary Function} to be fired on progress events.
		* Parameters may be in any order, to preserve backward compatibility.
		*
		* @param {Function} fn - The callback to register.
		* @param {Object} [ctx] - The optional context under which to execute the callback.
		* @returns {this} The callee for chaining.
		* @public
		*/
		progress: function (fn, ctx) {
			this.accumulate(this.progressHandlers, fn, ctx);
			return this;
		},
		
		/**
		* @private
		*/
		route: function (async, value) {
			var r = this.bindSafely('respond');
			async.response(function (sender, value) {
				r(value);
			});
			var f = this.bindSafely('fail');
			async.error(function (sender, value) {
				f(value);
			});
			async.go(value);
		},
		
		/**
		* @private
		*/
		handle: function (value, handlers) {
			var r = handlers.shift();
			if (r) {
				if (r instanceof enyo.Async) {
					this.route(r, value);
				} else {
					// handler can return a new 'value'
					var v = enyo.call(this.context || this, r, [this, value]);
					// ... but only if it returns something other than undefined
					v = (v !== undefined) ? v : value;
					// next handler
					(this.failed ? this.fail : this.respond).call(this, v);
				}
			}
		},
		
		/**
		* @private
		*/
		startTimer: function () {
			this.startTime = enyo.perfNow();
			if (this.timeout) {
				this.timeoutJob = setTimeout(this.bindSafely('timeoutComplete'), this.timeout);
			}
		},
		
		/**
		* @private
		*/
		endTimer: function () {
			if (this.timeoutJob) {
				this.endTime = enyo.perfNow();
				clearTimeout(this.timeoutJob);
				this.timeoutJob = null;
				this.latency = this.endTime - this.startTime;
			}
		},
		
		/**
		* @private
		*/
		timeoutComplete: function () {
			this.timedout = true;
			this.fail('timeout');
		},
		
		/**
		* Triggers the handler chain for valid outcomes.
		*
		* @private
		*/
		respond: function (value) {
			this.failed = false;
			this.endTimer();
			this.handle(value, this.responders);
		},

		/**
		* Fails the [task]{@link enyo.Async} and triggers the error chain. May be called from any
		* handler.
		* 
		* @param {*} err - The error value to pass to error handlers.
		* @returns {this} The callee for chaining.
		* @public
		*/
		fail: function (err) {
			this.failed = true;
			this.endTimer();
			this.handle(err, this.errorHandlers);
			
			return this;
		},
		
		/**
		* Clears the error condition ([failed]{@link enyo.Async#failed}) by setting it to `false`.
		* If called while responding to handlers, it will continue.
		*
		* @returns {this} The callee for chaining.
		* @public
		*/
		recover: function () {
			this.failed = false;
			return this;
		},
		
		/**
		* @private
		*/
		sendProgress: function(current, min, max, sourceEvent) {
			var event = enyo.mixin({}, sourceEvent);
			event.type = 'progress';
			event.current = current;
			event.min = min;
			event.max = max;
			for (var i = 0; i < this.progressHandlers.length; i++) {
				enyo.call(this.context || this, this.progressHandlers[i], [this, event]);
			}
		},
		
		/**
		* Initiates the asynchronous routine, supplying the given value if it completes
		* successfully. This method is usually overloaded in [subkinds]{@glossary subkind}.
		*
		* @virtual
		* @param {*} - value The value to pass to responders.
		* @returns {this} The callee for chaining.
		* @public
		*/
		go: function(value) {
			this.sendProgress(0, 0, 1);
			enyo.asyncMethod(this, function() {
				this.sendProgress(1, 0, 1);
				this.respond(value);
			});
			return this;
		}
	});
	
})(enyo, this);
