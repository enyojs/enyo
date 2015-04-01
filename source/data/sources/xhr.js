(function (enyo, scope) {
	
	var kind = enyo.kind;
	
	var Source = enyo.Source;
	
	/**
	* An abstract [kind]{@glossary kind} of [source]{@link enyo.Source} to be used for general
	* XHR-type functionality.
	*
	* @class enyo.XHRSource
	* @extends enyo.Source
	* @public
	*/
	var XHRSource = kind(
		/** @lends enyo.XHRSource.prototype */ {
		
		/**
		* @private
		*/
		name: 'enyo.XHRSource',
		
		/**
		* @private
		*/
		kind: Source,
		
		/**
		* @private
		*/
		noDefer: true,
		
		/**
		* The [kind]{@glossary kind} to use for requests. Should have the same API as
		* {@link enyo.Ajax} to use the built-in functionality.
		*
		* @type {Function}
		* @default null
		* @public
		*/
		requestKind: null,
		
		/**
		* If provided, will be prefixed to the URI [string]{@glossary String}. Used in
		* tandem with {@link enyo.Model.url} and {@link enyo.Collection.url} to build a
		* complete path.
		*
		* @type {String}
		* @default ''
		* @public
		*/
		urlRoot: '',
		
		/**
		* These options will be merged, first with [subkinds]{@glossary subkind}, and then
		* with any options passed to the various API methods of {@link enyo.XHRSource}. While the
		* options passed to the methods may include any properties, only properties found in
		* {@link enyo.AjaxProperties} will be merged and passed to the
		* [requestKind]{@link enyo.XHRSource#requestKind}.
		*
		* @see enyo.AjaxProperties
		* @type {Object}
		* @property {Boolean} cacheBust - Defaults to `false`.
		* @property {String} contentType - Defaults to `'application/json'`.
		* @public
		*/
		defaultOptions: {
			cacheBust: false,
			contentType: 'application/json'
		},
		
		/**
		* Used internally to resolve and build the URI [string]{@glossary String} for requests.
		* The derived url is based on the (optional) `opts` parameter's `url` property (if it
		* exists), or on the the `getUrl` and `url` properties of the
		* [model]{@link enyo.Model} or [collection]{@link enyo.Collection}.
		*
		* @param {(enyo.Model|enyo.Collection)} model The [model]{@link enyo.Model} or
		*	[collection]{@link enyo.Collection} to use to derive the `url`.
		* @param {Object} [opts] - The options hash with possible `url` property.
		* @returns {String} The normalized `url` [string]{@glossary String}.
		* @method
		* @public
		*/
		buildUrl: function (model, opts) {
			var url = (opts && opts.url) || (model.getUrl? model.getUrl(): model.url);
			
			// ensure there is a protocol defined
			if (!(/^(.*):\/\//.test(url))) {
				
				// it is assumed that if the url already included the protocol that it is
				// a complete url and not to be modified
				
				// however we need to determine relativity of the current domain or use a
				// specified root instead
				
				// if the url did not include the protocol but begins with a / we assume
				// it is intended to be relative to the origin of the domain
				if (url[0] == '/') url = urlDomain() + url;
				
				// if it doesn't then we check to see if the root was provided and we would
				// use that instead of trying to determine it ourselves
				else url = (model.urlRoot || this.urlRoot || urlRoot()) + '/' + url;
			}
			return normalize(url);
		},
		
		/**
		* @private
		*/
		go: function (opts) {
			var Ctor = this.requestKind
				, defaults = this.defaultOptions
				, xhr, params, options;
				
			if (opts.params) {
				params = defaults.params? enyo.mixin({}, [defaults.params, opts.params]): opts.params;
			} else if (defaults.params) params = defaults.params;
			
			options = enyo.only(this.allowed, enyo.mixin({}, [defaults, opts]), true);
			xhr = new Ctor(options);
			xhr.response(function (xhr, res) {
				// ensure that the ordering of the parameters is as expected
				if (opts.success) opts.success(res, xhr);
			});
			xhr.error(function (xhr, res) {
				// ensure that the ordering of the parameters is as expected
				if (opts && opts.error) opts.error(res, xhr);
			});
			xhr.go(params);
		},
		
		/**
		* This action should be used when querying a backend (or searching). How it is interpreted
		* and used is highly dependent on the backend implementation. By default, this method simply
		* creates a `POST` request with the serialized `attributes` of the `opts` parameter.
		* Re-implement this method to suit your specific needs.
		*
		* @param {(enyo.Model|enyo.Collection)} model The [model]{@link enyo.Model} or
		*	[collection]{@link enyo.Collection} from which to build the `url`.
		* @param {Object} opts - The options [hash]{@glossary Object} passed to
		*	[buildUrl()]{@link enyo.XHRSource#buildUrl} and possessing `method` and `attributes`
		*	properties.
		* @public
		*/
		find: function (model, opts) {
			opts.url = this.buildUrl(model, opts);
			opts.method = opts.method || 'POST';
			opts.postBody = opts.attributes;
			this.go(opts);
		},
		
		/**
			@public
		*/
		importProps: enyo.inherit(function (sup) {
			return function (props) {
				if (props.defaultOptions) XHRSource.concat(this, props);
				sup.call(this, props);
			};
		})
	});
	
	/**
	* @name enyo.XHRSource.concat
	* @static
	* @private
	*/
	XHRSource.concat = function (ctor, props) {
		if (props.defaultOptions) {
			var proto = ctor.prototype || ctor;
			proto.defaultOptions = enyo.mixin({}, [proto.defaultOptions, props.defaultOptions]);
			delete props.defaultOptions;
		}
	};
	
	/**
	* @private
	*/
	function urlDomain () {
		// @TODO: Come back to this as this is not always what we want...
		return location.origin;
	}
	
	/**
	* @private
	*/
	function urlRoot () {
		var url = urlDomain()
			, path = location.pathname.split('/')
			, last = path[path.length-1];
		
		// we need to strip off any trailing filename that may be present in the pathname
		if (last) if (/\.[a-zA-Z0-9]+$/.test(last)) path = path.slice(0, -1);
		// if there were parts of a valid path we will append those to the domain otherwise
		// it will simply return the domain
		return (url += (path.length? '/' + path.join('/'): ''));
	}
	
	/**
	* @private
	*/
	function normalize (url) {
		return url.replace(/([^:]\/)(\/+)/g, '$1');
	}
	
})(enyo, this);