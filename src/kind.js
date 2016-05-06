require('enyo');

var
    logger = require('./logger'),
    scene = require('./scene'),
    utils = require('./utils');

var defaultCtor = null;

/**
* Creates a JavaScript {@glossary constructor} function with
* a prototype defined by `props`. **All constructors must have a unique name.**
*
* `kind()` makes it easy to build a constructor-with-prototype (like a
* class) that has advanced features like prototype-chaining
* ({@glossary inheritance}).
*
* A plug-in system is included for extending the abilities of the
* {@glossary kind} generator, and constructors are allowed to
* perform custom operations when subclassed.
*
* If you make changes to `enyo/kind`, be sure to add or update the appropriate
* [unit tests](@link https://github.com/enyojs/enyo/tree/master/tools/test/core/tests).
*
* For more information, see the documentation on
* [Kinds]{@linkplain $dev-guide/key-concepts/kinds.html} in the Enyo Developer Guide.
*
* @module enyo/kind
* @param {Object} props - A [hash]{@glossary Object} of properties used to define and create
*	the {@glossary kind}
* @public
*/
/*jshint -W120*/
var kind = exports = module.exports = function (props) {
/*jshint +W120*/
	// extract 'name' property
	var name = props.name || '';
	delete props.name;
	// extract 'kind' property
	var hasKind = ('kind' in props);
	var kindName = props.kind;
	delete props.kind;
	// establish base class reference
	var base = constructorForKind(kindName);
	var isa = base && base.prototype || null;
	// if we have an explicit kind property with value undefined, we probably
	// tried to reference a kind that is not yet in scope
	if (hasKind && kindName === undefined || base === undefined) {
		var problem = kindName === undefined ? 'undefined kind' : 'unknown kind (' + kindName + ')';
		throw 'enyo.kind: Attempt to subclass an ' + problem + '. Check dependencies for [' + (name || '<unnamed>') + '].';
	}
	// make a boilerplate constructor
	var ctor = kind.makeCtor();
	// semi-reserved word 'constructor' causes problems with Prototype and IE, so we rename it here
	if (props.hasOwnProperty('constructor')) {
		props._constructor = props.constructor;
		delete props.constructor;
	}
	// create our prototype
	//ctor.prototype = isa ? enyo.delegate(isa) : {};
	utils.setPrototype(ctor, isa ? utils.delegate(isa) : {});
	// there are special cases where a base class has a property
	// that may need to be concatenated with a subclasses implementation
	// as opposed to completely overwriting it...
	kind.concatHandler(ctor, props);

	// put in our props
	utils.mixin(ctor.prototype, props);
	// alias class name as 'kind' in the prototype
	// but we actually only need to set this if a new name was used,
	// not if it is inheriting from a kind anonymously
	if (name) {
		ctor.prototype.kindName = name;
	}
	// this is for anonymous constructors
	else {
		ctor.prototype.kindName = base && base.prototype? base.prototype.kindName: '';
	}
	// cache superclass constructor
	ctor.prototype.base = base;
	// reference our real constructor
	ctor.prototype.ctor = ctor;
	// support pluggable 'features'
	utils.forEach(kind.features, function(fn){ fn(ctor, props); });
	
	if (name) kindCtors[name] = ctor;
	
	return ctor;
};

exports.setDefaultCtor = function (ctor) {
	defaultCtor = ctor;
};

var getDefaultCtor = exports.getDefaultCtor = function () {
	return defaultCtor;
};

/**
* @private
*/
var concatenated = exports.concatenated = [];

/**
* Creates a singleton of a given {@glossary kind} with a given
* definition. **The `name` property will be the instance name of the singleton
* and must be unique.**
*
* ```javascript
* var
* 	kind = require('enyo/kind'),
* 	Control = require('enyo/Control');
*
* module.exports = singleton({
* 	kind: Control,
* 	name: 'app.MySingleton',
* 	published: {
* 		value: 'foo'
* 	},
* 	makeSomething: function() {
* 		//...
* 	}
* });
*
* app.MySingleton.makeSomething();
* app.MySingleton.setValue('bar');
*```
*
* @public
*/
exports.singleton = function (conf) {
	// extract 'name' property (the name of our singleton)
	delete(conf.name);
	// create an unnamed kind and save its constructor's function
	var Kind = kind(conf);
	var inst = new Kind();
	return inst;
};

