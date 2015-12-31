require('enyo');

/**
* Contains the declaration for the {@link module:enyo/Store~Store} kind.
* @module enyo/Store
*/

var
	kind = require('./kind'),
	utils = require('./utils');

var
	ModelList = require('./ModelList'),
	EventEmitter = require('./EventEmitter'),
	CoreObject = require('./CoreObject');

/**
* Only necessary because of the order in which mixins are applied.
*
* @class
* @private
*/
var BaseStore = kind({
	kind: CoreObject,
	mixins: [EventEmitter]
});

/**
* This method should determine whether the given [model]{@link module:enyo/Model~Model}
* should be included in the filtered set for the [find()]{@link module:enyo/Store~Store#find}
* method.
* 
* @callback enyo.Store~Filter
* @param {module:enyo/Model~Model} model - The [model]{@link module:enyo/Model~Model} to filter.
* @returns {Boolean} `true` if the model meets the filter requirements;
* otherwise, `false`.
*/

/**
* The configuration options for the [find()]{@link module:enyo/Store~Store#find} method.
* 
* @typedef {Object} enyo.Store~FindOptions
* @property {Boolean} all=true - Whether or not to include more than one match for the
*	filter method. If `true`, an array of matches is returned; otherwise, a single match.
* @property {Object} context - If provided, it will be used as the `this` (context) of
*	the filter method.
*/

