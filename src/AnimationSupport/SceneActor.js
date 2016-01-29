var
	Scene = require('./Scene'),
	director = require('./Director'),
	utils = require('../utils');

var CharacterAction = {
	action: function (ts, pose) {
		var i, actor, tm, past, index,
			dur = this.span,
			actors = this.rolePlays[this.getID()],
			l = actors.length;

		for (i = 0; i < l; i++) {
			actor = actors[i];
			if (actor.generated) {
				if (!actor._frameSpeed) {
					actor._frameSpeed = this._frameSpeed;
				}
				tm = this.rolePlay(ts, actor);	
				if (isNaN(tm) || tm < 0) continue;
				if (tm > dur) {
					actor.timeline = dur;
				}
				index = this.animateAtTime(tm);
				pose = pose || this.getAnimation(index);
				past = index ? this.getAnimation(index - 1).span : 0;
				director.action(pose, actor, tm - past, pose.span - past);

				this.step && this.step(actor);

				if(actor.timeline === dur) {
					this.actorCompleted && this.actorCompleted(actor);
				}
			}
		}

		//TODO: return list of actors working in this sceen
		return pose;
	}
};

/**
 * Scene is used to generate animation structure.
 * @module enyo/AnimationSupport/SceneActor
 */
module.exports = function(props) {
	var scene = Scene(props);
	utils.mixin(scene, CharacterAction);
	return scene;
};
