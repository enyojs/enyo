require('enyo');

var tween = require('./Tween'),
    utils =  require('../utils');

var pose, dur, tm, t;

/**
* This modules exposes the features to support 'Director' approach.
* @module enyo/AnimationSupport/Scene
*/
module.exports = {

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