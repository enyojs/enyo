(function (enyo, scope) {
	
	/**
	* A {@glossary mixin} designed to abstract interaction of the
	* [enyo.Object.get()]{@link enyo.Object#get} and
	* [enyo.Object.set()]{@link enyo.Object#set} methods. It does not need to be
	* applied to [subkinds]{@glossary subkind} of {@link enyo.Object}.
	* 
	* @mixin enyo.ProxyObject
	* @public
	*/
	enyo.ProxyObject = {
		
		/**
		* @private
		*/
		name: 'ProxyObject',
		
		/**
		* The property designated as the [object]{@glossary Object} from which to
		* proxy actions.
		* 
		* @type {String}
		* @default 'data'
		* @public
		*/
		proxyObjectKey: 'data',
		
		/**
		* The overloaded [getter]{@link enyo.Object#get}. Accepts the same
		* parameters and attempts to call the same method on the
		* [proxy]{@link enyo.ProxyObject.proxyObjectKey}. Returns `undefined` if it
		* cannot find a proxy.
		* 
		* @see enyo.Object.get
		* @see enyo.getPath
		* @param {String} path - The path from which to retrieve a value.
		* @returns {this} The value for the given path, or `undefined` if the path
		* could not be completely resolved.
		* @method
		* @public
		*/
		get: function (path) {
			var key = this.proxyObjectKey,
				proxy = this[key];
			
			if (proxy) {
				if (proxy.get) return proxy.get.apply(proxy, arguments);
				else return enyo.getPath.call(proxy, path);
			}
			
			return undefined;
		},
		
		/**
		* The overloaded [setter]{@link enyo.Object#set}. Accepts the same
		* parameters and attempts to call the same method on the
		* [proxy]{@link enyo.ProxyObject~proxyObjectKey}. Returns the callee for
		* chaining if it cannot find the proxy.
		* 
		* @param {String} path - The path for which to set the given value.
		* @param {*} is - The value to set.
		* @param {Object} [opts] - An options hash.
		* @returns {this} The callee for chaining.
		* @method
		* @public
		*/
		set: function (path, is, opts) {
			var key = this.proxyObjectKey,
				proxy = this[key],
				was,
				force;
			
			force = typeof opts == 'object' ? opts.force : opts;
			
			if (proxy) {
				was = this.get(path);
				if (proxy.set) proxy.set.apply(proxy, arguments);
				else enyo.setPath.apply(proxy, arguments);
				
				if (this.notify && (
					force ||
					was !== is ||
					(opts && opts.compare && opts.compare(was, is))
				)) this.notify(path, was, is);
			}
			
			return this;
		}
	};
	
})(enyo, this);