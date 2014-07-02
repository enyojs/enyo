(function (enyo, scope) {
	/**
	* Fires when an animation step occurs.
	*
	* @event enyo.Animator#onStep
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
	*                           propagated the [event]{@link external:event}.
	* @property {Object} event - An [object]{@link external:Object} containing 
	*                          [event]{@link external:event} information.
	* @public
	*/

	/**
	* Fires when the animation finishes normally.
	*
	* @event enyo.Animator#onEnd
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
	*                           propagated the [event]{@link external:event}.
	* @property {Object} event - An [object]{@link external:Object} containing 
	*                          [event]{@link external:event} information.
	* @public
	*/

	/**
	* Fires when the animation is prematurely stopped.
	*
	* @event enyo.Animator#onStop
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
	*                           propagated the [event]{@link external:event}.
	* @property {Object} event - An [object]{@link external:Object} containing 
	*                          [event]{@link external:event} information.
	* @public
	*/

	/**
	* _enyo.Animator_ is a basic animation [component]{@link enyo.Component}.  Call 
	* [play]{@link enyo.Animator#play} to start the animation. The animation will run for the period 
	* (in milliseconds) specified by its [duration]{@link enyo.Animator#duration} property. The 
	* [onStep]{@link enyo.Animator#event:onStep} [event]{@link external:event} will fire in quick 
	* succession and should be handled to do something based on the [value]{@link enyo.Animator#value} 
	* property.
	* 
	* The [value]{@link enyo.Animator#value} property will progress from 
	* [startValue]{@link enyo.Animator#startValue} to [endValue]{@link enyo.Animator#endValue} during
	* the animation based on the [function]{@link external:Function} referenced by the 
	* [easingFunction]{@link enyo.Animator#easingFunction} property.
	* 
	* [Event]{@link external:event} handlers may be specified as [functions]{@link external:Function}. 
	* If specified, the handler [function]{@link external:Function} will be used to handle the 
	* [event]{@link external:event} directly, without sending the [event]{@link external:event} to its 
	* [owner]{@link enyo.Component#owner} or [bubbling]{@link enyo.Component#bubble} it. The 
	* [context]{@link enyo.Animator#context} property can be used to call the supplied 
	* [event]{@link external:event} [functions]{@link external:Function} in a particular "this" context.
	* 
	* During animation, an {@link enyo.jobs} priority of 5 is registered to defer low priority tasks.
	*
	* @class enyo.Animator
	* @extends enyo.Component
	* @public
	*/
	enyo.kind(
		/** @lends enyo.Animator.prototype */ {

		/**
		* Specify a _context_ in which to run the specified [event]{@link external:Event} handlers. If 
		* this is not specified or is falsy, then the [window object]{@link external:window} is used.
		* 
		* @name context
		* @type {Object}
		* @default undefined
		* @memberOf enyo.Animator.prototype
		* @public
		*/

		/**
		* @private
		*/
		name: 'enyo.Animator',

		/**
		* @private
		*/
		kind: 'Component',

		/**
		* @private
		*/
		published: {
			/** 
			* Animation duration in milliseconds
			*
			* @type {Number}
			* @default 350
			* @memberof enyo.Animator.prototype
			* @public
			*/
			duration: 350,

			/** 
			* Value of [value]{@link enyo.Animator#value} property at the beginning of an animation.
			*
			* @type {Number}
			* @default 0
			* @memberof enyo.Animator.prototype
			* @public
			*/
			startValue: 0,

			/** 
			* Value of [value]{@link enyo.Animator#value} property at the end of an animation.
			*
			* @type {Number}
			* @default 1
			* @memberof enyo.Animator.prototype
			* @public
			*/
			endValue: 1,

			/** 
			* Node that must be visible in order for the animation to continue. This reference is 
			* destroyed when the animation ceases.
			*
			* @type {Object}
			* @default null
			* @memberof enyo.Animator.prototype
			* @public
			*/
			node: null,

			/** 
			* [Function]{@link external:Function} that determines how the animation progresses from 
			* [startValue]{@link enyo.Animator#startValue} to [endValue]{@link enyo.Animator#endValue}.
			* 
			* @type {Function}
			* @default enyo.easing.cubicOut
			* @memberof enyo.Animator.prototype
			* @public
			*/
			easingFunction: enyo.easing.cubicOut
		},
		/*
		* @private
		*/
		events: {
			onStep: '',
			onEnd: '',
			onStop: ''
		},

		/**
		* @private
		*/
		constructed: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				this._next = this.bindSafely('next');
			};
		}),

		/**
		* @private
		*/
		destroy: enyo.inherit(function (sup) {
			return function() {
				this.stop();
				sup.apply(this, arguments);
			};
		}),

		/** 
		* Plays the animation.
		*
		* @param {Object} [props] As a convenience, this [hash]{@link external:Object} will be mixed
		*                         directly into this [object]{@link external:Object}.
		* @public
		*/
		play: function(props) {
			this.stop();
			this.reversed = false;
			if (props) {
				enyo.mixin(this, props);
			}
			this.t0 = this.t1 = enyo.perfNow();
			this.value = this.startValue;

			// register this jobPriority to block less urgent tasks from executing
			enyo.jobs.registerPriority(5, this.id);

			this.job = true;
			this.next();
			return this;
		},

		/** 
		* Stops the animation and fires the associated [event]{@link external:event}.
		*
		* @fires enyo.Animator#event:onStop
		* @returns {this} The callee for chaining.
		* @public
		*/
		stop: function() {
			if (this.isAnimating()) {
				this.cancel();
				this.fire('onStop');
				return this;
			}
		},

		/** 
		* Reverses the direction of a running animation.
		* 
		* @return {this} The callee for chaining.
		* @public
		*/
		reverse: function() {
			if (this.isAnimating()) {
				this.reversed = !this.reversed;
				var now = this.t1 = enyo.perfNow();
				// adjust start time (t0) to allow for animation done so far to replay
				var elapsed = now - this.t0;
				this.t0 = now + elapsed - this.duration;
				// swap start and end values
				var startValue = this.startValue;
				this.startValue = this.endValue;
				this.endValue = startValue;
				return this;
			}
		},

		/**
		* Determine if animation is in progress.
		*
		* @returns {Boolean} `true` if there is an animation currently running, otherwise `false`.
		* @private
		*/
		isAnimating: function() {
			return Boolean(this.job);
		},

		/**
		* @private
		*/
		requestNext: function() {
			this.job = enyo.requestAnimationFrame(this._next, this.node);
		},

		/**
		* @private
		*/
		cancel: function() {
			enyo.cancelRequestAnimationFrame(this.job);
			this.node = null;
			this.job = null;

			// unblock job queue
			enyo.jobs.unregisterPriority(this.id);
		},

		/**
		* @private
		*/
		shouldEnd: function() {
			return (this.dt >= this.duration);
		},

		/**
		* Runs the next step of the animation.
		*
		* @fires enyo.Animator#event:onStep
		* @fires enyo.Animator#event:onEnd
		* @private
		*/
		next: function() {
			this.t1 = enyo.perfNow();
			this.dt = this.t1 - this.t0;
			var args = this.easingFunction.length;
			var f;

			if (args === 1) {
				// time independent
				f = this.fraction = enyo.easedLerp(this.t0, this.duration, this.easingFunction, this.reversed);
				this.value = this.startValue + f * (this.endValue - this.startValue);
			} else {
				this.value = enyo.easedComplexLerp(this.t0, this.duration, this.easingFunction, this.reversed,
					this.dt, this.startValue, (this.endValue - this.startValue));
			}
			if (((f >= 1) && (args === 1)) || this.shouldEnd()) {
				this.value = this.endValue;
				this.fraction = 1;
				this.fire('onStep');
				this.cancel();
				enyo.asyncMethod(this.bindSafely(function() {
					this.fire('onEnd');
				}));
			} else {
				this.fire('onStep');
				this.requestNext();
			}
		},

		/**
		* @private
		*/
		fire: function(nom) {
			var fn = this[nom];
			if (enyo.isString(fn)) {
				this.bubble(nom);
			} else if (fn) {
				fn.call(this.context || window, this);
			}
		}
	});
})(enyo, this);
