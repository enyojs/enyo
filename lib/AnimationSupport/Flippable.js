var
	kind = require('../kind'),
	animation = require('./Core');

/**
* Interface to achieve flip animation
*
* @module enyo/AnimationSupport/Flippable
* @public
*/
module.exports = {

	/**
	* @private
	*/
	name: 'Flippable',

	/**
	* Specifies the direction of flip. Accepted value are 'X', 'Y', 'Z'
	* 
	* @type {String}
	* @default 'X'
	* @public
	*/
	flipDirection: 'X',

	/**
	* Specifies the flip up-to angle. Accepted value are in degree
	* 
	* @type {Number}
	* @default '0'
	* @public
	*/
	flipAngle: 0,

	/**
	* @public
	* apply animation to the flippable DOM object
	*/
	doFlip: function() {
		this.setAxis();
		animation.trigger(this);
		this.start();
	},

	/**
	* @public
	* set axis of rotation of flippable DOM object
	*/
	setAxis: function() {
		var css = {};
		css["rotate" + this.flipDirection] = this.flipAngle;
		this.setAnimation(css);
	}
};