/**
* An anonymous kind used internally for the singleton {@link module:enyo/Store~Store}.
* 
* @class Store
* @mixes module:enyo/EventEmitter
* @extends module:enyo/CoreObject~Object
* @protected
*/
var Store = kind(
	/** @lends module:enyo/Store~Store.prototype */ {
	
	name: 'enyo.Store',
	
	/**
	* @private
	*/
	kind: BaseStore,
	
	/**
	* Finds a [model (or models)]{@link module:enyo/Model~Model} of a certain [kind]{@glossary kind}.
	* It uses the return value from a filter method to determine whether a particular
	* model will be included. Set the optional `all` flag to `true` to ensure that
	* the method looks for all matches; otherwise, it will return the first positive
	* match.
	* 
	* @see {@glossary Array.find}
	* @param {module:enyo/Model~Model} ctor - The constructor for the [kind]{@glossary kind} of
	*	[model]{@link module:enyo/Model~Model} to be filtered.
	* @param {module:enyo/Store~Store~Filter} fn - The filter method.
	* @param {module:enyo/Store~Store~FindOptions} [opts] - The options parameter.
	* @returns {(module:enyo/Model~Model|module:enyo/Model~Model[]|undefined)} If the `all` flag is `true`,
	*	returns an array of models; otherwise, returns the first model that returned
	*	that returned `true` from the filter method. Returns `undefined` if `all` is
	* `false` and no match could be found.
	* @public
	*/
	find: function (ctor, fn, opts) {
		var kindName = ctor.prototype.kindName,
			list = this.models[kindName],
			options = {all: true, context: this};
		
		// allows the method to be called with a constructor only and will return an
		// immutable copy of the array of all models of that type or an empty array
		if (arguments.length == 1 || typeof fn != 'function') {
			return list ? list.slice() : [];
		}
		
		// ensure we use defaults with any provided options
		opts = opts ? utils.mixin({}, [options, opts]) : options;
			
		if (list) return opts.all ? list.filter(fn, opts.context) : list.find(fn, opts.context);
		
		// if it happens it could not find a list for the requested kind we fudge the return
		// so it can keep on executing
		else return opts.all ? [] : undefined;
	},
	
	/**
	* This method is an alias for [find()]{@link module:enyo/Store~Store#find}.
	*
	* @deprecated
	* @public
	*/
	findLocal: function () {
		return this.find.apply(this, arguments);
	},
	
	/**
	* @private
	*/
	add: function (models, opts) {
		var ctor = models && (models instanceof Array ? models[0].ctor : models.ctor),
			kindName = ctor && ctor.prototype.kindName,
			list = kindName && this.models[kindName],
			added,
			i;
			
		// if we were able to find the list then we go ahead and attempt to add the models
		if (list) {
			added = list.add(models);
			// if we successfully added models and this was a default operation (not being
			// batched by a collection or other feature) we emit the event needed primarily
			// by relational models but could be useful other places
			if (added.length && (!opts || !opts.silent)) {
				for (i = 0; i < added.length; ++i) {
					this.emit(ctor, 'add', {model: added[i]});
				}
			}
		}
		
		return this;
	},
	
	/**
	* @private
	*/
	remove: function (models, opts) {
		var ctor = models && (models instanceof Array ? models[0].ctor : models.ctor),
			kindName = ctor && ctor.prototype.kindName,
			list = kindName && this.models[kindName],
			removed,
			i;
		
		// if we were able to find the list then we go ahead and attempt to remove the models
		if (list) {
			removed = list.remove(models);
			// if we successfully removed models and this was a default operation (not being
			// batched by a collection or other feature) we emit the event. Needed primarily
			// by relational models but could be useful other places
			if (removed.length && (!opts || !opts.silent)) {
				for (i = 0; i < removed.length; ++i) {
					this.emit(ctor, 'remove', {model: removed[i]});
				}
			}
		}
		
		return this;
	},
	
	/**
	* Determines, from the given parameters, whether the [store]{@link module:enyo/Store~Store}
	* has a specific [model]{@link module:enyo/Model~Model}.
	*
	* @param {(Function|module:enyo/Model~Model)} ctor Can be the constructor for an {@link module:enyo/Model~Model}
	*	or a model instance. Must be a constructor unless a model instance is passed as the
	* optional `model` parameter.
	* @param {(String|Number|module:enyo/Model~Model)} [model] If the `ctor` parameter is a
	*	constructor, this may be a [Number]{@glossary Number} or a [String]{@glossary String}
	* representing a [primaryKey]{@link module:enyo/Model~Model#primaryKey} for the given model, or an
	*	instance of a model.
	* @returns {Boolean} Whether or not the [store]{@link module:enyo/Store~Store} has the given
	*	[model]{@link module:enyo/Model~Model}.
	* @public
	*/
	has: function (ctor, model) {
		var list;
		
		if (!model) {
			model = ctor;
			ctor = model.ctor;
		}
		
		list = this.models[ctor.prototype.kindName];
		return list ? list.has(model) : false;
	},
	
	/**
	* @private
	*/
	resolve: function (ctor, model) {
		var list = this.models[ctor && ctor.prototype.kindName];
		return list? list.resolve(model): undefined;
	},
	
	/**
	* @private
	*/
	constructor: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			
			this._scopeListeners = [];
			
			// all future sub-kinds of enyo.Model that are processed will automatically
			// create/add their entries to this object in their concat method
			this.models = {
				'enyo.Model': new ModelList()
			};
		};
	}),
	
	/**
	* @private
	*/
	scopeListeners: function (scope, e) {
		return !scope ? this._scopeListeners : this._scopeListeners.filter(function (ln) {
			return ln.scope === scope ? !e ? true : ln.event == e : false;
		});
	},
	
	/**
	* @private
	*/
	on: kind.inherit(function (sup) {
		return function (ctor, e, fn, ctx) {
			if (typeof ctor == 'function') {
				this.scopeListeners().push({
					scope: ctor,
					event: e,
					method: fn,
					ctx: ctx || this
				});
				
				return this;
			}
			
			return sup.apply(this, arguments);
		};
	}),
	
	/**
	* @private
	*/
	off: kind.inherit(function (sup) {
		return function (ctor, e, fn) {
			var listeners,
				idx;
			
			if (typeof ctor == 'function') {
				listeners = this.scopeListeners(ctor);
				if (listeners.length) {
					idx = listeners.findIndex(function (ln) {
						return ln.event == e && ln.method === fn;
					});
					
					// if it found the entry we remove it
					if (idx >= 0) listeners.splice(idx, 1);
				}
				return this;
			}
		};
	}),
	
	/**
	* @private
	*/
	emit: kind.inherit(function (sup) {
		return function (ctor, e) {
			var listeners,
				args;
			
			if (typeof ctor == 'function') {
				listeners = this.scopeListeners(ctor, e);
				
				if (listeners.length) {
					args = utils.toArray(arguments).slice(1);
					args.unshift(this);
					listeners.forEach(function (ln) {
						ln.method.apply(ln.ctx, args);
					});
					return true;
				}
				return false;
			}
			
			return sup.apply(this, arguments);
		};
	})
});

/**
* A runtime database for working with [models]{@link module:enyo/Model~Model}. It is primarily used
* internally by data layer [kinds]{@glossary kind} ({@link module:enyo/Model~Model},
* {@link module:enyo/Collection~Collection}, and {@link module:enyo/RelationalModel~RelationalModel}).
* 
* @see module:enyo/Model~Model
* @see module:enyo/Collection~Collection
* @see module:enyo/RelationalModel~RelationalModel
* @type enyo.Store
* @memberof enyo
* @public
*/
module.exports = new Store();
