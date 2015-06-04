require('enyo');

/**
* Contains the declaration for the {@link module:enyo/Source~Source} kind.
* @module enyo/Source
*/

var
	kind = require('./kind'),
	utils = require('./utils'),
	logger = require('./logger');

/**
* All of the known, instanced [sources]{@link module:enyo/Source~Source}, by name.
*
* @name enyo~sources
* @type {Object}
* @readonly
*/
var sources = {};

/**
* This is an abstract base class. A [source]{@link module:enyo/Source~Source} is a communication
* layer used by data layer [kinds]{@glossary kind} to retrieve and persist data and
* application state via its abstract API methods.
*
* @class Source
* @public
*/
var Source = module.exports = kind(
	/** @lends module:enyo/Source~Source.prototype */ {
	
	name: 'enyo.Source',
	
	/**
	* @private
	*/
	kind: null,
	
	/**
	* @private
	*/

	
	/**
	* When initialized, the source should be passed properties to set on itself.
	* These properties should include the name by which it will be referenced in
	* the application.
	*
	* @param {Object} [props] - The properties to set on itself.
	* @public
	*/
	constructor: function (props) {
		if (props) this.importProps(props);
		// automatic coersion of name removing prefix
		this.name || (this.name = this.kindName.replace(/^(.*)\./, ""));
		// now add to the global registry of sources
		sources[this.name] = this;
	},
	
	/**
	* Overload this method to handle retrieval of data. This method should accept an options
	* [hash]{@glossary Object} with additional configuration properties, including `success`
	* and `error` callbacks to handle the result.
	*
	* @virtual
	* @param {(module:enyo/Model~Model|module:enyo/Collection~Collection)} model The [model]{@link module:enyo/Model~Model} or
	*	[collection]{@link module:enyo/Collection~Collection} to be retrieved.
	* @param {Object} opts - The configuration options [hash]{@glossary Object}, including
	*	`success` and `error` callbacks.
	*/
	fetch: function (model, opts) {
		//
	},
	
	/**
	* Overload this method to handle persisting of data. This method should accept an options
	* [hash]{@glossary Object} with additional configuration properties, including `success`
	* and `error` callbacks to handle the result.
	*
	* @virtual
	* @param {(module:enyo/Model~Model|module:enyo/Collection~Collection)} model The [model]{@link module:enyo/Model~Model} or
	*	[collection]{@link module:enyo/Collection~Collection} to be persisted.
	* @param {Object} opts - The configuration options [hash]{@glossary Object}, including
	*	`success` and `error` callback.
	*/
	commit: function (model, opts) {
		//
	},
	
	/**
	* Overload this method to handle deletion of data. This method should accept an options
	* [hash]{@glossary Object} with additional configuration properties, including `success`
	* and `error` callbacks to handle the result. If called without parameters, it will
	* instead destroy itself and be removed from [enyo.sources]{@link enyo~sources}, rendering
	* itself unavailable for further operations.
	*
	* @param {(module:enyo/Model~Model|module:enyo/Collection~Collection)} model The [model]{@link module:enyo/Model~Model} or
	*	[collection]{@link module:enyo/Collection~Collection} to be deleted.
	* @param {Object} opts - The configuration options [hash]{@glossary Object}, including
	*	`success` and `error` callbacks.
	*/
	destroy: function (model, opts) {
		
		// if called with no parameters we actually just breakdown the source and remove
		// it as being available
		if (!arguments.length) {
			sources[this.name] = null;
			this.name = null;
		}
	},
	
	/**
	* Overload this method to handle querying of data based on the passed-in constructor. This
	* method should accept an options [hash]{@glossary Object} with additional configuration
	* properties, including `success` and `error` callbacks to handle the result.
	*
	* @virtual
	* @param {Function} ctor - The constructor for the [kind]{@glossary kind} of
	*	{@link module:enyo/Model~Model} or {@link module:enyo/Collection~Collection} to be queried.
	* @param {Object} opts - The configuration options [hash]{@glossary Object}, including
	*	`success` and `error` callbacks.
	*/
	find: function (ctor, opts) {
		//
	},
	
	/**
	* @private
	*/
	importProps: function (props) {
		props && utils.mixin(this, props);
	},
	
	/**
	* @see module:enyo/utils#getPath
	* @method
	* @public
	*/
	get: utils.getPath,
	
	/**
	* @see module:enyo/utils#setPath
	* @method
	* @public
	*/
	set: utils.setPath
});

