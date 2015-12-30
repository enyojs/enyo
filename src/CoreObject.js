require('enyo');

/**
* Contains the declaration for the {@link module:enyo/CoreObject~Object} kind.
* @module enyo/CoreObject
*/

var
	kind = require('./kind'),
	logger = require('./logger'),
	utils = require('./utils');

var
	MixinSupport = require('./MixinSupport'),
	ObserverSupport = require('./ObserverSupport'),
	BindingSupport = require('./BindingSupport');

// ComputedSupport is applied to all kinds at creation time but must be require()'d somewhere to be
// included in builds. This is that somewhere.
require('./ComputedSupport');

/**
* Used by all [objects]{@link module:enyo/CoreObject~Object} and [subkinds]{@glossary subkind} when using the
* {@link module:enyo/CoreObject~Object#log}, {@link module:enyo/CoreObject~Object#warn} and {@link module:enyo/CoreObject~Object#error} methods.
*
* @private
*/
function log (method, args) {
	if (logger.shouldLog(method)) {
		try {
			throw new Error();
		} catch(err) {
			logger._log(method, [args.callee.caller.displayName + ': ']
				.concat(utils.cloneArray(args)));
			logger.log(err.stack);
		}
	}
}

/**
* {@link module:enyo/CoreObject~Object} lies at the heart of the Enyo framework's implementations of property
* publishing, computed properties (via the [ComputedSupport]{@link module:enyo/ComputedSupport}
* {@glossary mixin}), and data binding (via the {@link module:enyo/BindingSupport~BindingSupport} mixin and
* {@link module:enyo/Binding~Binding} object). It also provides several utility [functions]{@glossary Function}
* for its [subkinds]{@glossary subkind}.
*
* @class Object
* @mixes module:enyo/MixinSupport
* @mixes module:enyo/ObserverSupport
* @mixes module:enyo/BindingSupport
* @public
*/
var CoreObject = module.exports = kind(
	/** @lends module:enyo/CoreObject~Object.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.Object',

	/**
	* @private
	*/
	kind: null,

	/**
	* @private
	*/


	/**
	* Will be `true` if the [destroy()]{@link module:enyo/CoreObject~Object#destroy} method has been called;
	* otherwise, `false`.
	*
	* @readonly
	* @type {Boolean}
	* @default false
	* @public
	*/
	destroyed: false,

	/**
	* @private
	*/
	mixins: [MixinSupport, ObserverSupport, BindingSupport],

	/**
	* @private
	*/
	constructor: function (props) {
		this.importProps(props);
	},

	/**
	* Imports the values from the given [object]{@glossary Object}. Automatically called
	* from the [constructor]{@link module:enyo/CoreObject~Object#constructor}.
	*
	* @param {Object} props - If provided, the [object]{@glossary Object} from which to
	*	retrieve [keys/values]{@glossary Object.keys} to mix in.
	* @returns {this} The callee for chaining.
	* @public
	*/
	importProps: function (props) {
		var key;

		if (props) {
			kind.concatHandler(this, props, true);
			// if props is a default hash this is significantly faster than
			// requiring the hasOwnProperty check every time
			if (!props.kindName) {
				for (key in props) {
					kind.concatenated.indexOf(key) === -1 && (this[key] = props[key]);
				}
			} else {
				for (key in props) {
					if (kind.concatenated.indexOf(key) === -1 && props.hasOwnProperty(key)) {
						this[key] = props[key];
					}
				}
			}
		}
		
		return this;
	},
	
	/**
	* Calls the [destroy()]{@link module:enyo/CoreObject~Object#destroy} method for the named {@link module:enyo/CoreObject~Object} 
	* property.
	*
	* @param {String} name - The name of the property to destroy, if possible.
	* @returns {this} The callee for chaining.
	* @public
	*/
	destroyObject: function (name) {
		if (this[name] && this[name].destroy) {
			this[name].destroy();
		}
		this[name] = null;
		
		return this;
	},
	
	/**
	* Sends a log message to the [console]{@glossary console}, prepended with the name
	* of the {@glossary kind} and method from which `log()` was invoked. Multiple
	* {@glossary arguments} are coerced to {@glossary String} and
	* [joined with spaces]{@glossary Array.join}.
	*
	* ```javascript
	* var kind = require('enyo/kind'),
	*     Object = require('enyo/CoreObject');
	* kind({
	*	name: 'MyObject',
	*	kind: Object,
	*	hello: function() {
	*		this.log('says', 'hi');
	*		// shows in the console: MyObject.hello: says hi
	*	}
	* });
	* ```
	* @public
	*/
	log: function () {
		var acc = arguments.callee.caller,
			nom = ((acc ? acc.displayName : '') || '(instance method)') + ':',
			args = Array.prototype.slice.call(arguments);
		args.unshift(nom);
		logger.log('log', args);
	},
	
	/**
	* Same as [log()]{@link module:enyo/CoreObject~Object#log}, except that it uses the 
	* console's [warn()]{@glossary console.warn} method (if it exists).
	*
	* @public
	*/
	warn: function () {
		log('warn', arguments);
	},
	
	/**
	* Same as [log()]{@link module:enyo/CoreObject~Object#log}, except that it uses the 
	* console's [error()]{@glossary console.error} method (if it exists).
	*
	* @public
	*/
	error: function () {
		log('error', arguments);
	},

	/**
	* Retrieves the value for the given path. The value may be retrieved as long as the given 
	* path is resolvable relative to the given {@link module:enyo/CoreObject~Object}. See
	* [getPath()]{@link module:enyo/utils#getPath} for complete details.
	*
	* This method is backwards-compatible and will automatically call any existing getter
	* method that uses the "getProperty" naming convention. (Moving forward, however, Enyo code
	* should use [computed properties]{@link module:enyo/ComputedSupport} instead of relying on the
	* getter naming convention.)
	*
	* @param {String} path - The path from which to retrieve a value.
	* @returns {*} The value for the given path or [undefined]{@glossary undefined} if 
	*	the path could not be completely resolved.
	* @public
	*/
	get: function () {
		return utils.getPath.apply(this, arguments);
	},
	
	/**
	* Updates the value for the given path. The value may be set as long as the
	* given path is resolvable relative to the given {@link module:enyo/CoreObject~Object}. See
	* [setPath()]{@link module:enyo/utils#setPath} for complete details.
	*
	* @param {String} path - The path for which to set the given value.
	* @param {*} value - The value to set.
	* @param {Object} [opts] - An options hash.
	* @returns {this} The callee for chaining.
	* @public
	*/
	set: function () {
		return utils.setPath.apply(this, arguments);
	},

	/**
	* Binds a [callback]{@glossary callback} to this [object]{@link module:enyo/CoreObject~Object}.
	* If the object has been destroyed, the bound method will be aborted cleanly,
	* with no value returned.
	*
	* This method should generally be used instead of {@link module:enyo/utils#bind} for running
	* code in the context of an instance of {@link module:enyo/CoreObject~Object} or one of its
	* [subkinds]{@glossary subkind}.
	*
	* @public
	*/
	bindSafely: function () {
		var args = Array.prototype.slice.call(arguments);
		args.unshift(this);
		return utils.bindSafely.apply(null, args);
	},
	
	/**
	* An abstract method (primarily) that sets the [destroyed]{@link module:enyo/CoreObject~Object#destroyed} 
	* property to `true`.
	*
	* @returns {this} The callee for chaining.
	* @public
	*/
	destroy: function () {
		
		// Since JS objects are never truly destroyed (GC'd) until all references are
		// gone, we might have some delayed action on this object that needs access
		// to this flag.
		// Using this.set to make the property observable
		return this.set('destroyed', true);
	}
});

