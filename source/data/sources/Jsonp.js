(function (enyo) {
	
	var kind = enyo.kind
		, checkConstructor = enyo.checkConstructor;
	
	var XHRSource = enyo.XHRSource
		, JsonpRequest = checkConstructor(enyo.JsonpRequest);
	
	/**
		@public
		@class enyo.JsonpSource
	*/
	var JsonpSource = kind(
		/** @lends enyo.JsonpSource.prototype */ {
		name: "enyo.JsonpSource",
		kind: XHRSource,
		requestKind: JsonpRequest,
		noDefer: true,
		
		/**
			@public
		*/
		allowed: Object.keys(JsonpRequest.prototype.published),
		
		/**
			@public
			@method
		*/
		fetch: function (model, opts) {
			opts.cacheBust = false;
			opts.method = "GET";
			opts.url = this.buildUrl(model, opts);
			this.go(opts);
		},
		
		/**
			@public
			@method
		*/
		commit: function (model, opts) {
			opts.cacheBust = false;
			opts.method = model.isNew? "POST": "PUT";
			opts.url = this.buildUrl(model, opts);
			opts.postBody = opts.postBody || model.toJSON();
			this.go(opts);
		},
		
		/**
			@public
			@method
		*/
		destroy: function (model, opts) {
			opts.cacheBust = false;
			opts.method = "DELETE";
			opts.url = this.buildUrl(model, opts);
			this.go(opts);
		}
	});
	
	// new JsonpSource();
	
})(enyo);