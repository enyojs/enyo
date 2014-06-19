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
		, Source = enyo.Source;
	
	/**
		The possible values assigned to {@link enyo.Model#status}. These codes can be extended
		when necessary to provide more detailed state control. See the inline documentation
		information and explanation associated with each individual state.
	
		Just a general note to developers exploring this implementation: these flags are HEX values
		representing the BINARY flag position (a 1 in a binary number that is unique). For
		additional information on using binary-flags and binary-operations see
		{@link http://www.experts-exchange.com/Programming/Misc/A_1842-Binary-Bit-Flags-Tutorial-and-Usage-Tips.html}
		or {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators}.
		
		Why is this information included here? Mostly for general reference in cases where there is
		a desire to extend the built-in flags to include additional flag. Understanding what they
		represent is the key to not having to do much more work to add another ERROR or BUSY state
		(for example). Additional flags need to start with the next unique power of 2 position
		(the value directly below the ellipses in the table below). Controlling state this way
		allows it to be in multiple states simulatenously (sometimes) and be updated without needing
		to modify existing code.
	
		Here is a table of the values, note that each flag position (in binary) represents a power
		of 2 so each flag has only 1 '1':
		
		HEX             DEC             BIN
		0x0001             1            0000 0000 0000 0001
		0x0002             2            0000 0000 0000 0010
		0x0004             4            0000 0000 0000 0100
		0x0008             8            0000 0000 0000 1000
		0x0010            16            0000 0000 0001 0000
		0x0020            32            0000 0000 0010 0000
		0x0040            64            0000 0000 0100 0000
		0x0080           128            0000 0000 1000 0000
		0x0100           256            0000 0001 0000 0000
		0x0200           512            0000 0010 0000 0000
		0x0400          1024            0000 0100 0000 0000
		0x0800          2048            0000 1000 0000 0000
	
		...
	
		0x1000          4096            0001 0000 0000 0000
		
		As a hint, converting (HEX) 0x0800 to DEC do:
			(0*16^3) + (8*16^2) + (0*16^1) + (0*16^0) = 2048
		
		As a hint, converting (HEX) 0x0800 to BIN do:
			0    8    0    0    (HEX)
			---- ---- ---- ----
			0000 1000 0000 0000 (BIN)
	
	
		@name enyo.Model~STATES
		@enum {number}
		@readonly
	*/
	var STATES = {};
		
	/**
		The {@link enyo.Model} was created by the application and exists only in the client.
		Successfully [fetching]{@link enyo.Model#fetch} (or [fetching]{@link enyo.Collection#fetch}
		from a {@link enyo.Collection}) will remove this flag. Also, successfully
		[committing]{@link enyo.Model#commit} (or [committing]{@link enyo.Collection#commit}
		from a {@link enyo.Collection}) will remove this flag.
	
		@name enyo.Model~STATES.NEW
		@type {enyo.Model~STATES}
	*/
	STATES.NEW = 0x0001;
		
	/**
		The {@link enyo.Model} has been modified locally and has not been (successfully)
		[committed]{@link enyo.Model#commit} (or {@link enyo.Collection#commit}). Once completed,
		this flag will be removed.
	
		@name enyo.Model~STATES.DIRTY
		@type {enyo.Model~STATES}
	*/
	STATES.DIRTY = 0x0002;
		
	/**
		The {@link enyo.Model} is either {@link enyo.Model~STATES.NEW} or it was
		{@link enyo.Model~STATES.DIRTY} after a local modification and then successfully
		[committed]{@link enyo.Model#commit} (or {@link enyo.Collection#commit}). This flag is set
		by default on new [models]{@link enyo.Model}.
	
		@name enyo.Model~STATES.CLEAN
		@type {enyo.Model~STATES}
	*/
	STATES.CLEAN = 0x0004;
	
	/**
		The final state of an {@link enyo.Model} once its {@link enyo.Model#destroy}
		method has successfully completed. This is an exclusive state.
	
		@name enyo.Model~STATES.DESTROYED
		@type {enyo.Model~STATES.DESTROYED}
	*/
	STATES.DESTROYED = 0x0008;
		
	/**
		The {@link enyo.Model} is currently attempting to {@link enyo.Model#fetch}.
		
		@name enyo.Model~STATES.FETCHING
		@type {enyo.Model~STATES}
	*/
	STATES.FETCHING = 0x0010;
		
	/**
		The {@link enyo.Model} is currently attempting to {@link enyo.Model#commit}.
		
		@name enyo.Model~STATES.COMMITTING
		@type {enyo.Model~STATES}
	*/
	STATES.COMMITTING = 0x0020;
		
	/**
		The {@link enyo.Model} is currently attempting to {@link enyo.Model#destroy}.
	
		@name enyo.Model~STATES.DESTROYING
		@type {enyo.Model~STATES}
	*/
	STATES.DESTROYING = 0x0080;
		
	/**
		The {@link enyo.Model} has encountered an error during a {@link enyo.Model#commit} attempt.
	
		@name enyo.Model~STATES.ERROR_COMMITTING
		@type {enyo.Model~STATES}
	*/
	STATES.ERROR_COMMITTING = 0x0100;
		
	/**
		The {@link enyo.Model} has encountered an error during a {@link enyo.Model#fetch} attempt.
		
		@name enyo.Model~STATES.ERROR_FETCHING
		@type {enyo.Model~STATES}
	*/
	STATES.ERROR_FETCHING = 0x0200;
		
	/**
		The {@link enyo.Model} has encountered an error during a {@link enyo.Model#destroy} attempt.
		
		@name enyo.Model~STATES.ERROR_DESTROYING
		@type {enyo.Model~STATES}
	*/
	STATES.ERROR_DESTROYING = 0x0400;
		
	/**
		The {@link enyo.Model} has somehow encountered an error that it does not understand
		so it uses this state.
	
		@name enyo.Model~STATES.ERROR_UNKNOWN
		@type {enyo.Model~STATES}
	*/
	STATES.ERROR_UNKNOWN = 0x0800;
	
	/**
		This is a multi-state mask and will never be set explicitly. By default it can be used to
		determine if the {@link enyo.Model} is [fetching]{@link enyo.Model#fetch},
		[committing]{@link enyo.Model#commit} or [destroying]{@link enyo.Model#destroy}.
		You can add states to this mask by OR'ing them. {@see enyo.Model#isBusy} for an easy
		way to determine if the {@link enyo.Model} is actually busy without having to use
		bitwise operations.
	
		@name enyo.Model~STATES.BUSY
		@type {enyo.Model~STATES}
	*/
	STATES.BUSY = STATES.FETCHING | STATES.COMMITTING | STATES.DESTROYING;
	
	/**
		This is a multi-state mask and will never be set explicitly. By default it can be used to
		determine if the {@link enyo.Model} has encountered an error while
		[fetching]{@link enyo.Model#fetch}, [committing]{@link enyo.Model#commit} or
		[destroying]{@link enyo.Model#destroy}. There is also the
		[unknown error]{@link enyo.Model~STATES.ERROR_UNKNOWN} state that is included in this
		mask. Additional error states can be added by OR'ing them. {@see enyo.Model#isError}
		for an easy way to determine if the {@link enyo.Model} is actually in an error state.
		
		@name enyo.Model~STATES.ERROR
		@type {enyo.Model~STATES}
	*/
	STATES.ERROR = STATES.ERROR_FETCHING | STATES.ERROR_COMMITTING | STATES.ERROR_DESTROYING | STATES.ERROR_UNKNOWN;
	
	/**
		This is a multi-state mask and will never be set explicitly. By default, it can be used to
		verify that an {@link enyo.Model} is not in an [error state]{@link enyo.Model~STATES.ERROR}
		or a [busy state]{@link enyo.Model~STATES.BUSY}. {@see enyo.Model#isReady} for an easy way
		to determine if the {@link enyo.Model} is actually _ready_ without having to use bitwise
		operations.
	
		@name enyo.Model~STATES.READY
		@type {enyo.Model~STATES}
	*/
	STATES.READY = ~(STATES.BUSY | STATES.ERROR);
	
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
			
			// we ensure that the property is forcibly notified (when possible) to ensure that
			// bindings or other observers will know it returned to that value
			if (prop) this.set(prop, this.previous[prop], {force: true});
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
			
			// if the current status is not one of the error or busy states we can continue
			if (!(this.status & (STATES.ERROR | STATES.BUSY))) {
				
				// if there were options passed in we copy them quickly so that we can hijack
				// the success and error methods while preserving the originals to use later
				options = opts ? enyo.clone(opts, true) : {};
				
				// make sure we keep track of how many sources we're requesting
				source = options.source || this.source;
				if (source && ((source instanceof Array) || source === true)) {
					this._waiting = source.length ? source.slice() : Object.keys(enyo.sources);
				}
					
				options.success = function (source, res) {
					it.committed(opts, res, source);
				};
				
				options.error = function (source, res) {
					it.errored('COMMITTING', opts, res, source);
				};
				
				// set the state
				this.status = this.status | STATES.COMMITTING;
				
				// now pass this on to the source to execute as it sees fit
				Source.execute('commit', this, options);
			} else this.errored(this.status, opts);
			
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
				
			// if the current status is not one of the error or busy states we can continue
			if (!(this.status & (STATES.ERROR | STATES.BUSY))) {
				
				// if there were options passed in we copy them quickly so that we can hijack
				// the success and error methods while preserving the originals to use later
				options = opts ? enyo.clone(opts, true) : {};
				
				// make sure we keep track of how many sources we're requesting
				source = options.source || this.source;
				if (source && ((source instanceof Array) || source === true)) {
					this._waiting = source.length ? source.slice() : Object.keys(enyo.sources);
				}
				
				options.success = function (source, res) {
					it.fetched(opts, res, source);
				};
				
				options.error = function (source, res) {
					it.errored('FETCHING', opts, res, source);
				};
				
				// set the state
				this.status = this.status | STATES.FETCHING;
				
				// now pass this on to the source to execute as it sees fit
				Source.execute('fetch', this, options);
			} else this.errored(this.status, opts);
			
			return this;
		},
		
		/**
			@public
			@method
		*/
		destroy: function (opts) {
			var options = opts ? enyo.mixin({}, [this.options, opts]) : this.options,
				it = this,
				idx;
		
			// this becomes an (potentially) async operation if we are committing this destroy
			// to a source and its kind of tricky to figure out because there are several ways
			// it could be flagged to do this
		
			if (options.commit || options.source) {
				
				// if the current status is not one of the error states we can continue
				if (!(this.status & (STATES.ERROR | STATES.BUSY))) {
				
					// remap to the originals
					options = opts ? enyo.clone(opts, true) : {};
				
					options.success = function (source, res) {
				
						if (it._waiting) {
							idx = it._waiting.findIndex(function (ln) {
								return (ln instanceof Source ? ln.name : ln) == source;
							});
							if (idx > -1) it._waiting.splice(idx, 1);
							if (!it._waiting.length) it._waiting = null;
						}
				
						// continue the operation this time with commit false explicitly
						if (!it._waiting) {
							options.commit = options.source = null;
							it.destroy(options);
						}
						if (opts && opts.success) opts.success(this, opts, res, source);
					};
			
					options.error = function (source, res) {
				
						if (it._waiting) {
							idx = it._waiting.findIndex(function (ln) {
								return (ln instanceof Source ? ln.name : ln) == source;
							});
							if (idx > -1) it._waiting.splice(idx, 1);
							if (!it._waiting.length) it._waiting = null;
						}
				
						// continue the operation this time with commit false explicitly
						if (!it._waiting) {
							options.commit = options.source = null;
							it.destroy(options);
						}
				
						// we don't bother setting the error state if we aren't waiting because it
						// will be cleared to DESTROYED and it would be pointless
						else this.errored('DESTROYING', opts, res, source);
					};
				
					this.status = this.status | STATES.DESTROYING;
			
					Source.execute('destroy', this, options);
				} else if (this.status & STATES.ERROR) this.errored(this.status, opts);
				
				// we don't allow the destroy to take place and we don't forcibly break-down
				// the collection errantly so there is an opportuniy to resolve the issue
				// before we lose access to the collection's content!
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
		},
		
		/**
			@public
			@method
		*/
		get: function (path) {
			return this.isComputed(path) ? this._getComputed(path) : this.attributes[path];
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
					if (!fetched) this.status = (this.status | STATES.DIRTY) & ~STATES.CLEAN;
					
					if (!silent) this.emit('change', changed, this);
				
					if (commit && !fetched) this.commit(opts);
				}
			}
		},
		
		/**
			@private
			@method
		*/
		_getComputed: ComputedSupport.get.fn(function () { return undefined; }),
		
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
		fetched: function (opts, res, source) {
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
			if (!this._waiting) this.status = this.status & ~(STATES.FETCHING | STATES.NEW);
			
			// now look for an additional success callback
			if (opts && opts.success) opts.success(this, opts, res, source);
		},
		
		/**
			@public
		*/
		committed: function (opts, res, source) {
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
				this.status = (this.status | STATES.CLEAN) & ~(STATES.COMMITTING | STATES.DIRTY);
			}
			
			if (opts && opts.success) opts.success(this, opts, res, source);			
		},
		
		/**
			@public
		*/
		errored: function (action, opts, res, source) {
			var stat;
			
			// if the error action is a status number then we don't need to update it otherwise
			// we set it to the known state value
			if (typeof action == 'string') {
				
				// all built-in errors will pass this as their values are > 0 but we go ahead and
				// ensure that no developer used the 0x00 for an error code
				stat = STATES['ERROR_' + action];
			} else stat = action;
			
			if (isNaN(stat) || (stat & ~STATES.ERROR)) stat = STATES.ERROR_UNKNOWN;
			
			// correctly set the current status and ensure we clear any busy flags
			this.status = (this.status | stat) & ~STATES.BUSY;
			
			// we need to check to see if there is an options handler for this error
			if (opts && opts.error) opts.error(this, action, opts, res, source);
		},
		
		/**
			@method
			@public
		*/
		clearError: function () {
			this.status = this.status & ~STATES.ERROR;
		},
		
		/**
			Convenience method to avoid using bitwise comparison directly for the
			{@link enyo.Collection#status}. Automatically checks the current
			{@link enyo.Collection#status} or the passed-in value to determine if it is an
			[error state]{@link enyo.Collection~STATES.ERROR}. The passed-in value will only be
			used if it is a numeric value.
		
			@param {enyo.Collection~STATES} [status] Provide a specific value to test.
			@returns {boolean} Whether or not the given status is an error.
			@method
			@public
		*/
		isError: function (status) {
			return !! ((isNaN(status) ? this.status : status) & STATES.ERROR);
		},
		
		/**
			Convenience method to avoid using bitwise comparison directly for the
			{@link enyo.Collection#status}. Automatically check the current
			{@link enyo.Collection#status} or the passed-in value to determine if it is a
			[busy state]{@link enyo.Collection~STATES.BUSY}. The passed-in value will only be
			used if it is a numeric value.
		*/
		isBusy: function (status) {
			return !! ((isNaN(status) ? this.status : status) & STATES.BUSY);
		},
		
		/**
			Convenience method to avoid using bitwise comparison directly for the
			{@link enyo.Collection#status}. Automatically check the current
			{@link enyo.Collection#status} or the passed-in value to determine if it is a
			[ready state]{@link enyo.Collection~STATES.READY}. The passed-in value will only be
			used if it is a numeric value.
		*/
		isReady: function (status) {
			return !! ((isNaN(status) ? this.status : status) & STATES.READY);
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
