(function (enyo) {
	
	var kind = enyo.kind
		, only = enyo.only
		, mixin = enyo.mixin
		, inherit = enyo.inherit;
	
	var Source = enyo.Source;
	
	/**
		@public
		@class enyo.XHRSource
	*/
	var XHRSource = kind(
		/** @lends enyo.XHRSource.prototype */ {
		name: "enyo.XHRSource",
		kind: Source,
		noDefer: true,
		
		/**
			@public
		*/
		requestKind: null,
		
		/**
			@public
		*/
		urlRoot: "",
		
		/**
			@public
		*/
		defaultOptions: {
			cacheBust: false
		},
		
		/**
			@public
			@method
		*/
		buildUrl: function (model, opts) {
			var url = opts.url || (model.getUrl? model.getUrl(): model.url);
			
			// ensure there is a protocol defined
			if (!(/^(.*):\/\//.test(url))) {
				
				// it is assumed that if the url already included the protocol that it is
				// a complete url and not to be modified
				
				// however we need to determine relativity of the current domain or use a
				// specified root instead
				
				// if the url did not include the protocol but begins with a / we assume
				// it is intended to be relative to the origin of the domain
				if (url[0] == "/") url = urlDomain() + url;
				
				// if it doesn't then we check to see if the root was provided and we would
				// use that instead of trying to determine it ourselves
				else url = (model.urlRoot || this.urlRoot || urlRoot()) + "/" + url;
			}
			return normalize(url);
		},
		
		/**
			@public
			@method
		*/
		go: function (opts) {
			var ctor = this.requestKind
				, defaults = this.defaultOptions
				, xhr, params, options;
				
			if (opts.params) {
				params = defaults.params? mixin({}, [defaults.params, opts.params]): opts.params;
			} else if (defaults.params) params = defaults.params;
			
			options = only(this.allowed, mixin({}, [defaults, opts]), true);
			xhr = new ctor(options);
			xhr.response(function (xhr, res) {
				if (opts.success) opts.success(res, xhr);
			});
			xhr.error(opts.error);
			xhr.go(params);
		},
		
		/**
			@public
			@method
		*/
		find: function (ctor, opts) {
			var proto = ctor.prototype
				, url = "/find/" + proto.kindName;
			
			opts.url = this.buildUrl(proto, opts);
			opts.method = opts.method || "POST";
			opts.postBody = opts.attributes;
			this.go(opts);
		},
		
		/**
			@public
		*/
		importProps: inherit(function (sup) {
			return function (props) {
				if (props.defaultOptions) XHRSource.concat(this, props);
				sup.call(this, props);
			};
		})
	});
	
	/**
		@private
	*/
	XHRSource.concat = function (ctor, props) {
		if (props.defaultOptions) {
			var proto = ctor.prototype || ctor;
			proto.defaultOptions = mixin({}, [proto.defaultOptions, props.defaultOptions]);
			delete props.defaultOptions;
		}
	};
	
	/**
		@private
	*/
	function urlDomain () {
		// @TODO: Come back to this as this is not always what we want...
		return location.origin;
	}
	
	/**
		@private
	*/
	function urlRoot () {
		var url = urlDomain()
			, path = location.pathname.split("/")
			, last = path[path.length-1];
		
		// we need to strip off any trailing filename that may be present in the pathname
		if (last) if (/\.[a-zA-Z0-9]+$/.test(last)) path = path.slice(0, -1);
		// if there were parts of a valid path we will append those to the domain otherwise
		// it will simply return the domain
		return (url += (path.length? "/" + path.join("/"): ""));
	}
	
	/**
		@private
	*/
	function normalize (url) {
		return url.replace(/([^:]\/)(\/+)/g, "$1");
	}
	
})(enyo);