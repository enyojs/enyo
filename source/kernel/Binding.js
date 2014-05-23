/**
	@namespace enyo
*/
(function (enyo, scope) {
	
	var kind = enyo.kind;
	
	/**
		All {@link enyo.Binding} instances are stored in this list and can be retrieved via the
		{@link enyo.Binding~find} method using a {@link enyo.Binding#id} to identify it.
	
		@public
		@name enyo.bindings
		@memberof enyo
	*/
	var bindings = enyo.bindings = [];
	
	var DIRTY_FROM = 0x01,
		DIRTY_TO = 0x02;
	
	/**
		Used to determine if a {@link enyo.Binding} is actually ready.
	
		@private
	*/
	function ready (binding) {
		var rdy = binding.ready;
		
		if (!rdy) {
			
			var from = binding.from || '',
				to = binding.to || '',
				source = binding.source,
				target = binding.target,
				owner = binding.owner;
			
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
			
			binding.target = target;
			binding.source = source;
			binding.from = from[0] == '.'? from.slice(1): from;
			binding.to = to[0] == '.'? to.slice(1): to;
			
			// now our sanitation
			rdy = !! (
				(source && (typeof source == 'object')) &&
				(target && (typeof source == 'object')) &&
				(from) &&
				(to)
			);
		}
		
		return (binding.ready = rdy);
	}
	
	/**
		@public
		@class enyo.Binding
	*/
	kind(
		/** @lends enyo.Binding.prototype */ {
		
		/**
			@private
		*/
		name: 'enyo.Binding',
		
		/**
			@private
		*/
		kind: null,
		
		/**
			@private
		*/
		noDefer: true,
		
		/**
			@public
		*/
		oneWay: true,
		
		/**
			@public
		*/
		connected: false,
		
		/**
			@public
		*/
		owner: null,
		
		/**
			@public
		*/
		autoConnect: true,
		
		/**
			@public
		*/
		autoSync: true,
		
		/**
			@public
		*/
		source: null,
		
		/**
			@public
		*/
		target: null,
		
		/**
			@public
		*/
		from: null,
		
		/**
			@public
		*/
		dirty: DIRTY_FROM,
		
		/**
			@public
		*/
		to: null,
		
		/**
			@public
		*/
		transform: null,
		
		/**
			@public
			@method
		*/
		isConnected: function () {
			return this.connected;
		},
		
		/**
			@public
			@method
		*/
		stop: function () {
			this._stop = true;
		},
		
		/**
			@public
			@method
		*/
		isReady: function () {
			return this.ready || ready(this);
		},
		
		/**
			@public
			@method
		*/
		connect: function () {
			if (!this.isConnected()) {
				if (this.isReady()) {
					this.source.observe(this.from, this.onSource, this, {priority: true});
					
					// for two-way bindings we register to observe changes
					// from the target
					if (!this.oneWay) this.target.observe(this.to, this.onTarget, this);
					
					// we flag it as having been connected
					this.connected = true;
				}
			}
			
			return this;
		},
		
		/**
			@public
			@method
		*/
		disconnect: function () {
			if (this.isConnected()) {
				this.source.unobserve(this.from, this.onSource);
				
				// for two-way bindings we unregister the observer from
				// the target as well
				if (!this.oneWay) this.target.unobserve(this.to, this.onTarget, this);
				
				this.connected = false;
			}
			
			return this;
		},
		
		/**
			@public
			@method
		*/
		sync: function () {
			var source = this.source,
				target = this.target,
				from = this.from,
				to = this.to,
				xform = this.getTransform(),
				val;
			
			if (this.isConnected()) {
					
				switch (this.dirty) {
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
			@private
		*/
		getTransform: function () {
			return this._didInitTransform? this.transform: (function (bnd) {
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
					
					return (bnd.transform = (typeof xform == 'function' ? xform : null));
				}
			})(this);
		},
		
		/**
			@private
		*/
		constructor: function (props) {
			bindings.push(this);
			
			if (props) enyo.mixin(this, props);
			if (!this.euid) this.euid = enyo.uid('b');
			if (this.autoConnect) this.connect();
			if (this.autoSync) this.sync();
		},
		
		/**
			@public
			@method
			@returns {this} Callee for chaining.
		*/
		destroy: function () {
			var owner = this.owner;
			
			this.disconnect();
			this.owner = null;
			this.source = null;
			this.target = null;
			this.destroyed = true;
			
			// @todo: remove me or postpone operation?
			enyo.remove(this, bindings);
			
			if (owner && !owner.destroyed) owner.removeBinding(this);
			
			return this;
		},
		
		/**
			@private
		*/
		onSource: function (was, is, path) {
			// @TODO: Should it...would it benefit from using these passed in values?
			this.dirty = this.dirty == DIRTY_TO ? null : DIRTY_FROM;
			return this.dirty == DIRTY_FROM && this.sync();
		},
		
		/**
			@private
		*/
		onTarget: function (was, is, path) {
			// @TODO: Same question as above, it seems useful but would it affect computed
			// properties or stale values?
			this.dirty = this.dirty == DIRTY_FROM ? null : DIRTY_TO;
			return this.dirty == DIRTY_TO && this.sync();
		}
	});
	
	/**
		@public
		@static
		@method
	*/
	enyo.Binding.find = function (euid) {
		return bindings.find(function (ln) {
			return ln.euid == euid;
		});
	};
	
	/**
		@public
		@static
	*/
	enyo.Binding.DIRTY_FROM = DIRTY_FROM;
	
	/**
		@public
		@static
	*/
	enyo.Binding.DIRTY_TO = DIRTY_TO;
	
	/**
		@public
		@static
	*/
	enyo.defaultBindingKind = enyo.Binding;
	
})(enyo, this);