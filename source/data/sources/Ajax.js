(function (enyo) {
	
	var kind = enyo.kind
		, checkConstructor = enyo.checkConstructor;
		
	var XHRSource = enyo.XHRSource
		, Ajax = checkConstructor(enyo.Ajax)
		, AjaxProperties = enyo.AjaxProperties;
	
	/**
		@public
		@class enyo.AjaxSource
	*/
	var AjaxSource = kind(
		/** @lends enyo.AjaxSource.prototype */ {
		name: "enyo.AjaxSource",
		kind: XHRSource,
		requestKind: Ajax,
		noDefer: true,
		
		/**
			@public
		*/
		allowed: Object.keys(AjaxProperties),
		
		/**
			@public
			@method
		*/
		fetch: function (model, opts) {
			opts.method = "GET";
			opts.url = this.buildUrl(model, opts);
			this.go(opts);
		},
		
		/**
			@public
			@method
		*/
		commit: function (model, opts) {
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
			opts.method = "DELETE";
			opts.url = this.buildUrl(model, opts);
			this.go(opts);
		}
	});
	
	// new AjaxSource();
	
})(enyo);