var
	actor = require('./Actor'),
	director = require('./Director'),
	utils = require('../utils');

/**
 * This module exports "Scene" which is a class/constructor so that we can create an instance of the same.
 * We can define all the animation properties we want in the application in the instance of the "Scene".
 * 
 * @module enyo/AnimationSupport/Scene
 */
var Scene = module.exports = function(props) {
	var scene = actor(props);
	utils.mixin(scene, SceneAction);
	utils.mixin(scene, props);
	return scene;
};

var SceneAction = {
	threshold: 0,

	rolePlays: [],

	action: function(ts, pose) {
		var i, role, actor,
			tm = this.rolePlay(ts),
			thres = this.threshold || this.span;

		role = this.rolePlays[Math.floor(tm/thres)];
		if (role && thres < role.dur) {
			role.actor.active = true;
		} else {
			for (i = 0; (role = this.rolePlays[i]); i++) {
				if ((tm + thres) >= role.span ) {
					role.actor.active = true;
				}
			}
		}

		for (i = 0; (role = this.rolePlays[i]); i++) {
			actor = role.actor;
			if (actor.active) {
				actor.speed = this.speed;
				pose = actor.action(ts, pose);
			}
		}
		return pose;
	},

	updateSpan: function(span) {
		this.span = this.totalSpan * span / this.threshold;
	}

};



	// if (thres === role.dur) {
	// 	actor.speed = this.speed;
	// 	pose = actor.action(ts, pose);
	// 	tm = this.rolePlay(ts);
	// 	console.log(tm + " same duration:"+ role.span);
	// 	break;
	// } else if (thres > role.dur) {
	// 	thres -= role.dur;
	// 	actor.speed = this.speed;
	// 	tm = this.rolePlay(ts);
	// 	pose = actor.action(ts, pose);
	// 	console.log(tm + " greater duration"+ role.span);
	// } 
	// else {
	// 	actor.speed = this.speed;
	// 	tm = this.rolePlay(ts);
	// 	// actor.timeline = tm == 0 ? 0 : thres;
	// 	pose = actor.action(ts, pose);
	// 	break;
	// }


/**
 * Connects an actor/s to a scene.
 * All the actors should be added before initiating animation otherwise actors will animate for remaining time span
 * @memberOf module:enyo/AnimationSupport/Scene
 * @public
 * @param  {Object} actors - The elements which needs to be animated
 * @param  {Object} scene  - The instance of the Scene we've created in the application
 */
Scene.link = function(actors, scene) {
	if (!scene && !actors ) return;

	var actorScene,
		acts = utils.isArray(actors) ? actors : [actors];

	for (var act, i = 0; (act = acts[i]); i++) {
		if (scene.isScene) {
			actorScene = act.scene.isScene ? act.scene : actor(act.scene, act);
			scene.span += actorScene.span;
			scene.rolePlays.push({actor: actorScene, span: scene.span, dur: actorScene.span});
		} else {
			actorScene = actor(scene, act);
			acts[i].scene = actorScene;
		}
	}
};


/**
 * Disconnects an actor/s from a scene.
 * (Actors could be delinked during the animation 
 * however they will current their state when delinked)
 * @memberOf module:enyo/AnimationSupport/Scene
 * @public
 * @param  {Object} actors - The elements which needs to be animated
 * @param  {Object} scene  - The instance of the Scene we've created in the application
 */
Scene.delink = function(actors, scene) {
	var parent, acts = utils.isArray(actors) ? actors : [actors], actor;

	if (typeof scene == 'function') {
		parent = scene;
	}
	for (var i = 0; i < acts.length; i++) {
		director.reject(parent, actor.scene);
		actor.scene = undefined;
	}
};