/**
* @name module:enyo/kind.makeCtor
* @method
* @private
*/
kind.makeCtor = function () {
	var enyoConstructor = function () {
		if (!(this instanceof enyoConstructor)) {
			throw 'enyo.kind: constructor called directly, not using "new"';
		}

		// two-pass instantiation
		var result;
		if (this._constructor) {
			// pure construction
			result = this._constructor.apply(this, arguments);
		}
		// defer initialization until entire constructor chain has finished
		if (this.constructed) {
			// post-constructor initialization
			this.constructed.apply(this, arguments);
		}

		if (result) {
			return result;
		}
	};
	return enyoConstructor;
};

/**
* Feature hooks for the oop system
*
* @name module:enyo/kind.features
* @private
*/
kind.features = [];

/**
* Used internally by several mechanisms to allow safe and normalized handling for extending a
* [kind's]{@glossary kind} super-methods. It can take a
* [constructor]{@glossary constructor}, a [prototype]{@glossary Object.prototype}, or an
* instance.
*
* @name module:enyo/kind.extendMethods
* @method
* @private
*/
kind.extendMethods = function (ctor, props, add) {
	var proto = ctor.prototype || ctor,
		b = proto.base;
	if (!proto.inherited && b) {
		proto.inherited = kind.inherited;
	}
	// rename constructor to _constructor to work around IE8/Prototype problems
	if (props.hasOwnProperty('constructor')) {
		props._constructor = props.constructor;
		delete props.constructor;
	}
	// decorate function properties to support inherited (do this ex post facto so that
	// ctor.prototype is known, relies on elements in props being copied by reference)
	for (var n in props) {
		var p = props[n];
		if (isInherited(p)) {
			// ensure that if there isn't actually a super method to call, it won't
			// fail miserably - while this shouldn't happen often, it is a sanity
			// check for mixin-extensions for kinds
			if (add) {
				p = proto[n] = p.fn(proto[n] || utils.nop);
			} else {
				p = proto[n] = p.fn(b? (b.prototype[n] || utils.nop): utils.nop);
			}
		}
		if (utils.isFunction(p)) {
			if (add) {
				proto[n] = p;
				p.displayName = n + '()';
			} else {
				p._inherited = b? b.prototype[n]: null;
				// FIXME: we used to need some extra values for inherited, then inherited got cleaner
				// but in the meantime we used these values to support logging in Object.
				// For now we support this legacy situation, by suppling logging information here.
				p.displayName = proto.kindName + '.' + n + '()';
			}
		}
	}
};
kind.features.push(kind.extendMethods);

/**
* Called by {@link module:enyo/CoreObject~Object} instances attempting to access super-methods
* of a parent class ([kind]{@glossary kind}) by calling
* `this.inherited(arguments)` from within a kind method. This can only be done
* safely when there is known to be a super class with the same method.
*
* @name module:enyo/kind.inherited
* @method
* @private
*/
kind.inherited = function (originals, replacements) {
	// one-off methods are the fast track
	var target = originals.callee;
	var fn = target._inherited;

    // regardless of how we got here, just ensure we actually
    // have a function to call or else we throw a console
    // warning to notify developers they are calling a
    // super method that doesn't exist
    if ('function' === typeof fn) {
        var args = originals;
        if (replacements) {
            // combine the two arrays, with the replacements taking the first
            // set of arguments, and originals filling up the rest.
            args = [];
            var i = 0,
                l = replacements.length;
            for (; i < l; ++i) {
                args[i] = replacements[i];
            }
            l = originals.length;
            for (; i < l; ++i) {
                args[i] = originals[i];
            }
        }
        return fn.apply(this, args);
    } else {
        logger.warn('enyo.kind.inherited: unable to find requested ' +
            'super-method from -> ' + originals.callee.displayName + ' in ' + this.kindName);
    }
};

// dcl inspired super-inheritance

var Inherited = function (fn) {
	this.fn = fn;
};

