
require('enyo');

/**
* This module returns the Loop singleton
* @module enyo/Core
*/
var
	kind = require('../kind'),
	animation = require('./Core'),
	frame = require('./Frame'),
	utils = require('../utils');

var
	CoreObject = require('../CoreObject');

var AnimationKeyFrame = module.exports = kind.singleton({
	/** @lends module:enyo/AnimatioKeyFrame */

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
	* @parameter domObject-		Document element on which animation will be performed.
	*			duration-	Duration for the animation.
	*			keyframe-	Key frame Animation propeties represented as CSS objects.
	*						like: {0: {"rotateX": "0"}, 50: {"rotateX": "90"}, 100: {"rotateX": "180"}}
	*			complete-	Call back triggered when an animation is completed.
	* @public
	*/
	animate: function (charc, proto) {
		var prop;
		//if (animation.exists(charc.getDom())) return;

		//charc = new animation.Character(domObject, null, null, this.reframe);
		var keyframeCallback = proto.completed;
		charc.keyframeCallback = keyframeCallback;
		charc.initialTime = utils.perfNow();
		charc.totalDuration = proto.duration;
		charc.keyProps = [];
		charc.keyTime = [];
		var keyframe = proto.keyFrame;

		for (prop in keyframe) {
			charc.keyTime.push(prop);
			charc.keyProps.push(keyframe[prop]);
		}
		charc.completed = this.bindSafely(this.reframe);
		
		this.keyFraming(charc);
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
	* @parameter dom-		Document element on which animation will be reversed.
	*
	* @public
	*/
	reverse: function (dom) {
		var charc = animation.exists(dom),
			finalState, duration;
		if (charc) {
			finalState = charc._start;
			duration = utils.perfNow() - charc.initialTime;
			animation.remove(charc);

			charc.setProperty(finalState);
            charc.setInitial(charc.currentState);
            charc.setDuration(duration);
            charc.totalDuration = duration;
            charc.keyProps = [];
			charc.keyTime = [];
            charc.animating = false;
            animation.trigger(charc);
		}
	},

	trigger: function (charc) {
		animation.trigger(charc);
	}
});

/**
* @private
*/
AnimationKeyFrame.keyFraming = function (charc, callback) {
	var index = charc.currentIndex || 0;
	var time = charc.currentIndex ?
		charc.totalDuration * ((charc.keyTime[index] - charc.keyTime[index -1])/100) : "0";

	charc.setProperty(charc.keyProps[index]);
	charc.setInitial(index > 0 ? charc.keyProps[index -1] : {});
	charc.setDuration(time);
	charc.animating = false;
	charc.currentIndex = index;
	animation.trigger(charc);
};

/**
* @private
*/
AnimationKeyFrame.reframe = function (charc) {
	charc.currentIndex++;
	if (charc.currentIndex < charc.keyTime.length) {
		this.keyFraming(charc);
		var init = frame.getCompoutedProperty(charc.getDom(), charc.getProperty(), charc._start);
		utils.mixin(charc, init);
		charc.start();
	} else {
		//Tigerring callback function at end of animation
        charc.keyframeCallback && charc.keyframeCallback(this);
    }
};
