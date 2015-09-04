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
	* @private
	*/
	fadableValue: 0,

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
		value = value || 0.5;
		this.setAnimation({opacity: value});
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
	
	/**
	* @public
	* Fade element based on event trigger
	*/
	fadeByDelta: function (deltaValue) {
		if (deltaValue !== 0) {
			this.fadableValue = this.fadableValue + deltaValue * 0.1;
			if (this.fadableValue <= 0) {
				this.fadableValue=0;
			} else if (this.fadableValue >=1) {
				this.fadableValue=1;
			}
		}
		this.setAnimation({opacity:this.fadableValue });
		doFade(this);
	},

	/**
	* @public
	* Bubble the fadeable event
	*/
	triggerEvent: function (e) {
		console.log("TODO: Trigger the fadeable event"+e);
		//this.doFadeStart();
	}
};

/**
* @private
*/
function doFade (charc) {
	animation.trigger(charc);
	charc.start();
}