/**
* When defining a method that overrides an existing method in a [kind]{@glossary kind}, you
* can wrap the definition in this function and it will decorate it appropriately for inheritance
* to work.
*
* The older `this.inherited(arguments)` method still works, but this version results in much
* faster code and is the only one supported for kind [mixins]{@glossary mixin}.
*
* @param {Function} fn - A [function]{@glossary Function} that takes a single
*   argument (usually named `sup`) and returns a function where
*   `sup.apply(this, arguments)` is used as a mechanism to make the
*   super-call.
* @public
*/
exports.inherit = function (fn) {
	return new Inherited(fn);
};

/**
* @private
*/
var isInherited = exports.isInherited = function (fn) {
	return fn && (fn instanceof Inherited);
};


//
// 'statics' feature
//
kind.features.push(function(ctor, props) {
	// install common statics
	if (!ctor.subclass) {
		ctor.subclass = kind.statics.subclass;
	}
	if (!ctor.extend) {
		ctor.extend = kind.statics.extend;
	}
	if (!ctor.kind) {
		ctor.kind = kind.statics.kind;
	}
	// move props statics to constructor
	if (props.statics) {
		utils.mixin(ctor, props.statics);
		delete ctor.prototype.statics;
	}
	// also support protectedStatics which won't interfere with defer
	if (props.protectedStatics) {
		utils.mixin(ctor, props.protectedStatics);
		delete ctor.prototype.protectedStatics;
	}
	// allow superclass customization
	var base = ctor.prototype.base;
	while (base) {
		base.subclass(ctor, props);
		base = base.prototype.base;
	}
});


kind.features.push(function(ctor, props) {
    // install common statics
    if (props.scene) {
        var fn,
            proto = ctor.prototype || ctor,
            sctor = scene.create(proto);

        extend(AnimationSupport, sctor);
        fn = props.scene.isScene ? sceneToScene : updateScene;
        proto.scene = fn.call(sctor, props.scene);
    }
});

/**
 * Adds animation from a scene to other scene
 * @memberOf module:enyo/AnimationSupport/Actor
 * @public
 * @return {Object} An instance of the constructor
 */
function sceneToScene(src) {
    if (!src) return;
    if (!src.id) extend(AnimationSupport, src);

    var i, l = src.length(),
        anim;

    for (i = 0; i < l; i++) {
        anim = utils.mixin({}, src.getAnimation(i));
        this.addAnimation(anim.animate, anim.animate.duration);
    }

    var span = src.span + this.span;
    src.rolePlays.push({
        actor: this,
        span: span,
        dur: this.span
    });
    return this;
}

/**
 * Add animations within a scene
 * @memberOf module:enyo/AnimationSupport/Actor
 * @public
 * @return {Object} An instance of the constructor
 */
function updateScene(props) {
    if (!props) return;

    var anims = utils.isArray(props) ? props : [props];
    for (var i = 0; i < anims.length; i++) {
        this.addAnimation(anims[i], anims[i].duration || 0);
    }
    return this;
}



