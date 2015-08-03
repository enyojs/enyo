/**
* Core module is responsible for handling all animations in the framework.
* The responsibilities of this module is to;
*	1. Trigger vendor specific rAF.
*	2. Knowing all elements which have requested for animation.
*	3. Requesting Animator to generate frames for each characters.
*	4. Idenfying initial state of an element.
*	5. Sperating multiple CSS properties values.
*
* As of now this module is exposed as an interface for application 
* to directly trigger an animation. However, this will be later made private
* and will be accessible only by other interfaces exposed by framework.
*
* @public
*/
require('enyo');

/**
* This module returns the Loop singleton
* @module enyo/AnimationCore
*/
var
	kind = require('../kind'),
	animation = require('../animation'),
	utils = require('../utils');

var
	tween = require('./Tween');

var
	CoreObject = require('../CoreObject');

module.exports = kind.singleton({
	/** @lends module:enyo/AnimationCore */

	/**
	* @private
	*/
	name: 'enyo.Core',
	/**
	* @private
	*/
	kind: CoreObject,

	/**
	* @private
	*/
	chracs: [],

	/**
	* @private
	*/
	req: 0,

	/**
	* @private
	*/
	running: false,

	/**
	* Animation Core base API to start core functionalities for animation.
	* The purpose of this method is to check if the animation is already started or not
	* otherwise wake up core to handle animation for a character.
	*
	* As of now this method is provided as an interface for application 
	* to directly trigger an animation. However, this will be later made private
	* and will be accessible only by the interfaces exposed by framework.
	* @parameter charc-		Animation character
	*
	* @public
	*/
	trigger: function (charc) {
		if (!charc.animating) {
			this.chracs.push(charc);
		}
		if (!this.running) {
			this.running = true;
			this.start();
		}
	},

	/**
	* Animator public API to check if animation is happening on a particular 
	* document element.
	*
	* As of now this method is provided as an interface for application 
	* to directly trigger an animation. However, this will be later made private
	* and will be accessible only by the interfaces exposed by framework.
	* @parameter charc-		Animation character
	*
	* @public
	*/
	exists: function (eventTarget) {
		for (var i = 0; i < this.chracs.length; i++) {
			if (this.chracs[i].getDom() === eventTarget) { // Already Animating
				return this.chracs[i];
			}
		}
	},

	/**
	* Animator public API to remove animation happening on a particular 
	* document element.
	*
	* As of now this method is provided as an interface for application 
	* to directly trigger an animation. However, this will be later made private
	* and will be accessible only by the interfaces exposed by framework.
	* @parameter charc-		Animation character
	*
	* @public
	*/
	remove: function (curr) {
		this.chracs.splice(this.chracs.indexOf(curr), 1);
	},

	/**
	* @private
	*/
	start: function () {
		this.req = animation.requestAnimationFrame(this.bindSafely(this.loop));
	},

	/**
	* @private
	*/
	cancel: function () {
		animation.cancelRequestAnimationFrame(this.req);
	},

	/**
	* @private
	*/
	loop: function () {
		var i, curr,
			len = this.chracs.length,
			ts = utils.perfNow();

		if (len <= 0) {
			this.cancel();
			this.running = false;
			return;
		}

		for (i = 0; i < len; i++) {
			curr = this.chracs[i];
			if (curr && curr.ready()) {
				tween.update(curr, ts);
				if (ts >= curr._lastTime) {
					this.remove(curr);
					curr.completed(curr);
				}
			}
		}
		this.start();
	},

	/**
	* @private
	*/
	dummy: function () {
		animation.requestAnimationFrame(function() {});
	}
});

