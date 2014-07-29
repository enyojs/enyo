(function (enyo, scope) {
	
	/**
	* Parameters and options for the [enyo.xhr.request()]{@link enyo.xhr.request} method.
	*
	* @typedef {Object} enyo.xhr.request~Options
	* @property {String} url - The URL to request (required).
	* @property {String} method - One of `'GET'`, `'POST'`, `'DELETE'`, `'UPDATE'`, or
	* custom methods; defaults to `'GET'`.
	* @property {Function} callback - Optional callback method to fire when complete.
	* @property {Object} body - Optional serializable body for `POST` requests.
	* @property {Object} headers - Optional header overrides; defaults to `null`.
	* @property {String} username - Optional username to provide for authentication purposes.
	* @property {String} password - Optional password to provide for authentication purposes.
	* @property {Object} xhrFields - Optional key/value pairs to apply directly to the request.
	* @property {String} mimeType - Optional specification for the `MIME-Type` of the request.
	* @property {Boolean} mozSystem - Optional boolean to create cross-domain XHR (Firefox OS only).
	* @property {Boolean} mozAnon - Optional boolean to create anonymous XHR that does not send
	*	cookies or authentication headers (Firefox OS only).
	* @private
	*/
	
	/**
	* An internally-used namespace for XHR-related methods and wrappers.
	*
	* @namespace enyo.xhr
	* @private
	*/
	enyo.xhr = /** @lends enyo.xhr */ {
		
		/**
		* Internally-used method to execute XHR requests.
		*
		* Note that we explicitly add a `'cache-control: no-cache'` header for iOS 6 for any
		* non-`GET` requests to work around a system bug causing non-cachable requests to be
		* cached. To disable this, use the `header` property to specify an object where
		* `cache-control` is set to `null`.
		*
		* @param {enyo.xhr.request~Options} params - The options and properties for this XHR request.
		* @returns {XMLHttpRequest} The XHR request object.
		* @private
		*/
		request: function (params) {
			var xhr = this.getXMLHttpRequest(params);
			var url = this.simplifyFileURL(enyo.path.rewrite(params.url));
			//
			var method = params.method || 'GET';
			var async = !params.sync;
			//
			if (params.username) {
				xhr.open(method, url, async, params.username, params.password);
			} else {
				xhr.open(method, url, async);
			}
			//
			enyo.mixin(xhr, params.xhrFields);
			// only setup handler when we have a callback
			if (params.callback) {
				this.makeReadyStateHandler(xhr, params.callback);
			}
			//
			params.headers = params.headers || {};
			// work around iOS 6.0 bug where non-GET requests are cached
			// see http://www.einternals.com/blog/web-development/ios6-0-caching-ajax-post-requests
			if (method !== 'GET' && enyo.platform.ios && enyo.platform.ios == 6) {
				if (params.headers['cache-control'] !== null) {
					params.headers['cache-control'] = params.headers['cache-control'] || 'no-cache';
				}
			}
			// user-set headers override any platform-default
			if (xhr.setRequestHeader) {
				for (var key in params.headers) {
					if (params.headers[key]) {
						xhr.setRequestHeader(key, params.headers[key]);
					}
				}
			}
			//
			if((typeof xhr.overrideMimeType == 'function') && params.mimeType) {
				xhr.overrideMimeType(params.mimeType);
			}
			//
			xhr.send(params.body || null);
			if (!async && params.callback) {
				xhr.onreadystatechange(xhr);
			}
			return xhr;
		},
		
		/**
		* Removes any callbacks that might be set from Enyo code for an existing XHR
		* and stops the XHR from completing (if possible).
		*
		* @param {XMLHttpRequest} The - request to cancel.
		* @private
		*/
		cancel: function (xhr) {
			if (xhr.onload) {
				xhr.onload = null;
			}
			if (xhr.onreadystatechange) {
				xhr.onreadystatechange = null;
			}
			if (xhr.abort) {
				xhr.abort();
			}
		},
		
		/**
		* @private
		*/
		makeReadyStateHandler: function (inXhr, inCallback) {
			if (window.XDomainRequest && inXhr instanceof window.XDomainRequest) {
				inXhr.onload = function() {
					var data;
					if (inXhr.responseType === 'arraybuffer') {
						data = inXhr.response;
					} else if (typeof inXhr.responseText === 'string') {
						data = inXhr.responseText;
					}
					inCallback.apply(null, [data, inXhr]);
					inXhr = null;
				};
			} else {
				inXhr.onreadystatechange = function() {
					if (inXhr && inXhr.readyState == 4) {
						var data;
						if (inXhr.responseType === 'arraybuffer') {
							data = inXhr.response;
						} else if (typeof inXhr.responseText === 'string') {
							data = inXhr.responseText;
						}
						inCallback.apply(null, [data, inXhr]);
						inXhr = null;
					}
				};
			}
		},
		
		/**
		* @private
		*/
		inOrigin: function (url) {
			var a = document.createElement('a'), result = false;
			a.href = url;
			// protocol is ':' for relative URLs
			if (a.protocol === ':' ||
					(a.protocol === window.location.protocol &&
						a.hostname === window.location.hostname &&
						a.port === (window.location.port ||
							(window.location.protocol === 'https:' ? '443' : '80')))) {
				result = true;
			}
			return result;
		},
		
		/**
		* @private
		*/
		simplifyFileURL: function (url) {
			var a = document.createElement('a');
			a.href = url;
			// protocol is ':' for relative URLs
			if (a.protocol === 'file:' ||
				a.protocol === ':' && window.location.protocol === 'file:') {
				// leave off search and hash parts of the URL
				// and work around a bug in webOS 3 where the app's host has a domain string
				// in it that isn't resolved as a path
				var host = (enyo.platform.webos < 4) ? '' : a.host;
				return a.protocol + '//' + host + a.pathname;
			} else if (a.protocol === ':' && window.location.protocol === 'x-wmapp0:') {
				// explicitly return absolute URL for Windows Phone 8, as an absolute path is required for local files
				return window.location.protocol + '//' + window.location.pathname.split('/')[0] + '/' + a.host + a.pathname;
			} else {
				return url;
			}
		},
		
		/**
		* @private
		*/
		getXMLHttpRequest: function (params) {
			try {
				// only use XDomainRequest when it exists, no extra headers were set, and the
				// target URL maps to a domain other than the document origin.
				if (enyo.platform.ie < 10 && window.XDomainRequest && !params.headers &&
					!this.inOrigin(params.url) && !/^file:\/\//.test(window.location.href)) {
					return new window.XDomainRequest();
				}
			} catch(e) {}
			try {

				if (enyo.platform.firefoxOS) {
					var shouldCreateNonStandardXHR = false; // flag to decide if we're creating the xhr or not
					var xhrOptions = {};

					// mozSystem allows you to do cross-origin requests on Firefox OS
					// As seen in:
					//   https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#Non-standard_properties
					if (params.mozSystem) {
						xhrOptions.mozSystem = true;
						shouldCreateNonStandardXHR = true;
					}

					// mozAnon allows you to send a request without cookies or authentication headers
					// As seen in:
					//   https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#Non-standard_properties
					if (params.mozAnon) {
						xhrOptions.mozAnon = true;
						shouldCreateNonStandardXHR = true;
					}

					if (shouldCreateNonStandardXHR) {
						return new XMLHttpRequest(xhrOptions);
					}
				}

				return new XMLHttpRequest();
			} catch(e) {}
			return null;
		}
	};

})(enyo, this);