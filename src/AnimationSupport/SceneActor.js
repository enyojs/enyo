var
	Scene = require('./Scene'),
	director = require('./Director'),
	utils = require('../utils');

var 
	tm, actor, actors, len, dur;

var CharacterAction = {
	/**
     * Overridden function initiates action on the animation
     * for the given scene actor.
     * @param  {number} ts   - timespan
     * @param  {Object} pose - pose from the animation list
     * @return {Object}      - pose
     * @memberOf module:enyo/AnimationSupport/SceneActor
     * @private
     * @override
     */
	action: function (ts, pose) {
		var i, past, index;
		
		actors = this.rolePlays[this.getID()];
		len = actors.length;
		dur = this.span;
		for (i = 0; (actor = actors[i]); i++) {
			//give priority to individual actor than scene.
			if (!actor._frameSpeed) {
				actor._frameSpeed = this._frameSpeed;
			}

			if (actor.generated && actor._frameSpeed) {
				tm = this.rolePlay(ts, actor);
				if (isNaN(tm) || tm < 0) continue;
				else if (tm <= dur) {
					index = this.animateAtTime(tm);
					pose = this.getAnimation(index);
					past = index ? this.getAnimation(index - 1).span : 0;
					director.action(pose, actor, tm - past, pose.span - past);
					this.step && this.step(actor);
				} else {
					actor.timeline = dur;
					actor._frameSpeed = 0;
					this.actorCompleted && this.actorCompleted(actor);	
				}
			}
		}
		return pose;
	}
};

/**
 * Scene Actor is used to individually manage all the actors <br><br>
 * The Scene Actor is similar to Scene but can receive
 * an actor for playing the animation.<br>
 * Scene Actor's play when called without the actor,
 * it works same as Scene playing all the actors.<br><br>
 * Usage - SceneActorInstance.play(actor)
 * @module enyo/AnimationSupport/SceneActor
 */
module.exports = function(props) {
	var scene = Scene(props);
	utils.mixin(scene, CharacterAction);
	return scene;
};
