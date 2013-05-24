(function (enyo) {



	enyo.kind({

		// ...........................
		// PUBLIC PROPERTIES

		name: "enyo.Source",
		kind: "enyo.Component",
		requestKind: "enyo.Ajax",
		domain: "",
		secure: false,
		readOnly: false,
		defaultOptions: null,
		defaultHeaders: null,

		// ...........................
		// PROTECTED PROPERTIES
		
		// ...........................
		// COMPUTED PROPERTIES

		// ...........................
		// PUBLIC METHODS
		buildUrl: function (model, options) {
			var url = "http" + (this.secure? "s": "") + "://" + this.domain + "/";
			url += model.get("query");
			options.url = url;
		},
		buildHeaders: function (model, options) {
			options.headers = enyo.mixin(model.get("headers"), this.defaultHeaders, true);
		},
		buildRequest: function (model, options) {
			this.buildUrl(model, options);
			this.buildHeaders(model, options);
			enyo.mixin(options, this.defaultOptions, true);
		},
		commit: function (model, options) {
			this.buildRequest(model, options);
			switch (model.status) {
			case "NEW":
				options.method = "POST";
				break;
			case "CLEAN":
				options.method = "PUT";
				break;
			}
		},
		fetch: function (model, options) {
			this.buildRequest(model, options);
			options.method = "GET";
			this.exec(options);
		},
		destroy: function (model, options) {
			this.buildRequest(model, options);
			options.method = "DELETE";
			this.exec(options);
		},
		exec: function (options) {
			var $req = this.requestKind;
			var $success = this.bindSafely("onSuccess", options);
			var $fail = this.bindSafely("onFail", options);
			var $com = new $req(options);
			if (options.method !== "GET" && this.readOnly) {
				return $fail();
			}
			this.log(options);
			//$com.response($success);
			//$com.error($fail);
			//$com.go();
		},
		onSuccess: function () {
			this.log(arguments);
		},
		onFail: function () {
			this.log(arguments);
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
		}
		
		// ...........................
		// PROTECTED METHODS

		// ...........................
		// OBSERVERS

	});


})(enyo);