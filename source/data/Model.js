(function (enyo) {
	
	var kind = enyo.kind
		, mixin = enyo.mixin
		, clone = enyo.clone
		, only = enyo.only
		, getPath = enyo.getPath
		, isString = enyo.isString
		, isObject = enyo.isObject
		, isFunction = enyo.isFunction
		, uid = enyo.uid
		, uuid = enyo.uuid
		, json = enyo.json
		, inherit = enyo.inherit;
		
	var ObserverSupport = enyo.ObserverSupport
		, ComputedSupport = enyo.ComputedSupport
		, BindingSupport = enyo.BindingSupport
		, EventEmitter = enyo.EventEmitter
		, ModelList = enyo.ModelList
		, Source = enyo.Source
		, oObject = enyo.Object;
	
	/**
		@private
	*/
	var BaseModel = kind({
		kind: null,
		mixins: [ObserverSupport, ComputedSupport, BindingSupport, EventEmitter]
	});
	
	/**
		@public
		@class enyo.Model
	*/
	var Model = kind(
		/** @lends enyo.Model.prototype */ {
		name: 'enyo.Model',
		kind: BaseModel,
		noDefer: true,
				
		/**
			@public
		*/
		attributes: null,
		
		/**
			@public
		*/
		source: null,
		
		/**
			@public
		*/
		includeKeys: null,
		
		/**
			@public
		*/
		options: {
			silent: false,
			remote: false,
			commit: false,
			parse: false,
			fetch: false
		},
		
		/**
			@public
		*/
		isNew: true,
		
		/**
			@public
		*/
		isDirty: false,
		
		/**
			@public
		*/
		primaryKey: 'id',
		
		/**
			@public
			@method
		*/
		parse: function (data) {
			return data;
		},
		
		/**
			@public
			@method
		*/
		raw: function () {
			var inc = this.includeKeys
				, attrs = this.attributes
				, keys = inc || Object.keys(attrs)
				, cpy = inc? only(inc, attrs): clone(attrs);
			keys.forEach(function (key) {
				var ent = this.get(key);
				if (isFunction(ent)) cpy[key] = ent.call(this);
				else if (ent && ent.raw) cpy[key] = ent.raw();
				else cpy[key] = ent;
			}, this);
			return cpy;
		},
		
		/**
			@public
			@method
		*/
		toJSON: function () {
			
			// @NOTE: Because this is supposed to return a JSON parse-able object
			return this.raw();
		},
		
		/**
			@public
			@method
		*/
		restore: function (prop) {
			if (prop) this.set(prop, this.previous[prop]);
			else this.set(this.previous);
		},
		
		/**
			@public
			@method
		*/
		commit: function (opts) {
			var options = opts? clone(opts): {}
				, dit = this;
				
			options.success = function (res) {
				dit.previous = clone(dit.attributes);
				dit.onCommit(opts, res);
				
				if (opts && opts.success) {
					opts.success(dit, res, opts);
				}
			};
		
			options.error = function (res) {
				dit.onError('commit', opts, res);
			};
		
			Source.execute('commit', this, options);
			return this;
		},
		
		/**
			@public
			@method
		*/
		fetch: function (opts) {
			var options = opts? clone(opts): {}
				, dit = this;
				
			options.success = function (res) {
				dit.onFetch(res, opts);
				
				if (opts && opts.success) {
					opts.success(dit, res, opts);
				}
			};
			
			options.error = function (res) {
				dit.onError('fetch', opts, res);
			};
			
			Source.execute('fetch', this, options);
			return this;
		},
		
		/**
			@public
			@method
		*/
		destroy: function (opts) {
			
			// this becomes an (potentially) async operation if we are committing this destroy
			// to a source and its kind of tricky to figure out because there are several ways
			// it could be flagged to do this
			
			if (
				// if our default option says to commit operations and the given opts don't tell us
				// explicitly to ignore that we must do it
				(this.options.commit && (!opts || opts.commit !== false)) ||
				// or if there are supplied options and it has a source declared or the commit flag
				// as true
				(opts && (opts.source || opts.commit))
			) {
				var scop = this,
					options = opts ? enyo.clone(opts) : {};
					
				options.success = function () {
					// continue the operation this time with commit false explicitly
					scop.destroy({commit: false});
					if (opts && opts.success) opts.success(opts);
				}
				Source.execute('destroy', this, options);
				return this;
			}
			
			
			// we flag this early so objects that receive an event and process it
			// can optionally check this to support faster cleanup in some cases
			// e.g. Collection/Store don't need to remove listeners because it will
			// be done in a much quicker way already
			this.destroyed = true;
			this.unsilence(true).emit('destroy');
			this.removeAllListeners();
			this.removeAllObservers();
			
			// if this does not have the the batching flag (that would be set by a collection)
			// then we need to do the default of removing it from the store
			if (!opts || !opts.batching) this.store.remove(this);
			return this;
		},
		
		/**
			@public
			@method
		*/
		get: function (path) {
			return this.isComputed(path)? this.getLocal(path): this.attributes[path];
		},
		
		/**
			@public
			@method
		*/
		set: function (path, is, opts) {
			if (!this.destroyed) {
				
				var attrs = this.attributes
					, options = this.options
					, changed, incoming, force, silent, key, value, commit;
					
				if (typeof path == 'object') {
					incoming = path;
					opts || (opts = is);
				} else {
					incoming = {};
					incoming[path] = is;
				}
		
				if (opts === true) {
					force = true;
					opts = {};
				}
		
				// opts || (opts = this.options);
				opts = opts? mixin({}, [options, opts]): options;
				silent = opts.silent;
				force = force || opts.force;
				commit = opts.commit;
		
				for (key in incoming) {
					value = incoming[key];
			
					if (value !== attrs[key] || force) {
						// merely in case it was reassigned or cleared unknowingly
						changed || (changed = this.changed = {});
						changed[key] = attrs[key] = value;
					}
				}
		
				if (changed) {
					// must flag this model as having been updated
					this.isDirty = true;
			
					if (!silent) this.emit('change', changed, this);
				
					commit && this.commit();
				}
			}
		},
		
		/**
			@private
			@method
		*/
		getLocal: ComputedSupport.get.fn(oObject.prototype.get),
		
		/**
			@private
			@method
		*/
		setLocal: ComputedSupport.set.fn(oObject.prototype.set),
		
		/**
			@private
			@method
		*/
		constructor: function (attrs, props, opts) {
			
			// in cases where there is an options hash provided in the _props_ param
			// we need to integrate it manually...
			if (props && props.options) {
				this.options = mixin({}, [this.options, props.options]);
				delete props.options;
			}
			
			// the _opts_ parameter is a one-hit options hash it does not leave
			// behind its values as default options...
			opts = opts? mixin({}, [this.options, opts]): this.options;
			
			// go ahead and mix all of the properties in
			props && mixin(this, props);
			
			var noAdd = opts.noAdd
				, commit = opts.commit
				, parse = opts.parse
				, fetch = this.options.fetch
				, defaults;
			
			// defaults = this.defaults && (typeof this.defaults == 'function'? this.defaults(attrs, opts): this.defaults);
			defaults = this.defaults && typeof this.defaults == 'function'? this.defaults(attrs, opts): null;
			
			// ensure we have a unique identifier that could potentially
			// be used in remote systems
			this.euid = this.euid || uid('m');
			
			// if necessary we need to parse the incoming attributes
			attrs = attrs? parse? this.parse(attrs): attrs: null;
			
			// ensure we have the updated attributes
			this.attributes = this.attributes? defaults? mixin({}, [defaults, this.attributes]): clone(this.attributes): defaults? clone(defaults): {};
			attrs && mixin(this.attributes, attrs);
			this.previous = clone(this.attributes);
			
			// now we need to ensure we have a store and register with it
			this.store = this.store || enyo.store;
			
			// @TODO: The idea here is that when batch instancing records a collection
			// should be intelligent enough to avoid doing each individually or in some
			// cases it may be useful to have a record that is never added to a store?
			if (!noAdd) this.store.add(this, opts);
			
			commit && this.commit();
			fetch && this.fetch();
		},
		
		/**
			@private
		*/
		emit: inherit(function (sup) {
			return function (e, props) {
				if (e == 'change' && props && this.isObserving()) {
					for (var key in props) this.notify(key, this.previous[key], props[key]);
				}
				return sup.apply(this, arguments);
			};
		}),
		
		/**
			@private
		*/
		triggerEvent: function () {
			return this.emit.apply(this, arguments);
		},
		/**
			@private
			@method
		*/
		onFetch: function (res, opts) {
			console.log('enyo.Model.onFetch', arguments);
			
			this.isNew = false;
			
			if (this.options.parse) res = this.parse(res);
			this.set(res);
		},
		
		/**
			@private
			@method
		*/
		onCommit: function () {
			console.log('enyo.Model.onCommit', arguments);
			
			this.isDirty = false;
		},
		
		/**
			@private
		*/
		onError: function () {
			console.log('enyo.Model.onError', arguments);
		}
	});
	
	/**
		@private
		@static
	*/
	Model.concat = function (ctor, props) {
		var proto = ctor.prototype || ctor;
		
		if (props.options) {
			proto.options = mixin({}, [proto.options, props.options]);
			delete props.options;
		}
	};
	
	/**
		@private
	*/
	enyo.kind.features.push(function (ctor) {
		if (ctor.prototype instanceof Model) {
			!enyo.store.models[ctor.prototype.kindName] && (enyo.store.models[ctor.prototype.kindName] = new ModelList());
		}
	});

})(enyo);
