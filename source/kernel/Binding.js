(function (enyo, scope) {
	
	var kind = enyo.kind;
	
	/**
	* All {@link enyo.Binding} instances are stored in this list and can be retrieved via the
	* {@link enyo.Binding.find} method using an {@link enyo.Binding#id} to identify it.
	*
	* @name enyo.bindings
	* @public
	*/
	var bindings = enyo.bindings = [];
	
	var DIRTY_FROM = 0x01
		, DIRTY_TO = 0x02;
	
	/**
	* Used to determine if an {@link enyo.Binding} is actually ready.
	*
	* @private
	*/
	function ready (binding) {
		var rdy = binding.ready;
		
		if (!rdy) {
			
			var from = binding.from || '',
				to = binding.to || '',
				source = binding.source,
				target = binding.target,
				owner = binding.owner,
				twoWay = !binding.oneWay,
				toTarget;
			
			if (typeof from != 'string') from = '';
			if (typeof to != 'string') to = '';
			
			if (!source) {
				
				// the worst case scenario here is for backward compatability purposes
				// we have to at least be able to derive the source via the from string
				if (from[0] == '^') {
					
					// this means we're reaching for a global
					from = from.slice(1);
					source = enyo.getPath.call(enyo.global, from);
					
				} else {
					source = owner;
				}
				
			}
			
			if (!target) {
				
				// same worst case as above, for backwards compatability purposes
				// we have to at least be able to derive the target via the to string
				if (to[0] == '^') {
					
					// this means we're reaching for a global
					to = to.slice(1);
					target = enyo.getPath.call(enyo.global, to);
				} else {
					target = owner;
				}
			}
			
			// we do this so we don't overwrite the originals in case we need to reset later
			binding._target = target;
			binding._source = source;
			binding._from = from[0] == '.'? from.slice(1): from;
			binding._to = to[0] == '.'? to.slice(1): to;
			
			if (!twoWay) {
				toTarget = binding._to.split('.');
				if (toTarget.length > 2) {
					toTarget.pop();
					binding._toTarget = toTarget.join('.');
				}
			}
			
			// now our sanitization
			rdy = !! (
				(source && (typeof source == 'object')) &&
				(target && (typeof source == 'object')) &&
				(from) &&
				(to)
			);
		}
		
		/*jshint -W093 */
		return (binding.ready = rdy);
		/*jshint +W093 */
	}

	/**
	* The details for an {@link enyo.Binding#transform} [function]{@link external:Function}, 
	* including the available parameters and how they can be used.
	* 
	* @callback enyo.Binding~Transform
	* @param {*} value The _value_ being synchronized.
	* @param {String} direction the _direction_ (a string matching either "source" or "target", 
	*	as in "going to the source").
	* @param {Object} binding A reference to the associated [binding]{@link enyo.Binding}. In cases 
	*	where the [binding]{@link enyo.Binding} should be interrupted and not 
	*	propagate the synchronization at all, call the _stop()_ method of 
	*	the passed-in [binding]{@link enyo.Binding} reference.
	*/
	
	/**
	* {@link enyo.Binding} is a mechanism used to keep properties synchronized. A 
	* [binding]{@link enyo.Binding} may be used to link two properties on different 
	* [objects]{@link external:Object}, or even two properties on the same 
	* [object]{@link external:Object}. Once a [binding]{@link enyo.Binding} has been established, it
	* will wait for change notifications; when a notification arrives, the 
	* [binding]{@link enyo.Binding} will synchronize the value between the two ends. Note that 
	* [bindings]{@link enyo.Binding} may be 
	* [one-way (the default) or two-way]{@link enyo.Binding#oneWay}.
	* 
	* Usually, you will not need to create {@link enyo.Binding} [objects]{@link external:Object} 
	* arbitrarily, but will instead rely on the public 
	* [BindingSupport API]{@link enyo.BindingSupport}, which is applied to 
	* [enyo.Object]{@link enyo.Object} and so is available on all of its 
	* [subkinds]{@link external:subkind}.
	* 
	* @class enyo.Binding
	* @public
	*/
	kind(
		/** @lends enyo.Binding.prototype */ {
		
		/**
		* @private
		*/
		name: 'enyo.Binding',
		
		/**
		* @private
		*/
		kind: null,
		
		/**
		* @private
		*/
		noDefer: true,
		
		/**
		* If a [binding]{@link enyo.Binding} is one-way, this flag should be `true` (the default). 
		* If this flag is set to `false`, the [binding]{@link enyo.Binding} will be two-way.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		oneWay: true,
		
		/**
		* If the [binding]{@link enyo.Binding} was able to resolve both ends (i.e., its 
		* [source]{@link enyo.Binding#source} and [target]{@link enyo.Binding#target} 
		* [objects]{@link external:Object}), this value will be `true`. Setting this manually will
		* have undesirable effects.
		*
		* @type {Boolean}
		* @default false
		* @public
		*/
		connected: false,
		
		/**
		* The _owner_ property is used extensively for various purposes within a 
		* [binding]{@link enyo.Binding}. One primary purpose is to serve as a root 
		* [object]{@link external:Object} from which to	search for its ends (the 
		* [source]{@link enyo.Binding#source} and/or [target]{@link enyo.Binding#target}). If the 
		* owner created the [binding]{@link enyo.Binding}, it will also be responsible for 
		* destroying it (automatically).
		*
		* @type {enyo.Object}
		* @default null
		* @public
		*/
		owner: null,
		
		/**
		* By default, a [binding]{@link enyo.Binding} will attempt to connect to both ends 
		* ([source]{@link enyo.Binding#source} and [target]{@link enyo.Binding#target}). If this 
		* process should be deferred, set this flag to `false`.
		*
		* @type {Boolean}
		* @default true
		* @public
		*/
		autoConnect: true,
		
		/**
		* By default, a [binding]{@link enyo.Binding} will attempt to synchronize its values from 
		* its [source]{@link enyo.Binding#source} to its [target]{@link enyo.Binding#target}. If 
		* this process should be deferred, set this flag to `false`.
		* 
		* @type {Boolean}
		* @default true
		* @public
		*/
		autoSync: true,
		
		/**
		* Set this only to a reference for an [object]{@link external:Object} to use as the _source_ 
		* for the [binding]{@link enyo.Binding}. If this is not a 
		* [bindable]{@link enyo.BindingSupport} [object]{@link external:Object}, the _source_ will 
		* be derived from the [from]{@link enyo.Binding#from} property during initialization.
		* 
		* @type {Object}
		* @default null
		* @public
		*/
		source: null,
		
		/**
		* Set this only to a reference for an [object]{@link external:Object} to use as the _target_
		* for the [binding]{@link enyo.Binding}. If this is not a 
		* [bindable]{@link enyo.BindingSupport} [object]{@link external:Object}, the _target_ will 
		* be derived from the [to]{@link enyo.Binding#to} property during initialization.
		* 
		* @type {Object}
		* @default null
		* @public
		*/
		target: null,
		
		/**
		* The _from_ property designates a path in which the property of the 
		* [source]{@link enyo.Binding#source} to bind from may be found. If the 
		* [source]{@link enyo.Binding#source} is explicitly provided and the path is relative (i.e.,
		* it begins with a "."), it is relative to the [source]{@link enyo.Binding#source}; 
		* otherwise, it is relative to the [owner]{@link enyo.Binding#owner} of the 
		* [binding]{@link enyo.Binding}. To have a [binding]{@link enyo.Binding} be evaluated from 
		* the global scope, prefix the path with a "^". If the [source]{@link enyo.Binding#source} 
		* and the "^" are used in tandem, the "^" will be ignored and the path will be assumed to be
		* relative to the provided [source]{@link enyo.Binding#source}.
		* 
		* @type {String}
		* @default null
		* @public
		*/
		from: null,
		
		/**
		* The _dirty_ property represents the changed value state of both the property designated by
		* the [from]{@link enyo.Binding#from} path and the property designated by the 
		* [to]{@link enyo.Binding#to} path.
		*
		* @type {Number}
		* @default enyo.Binding.DIRTY_FROM
		* @public
		*/
		dirty: DIRTY_FROM,
		
		/**
		* The _to_ property designates a path in which the property of the 
		* [target]{@link enyo.Binding#target} to bind from may be found. If the 
		* [target]{@link enyo.Binding#target} is explicitly provided and the path is relative (i.e.,
		* it begins with a "."), it is relative to the [target]{@link enyo.Binding#target}; 
		* otherwise, it is relative to the owner of the [binding]{@link enyo.Binding}. To have a 
		* [binding]{@link enyo.Binding} be evaluated from the global scope, prefix the path with a 
		* "^". If the [target]{@link enyo.Binding#target} and the "^" are used in tandem, the "^" 
		* will be ignored and the path will be assumed to be relative to the provided 
		* [target]{@link enyo.Binding#target}.
		* 
		* @type {String}
		* @default null
		* @public
		*/
		to: null,

		/**
		* Set this to a [function]{@link external:Function} or the name of a method on the 
		* [owner]{@link enyo.Binding#owner} of this [binding]{@link enyo.Binding}. The _transform_ 
		* is used to programmatically modify the value being synchronized. 
		* See {@link enyo.Binding~Transform} for detailed information on the parameters that are 
		* made available to _transform_.
		* 
		* @type {enyo.Binding~Transform}
		* @default null
		* @public
		*/
		transform: null,
		
		/**
		* Determine if the [binding]{@link enyo.Binding} is currently connected.
		*
		* @returns {Boolean} `true` if connected, `false` otherwise.
		* @public
		*/
		isConnected: function () {
			return this.connected;
		},
		
		/**
		* Will cause a single propagation attempt to fail. Typically not called outside the scope of
		* a [transform]{@link enyo.Binding#transform}.
		* 
		* @public
		*/
		stop: function () {
			this._stop = true;
		},
		
		/**
		* Determines whether the [binding]{@link enyo.Binding} is actually ready.
		* 
		* @returns {Boolean} `true if ready, `false otherwise.
		* @public
		*/
		isReady: function () {
			return this.ready || ready(this);
		},
		
		/**
		* Resets all properties to their original state.
		* 
		* @returns {this} The callee for chaining.
		* @public
		*/
		reset: function () {
			this.disconnect();
			this.ready = null;
			this._source = this._target = this._to = this._from = this._toTarget = null;
			return this;
		},
		
		/**
		* Rebuilds the entire [binding]{@link enyo.Binding}. Will synchronize if it is able to 
		* connect and the [autoSync]{@link enyo.Binding#autoSync} flag is `true`.
		* 
		* @returns {this} The callee for chaining.
		* @public
		*/
		rebuild: function () {
			return this.reset().connect();
		},
		
		/**
		* Connects the ends (i.e., the [source]{@link enyo.Binding#source} and 
		* [target]{@link enyo.Binding#target}) of the [binding]{@link enyo.Binding}. While you 
		* typically won't need to call this method, it is safe to call even when the ends are 
		* already established. Note that if one or both of the ends does become connected and the 
		* [autoSync]{@link enyo.Binding#autoSync} flag is `true`, the ends will automatically be 
		* synchronized.
		* 
		* @returns {this} The callee for chaining.
		* @public
		*/
		connect: function () {
			if (!this.isConnected()) {
				if (this.isReady()) {
					this._source.observe(this._from, this._sourceChanged, this, {priority: true});
					
					// for two-way bindings we register to observe changes
					// from the target
					if (!this.oneWay) this._target.observe(this._to, this._targetChanged, this);
					else if (this._toTarget) {
						this._target.observe(this._toTarget, this._toTargetChanged, this, {priority: true});
					}
					
					// we flag it as having been connected
					this.connected = true;
					if (this.autoSync) this.sync(true);
				}
			}
			
			return this;
		},
		
		/**
		* Disconnects from the ends (i.e., the [source]{@link enyo.Binding#source} and 
		* [target]{@link enyo.Binding#target}) if a connection exists at either end. This method 
		* will most likely not need to be called directly.
		* 
		* @returns {this} The callee for chaining.
		* @public
		*/
		disconnect: function () {
			if (this.isConnected()) {
				this._source.unobserve(this._from, this._sourceChanged, this);
				
				// for two-way bindings we unregister the observer from
				// the target as well
				if (!this.oneWay) this._target.unobserve(this._to, this._targetChanged, this);
				else if (this._toTarget) {
					this._target.unobserve(this._toTarget, this._toTargetChanged, this);
				}
				
				this.connected = false;
			}
			
			return this;
		},
		
		/**
		* Synchronizes values from the [source]{@link enyo.Binding#source} to the 
		* [target]{@link enyo.Binding#target}. This usually will not need to be called manually. 
		* [Two-way bindings]{@link enyo.Binding#oneWay} will automatically synchronize from the 
		* [target]{@link enyo.Binding#target} end once they are connected.
		* 
		* @returns {this} The callee for chaining.
		* @public
		*/
		sync: function (force) {
			var source = this._source,
				target = this._target,
				from = this._from,
				to = this._to,
				xform = this.getTransform(),
				val;
			
			if (this.isReady() && this.isConnected()) {
					
				switch (this.dirty || (force && DIRTY_FROM)) {
				case DIRTY_TO:
					val = target.get(to);
					if (xform) val = xform.call(this.owner || this, val, DIRTY_TO, this);
					if (!this._stop) source.set(from, val, {create: false});
					break;
				case DIRTY_FROM:
					
				// @TODO: This should never need to happen but is here just in case
				// it is ever arbitrarily called not having been dirty?
				// default:
					val = source.get(from);
					if (xform) val = xform.call(this.owner || this, val, DIRTY_FROM, this);
					if (!this._stop) target.set(to, val, {create: false});
					break;
				}
				this.dirty = null;
				this._stop = null;
			}
			
			return this;
		},
		
		/**
		* Releases all of the [binding's]{@link enyo.Binding} parts and unregisters its 
		* [observers]{@link enyo.ObserverSupport}. Typically, this method will not need to be called 
		* directly unless the [binding]{@link enyo.Binding} was created without an 
		* [owner]{@link enyo.Binding#owner}.
		* 
		* @returns {this} The callee for chaining.
		* @public
		*/
		destroy: function () {
			var owner = this.owner,
				idx;
			
			this.disconnect();
			this.owner = null;
			this.source = this._source = null;
			this.target = this._target = null;
			this.ready = null;
			this.destroyed = true;
			
			// @todo: remove me or postpone operation?
			idx = bindings.indexOf(this);
			if (idx > -1) bindings.splice(idx, 1);
			
			if (owner && !owner.destroyed) owner.removeBinding(this);
			
			return this;
		},
		
		/**
		* @private
		*/
		getTransform: function () {
			return this._didInitTransform ? this.transform : (function (bnd) {
				bnd._didInitTransform = true;
				
				var xform = bnd.transform,
					owner = bnd.owner,
					xformOwner = owner && owner.bindingTransformOwner;
				
				if (xform) {
					if (typeof xform == 'string') {
						if (xformOwner && xformOwner[xform]) {
							xform = xformOwner[xform];
						} else if (owner && owner[xform]) {
							xform = owner[xform];
						} else {
							xform = enyo.getPath(xform);
						}
					}
					
					/*jshint -W093 */
					return (bnd.transform = (typeof xform == 'function' ? xform : null));
					/*jshint +W093 */
				}
			})(this);
		},
		
		/**
		* @private
		*/
		constructor: function (props) {
			bindings.push(this);
			
			if (props) enyo.mixin(this, props);
			
			if (!this.euid) this.euid = enyo.uid('b');
			if (this.autoConnect) this.connect();
		},
		
		/**
		* @private
		*/
		_sourceChanged: function (was, is, path) {
			// @TODO: Should it...would it benefit from using these passed in values?
			this.dirty = this.dirty == DIRTY_TO ? null : DIRTY_FROM;
			return this.dirty == DIRTY_FROM && this.sync();
		},
		
		/**
		* @private
		*/
		_targetChanged: function (was, is, path) {
			// @TODO: Same question as above, it seems useful but would it affect computed
			// properties or stale values?
			this.dirty = this.dirty == DIRTY_FROM ? null : DIRTY_TO;
			return this.dirty == DIRTY_TO && this.sync();
		},
		
		/**
		* @private
		*/
		_toTargetChanged: function (was, is, path) {
			this.dirty = DIRTY_FROM;
			this.reset().connect();
		}
	});
	
	/**
	* Retrieve a [binding]{@link enyo.Binding} by its global id.
	*
	* @param {String} euid The [Enyo global id]{@link external:EUID} by which to retrieve a 
	*	[binding]{@link enyo.Binding}.
	* @returns {enyo.Binding|undefined} A reference to the [binding]{@link enyo.Binding} if the id 
	*	is found; otherwise, it will return 
	*	[undefined]{@link external:undefined}.
	* 
	* @static
	* @public
	*/
	enyo.Binding.find = function (euid) {
		return bindings.find(function (ln) {
			return ln.euid == euid;
		});
	};
	
	/**
	* Possible value of the [dirty]{@link enyo.Binding#dirty} property representing that the value 
	* of [binding source]{@link enyo.Binding#source} has changed.
	* 
	* @static
	* @public
	*/
	enyo.Binding.DIRTY_FROM = DIRTY_FROM;
	
	/**
	* Possible value of the [dirty]{@link enyo.Binding#dirty} property representing that the value 
	* of [binding target]{@link enyo.Binding#target} has changed.
	* 
	* @static
	* @public
	*/
	enyo.Binding.DIRTY_TO = DIRTY_TO;
	
	/**
	* The default [kind]{@link external:kind} that provides [binding]{@link enyo.Binding} 
	* functionality.
	* 
	* static
	* public
	*/
	enyo.defaultBindingKind = enyo.Binding;
	
})(enyo, this);