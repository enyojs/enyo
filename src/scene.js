var
	tween = require('./tween'),
	utils = require('./utils'),
	animation = require('./animation');

var _ts, _framerate = 16.6;

var AnimationSupport = {
	/**
	* @public
	*/
	span: 0,
	/**
	* @private
	*/
	timeline: 0,
	/**
	* @public
	*/
	repeat: false,
	/**
	* @public
	*/
	handleLayers: false,
	/**
	* @public
	*/
	animating: false,
	/**
	* @public
	*/
	direction: 0,
	/**
	* @public
	*/
	speed: 0,
	/**
	* @public
	*/
	seekInterval: 0,
	/**
	* @public
	*/
	isSequence: true,

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
		this.direction = 1;
		return this;
	},

	/**
	 * Pauses the animation of the <code>actor</code> given in argument.
	 * If actor is not provided, animation of all the components linked to the {@link module:enyo/AnimationSupport/Scene} will be paused.
	 * @param  [Component]{@link module:enyo/Component~Component} actor    The component to be animated
	 * @public
	 */
	pause: function () {
		this.direction = 0;
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
	},

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
var scene = module.exports = function (actor, props, opts) {
	this.id = utils.uid("@");
	this.poses = [];
	this.rolePlays = [];
	this.actor = actor;

	this.rAFId = animation.subscribe(this, loop);
	utils.mixin(this, AnimationSupport);
	if (opts) utils.mixin(this, opts);

	if (props) {
		var anims = utils.isArray(props) ? props : [props];
		for (var i = 0, anim;
			(anim = anims[i]); i++) {
			if (anim.delay) this.addAnimation({}, anim.delay, actor.duration);
			this.addAnimation(anim, anim.duration || 0, actor.duration);
		}
	}
};

scene.prototype.isActive = function () {
	if (this.actor)
		return this.actor.generated;

	// making sure parent scenes are always active.
	return true;
};

function modify(pose, currentTm) {
	pose.span = currentTm;
	delete pose._endAnim;
	pose._endAnim = pose.currentState;
	return pose;
};

function currPose(poseArr, tm, properties) {
	var currentTime = tm;
	for (var i = 0; i < poseArr.length; i++) {

		if (poseArr[i].begin <= currentTime && poseArr[i].span >= currentTime) { // check the current Pose
			modify(poseArr[i], currentTime);
			poseArr.splice((i + 1), poseArr.length - (i + 1));
			poseArr[(i + 1)] = {
				animate: properties,
				begin: currentTime,
				span: currentTime + properties.duration
			};
			break;
		}
	}
};

function hasPosesCheck(poseArr) {
	var bool;
	for (var i = 0; i < poseArr.length; i++) {
		bool = poseArr[i].poses ? true : false;
		if (bool === true) {
			break;
		}
	}
	return bool;
};

function loopPose(poseArr, tm, properties) {
	var isArrayCheck, hasPoses;
	isArrayCheck = utils.isArray(poseArr);
	hasPoses = hasPosesCheck(poseArr);

	if (isArrayCheck === true && hasPoses === true) {
		for (var i = 0; i < poseArr.length; i++) {
			loopPose(poseArr[i].poses, tm, properties);
		}
	} else if (isArrayCheck === true && hasPoses === false) {
		currPose(poseArr, tm, properties);
	}
};


scene.prototype.setAnimation = function(properties) {
	var currentTime, currentPose;
	currentTime = this.timeline; // current time
	posesList = this.poses; // gets the poses
	loopPose(posesList, currentTime, properties);
};

scene.prototype.getAnimation = function(index) {
	return index < 0 || this.poses[index];
};

scene.prototype.addAnimation = function(newProp, span, dur) {
	var l = this.poses.length,
		old = 0,
		span = span.toString().match(/%$/) ? (span.replace(/%$/,'') * dur / 100) : span,
		newSpan = newProp instanceof this.constructor ? newProp.span : span;

	if (l > 0 && this.isSequence) {
		old = this.poses[l-1].span;
		newSpan += old;
	}
	this.poses.push({animate: newProp, span: newSpan, begin: old });
	this.span = newSpan;
};

scene.prototype.action = function(ts, pose) {
	var tm, i, poses,
		dur = this.span;

	if (this.isActive()) {
		tm = rolePlay(ts, this);
		if (isNaN(tm) || tm < 0) return pose;
		else if (tm <= dur) {
			poses = posesAtTime(this.poses, tm);
			for (i = 0, pose;
				(pose = poses[i]); i++) {
				if (pose instanceof this.constructor) {
					this.toScene(pose).action(ts);
				} else {
					update(pose, this.actor, (tm - pose.begin), (pose.span - pose.begin));
				}
			}
			this.step && this.step(this.actor);
		} else {
			this.repeat = REPEAT[this.repeat] || this.repeat;
			this.timeline = --this.repeat ? 0 : this.span;
			if (this.repeat) {
				this.actor.addStyles(this.actor.initalState);
			} else {
				if (FILLMODE[this.fillmode]) {
					this.actor.addStyles(this.actor.initalState);
				}
				this.cut();
			}
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

scene.prototype.toScene = function (scene) {
	scene.speed = this.speed;
	scene.direction = this.direction;
	scene.handleLayers = this.handleLayers;
	return scene;
};


scene.prototype.addScene = function(sc) {
	var l = this.poses.length,
		old = 0,
		newSpan = sc instanceof this.constructor ? sc.span : 0;

	if (l > 0 && this.isSequence) {
		old = this.poses[l-1].span;
		newSpan += old;
		sc.span = newSpan;
		sc.begin = old;
	}

	this.poses.push(sc);
	this.span = newSpan;
};



function loop (was, is) {
	if (this.animating) {
		_ts = is - (was || 0);
		_ts = (_ts > _framerate) ? _framerate : _ts;
		this.action(_ts);
	} else if (this.actor && this.actor.destroyed) {
		animation.unsubscribe(this.rAFId);  
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
	t = t * actor.speed * actor.direction;

	actor.timeline += t;
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
function posesAtTime(anims, span) {
	function doFilter(val, idx, ar) {
		return span > (val.begin || 0) && span <= val.span;
	}
	return anims.filter(doFilter);
}

var
	REPEAT = {
		'true': Infinity,
		'false': 1
	},
	FILLMODE = {
		'backwards': true,
		'forwards': false,
		'default': false,
		'none': false
	};