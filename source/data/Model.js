(function (enyo) {
	
	var kind = enyo.kind
		, mixin = enyo.mixin
		, clone = enyo.clone
		, only = enyo.only
		, isFunction = enyo.isFunction
		, uid = enyo.uid
		, inherit = enyo.inherit;
		
	var ObserverSupport = enyo.ObserverSupport
		, ComputedSupport = enyo.ComputedSupport
		, BindingSupport = enyo.BindingSupport
		, EventEmitter = enyo.EventEmitter
		, ModelList = enyo.ModelList
		, Source = enyo.Source
		, oObject = enyo.Object;
		
	/**
	*/
	var STATES = {
		
		/**
		*/
		NEW: 0x01,
		
		/**
		*/
		DIRTY: 0x02,
		
		/**
		*/
		CLEAN: 0x04,
		
		/**
		*/
		READY: 0x01 | 0x02 | 0x04,
		
		/**
		*/
		FETCHING: 0x08,
		
		/**
		*/
		COMMITTING: 0x10,
		
		/**
		*/
		BUSY: 0x08 | 0x10,
		
		/**
		*/
		ERROR_COMMITTING: 0x20,
		
		/**
		*/
		ERROR_FETCHING: 0x40,
		
		/**
		*/
		ERROR_UNKNOWN: 0x80,
		
		/**
		*/
		DESTROYED: 0x100,
		
		/**
		*/
		ERROR: 0x20 | 0x40 | 0x80
	};
	
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
		status: STATES.NEW | STATES.CLEAN,
		
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
			var options,
				source,
				it = this;
			
			// if the current status is not one of the error states we can continue
			if (this.status & ~(STATES.ERROR | STATES.BUSY)) {
				
				// if there were options passed in we copy them quickly so that we can hijack
				// the success and error methods while preserving the originals to use later
				options = opts ? enyo.clone(opts, true) : {};
				
				// make sure we keep track of how many sources we're requesting
				source = options.source || this.source;
				if (source && ((source instanceof Array) || source === true)) {
					this._waiting = source.length ? source.slice() : Object.keys(enyo.sources);
				}
					
				options.success = function (source, res) {
					it.onCommit(opts, res, source);
				};
				
				options.error = function (source, res) {
					it.onError('COMMITTING', opts, res, source);
				};
				
				// set the state
				this.status = this.status | STATES.COMMITTING;
				
				// now pass this on to the source to execute as it sees fit
				Source.execute('commit', this, options);
			} else this.onError(this.status, opts);
			
			return this;
		},
		
		/**
			@public
			@method
		*/
		fetch: function (opts) {
			var options,
				source,
				it = this;
				
			// if the current status is not one of the error states we can continue
			if (this.status & ~(STATES.ERROR | STATES.BUSY)) {
				
				// if there were options passed in we copy them quickly so that we can hijack
				// the success and error methods while preserving the originals to use later
				options = opts ? enyo.clone(opts, true) : {};
				
				// make sure we keep track of how many sources we're requesting
				source = options.source || this.source;
				if (source && ((source instanceof Array) || source === true)) {
					this._waiting = source.length ? source.slice() : Object.keys(enyo.sources);
				}
				
				options.success = function (source, res) {
					it.onFetch(opts, res, source);
				};
				
				options.error = function (source, res) {
					it.onError('FETCHING', opts, res, source);
				};
				
				// set the state
				this.status = this.status | STATES.FETCHING;
				
				// now pass this on to the source to execute as it sees fit
				Source.execute('fetch', this, options);
			} else this.onError(this.status, opts);
			
			return this;
		},
		
		/**
			@public
			@method
		*/
		destroy: function (opts) {
			var options,
				it = this;
			
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
				options = opts ? enyo.clone(opts, true) : {};
					
				options.success = function (source, res) {
					// continue the operation this time with commit false explicitly
					it.destroy({commit: false});
					if (opts && opts.success) opts.success(this, opts, res, source);
				};
				
				options.error = function (source, res) {
					// @todo
				};
				
				Source.execute('destroy', this, options);
				return this;
			}
			
			
			// we flag this early so objects that receive an event and process it
			// can optionally check this to support faster cleanup in some cases
			// e.g. Collection/Store don't need to remove listeners because it will
			// be done in a much quicker way already
			this.destroyed = true;
			this.status = STATES.DESTROYED;
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
				
				var attrs = this.attributes,
					options = this.options,
					changed,
					incoming,
					force,
					silent,
					key,
					value,
					commit,
					fetched;
				
				// the default case for this setter is accepting an object of key->value pairs
				// to apply to the model in which case the second parameter is the optional
				// configuration hash
				if (typeof path == 'object') {
					incoming = path;
					opts = opts || is;
				}
				
				// otherwise in order to have a single path here we flub it so it will keep on
				// going as expected
				else {
					incoming = {};
					incoming[path] = is;
				}
				
				// to maintain backward compatibility with the old setters that allowed the third
				// parameter to be a boolean to indicate whether or not to force notification of
				// change even if there was any
				if (opts === true) {
					force = true;
					opts = {};
				}
		
				opts = opts ? enyo.mixin({}, [options, opts]) : options;
				silent = opts.silent;
				force = force || opts.force;
				commit = opts.commit;
				fetched = opts.fetched;
		
				for (key in incoming) {
					value = incoming[key];
			
					if (value !== attrs[key] || force) {
						// to ensure we have an object to work with
						// note that we check inside this loop so we don't have to examine keys
						// later only the local variable changed
						changed = this.changed || (this.changed = {});
						changed[key] = attrs[key] = value;
					}
				}
		
				if (changed) {
					
					// we add dirty as a value of the status but clear the CLEAN bit if it
					// was set - this would allow it to be in the ERROR state and NEW and DIRTY
					if (!fetched) this.status = (this.status | STATES.DIRTY) ^ STATES.CLEAN;
					
					if (!silent) this.emit('change', changed, this);
				
					if (commit && !fetched) this.commit(opts);
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
			@public
		*/
		onFetch: function (opts, res, source) {
			var idx;
			
			if (this._waiting) {
				idx = this._waiting.findIndex(function (ln) {
					return (ln instanceof Source ? ln.name : ln) == source;
				});
				if (idx > -1) this._waiting.splice(idx, 1);
				if (!this._waiting.length) this._waiting = null;
			}
			
			// ensure we have an options hash and it knows it was just fetched
			opts = opts ? opts : {};
			opts.fetched = true;
			
			// note this will not add the DIRTY state because it was fetched but also note that it
			// will not clear the DIRTY flag if it was already DIRTY
			if (res) this.set(res, opts);
			
			// clear the FETCHING and NEW state (if it was NEW) we do not set it as dirty as this
			// action alone doesn't warrant a dirty flag that would need to be set in the set method
			if (!this._waiting) this.status = this.status ^ (STATES.FETCHING | STATES.NEW);
			
			// now look for an additional success callback
			if (opts && opts.success) opts.success(this, opts, res, source);
		},
		
		/**
			@public
		*/
		onCommit: function (opts, res, source) {
			var idx;
			
			if (this._waiting) {
				idx = this._waiting.findIndex(function (ln) {
					return (ln instanceof Source ? ln.name : ln) == source;
				});
				if (idx > -1) this._waiting.splice(idx, 1);
				if (!this._waiting.length) this._waiting = null;
			}
			
			if (!this._waiting) {
				// we need to clear the COMMITTING bit and DIRTY bit as well as ensure that the
				// 'previous' hash is whatever the current attributes are
				this.previous = enyo.clone(this.attributes, true);
				this.status = (this.status | STATES.CLEAN) ^ (STATES.COMMITTING | STATES.DIRTY);
			}
			
			if (opts && opts.success) opts.success(this, opts, res, source);			
		},
		
		/**
			@public
		*/
		onError: function (action, opts, res, source) {
			var stat;
			
			// if the error action is a status number then we don't need to update it otherwise
			// we set it to the known state value
			if (typeof action == 'string') {
				
				// all built-in errors will pass this as their values are > 0 but we go ahead and
				// ensure that no developer used the 0x00 for an error code
				stat = STATES['ERROR_' + action];
			} else stat = action;
			
			if (isNaN(stat) || (stat & ~STATES.ERROR)) stat = STATES.ERROR_UNKNOWN;
			
			// if it has changed give observers the opportunity to respond
			this.status = stat;
			
			// we need to check to see if there is an options handler for this error
			if (opts && opts.error) opts.error(this, action, opts, res);
		}
	});
	
	/**
		@alias enyo.Model~STATES
		@static
		@public
	*/
	Model.STATES = STATES;
	
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