/**
* Creates an instance of {@link module:enyo/Source~Source} with the given properties. These
* properties should include a `kind` property with the name of the
* [kind]{@glossary kind} of source and a `name` for the instance. This static
* method is also available on all [subkinds]{@glossary subkind} of
* `enyo.Source`. The instance will automatically be added to the
* [enyo.sources]{@link enyo~sources} [object]{@glossary Object} and may be
* referenced by its `name`.
*
* @name enyo.Source.create
* @static
* @method
* @param {Object} props - The properties to pass to the constructor for the requested
*	[kind]{@glossary kind} of [source]{@link module:enyo/Source~Source}.
* @returns {module:enyo/Source~Source} An instance of the requested kind of source.
* @public
*/
Source.create = function (props) {
	var Ctor = (props && props.kind) || this;
	
	if (typeof Ctor == 'string') Ctor = kind.constructorForKind(Ctor);
	
	return new Ctor(props);
};

/**
* @static
* @private
*/
Source.concat = function (ctor, props) {
	
	// force noDefer so that we can actually set this method on the constructor
	if (props) props.noDefer = true;
	
	ctor.create = Source.create;
};

/**
* @static
* @private
*/
Source.execute = function (action, model, opts) {
	var source = opts.source || model.source,
	
		// we need to be able to bind the success and error callbacks for each of the
		// sources we'll be using
		options = utils.clone(opts, true),
		nom = source,
		msg;
	
	if (source) {
		
		// if explicitly set to true then we need to use all available sources in the
		// application
		if (source === true) {
			
			for (nom in sources) {
				source = sources[nom];
				if (source[action]) {
					
					// bind the source name to the success and error callbacks
					options.success = opts.success.bind(null, nom);
					options.error = opts.error.bind(null, nom);
					
					source[action](model, options);
				}
			}
		}
		
		// if it is an array of specific sources to use we, well, will only use those!
		else if (source instanceof Array) {
			source.forEach(function (nom) {
				var src = typeof nom == 'string' ? sources[nom] : nom;
				
				if (src && src[action]) {
					// bind the source name to the success and error callbacks
					options.success = opts.success.bind(null, src.name);
					options.error = opts.error.bind(null, src.name);
					
					src[action](model, options);
				}
			});
		}
		
		// if it is an instance of a source
		else if (source instanceof Source && source[action]) {
			
			// bind the source name to the success and error callbacks
			options.success = opts.success.bind(null, source.name);
			options.error = opts.error.bind(null, source.name);
			
			source[action](model, options);
		}
		
		// otherwise only one was specified and we attempt to use that
		else if ((source = sources[nom]) && source[action]) {
			
			// bind the source name to the success and error callbacks
			options.success = opts.success.bind(null, nom);
			options.error = opts.error.bind(null, nom);
			
			source[action](model, options);
		}
		
		// we could not resolve the requested source
		else {
			msg = 'enyo.Source.execute(): requested source(s) could not be found for ' +
				model.kindName + '.' + action + '()';
			
			logger.warn(msg);
			
			// we need to fail the attempt and let it be handled
			opts.error(nom ? typeof nom == 'string' ? nom : nom.name : 'UNKNOWN', msg);
		}
	} else {
		msg = 'enyo.Source.execute(): no source(s) provided for ' + model.kindName + '.' +
			action + '()';
			
		logger.warn(msg);
		
		// we need to fail the attempt and let it be handled
		opts.error(nom ? typeof nom == 'string' ? nom : nom.name : 'UNKNOWN', msg);
	}
};

Source.sources = sources;
