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
	* To start animation
	*/
	animate: true,

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
	doFlip: function(deltaValue) {
		this.setAxis(deltaValue);
	},

	/**
	* @public
	* set axis of rotation of flippable DOM object
	*/
	setAxis: function(delta) {
		var css = {};
		var dir = "";
		this.flipAngle = this.flipAngle + delta * 10;
		switch(this.flipDirection) {
			case "X":
				dir = "1,0,0,"+ this.flipAngle;
				break;
			case "Y":
				dir = "0,1,0,"+ this.flipAngle;
				break;
			case "Z":
				dir = "0,0,1,"+ this.flipAngle;
				break;
		}
		css["rotate"] = dir;
		this.addAnimation(css);
	}
};