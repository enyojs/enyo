var
    editor = require('./SceneEditor'),
    core = require('./Core'),
    delegator = require('./EventDelegator'),
    director = require('./Director'),
    utils = require('../utils');

/**
 * Scene is used to generate animation structure.
 * 
 * @module enyo/AnimationSupport/Scene
 */
var Scene = module.exports = function(props) {
    var scene = Scene.create(),
        dur = props.duration || 0;

    utils.mixin(scene, editor);

    if (props.animation) {
        var anims = utils.isArray(props.animation) ? props.animation : [props.animation];

        for (var i = 0; i < anims.length; i++) {
            scene.addAnimation(anims[i], anims[i].duration || dur);
            delete anims[i].duration;
        }
        delete props.animation;
        delete props.duration;
    }

    utils.mixin(scene, props);
    core.trigger(scene);
    return scene;
};


/**
 * Creates a empty instance of scene.
 * (To used for runtime creation of animations)
 */
Scene.create = function() {
    return new sceneConstructor("@"+ utils.perfNow());
};


/**
 * Connects an actor/s to a scene.
 * (All the actors should be added before initiating animation
 * otherwise actors will animate for remaining time span)
 */
Scene.link = function(actors, scene) {
    director.cast(actors, scene);
};


/**
 * Disconnects an actor/s from a scene.
 * (Actors could be delinked during the animation
 * however they will current their state when delinked)
 */
Scene.delink = function(actors, scene) {
    director.reject(scene, actors);
};


var sceneConstructor = function(id) {
    var

        _id = id,
    /**
     * Holds refereneces of the all animations added to this scene.
     * @private
     */
        _poses = [],

        /**
         * Holds references for DOM event updates to be used for 
         * virtual events.
         * @private
         */
        _eventCache = {},

        /**
         * Holds old animation time span, useful for scenarios where same
         * time span is expected to be added for the latest added animation.
         * This provides the felxibility to add animation without duration.
         * 
         * Like: scene.addAnimation({translate: '50,0,0'});
         * 
         * As no duration is mentioned the old animations duration is taken.
         * @private
         */
        _prevDur = 0,

        /**
         * Checks if registered DOM event is been triggered for the actors
         * added to this scene.
         * @private
         */
        _isTriggered = false,

        /**
         * Holds refereneces of the activator who has initiated a virtual
         * event for the actor/s in this scene.
         * @private
         */
        _triggerer = '',

        /**
         * Holds refereneces of complete time span for this scene.
         * @private
         */
        _totalDuration = 0;


    /**
     * An exposed property to know if know the animating state of this scene.
     * 'true' - the scene is asked for animation(doesn't mean animation is happening)
     * 'false' - the scene is not active(has completed or its actors are not visible)
     * @public
     */
    this.animating = false;

    /**
     * An exposed property to know if the scene is ready with actors performing action.
     * 'true' - the scene actors are ready for action
     * 'false' - some or all actors are not ready
     * @public
     */
    this.active = false;


    this.getID = function () {
        return _id;
    };

    /**
     * Checks if the sceen is/should be animating or not.
     * @public
     */
    this.ready = function() {
        if (this.animating) {
            if (this.active) return true;
            director.roll(this);
        }
        return false;
    };

    /**
     * Returns the life span/duration of this sceen.
     * @public
     */
    this.totalSpan = function() {
        return _totalDuration;
    };

    /**
     * Adds new animation on already existing animation for this character.
     * @public
     */
    this.addAnimation = function(newProp, duration) {
        if (_prevDur === 0 && duration === 0) {
            _poses[0] = {
                animate: newProp,
                duration: 0
            };
        } else {
            _prevDur = duration || _prevDur;
            _totalDuration += _prevDur;
            _poses.push({
                animate: newProp,
                duration: _totalDuration
            });
        }
    };

    /**
     * Returns animation pose index from the list of 
     * animations added to this scene for a particular 
     * instance of time.
     * @private
     */
    this.animateAtTime = function(duration) {
        var startIndex = 0,
            stopIndex = _poses.length - 1,
            middle = Math.floor((stopIndex + startIndex) / 2);

        if (duration === 0) {
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
    };

    this.clearAnimation = function () {
        for (var i = 0; i < _poses.length; i++) {
            _poses[i]._startAnim = undefined;
        }
    };

    /**
     * Returns animation pose based on index from the list of 
     * animations added to this scene.
     * @public
     */
    this.getAnimation = function(index) {
        return index < 0 || _poses[index];
    };

    /**
     * Sets new animation for this character.
     * @public
     */
    this.setAnimation = function(newProp) {
        this._prop = newProp;
    };


    /**
     * Sets the delta values of x, y and z for events
     * @param {Object} obj - Object contains dX, dY and dZ as keys
     * @public
     */
    this.setAnimationDelta = function(ev) {
        _eventCache.dX = ev.dX + _eventCache.dX || 0;
        _eventCache.dY = ev.dY + _eventCache.dY || 0;
        _eventCache.dZ = ev.dZ + _eventCache.dZ || 0;
        _eventCache[ev.vtype] = ev;

        _isTriggered = true;
        _triggerer = ev.vtype;
    };

    /**
     * Gets the delta values of x, y and z for events
     * @public
     */
    this.getAnimationDelta = function() {
        return _eventCache[_triggerer];
    };

    /**
     * Trigger the registered event to all the listeners
     * @public
     */
    this.triggerEvent = function() {
        _isTriggered = false;
        return delegator.emitEvent(this, this.getAnimationDelta());
    };

    /**
     * Activates handles for generated actors
     * @public
     */
    this.register = function (actor) {
        if (this.handlers) {
            delegator.register(actor, this.handlers);
        }
    };


    //TODO: Move these events to Event Delegator
    /**
     * Event to identify when the scene has done animating.
     * @public
     */
    this.completed = function() {};

    /**
     * Event to identify when the scene has done animating.
     * @public
     */
    this.step = function() {};
};