require('enyo');

var
	kind = require('../kind'),
	activator = require('./KeyFrame'),
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

	active: false,

	/**
	* Check if the character is suitable for animation
	* @public
	*/
	ready: function() {
		return this.generated && this.animating;
	},

	/**
	* Sets current animation state for this character
	* @public
	*/
	setInitial: function (initial) {
		this._start = initial;
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
		return this._duration || (this._duration = this.duration);
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
	start: function (active) {
		this._duration = parseInt(this.getDuration(), 10);
		this._startTime = utils.perfNow();
		this._lastTime = this._startTime + this._duration;
		this.animating = true;
		this.active = active;
		this.initiate();
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
	if (props.animate || props.keyFrame) {
		var proto = ctor.prototype || ctor;
		extend(AnimationSupport, proto);
		if (props.keyFrame && typeof props.keyFrame != 'function') {
			activator.animate(proto, props);
		}
		if (props.animate && typeof props.animate != 'function') {
			activator.trigger(proto);
		}
	}
};