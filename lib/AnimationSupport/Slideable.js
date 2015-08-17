var
	kind = require('../kind'),
	animation = require('./Core');
/**
* Interface to achieve slide animation
*
* @module enyo/AnimationSupport/Slideable
* @public
*/
module.exports = {
	
	/**
	* @private
	*/
	name: 'Slideable',

	/**
	* @public
	* slide animation in left direction
	* @parameter: slideDistance - distance in pixels to slide in left direction
	*/
	left: function (slideDistance) {
		this.slide({translateX: -1 * slideDistance, translateY: 0});
	},

	/**
	* @public
	* slide animation in right direction
	* @parameter: slideDistance - distance in pixels to slide in right direction
	*/
	right: function (slideDistance) {
		this.slide({translateX: slideDistance, translateY: 0});
	},

	/**
	* @public
	* slide animation upward
	* @parameter: slideDistance - distance in pixels to slide upward
	*/
	up: function (slideDistance) {
		this.slide({translateX: 0, translateY: -1 * slideDistance});
	},

	/**
	* @public
	* slide animation downward
	* @parameter: slideDistance - distance in pixels to slide downward
	*/
	down: function (slideDistance) {
		this.slide({translateX: 0, translateY: slideDistance});
	},

	/**
	* @public
	* slide animation in custom direction
	* @parameter: anim - css property to slide in any direction
	*/
	slide: function (anim) {
		this.addAnimation(anim);
		animation.trigger(this);
	}
};