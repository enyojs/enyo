var
    editor = require('./SceneEditor'),
    director = require('./Director'),
    animation = require('../animation'),
    utils = require('../utils');

/**
 * This module exports "Scene" which is a class/constructor so that we can create an instance of the same.
 * We can define all the animation properties we want in the application in the instance of the "Scene".
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
            scene.addAnimation(anims[i], anims[i].span || anims[i].duration || dur);
            delete anims[i].duration;
        }
        delete props.animation;
        delete props.duration;
    }

    utils.mixin(scene, props);
    utils.mixin(scene, SceneAction);
    return scene;
};


/**
 * Creates a empty instance of scene.
 * Can be used for runtime creation of animations
 * @memberOf module:enyo/AnimationSupport/Scene
 * @public
 * @return {Object} An instance of the constructor
 */
Scene.create = function() {
    return new sceneConstructor(utils.uid("@"));
};


/**
 * Connects an actor/s to a scene.
 * All the actors should be added before initiating animation otherwise actors will animate for remaining time span
 * @memberOf module:enyo/AnimationSupport/Scene
 * @public
 * @param  {Object} actors - The elements which needs to be animated
 * @param  {Object} scene  - The instance of the Scene we've created in the application
 */
Scene.link = function(actors, scene) {
    director.cast(actors, scene);
};


/**
 * Disconnects an actor/s from a scene.
 * (Actors could be delinked during the animation 
 * however they will current their state when delinked)
 * @memberOf module:enyo/AnimationSupport/Scene
 * @public
 * @param  {Object} actors - The elements which needs to be animated
 * @param  {Object} scene  - The instance of the Scene we've created in the application
 */
Scene.delink = function(actors, scene) {
    director.reject(scene, actors);
};


/**
 * Function to construct all the scenes instantiated from the Scene
 * @memberOf module:enyo/AnimationSupport/Scene
 * @private
 * @param  {number} id - id of the scene generated when created
 * @return {object} Constructed instance
 */
