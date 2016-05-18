var
    tween = require('./tween'),
    utils = require('./utils'),
    animation = require('./animation');

var _ts, _wasts, _framerate = 16.6;

/**
 * This module exports "Scene" which is a class/constructor so that we can create an instance of the same.
 * We can define all the animation properties we want in the application in the instance of the "Scene".
 * 
 * @module enyo/AnimationSupport/Scene
 */
var scene = module.exports = function(props) {
    var ctx = scene.create();

    if (props.animation) {
        var anims = utils.isArray(props.animation) ? props.animation : [props.animation];
        for (var i = 0; i < anims.length; i++) {
            ctx.addAnimation(anims[i], anims[i].duration || 0);
        }
    }

    utils.mixin(ctx, SceneAction);
    ctx.rolePlays = [];
    utils.mixin(ctx, props);
    return ctx;
};

var SceneAction = {

    isScene: true,

    /**
     * The boundary of scene within which the scene actors will be animating.
     * @memberOf module:enyo/AnimationSupport/Scene
     * @public
     * @type {number}
     */
    threshold: 0,

    /**
     * The actors which are added to this scene. Each actor is responsible for its own role
     * within a scene.
     * @memberOf module:enyo/AnimationSupport/Scene
     * @public
     * @type {Array}
     */
    rolePlays: [],
    /**
     * An Array of ids of all the actors participating in animation for a scene.
     * @memberOf module:enyo/AnimationSupport/Scene
     * @public
     * @type {Array}
     */
    actorsIds: [],
    /**
     * An array of ids of all the animation completed actors.
     * @memberOf module:enyo/AnimationSupport/Scene
     * @public
     * @type {Array}
     */
    completedActors: [],
    /**
     * This function compares two arrays to know whether they are same or not.
     * @memberOf module:enyo/AnimationSupport/Scene
     * @private
     * @param  {Array} array1 First Array
     * @param  {Array} array2 Second Array
     * @return {Boolean} True => Both arrays are same; False => Arrays are not same.
     */
    compareArrays: function(array1, array2) {
        var array1 = array1;
        var array2 = array2;
        var is_same = array1.length == array2.length && array1.every(function(element, index) {
            return element === array2[index];
        });
        return is_same;
    },
    /**
     * This function initiates action on the animation
     * from the list of animations for a given scene in sequence of actors.
     * @param  {number} ts   - timespan
     * @param  {Object} pose - pose from the animation list
     * @return {Object}      - pose
     * @memberOf module:enyo/AnimationSupport/Scene
     * @private
     */
    sceneConstAction: function(ts, pose) {
        var past, index, tm,
            dur = this.span;

        if (_actor && _actor.generated) {
            tm = rolePlay(ts, this);
            if (isNaN(tm) || tm < 0) return pose;
            else if (tm <= dur) {
                if (SceneAction.actorsIds.indexOf(this.id) === -1) {
                    SceneAction.actorsIds.push(this.id);
                }
                index = animateAtTime(_poses, tm);
                pose = this.getAnimation(index);
                past = index ? this.getAnimation(index - 1).span : 0;
                if (pose.animate instanceof this.constructor === true) {
                    pose.animate.speed = this.speed;
                    pose.animate.action(ts);
                } else {
                    _update(pose, _actor, tm - past, pose.span - past);
                }
                this.step && this.step(_actor);
            } else {
                this.timeline = this.repeat ? 0 : this.span;
                if (!this.repeat) this.cut();
            }
        }
        return pose;
    },
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

        var i, role, actor, rolePlays,
            s, e,
            sts = 0,
            tm = this.timeline,
            th = this.threshold || this.span;
        rolePlays = this.rolePlays;

        if (this.sequencing && this.sequencing === true) {
            sceneConstAction(ts, pose);
        } else {
            if (rolePlays && rolePlays.length > 0 && this.animating === true) {
                if (this.actorsIds.length !== 0 && this.completedActors.length !== 0 && this.compareArrays(this.actorsIds, this.completedActors) === true) {
                    this.animating = false;
                    this.completedAction = true;
                }
                s = animateAtTime(rolePlays, tm);
                e = animateAtTime(rolePlays, tm + th);
                e += e == s ? 1 : 0;

                for (i = 0;
                    (role = rolePlays[i]); i++) {
                    actor = role.actor;
                    if (i < s) {
                        actor.active = true;
                        actor.timeline = role.dur;
                        pose = actor.action(0, pose);
                        actor.cut();
                    } else if (i >= s && i < e) {
                        actor.active = true;
                        sts += ts;
                        actor.speed = this.speed;
                        actor.repeat = this.repeat;
                        pose = actor.action(ts, pose);
                    } else {
                        if (actor.active) {
                            pose = actor.action(0, pose);
                            actor.cut();
                        }
                    }
                }
                tm = rolePlay(sts);
            }
        }
        return pose;
    }
};