/**
* @private
*/
kind.statics = {

	/**
	* A [kind]{@glossary kind} may set its own `subclass()` method as a
	* static method for its [constructor]{@glossary constructor}. Whenever
	* it is subclassed, the constructor and properties will be passed through
	* this method for special handling of important features.
	*
	* @name module:enyo/kind.subclass
	* @method
	* @param {Function} ctor - The [constructor]{@glossary constructor} of the
	*	[kind]{@glossary kind} being subclassed.
	* @param {Object} props - The properties of the kind being subclassed.
	* @public
	*/
	subclass: function (ctor, props) {},

    /**
     * Allows for extension of the current [kind]{@glossary kind} without
     * creating a new kind. This method is available on all
     * [constructors]{@glossary constructor}, although calling it on a
     * [deferred]{@glossary deferred} constructor will force it to be
     * resolved at that time. This method does not re-run the
     * {@link module:enyo/kind.features} against the constructor or instance.
     *
     * @name module:enyo/kind.extend
     * @method
     * @param {Object|Object[]} props A [hash]{@glossary Object} or [array]{@glossary Array}
     *  of [hashes]{@glossary Object}. Properties will override
     *  [prototype]{@glossary Object.prototype} properties. If a
     *  method that is being added already exists, the new method will
     *  supersede the existing one. The method may call
     *  `this.inherited()` or be wrapped with `kind.inherit()` to call
     *  the original method (this chains multiple methods tied to a
     *  single [kind]{@glossary kind}).
     * @param {Object} [target] - The instance to be extended. If this is not specified, then the
     *  [constructor]{@glossary constructor} of the
     *  [object]{@glossary Object} this method is being called on will
     *  be extended.
     * @returns {Object} The constructor of the class, or specific
     *  instance, that has been extended.
     * @public
     */
    extend: function(props, target) {
        var ctor = this,
            exts = utils.isArray(props) ? props : [props],
            proto, fn;

		fn = function (key, value) {
			return !(typeof value == 'function' || isInherited(value)) && concatenated.indexOf(key) === -1;
		};

        proto = target || ctor.prototype;
        for (var i = 0, ext;
            (ext = exts[i]); ++i) {
            kind.concatHandler(proto, ext, true);
            kind.extendMethods(proto, ext, true);
            utils.mixin(proto, ext, { filter: fn });
        }

		return target || ctor;
	},

	/**
	* Creates a new sub-[kind]{@glossary kind} of the current kind.
	*
	* @name module:enyo/kind.kind
	* @method
	* @param  {Object} props A [hash]{@glossary Object} of properties used to define and create
	*	the [kind]{@glossary kind}
	* @return {Function} Constructor of the new kind
	* @public
	*/
	kind: function (props) {
		if (props.kind && props.kind !== this) {
			logger.warn('Creating a different kind from a constructor\'s kind() method is not ' +
				'supported and will be replaced with the constructor.');
		}
		props.kind = this;
		return kind(props);
	}
};

/**
 * @method
 * @private
 */
exports.concatHandler = function(ctor, props, instance) {
    var proto = ctor.prototype || ctor,
        base = proto.ctor;

	while (base) {
		if (base.concat) base.concat(ctor, props, instance);
		base = base.prototype.base;
	}
};

var kindCtors =
/**
* Factory for [kinds]{@glossary kind} identified by [strings]{@glossary String}.
*
* @type Object
* @deprecated Since 2.6.0
* @private
*/
	exports._kindCtors = {};

/**
 * @method
 * @private
 */
var constructorForKind = exports.constructorForKind = function(kind) {
    if (kind === null) {
        return kind;
    } else if (kind === undefined) {
        return getDefaultCtor();
    } else if (utils.isFunction(kind)) {
        return kind;
    }
    logger.warn('Creating instances by name is deprecated. Name used:', kind);
    // use memoized constructor if available...
    var ctor = kindCtors[kind];
    if (ctor) {
        return ctor;
    }
    // otherwise look it up and memoize what we find
    //
    // if kind is an object in enyo, say "Control", then ctor = enyo["Control"]
    // if kind is a path under enyo, say "Heritage.Button", then ctor = enyo["Heritage.Button"] || enyo.Heritage.Button
    // if kind is a fully qualified path, say "enyo.Heritage.Button", then ctor = enyo["enyo.Heritage.Button"] || enyo.enyo.Heritage.Button || enyo.Heritage.Button
    //
    // Note that kind "Foo" will resolve to enyo.Foo before resolving to global "Foo".
    // This is important so "Image" will map to built-in Image object, instead of enyo.Image control.
    ctor = Theme[kind] || (global.enyo && global.enyo[kind]) || utils.getPath.call(global, 'enyo.' + kind) || global[kind] || utils.getPath.call(global, kind);

	// If what we found at this namespace isn't a function, it's definitely not a kind constructor
	if (!utils.isFunction(ctor)) {
		throw '[' + kind + '] is not the name of a valid kind.';
	}
	kindCtors[kind] = ctor;
	return ctor;
};

/**
* Namespace for current theme (`enyo.Theme.Button` references the Button specialization for the
* current theme).
*
* @deprecated Since 2.6.0
* @private
*/
var Theme = exports.Theme = {};

/**
* @method
* @deprecated Since 2.6.0
* @private
*/
exports.registerTheme = function (ns) {
	utils.mixin(Theme, ns);
};

