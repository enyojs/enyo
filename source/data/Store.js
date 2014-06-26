(function (enyo, scope) {
	
	var kind = enyo.kind;
		
	var ModelList = enyo.ModelList,
		EventEmitter = enyo.EventEmitter,
	
		// because Object is already taken by something...blarg
		_Object = enyo.Object;
	
	/**
	* Only necessary because of the order in which mixins are applied.
	*
	* @class
	* @private
	*/
	var BaseStore = enyo.kind({
		kind: _Object,
		mixins: [EventEmitter]
	});
	
	/**
	* This method should determine if the given [model]{@link enyo.Model} should be included in the
	* filtered set for the [find]{@link enyo.Store#find} method.
	* 
	* @callback enyo.Store~Filter
	* @param {enyo.Model} model The [model]{@link enyo.Model} to filter.
	* @returns {Boolean} Return `true` if the model meets the filter requirements, `false`
	*	otherwise.
	*/
	
	/**
	* The configuration options for the [find]{@link enyo.Store#find} method.
	* 
	* @typedef {Object} enyo.Store~FindOptions
	* @property {Boolean} all=true - Whether or not to include more than one match for the
	*	filter method. If `true` will return an array of matches, otherwise a single match.
	* @property {Object} context - If provided it will be used as the `this` (_context_) of
	*	the filter method.
	*/
	
	/**
	* An anonymous kind used internally for the singleton {@link enyo.store}.
    * 
	* @see enyo.store
	* @class enyo.Store
	* @mixes enyo.EventEmitter
	* @extends enyo.Object
	* @protected
	*/
	var Store = kind(
		/** @lends Store.prototype */ {
		
		/**
		* @private
		*/
		kind: BaseStore,
		
		/**
		* Find a [model (or models)]{@link enyo.Model} of a certain [kind]{@link external:kind}.
		* It uses the return value from a filter method to determine whether or not to include a
		* particular [model]{@link enyo.Model}. Using the _all_ optional flag will ensure it
		* looks for all matches otherwise it will stop and return the first positive match.
		* 
		* @see {@link external:Array.find}
		* @param {enyo.Model} ctor The constructor for the [kind]{@link external:kind} of
		*	[model]{@link enyo.Model} it will be filtering.
		* @param {enyo.Store~Filter} fn The filter method.
		* @param {enyo.Store~FindOptions} [opts] The options parameter.
		* @returns {(enyo.Model|enyo.Model[]|undefined)} If the _all_ flag is `true` it will
		*	return an array of [models]{@link enyo.Model} otherwise it will return the first
		*	[model]{@link enyo.Model} that returned `true` from the filter method. It will
		*	return `undefined` if _all_ is `false` and no match could be found.
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
			opts = opts ? enyo.mixin({}, [options, opts]) : options;
				
			if (list) return opts.all ? list.filter(fn, opts.context) : list.find(fn, opts.context);
			
			// if it happens it could not find a list for the requested kind we fudge the return
			// so it can keep on executing
			else return opts.all ? [] : undefined;
		},
		
		/**
		* @alias enyo.Store#find
		* @public
		*/
		findLocal: function () {
			return this.find.apply(this, arguments);
		},
		
		/**
		* @private
		*/
		add: function (models, opts) {
			var ctor = models && models instanceof Array ? models[0].ctor : models.ctor,
				kindName = ctor && ctor.prototype.kindName,
				list = this.models[kindName],
				added,
				i;
				
			// if we were able to find the list then we go ahead and attempt to add the models
			if (list) added = list.add(models);
			// if we successfully added models and this was a default operation (not being
			// batched by a collection or other feature) we emit the event needed primarily
			// by relational models but could be useful other places
			if (added.length && (!opts || !opts.silent)) {
				for (i = 0; i < added.length; ++i) {
					this.emit(ctor, 'add', {model: added[i]});
				}
			}
			
			return this;
		},
		
		/**
		* @private
		*/
		remove: function (models, opts) {
			var ctor = models && models instanceof Array ? models[0].ctor : models.ctor,
				kindName = ctor && ctor.prototype.kindName,
				list = this.models[kindName],
				removed,
				i;
			
			// if we were able to find the list then we go ahead and attempt to remove the models
			if (list) removed = list.remove(models);
			// if we successfully removed models and this was a default opreation (not being
			// batched by a collection or other feature) we emit the event needed primarily
			// by relational models but could be useful other places
			if (removed.length && (!opts || !opts.silent)) {
				for (i = 0; i < removed.length; ++i) {
					this.emit(ctor, 'remove', {model: removed[i]});
				}
			}
			
			return this;
		},
		
		/**
		* Determine, from the given parameters, if the [store]{@link enyo.store} has a specific
		* [model]{@link enyo.Model}.
		*
		* @param {(Function|enyo.Model)} ctor Can be the constructor for an {@link enyo.Model} or
		*	a [model]{@link enyo.Model} instance. If not providing a [model]{@link enyo.Model}
		*	instance as the next (_model_) parameter, this must be a constructor.
		* @param {(String|Number|enyo.Model)} [model] If the _ctor_ parameter is a
		*	constructor this can be a [Number]{@link external:Number} or a
		*	[String]{@link external:String} representing a
		*	[primaryKey]{@link enyo.Model#primaryKey} for the given {@link enyo.Model} or an
		*	instance of a [model]{@link enyo.Model}.
		* @returns {Boolean} Whether or not the [store]{@link enyo.store} has the given
		*	[model]{@link enyo.Model}.
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
		constructor: enyo.inherit(function (sup) {
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
		on: enyo.inherit(function (sup) {
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
		off: enyo.inherit(function (sup) {
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
		emit: enyo.inherit(function (sup) {
			return function (ctor, e) {
				var listeners,
					args;
				
				if (typeof ctor == 'function') {
					listeners = this.scopeListeners(ctor, e);
					
					if (listeners.length) {
						args = enyo.toArray(arguments).slice(1);
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
	* A runtime database for working with [models]{@link enyo.Model}. It is primarily used
	* internally by _data layer_ [kinds]{@link external:kind} ({@link enyo.Model},
	* {@link enyo.Collection}, {@link enyo.RelationalModel}).
	* 
	* @see enyo.Model
	* @see enyo.Collection
	* @see enyo.RelationalModel
	* @type enyo.Store
	* @memberof enyo
	* @public
	*/
	enyo.store = new Store();

})(enyo, this);