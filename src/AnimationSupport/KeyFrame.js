require('enyo');

var
    kind = require('../kind'),
    animation = require('./Core'),
    utils = require('../utils'),
    CoreObject = require('../CoreObject');

/**
 * This module returns the Loop singleton
 * @module enyo/KeyFrame
 */
var keyFrame = module.exports = kind.singleton({
    /** @lends module:enyo/KeyFrame */

    /**
     * @private
     */
    name: 'enyo.KeyFrame',
    /**
     * @private
     */
    kind: CoreObject,

    /**
     * KeyFrame base API to perform animation on any document element
     * repersented as a Character. The purpose of this method is to add a new 
     * character to Animation Core based on animation properties passed as 
     * parameter to this function and also to manage the frames allocated to
     * each of individual poses.
     *
     * As of now this method is provided as an interface for application 
     * to directly trigger an animation. However, this will be later made private
     * and will be accessible only by the interfaces exposed by framework.
     * @parameter charc-        Character responsible for animation.
     *          keyframe-   Key frame Animation propeties represented as CSS objects.
     *                      like: {0: {"rotateX": "0"}, 50: {"rotateX": "90"}, 100: {"rotateX": "180"}}
     * @public
     */
    animate: function(charc, proto) {
        var prop, easeInd,
            cb = proto.completed,
            keyframe = proto.keyFrame;
        charc.keyProps = [];
        charc.keyTime = [];
        charc.currentIndex = 0;
        for (prop in keyframe) {
            charc.keyTime.push(prop);
            charc.keyProps.push(keyframe[prop]);
        }
        charc.keyframeCallback = cb;
        charc.totalDuration = proto.duration;
        this.keyFraming(charc);
        charc.completed = this.bindSafely(this.reframe);
        //this.keyFraming(charc);
        this.trigger(charc);
    },

    /**
     * KeyFrame's public API to reverse an animation.
     * The purpose of this method is to find the animating character based on
     * the DOM provided and reversing a keyframe animation by interchanging its intial 
     * state with final state and final state with current state
     *
     * As of now this method is provided as an interface for application 
     * to directly trigger an animation. However, this will be later made private
     * and will be accessible only by the interfaces exposed by framework.
     * @parameter dom-      Document element on which animation will be reversed.
     *
     * @public
     */
    reverse: function(dom) {
        var charc = animation.exists(dom),
            finalState, duration;
        if (charc) {
            finalState = charc._startAnim;
            duration = utils.perfNow() - charc.initialTime;
            animation.remove(charc);

            charc.setAnimation(finalState);
            charc.setInitial(charc.currentState);
            charc.setDuration(duration);
            charc.totalDuration = duration;
            charc.keyProps = [];
            charc.keyTime = [];
            charc.animating = false;
            this.trigger(charc);
        }
    },

    trigger: function(charc) {
        if (charc.handleAnimationEvents && typeof charc.handleAnimationEvents != 'function') {
            animation.register(charc);
        } else
            animation.trigger(charc);
    }
});

/**
 * @private
 */
keyFrame.keyFraming = function(charc) {
    var index = charc.currentIndex || 0,
        old = charc.keyTime[index - 1] || 0,
        next = charc.keyTime[index],
        total = charc.totalDuration,
        change = total ? total * ((next - old) / 100) : "0";
    charc.addAnimation(charc.keyProps[index]);

    // code to separate the ease component from keyframe and making it available for animation
    if (charc.keyProps[index].hasOwnProperty('ease')) {
        charc.ease = charc.keyProps[index].ease;
        delete charc.keyProps[index].ease;
    }
    
    if (charc.totalDuration) charc.setDuration(change);
    charc.animating = false;
    charc.currentIndex = index;
};

/**
 * @private
 */
keyFrame.reframe = function(charc) {
    charc.reverse ? charc.currentIndex-- : charc.currentIndex++;
    if (charc.currentIndex >= 0 && charc.currentIndex < charc.keyTime.length) {
        this.keyFraming(charc);
        charc.start(true);
    } else {
        //Tigerring callback function at end of animation
        charc.keyframeCallback && charc.keyframeCallback(this);
    }
};
