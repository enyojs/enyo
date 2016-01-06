require('enyo');

var
	kind = require('../kind'),
	utils = require('../utils'),
	director = require('./Director'),
	animation = require('../animation'),
	CoreObject = require('../CoreObject');

var ts, wasTs;

/**
* This module returns the Loop singleton
* Core module is responsible for handling all animations happening in Enyo.
* The responsibilities of this module is to;
* - Trigger vendor specific rAF.
* - Update director to handle scenes.
* 
* @module enyo/Core
*/
module.exports = kind.singleton({
	/** @lends module:enyo/Core */

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
	scenes: [],

	/**
	* @private
	*/
	evnts: [],

	/**
	* @private
	*/
	req: 0,

	/**
	* @private
	*/
	running: false,

	/**
	* Core base API to start animation functionalities.
	* The purpose of this method is to check if the animation is already started or not
	* otherwise wake up core to handle animation for a scene.
	*
	* As of now this method is provided as an interface for application 
	* to directly trigger an animation. However, this will be later made private
	* and will be accessible only by the interfaces exposed by framework.
	* @parameter scene-		Animation scene
	*
	* @public
	*/
	trigger: function (scene) {
		if (!scene.animating) {
			this.scenes.push(scene);
		}
		if (!this.running) {
			this.running = true;
			this.start();
		}
	},

	/**
	* Animator public API to remove animation happening on a particular 
	* document element.
	*
	* As of now this method is provided as an interface for application 
	* to directly trigger an animation. However, this will be later made private
	* and will be accessible only by the interfaces exposed by framework.
	* @parameter scene-		Animation scene
	*
	* @public
	*/
	remove: function (scene) {
		var i = this.scenes.indexOf(scene);
		if (i >= 0) this.scenes.splice(i, 1);
	},

	/**
	* Animator public API to pause animation happening on all the 
	* scenes.
	*
	* As of now this method is provided as an interface for application 
	* to directly trigger an animation. However, this will be later made private
	* and will be accessible only by the interfaces exposed by framework.
	*
	* @public
	*/
	pause: function () {
		for (var i = 0; i < this.scenes.length; i++) {
			this.scenes[i].animating = false;
		}
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
		var i, scene,
			len = this.scenes.length;

		if (len <= 0) {
			this.cancel();
			this.running = false;
			return;
		}
		
		ts = utils.perfNow();
		for (i = 0; i < len; i++) {
			scene = this.scenes[i];
			if (scene && scene.ready()) {
				//TODO: have a check to handle event based and time based together
				if (scene._isTriggered && this.getAnimationDelta()) {
					if (!scene.triggerEvent()) {
						director.shot(scene, ts - (wasTs || ts));
					}
				} else {
					director.take(scene, ts - (wasTs || ts));
				}
			}
		}
		wasTs = ts;
		this.start();
	}
});