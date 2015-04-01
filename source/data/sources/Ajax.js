(function (enyo) {
	
	var kind = enyo.kind
		, checkConstructor = enyo.checkConstructor;
		
	var XHRSource = enyo.XHRSource
		, Ajax = checkConstructor(enyo.Ajax)
		, AjaxProperties = enyo.AjaxProperties;
	
	/**
	* An all-purpose [Ajax]{@glossary ajax} [source]{@link enyo.Source} designed to communicate
	* with REST-ful API backends.
	*
	* @class enyo.AjaxSource
	* @extends enyo.XHRSource
	* @public
	*/
	kind(
		/** @lends enyo.AjaxSource.prototype */ {
		
		/**
		* @private
		*/
		name: 'enyo.AjaxSource',
		
		/**
		* @private
		*/
		kind: XHRSource,
		
		/**
		* @see enyo.XHRSource.requestKind
		* @default enyo.Ajax
		* @public
		*/
		requestKind: Ajax,
		
		/**
		* @private
		*/
		noDefer: true,
		
		/**
		* An [array]{@glossary Array} of the keys that will be used for the options passed to
		* the [requestKind]{@link enyo.XHRSource#requestKind}.
		*
		* @see enyo.AjaxProperties
		* @type {String[]}
		* @readonly
		* @public
		*/
		allowed: Object.keys(AjaxProperties),
		
		/**
		* Implementation of {@link enyo.Source.fetch}.
		*
		* @see enyo.Source.fetch
		* @public
		*/
		fetch: function (model, opts) {
			opts.method = 'GET';
			opts.url = this.buildUrl(model, opts);
			this.go(opts);
		},
		
		/**
		* Implementation of {@link enyo.Source.commit}.
		*
		* @see enyo.Source.commit
		* @public
		*/
		commit: function (model, opts) {
			opts.method = model.isNew? 'POST': 'PUT';
			opts.url = this.buildUrl(model, opts);
			opts.postBody = opts.postBody || model.toJSON();
			this.go(opts);
		},
		
		/**
		* Implementation of {@link enyo.Source.destroy}.
		*
		* @see enyo.Source.destroy
		* @public
		*/
		destroy: function (model, opts) {
			opts.method = 'DELETE';
			opts.url = this.buildUrl(model, opts);
			this.go(opts);
		}
	});
	
})(enyo);