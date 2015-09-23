require('enyo');

var
	kind = require('../kind'),
	animation = require('../animation'),
	utils = require('../utils'),
	tween = require('./Tween');

var
	CoreObject = require('../CoreObject');

/**
* This module returns the Loop singleton
* Core module is responsible for handling all animations happening in Enyo.
* The responsibilities of this module is to;
* - Trigger vendor specific rAF.
* - Knowing all elements which have requested for animation.
* - Tween animation frames for each characters.
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
	chracs: [],

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
	* Core public API to check if core is handling animation for particular
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
			if (this.chracs[i].hasNode() === eventTarget) { // Already Animating
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
	* Animator public API to register character with event
	*
	* @parameter charc-		Animation character
	*
	* @public
	*/
	register: function (charc) {
		this.deRegister(charc);
		this.evnts.push(charc);
		this.remove(charc);
		charc.animating = true;
		
		if (!this.isTicking) {
			this.dummy();
			this.isTicking = true;
		}
	},

	deRegister: function (curr) {
		var idx = this.evnts.indexOf(curr);
		if (idx >= 0) this.evnts.splice(idx, 1);	
	},

	/**
	* @private
	*/
	start: function () {
		this.req = animation.requestAnimationFrame(this.loop.bind(this));
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
			ts;

		if (len <= 0) {
			this.cancel();
			this.running = false;
			return;
		}

		for (i = 0; i < len; i++) {
			curr = this.chracs[i];
			if (curr && curr.ready()) {
				ts = utils.perfNow();
				tween.update(curr, ts);
				if (!curr._lastTime || ts >= curr._lastTime) {
					tween.complete(curr);
					curr.completed(curr);
					if(!curr.active) {
						this.remove(curr);
					}
				}
			}
		}
		this.start();
	},

	/**
	* @private
	*/
	eventLoop: function () {
		var i, curr, evlen = this.evnts.length;
		for (i = 0; i < evlen; i++) {
			curr = this.evnts[i];
			if (curr && curr.ready()) {
				tween.updateDelta(curr);
				if (!curr.animating) {
					tween.complete(curr);
					curr.completed(curr);
				}
			}
		}
		this.dummy();
	},

	/**
	* TODO: Merge this implementation with actual start
	* @private
	*/
	dummy: function () {
		animation.requestAnimationFrame(this.eventLoop.bind(this));
	}
});