require('enyo');

/**
* Contains the declaration for the {@link module:enyo/Animator~Animator} kind.
* @module enyo/Animator
*/

var
	kind = require('./kind'),
	utils = require('./utils'),
	animation = require('./animation');

var
	Component = require('./Component'),
	Jobs = require('./jobs');

/**
* Fires when an animation step occurs.
*
* @event module:enyo/Animator~Animator#onStep
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when the animation finishes normally.
*
* @event module:enyo/Animator~Animator#onEnd
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* Fires when the animation is prematurely stopped.
*
* @event module:enyo/Animator~Animator#onStop
* @type {Object}
* @property {Object} sender - The [component]{@link module:enyo/Component~Component} that most recently
*	propagated the {@glossary event}.
* @property {Object} event - An [object]{@glossary Object} containing event information.
* @public
*/

/**
* {@link module:enyo/Animator~Animator} is a basic animation [component]{@link module:enyo/Component~Component}.  Call
* [play()]{@link module:enyo/Animator~Animator#play} to start the animation. The animation will run for
* the period (in milliseconds) specified by its [duration]{@link module:enyo/Animator~Animator#duration}
* property. [onStep]{@link module:enyo/Animator~Animator#onStep} [events]{@glossary event} will
* fire in quick succession and should be handled to do something based on the
* [value]{@link module:enyo/Animator~Animator#value} property.
*
* The `value` property will progress from [startValue]{@link module:enyo/Animator~Animator#startValue}
* to [endValue]{@link module:enyo/Animator~Animator#endValue} during the animation, based on the
* [function]{@glossary Function} referenced by the
* [easingFunction]{@link module:enyo/Animator~Animator#easingFunction} property.
* 
* Event handlers may be specified as functions. If specified, the handler function will
* be used to handle the event directly, without sending the event to its
* [owner]{@link module:enyo/Component~Component#owner} or [bubbling]{@link module:enyo/Component~Component#bubble} it.
* The [context]{@link module:enyo/Animator~Animator#context} property may be used to call the supplied
* event functions in a particular `this` context.
* 
* During animation, an {@link module:enyo/jobs} priority of 5 is registered to defer low priority
* tasks.
*
* @class Animator
* @extends module:enyo/Component~Component
* @public
*/
module.exports = kind(
	/** @lends module:enyo/Animator~Animator.prototype */ {

	/**
	* A context in which to run the specified {@glossary event} handlers. If this is
	* not specified or is falsy, then the [global object]{@glossary global} is used.
	* 
	* @name context
	* @type {Object}
	* @default undefined
	* @memberOf module:enyo/Animator~Animator.prototype
	* @public
	*/
		
	name: 'enyo.Animator',

	/**
	* @private
	*/
	kind: Component,

	/**
	* @private
	*/
	published: 
		/** @lends module:enyo/Animator~Animator.prototype */ {
		
		/** 
		* Animation duration in milliseconds
		*
		* @type {Number}
		* @default 350
		* @public
		*/
		duration: 350,

		/** 
		* Value of [value]{@link module:enyo/Animator~Animator#value} property at the beginning of an animation.
		*
		* @type {Number}
		* @default 0
		* @public
		*/
		startValue: 0,

		/** 
		* Value of [value]{@link module:enyo/Animator~Animator#value} property at the end of an animation.
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
		* [startValue]{@link module:enyo/Animator~Animator#startValue} to [endValue]{@link module:enyo/Animator~Animator#endValue}.
		* 
		* @type {Function}
		* @default module:enyo/easing~easing.cubicOut
		* @public
		*/
		easingFunction: animation.easing.cubicOut
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
	constructed: kind.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this._next = this.bindSafely('next');
		};
	}),

	/**
	* @method
	* @private
	*/
	destroy: kind.inherit(function (sup) {
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
			utils.mixin(this, props);
		}
		this.t0 = this.t1 = utils.perfNow();
		this.value = this.startValue;

		// register this jobPriority to block less urgent tasks from executing
		Jobs.registerPriority(5, this.id);

		this.job = true;
		this.next();
		return this;
	},

	/** 
	* Stops the animation and fires the associated {@glossary event}.
	*
	* @fires module:enyo/Animator~Animator#onStop
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
			var now = this.t1 = utils.perfNow();
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
		this.job = animation.requestAnimationFrame(this._next, this.node);
	},

	/**
	* @private
	*/
	cancel: function () {
		animation.cancelRequestAnimationFrame(this.job);
		this.node = null;
		this.job = null;

		// unblock job queue
		Jobs.unregisterPriority(this.id);
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
	* @fires module:enyo/Animator~Animator#onStep
	* @fires module:enyo/Animator~Animator#onEnd
	* @private
	*/
	next: function () {
		this.t1 = utils.perfNow();
		this.dt = this.t1 - this.t0;
		var args = this.easingFunction.length;
		var f;

		if (args === 1) {
			// time independent
			f = this.fraction = animation.easedLerp(this.t0, this.duration, this.easingFunction, this.reversed);
			this.value = this.startValue + f * (this.endValue - this.startValue);
		} else {
			this.value = animation.easedComplexLerp(this.t0, this.duration, this.easingFunction, this.reversed,
				this.dt, this.startValue, (this.endValue - this.startValue));
		}
		if (((f >= 1) && (args === 1)) || this.shouldEnd()) {
			this.value = this.endValue;
			this.fraction = 1;
			this.fire('onStep');
			this.cancel();
			utils.asyncMethod(this.bindSafely(function() {
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
		if (utils.isString(fn)) {
			this.bubble(nom);
		} else if (fn) {
			fn.call(this.context || global, this);
		}
	}
});
