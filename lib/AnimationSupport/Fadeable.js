var
	kind = require('../kind'),
	animation = require('./Core');

/**
* Interface to achieve fade animation
*
* @module enyo/AnimationSupport/Fadeable
* @public
*/
module.exports = {

	/**
	* @private
	*/
	name: 'Fadeable',

	/**
	* @public
	* Make the character invisible
	*/
	invisible: function () {
		this.setAnimation({opacity: 0});
		doFade(this);
	},

	/**
	* @public
	* Make the character transparent
	* @default 0.5
	* @parameter value - set transparency value
	*/
	transparent: function (value) {
		this.setAnimation({opacity: value ? value : 0.5});
		doFade(this);
	},

	/**
	* @public
	* Make the character visible
	*/
	opaque: function () {
		this.setAnimation({opacity: 1});
		doFade(this);
	},
};

/**
* @private
*/
function doFade (charc) {
	animation.trigger(charc);
	charc.start();
}