require('enyo');

var
	kind = require('../kind'),
	animation = require('./Core'),
	activator = require('./KeyFrame'),
	delegator = require('./EventDelegator'),
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
	*		'completed'	- Character animation has finished(within rAF)
	* @private
	*/
	animationState: "",

	/**
	* Holds delta value in the order [x, y, z, rad]
	* @private
	*/
	animDelta: [],

	/**
	* Maximum threshold for animation
	* @private
	*/
	animMaxThreshold: [],

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
		this._distance = dist;
	},

	/**
	* Gets animation distance for this character
	* @public
	*/
	getDistance: function () {
		return this._distance;
	},

	/**
	* Gets current state of animation for this character
	* @parameter accelerate- Turns on/off hardware acceleration
	* @public
	*/
	initiate: function (current) {
		var dom = this.hasNode(),
			prop = this.getAnimation(),
			init = frame.getCompoutedProperty(dom, prop, current);

		utils.mixin(this, init);
	},

	/**
	* Gets animations applied to this chracter.
	* @public
	*/
	getAnimation: function() {
		return this._prop || (this._prop = this.animate);
	},

	/**
	* Adds new animation on already existing animation for this character.
	* @public
	*/
	addAnimation: function (newProp) {
		if (this._prop === undefined || this._prop == true) {
			this._prop = newProp;
		} else {
			utils.mixin(this._prop, newProp);
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
		this._duration = parseInt(this.getDuration(), 10);
		this._startTime = utils.perfNow() + (delay || 0) ;
		this._lastTime = this._startTime + this._duration;
		this.animating = true;
		this.active = active;
		this.initiate(this.currentState);
	},

	/**
	* Halt existing animation of this character
	* @public
	*/
	pause: function () {
		this.animating = false;
	},

	/**
	* @private
	*/
	rendered: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			this.initiate();
			frame.accelerate(this.hasNode(), this.matrix);
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
            sup.apply(this, arguments);
        };
    }),
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
	if (props.animate || props.keyFrame || props.handleAnimationEvents) {
		var proto = ctor.prototype || ctor;
		extend(AnimationSupport, proto);
		if (props.keyFrame && typeof props.keyFrame != 'function') {
			activator.animate(proto, props);
		}
		if (props.animate && typeof props.animate != 'function') {
			animation.trigger(proto);
		}
		if (props.handleAnimationEvents && typeof props.handleAnimationEvents != 'function') {
			animation.register(proto);
		}
	}
};