require('enyo');

var
	kind = require('../kind'),
	animation = require('./Core'),
	activator = require('./KeyFrame'),
	delegator = require('./EventDelegator'),
	EventEmitter = require('../EventEmitter'),
	FrameEditor = require('./FrameEditor'),
	frame = require('./Frame'),
	utils = require('../utils');

var extend = kind.statics.extend;

kind.concatenated.push('animation');

var AnimationSupport = {
	
	/**
	* @private
	*/
	//name: 'AnimationSupport',
	animating: false,

	/**
	* To keep a character active for it to apply some other 
	* animation at runtime. This gives a preformance boost when on
	* character an animation is reapplied.
	* @default false -	So the once the animation is completed, it has to be retriggered to 
	*					start a new animation.
	* @private
	*/
	active: false,

	/**
	* Holds variouts states of animation.
	* Like: 'started'	- Character animation has started(within rAF)
	*		'paused'	- Character animation has paused(within rAF)
	*		'resumed'	- Character animation has resumed(within rAF)
	*		'completed'	- Character animation has finished(within rAF)
	* @private
	*/
	animationState: "",

	/**
	* To check if the event delta value is changed
	* @private
	*/
	deltaChanged: false,

	/**
	* To hold the name of the animation event which occured on the character
	* @private
	*/
	eventName: "",

	/**
	* Holds delta value in the order [x, y, z, rad]
	* @private
	*/
	animDelta: [],


	vScrollX: 0,

	vScrollY: 0,

	vScrollZ: 0,

	prevDur: 0,

	totalDuration: 0,


	/**
	* Maximum threshold for animation
	* @private
	*/
	animMaxThreshold: [],

	_animPose: [],

	_pose: [],

	mixins: [EventEmitter, FrameEditor],

	_eventCache: {},


	/**
	* Check if the character is suitable for animation
	* @public
	*/
	ready: function() {
		var ret = this.generated && this.animating;
		if (ret && this._startTime)
			ret = this._startTime <= utils.perfNow();

		if(ret) this.set('animationState', 'started');
		return ret;
	},

	/**
	* Sets current animation state for this character
	* @public
	*/
	setInitial: function (initial) {
		this._startAnim = initial ? frame.copy(initial) : {};
	},


	/**
	* Sets animation distance for this character
	* @public
	*/
	setDistance: function (dist) {
		this.distance = dist;
	},

	/**
	* Gets animation distance for this character
	* @public
	*/
	getDistance: function () {
		return this.distance;
	},

	/**
	* Gets current state of animation for this character
	* @public
	*/
	initiate: function (current) {
		var dom = this.hasNode(), dur,
			pose = frame.getComputedProperty(dom, undefined, current);
		pose.duration = 0;
		this._animPose.push(pose);
		this.currentState = pose.currentState;
		frame.accelerate(dom, pose.matrix);

		if(this.animate !== true) {
			dur = this.getDuration() || 0;
			this.addAnimation(this.animate, dur);
		}
	},

	/**
	* Adds new animation on already existing animation for this character.
	* @public
	*/
	addAnimation: function (newProp, duration) {
		if (this.prevDur === 0 && duration === 0) {
			this._animPose[0] = {animate: newProp, duration: 0};
		} else {
			this.prevDur = duration || this.prevDur;
			this.totalDuration += this.prevDur;
			this._animPose.push({animate: newProp, duration: this.totalDuration});
		}
	},

	/**
	* Sets new animation for this character.
	* @public
	*/
	setAnimation: function (newProp) {
		this._prop = newProp;
	},


	/**
	* Sets the delta values of x, y and z for events
	* @param {Object} obj - Object contains dX, dY and dZ as keys
	* @public
	*/
	setAnimationDelta: function (ev) {
		this._eventCache.dX = ev.dX + this._eventCache.dX || 0;
		this._eventCache.dY = ev.dY + this._eventCache.dY || 0;
		this._eventCache.dZ = ev.dZ + this._eventCache.dZ || 0;
		this._eventCache[ev.vtype] = ev;

		this.deltaChanged =  true;
		this.eventCacheUpdated = true;
		
	},

	/**
	* Gets the delta values of x, y and z for events
	* @public
	*/
	getAnimationDelta: function () {
		return this._eventCache[this._virtualEvent];
	},
	/**
	* Gets how long animation is active on this character
	* @public
	*/
	getDuration: function() {
		return this._duration || this.duration;
	},

	/**
	* Sets how long animation should be active on this character
	* @public
	*/
	setDuration: function (newDuration) {
		this._duration = newDuration;
	},

	/**
	* Idnetify when the character has done animating.
	* This triggers "onAnimated" event on this character
	* @public
	*/
	completed: function() {
		return this.onAnimated && this.onAnimated(this);
	},

	/**
	* Trigger animation for this character.
	* @public
	*/
	start: function (active, delay) {
		this._startTime = utils.perfNow() + (delay || 0) ;
		this._lastTime = this._startTime + this._duration;
		this.animating = true;
		this.active = active;
	},

	/**
	* Trigger the registered event to all the listeners
	* @public
	*/
	triggerEvent: function () {
		this.deltaChanged = false;
		return delegator.emitEvent(this, this.getAnimationDelta());
	},

	/**
	* @private
	*/
	rendered: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			this.initiate();
			if (this.handleAnimationEvents) {
				delegator.register(this);
			}
		};
	}),
    
    /**
     * @private
     */
    destroy: kind.inherit(function(sup) {
        return function() {
            animation.remove(this);
            animation.deRegister(this);
            if (this.handleAnimationEvents) {
				delegator.deRegister(this);
			}
            sup.apply(this, arguments);
        };
    })
};

module.exports = AnimationSupport;

/**
	Hijacking original behaviour as in other Enyo supports.
*/
var sup = kind.concatHandler;

/**
* @private
*/
kind.concatHandler = function (ctor, props, instance) {
	sup.call(this, ctor, props, instance);
	if (props.animate || props.keyFrame || props.pattern || props.handleAnimationEvents) {
		var proto = ctor.prototype || ctor;
		extend(AnimationSupport, proto);
		// if (props.keyFrame && typeof props.keyFrame != 'function') {
		// 	activator.animate(proto, props);
		// }
		if ((props.animate && typeof props.animate != 'function' ) ||
			(props.keyFrame && typeof props.keyFrame != 'function')) {
			animation.trigger(proto);
		}
		if (props.handleAnimationEvents && typeof props.handleAnimationEvents != 'function') {
			animation.register(proto);
		}
		if (props.pattern && typeof props.pattern != 'function') {
			animation.register(proto);
		}
	}
};