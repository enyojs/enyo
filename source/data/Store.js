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
			@public
			@method
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
			@public
			@method
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
			@public
			@method
		*/
		resolve: function (ctor, model) {
			var list = this.models[ctor && ctor.prototype.kindName];
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
		}),
		
		/**
			@private
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
		A runtime database for working with {@link enyo.Model} instances.
	
		@public
		@type Store
		@memberof enyo
	*/
	enyo.store = new Store();

})(enyo, this);