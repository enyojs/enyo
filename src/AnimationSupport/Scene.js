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
module.exports = function(props) {
	var scene = actor(props);
	utils.mixin(scene, Scene);
};

var Scene = {
	threshold: 0,

	rolePlays: [],

	action: function(ts, pose) {
		var i, role, actor, count = 0,
			tm = this.rolePlay(ts);

		tm += this.threshold;
		for (i = 0; (role = this.rolePlays[i]); i++) {

			//TODO: set matrix 2d to these components
			if (tm > role.span) continue;

			actor = role.actor;
			if (tm === role.span) {
				pose = actor.action(ts, pose);
				break;
			} else if (tm > role.span) {
				pose = actor.action(ts, pose);
			} else {
				actor.timeline = count * this.threshold;
				pose = actor.action(ts, pose);
				count ++;
			}
		}
		return pose;
	},

	updateSpan: function(span) {
		this.span = this.totalSpan * span / this.threshold;
	}

};

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

	for (var i = 0; i < acts.length; i++) {
		actorScene = actor(scene, acts[i]);
		if (scene.isScene) {
			scene.span += actorScene.span;
			scene.rolePlays.push({actor: actorScene, span: scene.span});
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