/**
* @method
* @private
*/
exports.createFromKind = function (nom, param) {
	var Ctor = nom && constructorForKind(nom);
	if (Ctor) {
		return new Ctor(param);
	}
};
/**
 * Interface which accepts the animation details and returns a scene object
 * @param  {Array} proto      Actors 
 * @param  {Object} properties Animation Properties
 * @param  {number} duration   Animation duration
 * @param  {String} completed  Callback function on completion
 * @return {Object}            A scene object
 */
kind.animate = function(proto, properties, completed) {
    var rolePlays, sctor, parentScene;
    parentScene = scene({ animation: properties });
    if (properties && proto.length > 0) {
        for (var i = 0; i <= proto.length; i++) {
            sctor = scene.create(proto[i]);
            kind.statics.extend(AnimationSupport, sctor);
            parentScene.rolePlays.push({
                actor: updateScene.call(sctor, properties),
                span: (sctor.span) * (i + 1),
                dur: sctor.span
            });
        }
    } else if (properties && proto) {
        sctor = scene.create(proto);
        kind.statics.extend(AnimationSupport, sctor);
        parentScene.rolePlays.push({
            actor: updateScene.call(sctor, properties),
            span: sctor.span,
            dur: sctor.span
        });
    }
    kind.statics.extend(AnimationSupport, parentScene);
    parentScene.threshold = parentScene.rolePlays.length * parentScene.span;
    parentScene.completed = completed;
    return parentScene;
};

