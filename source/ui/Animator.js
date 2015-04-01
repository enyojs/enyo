(function (enyo, scope) {
	/**
	* Fires when an animation step occurs.
	*
	* @event enyo.Animator#onStep
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires when the animation finishes normally.
	*
	* @event enyo.Animator#onEnd
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* Fires when the animation is prematurely stopped.
	*
	* @event enyo.Animator#onStop
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently
	*	propagated the {@glossary event}.
	* @property {Object} event - An [object]{@glossary Object} containing event information.
	* @public
	*/

	/**
	* {@link enyo.Animator} is a basic animation [component]{@link enyo.Component}.  Call
	* [play()]{@link enyo.Animator#play} to start the animation. The animation will run for
	* the period (in milliseconds) specified by its [duration]{@link enyo.Animator#duration}
	* property. [onStep]{@link enyo.Animator#onStep} [events]{@glossary event} will
	* fire in quick succession and should be handled to do something based on the
	* [value]{@link enyo.Animator#value} property.
	*
	* The `value` property will progress from [startValue]{@link enyo.Animator#startValue}
	* to [endValue]{@link enyo.Animator#endValue} during the animation, based on the
	* [function]{@glossary Function} referenced by the
	* [easingFunction]{@link enyo.Animator#easingFunction} property.
	* 
	* Event handlers may be specified as functions. If specified, the handler function will
	* be used to handle the event directly, without sending the event to its
	* [owner]{@link enyo.Component#owner} or [bubbling]{@link enyo.Component#bubble} it.
	* The [context]{@link enyo.Animator#context} property may be used to call the supplied
	* event functions in a particular `this` context.
	* 
	* During animation, an {@link enyo.jobs} priority of 5 is registered to defer low priority 
	* tasks.
	*
	* @class enyo.Animator
	* @extends enyo.Component
	* @public
	*/
	enyo.kind(
		/** @lends enyo.Animator.prototype */ {

		/**
		* A context in which to run the specified {@glossary event} handlers. If this is
		* not specified or is falsy, then the [window object]{@glossary window} is used.
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
		kind: 'enyo.Component',

		/**
		* @private
		*/
		published: 
			/** @lends enyo.Animator.prototype */ {
			
			/** 
			* Animation duration in milliseconds
			*
			* @type {Number}
			* @default 350
			* @public
			*/
			duration: 350,

			/** 
			* Value of [value]{@link enyo.Animator#value} property at the beginning of an animation.
			*
			* @type {Number}
			* @default 0
			* @public
			*/
			startValue: 0,

			/** 
			* Value of [value]{@link enyo.Animator#value} property at the end of an animation.
			*
			* @type {Number}
			* @default 1
			* @public
			*/
			endValue: 1,

			/** 
			* Node that must be visible in order for the animation to continue. This reference is 
			* destroyed when the animation ceases.
			*
			* @type {Object}
			* @default null
			* @public
			*/
			node: null,

			/** 
			* [Function]{@glossary Function} that determines how the animation progresses from 
			* [startValue]{@link enyo.Animator#startValue} to [endValue]{@link enyo.Animator#endValue}.
			* 
			* @type {Function}
			* @default enyo.easing.cubicOut
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
		* @method
		* @private
		*/
		constructed: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				this._next = this.bindSafely('next');
			};
		}),

		/**
		* @method
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
		* @param {Object} props - As a convenience, this [hash]{@glossary Object} will be mixed
		*	directly into this [object]{@glossary Object}.
		* @public
		*/
		play: function (props) {
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
		* Stops the animation and fires the associated {@glossary event}.
		*
		* @fires enyo.Animator#onStop
		* @returns {this} The callee for chaining.
		* @public
		*/
		stop: function () {
			if (this.isAnimating()) {
				this.cancel();
				this.fire('onStop');
				return this;
			}
		},

		/**
		* Stops the animation after a final step
		*
		* @returns {this} The callee for chaining
		* @public
		*/
		complete: function () {
			if (this.isAnimating()) {
				// set the start time such that the delta will always be greater than the duration
				// causing the animation to complete immediately
				this.t0 = -this.duration - 1;
				this.next();
			}

			return this;
		},

		/** 
		* Reverses the direction of a running animation.
		* 
		* @return {this} The callee for chaining.
		* @public
		*/
		reverse: function () {
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
		* Determines whether an animation is in progress.
		*
		* @returns {Boolean} `true` if there is an animation currently running; otherwise, `false`.
		* @private
		*/
		isAnimating: function () {
			return Boolean(this.job);
		},

		/**
		* @private
		*/
		requestNext: function () {
			this.job = enyo.requestAnimationFrame(this._next, this.node);
		},

		/**
		* @private
		*/
		cancel: function () {
			enyo.cancelRequestAnimationFrame(this.job);
			this.node = null;
			this.job = null;

			// unblock job queue
			enyo.jobs.unregisterPriority(this.id);
		},

		/**
		* @private
		*/
		shouldEnd: function () {
			return (this.dt >= this.duration);
		},

		/**
		* Runs the next step of the animation.
		*
		* @fires enyo.Animator#onStep
		* @fires enyo.Animator#onEnd
		* @private
		*/
		next: function () {
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
		fire: function (nom) {
			var fn = this[nom];
			if (enyo.isString(fn)) {
				this.bubble(nom);
			} else if (fn) {
				fn.call(this.context || window, this);
			}
		}
	});

})(enyo, this);
