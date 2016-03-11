require('enyo');

/**
* @module enyo/AnimationSupport/Editor
*/

/**
* This modules exposes API's for controlling animations.
* @private
*/
module.exports = {
	/**
	* @private
	*/
	timeline: 0,
	/**
	* @private
	*/
	_cachedValue: 0,
	/**
	* @private
	*/
	speed: 0,
	/**
	* @private
	*/
	seekInterval: 0,
	/**
	* @private
	*/
	cache: function(actor) {
		actor = actor || this;
		if(actor.speed === 0){
			actor.speed = actor._cachedValue;
		}
		this.animating = true;
	},

	/**
	 * Starts the animation of the <code>actor</code> given in argument.
	 * If actor is not provided, animation of all the components linked to the {@link module:enyo/AnimationSupport/Scene} will be started.
	 * @param  [Component]{@link module:enyo/Component~Component} actor    The component to be animated
	 * @public
	 */
	play: function (actor) {
		actor = actor || this;
		actor.speed = 1;
		if (isNaN(actor.timeline) || !actor.timeline) {
			actor.timeline = 0;
		}
		this.trigger();
		actor._cachedValue = actor.speed;
		this.animating = true;
	},

	/**
	 * Resumes the paused animation of the <code>actor</code> given in argument.
	 * If actor is not provided, animation of all the components linked to the {@link module:enyo/AnimationSupport/Scene} will be resumed.
	 * @param  [Component]{@link module:enyo/Component~Component} actor    The component to be animated
	 * @public
	 */
	resume: function(actor) {
		this.cache(actor);
		actor = actor || this;
		actor.speed *= 1;
	},

	/**
	 * Pauses the animation of the <code>actor</code> given in argument.
	 * If actor is not provided, animation of all the components linked to the {@link module:enyo/AnimationSupport/Scene} will be paused.
	 * @param  [Component]{@link module:enyo/Component~Component} actor    The component to be animated
	 * @public
	 */
	pause: function (actor) {
		actor = actor || this;
		actor._cachedValue = actor.speed;
		actor.speed = 0;
	},

	/**
	 * Reverses the animation of the <code>actor</code> given in argument.
	 * If actor is not provided, animation of all the components linked to the {@link module:enyo/AnimationSupport/Scene} will be reversed.
	 * @param  [Component]{@link module:enyo/Component~Component} actor    The component to be animated
	 * @public
	 */
	reverse: function (actor) {
		this.cache(actor);
		actor = actor || this;
		actor._cachedValue = actor.speed;
		actor.speed *= -1;
	},

	/**
	 * fast description goes here
	 * @param  {Number} mul   description goes here
	 * @param  [Component]{@link module:enyo/Component~Component} actor description goes here
	 * @public
	 */
	fast: function (mul, actor) {
		this.cache(actor);
		actor = actor || this;
		actor.speed *= mul;
	},

	/**
	 * slow description goes here
	 * @param  {Number} mul   description goes here
	 * @param  [Component]{@link module:enyo/Component~Component} actor description goes here
	 * @public
	 */
	slow: function (mul, actor) {
		this.cache(actor);
		actor = actor || this;
		actor.speed *= mul;
	},

	/**
	 * Changes the speed of the animation.</br>
	 * Speed of the animation changed based on the <code>factor</code>.</br>
	 * To slow down the speed use values between <b>0</b> and <b>1</b>. For Example <b>0.5</b> to reduce the speed by <b>50%</b>.</br>
	 * To increase the speed use values above <b>1</b>. For Example <b>2</b> to increase the speed by <b>200%</b>.</br>
	 * Animation will be paused if factor is <b>0</b>. To pause the animation use <code>{@link enyo/AnimationSupport/Editor.pause pause}</code> API.</br>
	 * Speed will not be affected incase of negative multiplication factor.
	 * @param  {Number} factor                                              Multiplication factor which changes the speed
	 * @param  [Component {@link module:enyo/Component~Component}] actor     The component whose animating speed should be changed
	 * @public
	 */
	// speed: function(mul, actor) {
	//     if (mul < 0) return;
	//     this.cache(actor);
	//     actor = actor || this;
	//     actor.speed *= mul;
	// },

	/**
	 * Stops the animation of the actor given in argument.
	 * If actor is not provided, animation of all the components linked to the {@link module:enyo/AnimationSupport/Scene} will be stopped.
	 * @param  [Component]{@link module:enyo/Component~Component} actor    The component to be animated
	 * @public
	 */
	stop: function (actor) {
		actor = actor || this;
		actor._cachedValue = 1;
		actor.speed = 0;
		actor.timeline = 0;
		// this.animating = false;
		// this.cancel();
	},

	/**
	 * Seeks the animation of the <code>actor</code> to the position provided in <code>seek</code>
	 * The value of <code>seek</code> should be between <b>0</b> to <code>duration</code> of the animation.
	 * @param  {Number}                                             seek    Value in seek where the animation has to be seeked
	 * @param  [Component]{@link module:enyo/Component~Component}   actor       The component to be animated
	 * @public
	 */
	seek: function(seek, actor) {
		actor = actor || this;
		actor.timeline = seek;
	},

	/**
	 * Seeks <code>actor</code> with animation to the position provided in <code>seek</code>
	 * The value of <code>seek</code> should be between <b>0</b> to <code>duration</code> of the animation.
	 * @param  {Number}                                             seek    Value in seek where the animation has to be seeked
	 * @param  [Component]{@link module:enyo/Component~Component}   actor       The component to be animated
	 * @public
	 */
	seekAnimate: function(seek, actor) {
		actor = actor || this;
		if (seek >= 0 ) {
			if (!this.animating)
				this.play(actor);
			actor.speed = 1;
		}else{
			actor.speed = -1;
		}
		actor.seekInterval = actor.timeline + seek;
		if (actor.seekInterval < 0) {
			actor.speed = 0;
			actor.seekInterval = 0;
		}
	},

	/**
	 * <code>rolePlay</code> updated the timeline of the actor which is currently animating.
	 * @param  {Number} t     Elapsed time since the animation of this pose has started (ratio in factor of 1)
	 * @param  {@link module:enyo/Component~Component} actor The component which is animating
	 * @return {Number}       Returns the updated timeline of the actor
	 * @access public
	 */
	rolePlay: function (t, actor) {
		actor = actor || this;

		if(actor.delay > 0) {
			actor.delay -= _rolePlay(t, actor.speed);
		} else {
			actor.timeline += _rolePlay(t, actor.speed);
		}

		if(actor.seekInterval !== 0) {
			if((actor.seekInterval-actor.timeline)*actor.speed < 0) {
				actor.seekInterval = 0;
				actor.speed = 0;
			}
		}
		
		if (actor.timeline === undefined || actor.timeline < 0)
			actor.timeline = 0;
		return actor.timeline;
	}
};

/**
 * Returns the time based on the current speed of animation.
 * @private
 */
function _rolePlay(t, mul) {
	return mul * t;
}