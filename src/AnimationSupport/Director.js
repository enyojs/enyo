require('enyo');

var tween = require('./Tween'),
    utils =  require('../utils');

var pose, dur, tm, t;

/**
* Contains the declaration for the {@link module:enyo/AnimationSupport/Director} module.
* This modules exposes the features to support 'Director' approach.
* @module enyo/AnimationSupport/Director
*/
module.exports = {

    /**
     * This method checks if all the actors of the given {@link @module enyo/AnimationSupport/Scene} object
     * is rendered. If the actors are rendered then all them are initialized and prepared to be ready for animation.
     * @param  {@link @module enyo/AnimationSupport/Scene}     scene    Scene which contains actors to be prepared for animation.
     * @return {boolean}            Returns <code>true</code> if all the actors
     *                                      of the scene is active and ready for action,
     *                                      otherwise <code>false</code>
     */
    roll: function (scene) {
        var actor,
            actors = scene.rolePlays ? scene.rolePlays[scene.getID()]: [],
            l = actors ? actors.length: 0,
            active = true;

        for (var i = 0; i < l; i++) {
            actor = actors[i];
            if(actor.generated) {
                tween.init(actor);
                active = false;
            }
        }
        scene.active = active;
    },

    /**
     * <code>take</code> method is invloved in time based animation. This method will
     * be executed continuously in order tween the actor for every frame until the animation
     * is completed (i.e. until elapsed time is equal to the duration).
     * be animated based on the delta and the acceleration.
     * @param  {@link @module enyo/AnimationSupport/Scene} scene     Scene on which the animation will be performed
     * @param  {Number} ts      Elapsed time since the animation of this pose has started (ratio in factor of 1)
     */
    take: function (scene, ts) {
        dur = scene.span;
        tm = scene.timeline;

        if (isNaN(tm) || tm < 0) return;
        if (tm <= dur) {
            pose = scene.action(ts, pose);
        } else {
            scene.timeline = dur;
            scene.animating = false;
        }
    },

    /**
     * <code>action</code> is the primary method which triggers the animation of the actor for every frame.
     * This method calculates the start and end animation positions and the elapsed time since the animation
     * has started and tweens the actor based on the these values.
     * @param  {Object} pose  Animation poses
     * @param  {@link module:enyo/Component~Component} actor <code>Component</code> on which the animation should be performed
     * @param  {Number} since Elapsed time since the animation of this pose has started
     * @param  {Number} dur   Total duration of this pose
     */
    action: function (pose, actor, since, dur) {
        if (!pose._startAnim) tween.init(actor, pose);

        if (since < 0) since = 0;
        if (since <= dur && dur !== 0) {
            t = since / dur;
            tween.step(actor, pose, ( t > 0.98) ? 1 : t, dur);
        } else {
            tween.step(actor, pose, 1, dur);
        }
    },
 
    /**
     * Casts an actor or all the actors in the array to the given scene.
     * @param  {@link module:enyo/Component~Component} actors actor or Array of actors which needs to be casted in the scene.
     * @param  {@link @module enyo/AnimationSupport/Scene} scene  Scene to which the actors has to be connected.
     */
    cast: function (actors, scene) {
        var acts = utils.isArray(actors) ? actors : [actors],
            id = scene.getID(),
            rolePlays = scene.rolePlays || {};

        if (!rolePlays[id]) {
            rolePlays[id] = acts;
        } else {
            rolePlays[id] = acts.reduce(function(actors, actor) {
                actors.push( actor );
                return actors;
            }, rolePlays[id]);
        }
        scene.rolePlays = rolePlays;
    },

    /**
     * Disconnects actor or Array of actors from the scene
     * @param  {Array.<Component>} actors   actor or Array of actors which needs to be casted in the scene.
     * @param  {@link @module enyo/AnimationSupport/Scene} scene    Scene from which the actors has to be removed.
     */
    reject: function (scene, actors) {
        var id = scene.getID(), acts,
            rolePlays = scene.rolePlays || [];
        actors = actors || rolePlays[id];
        acts = utils.isArray(actors) ? actors : [actors];
        if (rolePlays[id]) {
            rolePlays[id] = acts.reduce(function(actors, actor) {
                var i = actors.indexOf(actor);
                if (i >= 0) actors.splice(i, 1);
                return actors;
            }, rolePlays[id]);
        }
        scene.rolePlays = rolePlays;
    },

    /**
     * <code>shot</code> method is invloved in distance based animation in which the distance definite and 
     * indefinite (Event based animations). This method calculates the distance to which the actor has to
     * be animated based on the delta and the acceleration.
     * @param  {@link module:enyo/Component~Component} actor <code>Component</code> on which the animation should be performed
     * @param  {Number} ts    delta distance
     * @return {Number}       The distance to which the actor has to be transformed
     */
    shot: function(actor, ts) {
        var v1, s, a, v = 0,
            t = ts,
            dt = actor.getAnimationDelta(),
            dir = this.angle(actor.direction),
            v0 = dt.velocity || 0;
        
        v1 = dt[dir] / t;
        if (v1 === 0) {
            dt[dir] = 0;
            dt.velocity = 0;
        } else {
            a = (v1 - v0) / t;
            s = 0.5 * a * t * t;
            v = (a < 0 ? -s : s);
            dt[dir] = dt[dir] - v;
            if (a > -0.001 && a < 0.001) {
                dt[dir] = 0;
            }
            dt.velocity = v1;
        }
        return dt[dir] > 0 ? v : -v;
    },

    /**
     * @private
     */
    angle: function (direction) {
        switch(direction) {
        case "X" :
            return "dX";
        case "Y" :
            return "dY";
        case "Z" :
            return "dZ";
        default: 
            return "dX";
        }
    }
};