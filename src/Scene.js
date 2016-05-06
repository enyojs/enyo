var
	tween = require('./tween'),
	utils = require('./utils'),
	animation = require('./animation');

var _ts, _framerate = 16.6;

var AnimationSupport = {
	/**
	* @private
	*/
	span: 0,
	/**
	* @private
	*/
	timeline: 0,
	/**
	* @private
	*/
	repeat: false,
	/**
	* @private
	*/
	handleLayers: false,
	/**
	* @private
	*/
	animating: false,
	/**
	* @private
	*/
	direction: 0,
	/**
	* @private
	*/
	speed: 0,
	/**
	* @private
	*/
	seekInterval: 0,

	/**
	 * Starts the animation of the <code>actor</code> given in argument.
	 * If actor is not provided, animation of all the components linked to the {@link module:enyo/AnimationSupport/Scene} will be started.
	 * @param  [Component]{@link module:enyo/Component~Component} actor    The component to be animated
	 * @public
	 */
	play: function () {
		this.direction = this.speed = 1;
		if (isNaN(this.timeline) || !this.timeline) {
			this.timeline = 0;
		}
		this.animating = true;
		return this;
	},

	/**
	 * Resumes the paused animation of the <code>actor</code> given in argument.
	 * If actor is not provided, animation of all the components linked to the {@link module:enyo/AnimationSupport/Scene} will be resumed.
	 * @param  [Component]{@link module:enyo/Component~Component} actor    The component to be animated
	 * @public
	 */
	resume: function() {
		this.speed *= this.direction;
		return this;
	},

	/**
	 * Pauses the animation of the <code>actor</code> given in argument.
	 * If actor is not provided, animation of all the components linked to the {@link module:enyo/AnimationSupport/Scene} will be paused.
	 * @param  [Component]{@link module:enyo/Component~Component} actor    The component to be animated
	 * @public
	 */
	pause: function () {
		this.speed = 0;
		return this;
	},

	/**
	 * Reverses the animation of the <code>actor</code> given in argument.
	 * If actor is not provided, animation of all the components linked to the {@link module:enyo/AnimationSupport/Scene} will be reversed.
	 * @param  [Component]{@link module:enyo/Component~Component} actor    The component to be animated
	 * @public
	 */
	reverse: function () {
		this.direction = -1;
		this.speed *= this.direction;
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
	stop: function () {
		this.speed = 0;
		this.timeline = 0;
	},

	/**
	 * Seeks the animation of the <code>actor</code> to the position provided in <code>seek</code>
	 * The value of <code>seek</code> should be between <b>0</b> to <code>duration</code> of the animation.
	 * @param  {Number}                                             seek    Value in seek where the animation has to be seeked
	 * @param  [Component]{@link module:enyo/Component~Component}   actor       The component to be animated
	 * @public
	 */
	seek: function(seek) {
		this.timeline = seek;
	},

	/**
	 * Seeks <code>actor</code> with animation to the position provided in <code>seek</code>
	 * The value of <code>seek</code> should be between <b>0</b> to <code>duration</code> of the animation.
	 * @param  {Number}                                             seek    Value in seek where the animation has to be seeked
	 * @param  [Component]{@link module:enyo/Component~Component}   actor       The component to be animated
	 * @public
	 */
	seekAnimate: function(seek) {
		if (seek >= 0 ) {
			if (!this.animating)
				this.play();
			this.speed = 1;
		}else{
			this.speed = -1;
		}
		this.seekInterval = this.timeline + seek;
		if (this.seekInterval < 0) {
			this.speed = 0;
			this.seekInterval = 0;
		}
	},

	//TODO: Move these events to Event Delegator
	/**
	 * Event to identify when the scene has done animating.
	 * @memberOf module:enyo/AnimationSupport/Actor
	 * @public
	 */
	completed: function() {},

	/**
	 * Event to identify when the scene has done a step(rAF updatation of time) in the animation.
	 * @memberOf module:enyo/AnimationSupport/Actor
	 * @public
	 */
	step: function() {}
};

/**
* {@link module:enyo/Scene~Scene} is a work-in-progress module
*
* @class Scene
* @extends module:enyo/Scene~Scene
* @wip
* @private
*/
var scene = module.exports = function (actor, props) {
	this.id = utils.uid("@");
	this.poses = [];
	this.rolePlays = [];
	this.actor = actor;

	animation.subscribe(this, loop);
	utils.mixin(this, AnimationSupport);

	if (props) {
		var anims = utils.isArray(props) ? props : [props];
		for (var i = 0, anim; (anim = anims[i]); i++) {
			this.addAnimation(anim, anim.duration || 0);
		}
	}
};

scene.prototype.getAnimation = function (index) {
	return index < 0 || this.poses[index];
};

scene.prototype.addAnimation = function (newProp, span) {
	var l = this.poses.length, old;

	if (l > 0) {
		old = this.poses[l-1];
		span += old.span;
	}
	this.poses.push({animate: newProp, span: span});
	this.span = span;
};

scene.prototype.action = function(ts, pose) {
	var past, index, tm,
		dur = this.span;

	if (this.actor && this.actor.generated) {
		tm = rolePlay(ts, this);
		if (isNaN(tm) || tm < 0) return pose;
		else if (tm <= dur) {
			index = animateAtTime(this.poses, tm);
			pose = this.poses[index];
			past = index ? this.poses[index - 1].span : 0;
			update(pose, this.actor, tm - past, pose.span - past);
			this.step && this.step(this.actor);
		} else {
			this.timeline = this.repeat ? 0 : this.span;
			if(!this.repeat) this.cut();
		}
	}
	return pose;
};

scene.prototype.cut = function () {
	if (this.handleLayers) {
		this.speed = 0;
		if (this.active) {
			this.active = false;
			tween.halt(this.actor);
		}
	}
	this.animating = false;
	this.completed && this.completed(this.actor);
};

scene.prototype.addScene = function (scene) {
	this.span = scene.span + this.span;
	this.rolePlays.push({
		scene: scene,
		span: this.span,
		dur: scene.span
	});
};


function loop (was, is) {
	if (this.animating) {
		_ts = is - was;
		_ts = (_ts > _framerate) ? _framerate : _ts;
		this.action(_ts);
	} else {
		animation.unsubscribe(this, loop);
	}
}

function update (pose, actor, since, dur) {
	var t;
	if (!pose._startAnim) tween.init(actor, pose);

	if (since < 0) since = 0;
	if (since <= dur && dur !== 0) {
		t = since / dur;
		tween.step(actor, pose, t, dur);
	} else {
		tween.step(actor, pose, 1, dur);
	}
}

/**
 * <code>rolePlay</code> updated the timeline of the actor which is currently animating.
 * @param  {Number} t     Elapsed time since the animation of this pose has started (ratio in factor of 1)
 * @param  {@link module:enyo/Component~Component} actor The component which is animating
 * @return {Number}       Returns the updated timeline of the actor
 * @private
 */
function rolePlay (t, actor) {
	actor = actor || this;

	if(actor.delay > 0) {
		actor.delay -= (t * actor.speed);
	} else {
		actor.timeline += (t * actor.speed);
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

/**
 * Returns animation pose index for a particular 
 * instance of time from the list of 
 * animations added to the scene.
 * @param  {number} span - Time span from the animation timeline
 * @return {number}      - index of the animation
 * @private
 */
function animateAtTime (anims, span) {
	var startIndex = 0,
		stopIndex = anims.length - 1,
		middle = Math.floor((stopIndex + startIndex) / 2);

	if (span === 0) {
		return startIndex;
	}

	while (anims[middle].span != span && startIndex < stopIndex) {
		if (span < anims[middle].span) {
			stopIndex = middle;
		} else if (span > anims[middle].span) {
			startIndex = middle + 1;
		}

		middle = Math.floor((stopIndex + startIndex) / 2);
	}
	return (anims[middle].span != span) ? startIndex : middle;
}