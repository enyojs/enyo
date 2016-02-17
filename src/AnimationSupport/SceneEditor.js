require('enyo');

/**
* @module enyo/AnimationSupport/SceneEditor
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
	_frameSpeed: 0,
    /**
    * @private
    */
    _startTime: 0,

    /**
    * @private
    */
	cache: function(actor) {
		actor = actor || this;
		if(actor._frameSpeed === 0){
			actor._frameSpeed = actor._cachedValue;
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
		actor._frameSpeed = 1;
		if (isNaN(actor.timeline) || !actor.timeline) {
			actor.timeline = 0;
		}
		this.trigger();
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
		actor._frameSpeed *= 1;
	},

    /**
     * Pauses the animation of the <code>actor</code> given in argument.
     * If actor is not provided, animation of all the components linked to the {@link module:enyo/AnimationSupport/Scene} will be paused.
     * @param  [Component]{@link module:enyo/Component~Component} actor    The component to be animated
     * @public
     */
	pause: function (actor) {
		actor = actor || this;
		actor._cachedValue = actor._frameSpeed;
		actor._frameSpeed = 0;
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
		actor._frameSpeed *= -1;
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
		actor._frameSpeed *= mul;
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
		actor._frameSpeed *= mul;
	},

    /**
     * Changes the speed of the animation.</br>
     * Speed of the animation changed based on the <code>factor</code>.</br>
     * To slow down the speed use values between <b>0</b> and <b>1</b>. For Example <b>0.5</b> to reduce the speed by <b>50%</b>.</br>
     * To increase the speed use values above <b>1</b>. For Example <b>2</b> to increase the speed by <b>200%</b>.</br>
     * Animation will be paused if factor is <b>0</b>. To pause the animation use <code>{@link enyo/AnimationSupport/SceneEditor.pause pause}</code> API.</br>
     * Speed will not be affected incase of negative multiplication factor.
     * @param  {Number} factor                                              Multiplication factor which changes the speed
     * @param  [Component {@link module:enyo/Component~Component}] actor     The component whose animating speed should be changed
     * @public
     */
    speed: function(mul, actor) {
        if (mul < 0) return;
        this.cache(actor);
        actor = actor || this;
        actor._frameSpeed *= mul;
    },
    
    /**
     * Stops the animation of the actor given in argument.
     * If actor is not provided, animation of all the components linked to the {@link module:enyo/AnimationSupport/Scene} will be stopped.
     * @param  [Component]{@link module:enyo/Component~Component} actor    The component to be animated
     * @public
     */
	stop: function (actor) {
		actor = actor || this;
		actor._cachedValue = 1;
		actor._frameSpeed = 0;
		actor.timeline = 0;
		this.animating = false;
		this.cancel();
	},
	
    /**
     * Seeks the animation of the <code>actor</code> to the position provided in <code>timeline</code>
     * The value of <code>timeline</code> should be between <b>0</b> to <code>duration</code> of the animation.
     * @param  {Number}                                             timeline    Value in timeline where the animation has to be seeked
     * @param  [Component]{@link module:enyo/Component~Component}   actor       The component to be animated
     * @public
     */
    seek: function(timeline, actor) {
        actor = actor || this;
        if (this.animating !== true) {
            this.play(actor);
            this.pause(actor);
        }
        actor.timeline = timeline;
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
		if (actor.timeline === undefined || actor.timeline < 0) 
			actor.timeline = 0;
		
		if(actor.delay > 0) {
			actor.delay -= _rolePlay(t, actor._frameSpeed);
		} else {
			actor.timeline += _rolePlay(t, actor._frameSpeed);
		}
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