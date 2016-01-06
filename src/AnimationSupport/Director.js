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
    
    take: function(scene, ts) {
        var dur = scene.totalSpan(),
            tm = scene.rolePlay(ts),
            actors = rolePlays[scene.getID()];

        if (tm < 0) return;
        if (tm <= dur) {
            for (var i = 0; i < actors.length; i++) {
                if(actors[i].generated)
                    this.action(actors[i], scene, tm);
            }
        } else {
            this.cut(scene);
        }
    },

    cut: function (scene) {
        scene.animating = false;
        scene.timeline = 0;

        //TODO: Use Event Delegator to emit this event.
        scene.completed && scene.completed(scene);
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

    casting: function (actors, scene) {
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

    shot: function(chrac, ts) {
        var v1, s, a, v,
            t = ts,
            dt = chrac._eventCache,
            dir = this.angle(chrac.direction),
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
            this.take(chrac, dt[dir] > 0 ? v : -v);
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