var AnimationSupport = {



    handleLayers: false,

    /**
     * An exposed property to know if know the animating state of this scene.
     * 'true' - the scene is asked for animation(doesn't mean animation is happening)
     * 'false' - the scene is not active(has completed or its actors are not visible)
     * @type {Boolean}
     * @memberOf module:enyo/AnimationSupport/Actor
     * @public
     */
    animating: false,

    /**
     * An exposed property to know if the scene is ready with actors performing action.
     * 'true' - the scene actors are ready for action
     * 'false' - some or all actors are not ready
     * @type {Boolean}
     * @memberOf module:enyo/AnimationSupport/Actor
     * @public
     */
    active: this && this.generated,


    /**
     * @private
     */
    timeline: 0,
    /**
     * @private
     */
    _cachedValue: 0,
    /**
     * @private
     */
    speed: 0,
    /**
     * @private
     */
    seekInterval: 0,
    /**
     * @private
     */
    repeat: false,
    /**
     * @private
     */
    cache: function(actor) {
        actor = actor || this;
        if (actor.speed === 0) {
            actor.speed = actor._cachedValue;
        }
        this.animating = true;
    },

    /**
     * Starts the animation of the <code>actor</code> given in argument.
     * If actor is not provided, animation of all the components linked to the {@link module:enyo/AnimationSupport/Scene} will be started.
     * @param  [Component]{@link module:enyo/Component~Component} actor    The component to be animated
     * @public
     */
    play: function(actor) {
        actor = actor || this;
        actor.speed = 1;
        if (isNaN(actor.timeline) || !actor.timeline) {
            actor.timeline = 0;
        }
        this.trigger();
        actor._cachedValue = actor.speed;
        this.animating = true;
    },

    /**
     * Replays the animation of the <code>actor</code> given in argument.
     * If actor is not provided, animation of all the components linked to the {@link module:enyo/AnimationSupport/Scene} will be started.
     * @param  [Component]{@link module:enyo/Component~Component} actor    The component to be animated
     * @public
     */
    replay: function(actor) {
        this.stop();
        this.play();
    },
    /**
     * Resumes the paused animation of the <code>actor</code> given in argument.
     * If actor is not provided, animation of all the components linked to the {@link module:enyo/AnimationSupport/Scene} will be resumed.
     * @param  [Component]{@link module:enyo/Component~Component} actor    The component to be animated
     * @public
     */
    resume: function(actor) {
        this.cache(actor);
        actor = actor || this;
        actor.speed *= 1;
    },

    /**
     * Pauses the animation of the <code>actor</code> given in argument.
     * If actor is not provided, animation of all the components linked to the {@link module:enyo/AnimationSupport/Scene} will be paused.
     * @param  [Component]{@link module:enyo/Component~Component} actor    The component to be animated
     * @public
     */
    pause: function(actor) {
        actor = actor || this;
        actor._cachedValue = actor.speed;
        actor.speed = 0;
    },

    /**
     * Reverses the animation of the <code>actor</code> given in argument.
     * If actor is not provided, animation of all the components linked to the {@link module:enyo/AnimationSupport/Scene} will be reversed.
     * @param  [Component]{@link module:enyo/Component~Component} actor    The component to be animated
     * @public
     */
    reverse: function(actor) {
        this.cache(actor);
        actor = actor || this;
        actor._cachedValue = actor.speed;
        actor.speed *= -1;
    },

    /**
     * fast description goes here
     * @param  {Number} mul   description goes here
     * @param  [Component]{@link module:enyo/Component~Component} actor description goes here
     * @public
     */
    fast: function(mul, actor) {
        this.cache(actor);
        actor = actor || this;
        actor.speed *= mul;
    },

    /**
     * slow description goes here
     * @param  {Number} mul   description goes here
     * @param  [Component]{@link module:enyo/Component~Component} actor description goes here
     * @public
     */
    slow: function(mul, actor) {
        this.cache(actor);
        actor = actor || this;
        actor.speed *= mul;
    },

    /**
     * Changes the speed of the animation.</br>
     * Speed of the animation changed based on the <code>factor</code>.</br>
     * To slow down the speed use values between <b>0</b> and <b>1</b>. For Example <b>0.5</b> to reduce the speed by <b>50%</b>.</br>
     * To increase the speed use values above <b>1</b>. For Example <b>2</b> to increase the speed by <b>200%</b>.</br>
     * Animation will be paused if factor is <b>0</b>. To pause the animation use <code>{@link enyo/AnimationSupport/Editor.pause pause}</code> API.</br>
     * Speed will not be affected incase of negative multiplication factor.
     * @param  {Number} factor                                              Multiplication factor which changes the speed
     * @param  [Component {@link module:enyo/Component~Component}] actor     The component whose animating speed should be changed
     * @public
     */
    // speed: function(mul, actor) {
    //     if (mul < 0) return;
    //     this.cache(actor);
    //     actor = actor || this;
    //     actor.speed *= mul;
    // },

    /**
     * Stops the animation of the actor given in argument.
     * If actor is not provided, animation of all the components linked to the {@link module:enyo/AnimationSupport/Scene} will be stopped.
     * @param  [Component]{@link module:enyo/Component~Component} actor    The component to be animated
     * @public
     */
    stop: function(actor) {
        actor = actor || this;
        actor._cachedValue = 1;
        actor.speed = 0;
        actor.timeline = 0;
        // this.animating = false;
        // this.cancel();
    },

    /**
     * Seeks the animation of the <code>actor</code> to the position provided in <code>seek</code>
     * The value of <code>seek</code> should be between <b>0</b> to <code>duration</code> of the animation.
     * @param  {Number}                                             seek    Value in seek where the animation has to be seeked
     * @param  [Component]{@link module:enyo/Component~Component}   actor       The component to be animated
     * @public
     */
    seek: function(seek, actor) {
        actor = actor || this;
        actor.timeline = seek;
    },

    /**
     * Seeks <code>actor</code> with animation to the position provided in <code>seek</code>
     * The value of <code>seek</code> should be between <b>0</b> to <code>duration</code> of the animation.
     * @param  {Number}                                             seek    Value in seek where the animation has to be seeked
     * @param  [Component]{@link module:enyo/Component~Component}   actor       The component to be animated
     * @public
     */
    seekAnimate: function(seek, actor) {
        actor = actor || this;
        if (seek >= 0) {
            if (!this.animating)
                this.play(actor);
            actor.speed = 1;
        } else {
            actor.speed = -1;
        }
        actor.seekInterval = actor.timeline + seek;
        if (actor.seekInterval < 0) {
            actor.speed = 0;
            actor.seekInterval = 0;
        }
    },

    //TODO: Move these events to Event Delegator
    /**
     * Event to identify when the scene has done animating.
     * @memberOf module:enyo/AnimationSupport/Actor
     * @public
     */
    completed: function() {
        this.animating = false;
    },

    /**
     * Event to identify when the scene has done a step(rAF updatation of time) in the animation.
     * @memberOf module:enyo/AnimationSupport/Actor
     * @public
     */
    step: function() {}
};
