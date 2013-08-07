(function (enyo) {

	/**
		_enyo.Source_ is a pseudo-abstract API for communcating with a backend,
		which may be either local or remote. An [enyo.Store](#enyo.Store) requires a
		source to function properly. An _enyo.Source_ may easily be overloaded to
		work with specific backend implementations and data formats.

		The built-in implementation is designed to work with a remote REST API
		relying on GET, POST, PUT and DELETE to communicate with the (remote)
		source.	For _fetch_ requests, it will use GET. See
		[enyo.Collection](#enyo.Collection) and [enyo.Model](#enyo.Model) for
		details.
	*/

	var normalize = function (url) {
		return url.replace(/([^:]\/)(\/+)/g, "$1");
	};

	var http = /^http/;

	enyo.kind({

		// ...........................
		// PUBLIC PROPERTIES

		name: "enyo.Source",
		kind: "enyo.Component",

		//*@public
		/**
			The type of object to use for requests. As long as the kind has the
			same API as [enyo.Async](#enyo.Async), it should be possible to use it
			with _enyo.Source_.
		*/
		requestKind: "enyo.Ajax",

		//*@public
		/**
			The root domain for all requests. The _"http"_ prefix is not required, but
			may be included. For secure (_https_) connections, see the _secure_
			property.
		*/
		domain: "",

		//*@public
		/**
			An optional string to be appended after the url is constructed.
		*/
		urlPostfix: "",

		//*@public
		/**
			The port to use when constructing the url. Only specify a value if the
			necessary port is different from the current domain port (it will
			automatically use _document.location.port_ unless the _ignorePort_ option
			is set to true).
		*/
		port: null,

		//*@public
		/**
			If the current domain for the client is running on a port other than 80
			(e.g., http://localhost:8080), set this to true to construct requests
			without the port number.
		*/
		ignorePort: false,

		//*@public
		/**
			Set this to true if a secure (_https_) url is required.
		*/
		secure: false,

		//*@public
		/**
			If the (remote) backend is read-only, set this to true to disallow any
			calls to POST, PUT or DELETE.
		*/
		readOnly: false,

		//*@public
		/**
			A bindable property that indicates whether an asynchronous operation is
			taking place.
		*/
		busy: false,

		//*@public
		/**
			The default options that are passed to the request object. Precedence is
			given to models or collections that provide their own options that
			override any default options.

			Defaults to _cacheBust: false_ and _contentType: "application/json"_.
		*/
		defaultOptions: {
			cacheBust: false,
			contentType: "application/json"
		},

		//*@public
		/**
			The default headers to be used in requests if they differ from those
			in [enyo.AjaxProperties](#enyo/source/ajax/AjaxProperties.js).
		*/
		defaultHeaders: null,

		// ...........................
		// PROTECTED PROPERTIES

		__noApplyMixinDestroy: true,

		// ...........................
		// COMPUTED PROPERTIES

		// ...........................
		// PUBLIC METHODS
		buildUrl: function (model, options) {
			if (!options.url) {
				// initially we grab the model's query string
				var $m = model.get("query");
				// and create the url string we will build if we need to
				var $u = "";
				if (http.test($m)) {
					// the assumption here is if the root is provided by the url of the model
					// we default to using that
					$m += "/";
					options.url = normalize($m);
					return;
				} else if (!http.test(this.domain)) {
					$u = "http" + (this.secure? "s": "") + "://";
				}
				// now we add our root
				$u += this.domain;
				// ensure that our url from the model has the slash that will be normalized out
				// if it was already present
				$m = "/" + $m;
				// determine if we need to include the given port (if any) from the current
				// location
				if (!this.ignorePort && (this.port || location.port)) {
					$u += (":" + (this.port || location.port) + "/");
				}
				// include the trailing slash prior to any query being appended and any post
				// fix if it exists
				$u += "/" + this.urlPostfix + $m;
				// now we normalize the whole thing to removing double slashes
				// and we're done
				options.url = normalize($u);
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
			if (this.readOnly) {
				if (options && options.error) {
					options.error({});
				}
				return;
			}
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
			if (this.readOnly) {
				if (options && options.success) {
					options.success({});
				}
				return;
			}
			this.buildRequest(model, options);
			options.method = "DELETE";
			this.exec("destroy", options);
		},

		//*@public
		/**
			Overload this method for specific needs with respect to requesting a
			filtered query from the remote (or local) source. Accepts a constructor
			for the kind of model being queried and any additional options.
		*/
		find: function (ctor, options) {
			// TODO:
		},
		exec: function (which, options) {
			var $options = enyo.only(this._ajaxOptions, options);
			var $success = this.bindSafely("onSuccess", which, options);
			var $fail = this.bindSafely("onFail", which, options);
			var $com = new this.requestKind($options);
			var $params = options.queryParams;
			if (options.method !== "GET" && this.readOnly) {
				return $fail();
			}
			$com.response($success);
			$com.error($fail);
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

		constructor: enyo.super(function (sup) {
			return function () {
				sup.apply(this, arguments);
				this.defaultOptions = this.defaultOptions || {};
				this.defaultHeaders = this.defaultHeaders || {};
				this.domain = this.domain || (function () {
					return location.pathname.length > 1
						? location.href.split("/").slice(0,-1).join("/")
						: location.origin;
				}());
			}
		}),
		constructed: function () {
			var $kind = this.requestKind || enyo.Ajax;
			this.requestKind = "string" === typeof $kind? enyo.getPath($kind): $kind;
			this._ajaxOptions = enyo.keys(enyo.AjaxProperties);
		},

		// ...........................
		// STATIC METHODS
		statics: {
			getDefaultSource: function() {
				if (!enyo.Source.defaultSource) {
					// make sure we create this on the finalized enyo.Source
					enyo.checkConstructor(enyo.Source);
					// create our singleton instance
					enyo.singleton({
						name: "enyo.Source.defaultSource",
						kind: "enyo.Source",
						fetch: function (model, options) {
							if (options && options.error) {
								var fn = options.error;
								options.error = null;
								fn(options);
							}
						},
						commit: function (model, options) {
							if (options && options.error) {
								var fn = options.error;
								options.error = null;
								fn(options);
							}
						},
						destroy: function (model, options) {
							if (options && options.success) {
								var fn = options.success;
								options.success = null;
								fn(options);
							}
						}
					});
				}
				return enyo.Source.defaultSource;
			}
		}

		// ...........................
		// PROTECTED METHODS

		// ...........................
		// OBSERVERS

	});

})(enyo);