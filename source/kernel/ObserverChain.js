(function (enyo, scope) {
	
	var kind = enyo.kind;
		
	var LinkedList = enyo.LinkedList
		, LinkedListNode = enyo.LinkedListNode;
	
	function get (base, prop) {
		return base && /*isObject(base)*/ (typeof base == 'object')? (
			base.get? base.get(prop): base[prop]
		): undefined;
	}
	
	/**
	* An internally used {@glossary kind}.
	*
	* @class enyo.ObserverChainNode
	* @extends enyo.LinkedListNode
	* @private
	*/
	var ObserverChainNode = kind(
		/** @lends enyo.ObserverChainNode.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.ObserverChainNode',

		/**
		* @private
		*/
		kind: LinkedListNode,

		/**
		* @private
		*/
		noDefer: true,
		
		/**
		* @method
		* @private
		*/
		constructor: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				this.connect();
			};
		}),
		
		/**
		* @method
		* @private
		*/
		destroy: enyo.inherit(function (sup) {
			return function () {
				this.disconnect();
				sup.apply(this, arguments);
				this.observer = null;
				this.list = null;
				this.object = null;
			};
		}),
		
		/**
		* @private
		*/
		connect: function () {
			var obj = this.object
				, obs = this._changed
				, prop = this.property;
			if (obj) {
				if (obj.observe) obj.observe(prop, obs, this, {noChain: true, priority: true});
				this.connected = true;
				this.list.connected++;
			}
		},
		
		/**
		* @private
		*/
		disconnect: function () {
			var obj = this.object
				, obs = this._changed
				, prop = this.property
				, was = this.connected;
			obj && obj.unobserve && obj.unobserve(prop, obs, this);
			this.connected = null;
			if (was) this.list.connected--;
		},
		
		/**
		* @private
		*/
		setObject: function (object) {
			var cur = this.object
				, prop = this.property
				, was, is;
			
			if (cur !== object) {
				this.disconnect();
				this.object = object;
				this.connect();
				
				if (this.list.tail === this) {
					was = get(cur, prop);
					is = get(object, prop);
					// @TODO: It would be better to somehow cache values
					// such that it could intelligently derive the difference
					// without needing to continuously look it up with get
					was !== is && this.list.observed(this, was, is);
				}
			}
		},
		
		/**
		* @private
		*/
		_changed: function (was, is) {
			this.list.observed(this, was, is);
		}
	});
	
	/**
	* An internally used {@glossary kind}.
	*
	* @class enyo.ObserverChain
	* @extends enyo.LinkedList
	* @private
	*/
	kind(
		/** @lends enyo.ObserverChain.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.ObserverChain',

		/**
		* @private
		*/
		kind: LinkedList,

		/**
		* @private
		*/
		nodeKind: ObserverChainNode,

		/**
		* @private
		*/
		noDefer: true,
		
		/**
		* @private
		*/
		connected: 0,
		
		/**
		* @method
		* @private
		*/
		constructor: function (path, object) {
			this.object = object;
			this.path = path;
			this.parts = path.split('.');
			this.createChain();
		},
		
		/**
		* @method
		* @private
		*/
		destroy: enyo.inherit(function (sup) {
			return function () {
				sup.apply(this, arguments);
				this.object = null;
				this.parts = null;
				this.path = null;
			};
		}),
		
		/**
		* @private
		*/
		rebuild: function (target) {
			if (!this.rebuilding) {
				this.rebuilding = true;
				this.forward(function (node) {
					if (node !== this.head) {
						var src = node.prev.object
							, prop = node.prev.property;
						node.setObject(get(src, prop));
					}
				}, this, target);
				this.rebuilding = false;
			}
		},
		
		/**
		* @private
		*/
		isConnected: function () {
			return !! (this.connected === this.length && this.length);
		},
		
		/**
		* @private
		*/
		buildPath: function (target) {
			var str = '';
			
			this.backward(function (node) {
				str = node.property + (str? ('.' + str): str);
			}, this, target);
			
			return str;
		},
		
		/**
		* @private
		*/
		createChain: function () {
			var parts = this.parts
				, next = this.object
				, $ = false
				, node, prop;
				
			for (var i=0; (prop=parts[i]); ++i) {
				
			// forEach(parts, function (prop, idx) {
				// we create a special case for the $ hash property
				if (prop == '$') {
					$ = true;
				} else {
					// in cases where the chain has the $ property we arbitrarily
					// force it onto our current nodes property and let the special handling
					// in ObserverChainNode and ObserverSupport handle the rest
					$ && (prop = '$.' + prop);
					node = this.createNode({property: prop, object: next, list: this});
					this.appendNode(node);
					next = get(next, prop);
					$ = false;
				}
			// }, this);
			}
		},
		
		/**
		* @private
		*/
		observed: function (node, was, is) {
			this.object.stopNotifications();
			// @NOTE: About the following two cases, they are mutually exclusive and this seems perfect
			// that we don't see double notifications
			// @TODO: Only notify if it was the full property path? This is far more efficient after
			// testing but not as flexible...
			node === this.tail /*&& was !== is*/ && this.object.notify(this.buildPath(node), was, is);
			// @TODO: It seems the same case across the board that the rebuild only needs to take place
			// from the beginning to the second-to-last elem
			node !== this.tail && was !== is && this.rebuild(node);
			this.object.startNotifications();
		}
	});

})(enyo, this);
