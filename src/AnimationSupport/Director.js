require('enyo');

var frame = require('./Frame'),
	tween = require('./Tween'),
    utils =  require('../utils');

var rolePlays = {};

/**
* This modules exposes the features to support 'Director' approach.
* @module enyo/AnimationSupport/Scene
*/
module.exports = {

    roll: function (scene) {
        var actor,
            actors = rolePlays[scene.getID()],
            l = actors ? actors.length: 0,
            active = l > 0;

        for (var i = 0; i < l; i++) {
            actor = actors[i];
            if(actor.generated && !actor._initialPose) {
                this.firstShot(actor);
                active = false;
            }
        }
        scene.active = active;
    },
    
    take: function(scene, ts) {
        var tm, stm, actor,
            dur = scene.totalSpan(),
            active = false,
            actors = rolePlays[scene.getID()],
            l = actors.length;

        if (scene._frameSpeed) {
            stm = scene.rolePlay(ts, actor);
        }
        for (var i = 0; i < l; i++) {
            actor = actors[i];
            if (actor.generated) {
                actor = stm ? scene : actor;
                tm = stm || scene.rolePlay(ts, actor);
                tm -= (actor._startTime || 0);
                if (isNaN(tm) || tm <= 0) continue;
                if (tm < dur) {
                    this.action(actors[i], scene, tm);
                    active = true;
                } else {
                    actor.timeline = dur;
                    this.cut(scene, actor);
                }
            }
        }
        scene.animating = active;
    },

    action: function(actor, scene, since) {
        var pose, t, prevDur, currentAnimSince, runningDur,
            index = scene.animateAtTime(since),
            props = scene.getAnimation(index);

        if(index) {
            prevDur = scene.getAnimation(index - 1).duration;
        } else {
            if (!actor._initialPose) this.firstShot(actor);
            prevDur = actor._initialPose.duration;
        }
        
        currentAnimSince = since - prevDur,
        runningDur = props.duration - prevDur;

        if (!props._startAnim) {
            pose = frame.getComputedProperty(actor.hasNode(), props.animate, actor.currentState);
            utils.mixin(props, pose);
        }

        if (currentAnimSince < 0) return;
        if (currentAnimSince <= runningDur && runningDur !== 0) {
            t = currentAnimSince / runningDur;
            tween.step(actor, props, ( t > 0.98) ?  t = 1 : t, runningDur);

            //TODO: Use Event Delegator to emit this event.
            scene.step && scene.step(actor, t);
        } else {
            tween.step(actor, props, 1, runningDur);
        }
    },

    
    cut: function (scene, actor) {
        //TODO: Use Event Delegator to emit this event.
        //scene.clearAnimation();
        scene.completed && scene.completed(actor);
    },


    cast: function (actors, scene) {
        var acts = utils.isArray(actors) ? actors : [actors],
            id = scene.getID();

        if (!rolePlays[id]) {
            rolePlays[id] = acts;
        } else {
            rolePlays[id] = acts.reduce(function(actors, actor) {
                actors.push( actor );
                return actors;
            }, rolePlays[id]);
        }
    },

    reject: function (scene, actors) {
        var id = scene.getID();
        actors = actors || rolePlays[id];
        var acts = utils.isArray(actors) ? actors : [actors];
        if (rolePlays[id]) {
            rolePlays[id] = acts.reduce(function(actors, actor) {
                var i = actors.indexOf(actor);
                if (i >= 0) actors.splice(i, 1);
                return actors;
            }, rolePlays[id]);
        }
    },

    firstShot: function (actor) {
        var dom = actor.hasNode(),
            pose = frame.getComputedProperty(dom, undefined);
        pose.duration = 0;
        actor._initialPose = pose;
        actor.currentState = pose.currentState;
        
        frame.accelerate(dom, pose.matrix);
    },

    shot: function(actor, ts) {
        var v1, s, a, v,
            t = ts,
            dt = actor._eventCache,
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
            this.take(actor, dt[dir] > 0 ? v : -v);
        }   
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