var sceneConstructor = function(id) {
    var
        _ts, _wasts, _req,
        _framerate = 16.6,
        /**
         * Stores the id of the instance created
         * @memberOf module:enyo/AnimationSupport/Scene
         * @private
         * @type {Array}
         */
        _id = id,

        /**
         * Holds refereneces of the all animations added to this scene.
         * @memberOf module:enyo/AnimationSupport/Scene
         * @private
         * @type {Array}
         */
        _poses = [],

        /**
         * Holds old animation time span, useful for scenarios where same
         * time span is expected to be added for the latest added animation.
         * This provides the felxibility to add animation without duration.
         * 
         * Like: scene.addAnimation({translate: '50,0,0'});
         * 
         * As no duration is mentioned the old animations duration is taken.
         * @type {Number}
         * @memberOf module:enyo/AnimationSupport/Scene
         * @private
         */
        _prevDur = 0;

    /**
     * An exposed property to know if know the animating state of this scene.
     * 'true' - the scene is asked for animation(doesn't mean animation is happening)
     * 'false' - the scene is not active(has completed or its actors are not visible)
     * @type {Boolean}
     * @memberOf module:enyo/AnimationSupport/Scene
     * @public
     */
    this.animating = false;

    /**
     * An exposed property to know if the scene is ready with actors performing action.
     * 'true' - the scene actors are ready for action
     * 'false' - some or all actors are not ready
     * @type {Boolean}
     * @memberOf module:enyo/AnimationSupport/Scene
     * @public
     */
    this.active = false;

    /**
     * Holds refereneces of complete time span for this scene.
     * @type {Number}
     * @memberOf module:enyo/AnimationSupport/Scene
     * @public
     */
    this.span = 0;


    /**
     * Function used to loop in all the animations in a scene
     * @memberOf module:enyo/AnimationSupport/Scene
     * @private
     */
    function loop() {
        if (this.animating) {
            _ts = utils.perfNow();
            _ts = _ts - (_wasts !== undefined ? _wasts : _ts);
            _ts = (_ts > _framerate) ? _framerate : _ts;
            director.take(this, _ts);
            _wasts = _ts;
            this.trigger(true);
        } else {
            _wasts = undefined;
            this.cancel();
            this.completed && this.completed();
        }
    }
    /**
     * Function used to make start the animation if it is "true"  for animating.
     * @memberOf module:enyo/AnimationSupport/Scene
     * @public
     */
    this.ready = function() {
        if (this.animating) {
            if (!this.active) {
                director.roll(this);
            }
            return this.active;
        }
        return false;
    };

    /**
     * Cancel the animation
     * @memberOf module:enyo/AnimationSupport/Scene
     * @public
     */
    this.cancel = function() {
        animation.cancelRequestAnimationFrame(_req);
    };


    /**
     * Triggers the Request Animation Frame
     * @param  {boolean} force - A boolean value for letting the rAF start.
     * @memberOf module:enyo/AnimationSupport/Scene
     * @public
     */
    this.trigger = function(force) {
        if (force || !this.animating) {
            _req = animation.requestAnimationFrame(utils.bindSafely(this, loop));
        }
    };


    /**
     * Gets the unique ID assigned to this sceen.
     * @return {number} - id
     * @memberOf module:enyo/AnimationSupport/Scene
     * @public
     */
    this.getID = function() {
        return _id;
    };


    /**
     * Returns the life span/duration of this sceen.
     * @return {number} life span/duration of this sceen
     * @memberOf module:enyo/AnimationSupport/Scene
     * @public
     */
    this.totalSpan = function() {
        return this.span;
    };

    /**
     * Adds new animation on already existing animation for this character.
     * @memberOf module:enyo/AnimationSupport/Scene
     * @public
     */
    this.addAnimation = function(newProp, span) {
        if (_prevDur === 0 && span === 0) {
            _poses[0] = {
                animate: newProp,
                span: 0
            };
        } else {
            _prevDur = span || _prevDur;
            this.span += _prevDur;
            _poses.push({
                animate: newProp,
                span: this.span
            });
        }
    };
    /**
     * Function which returns the length of the poses.
     * @memberOf module:enyo/AnimationSupport/Scene
     * @public
     * @return {number}      - length of the poses
     */
    this.length = function() {
        return _poses.length;
    };
    /**
     * Returns animation pose index for a particular 
     * instance of time from the list of 
     * animations added to the scene.
     * @param  {number} span - Time span from the animation timeline
     * @return {number}      - index of the animation
     * @memberOf module:enyo/AnimationSupport/Scene
     * @public
     */
    this.animateAtTime = function(span) {
        var startIndex = 0,
            stopIndex = _poses.length - 1,
            middle = Math.floor((stopIndex + startIndex) / 2);

        if (span === 0) {
            return startIndex;
        }

        while (_poses[middle].span != span && startIndex < stopIndex) {
            if (span < _poses[middle].span) {
                stopIndex = middle;
            } else if (span > _poses[middle].span) {
                startIndex = middle + 1;
            }

            middle = Math.floor((stopIndex + startIndex) / 2);
        }
        return (_poses[middle].span != span) ? startIndex : middle;
    };

    /**
     * Clears/removes the animation
     * @memberOf module:enyo/AnimationSupport/Scene
     * @public
     */
    this.clearAnimation = function() {
        for (var i = 0; i < _poses.length; i++) {
            _poses[i]._startAnim = undefined;
        }
    };

    /**
     * Returns animation pose based on index from the list of 
     * animations added to this scene.
     * @param  {number} index - animation's index from the list of animations
     * @return {Object}   pose of the animation based on the index in the list
     * @memberOf module:enyo/AnimationSupport/Scene
     * @public
     */
    this.getAnimation = function(index) {
        return index < 0 || _poses[index];
    };

    /**
     * Sets the newly added animation to the poses
     * @param {Numner} index - index to which the new animation should set
     * @param {Object} pose - newly added animation
     * @memberOf module:enyo/AnimationSupport/Scene
     * @public 
     */
    this.setAnimation = function(index, pose) {
        _poses[index] = pose;
    };


    //TODO: Move these events to Event Delegator
    /**
     * Event to identify when the scene has done animating.
     * @memberOf module:enyo/AnimationSupport/Scene
     * @public
     */
    this.completed = function() {};

    /**
     * Event to identify when the scene has done a step(rAF updatation of time) in the animation.
     * @memberOf module:enyo/AnimationSupport/Scene
     * @public
     */
    this.step = function() {};

    /**
     * Event to identify when the actor has done animating.
     * @param  {Object} actor - animating element
     * @memberOf module:enyo/AnimationSupport/Scene
     * @public
     */
    this.actorCompleted = function(actor) {};
};

/**
 * SceneAction exposes the api which performs the action on the animation in a given scene
 * @type {Object} 
 * @memberOf module:enyo/AnimationSupport/Scene
 * @private
 */
var SceneAction = {
    /**
     * This function initiates action on the animation
     * from the list of animations for a given scene.
     * @param  {number} ts   - timespan
     * @param  {Object} pose - pose from the animation list
     * @return {Object}      - pose
     * @memberOf module:enyo/AnimationSupport/Scene
     * @private
     */
    action: function(ts, pose) {
        var past,
            actor,
            actors,i,
            tm = this.rolePlay(ts),
            index = this.animateAtTime(tm);

        if (index < 0) {
            return;
        }
        pose = pose || this.getAnimation(index);
        past = pose.animate;

        if (past instanceof sceneConstructor) {
            past._frameSpeed = this._frameSpeed;
            director.take(past, ts);
        } else {
            past = index ? this.getAnimation(index - 1).span : 0;
            actors = this.rolePlays[this.getID()];
            for (i = 0; (actor = actors[i]); i++) {
                if (actor.generated) {
                    director.action(pose,
                        actors[i],
                        tm - past,
                        pose.span - past);
                    this.step && this.step(actor);
                }
            }
        }
        return pose;
    }
};