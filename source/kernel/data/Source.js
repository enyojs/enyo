(function (enyo) {

	var normalize = function (url) {
		return url.replace(/([^:]\/)(\/+)/g, "$1");
	};

	enyo.kind({

		// ...........................
		// PUBLIC PROPERTIES

		name: "enyo.Source",
		kind: "enyo.Component",
		requestKind: "enyo.Ajax",
		domain: "",
		urlPostfix: "",
		port: null,
		secure: false,
		readOnly: false,
		defaultOptions: {
			cacheBust: false,
			contentType: "application/json"
		},
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
				var url = "http" + (this.secure? "s": "") + "://" + this.domain;
				if (this.port || location.port) {
					url += (":" + (this.port? this.port: location.port) + "/");
				}
				url += "/" + this.urlPostfix + model.get("query");
				options.url = normalize(url);
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
			var $success = this.bindSafely("onSuccess", options);
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
		filter: function (data) {
			return data;
		},
		onSuccess: function (options, request, response) {
			var result = this.filter(response);
			if (options.success) {
				options.success(result);
			}
		},
		onFail: function (which, options, request, error) {
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