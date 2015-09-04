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
		var value = (-1 * slideDistance) + ",0,0";
		this.slide({translate: value});
	},

	/**
	* @public
	* slide animation in right direction
	* @parameter: slideDistance - distance in pixels to slide in right direction
	*/
	right: function (slideDistance) {
		var value = slideDistance + ",0,0";
		this.slide({translate: value});
	},

	/**
	* @public
	* slide animation upward
	* @parameter: slideDistance - distance in pixels to slide upward
	*/
	up: function (slideDistance) {
		var value = "0," + (-1 * slideDistance) + ",0";
		this.slide({translate: value});
	},

	/**
	* @public
	* slide animation downward
	* @parameter: slideDistance - distance in pixels to slide downward
	*/
	down: function (slideDistance) {
		var value = "0," + slideDistance + ",0";
		this.slide({translate: value});
	},

	/**
	* @public
	* slide animation in custom direction
	* @parameter: anim - css property to slide in any direction
	*/
	slide: function (anim) {
		this.addAnimation(anim);
		animation.trigger(this);
		this.start();
	}
};