/**
 * Connects an actor/s to a scene.
 * All the actors should be added before initiating animation otherwise actors will animate for remaining time span
 * @memberOf module:enyo/AnimationSupport/Scene
 * @public
 * @param  {Object} actors - The elements which needs to be animated
 * @param  {Object} scene  - The instance of the Scene we've created in the application
 */
scene.link = function(actors, scene) {
    if (!scene && !actors) return;

    var actorScene, span = 0,
        acts = utils.isArray(actors) ? actors : [actors];

    for (var act, i = 0;
        (act = acts[i]); i++) {
        if (scene.isScene) {
            act.scene = act.scene || scene.create(scene, act);
            actorScene = act.scene.isScene ? act.scene : scene.create(act.scene, act);
            span += actorScene.span;
            scene.rolePlays.push({
                actor: actorScene,
                span: span,
                dur: actorScene.span
            });
            scene.span = span;
        } else {
            actorScene = scene.create(scene, act);
            acts[i].scene = actorScene;
        }
    }
};

/**
 * Creates a empty instance of scene.
 * Can be used for runtime creation of animations
 * @memberOf module:enyo/AnimationSupport/Actor
 * @public
 * @return {Object} An instance of the constructor
 */
scene.create = function(ctx) {
    return new sceneConstructor(ctx);
};


