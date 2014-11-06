(function (enyo, scope) {
	
	/**
	* Fires when a response is received.
	*
	* @event enyo.WebService#onResponse
	* @type {Object}
	* @property {enyo.Async} ajax - The {@link enyo.Async} instance associated with the request.
	* @property {*} data - Any response data associated with the request.
	* @public
	*/
	
	/**
	* Fires when an error is received.
	*
	* @event enyo.WebService#onError
	* @type {Object}
	* @property {enyo.Async} ajax - The {@link enyo.Async} instance associated with the request.
	* @property {*} data - Any response data associated with the request.
	* @public
	*/
	
	/**
	* Fires when the request progresses. This event is the raw
	* [ProgressEvent]{@glossary ProgressEvent}.
	*
	* @see {@glossary ProgressEvent}
	* @event enyo.WebService#onProgress
	* @type {Object}
	* @property {Boolean} lengthComputable - The read-only flag indicating whether the progress
	*	is computable.
	* @property {Number} loaded - The read-only value of the downloaded resources.
	* @property {Number} total - The read-only value used to indicate how much of a resource
	* is left to be acquired.
	* @public
	*/
	
	/**
	* An internally-used class.
	*
	* @private
	*/
	enyo.kind({
		name: 'enyo._AjaxComponent',
		kind: 'enyo.Component',
		published: enyo.AjaxProperties
	});

	/**
	* A [component]{@link enyo.Component} that performs [XHR]{@glossary XMLHttpRequest}
	* requests. Internally, it relies on the [Async]{@link enyo.Async} subkinds
	* ({@link enyo.Ajax} and {@link enyo.JsonpRequest}) to manage transactions.
	*
	* By default, {@link enyo.WebService} uses `enyo.Ajax` and publishes all of its
	* properties via the {@link enyo.AjaxProperties} namespace.
	*
	* To use `enyo.JsonpRequest` instead of `enyo.Ajax`, set
	* [jsonp]{@link enyo.WebService#jsonp} to `true` (defaults to `false`).
	*
	* For more information, see the documentation on [Consuming Web
	* Services]{@linkplain $dev-guide/building-apps/managing-data/consuming-web-services.html}
	* in the Enyo Developer Guide.
	*
	* @class enyo.WebService
	* @extends enyo.Component
	* @public
	*/
	enyo.kind(
		/** @lends enyo.WebService.prototype */ {
		
		/**
		* @private
		*/
		name: 'enyo.WebService',
		
		/**
		* @private
		*/
		kind: 'enyo._AjaxComponent',
		
		/**
		* @private
		*/
		published: {
			
			/**
			* Indicates whether or not to use the [JSONP]{@glossary JSONP} protocol (and
			* {@link enyo.JsonpRequest} instead of {@link enyo.Ajax}).
			*
			* @memberof enyo.WebService.prototype
			* @type {Boolean}
			* @default false
			* @public
			*/
			jsonp: false,
			
			/**
			* When using [JSONP]{@glossary JSONP}, this is the name of the callback parameter.
			* Note that this not the name of a callback function, but only the name of the callback
			* parameter. Enyo will create an internal callback function as necessary.
			*
			* @see enyo.WebService.jsonp
			* @memberof enyo.WebService.prototype
			* @type {String}
			* @default 'callback'
			* @public
			*/
			callbackName: 'callback',
			
			/**
			* When using [JSONP]{@glossary JSONP}, the optional character set to use to
			* interpret the return data.
			*
			* @see enyo.WebService.jsonp
			* @memberof enyo.WebService.prototype
			* @type {String}
			* @default null
			* @public
			*/
			charset: null,
			
			/**
			* If set to a non-zero value, the number of milliseconds to wait after the
			* [send()]{@link enyo.WebService#send} call before failing with a timeout
			* error.
			*
			* @memberof enyo.WebService.prototype
			* @type {Number}
			* @default 0
			* @public
			*/
			timeout: 0
		},
		
		/**
		* @private
		*/
		events: {
			onResponse: '',
			onError: '',
			onProgress: ''
		},
		
		/**
		* Sends an XHR request with the given parameters, returning the associated
		* {@link enyo.Async} instance.
		*
		* @param {Object} params - The parameters to pass to the request.
		* @param {Object} [props] - The optional properties to override the
		*	{@link enyo.AjaxProperties} of the request.
		* @returns {enyo.Async} The associated {@link enyo.Async} instance.
		* @public
		*/
		send: function (params, props) {
			return this.jsonp ? this.sendJsonp(params, props) : this.sendAjax(params, props);
		},
		
		/**
		* @private
		*/
		sendJsonp: function (params, props) {
			var jsonp = new enyo.JsonpRequest();
			for (var n in {'url':1, 'callbackName':1, 'charset':1, 'timeout':1}) {
				jsonp[n] = this[n];
			}
			enyo.mixin(jsonp, props);
			return this.sendAsync(jsonp, params);
		},
		
		/**
		* @private
		*/
		sendAjax: function (params, props) {
			var ajax = new enyo.Ajax(props);
			for (var n in enyo.AjaxProperties) {
				ajax[n] = this[n];
			}
			ajax.timeout = this.timeout;
			enyo.mixin(ajax, props);
			return this.sendAsync(ajax, params);
		},
		
		/**
		* @private
		*/
		sendAsync: function (ajax, params) {
			return ajax.go(params).response(this, 'response').error(this, 'error').progress(this, 'progress');
		},
		
		/**
		* @private
		*/
		response: function (sender, data) {
			this.doResponse({ajax: sender, data: data});
		},
		
		/**
		* @private
		*/
		error: function (sender, data) {
			this.doError({ajax: sender, data: data});
		},
		
		/**
		* @private
		*/
		progress: function (sender, event) {
			this.doProgress(event);
		}
	});

})(enyo, this);