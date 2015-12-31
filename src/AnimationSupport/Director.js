require('enyo');

var frame = require('./Frame'),
	tween = require('./Tween'),
    utils =  require('../utils');

/**
* This module returns the Loop singleton
* Core module is responsible for handling all animations happening in Enyo.
* The responsibilities of this module is to;
* - Trigger vendor specific rAF.
* - Knowing all elements which have requested for animation.
* - Tween animation frames for each characters.
* 
* @module enyo/Core
*/
module.exports = {
/**
     * Tweens public API which notifies to change current state of 
     * a character. This method is normally trigger by the Animation Core to
     * update the animating characters state based on the current timestamp.
     *
     * As of now this method is provided as an interface for application 
     * to directly trigger an animation. However, this will be later made private
     * and will be accessible only by the interfaces exposed by framework.
     * @parameter chrac-        Animating character
     *          ts-         DOMHighResTimeStamp
     *
     * @public
     */
    
    take: function(actor, ts) {
        var dur = actor.totalDuration,
            tm = actor.rolePlay(ts);
        
        if (tm < 0) return;
        if (tm < dur) {
            this.action(actor, tm);
        } else {
            this.action(actor, tm);
            this.cut(actor);
        }
    },

    cut: function (actor) {
        actor.animating = false;
        actor._timeline = undefined;
        actor.completed(actor);
        actor.set('animationState', 'completed');
        if (!actor.active) {
            // this.remove(actor);
        }
    },

    action: function(actor, since) {
        var pose, t,
            index = this.poseByTime(actor._animPose, since),
            props = actor._animPose[index],
            prevDur = actor._animPose[(index - 1) < 0 ? 0 : (index - 1)].duration,
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
        } else {
            tween.step(actor, props, 1, runningDur);
        }
    },

    poseByTime: function(arr, duration) {
        var startIndex = 0,
            stopIndex = arr.length - 1,
            middle = Math.floor((stopIndex + startIndex) / 2);

        if(duration === 0) {
            return startIndex;
        }

        while (arr[middle].duration != duration && startIndex < stopIndex) {
            if (duration < arr[middle].duration) {
                stopIndex = middle;
            } else if (duration > arr[middle].duration) {
                startIndex = middle + 1;
            }

            middle = Math.floor((stopIndex + startIndex) / 2);
        }

        return (arr[middle].duration != duration) ? startIndex : middle;
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