function sceneConstructor(actor) {
    var
        _req,
        _prevDur = 0,
        _poses = [],
        _actor = actor,
        _update = function(pose, actor, since, dur) {
            var t;
            if (!pose._startAnim) tween.init(actor, pose);

            if (since < 0) since = 0;
            if (since <= dur && dur !== 0) {
                t = since / dur;
                // tween.step(actor, pose, t, dur);
                tween.step(actor, pose, (t > 0.98) ? 1 : t, dur);
            } else {
                tween.step(actor, pose, 1, dur);
            }
        },
        /**
         * Function used to loop in all the animations in a scene
         * @memberOf module:enyo/AnimationSupport/Actor
         * @private
         */
        _loop = function() {
            if (this.animating) {
                _ts = utils.perfNow();
                _ts = _ts - (_wasts !== undefined ? _wasts : _ts);
                _ts = (_ts > _framerate) ? _framerate : _ts;
                this.action(_ts);
                _wasts = _ts;
                this.trigger(true);
            } else {
                _wasts = undefined;
                this.cancel();
                this.completed && this.completed(_actor);
            }
        };

    this.span = 0;
    this.id = utils.uid("@");

    /**
     * This function initiates action on the animation
     * from the list of animations for a given scene.
     * @param  {number} ts   - timespan
     * @param  {Object} pose - pose from the animation list
     * @return {Object}      - pose
     * @memberOf module:enyo/AnimationSupport/Actor
     * @private
     */
    this.action = function(ts, pose) {
        var past, index, tm,
            dur = this.span;

        if (_actor && _actor.generated) {
            tm = rolePlay(ts, this);
            if (isNaN(tm) || tm < 0) return pose;
            else if (tm <= dur) {
                if (SceneAction.actorsIds.indexOf(this.id) === -1) {
                    SceneAction.actorsIds.push(this.id);
                }
                index = animateAtTime(_poses, tm);
                pose = this.getAnimation(index);
                past = index ? this.getAnimation(index - 1).span : 0;
                if (pose.animate instanceof this.constructor === true) {
                    pose.animate.speed = this.speed;
                    pose.animate.action(ts);
                } else {
                    _update(pose, _actor, tm - past, pose.span - past);
                }
                this.step && this.step(_actor);
            } else {
                if (typeof this.repeat === "boolean")
                    this.repeat = this.repeat ? Infinity : 1;
                this.timeline = --this.repeat ? 0 : this.span;
                if (this.timeline === this.span) this.cut();
            }
        }
        return pose;
    };

    this.cut = function() {
        if (this.handleLayers) {
            this.speed = 0;
            if (this.active) {
                this.active = false;
                tween.halt(actor);
            }
        }
        this.animating = false;
        if (SceneAction.completedActors.indexOf(this.id) === -1) {
            SceneAction.completedActors.push(this.id);
        }
        this.completed && this.completed(_actor);

    };

    /**
     * Cancel the animation
     * @memberOf module:enyo/AnimationSupport/Actor
     * @public
     */
    this.cancel = function() {
        animation.cancelRequestAnimationFrame(_req);
    };

    /**
     * Triggers the Request Animation Frame
     * @param  {boolean} force - A boolean value for letting the rAF start.
     * @memberOf module:enyo/AnimationSupport/Actor
     * @public
     */
    this.trigger = function(force) {
        if (force || !this.animating) {
            _req = animation.requestAnimationFrame(utils.bindSafely(this, _loop));
        }
    };

    /**
     * Returns animation pose based on index from the list of 
     * animations added to this scene.
     * @param  {number} index - animation's index from the list of animations
     * @return {Object}   pose of the animation based on the index in the list
     * @memberOf module:enyo/AnimationSupport/Actor
     * @public
     */
    this.getAnimation = function(index) {
        return index < 0 || _poses[index];
    };

    /**
     * Adds new animation on already existing animation for this character.
     * @memberOf module:enyo/AnimationSupport/Actor
     * @public
     */
    this.addAnimation = function(newProp, span) {
        span = span ? span : newProp.span;
        var delay = newProp.delay;
        if (delay) {
            this.span += delay;
            _poses.push({
                animate: {
                    duration: delay
                },
                span: this.span
            });
        }
        _prevDur = span || _prevDur;
        this.span += _prevDur;
        _poses.push({
            animate: newProp,
            span: this.span
        });
    };
    /**
     * Adds new animation on the actors in a parent scene.
     * @param  {Object} newProp New animation properties
     * @param  {Number} span    duration of animation
     */
    this.extend = function(newProp, span) {
        for (var i = 0; i < this.rolePlays.length; i++) {
            this.rolePlays[i].actor.addAnimation(newProp, span);
        }
    };
    /**
     * Clears/removes the animation
     * @memberOf module:enyo/AnimationSupport/Actor
     * @public
     */
    this.clearAnimation = function() {
        for (var i = 0; i < _poses.length; i++) {
            _poses[i]._startAnim = undefined;
        }
    };

    /**
     * Function which returns the length of the poses.
     * @memberOf module:enyo/AnimationSupport/Actor
     * @public
     * @return {number}      - length of the poses
     */
    this.length = function() {
        return _poses.length;
    };
}

/**
 * <code>rolePlay</code> updated the timeline of the actor which is currently animating.
 * @param  {Number} t     Elapsed time since the animation of this pose has started (ratio in factor of 1)
 * @param  {@link module:enyo/Component~Component} actor The component which is animating
 * @return {Number}       Returns the updated timeline of the actor
 * @private
 */
function rolePlay(t, actor) {
    actor = actor || this;
    actor.timeline += (t * actor.speed);

    if (actor.seekInterval !== 0) {
        if ((actor.seekInterval - actor.timeline) * actor.speed < 0) {
            actor.seekInterval = 0;
            actor.speed = 0;
        }
    }

    if (actor.timeline === undefined || actor.timeline < 0)
        actor.timeline = 0;
    return actor.timeline;
}

/**
 * Returns animation pose index for a particular 
 * instance of time from the list of 
 * animations added to the scene.
 * @param  {number} span - Time span from the animation timeline
 * @return {number}      - index of the animation
 * @private
 */
function animateAtTime(anims, span) {
    var startIndex = 0,
        stopIndex = anims.length - 1,
        middle = Math.floor((stopIndex + startIndex) / 2);

    if (span === 0) {
        return startIndex;
    }

    while (anims[middle].span != span && startIndex < stopIndex) {
        if (span < anims[middle].span) {
            stopIndex = middle;
        } else if (span > anims[middle].span) {
            startIndex = middle + 1;
        }

        middle = Math.floor((stopIndex + startIndex) / 2);
    }
    return (anims[middle].span != span) ? startIndex : middle;
}