/**
* @private
*/
CoreObject.concat = function (ctor, props) {
	var pubs = props.published,
		cpy,
		prop;
		
	if (pubs) {
		cpy = ctor.prototype || ctor;
		for (prop in pubs) {
			// need to make sure that even though a property is 'published'
			// it does not overwrite any computed properties
			if (props[prop] && typeof props[prop] == 'function') continue;
			addGetterSetter(prop, pubs[prop], cpy);
		}
	}
};

/**
* This method creates a getter/setter for a published property of an {@link module:enyo/CoreObject~Object}, but is
* deprecated. It is maintained for purposes of backwards compatibility. The preferred method is 
* to mark public and protected (private) methods and properties using documentation or other 
* means and rely on the [get]{@link module:enyo/CoreObject~Object#get} and [set]{@link module:enyo/CoreObject~Object#set} methods of
* {@link module:enyo/CoreObject~Object} instances.
*
* @private
*/
function addGetterSetter (prop, value, proto) {
	
	// so we don't need to re-execute this over and over and over...
	var cap = utils.cap(prop),
		getName = 'get' + cap,
		setName = 'set' + cap,
		getters = proto._getters || (proto._getters = {}),
		setters = proto._setters || (proto._setters = {}),
		fn;
	
	// we assign the default value from the published block to the prototype
	// so it will be initialized properly
	proto[prop] = value;
	
	// check for a supplied getter and if there isn't one we create one otherwise
	// we mark the supplied getter in the tracking object so the global getPath will
	// know about it
	if (!(fn = proto[getName]) || typeof fn != 'function') {
		fn = proto[getName] = function () {
			return utils.getPath.fast.call(this, prop);
		};
		
		// and we mark it as generated
		fn.generated = true;
	} else if (fn && typeof fn == 'function' && !fn.generated) getters[prop] = getName;
	
	// we need to do the same thing for the setters
	if (!(fn = proto[setName]) || typeof fn != 'function') {
		fn = proto[setName] = function (val) {
			return utils.setPath.fast.call(this, prop, val);
		};
		
		// and we mark it as generated
		fn.generated = true;
	} else if (fn && typeof fn == 'function' && !fn.generated) setters[prop] = setName;
}
