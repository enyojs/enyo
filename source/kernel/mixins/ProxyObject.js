(function (enyo) {
	
	/**
		This mixin is designed to abstract interaction of the _get()_/_set()_ methods. It allows
		a specific property to be named as the _proxy object_ {@link #proxyObjectKey}. The _proxy object_
		is the target object on which calls to _get()_/_set()_ will be made. It also adds convenience
		methods _getLocal()_/_setLocal()_ that will operate on the base object instance. There are usually
		limitations involved with using this mixin such as limited {@link Binding} or specific {@link Observer}
		support.
	
		@public
		@mixin enyo.ProxyObject
	*/
	enyo.ProxyObject = {
		name: "ProxyObject",
		
		/**
			@public
		*/
		proxyObjectKey: "data",
		
		/**
			@public
			@method
		*/
		get: function (path) {
			var key = this.proxyObjectKey
				, proxy = this[key];
			
			return proxy? proxy.get? proxy.get.apply(proxy, arguments): enyo.getPath.call(proxy, path): undefined;
		},
		
		/**
			@public
			@method
		*/
		set: function (path, is, opts) {
			var key = this.proxyObjectKey
				, proxy = this[key]
				, was, force;
			// for backwards compatibility
			force = enyo.isObject(opts)? opts.force: opts;
			
			if (proxy) {
				was = this.get(path);
				proxy.set? proxy.set.apply(proxy, arguments): enyo.setPath.apply(proxy, arguments);
				
				if (this.notify && (force || was !== is || (opts && opts.compare && opts.compare(was, is)))) this.notify(path, was, is);
			}
			
			return this;
		},
		
		/**
			@public
			@method
		*/
		getLocal: function (path) {
			return enyo.getPath.call(this, path);
		},
		
		/**
			@public
			@method
		*/
		setLocal: function (path, is, opts) {
			return enyo.setPath.call(this, path, is, opts);
		}
	};
	
})(enyo);