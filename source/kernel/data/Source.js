(function (enyo) {
	
	/**
		The _enyo.Source_ kind is an pseudo-abstract API for communcating
		with a backend (could be local or remote). _enyo.Store_ requires a
		_source_ to function properly. An _enyo.Source_ can easily be overloaded
		to work with specific backend implementations and data formats.
	
		The build-in implementation is designed to work with a remote REST API
		relying on GET, POST, PUT and DELETE to communicate with (remote) source.
		For _fetch_ requests it will use GET. See _enyo.Collection_ and _enyo.Model_
		for specifics.
	*/

	var normalize = function (url) {
		return url.replace(/([^:]\/)(\/+)/g, "$1");
	};

	enyo.kind({

		// ...........................
		// PUBLIC PROPERTIES

		name: "enyo.Source",
		kind: "enyo.Component",
		
		//*@public
		/**
			The type of object to use for requests. As long as the kind has the
			same API as _enyo.Async_ it should be possible to use it with _enyo.Source_.
		*/
		requestKind: "enyo.Ajax",
		
		//*@public
		/**
			The root domain for all requests. Does not need the _http_ but may
			include it. For secure (_https_) see the _secure_ property.
		*/
		domain: "",
		
		//*@public
		/**
			An optional string to be appended after the _url_ is constructed.
		*/
		urlPostfix: "",
		
		//*@public
		/**
			The port to use when constructing the _url_. Only specify if the necessary
			port is different than the current domain port (e.g. it will automatically use
			document.location.port unless the _ignorePort_ option is set to _true_).
		*/
		port: null,
		
		//*@public
		/**
			If the current domain for the client is running on a _port_ different than
			80 (e.g. http://localhost:8080) this will construct requests without the
			port.
		*/
		ignorePort: false,
		
		//*@public
		/**
			If a secure url is necessary (_https_) set this to _true_.
		*/
		secure: false,
		
		//*@public
		/**
			If the (remote) backend is read-only set this to _true_ to dissallow any
			calls to POST, PUT or DELETE.
		*/
		readOnly: false,
		
		//*@public
		/**
			A bindable property to know when an asynchronous operation is taking place.
		*/
		busy: false,
		
		//*@public
		/**
			The default options that are passed to the request object. Presedence is given
			to _models_ or _collections_ that provide their own options that override any
			default options.
		
			Defaults with cacheBust true and contentType application/json.
		*/
		defaultOptions: {
			cacheBust: false,
			contentType: "application/json"
		},
		
		//*@public
		/**
			The default headers to be used in requests if they differ from those
			in _enyo.AjaxProperties_.
		*/
		defaultHeaders: null,

		// ...........................
		// PROTECTED PROPERTIES
		
		_noApplyMixinDestroy: true,
		
		// ...........................
		// COMPUTED PROPERTIES

		// ...........................
		// PUBLIC METHODS
		buildUrl: function (model, options) {
			if (!options.url) {
				var url = !~this.domain.indexOf("http")? "http" + (this.secure? "s": "") + "://" + this.domain: this.domain;
				if (!this.ignorePort && (this.port || location.port)) {
					url += (":" + (this.port? this.port: location.port) + "/");
				}
				url += "/" + this.urlPostfix + model.get("query");
				options.url = normalize(url);
			} else {
				options.urlProvided = true;
			}
		},
		buildHeaders: function (model, options) {
			options.headers = enyo.mixin(model.get("headers"), this.defaultHeaders, true);
		},
		buildQueryParams: function (model, options) {
			// add property to options called queryParams as
			// object literal to be appended to the query string
			options.queryParams = options.queryParams || {};
			model.buildQueryParams(model, options);
		},
		buildRequest: function (model, options) {
			this.buildUrl(model, options);
			this.buildHeaders(model, options);
			this.buildQueryParams(model, options);
			enyo.mixin(options, this.defaultOptions, true);
		},
		commit: function (model, options) {
			this.buildRequest(model, options);
			switch (model.isNew) {
			case true:
				options.method = "POST";
				break;
			case false:
				options.method = "PUT";
				break;
			}
			this.exec("commit", options);
		},
		fetch: function (model, options) {
			if (arguments.length > 1) {
				this.buildRequest(model, options);
				options.method = "GET";
			} else {
				options = model;
			}
			this.set("busy", true);
			this.exec("fetch", options);
		},
		destroy: function (model, options) {
			this.buildRequest(model, options);
			options.method = "DELETE";
			this.exec("destroy", options);
		},
		exec: function (which, options) {
			var $req = this.requestKind;
			var $options = enyo.only(this._ajaxOptions, options);
			var $success = this.bindSafely("onSuccess", which, options);
			var $fail = this.bindSafely("onFail", which, options);
			var $com = new $req($options);
			var $params = options.queryParams;
			if (options.method !== "GET" && this.readOnly) {
				return $fail();
			}
			$com.response($success);
			$com.error($fail);
			console.log("Requesting: ", options.url, $params);
			$com.go($params);
		},
		filterData: function (data) {
			return data;
		},
		onSuccess: function (which, options, request, response) {
			if ("fetch" === which) {
				this.set("busy", false);
			}
			var result = this.filterData(response), $fn;
			
			if (($fn = this["did" + enyo.cap(which)])) {
				if (enyo.isFunction($fn)) {
					if (!$fn.call(this, options, result)) {
						return;
					}
				}
			}
			
			if (options.success) {
				options.success(result);
			}
		},
		onFail: function (which, options, request, error) {
			if ("fetch" === which) {
				this.set("busy", false);
			}
			if (options.error) {
				options.error(request, error);
			}
		},
		
		constructor: function () {
			this.inherited(arguments);
			this.defaultOptions = this.defaultOptions || {};
			this.defaultHeaders = this.defaultHeaders || {};
			this.domain = this.domain || document.domain;
		},
		constructed: function () {
			var $kind = this.requestKind || enyo.Ajax;
			this.requestKind = "string" === typeof $kind? enyo.getPath($kind): $kind;
			this._ajaxOptions = enyo.keys(enyo.AjaxProperties);
		}
		
		// ...........................
		// PROTECTED METHODS

		// ...........................
		// OBSERVERS

	});


})(enyo);