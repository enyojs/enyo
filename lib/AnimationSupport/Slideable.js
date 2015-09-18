var
	kind = require('../kind'),
	tween = require('./Tween'),
	Vector = require('./Vector');

/**
* Interface to achieve slide animation
*
* @module enyo/AnimationSupport/Slidable
* @public
*/
var Slidable = {

	/**
	* To start animation
	*/
	animate: true,

	/**
	* @private
	*/
	slideMultiplier: 0.1,

	/**
	* @public
	* slide animation in left direction
	* @parameter: slideDistance - distance in pixels to slide in left direction
	*/
	left: function (slideDistance) {
		this.slide((-1 * slideDistance), 0, 0);
	},

	/**
	* @public
	* slide animation in right direction
	* @parameter: slideDistance - distance in pixels to slide in right direction
	*/
	right: function (slideDistance) {
		this.slide(slideDistance, 0, 0);
	},

	/**
	* @public
	* slide animation upward
	* @parameter: slideDistance - distance in pixels to slide upward
	*/
	up: function (slideDistance) {
		this.slide(0, (-1 * slideDistance), 0);
	},

	/**
	* @public
	* slide animation downward
	* @parameter: slideDistance - distance in pixels to slide downward
	*/
	down: function (slideDistance) {
		this.slide(0, slideDistance, 0);
	},
	
	/**
	* @public
	* slide animation in custom direction
	* @parameter: x - css property to slide in x-axis direction
	* @parameter: y - css property to slide in y-axis direction
	* @parameter: z - css property to slide in z-axis direction
	*/
	slide: function (x, y, z) {
		x = x || 0;
		y = y || 0;
		z = z || 0;
		doSlide.call(this, x, y, z);
	},

	rendered: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			this.slide.apply(this, this._startAnim.translate);
		};
	})
};

function doSlide(x, y, z) {
	switch (this.direction) {
	case "horizontal" :
		this.addAnimation({translate:  x + "," + 0 + "," + 0});		
		break;
	case "vertical"	:
		this.addAnimation({translate: 0 + "," + y + "," + 0});
		break;
	default:
		this.addAnimation({translate: x + "," + y + "," + z});
	}
}

module.exports = Slidable;

/**
	Hijacking original behaviour.
*/
var sup = tween.transformModifier;

tween.transformModifier = function (charc, prop, delta) {
	if (prop == 'translate') {
		delta = (delta instanceof Array) ? delta : [delta, 0, 0];
		if (charc.slideMultiplier > 0) Vector.multiply(delta, charc.slideMultiplier);
		return delta;
	}
	sup.call(this, charc, prop, delta);
};