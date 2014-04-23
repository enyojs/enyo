/**
	@namespace enyo
*/
(function (enyo, scope) {
	
	var kind = enyo.kind;
		
	var ModelList = enyo.ModelList,
		EventEmitter = enyo.EventEmitter,
	
		// because Object is already taken by something...blarg
		_Object = enyo.Object;
		
	var BaseStore = enyo.kind({
		kind: _Object,
		mixins: [EventEmitter]
	});
	
	/**
		An anonymous kind used internally for the singleton {@link enyo.store}.

		@protected
		@class Store
		@extends enyo.Object
	*/
	var Store = kind(
		/** @lends Store.prototype */ {
		
		/**
			@private
		*/
		kind: BaseStore,
		
		/**
			@public
			@method
		*/
		find: function () {
			
			return this;
		},
		
		/**
			@public
			@method
		*/
		findLocal: function (ctor, fn, opts) {
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
			else return [];
		},
		
		/**
			@public
			@method
		*/
		add: function (models) {
			var kindName = models && models instanceof Array? models[0].kindName: models.kindName
				, list = this.models[kindName];
			
			if (list) list.add(models);
			
			return this;
		},
		
		/**
			@public
			@method
		*/
		remove: function (models) {
			var kindName = models && models instanceof Array? models[0].kindName: models.kindName
				, list = this.models[kindName];
			
			if (list) list.remove(models);
			
			return this;
		},
		
		/**
			@public
			@method
		*/
		has: function (ctor, model) {
			var list = this.models[ctor.prototype.kindName];
			return list? list.has(model): false;
		},
		
		/**
			@public
			@method
		*/
		resolve: function (ctor, model) {
			var list = this.models[ctor.prototype.kindName];
			return list? list.resolve(model): undefined;
		},
		
		/**
			@private
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
			@private
		*/
		scopeListeners: function (scope, e) {
			return !scope ? this._scopeListeners : this._scopeListeners.filter(function (ln) {
				return ln.scope === scope ? !e ? true : ln.event == e : false;
			});
		},
		
		/**
			@private
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
			@private
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
		})
	});
	
	/**
		A runtime database for working with {@link enyo.Model} instances.
	
		@public
		@type Store
		@memberof enyo
	*/
	enyo.store = new Store();
	
	// 
	// var kind = enyo.kind
	// 	, inherit = enyo.inherit
	// 	, toArray = enyo.toArray
	// 	, mixin = enyo.mixin
	// 	
	// var EventEmitter = enyo.EventEmitter
	// 	, ModelList = enyo.ModelList;
	// 	
	// /**
	// 	@private
	// */
	// var BaseStore = kind({
	// 	kind: enyo.Object,
	// 	mixins: [EventEmitter]
	// });
	// 
	// /**
	// 	@private
	// 	@class Store
	// */
	// var Store = kind(
	// 	/** @lends Store.prototype */ {
	// 	name: "enyo.Store",
	// 	kind: BaseStore,
	// 	
	// 	/**
	// 		@private
	// 		@method
	// 	*/
	// 	on: inherit(function (sup) {
	// 		return function (ctor, e, fn, ctx) {
	// 			if (typeof ctor == "function") {
	// 				this.scopeListeners().push({
	// 					scope: ctor,
	// 					event: e,
	// 					method: fn,
	// 					ctx: ctx || this
	// 				});
	// 				
	// 				return this;
	// 			}
	// 			
	// 			return sup.apply(this, arguments);
	// 		};
	// 	}),
	// 	
	// 	/**
	// 		@private
	// 		@method
	// 	*/
	// 	addListener: function () {
	// 		return this.on.apply(this, arguments);
	// 	},
	// 	
	// 	/**
	// 		@private
	// 		@method
	// 	*/
	// 	emit: inherit(function (sup) {
	// 		return function (ctor, e) {
	// 			var dit = this;
	// 			
	// 			runloop.add("event", function () {
	// 				if (typeof ctor == "function") {
	// 					var listeners = dit.scopeListeners(ctor, e);
	// 				
	// 					if (listeners.length) {
	// 						var args = toArray(arguments).slice(1);
	// 						args.unshift(dit);
	// 						listeners.forEach(function (ln) {
	// 							ln.method.apply(ln.ctx, args);
	// 						});
	// 						// return true;
	// 					}
	// 					// return false;
	// 				}
	// 			
	// 				return sup.apply(dit, arguments);
	// 			});
	// 			
	// 			// @TODO: This will incorrectly indicate that we had listeners for an event
	// 			// even if we didn't need to fix
	// 			return true;
	// 		};
	// 	}),
	// 	
	// 	/**
	// 		@private
	// 		@method
	// 	*/
	// 	triggerEvent: function () {
	// 		return this.emit.apply(this, arguments);
	// 	},
	// 	
	// 	/**
	// 		@private
	// 		@method
	// 	*/
	// 	off: inherit(function (sup) {
	// 		return function (ctor, e, fn) {
	// 			if (typeof ctor == "function") {
	// 				var listeners = this.scopeListeners()
	// 					, idx;
	// 					
	// 				if (listeners.length) {
	// 					idx = listeners.findIndex(function (ln) {
	// 						return ln.scope === ctor && ln.event == e && ln.method === fn;
	// 					});
	// 					idx >= 0 && listeners.splice(idx, 1);
	// 				}
	// 				
	// 				return this;
	// 			}
	// 			
	// 			return sup.apply(this, arguments);
	// 		};
	// 	}),
	// 	
	// 	/**
	// 		@private
	// 		@method
	// 	*/
	// 	removeListener: function () {
	// 		return this.off.apply(this, arguments);
	// 	},
	// 	
	// 	/**
	// 		@private
	// 		@method
	// 	*/
	// 	scopeListeners: function (scope, e) {
	// 		return !scope? this._scopeListeners: this._scopeListeners.filter(function (ln) {
	// 			return ln.scope === scope? !e? true: ln.event === e: false; 
	// 		});
	// 	},
	// 	
	// 	/**
	// 		@public
	// 		@method
	// 	*/
	// 	has: function (ctor, model) {
	// 		var models = this.models[ctor.prototype.kindName];
	// 		return models && models.has(model);
	// 	},
	// 	
	// 	/**
	// 		@public
	// 		@method
	// 	*/
	// 	contains: function (ctor, model) {
	// 		return this.has(ctor, model);
	// 	},
	// 		
	// 	/**
	// 		@private
	// 		@method
	// 	*/
	// 	add: function (model, opts) {			
	// 		var models = this.models[model.kindName];
	// 		models.add(model);
	// 		runloop.add("add", {model: model, options: opts});
	// 		return this;
	// 	},
	// 	
	// 	/**
	// 		@private
	// 		@method
	// 	*/
	// 	remove: function (model, opts) {
	// 		var models = this.models[model.kindName];
	// 		models.remove(model);
	// 		
	// 		runloop.add("remove", {model: model, options: opts});
	// 		return this;
	// 	},
	// 	
	// 	/**
	// 		@private
	// 		@method
	// 	*/
	// 	onModelEvent: function (model, e) {
	// 		// this.log(arguments);
	// 		
	// 		switch (e) {
	// 		case "destroy":
	// 			this.remove(model, model.options.syncStore);
	// 			break;
	// 		case "change":
	// 			// @TODO: PrimaryKey/id change..
	// 			break;
	// 		}
	// 	},
	// 	
	// 	/**
	// 		@public
	// 		@method
	// 	*/
	// 	remote: function (action, model, opts) {
	// 		runloop.add("remote", function () {
	// 			var source = opts.source || model.source
	// 				, name;
	// 		
	// 			if (source) {
	// 				if (source === true) for (name in enyo.sources) {
	// 					source = enyo.sources[name];
	// 					if (source[action]) source[action](model, opts);
	// 				} else if (source instanceof Array) {
	// 					source.forEach(function (name) {
	// 						var src = enyo.sources[name];
	// 						if (src && src[action]) src[action](models, opts);
	// 					});
	// 				} else if ((source = enyo.sources[source]) && source[action]) source[action](model, opts);
	// 			}
	// 		
	// 			// @TODO: Should this throw an error??
	// 		});
	// 	},
	// 	
	// 	/**
	// 		@public
	// 		@method
	// 	*/
	// 	find: function () {
	// 	},
	// 	
	// 	/**
	// 		@public
	// 		@method
	// 	*/
	// 	findLocal: function (ctor, fn, opts) {
	// 		var models = this.models[ctor.prototype.kindName]
	// 			, options = {all: true}
	// 			, found, method, ctx;
	// 			
	// 		if (arguments.length == 1) return models.slice();
	// 		
	// 		opts = opts? mixin({}, [options, opts]): options;
	// 		
	// 		ctx = opts.context || this;
	// 		
	// 		method = models && (opts.all? models.filter: models.where);
	// 		found = method && method.call(models, function (ln) {
	// 			return fn.call(ctx, ln, opts);
	// 		});
	// 		
	// 		return found;
	// 	},
	// 		
	// 	/**
	// 		@private
	// 		@method
	// 	*/
	// 	constructor: inherit(function (sup) {
	// 		return function () {
	// 			this.euid = "store";
	// 			
	// 			sup.apply(this, arguments);
	// 			this.models = {"enyo.Model": new ModelList()};
	// 			
	// 			// our overloaded event emitter methods need storage for
	// 			// the listeners
	// 			this._scopeListeners = [];
	// 		};
	// 	})
	// });
	// 
	// enyo.store = new Store();

})(enyo, this);