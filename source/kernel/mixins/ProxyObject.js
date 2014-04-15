(function (enyo) {
	
	var getPath = enyo.getPath
		, checkConstructor = enyo.checkConstructor
		, inherit = enyo.inherit
		, getLocal = enyo.getLocal
		, setLocal = enyo.setLocal
		, setPath = enyo.setPath
		, isObject = enyo.isObject;
	
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
			
			return proxy? proxy.get? proxy.get.apply(proxy, arguments): getPath.call(proxy, path): undefined;
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
			force = isObject(opts)? opts.force: opts;
			
			if (proxy) {
				was = this.get(path);
				proxy.set? proxy.set.apply(proxy, arguments): setPath.apply(proxy, arguments);
				
				if (this.notify && (force || was !== is || (opts && opts.compare && opts.compare(was, is)))) this.notify(path, was, is);
			}
			
			return this;
		},
		
		/**
			@public
			@method
		*/
		getLocal: function (path) {
			return getPath.call(this, path);
		},
		
		/**
			@public
			@method
		*/
		setLocal: function (path, is, opts) {
			return setPath.call(this, path, is, opts);
		}
	};
	
})(enyo);