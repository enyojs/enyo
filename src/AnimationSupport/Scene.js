var 
	SceneEditor =  require('./SceneEditor'),
	animation = require('./Core'),
	delegator = require('./EventDelegator'),
	director = require('./Director'),
	utils = require('../utils');

var Scene = module.exports = function (props){
	var scene = Scene.create();
	utils.mixin(scene, SceneEditor);

	if(props.animation) {
		scene.addAnimation(props.animation, props.duration  || 0);
	}
	animation.trigger(scene);
	return scene;
};

Scene.create = function () {
	return new sceneConstructor();
};

Scene.link = function(actors, scene) {
	director.rolePlay(actors, scene);
    scene.hasActors = true;
};

var sceneConstructor = function () {
	var _poses = [],

		_eventCache = {},

		_prevDur = 0,

		//_isActive = true,

		//_state,

		_isTriggered = false,

		_triggerer;


	this.totalDuration = 0;
	this.animating = false;
	this.hasActors = false;

	this.ready = function() {
		var ret = this.animating && this.hasActors !== undefined;
		if (ret && this._startTime)
			ret = this._startTime <= utils.perfNow();
		return ret;
	};


	/**
	* Adds new animation on already existing animation for this character.
	* @public
	*/
	this.addAnimation = function (newProp, duration) {
		if (_prevDur === 0 && duration === 0) {
			_poses[0] = {animate: newProp, duration: 0};
		} else {
			_prevDur = duration || _prevDur;
			this.totalDuration += _prevDur;
			_poses.push({animate: newProp, duration: this.totalDuration});
		}
	};

	this.animateAtTime = function(duration) {
        var startIndex = 0,
            stopIndex = _poses.length - 1,
            middle = Math.floor((stopIndex + startIndex) / 2);

        if(duration === 0) {
            return startIndex;
        }

        while (_poses[middle].duration != duration && startIndex < stopIndex) {
            if (duration < _poses[middle].duration) {
                stopIndex = middle;
            } else if (duration > _poses[middle].duration) {
                startIndex = middle + 1;
            }

            middle = Math.floor((stopIndex + startIndex) / 2);
        }

        return (_poses[middle].duration != duration) ? startIndex : middle;
    },

    this.getAnimation = function(index) {
		return index < 0 || _poses[index];
    },

	/**
	* Sets new animation for this character.
	* @public
	*/
	this.setAnimation = function (newProp) {
		this._prop = newProp;
	};


	/**
	* Sets the delta values of x, y and z for events
	* @param {Object} obj - Object contains dX, dY and dZ as keys
	* @public
	*/
	this.setAnimationDelta = function (ev) {
		_eventCache.dX = ev.dX + _eventCache.dX || 0;
		_eventCache.dY = ev.dY + _eventCache.dY || 0;
		_eventCache.dZ = ev.dZ + _eventCache.dZ || 0;
		_eventCache[ev.vtype] = ev;

		_isTriggered =  true;
		_triggerer = ev.vtype;
		this.eventCacheUpdated = true;
	};

	/**
	* Gets the delta values of x, y and z for events
	* @public
	*/
	this.getAnimationDelta = function () {
		return _eventCache[_triggerer];
	};

	/**
	* Idnetify when the character has done animating.
	* This triggers "onAnimated" event on this character
	* @public
	*/
	this.completed = function() {
		return this.onAnimated && this.onAnimated(this);
	};


	/**
	* Trigger the registered event to all the listeners
	* @public
	*/
	this.triggerEvent = function () {
		_isTriggered = false;
		return delegator.emitEvent(this, this.getAnimationDelta());
	};

};





	
	



	

	