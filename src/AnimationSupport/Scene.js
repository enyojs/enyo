var
    editor = require('./SceneEditor'),
    director = require('./Director'),
    animation = require('../animation'),
    utils = require('../utils');

/**
 * Scene is used to generate animation structure.
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
 * (To used for runtime creation of animations)
 */
Scene.create = function() {
	return new sceneConstructor(utils.uid("@"));
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
        _ts, _wasts, _req,
        _framerate = 16.6,

        _id = id,

        /**
         * Holds refereneces of the all animations added to this scene.
         * @private
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
         * @private
         */
        _prevDur = 0;


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

    /**
     * Holds refereneces of complete time span for this scene.
     * @private
     */
    this.span = 0;


    /**
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
     * @private
     */
    this.cancel = function() {
        animation.cancelRequestAnimationFrame(_req);
    };


    /**
     * @public
     */
    this.trigger = function(force) {
        if (force || !this.animating) {
            _req = animation.requestAnimationFrame(utils.bindSafely(this, loop));
        }
    };

    /**
     * Gets the unique ID assigned to this sceen
     * @public
     */
    this.getID = function() {
        return _id;
    };

    /**
     * Returns the life span/duration of this sceen.
     * @public
     */
    this.totalSpan = function() {
        return this.span;
    };

    /**
     * Adds new animation on already existing animation for this character.
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
     * Returns animation pose index from the list of 
     * animations added to this scene for a particular 
     * instance of time.
     * @private
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

    this.clearAnimation = function() {
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

    /**
     * Event to identify when the actor has done animating.
     * @public
     */
    this.actorCompleted = function(actor) {};
};


var SceneAction = {
    action: function(ts, pose) {
        var past,
            actors,
            l, i,
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
            l = actors.length;
            for (i = 0; i < l; i++) {
                director.action(pose,
                    actors[i],
                    tm - past,
                    pose.span - past);
                this.step && this.step(actors[i]);
            }
        }
        return pose;
    }
};