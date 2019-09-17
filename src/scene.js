var
	tween = require('./tween'),
	utils = require('./utils'),
	animation = require('./animation');
/**
 * Contains the declaration for the {@link module:enyo/scene~scene} of an animation.
 * @module enyo/scene
 */

var _ts, _framerate = 16.6;

var AnimationSupport = {
	/**
	 * Reiterates the animation applied to the component.
	 * It could be;
	 * true, for infinite iteration
	 * [Number], for how many times animation should iterate.
	 * false, for no repetition
	 * @public
	 * @memberOf module:enyo/scene
	 */
	repeat: false,
	/**
	 * Reduces GPU layers when the animation is completed.
	 * As most of the transform animations happens on 
	 * GPU layer, ans stays there even after the animations 
	 * is completed. However, need to be carefull while using this
	 * feature as if the component tends to animate regularly, this 
	 * feature would be an overhead.
	 * when true, GPU memory is freed
	 *      false, layer remain intact.
	 * @public
	 * @memberOf module:enyo/scene
	 */
	handleLayers: false,
	/**
	 * Indentifies whether the animation is in progress or not.
	 * when true, animation is in progress
	 *      false, otherwise.
	 * @public
	 * @memberOf module:enyo/scene
	 */
	animating: false,
	/**
	 * Specifies the rate at which animation should be played.
	 * When 0, animation is still
	 *      1, animation plays with normal speed
	 *      2, animation plays with 2X fast speed
	 *      0.5, animation plays with slow speed at half of normal speed.
	 * @public
	 * @memberOf module:enyo/scene
	 */
	direction: 0,
	/**
	 * Specifies the rate at which animation should be played.
	 * When 0, animation is still
	 *      1, animation plays with normal speed
	 *      2, animation plays with 2X fast speed
	 *      0.5, animation plays with slow speed at half of normal speed.
	 * @public
	 * @memberOf module:enyo/scene
	 */
	speed: 0,
	/**
	 * Moves animation to a particular point within the span of 
	 * an animation. Its value could lie between 0 and total duration
	 * of the animation.
	 * @public
	 * @memberOf module:enyo/scene
	 */
	seekInterval: 0,
	/**
	 * Plays animation in sequence when set to true else 
	 * its a parallal animation. This could be applied for
	 * animation properties as well as for scenes within a 
	 * scene.
	 * @public
	 * @memberOf module:enyo/scene
	 */
	isSequence: true,
	/**
	 * Starts animation when scene is initialized, 
	 * when this property is set to true. When false scene instance has
	 * to be explicity played using 'play' api.
	 * @public
	 * @memberOf module:enyo/scene
	 */
	autoPlay: true,
	/**
	 * The limit for an animation, which could be an instance
	 * of time as well as distance.
	 * @public
	 * @memberOf module:enyo/scene
	 */
	span: 0,
	/**
	 * The current time state of animation. This represents the
	 * time at which animation is progressed upon. As this property 
	 * directly impacts the state of animation, updating this value  
	 * have direct effect on animation unless its animation is halted.
	 * The range lies between 0 to overall span of animation.
	 * @public
	 * @memberOf module:enyo/scene
	 */
	timeline: 0,
	/**
	 * Starts the animation of scene.
	 * @public
	 * @memberOf module:enyo/scene
	 */
	play: function() {
		this.direction = this.speed = 1;
		if (isNaN(this.timeline) || !this.timeline) {
			this.timeline = 0;
		}
		this.animating = true;
		return this;
	},

	/**
	 * Resumes the paused animation of scene.
	 * @memberOf module:enyo/scene
	 * @public
	 */
	resume: function() {
		this.direction = 1;
		return this;
	},

	/**
	 * Pauses the animation of scene.
	 * @memberOf module:enyo/scene
	 * @public
	 */
	pause: function() {
		this.direction = 0;
		return this;
	},

	/**
	 * Reverses the animation of scene.
	 * @memberOf module:enyo/scene
	 * @public
	 */
	reverse: function() {
		this.direction = -1;
	},

	/**
	 * Stops the animation of scene.
	 * @memberOf module:enyo/scene
	 * @public
	 */
	stop: function() {
		this.speed = 0;
		this.timeline = 0;
	},

	/**
	 * Seeks the animation to the position provided in <code>seek</code>
	 * The value of <code>seek</code> should be between <b>0</b> to <code>duration</code> of the animation.
	 * @param  {Number} seek      where the animation has to be seeked
	 * @memberOf module:enyo/scene
	 * @public
	 */
	seek: function(seek) {
		this.timeline = seek;
	},

	/**
	 * Seeks the animation to the position provided in <code>seek</code> with animation
	 * The value of <code>seek</code> should be between <b>0</b> to <code>duration</code> of the animation.
	 * @param  {Number} seek      where the animation has to be seeked
	 * @memberOf module:enyo/scene
	 * @public
	 */
	seekAnimate: function(seek) {
		if (seek >= 0) {
			if (!this.animating)
				this.play();
			this.speed = 1;
		} else {
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
	 * @memberOf module:enyo/scene
	 * @public
	 */
	completed: function() {},

	/**
	 * Event to identify when the scene has done a step(rAF updatation of time) in the animation.
	 * @memberOf module:enyo/scene
	 * @public
	 */
	step: function() {}
};

/**
 * Interface which accepts the animation details and returns a scene object
 * @param  {Object} actor      component which has to be animated
 * @param  {Object} props      properties of the component
 * @param  {Object} opts       additional options
 * @return {Object}            A scene object
 */
module.exports = function (proto, properties, opts) {
	var i, ctor, ps, s;

	if (!utils.isArray(proto)) {
		ps = new scene(proto, properties, opts);
	} else {
		ps = new scene();
		if (opts) utils.mixin(ps, opts);
		for (i = 0;
			(ctor = proto[i]); i++) {
			s = new scene(ctor, properties);
			ps.addScene(s);
		}
	}

	ps.autoPlay && ps.play();
	return ps;
};

/**
 * {@link module:enyo/Scene~Scene}
 *
 * @class Scene
 * @extends module:enyo/Scene~Scene
 * @param  {Object} actor      component which has to be animated
 * @param  {Object} props      properties of the component
 * @param  {Object} opts       additional options
 * @public
 */
function scene(actor, props, opts) {
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
}

/**
 * Checks whether the scene is in a active state, which then can be animated
 * @return {Boolean} generated value in true or false. true in case of the parent scene
 * @memberOf module:enyo/scene
 * @public
 */
scene.prototype.isActive = function() {
	if (this.actor)
		return this.actor.generated && !this.actor.destroyed;

	// making sure parent scenes are always active.
	return true;
};

/**
 * Sets the new animations with the properties passed.
 * @param {Object} properties       Animation properties
 * @memberOf module:enyo/scene
 * @public
 */
scene.prototype.setAnimation = function(properties) {
	var currentPose = findScene(this.poses, "poses");
	setScene(currentPose, this.timeline, properties);
};

/**
 * Gets the current animation pose.
 * @param {Number} index       animation index
 * @return {Object} pose       pose with the passed index
 * @memberOf module:enyo/scene
 * @public
 */
scene.prototype.getAnimation = function(index) {
	return index < 0 || this.poses[index];
};

/**
 * addAnimation is used for adding new animation with the passed properties at run time.
 * @param {Object} newProp  animation properties for new animation
 * @param {Number} span     span between the animation
 * @param {Number} dur      duration for the new animation
 * @memberOf module:enyo/scene
 * @public
 */
scene.prototype.addAnimation = function(newProp, span, dur) {
	dur = dur || this.span;
	var l = this.poses.length,
		old = 0,
		spanCache = span.toString().match(/%$/) ? (span.replace(/%$/, '') * dur / 100) : span,
		newSpan = newProp instanceof this.constructor ? newProp.span : spanCache;

	if (l > 0 && this.isSequence) {
		old = this.poses[l - 1].span;
		newSpan += old;
	}
	this.poses.push({
		animate: newProp,
		span: newSpan,
		begin: old
	});
	this.span = newSpan;
};

/**
 * Add a new animation scene for the animation.
 * @param {Object} sc scene which has to be added
 * @memberOf module:enyo/scene
 * @public
 */
scene.prototype.addScene = function(sc) {
	var l = this.poses.length,
		old = 0,
		newSpan = sc instanceof this.constructor ? sc.span : 0;

	if (l > 0 && this.isSequence) {
		old = this.poses[l - 1].span;
		newSpan += old;
		sc.span = newSpan;
		sc.begin = old;
	}

	this.poses.push(sc);
	this.span = newSpan;
};

/**
 * @private
 */
function action(ts, pose) {
	var tm, i, poses,
		dur = this.span,
		actor = this.actor;

	if (this.isActive()) {
		tm = rolePlay(ts, this);
		if (isNaN(tm) || tm < 0) return pose;

		poses = posesAtTime(this.poses, tm > dur ? dur : tm);
		for (i = 0, pose;
			(pose = poses[i]); i++) {
			if (pose instanceof this.constructor) {
				pose.speed = this.speed;
				pose.direction = this.direction;
				pose.handleLayers = this.handleLayers;
				action.call(pose, ts);
			} else {
				update(pose, actor, (tm - pose.begin), (pose.span - pose.begin));
			}
		}
		this.step && this.step(actor);

		if (tm > dur) cut.call(this, actor);
	}
	return pose;
}

/**
 * @private
 */
function cut(actor) {
	this.repeat = REPEAT[this.repeat] || this.repeat;
	this.timeline = --this.repeat ? 0 : this.span;

	if (this.repeat > 0) {
		applyInitialStyle(this);
		return;
	} else {
		if (FILLMODE[this.fillmode]) {
			applyInitialStyle(this);
		}
	}

	if (this.handleLayers) {
		this.speed = 0;
		if (this.active) {
			this.active = false;
			tween.halt(actor);
		}
	}
	this.animating = false;
	this.completed && this.completed(actor);
}

/**
 * @private
 */
function loop(was, is) {
	if (this.animating) {
		_ts = is - (was || 0);
		_ts = (_ts > _framerate) ? _framerate : _ts;
		action.call(this, _ts);
	} else if (this.actor && this.actor.destroyed) {
		animation.unsubscribe(this.rAFId);
	}
}

/**
 * @private
 */
function update(pose, actor, since, dur) {
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
function rolePlay(t, actor) {
	actor = actor || this;
	t = t * actor.speed * actor.direction;

	actor.timeline += t;
	if (actor.seekInterval !== 0) {
		if ((actor.seekInterval - actor.timeline) * actor.speed < 0) {
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

/**
 * @private
 */
function modify(pose, currentTm) {
	pose.span = currentTm;
	delete pose._endAnim;
	pose._endAnim = pose.currentState;
	return pose;
}
/**
 * @private
 */
function setScene(poseArr, tm, properties) {
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
}
/**
 * @private
 */
function hasScene(poseArr, propCheck) {
	var bool;
	if (!utils.isArray(poseArr)) {
		bool = poseArr[propCheck] ? true : false;
	} else {
		for (var i = 0; i < poseArr.length; i++) {
			bool = poseArr[i][propCheck] ? true : false;
			if (bool) break;
		}
	}
	return bool;
}
/**
 * @private
 */
function findScene(poseArr, propCheck) {
	var parentNode, currNode = poseArr;
	if (hasScene(poseArr, propCheck)) {
		if (utils.isArray(poseArr)) {
			for (var i = 0; i < poseArr.length; i++) {
				parentNode = currNode[i];
				currNode = findScene(currNode[i].poses, propCheck);
			}
		} else {
			parentNode = currNode;
			currNode = findScene(currNode.poses, propCheck);
		}
	}
	return parentNode ? parentNode[propCheck] : parentNode;
}

/**
 * @private
 */
function applyInitialStyle(node) {
	node = node.actor ? node : findScene(node.poses, "actor");
	node = node.actor || node;
	node.addStyles(node.initialState);
}

var
	REPEAT = {
		'true': Infinity,
		'false': 0
	},
	FILLMODE = {
		'backwards': true,
		'forwards': false,
		'default': false,
		'none': false
	};